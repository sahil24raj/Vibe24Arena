interface GameRule {
  maxScore: number;
  minDurationMs: number;
  maxPointsPerSecond: number;
}

export const GAME_RULES: Record<string, GameRule> = {
  'modi-run': { maxScore: 50000, minDurationMs: 1500, maxPointsPerSecond: 150 },
  'cid-escape': { maxScore: 25000, minDurationMs: 1500, maxPointsPerSecond: 200 },
  'pen-flip': { maxScore: 500, minDurationMs: 1000, maxPointsPerSecond: 30 },
  'gully-cricket': { maxScore: 1000, minDurationMs: 2000, maxPointsPerSecond: 50 },
  'chai-tapri': { maxScore: 50000, minDurationMs: 2000, maxPointsPerSecond: 250 },
  'emoji-dodge': { maxScore: 20000, minDurationMs: 1500, maxPointsPerSecond: 100 },
  'meme-clicker': { maxScore: 100000, minDurationMs: 1000, maxPointsPerSecond: 300 },
  'eraser-throw': { maxScore: 500, minDurationMs: 1000, maxPointsPerSecond: 25 },
  'spin-cricket': { maxScore: 600, minDurationMs: 1500, maxPointsPerSecond: 40 },
  'word-builder': { maxScore: 2000, minDurationMs: 2000, maxPointsPerSecond: 80 },
  'tic-tac-toe': { maxScore: 500, minDurationMs: 1000, maxPointsPerSecond: 30 },
  'brain-pot': { maxScore: 3000, minDurationMs: 2000, maxPointsPerSecond: 60 },
  'escape-door': { maxScore: 50000, minDurationMs: 1000, maxPointsPerSecond: 500 },
};
