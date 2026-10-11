import { GameAdapter, ActionValidationResult, ActionResult } from './types';
import { RoomPlayer } from '@/types/multiplayer';

export interface PenFlipState {
  playerScores: Record<string, number>; // playerId -> points
  roundsRemaining: number;
  totalRounds: number;
  targetScore: number;
  lastFlip: {
    playerId: string;
    power: number;
    outcome: 'TIP' | 'BODY' | 'FAIL';
    points: number;
  } | null;
  roundHistory: Array<{
    playerId: string;
    outcome: 'TIP' | 'BODY' | 'FAIL';
    points: number;
  }>;
}

export interface PenFlipAction {
  type: 'SUBMIT_FLIP';
  power: number;
}

export const PenFlipAdapter: GameAdapter<PenFlipState, PenFlipAction> = {
  gameId: 'pen-flip',
  gameTitle: 'Pen Flip Battle 🖊️',
  minPlayers: 2,
  maxPlayers: 2,

  getInitialState: (players: RoomPlayer[], settings?: Record<string, any>): PenFlipState => {
    const playerScores: Record<string, number> = {};
    players.forEach((p) => {
      playerScores[p.id] = 0;
    });

    return {
      playerScores,
      roundsRemaining: settings?.roundsRemaining || 10,
      totalRounds: settings?.roundsRemaining || 10,
      targetScore: settings?.roundsToWin || 5,
      lastFlip: null,
      roundHistory: []
    };
  },

  validateAction: (
    state: PenFlipState,
    action: PenFlipAction,
    playerId: string,
    currentTurn: string | null
  ): ActionValidationResult => {
    if (action.type !== 'SUBMIT_FLIP') {
      return { valid: false, error: 'Unknown action' };
    }
    if (currentTurn !== playerId) {
      return { valid: false, error: 'Not your turn to flip!' };
    }
    if (!Number.isFinite(action.power) || typeof action.power !== 'number' || action.power < 0 || action.power > 100) {
      return { valid: false, error: 'Invalid power value' };
    }
    return { valid: true };
  },

  applyAction: (
    state: PenFlipState,
    action: PenFlipAction,
    playerId: string,
    players: RoomPlayer[]
  ): ActionResult<PenFlipState> => {
    const power = action.power;
    // Sweet spot logic: 68 - 82 power gives highest tip landing chance
    const isSweetSpot = power >= 68 && power <= 82;
    const isMedium = power >= 50 && power <= 90;

    let outcome: 'TIP' | 'BODY' | 'FAIL' = 'FAIL';
    let points = 0;

    const roll = Math.random();
    if (isSweetSpot) {
      if (roll < 0.75) {
        outcome = 'TIP';
        points = 1;
      } else if (roll < 0.95) {
        outcome = 'BODY';
      } else {
        outcome = 'FAIL';
      }
    } else if (isMedium) {
      if (roll < 0.35) {
        outcome = 'TIP';
        points = 1;
      } else if (roll < 0.8) {
        outcome = 'BODY';
      } else {
        outcome = 'FAIL';
      }
    } else {
      if (roll < 0.15) {
        outcome = 'TIP';
        points = 1;
      } else {
        outcome = 'FAIL';
      }
    }

    const newScores = {
      ...state.playerScores,
      [playerId]: (state.playerScores[playerId] || 0) + points
    };

    const newHistory = [
      ...state.roundHistory,
      { playerId, outcome, points }
    ];

    const otherPlayer = players.find((p) => p.id !== playerId);
    const nextTurn = otherPlayer ? otherPlayer.id : playerId;

    // Check if player hit targetScore
    if (newScores[playerId] >= state.targetScore) {
      return {
        nextState: {
          ...state,
          playerScores: newScores,
          lastFlip: { playerId, power, outcome, points },
          roundHistory: newHistory
        },
        nextTurn: null,
        winnerId: playerId,
        winnerUsername: players.find((p) => p.id === playerId)?.username,
        isFinished: true,
        events: [{ type: 'MATCH_WON', data: { winnerId: playerId } }]
      };
    }

    const roundsLeft = state.roundsRemaining - 1;
    const isOutOfRounds = roundsLeft <= 0;

    if (isOutOfRounds) {
      let winnerId: string | null = null;
      let highest = -1;
      Object.entries(newScores).forEach(([pid, sc]) => {
        if (sc > highest) {
          highest = sc;
          winnerId = pid;
        }
      });

      return {
        nextState: {
          ...state,
          playerScores: newScores,
          roundsRemaining: 0,
          lastFlip: { playerId, power, outcome, points },
          roundHistory: newHistory
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
        roundsRemaining: roundsLeft,
        lastFlip: { playerId, power, outcome, points },
        roundHistory: newHistory
      },
      nextTurn,
      winnerId: null,
      isFinished: false
    };
  }
};
