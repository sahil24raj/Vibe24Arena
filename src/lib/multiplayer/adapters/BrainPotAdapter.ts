import { GameAdapter, ActionValidationResult, ActionResult } from './types';
import { RoomPlayer } from '@/types/multiplayer';

export interface BrainQuestion {
  id: number;
  prompt: string;
  options: string[];
  correctAnswer: string;
}

const BRAIN_QUESTIONS: BrainQuestion[] = [
  { id: 1, prompt: 'Which shape completes the sequence? 🔺 🔷 🔺 🔷 🔺 ?', options: ['🔺', '🔷', '🟢', '⭐'], correctAnswer: '🔷' },
  { id: 2, prompt: 'Quick calculation: 14 + 19 - 8 = ?', options: ['23', '25', '27', '31'], correctAnswer: '25' },
  { id: 3, prompt: 'Spot the odd meme emoji: 🗿 🗿 🗿 🐸 🗿', options: ['🗿', '🐸', '🚀', '🔥'], correctAnswer: '🐸' },
  { id: 4, prompt: 'What number comes next? 4, 9, 16, 25, ?', options: ['30', '36', '49', '32'], correctAnswer: '36' },
  { id: 5, prompt: 'Speed equation: (8 x 7) - 16 = ?', options: ['40', '48', '38', '42'], correctAnswer: '40' },
  { id: 6, prompt: 'Find the odd drink: ☕ ☕ 🍵 ☕ ☕', options: ['☕', '🍵', '🧋', '🥛'], correctAnswer: '🍵' },
  { id: 7, prompt: 'Sequence logic: 3, 6, 12, 24, ?', options: ['36', '48', '30', '42'], correctAnswer: '48' },
  { id: 8, prompt: 'If 5 cats catch 5 mice in 5 mins, how many cats catch 100 mice in 100 mins?', options: ['5', '20', '100', '50'], correctAnswer: '5' }
];

export interface BrainPotState {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: BrainQuestion;
  playerAnswers: Record<string, { answer: string; timeTakenSec: number; isCorrect: boolean } | null>;
  playerScores: Record<string, number>;
  playerStreaks: Record<string, number>;
  timePerQuestionSec: number;
}

export interface BrainPotAction {
  type: 'ANSWER_QUESTION';
  questionIndex: number;
  selectedOption: string;
  timeRemainingSec: number;
}

export const BrainPotAdapter: GameAdapter<BrainPotState, BrainPotAction> = {
  gameId: 'brain-pot',
  gameTitle: 'Brain Pot: Rapid IQ Arena 🧠',
  minPlayers: 2,
  maxPlayers: 4,

  getInitialState: (players: RoomPlayer[], settings?: Record<string, any>): BrainPotState => {
    const playerScores: Record<string, number> = {};
    const playerStreaks: Record<string, number> = {};
    const playerAnswers: Record<string, any> = {};

    players.forEach((p) => {
      playerScores[p.id] = 0;
      playerStreaks[p.id] = 0;
      playerAnswers[p.id] = null;
    });

    return {
      currentQuestionIndex: 0,
      totalQuestions: settings?.totalQuestions || 6,
      currentQuestion: BRAIN_QUESTIONS[0],
      playerAnswers,
      playerScores,
      playerStreaks,
      timePerQuestionSec: 8
    };
  },

  validateAction: (
    state: BrainPotState,
    action: BrainPotAction,
    playerId: string
  ): ActionValidationResult => {
    if (action.type !== 'ANSWER_QUESTION') {
      return { valid: false, error: 'Unknown action' };
    }
    if (typeof action.selectedOption !== 'string' || action.selectedOption.length > 100 || !Number.isFinite(action.timeRemainingSec) || action.timeRemainingSec < 0 || action.timeRemainingSec > 8) return { valid: false, error: 'Invalid answer.' };
    if (action.questionIndex !== state.currentQuestionIndex) {
      return { valid: false, error: 'Stale question answer' };
    }
    if (state.playerAnswers[playerId] !== null) {
      return { valid: false, error: 'You have already answered this question!' };
    }
    return { valid: true };
  },

  applyAction: (
    state: BrainPotState,
    action: BrainPotAction,
    playerId: string,
    players: RoomPlayer[]
  ): ActionResult<BrainPotState> => {
    const isCorrect = action.selectedOption === state.currentQuestion.correctAnswer;
    const speedBonus = Math.max(0, Math.floor(action.timeRemainingSec * 25));
    const streak = isCorrect ? (state.playerStreaks[playerId] || 0) + 1 : 0;
    const points = isCorrect ? 100 + speedBonus + streak * 20 : 0;

    const newScore = (state.playerScores[playerId] || 0) + points;
    const newScores = { ...state.playerScores, [playerId]: newScore };
    const newStreaks = { ...state.playerStreaks, [playerId]: streak };

    const newAnswers = {
      ...state.playerAnswers,
      [playerId]: {
        answer: action.selectedOption,
        timeTakenSec: 8 - action.timeRemainingSec,
        isCorrect
      }
    };

    // Check if all players answered
    const allAnswered = players.every((p) => newAnswers[p.id] !== null);

    if (allAnswered) {
      const nextIdx = state.currentQuestionIndex + 1;
      const isMatchFinished = nextIdx >= state.totalQuestions;

      if (isMatchFinished) {
        let winnerId: string | null = null;
        let topScore = -1;
        Object.entries(newScores).forEach(([pid, score]) => {
          if (score > topScore) {
            topScore = score;
            winnerId = pid;
          }
        });

        return {
          nextState: {
            ...state,
            playerScores: newScores,
            playerStreaks: newStreaks,
            playerAnswers: newAnswers
          },
          nextTurn: null,
          winnerId,
          winnerUsername: winnerId ? players.find((p) => p.id === winnerId)?.username : null,
          isFinished: true,
          events: [{ type: 'MATCH_WON', data: { winnerId } }]
        };
      } else {
        // Next question
        const resetAnswers: Record<string, any> = {};
        players.forEach((p) => {
          resetAnswers[p.id] = null;
        });

        return {
          nextState: {
            ...state,
            currentQuestionIndex: nextIdx,
            currentQuestion: BRAIN_QUESTIONS[nextIdx % BRAIN_QUESTIONS.length],
            playerAnswers: resetAnswers,
            playerScores: newScores,
            playerStreaks: newStreaks
          },
          nextTurn: null,
          winnerId: null,
          isFinished: false,
          events: [{ type: 'NEXT_QUESTION', data: { questionIndex: nextIdx } }]
        };
      }
    }

    return {
      nextState: {
        ...state,
        playerScores: newScores,
        playerStreaks: newStreaks,
        playerAnswers: newAnswers
      },
      nextTurn: null,
      winnerId: null,
      isFinished: false
    };
  }
};
