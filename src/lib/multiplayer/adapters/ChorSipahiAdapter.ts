import { GameAdapter, ActionValidationResult, ActionResult } from './types';
import { RoomPlayer } from '@/types/multiplayer';

export type ChorSipahiRole = 'raja' | 'mantri' | 'sipahi' | 'chor';

export interface ChorSipahiState {
  currentRound: number;
  maxRounds: number;
  phase: 'ROLE_REVEAL' | 'DISCUSSION' | 'SIPAHI_GUESS' | 'ROUND_RESULT' | 'FINAL_PODIUM';
  roleAssignments: Record<string, ChorSipahiRole>; // playerId -> role
  revealedRoles: Record<string, boolean>; // playerId -> is public
  rajaPlayerId: string;
  sipahiPlayerId: string;
  mantriPlayerId: string;
  chorPlayerId: string;
  suspectPlayerIds: string[]; // 3 players other than Raja
  sipahiGuessId: string | null;
  guessIsCorrect: boolean | null;
  roundScores: Record<string, number>; // playerId -> points in current round
  cumulativeScores: Record<string, number>; // playerId -> total points
}

export interface ChorSipahiAction {
  type: 'CONFIRM_ROLE_VIEWED' | 'START_GUESSING' | 'SUBMIT_SIPAHI_GUESS' | 'NEXT_ROUND';
  suspectId?: string;
}

const ROLE_POINTS = {
  raja: 1000,
  mantri: 800,
  sipahi: 500,
  chor: 0
};

const assignRoles = (players: RoomPlayer[]) => {
  const roles: ChorSipahiRole[] = ['raja', 'mantri', 'sipahi', 'chor'];
  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  const roleAssignments: Record<string, ChorSipahiRole> = {};
  let rajaPlayerId = '';
  let sipahiPlayerId = '';
  let mantriPlayerId = '';
  let chorPlayerId = '';

  players.slice(0, 4).forEach((p, idx) => {
    const r = roles[idx];
    roleAssignments[p.id] = r;
    if (r === 'raja') rajaPlayerId = p.id;
    if (r === 'sipahi') sipahiPlayerId = p.id;
    if (r === 'mantri') mantriPlayerId = p.id;
    if (r === 'chor') chorPlayerId = p.id;
  });

  const suspectPlayerIds = players.slice(0, 4).filter((p) => p.id !== rajaPlayerId).map((p) => p.id);

  return {
    roleAssignments,
    rajaPlayerId,
    sipahiPlayerId,
    mantriPlayerId,
    chorPlayerId,
    suspectPlayerIds
  };
};

