import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ChorSipahiAdapter } from '../src/lib/multiplayer/adapters/ChorSipahiAdapter';
import { createGeneralDuelAdapter } from '../src/lib/multiplayer/adapters/GeneralDuelAdapter';
import { encryptRoundToken } from '../src/lib/games/escapeDoorCrypto';
import type { RoomPlayer } from '../src/types/multiplayer';

const players = ['a', 'b', 'c', 'd'].map((id, i) => ({ id, isHost: i === 0 })) as RoomPlayer[];
test('round encryption refuses a missing deployment secret', () => {
  delete process.env.GAME_SESSION_SECRET;
  assert.throws(() => encryptRoundToken({ sessionId: 'test', level: 1, doorCount: 2, safeDoorIndex: 0, timestamp: Date.now(), nonce: 'test' }));
});
test('a completed Chor Sipahi guess cannot award points again', () => {
  const state = ChorSipahiAdapter.getInitialState(players);
  state.phase = 'SIPAHI_GUESS';
  const action = { type: 'SUBMIT_SIPAHI_GUESS' as const, suspectId: state.chorPlayerId };
  const result = ChorSipahiAdapter.applyAction(state, action, state.sipahiPlayerId, players);
  assert.equal(ChorSipahiAdapter.validateAction(result.nextState, action, state.sipahiPlayerId, null, players).valid, false);
});
test('general duel rejects arbitrary actions and unlimited attempts', () => {
  const adapter = createGeneralDuelAdapter('test', 'test');
  const state = adapter.getInitialState(players);
  assert.equal(adapter.validateAction(state, { type: 'HACK', score: 1 } as never, 'a', null, players).valid, false);
  state.playerAttempts.a = state.maxAttempts;
  assert.equal(adapter.validateAction(state, { type: 'SUBMIT_SCORE', score: 1 }, 'a', null, players).valid, false);
});

import { roomView } from '../src/lib/server/roomView';
import type { MultiplayerRoomState } from '../src/types/multiplayer';
test('room responses conceal other players roles and answer keys without mutating server state', () => {
  const state = ChorSipahiAdapter.getInitialState(players);
  const room: MultiplayerRoomState = { roomId: 'test', roomCode: 'ABCDEF', gameId: 'chor-sipahi', gameTitle: 'Test', hostId: 'a', hostUsername: 'Alice', players, maxPlayers: 4, minPlayers: 4, status: 'PLAYING', stateVersion: 1, currentTurnPlayerId: 'a', winnerPlayerId: null, countdown: null, gameState: state, settings: { isPrivate: true, turnTimeLimitSec: 45 }, createdAt: 0, updatedAt: 0, expiresAt: Date.now() + 1000 };
  const view = roomView(room, 'a');
  assert.equal(view.gameState.chorPlayerId, '');
  assert.equal(view.gameState.mantriPlayerId, '');
  assert.deepEqual(Object.keys(view.gameState.roleAssignments).sort(), [...new Set(['a', state.rajaPlayerId])].sort());
  assert.equal(Object.keys(state.roleAssignments).length, 4);
  const brain = roomView({ ...room, gameId: 'brain-pot', gameState: { currentQuestion: { correctAnswer: 'secret' }, playerAnswers: { a: null, b: { answer: 'secret', isCorrect: true } } } }, 'a');
  assert.equal('correctAnswer' in brain.gameState.currentQuestion, false);
  assert.deepEqual(brain.gameState.playerAnswers.b, { answered: true });
});
