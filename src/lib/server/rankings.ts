import 'server-only';
import type { Transaction } from 'firebase-admin/firestore';
import type { MultiplayerRoomState } from '@/types/multiplayer';
import { adminDb } from './firebaseAdmin';
// Old client-written leaderboards are quarantined. These rankings contain only server-computed match wins.
const rankedGames = new Set(['tic-tac-toe', 'chor-sipahi', 'spin-cricket', 'pen-flip', 'word-builder', 'brain-pot']);
export async function publishRoomResult(tx: Transaction, room: MultiplayerRoomState) {
  if (room.status !== 'FINISHED' || !rankedGames.has(room.gameId)) return;
  const db = adminDb();
  const players = room.players.filter(p => !p.isBot);
  const profiles = await Promise.all(players.map(p => tx.get(db.collection('users').doc(p.id))));
  const refs = players.map(p => db.collection('verifiedLeaderboards').doc(`${p.id}_${room.gameId}`));
  const scores = await Promise.all(refs.map(ref => tx.get(ref)));
  players.forEach((player, i) => {
    const profile = profiles[i].data();
    if (!profile || profile.privacySettings?.isPublic === false || profile.privacySettings?.showStats === false) return;
    const wins = (scores[i].data()?.wins || 0) + (room.winnerPlayerId === player.id ? 1 : 0);
    tx.set(refs[i], { userId: player.id, username: profile.username, avatar: profile.avatar || '🎮', gameId: room.gameId, gameTitle: room.gameTitle, wins, score: wins * 100, xp: 0, country: '🌐 Global', updatedAt: new Date().toISOString() });
  });
}
