import type { MultiplayerRoomState } from '@/types/multiplayer';
// Apply to every room response, including create/join/action/error recovery.
export function roomView(room: MultiplayerRoomState, uid: string): MultiplayerRoomState {
  const view = structuredClone(room);
  const state = view.gameState;
  if (room.gameId === 'chor-sipahi' && !['ROUND_RESULT', 'FINAL_PODIUM'].includes(state.phase)) {
    state.roleAssignments = Object.fromEntries(Object.entries(state.roleAssignments || {}).filter(([id]) => id === uid || id === state.rajaPlayerId));
    state.mantriPlayerId = ''; state.chorPlayerId = '';
  }
  if (room.gameId === 'word-builder' && room.status === 'PLAYING') {
    const found = new Set(Object.values(state.foundWordsMap || {}).flat());
    state.targetWords = state.targetWords.map((word: string) => found.has(word) ? word : '');
  }
  if (room.gameId === 'brain-pot' && state.currentQuestion) {
    delete state.currentQuestion.correctAnswer;
    state.playerAnswers = Object.fromEntries(Object.entries(state.playerAnswers).map(([id, answer]) => [id, id === uid ? answer : answer ? { answered: true } : null]));
  }
  return view;
}
