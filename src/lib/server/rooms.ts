import 'server-only';
import { randomInt, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { adminDb } from './firebaseAdmin';
import { api, ApiError, identity, rateLimit, readJson } from './api';
import { getGameAdapter } from '@/lib/multiplayer/adapters';
import { GAMES_CATALOG } from '@/lib/gameCatalog';
import type { MultiplayerRoomState, RoomPlayer } from '@/types/multiplayer';
import { publishRoomResult } from './rankings';
import { advanceBot } from './bots';
import { roomView } from './roomView';

type DisplayProfile = { username?: string; displayName?: string; avatar?: string };
const settingsSchema = z.object({
  isPrivate: z.boolean().default(false), turnTimeLimitSec: z.number().int().min(10).max(180).default(45),
  roundsToWin: z.number().int().min(1).max(10).optional(), maxPlayers: z.number().int().min(2).max(4).optional(),
  botFillMode: z.enum(['none', 'manual', 'auto']).optional(), botDifficulty: z.enum(['easy', 'medium', 'hard']).optional(),
}).default({ isPrivate: false, turnTimeLimitSec: 45 });
const createSchema = z.object({ gameId: z.string().max(64), settings: settingsSchema });
const actionSchema = z.object({ actionType: z.string().min(1).max(40), actionData: z.record(z.string(), z.unknown()).default({}), expectedVersion: z.number().int().positive().optional() });
const bodySchema = z.object({ payload: actionSchema.optional(), actionType: z.string().max(40).optional(), actionData: z.record(z.string(), z.unknown()).optional(), expectedVersion: z.number().int().positive().optional(), targetPlayerId: z.string().max(128).optional(), difficulty: z.enum(['easy', 'medium', 'hard']).optional() });
function player(uid: string, user: DisplayProfile, host = false): RoomPlayer {
  return { id: uid, userId: uid, username: user.username || 'Gamer', displayName: user.displayName || user.username || 'Gamer', avatar: user.avatar || '🎮', role: host ? 'host' : 'player', isHost: host, isReady: true, connectionStatus: 'CONNECTED', score: 0, joinedAt: Date.now(), lastSeenAt: Date.now() };
}
const clean = <T>(data: T): T => JSON.parse(JSON.stringify(data));
export async function createRoom(req: Request) {
  return api(async () => {
    const auth = await identity(req);
    await rateLimit(auth.uid, 'create-room', 10);
    const body = await readJson(req, createSchema);
    const game = GAMES_CATALOG.find(g => g.id === body.gameId);
    if (!game) throw new ApiError(400, 'Unknown game.');
    const adapter = getGameAdapter(game.id, game.title);
    const maxPlayers = body.settings.maxPlayers || adapter.maxPlayers;
    if (maxPlayers < adapter.minPlayers || maxPlayers > adapter.maxPlayers) throw new ApiError(400, 'Invalid player count.');
    const code = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRTUVWXYZ2346789'[randomInt('ABCDEFGHJKLMNPQRTUVWXYZ2346789'.length)]).join('');
    const now = Date.now();
    const profile = (await adminDb().collection('users').doc(auth.uid).get()).data();
    const host = player(auth.uid, { username: profile?.username || `Gamer_${auth.uid.slice(-6)}`, avatar: profile?.avatar || '🎮' }, true);
    const room: MultiplayerRoomState = { roomId: randomUUID(), roomCode: code, gameId: game.id, gameTitle: game.title, hostId: auth.uid, hostUsername: host.username, players: [host], maxPlayers, minPlayers: adapter.minPlayers, status: 'WAITING', stateVersion: 1, currentTurnPlayerId: auth.uid, winnerPlayerId: null, winnerUsername: null, countdown: null, gameState: {}, settings: body.settings, createdAt: now, updatedAt: now, expiresAt: now + 7_200_000 };
    await adminDb().collection('rooms').doc(code).create(clean(room));
    return { success: true, data: roomView(room, auth.uid) };
  });
}
export async function roomRequest(req: Request, rawCode: string, operation: string) {
  return api(async () => {
    const auth = await identity(req);
    await rateLimit(auth.uid, 'rooms', 240);
    const code = rawCode.toUpperCase();
    if (!/^[A-Z2-9]{6}$/.test(code)) throw new ApiError(400, 'Invalid room code.');
    const body = operation === 'get' ? {} : await readJson(req, bodySchema);
    const ref = adminDb().collection('rooms').doc(code);
    const result = await adminDb().runTransaction(async tx => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new ApiError(404, 'Room not found.');
      const room = snap.data() as MultiplayerRoomState;
      if (room.expiresAt <= Date.now()) throw new ApiError(410, 'Room expired.');
      const member = room.players.find(p => p.id === auth.uid && !p.isBot);
      const wasPlaying = room.status === 'PLAYING';
      const lobby = room.status === 'WAITING' || room.status === 'READY';
      const host = room.hostId === auth.uid;
      const adapter = getGameAdapter(room.gameId, room.gameTitle);
      if (operation !== 'join' && !member) throw new ApiError(403, 'Join the room first.');
      if (operation === 'get') {
        if (advanceBot(room)) {
          if (room.status === 'FINISHED') await publishRoomResult(tx, room);
          tx.set(ref, clean(room));
        }
        return room;
      }
      if (operation === 'join') {
        if (!member) {
          if (!lobby || room.players.length >= room.maxPlayers) throw new ApiError(409, 'Room is not accepting players.');
          const profile = (await tx.get(adminDb().collection('users').doc(auth.uid))).data();
          room.players.push(player(auth.uid, { username: profile?.username || `Gamer_${auth.uid.slice(-6)}`, avatar: profile?.avatar || '🎮' }));
        }
      } else if (operation === 'heartbeat') {
        member!.lastSeenAt = Date.now(); member!.connectionStatus = 'CONNECTED';
      } else if (operation === 'leave' || operation === 'remove') {
        const target = operation === 'leave' ? auth.uid : body.targetPlayerId;
        if (operation === 'remove' && (!host || !lobby || !target)) throw new ApiError(403, 'Only the host can remove players in the lobby.');
        room.players = room.players.filter(p => p.id !== target);
        if (!room.players.some(p => !p.isBot)) { tx.delete(ref); return null; }
        if (target === room.hostId) {
          const nextHost = room.players.find(p => !p.isBot)!;
          room.hostId = nextHost.id; room.hostUsername = nextHost.username;
          room.players.forEach(p => { p.isHost = p.id === nextHost.id; p.role = p.isHost ? 'host' : 'player'; });
        }
        if (!lobby) room.status = 'CANCELLED';
      } else if (operation === 'start') {
        if (!host || !lobby) throw new ApiError(403, 'Only the host can start a waiting room.');
        // Auto-fill only with server-controlled bots.
        if (room.settings.botFillMode === 'auto') {
          while (room.players.length < room.minPlayers) room.players.push(makeBot(room.players.length, room.settings.botDifficulty));
        }
        if (room.players.length < room.minPlayers) throw new ApiError(409, 'Not enough players.');
        room.gameState = adapter.getInitialState(room.players, room.settings);
        room.gameState.startedAt = Date.now();
        room.gameState.questionStartedAt = Date.now();
        room.status = 'PLAYING'; room.currentTurnPlayerId = room.players[0].id;
      } else if (operation === 'bot') {
        if (!host || !lobby || room.players.length >= room.maxPlayers) throw new ApiError(403, 'Cannot add a bot.');
        room.players.push(makeBot(room.players.length, body.difficulty));
      } else if (operation === 'action') {
        if (room.status !== 'PLAYING') throw new ApiError(409, 'Game is not active.');
        const parsed = actionSchema.safeParse(body.payload || body);
        if (!parsed.success) throw new ApiError(400, 'Invalid action.');
        const payload = parsed.data;
        if (payload.expectedVersion !== undefined && payload.expectedVersion !== room.stateVersion) throw new ApiError(409, 'State changed. Please try again.');
        const action: Record<string, unknown> = { ...payload.actionData, type: payload.actionType };
        if (room.gameId === 'word-builder' && action.type === 'TIME_UP' && Date.now() < room.gameState.startedAt + room.settings.turnTimeLimitSec * 1000) throw new ApiError(400, 'Round has not ended.');
        if (room.gameId === 'word-builder' && action.type !== 'TIME_UP' && Date.now() >= room.gameState.startedAt + room.settings.turnTimeLimitSec * 1000) throw new ApiError(409, 'Round has ended.');
        if (room.gameId === 'spin-cricket') action.outcome = ['1', '2', '3', '4', '6', 'OUT', 'DOT'][randomInt(7)];
        if (room.gameId === 'brain-pot') action.timeRemainingSec = Math.max(0, 8 - (Date.now() - room.gameState.questionStartedAt) / 1000);
        const validation = adapter.validateAction(room.gameState, action, auth.uid, room.currentTurnPlayerId, room.players);
        if (!validation.valid) throw new ApiError(400, validation.error || 'Invalid move.');
        const applied = adapter.applyAction(room.gameState, action, auth.uid, room.players);
        if (applied.nextState.currentQuestionIndex !== room.gameState.currentQuestionIndex) applied.nextState.questionStartedAt = Date.now();
        room.gameState = applied.nextState; room.currentTurnPlayerId = applied.nextTurn;
        room.winnerPlayerId = applied.winnerId; room.winnerUsername = applied.winnerUsername || null;
        room.status = applied.isFinished ? 'FINISHED' : 'PLAYING';
      } else throw new ApiError(400, 'Unknown operation.');
      if (lobby && operation !== 'start') room.status = room.players.length >= room.minPlayers ? 'READY' : 'WAITING';
      room.stateVersion++; room.updatedAt = Date.now();
      if (wasPlaying && room.status === 'FINISHED') await publishRoomResult(tx, room);
      tx.set(ref, clean(room));
      return room;
    });
    return { success: true, data: result ? roomView(result, auth.uid) : null };
  });
}
function makeBot(index: number, difficulty = 'medium'): RoomPlayer {
  const bot = player(`bot_${randomUUID()}`, { username: `ArenaBot${index + 1}` });
  return { ...bot, isBot: true, botDifficulty: difficulty as 'easy' | 'medium' | 'hard' };
}
