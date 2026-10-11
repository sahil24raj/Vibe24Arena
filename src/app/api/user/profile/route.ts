import { api, identity, rateLimit, readJson, ApiError } from '@/lib/server/api';
import { adminDb } from '@/lib/server/firebaseAdmin';
import { profileSchema, publicProfile, saveProfile } from '@/lib/server/profiles';
export async function PATCH(req: Request) {
  return api(async () => {
    const auth = await identity(req);
    await rateLimit(auth.uid, 'profile', 30);
    const updates = await readJson(req, profileSchema, 950_000);
    await saveProfile(auth, updates);
    return { success: true, updates };
  });
}
export async function GET(req: Request) {
  return api(async () => {
    const auth = await identity(req);
    await rateLimit(auth.uid, 'public-profile', 60);
    const username = new URL(req.url).searchParams.get('username')?.toLowerCase() || '';
    if (!/^[a-z0-9_]{3,20}$/.test(username)) throw new ApiError(400, 'Invalid username.');
    const docs = await adminDb().collection('users').where('usernameLower', '==', username).limit(1).get();
    const doc = docs.docs[0];
    return { profile: doc ? publicProfile(doc.data(), doc.id) : null };
  });
}
