import { NextRequest, NextResponse } from 'next/server';

const GAME_CEILINGS: Record<string, number> = {
  'modi-run': 50000,
  'cid-escape': 25000,
  'pen-flip': 500,
  'gully-cricket': 1000,
  'chai-tapri': 50000,
  'meme-roast': 5000,
  'eraser-football': 100,
  'hand-cricket': 300,
  'pappu-pakia': 25000,
  'escape-door': 50000,
  'indian-politics-arena': 50000
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, gameTitle, score, uid, username, currentHighScore = 0 } = body;

    if (!gameId || typeof score !== 'number' || isNaN(score)) {
      return NextResponse.json({ error: 'Invalid gameId or score' }, { status: 400 });
    }

    const maxAllowed = GAME_CEILINGS[gameId] || 100000;
    
    // Anti-cheat verification
    if (score > maxAllowed) {
      return NextResponse.json({
        error: 'Score exceeded maximum possible threshold for this game mode.',
        cheatingDetected: true,
        validScore: maxAllowed
      }, { status: 400 });
    }

    const validatedScore = Math.max(0, Math.floor(score));
    const isNewHighScore = validatedScore > currentHighScore;

    const baseXP = 50;
    const bonusXP = isNewHighScore ? 100 : Math.min(100, Math.floor(validatedScore / 50));
    const xpEarned = baseXP + bonusXP;
    const coinsEarned = Math.max(10, Math.min(250, Math.floor(validatedScore / 10)));

    return NextResponse.json({
      success: true,
      validatedScore,
      isNewHighScore,
      xpEarned,
      coinsEarned,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Score submission failed' }, { status: 500 });
  }
}
