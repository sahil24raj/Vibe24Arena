import assert from 'node:assert/strict';
import { before, after, test } from 'node:test';
import { getApps, deleteApp } from 'firebase-admin/app';
import { createRoom, roomRequest } from '../src/lib/server/rooms';
import { startSession, finishSession, round, pick } from '../src/lib/server/sessions';
import { PATCH, GET } from '../src/app/api/user/profile/route';
import { adminDb } from '../src/lib/server/firebaseAdmin';
import { decryptRoundToken } from '../src/lib/games/escapeDoorCrypto';
import { readJson } from '../src/lib/server/api';
import { z } from 'zod';

let alice: string, bob: string, outsider: string, aliceUid: string, bobUid: string;
const request = (token?: string, data?: unknown, url = 'http://localhost/api/test') => new Request(url, { method: data === undefined ? 'GET' : 'POST', headers: { ...(token ? { authorization: `Bearer ${token}` } : {}), 'content-type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data) });
async function user() {
  const res = await fetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }) });
  return res.json();
}
before(async () => {
  process.env.FIREBASE_PROJECT_ID = 'demo-security';
  process.env.GAME_SESSION_SECRET = 'synthetic-local-test-secret-at-least-32-characters';
  const a = await user(), b = await user(), c = await user();
  alice = a.idToken; aliceUid = a.localId; bob = b.idToken; bobUid = b.localId; outsider = c.idToken;
});
after(async () => { await Promise.all(getApps().map(app => deleteApp(app))); });
test('protected operations reject missing/forged authentication before mutation', async () => {
  for (const token of [undefined, 'forged']) {
    assert.equal((await createRoom(request(token, { gameId: 'tic-tac-toe' }))).status, 401);
    assert.equal((await PATCH(request(token, { uid: 'victim', displayName: 'Hacked' }))).status, 401);
    assert.equal((await startSession(request(token, { gameId: 'tic-tac-toe' }))).status, 401);
    for (const op of ['get', 'join', 'start', 'action', 'leave', 'heartbeat', 'bot', 'remove']) assert.equal((await roomRequest(request(token, {}), 'ABCDEF', op)).status, 401);
  }
});
test('room membership and actions use verified identity; racing moves cannot both succeed', async () => {
  const created = await createRoom(request(alice, { gameId: 'tic-tac-toe', user: { id: bobUid, uid: bobUid, username: 'Impersonated' } }));
  assert.equal(created.status, 200);
  const room = (await created.json()).data;
  assert.equal(room.hostId, aliceUid);
  assert.notEqual(room.hostUsername, 'Impersonated');
  assert.equal((await roomRequest(request(outsider), room.roomCode, 'get')).status, 403);
  assert.equal((await roomRequest(request(bob, { user: { id: aliceUid } }), room.roomCode, 'join')).status, 200);
  assert.equal((await roomRequest(request(bob, { hostPlayerId: aliceUid }), room.roomCode, 'start')).status, 403);
  const started = await roomRequest(request(alice, {}), room.roomCode, 'start');
  const version = (await started.json()).data.stateVersion;
  const actions = await Promise.all([0, 1].map(index => roomRequest(request(alice, { playerId: bobUid, actionType: 'PLACE_SYMBOL', actionData: { index, type: 'HACK' }, expectedVersion: version }), room.roomCode, 'action')));
  assert.deepEqual(actions.map(r => r.status).sort(), [200, 409]);
  assert.equal((await roomRequest(request(bob, {}), room.roomCode, 'start')).status, 403);
});
test('profile ignores victim UID and privileged fields, enforces privacy and username uniqueness', async () => {
  assert.equal((await PATCH(request(alice, { uid: bobUid, username: 'SecurityAlice', displayName: 'Alice', coins: 9999, privacySettings: { isPublic: true, showStats: false, showAchievements: false, showGameHistory: false } }))).status, 200);
  const stored = (await adminDb().collection('users').doc(aliceUid).get()).data()!;
  assert.equal(stored.coins, 0);
  assert.equal((await adminDb().collection('users').doc(bobUid).get()).exists, false);
  assert.equal((await PATCH(request(bob, { username: 'SecurityAlice' }))).status, 409);
  const profile = (await (await GET(request(alice, undefined, 'http://localhost/api/user/profile?username=SecurityAlice'))).json()).profile;
  for (const field of ['email', 'stats', 'xp', 'badges', 'coins']) assert.equal(field in profile, false);
  await PATCH(request(alice, { privacySettings: { isPublic: false, showStats: false, showAchievements: false, showGameHistory: false } }));
  assert.equal((await (await GET(request(alice, undefined, 'http://localhost/api/user/profile?username=SecurityAlice'))).json()).profile, null);
});
test('sessions bind the caller, consume finishes atomically, and ignore forged timing', async () => {
  const session = await (await startSession(request(alice, { gameId: 'tic-tac-toe', uid: bobUid }))).json();
  const body = { ...session, score: 500, durationMs: 999999999 };
  assert.equal((await finishSession(request(bob, body))).status, 403);
  assert.equal((await finishSession(request(alice, body))).status, 400);
  const finishes = await Promise.all([1, 2].map(() => finishSession(request(alice, { ...body, score: 0 }))));
  assert.deepEqual(finishes.map(r => r.status).sort(), [200, 409]);
});
test('escape rounds enforce sequence, owner, single pick and authoritative totals', async () => {
  const session = await (await startSession(request(alice, { gameId: 'escape-door' }))).json();
  const body = { sessionId: session.sessionId, level: 1 };
  assert.equal((await round(request(bob, body))).status, 403);
  assert.equal((await round(request(alice, { ...body, level: 10 }))).status, 409);
  const data = await (await round(request(alice, body))).json();
  assert.equal((await (await round(request(alice, body))).json()).roundToken, data.roundToken);
  const token = decryptRoundToken(data.roundToken)!;
  const pickBody = { sessionId: session.sessionId, roundToken: data.roundToken, selectedDoorIndex: token.safeDoorIndex, currentScore: 999999, currentStreak: 999999 };
  const attempts = await Promise.all([1, 2].map(() => pick(request(alice, pickBody))));
  assert.deepEqual(attempts.map(r => r.status).sort(), [200, 409]);
  const result = await attempts.find(r => r.status === 200)!.json();
  assert.equal(result.totalScore, 100); assert.equal(result.streak, 1);
});
test('JSON boundary rejects malformed and oversized streamed requests', async () => {
  await assert.rejects(readJson(new Request('http://localhost', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{' }), z.object({})), { status: 400 });
  await assert.rejects(readJson(request(alice, { huge: 'x'.repeat(100) }), z.object({}), 32), { status: 413 });
});
test('only server-controlled bots move and finished matches publish rankings once', async () => {
  await PATCH(request(alice, { privacySettings: { isPublic: true, showStats: true, showAchievements: true, showGameHistory: true } }));
  const room = (await (await createRoom(request(alice, { gameId: 'tic-tac-toe', settings: { roundsToWin: 1 } }))).json()).data;
  const code = room.roomCode;
  await roomRequest(request(alice, { difficulty: 'easy' }), code, 'bot');
  await roomRequest(request(alice, {}), code, 'start');
  await roomRequest(request(alice, { actionType: 'PLACE_SYMBOL', actionData: { index: 0 } }), code, 'action');
  const ref = adminDb().collection('rooms').doc(code);
  await ref.update({ updatedAt: Date.now() - 3000 });
  const botMove = (await (await roomRequest(request(alice), code, 'get')).json()).data;
  assert.equal(botMove.gameState.board.filter((cell: unknown) => cell !== null).length, 2);
  assert.equal(botMove.currentTurnPlayerId, aliceUid);
  // Seed a legal winning position to verify the terminal transaction and idempotency.
  await ref.update({ 'gameState.board': ['X', 'X', null, 'O', 'O', null, null, null, null], currentTurnPlayerId: aliceUid });
  assert.equal((await roomRequest(request(alice, { actionType: 'PLACE_SYMBOL', actionData: { index: 2 } }), code, 'action')).status, 200);
  const ranking = adminDb().collection('verifiedLeaderboards').doc(`${aliceUid}_tic-tac-toe`);
  assert.equal((await ranking.get()).data()?.wins, 1);
  await roomRequest(request(alice, {}), code, 'heartbeat');
  await roomRequest(request(alice), code, 'get');
  assert.equal((await ranking.get()).data()?.wins, 1);
  await PATCH(request(alice, { privacySettings: { isPublic: false, showStats: false, showAchievements: false, showGameHistory: false } }));
  assert.equal((await ranking.get()).exists, false);
});
test('word rounds conceal targets and end on server time even if the host withholds timeout', async () => {
  const room = (await (await createRoom(request(alice, { gameId: 'word-builder', settings: { botFillMode: 'auto', turnTimeLimitSec: 10 } }))).json()).data;
  const started = (await (await roomRequest(request(alice, {}), room.roomCode, 'start')).json()).data;
  assert.ok(started.gameState.targetWords.every((word: string) => word === ''));
  const ref = adminDb().collection('rooms').doc(room.roomCode);
  const full = (await ref.get()).data()!;
  await ref.update({ 'gameState.startedAt': Date.now() - 11000 });
  assert.equal((await roomRequest(request(alice, { actionType: 'SUBMIT_WORD', actionData: { word: full.gameState.targetWords[0] } }), room.roomCode, 'action')).status, 409);
  const expired = (await (await roomRequest(request(alice), room.roomCode, 'get')).json()).data;
  assert.equal(expired.status, 'FINISHED');
});
