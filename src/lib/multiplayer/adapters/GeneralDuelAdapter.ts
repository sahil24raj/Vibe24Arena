import { GameAdapter, ActionValidationResult, ActionResult } from './types';
import { RoomPlayer } from '@/types/multiplayer';

export interface GeneralDuelState {
  playerScores: Record<string, number>;
  playerAttempts: Record<string, number>;
  maxAttempts: number;
  lastActions: Array<{
    playerId: string;
    score: number;
    description: string;
    timestamp: number;
  }>;
}

export interface GeneralDuelAction {
  type: 'SUBMIT_SCORE' | 'FINISH_ATTEMPT';
  score: number;
  description?: string;
}

export const createGeneralDuelAdapter = (gameId: string, gameTitle: string): GameAdapter<GeneralDuelState, GeneralDuelAction> => {
  return {
    gameId,
    gameTitle,
    minPlayers: 2,
    maxPlayers: 4,

    getInitialState: (players: RoomPlayer[], settings?: Record<string, any>): GeneralDuelState => {
      const playerScores: Record<string, number> = {};
      const playerAttempts: Record<string, number> = {};

      players.forEach((p) => {
        playerScores[p.id] = 0;
        playerAttempts[p.id] = 0;
      });

      return {
        playerScores,
        playerAttempts,
        maxAttempts: settings?.maxAttempts || 3,
        lastActions: []
      };
    },

    validateAction: (
      state: GeneralDuelState,
      action: GeneralDuelAction,
      playerId: string
    ): ActionValidationResult => {
      if (!['SUBMIT_SCORE', 'FINISH_ATTEMPT'].includes(action.type) || !Object.hasOwn(state.playerAttempts, playerId) || state.playerAttempts[playerId] >= state.maxAttempts) return { valid: false, error: 'Invalid attempt.' };
      if (action.description !== undefined && (typeof action.description !== 'string' || action.description.length > 200)) return { valid: false, error: 'Invalid description.' };
      if (!Number.isFinite(action.score) || action.score > 100000 || typeof action.score !== 'number' || action.score < 0) {
        return { valid: false, error: 'Invalid score submitted' };
      }
      return { valid: true };
    },

    applyAction: (
      state: GeneralDuelState,
      action: GeneralDuelAction,
      playerId: string,
      players: RoomPlayer[]
    ): ActionResult<GeneralDuelState> => {
      const currentScore = state.playerScores[playerId] || 0;
      const currentAttempts = (state.playerAttempts[playerId] || 0) + 1;
      const newScore = Math.max(currentScore, action.score);

      const newScores = { ...state.playerScores, [playerId]: newScore };
      const newAttempts = { ...state.playerAttempts, [playerId]: currentAttempts };

      const newActions = [
        {
          playerId,
          score: action.score,
          description: action.description || `Scored ${action.score}`,
          timestamp: Date.now()
        },
        ...state.lastActions.slice(0, 9)
      ];

      // Check if all players completed max attempts
      const allFinished = players.every((p) => (newAttempts[p.id] || 0) >= state.maxAttempts);

      if (allFinished) {
        let winnerId: string | null = null;
        let topScore = -1;
        Object.entries(newScores).forEach(([pid, sc]) => {
          if (sc > topScore) {
            topScore = sc;
            winnerId = pid;
          }
        });

        return {
          nextState: {
            ...state,
            playerScores: newScores,
            playerAttempts: newAttempts,
            lastActions: newActions
          },
          nextTurn: null,
          winnerId,
          winnerUsername: winnerId ? players.find((p) => p.id === winnerId)?.username : null,
          isFinished: true,
          events: [{ type: 'MATCH_WON', data: { winnerId } }]
        };
      }

      return {
        nextState: {
          ...state,
          playerScores: newScores,
          playerAttempts: newAttempts,
          lastActions: newActions
        },
        nextTurn: null,
        winnerId: null,
        isFinished: false
      };
    }
  };
};
