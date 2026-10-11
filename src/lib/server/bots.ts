import 'server-only';
import { randomInt } from 'node:crypto';
import type { MultiplayerRoomState } from '@/types/multiplayer';
import { getGameAdapter } from '@/lib/multiplayer/adapters';
export function advanceBot(room: MultiplayerRoomState): boolean {
  if (room.status !== 'PLAYING') return false;
  if (room.gameId === 'word-builder' && Date.now() >= room.gameState.startedAt + room.settings.turnTimeLimitSec * 1000) {
    const result = getGameAdapter(room.gameId).applyAction(room.gameState, { type: 'TIME_UP' }, room.hostId, room.players);
    room.gameState = result.nextState; room.status = 'FINISHED'; room.currentTurnPlayerId = null;
    room.winnerPlayerId = result.winnerId; room.winnerUsername = result.winnerUsername || null;
    room.updatedAt = Date.now(); room.stateVersion++;
    return true;
  }
  if (Date.now() < (room.gameState.botNextAt || room.updatedAt + 1500)) return false;
  const state = room.gameState;
  const bots = room.players.filter(p => p.isBot);
  let bot = bots.find(p => p.id === room.currentTurnPlayerId);
  let action: Record<string, unknown> | undefined;
  if (room.gameId === 'tic-tac-toe' && bot) {
    const cells = state.board.flatMap((value: unknown, index: number) => value === null ? [index] : []);
    if (cells.length) action = { type: 'PLACE_SYMBOL', index: cells[randomInt(cells.length)] };
  } else if (room.gameId === 'word-builder') {
    bot = bots.find(p => state.targetWords.some((word: string) => !state.foundWordsMap[p.id].includes(word)));
    if (bot) {
      const words = state.targetWords.filter((word: string) => !state.foundWordsMap[bot!.id].includes(word));
      action = { type: 'SUBMIT_WORD', word: words[randomInt(words.length)] };
    }
  } else if (room.gameId === 'brain-pot') {
    bot = bots.find(p => state.playerAnswers[p.id] === null);
    if (bot) action = { type: 'ANSWER_QUESTION', questionIndex: state.currentQuestionIndex, selectedOption: state.currentQuestion.options[randomInt(state.currentQuestion.options.length)], timeRemainingSec: Math.max(0, 8 - (Date.now() - state.questionStartedAt) / 1000) };
  } else if (room.gameId === 'chor-sipahi') {
    bot = bots.find(p => p.id === state.sipahiPlayerId);
    if (bot && state.phase === 'DISCUSSION') action = { type: 'START_GUESSING' };
    if (bot && state.phase === 'SIPAHI_GUESS') {
      const suspects = state.suspectPlayerIds.filter((id: string) => id !== bot!.id);
      action = { type: 'SUBMIT_SIPAHI_GUESS', suspectId: suspects[randomInt(suspects.length)] };
    }
  } else if (room.gameId === 'pen-flip' && bot) action = { type: 'SUBMIT_FLIP', power: randomInt(50, 95) };
  else if (room.gameId === 'spin-cricket' && bot) action = { type: 'SPIN_RESULT', outcome: ['1', '2', '3', '4', '6', 'OUT', 'DOT'][randomInt(7)] };
  if (!bot || !action) return false;
  const adapter = getGameAdapter(room.gameId, room.gameTitle);
  if (!adapter.validateAction(state, action, bot.id, room.currentTurnPlayerId, room.players).valid) return false;
  const result = adapter.applyAction(state, action, bot.id, room.players);
  if (result.nextState.currentQuestionIndex !== state.currentQuestionIndex) result.nextState.questionStartedAt = Date.now();
  room.gameState = { ...result.nextState, botNextAt: Date.now() + (room.gameId === 'word-builder' ? 6000 : 1500) };
  room.currentTurnPlayerId = result.nextTurn; room.winnerPlayerId = result.winnerId; room.winnerUsername = result.winnerUsername || null;
  room.status = result.isFinished ? 'FINISHED' : 'PLAYING';
  room.updatedAt = Date.now(); room.stateVersion++;
  return true;
}