export const ChorSipahiAdapter: GameAdapter<ChorSipahiState, ChorSipahiAction> = {
  gameId: 'chor-sipahi',
  gameTitle: 'Chor Sipahi (Raja Mantri) 👑🥷',
  minPlayers: 4,
  maxPlayers: 4,

  getInitialState: (players: RoomPlayer[], settings?: Record<string, any>): ChorSipahiState => {
    const {
      roleAssignments,
      rajaPlayerId,
      sipahiPlayerId,
      mantriPlayerId,
      chorPlayerId,
      suspectPlayerIds
    } = assignRoles(players);

    const cumulativeScores: Record<string, number> = {};
    players.forEach((p) => {
      cumulativeScores[p.id] = 0;
    });

    return {
      currentRound: 1,
      maxRounds: settings?.roundsToWin || 3,
      phase: 'ROLE_REVEAL',
      roleAssignments,
      revealedRoles: {
        [rajaPlayerId]: true // Raja is public
      },
      rajaPlayerId,
      sipahiPlayerId,
      mantriPlayerId,
      chorPlayerId,
      suspectPlayerIds,
      sipahiGuessId: null,
      guessIsCorrect: null,
      roundScores: {},
      cumulativeScores
    };
  },

  validateAction: (
    state: ChorSipahiState,
    action: ChorSipahiAction,
    playerId: string,
    currentTurn: string | null,
    players: RoomPlayer[]
  ): ActionValidationResult => {
    if (!players.some(p => p.id === playerId)) return { valid: false, error: 'Not a player.' };
    const isHost = players.some(p => p.id === playerId && p.isHost);
    switch (action.type) {
      case 'CONFIRM_ROLE_VIEWED':
        return { valid: state.phase === 'ROLE_REVEAL' };

      case 'START_GUESSING':
        return { valid: state.phase === 'DISCUSSION' && (isHost || playerId === state.sipahiPlayerId) };

      case 'SUBMIT_SIPAHI_GUESS':
        if (state.phase !== 'SIPAHI_GUESS' || playerId !== state.sipahiPlayerId) {
          return { valid: false, error: 'Only the Sipahi can make the arrest guess!' };
        }
        if (!action.suspectId || !state.suspectPlayerIds.includes(action.suspectId)) {
          return { valid: false, error: 'Invalid suspect selected' };
        }
        return { valid: true };

      case 'NEXT_ROUND':
        return { valid: isHost && state.phase === 'ROUND_RESULT' && state.currentRound < state.maxRounds };

      default:
        return { valid: false, error: 'Unknown action' };
    }
  },

  applyAction: (
    state: ChorSipahiState,
    action: ChorSipahiAction,
    playerId: string,
    players: RoomPlayer[]
  ): ActionResult<ChorSipahiState> => {
    if (action.type === 'CONFIRM_ROLE_VIEWED') {
      return {
        nextState: { ...state, phase: 'DISCUSSION' },
        nextTurn: state.sipahiPlayerId,
        winnerId: null,
        isFinished: false
      };
    }

    if (action.type === 'START_GUESSING') {
      return {
        nextState: { ...state, phase: 'SIPAHI_GUESS' },
        nextTurn: state.sipahiPlayerId,
        winnerId: null,
        isFinished: false
      };
    }

    if (action.type === 'SUBMIT_SIPAHI_GUESS' && action.suspectId) {
      const isCorrect = action.suspectId === state.chorPlayerId;
      const roundScores: Record<string, number> = {};

      // Raja always gets 1000
      roundScores[state.rajaPlayerId] = ROLE_POINTS.raja;

      if (isCorrect) {
        // Sipahi correct: Sipahi gets 500, Mantri gets 800, Chor gets 0
        roundScores[state.sipahiPlayerId] = ROLE_POINTS.sipahi;
        roundScores[state.mantriPlayerId] = ROLE_POINTS.mantri;
        roundScores[state.chorPlayerId] = ROLE_POINTS.chor;
      } else {
        // Sipahi wrong: Mantri was wrongly accused -> Chor steals Sipahi's 500 points!
        roundScores[state.sipahiPlayerId] = 0;
        roundScores[state.mantriPlayerId] = ROLE_POINTS.mantri;
        roundScores[state.chorPlayerId] = ROLE_POINTS.sipahi; // Steals 500
      }

      const cumulativeScores = { ...state.cumulativeScores };
      Object.entries(roundScores).forEach(([pid, pts]) => {
        cumulativeScores[pid] = (cumulativeScores[pid] || 0) + pts;
      });

      const isFinalRound = state.currentRound >= state.maxRounds;

      // Find overall winner
      let highestScore = -1;
      let winnerId: string | null = null;
      if (isFinalRound) {
        Object.entries(cumulativeScores).forEach(([pid, pts]) => {
          if (pts > highestScore) {
            highestScore = pts;
            winnerId = pid;
          }
        });
      }

      const revealedRoles: Record<string, boolean> = {};
      players.forEach((p) => {
        revealedRoles[p.id] = true;
      });

      return {
        nextState: {
          ...state,
          phase: isFinalRound ? 'FINAL_PODIUM' : 'ROUND_RESULT',
          revealedRoles,
          sipahiGuessId: action.suspectId,
          guessIsCorrect: isCorrect,
          roundScores,
          cumulativeScores
        },
        nextTurn: null,
        winnerId: isFinalRound ? winnerId : null,
        winnerUsername: isFinalRound && winnerId ? players.find((p) => p.id === winnerId)?.username : null,
        isFinished: isFinalRound,
        events: [
          { type: 'GUESS_EVALUATED', data: { isCorrect, guessId: action.suspectId, roundScores } }
        ]
      };
    }

    if (action.type === 'NEXT_ROUND') {
      const nextRoundNum = state.currentRound + 1;
      const {
        roleAssignments,
        rajaPlayerId,
        sipahiPlayerId,
        mantriPlayerId,
        chorPlayerId,
        suspectPlayerIds
      } = assignRoles(players);

      return {
        nextState: {
          ...state,
          currentRound: nextRoundNum,
          phase: 'ROLE_REVEAL',
          roleAssignments,
          revealedRoles: {
            [rajaPlayerId]: true
          },
          rajaPlayerId,
          sipahiPlayerId,
          mantriPlayerId,
          chorPlayerId,
          suspectPlayerIds,
          sipahiGuessId: null,
          guessIsCorrect: null,
          roundScores: {}
        },
        nextTurn: sipahiPlayerId,
        winnerId: null,
        isFinished: false
      };
    }

    return {
      nextState: state,
      nextTurn: state.sipahiPlayerId,
      winnerId: null,
      isFinished: false
    };
  }
};
