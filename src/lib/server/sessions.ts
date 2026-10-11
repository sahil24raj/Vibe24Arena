import 'server-only';
import { randomBytes, randomInt, randomUUID, createHash } from 'node:crypto';
import { z } from 'zod';
import { api, ApiError, identity, rateLimit, readJson } from './api';
import { adminDb } from './firebaseAdmin';
import { GAMES_CATALOG } from '@/lib/gameCatalog';
import { GAME_RULES } from './gameRules';
import { encryptRoundToken, decryptRoundToken, getDoorCountForLevel, getBaseScoreForLevel, getBaseXpForLevel, getDoorMultiplier, getStreakMultiplier } from '@/lib/games/escapeDoorCrypto';
const sessionId = z.string().uuid();
const digest = (value: string) => createHash('sha256').update(value).digest('hex');
export const startSession = (req: Request) => api(async () => {
  const auth = await identity(req);
  await rateLimit(auth.uid, 'session-start', 20);
  const { gameId } = await readJson(req, z.object({ gameId: z.string().max(64) }));
  if (!GAMES_CATALOG.some(game => game.id === gameId)) throw new ApiError(400, 'Unknown game.');
  const id = randomUUID(), token = randomBytes(32).toString('hex'), now = Date.now(), seed = randomInt(1_000_000);
  await adminDb().collection('gameSessions').doc(id).create({ uid: auth.uid, gameId, startTime: now, seed, tokenHash: digest(token), finished: false, expiresAt: now + 7_200_000, level: 1, score: 0, streak: 0, gameOver: false, roundToken: null });
  return { success: true, sessionId: id, sessionToken: token, gameId, startTime: now, seed };
});
const finishSchema = z.object({ sessionId, sessionToken: z.string().regex(/^[a-f0-9]{64}$/), score: z.number().finite().nonnegative().max(1_000_000), durationMs: z.number().finite().nonnegative(), currentHighScore: z.number().nonnegative().optional() });
export const finishSession = (req: Request) => api(async () => {
  const auth = await identity(req);
  await rateLimit(auth.uid, 'session-finish', 30);
  const body = await readJson(req, finishSchema);
  const ref = adminDb().collection('gameSessions').doc(body.sessionId);
  return adminDb().runTransaction(async tx => {
    const data = (await tx.get(ref)).data();
    if (!data || data.uid !== auth.uid || data.tokenHash !== digest(body.sessionToken)) throw new ApiError(403, 'Invalid session.');
    if (data.finished || data.expiresAt <= Date.now()) throw new ApiError(409, 'Session is finished or expired.');
    const rule = GAME_RULES[data.gameId] || { maxScore: 100000, minDurationMs: 1000, maxPointsPerSecond: 200 };
    const elapsed = Date.now() - data.startTime;
    const score = data.gameId === 'escape-door' ? data.score : body.score;
    if (score > rule.maxScore || (score > 10 && elapsed < rule.minDurationMs) || (score > 50 && score / Math.max(1, elapsed / 1000) > rule.maxPointsPerSecond)) throw new ApiError(400, 'Invalid score or duration.');
    tx.update(ref, { finished: true, finishedAt: Date.now() });
    const validatedScore = Math.floor(score);
    // Practice rewards stay local: client-reported scores cannot mint cloud currency/rankings.
    return { success: true, validatedScore, isNewHighScore: validatedScore > (body.currentHighScore || 0), xpEarned: 50 + Math.min(200, Math.floor(validatedScore / 25)), coinsEarned: Math.max(15, Math.min(300, Math.floor(validatedScore / 10))), rank: 'Challenger', timestamp: new Date().toISOString() };
  });
});
export const round = (req: Request) => api(async () => {
  const auth = await identity(req);
  await rateLimit(auth.uid, 'escape-round', 60);
  const body = await readJson(req, z.object({ sessionId, level: z.number().int().min(1).max(1000) }));
  const ref = adminDb().collection('gameSessions').doc(body.sessionId);
  return adminDb().runTransaction(async tx => {
    const data = (await tx.get(ref)).data();
    if (!data || data.uid !== auth.uid || data.gameId !== 'escape-door') throw new ApiError(403, 'Invalid session.');
    if (data.finished || data.gameOver || data.expiresAt <= Date.now() || data.level !== body.level) throw new ApiError(409, 'Invalid round progression.');
    if (data.roundToken) return { success: true, level: data.level, doorCount: data.doorCount, roundToken: data.roundToken };
    const doorCount = getDoorCountForLevel(data.level);
    const token = encryptRoundToken({ sessionId: body.sessionId, level: data.level, doorCount, safeDoorIndex: randomInt(doorCount), timestamp: Date.now(), nonce: randomBytes(16).toString('hex') });
    tx.update(ref, { roundToken: token, doorCount });
    return { success: true, level: data.level, doorCount, roundToken: token };
  });
});
export const pick = (req: Request) => api(async () => {
  const auth = await identity(req);
  await rateLimit(auth.uid, 'escape-pick', 60);
  const body = await readJson(req, z.object({ sessionId, roundToken: z.string().max(4096), selectedDoorIndex: z.number().int().min(0).max(5) }));
  const token = decryptRoundToken(body.roundToken);
  if (!token || token.sessionId !== body.sessionId || body.selectedDoorIndex >= token.doorCount) throw new ApiError(403, 'Invalid round token.');
  const ref = adminDb().collection('gameSessions').doc(body.sessionId);
  return adminDb().runTransaction(async tx => {
    const data = (await tx.get(ref)).data();
    if (!data || data.uid !== auth.uid || data.gameId !== 'escape-door') throw new ApiError(403, 'Invalid session.');
    if (data.finished || data.gameOver || data.expiresAt <= Date.now() || data.roundToken !== body.roundToken || data.level !== token.level) throw new ApiError(409, 'Round already used or expired.');
    const isSafe = token.safeDoorIndex === body.selectedDoorIndex;
    const streak = isSafe ? data.streak + 1 : 0;
    const doorMultiplier = getDoorMultiplier(token.doorCount), streakMultiplier = getStreakMultiplier(streak);
    const scoreGained = isSafe ? Math.round(getBaseScoreForLevel(token.level) * doorMultiplier * streakMultiplier) : 0;
    const totalScore = data.score + scoreGained;
    tx.update(ref, { roundToken: null, score: totalScore, streak, level: data.level + (isSafe ? 1 : 0), gameOver: !isSafe });
    return { success: true, isSafe, safeDoorIndex: token.safeDoorIndex, selectedDoorIndex: body.selectedDoorIndex, scoreGained, totalScore, xpGained: isSafe ? getBaseXpForLevel(token.level) : 0, streak, doorMultiplier, streakMultiplier, isLevel10Complete: isSafe && token.level === 10, level: token.level, gameOver: !isSafe };
  });
});
