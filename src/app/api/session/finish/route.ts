import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';

const SECRET = process.env.GAME_SESSION_SECRET || 'chill_arena_game_session_secret_key_2026';

interface GameRule {
  maxScore: number;
  minDurationMs: number;
  maxPointsPerSecond: number;
}

const GAME_RULES: Record<string, GameRule> = {
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
  'indian-politics-arena': { maxScore: 50000, minDurationMs: 1000, maxPointsPerSecond: 500 },
};

const FinishSessionSchema = z.object({
  sessionId: z.string().min(1),
  sessionToken: z.string().min(1),
  gameId: z.string().min(1),
  startTime: z.number().positive(),
  seed: z.number(),
  score: z.number().nonnegative(),
  durationMs: z.number().nonnegative(),
  actionsCount: z.number().nonnegative().optional(),
  isWin: z.boolean().optional(),
  uid: z.string().optional(),
  username: z.string().optional(),
  currentHighScore: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = FinishSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid finish session payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const { sessionId, sessionToken, gameId, startTime, seed, score, durationMs, uid = 'guest', currentHighScore = 0 } = data;

    // 1. Verify Cryptographic Token
    const expectedPayload = `${sessionId}|${gameId}|${uid}|${startTime}|${seed}`;
    const expectedToken = crypto.createHmac('sha256', SECRET).update(expectedPayload).digest('hex');

    if (sessionToken !== expectedToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session token validation failed. Possible tampering detected.',
          cheatingDetected: true,
        },
        { status: 403 }
      );
    }

    // 2. Validate Timing & Score Ceilings
    const rule = GAME_RULES[gameId] || { maxScore: 100000, minDurationMs: 1000, maxPointsPerSecond: 200 };
    const now = Date.now();
    const serverDurationMs = now - startTime;

    // Reject if score > 0 and played for less than minimum duration
    if (score > 10 && (serverDurationMs < rule.minDurationMs || durationMs < rule.minDurationMs)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Game duration too short for submitted score.',
          cheatingDetected: true,
        },
        { status: 400 }
      );
    }

    // Check Points-Per-Second (PPS)
    const effectiveDurationSec = Math.max(1, durationMs / 1000);
    const pps = score / effectiveDurationSec;
    if (score > 50 && pps > rule.maxPointsPerSecond) {
      return NextResponse.json(
        {
          success: false,
          error: `Score accumulation rate (${pps.toFixed(1)} pts/sec) exceeds physical limit (${rule.maxPointsPerSecond} pts/sec).`,
          cheatingDetected: true,
        },
        { status: 400 }
      );
    }

    // Hard ceiling check
    const validatedScore = Math.max(0, Math.min(Math.floor(score), rule.maxScore));
    const isNewHighScore = validatedScore > currentHighScore;

    // 3. Server-Authoritative Reward Calculation
    const baseXP = 50;
    const performanceXP = Math.min(200, Math.floor(validatedScore / 25));
    const highBonusXP = isNewHighScore ? 150 : 0;
    const xpEarned = baseXP + performanceXP + highBonusXP;

    const coinsEarned = Math.max(15, Math.min(300, Math.floor(validatedScore / 10)));

    let rank = 'Bronze II';
    if (validatedScore >= 10000) rank = 'Grandmaster';
    else if (validatedScore >= 5000) rank = 'Diamond I';
    else if (validatedScore >= 2500) rank = 'Platinum II';
    else if (validatedScore >= 1000) rank = 'Gold III';
    else if (validatedScore >= 500) rank = 'Silver I';

    return NextResponse.json({
      success: true,
      validatedScore,
      isNewHighScore,
      xpEarned,
      coinsEarned,
      rank,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Session finish error:', error);
    return NextResponse.json({ success: false, error: 'Failed to finish game session' }, { status: 500 });
  }
}
