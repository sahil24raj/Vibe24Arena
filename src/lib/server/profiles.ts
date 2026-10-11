import 'server-only';
import { z } from 'zod';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminDb } from './firebaseAdmin';
import { ApiError } from './api';

const image = z.string().max(300_000).refine(v => v === '' || /^https:\/\//.test(v) || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v) || (v.length <= 32 && !/[<>:/]/.test(v)), 'Invalid avatar');
export const profileSchema = z.object({
  username: z.string().trim().regex(/^[A-Za-z0-9_]{3,20}$/).optional(),
  displayName: z.string().trim().max(40).optional(),
  bio: z.string().trim().max(200).optional(),
  avatar: image.optional(), customAvatar: image.optional(), photoURL: image.optional(),
  avatarType: z.enum(['google', 'upload', 'preset']).optional(),
  privacySettings: z.object({ isPublic: z.boolean(), showStats: z.boolean(), showGameHistory: z.boolean(), showAchievements: z.boolean() }).optional(),
});
export function publicProfile(data: { privacySettings?: { isPublic?: boolean; showStats?: boolean; showAchievements?: boolean }; [key: string]: unknown }, id: string) {
  if (data.privacySettings?.isPublic === false) return null;
  const result: Record<string, unknown> = { id, username: data.username, displayName: data.displayName || data.username, avatar: data.avatar || '🎮', avatarType: data.avatarType || 'preset', bio: data.bio || '', privacySettings: data.privacySettings };
  if (data.privacySettings?.showStats !== false) {
    for (const key of ['stats', 'xp', 'level', 'rank', 'streak']) if (data[key] !== undefined) result[key] = data[key];
  }
  if (data.privacySettings?.showAchievements !== false) result.badges = data.badges || [];
  return result;
}
export async function saveProfile(auth: DecodedIdToken, updates: z.infer<typeof profileSchema>) {
  const db = adminDb();
  const ref = db.collection('users').doc(auth.uid);
  await db.runTransaction(async tx => {
    const previous = (await tx.get(ref)).data();
    const username = updates.username || previous?.username || `Gamer_${auth.uid.slice(-10)}`;
    const lower = username.toLowerCase();
    const claim = db.collection('usernames').doc(lower);
    const owner = (await tx.get(claim)).data();
    const publicEntries = await tx.get(db.collection('verifiedLeaderboards').where('userId', '==', auth.uid));
    // Also protect usernames in profiles created before the registry existed.
    const legacy = await tx.get(db.collection('users').where('usernameLower', '==', lower).limit(2));
    if ((owner && owner.uid !== auth.uid) || legacy.docs.some(d => d.id !== auth.uid)) throw new ApiError(409, 'Username is already taken.');
    if (previous?.usernameLower && /^[a-z0-9_]{3,20}$/.test(previous.usernameLower) && previous.usernameLower !== lower) tx.delete(db.collection('usernames').doc(previous.usernameLower));
    tx.set(claim, { uid: auth.uid });
    const privacy = updates.privacySettings || previous?.privacySettings;
    publicEntries.docs.forEach(entry => {
      if (privacy?.isPublic === false || privacy?.showStats === false) tx.delete(entry.ref);
      else tx.update(entry.ref, { username, avatar: updates.avatar || previous?.avatar || '🎮' });
    });
    const baseline = previous ? {} : {
      xp: 0, level: 1, coins: 0, streak: 0, rank: 'Bronze II', badges: [], unlockedSkins: ['default'], equippedSkin: 'default',
      stats: { gamesPlayed: 0, totalWins: 0, totalLosses: 0, winRate: 0, totalScore: 0, bestScore: 0, highScores: {}, roastsWon: 0, sixesHit: 0, chaiServed: 0, penFlipsLanded: 0, eraserHits: 0 }, createdAt: new Date().toISOString(),
    };
    tx.set(ref, { ...baseline, ...updates, username, usernameLower: lower, id: auth.uid, uid: auth.uid, email: auth.email || null, isCloudSynced: true, updatedAt: new Date().toISOString() }, { merge: true });
  });
}
