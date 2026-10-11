
import { authenticatedFetch } from '@/lib/apiClient';
import { GameSessionStartResponse, GameSessionFinishResponse } from './types';
import { UserProfile } from '@/types';

export class GameSessionManager {
  private static activeSession: {
    sessionId: string;
    sessionToken: string;
    gameId: string;
    startTime: number;
    seed: number;
    actionsCount: number;
  } | null = null;

  public static async startSession(gameId: string, user: UserProfile): Promise<GameSessionStartResponse> {
    try {
      const res = await authenticatedFetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          uid: user.uid || user.id,
          username: user.username,
        }),
      });

      const data = await res.json();
      if (data.success) {
        this.activeSession = {
          sessionId: data.sessionId,
          sessionToken: data.sessionToken,
          gameId: data.gameId,
          startTime: data.startTime,
          seed: data.seed,
          actionsCount: 0,
        };
      }
      return data;
    } catch (error: any) {
      console.error('Failed to initiate server game session:', error);
      // Fallback local session if offline
      const fallbackStart = Date.now();
      this.activeSession = {
        sessionId: `local_${fallbackStart}`,
        sessionToken: 'local_fallback_token',
        gameId,
        startTime: fallbackStart,
        seed: Math.floor(Math.random() * 100000),
        actionsCount: 0,
      };
      return {
        success: true,
        sessionId: this.activeSession.sessionId,
        sessionToken: this.activeSession.sessionToken,
        gameId,
        startTime: fallbackStart,
        seed: this.activeSession.seed,
      };
    }
  }

  public static recordAction() {
    if (this.activeSession) {
      this.activeSession.actionsCount += 1;
    }
  }

  public static async finishSession(
    score: number,
    isWin: boolean = true,
    user: UserProfile,
    currentHighScore: number = 0,
    metrics?: Record<string, any>
  ): Promise<GameSessionFinishResponse> {
    const session = this.activeSession;
    const now = Date.now();
    const durationMs = session ? now - session.startTime : 3000;

    try {
      const res = await authenticatedFetch('/api/session/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session?.sessionId || `ses_${now}`,
          sessionToken: session?.sessionToken || 'fallback',
          gameId: session?.gameId || 'game',
          startTime: session?.startTime || now - durationMs,
          seed: session?.seed || 0,
          score: Math.max(0, score),
          durationMs,
          actionsCount: session?.actionsCount || 1,
          isWin,
          metrics,
          uid: user.uid || user.id,
          username: user.username,
          currentHighScore,
        }),
      });

      const data: GameSessionFinishResponse = await res.json();
      this.activeSession = null;
      return data;
    } catch (error: any) {
      console.error('Failed to submit session result to server:', error);
      this.activeSession = null;
      const validatedScore = Math.max(0, Math.floor(score));
      return {
        success: true,
        validatedScore,
        isNewHighScore: validatedScore > currentHighScore,
        xpEarned: 50 + Math.floor(validatedScore / 50),
        coinsEarned: Math.max(10, Math.floor(validatedScore / 10)),
        rank: 'Challenger',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
