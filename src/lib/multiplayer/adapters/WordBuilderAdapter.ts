import { GameAdapter, ActionValidationResult, ActionResult } from './types';
import { RoomPlayer } from '@/types/multiplayer';
import { getRandomPuzzleLevel, getAllValidWordsForPool, PUZZLE_LEVELS, WordPuzzleLevel } from '@/lib/word-builder/wordDatabase';

export interface WordBuilderState {
  levelId: string;
  theme: string;
  letters: string[];
  targetWords: string[];
  foundWordsMap: Record<string, string[]>; // playerId -> list of words found
  playerScores: Record<string, number>;
  timeRemainingSec: number;
}

export type WordBuilderAction =
  | {
      type: 'SUBMIT_WORD';
      word: string;
    }
  | {
      type: 'TIME_UP';
    };

export const WordBuilderAdapter: GameAdapter<WordBuilderState, WordBuilderAction> = {
  gameId: 'word-builder',
  gameTitle: 'Word Builder Pro 🔠',
  minPlayers: 2,
  maxPlayers: 4,

  getInitialState: (players: RoomPlayer[], settings?: Record<string, any>): WordBuilderState => {
    const level = getRandomPuzzleLevel();
    const foundWordsMap: Record<string, string[]> = {};
    const playerScores: Record<string, number> = {};

    players.forEach((p) => {
      foundWordsMap[p.id] = [];
      playerScores[p.id] = 0;
    });

    // Scramble letters so it's a true anagram challenge
    const scrambled = [...level.letters].sort(() => Math.random() - 0.5);

    return {
      levelId: level.id,
      theme: level.theme,
      letters: scrambled,
      targetWords: level.targetWords.map((w) => w.toUpperCase()),
      foundWordsMap,
      playerScores,
      timeRemainingSec: settings?.turnTimeLimitSec || 60
    };
  },

  validateAction: (
    state: WordBuilderState,
    action: WordBuilderAction,
    playerId: string
  ): ActionValidationResult => {
    if (action.type === 'TIME_UP') {
      return { valid: true };
    }

    if (action.type !== 'SUBMIT_WORD') {
      return { valid: false, error: 'Unknown action' };
    }
    if (typeof action.word !== 'string' || action.word.length > 32) return { valid: false, error: 'Invalid word.' };
    const cleanWord = action.word.trim().toUpperCase();
    if (!cleanWord || cleanWord.length < 3) {
      return { valid: false, error: 'Word must be at least 3 letters' };
    }

    const playerFound = state.foundWordsMap[playerId] || [];
    if (playerFound.includes(cleanWord)) {
      return { valid: false, error: 'Word already submitted by you!' };
    }

    // Verify word can be formed from letters
    const available = [...state.letters];
    for (const char of cleanWord) {
      const idx = available.indexOf(char);
      if (idx === -1) {
        return { valid: false, error: 'Word contains invalid letter tile' };
      }
      available.splice(idx, 1);
    }

    // Check against valid words pool
    const level = PUZZLE_LEVELS.find((l) => l.id === state.levelId) || PUZZLE_LEVELS[0];
    const validPool = getAllValidWordsForPool(level);
    if (!validPool.has(cleanWord)) {
      return { valid: false, error: 'Not a valid dictionary word!' };
    }

    return { valid: true };
  },

  applyAction: (
    state: WordBuilderState,
    action: WordBuilderAction,
    playerId: string,
    players: RoomPlayer[]
  ): ActionResult<WordBuilderState> => {
    if (action.type === 'TIME_UP') {
      // Determine winner based on top score
      let topScore = -1;
      let topPlayerId: string | null = null;
      let isDraw = false;

      players.forEach((p) => {
        const pScore = state.playerScores[p.id] || 0;
        if (pScore > topScore) {
          topScore = pScore;
          topPlayerId = p.id;
          isDraw = false;
        } else if (pScore === topScore && pScore > 0) {
          isDraw = true;
        }
      });

      const winnerId = isDraw ? null : topPlayerId;
      const winnerUsername = winnerId ? players.find((p) => p.id === winnerId)?.username : null;

      return {
        nextState: state,
        nextTurn: null,
        winnerId,
        winnerUsername,
        isFinished: true,
        events: [{ type: 'MATCH_TIME_UP', data: { winnerId, topScore } }]
      };
    }

    const cleanWord = action.word.trim().toUpperCase();
    const isTarget = state.targetWords.includes(cleanWord);

    let points = cleanWord.length * 50;
    if (isTarget) points += 100;

    const currentFound = state.foundWordsMap[playerId] || [];
    const updatedFound = [...currentFound, cleanWord];

    const currentScore = state.playerScores[playerId] || 0;
    const updatedScore = currentScore + points;

    const updatedFoundMap = {
      ...state.foundWordsMap,
      [playerId]: updatedFound
    };

    const updatedScores = {
      ...state.playerScores,
      [playerId]: updatedScore
    };

    // Check if player found all target words
    const allTargetsFound = state.targetWords.every((tw) => updatedFound.includes(tw));

    if (allTargetsFound) {
      return {
        nextState: {
          ...state,
          foundWordsMap: updatedFoundMap,
          playerScores: updatedScores
        },
        nextTurn: null,
        winnerId: playerId,
        winnerUsername: players.find((p) => p.id === playerId)?.username,
        isFinished: true,
        events: [{ type: 'ALL_TARGETS_FOUND', data: { winnerId: playerId } }]
      };
    }

    return {
      nextState: {
        ...state,
        foundWordsMap: updatedFoundMap,
        playerScores: updatedScores
      },
      nextTurn: null, // Simultaneous gameplay
      winnerId: null,
      isFinished: false,
      events: [{ type: 'WORD_SCORED', data: { playerId, word: cleanWord, points } }]
    };
  }
};
