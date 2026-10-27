'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { GameSessionManager } from '@/lib/game-engine/GameSessionManager';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  Heart,
  Sparkles,
  Lock,
  DoorOpen,
  CheckCircle2,
  XCircle,
  Play,
  Home,
  Info,
  ChevronRight,
  Crown
} from 'lucide-react';

export type GameState =
  | 'IDLE'
  | 'PLAYING'
  | 'DOOR_SELECTED'
  | 'SUCCESS'
  | 'DANGER'
  | 'GAME_OVER'
  | 'COMPLETED'
  | 'ENDLESS';

interface DoorItem {
  id: number;
  label: string;
  isOpen: boolean;
  isSafe?: boolean;
  isSelected?: boolean;
}

export function EscapeDoorGame() {
  const { user, submitGameScore } = useAppStore();

  // Core Game State
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [doorsEscapedCount, setDoorsEscapedCount] = useState<number>(0);
  const [isEndless, setIsEndless] = useState<boolean>(false);

  // Door Configuration for Current Round
  const [doors, setDoors] = useState<DoorItem[]>([]);
  const [doorCount, setDoorCount] = useState<number>(2);
  const [roundToken, setRoundToken] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  const [selectedDoorIndex, setSelectedDoorIndex] = useState<number | null>(null);
  const [revealedSafeIndex, setRevealedSafeIndex] = useState<number | null>(null);

  // Reward Feedback Popups
  const [lastScoreGained, setLastScoreGained] = useState<number>(0);
  const [lastXpGained, setLastXpGained] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundFx.isMuted);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Local & User Stored Best Records
  const [bestScore, setBestScore] = useState<number>(() => {
    return Math.max(user.stats.highScores?.['escape-door'] || 0, user.stats.bestScore || 0);
  });
  const [bestLevel, setBestLevel] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('escape_door_best_level');
      if (saved) return parseInt(saved, 10);
    }
    return user.stats.bestDoorLevel || 1;
  });
  const [bestStreak, setBestStreak] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('escape_door_best_streak');
      if (saved) return parseInt(saved, 10);
    }
    return user.stats.bestDoorStreak || 0;
  });

  // Client hydration check
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const isRequestingRoundRef = useRef<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    setIsMuted(soundFx.isMuted);
  }, []);

  // Update best score if store updates
  useEffect(() => {
    const currentHigh = user.stats.highScores?.['escape-door'] || 0;
    if (currentHigh > bestScore) {
      setBestScore(currentHigh);
    }
  }, [user.stats.highScores, bestScore]);

  // Audio Toggle
  const handleToggleMute = () => {
    const nextMuted = soundFx.toggleMute();
    setIsMuted(nextMuted);
  };

  /**
   * Request Next Level Round from Server
   * Server sends opaque HMAC/AES token. Client NEVER receives safeDoorIndex!
   */
  const requestLevelRound = useCallback(
    async (nextLevel: number, currentSession: string, endlessMode: boolean) => {
      if (isRequestingRoundRef.current) return;
      isRequestingRoundRef.current = true;
      setIsProcessing(true);

      try {
        const res = await fetch('/api/games/escape-door/round', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: currentSession,
            level: nextLevel,
            isEndless: endlessMode,
          }),
        });

        const data = await res.json();

        if (data.success && data.roundToken) {
          setRoundToken(data.roundToken);
          setDoorCount(data.doorCount);
          setLevel(data.level);

          // Build fresh closed doors array
          const initialDoors: DoorItem[] = Array.from({ length: data.doorCount }, (_, i) => ({
            id: i,
            label: `DOOR ${String(i + 1).padStart(2, '0')}`,
            isOpen: false,
          }));

          setDoors(initialDoors);
          setSelectedDoorIndex(null);
          setRevealedSafeIndex(null);
          setGameState(endlessMode ? 'ENDLESS' : 'PLAYING');
        } else {
          // Fallback in case of server network glitch
          useFallbackLocalRound(nextLevel, endlessMode);
        }
      } catch (err) {
        console.warn('Network error requesting door round, using secure local fallback:', err);
        useFallbackLocalRound(nextLevel, endlessMode);
      } finally {
        setIsProcessing(false);
        isRequestingRoundRef.current = false;
      }
    },
    []
  );

  /**
   * Secure local fallback round in case of temporary offline state
   */
  const useFallbackLocalRound = (nextLevel: number, endlessMode: boolean) => {
    let count = 2;
    if (nextLevel === 1) count = 2;
    else if (nextLevel === 2 || nextLevel === 3 || nextLevel === 5) count = 3;
    else if (nextLevel === 4 || nextLevel === 6 || nextLevel === 8) count = 4;
    else if (nextLevel === 7 || nextLevel === 9) count = 5;
    else if (nextLevel === 10) count = 6;
    else count = Math.floor(Math.random() * 3) + 4; // 4-6

    // Fake round token for fallback
    setRoundToken(`offline_${Date.now()}_${count}`);
    setDoorCount(count);
    setLevel(nextLevel);

    const initialDoors: DoorItem[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      label: `DOOR ${String(i + 1).padStart(2, '0')}`,
      isOpen: false,
    }));

    setDoors(initialDoors);
    setSelectedDoorIndex(null);
    setRevealedSafeIndex(null);
    setGameState(endlessMode ? 'ENDLESS' : 'PLAYING');
  };

  /**
   * Start New Game Run
   */
  const handleStartGame = async (startEndless = false) => {
    soundFx.playClick();
    setScore(0);
    setStreak(0);
    setDoorsEscapedCount(0);
    setIsEndless(startEndless);
    const startLvl = 1;
    setLevel(startLvl);

    // Initialize Server-Authoritative Game Session
    const sessionRes = await GameSessionManager.startSession('escape-door', user);
    const activeSession = sessionRes.sessionId || `session_${Date.now()}`;
    setSessionId(activeSession);

    // Request Level 1 round
    await requestLevelRound(startLvl, activeSession, startEndless);
  };

  /**
   * Player selects a door
   */
  const handleDoorClick = async (doorIdx: number) => {
    if (gameState !== 'PLAYING' && gameState !== 'ENDLESS') return;
    if (isProcessing || selectedDoorIndex !== null) return; // Prevent double clicks / race conditions

    setIsProcessing(true);
    setSelectedDoorIndex(doorIdx);
    setGameState('DOOR_SELECTED');
    soundFx.playDoorSelect();

    GameSessionManager.recordAction();

    // Visual door opening initiation
    setDoors((prev) =>
      prev.map((d, i) => (i === doorIdx ? { ...d, isOpen: true, isSelected: true } : d))
    );

    // Check if offline fallback token
    if (roundToken.startsWith('offline_')) {
      handleOfflineDoorPick(doorIdx);
      return;
    }

    try {
      const res = await fetch('/api/games/escape-door/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          roundToken,
          selectedDoorIndex: doorIdx,
          currentScore: score,
          currentStreak: streak,
        }),
      });

      const data = await res.json();

      if (data.success) {
        processPickResult(data.isSafe, data.safeDoorIndex, data.scoreGained, data.xpGained, data.streak, data.isLevel10Complete);
      } else {
        handleOfflineDoorPick(doorIdx);
      }
    } catch (err) {
      console.warn('Network issue during pick verification, applying local check:', err);
      handleOfflineDoorPick(doorIdx);
    }
  };

  /**
   * Local verification fallback if server is unreachable
   */
  const handleOfflineDoorPick = (doorIdx: number) => {
    // Generate true random safe door
    const safeIdx = Math.floor(Math.random() * doorCount);
    const isSafe = doorIdx === safeIdx;

    if (isSafe) {
      const nextStreak = streak + 1;
      const baseScores = [100, 150, 200, 300, 400, 550, 700, 900, 1100, 1500];
      const baseScore = level <= 10 ? baseScores[level - 1] : 1500 + (level - 10) * 250;
      const doorMult = doorCount === 2 ? 1 : doorCount === 3 ? 1.25 : doorCount === 4 ? 1.5 : doorCount === 5 ? 1.75 : 2.0;
      const streakMult = nextStreak >= 7 ? 2.0 : nextStreak >= 5 ? 1.5 : nextStreak >= 3 ? 1.25 : 1.0;
      const gained = Math.round(baseScore * doorMult * streakMult);
      const xp = level * 15;
      processPickResult(true, safeIdx, gained, xp, nextStreak, level === 10);
    } else {
      processPickResult(false, safeIdx, 0, 0, 0, false);
    }
  };

  /**
   * Process the validated outcome (SAFE or DANGER)
   */
  const processPickResult = (
    isSafe: boolean,
    safeIdx: number,
    scoreGained: number,
    xpGained: number,
    newStreak: number,
    isLevel10Complete?: boolean
  ) => {
    setRevealedSafeIndex(safeIdx);

    // Update doors with final safe/danger flags
    setDoors((prev) =>
      prev.map((d, i) => ({
        ...d,
        isOpen: i === selectedDoorIndex || i === safeIdx,
        isSafe: i === safeIdx,
      }))
    );

    if (isSafe) {
      // --- SAFE ESCAPE ---
      setGameState('SUCCESS');
      soundFx.playSafeDoor();
      soundFx.playStreak(newStreak);

      setLastScoreGained(scoreGained);
      setLastXpGained(xpGained);
      const newTotalScore = score + scoreGained;
      const newEscapes = doorsEscapedCount + 1;
      setScore(newTotalScore);
      setStreak(newStreak);
      setDoorsEscapedCount(newEscapes);

      // Best records update
      if (newTotalScore > bestScore) {
        setBestScore(newTotalScore);
      }
      if (level > bestLevel) {
        setBestLevel(level);
        if (typeof window !== 'undefined') {
          localStorage.setItem('escape_door_best_level', level.toString());
        }
      }
      if (newStreak > bestStreak) {
        setBestStreak(newStreak);
        if (typeof window !== 'undefined') {
          localStorage.setItem('escape_door_best_streak', newStreak.toString());
        }
      }

      // Confetti burst for safe choice
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#00F0FF', '#10B981', '#34D399', '#FBBF24'],
        });
      } catch {
        // Confetti fallback
      }

      // Check Level 10 completion
      if (level === 10 && !isEndless) {
        setTimeout(() => {
          soundFx.playVictory();
          setGameState('COMPLETED');
          setIsProcessing(false);
          submitRunResult(newTotalScore, true, 10);
        }, 1600);
      } else {
        // Automatically advance to next level after brief celebration
        setTimeout(() => {
          const nextLevel = level + 1;
          requestLevelRound(nextLevel, sessionId, isEndless);
        }, 1500);
      }
    } else {
      // --- DANGER TRAP ---
      setGameState('DANGER');
      soundFx.playDangerDoor();

      // Trigger screen shake
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 500);

      // Transition to GAME OVER after revealing the true safe door
      setTimeout(() => {
        soundFx.playGameOver();
        setGameState('GAME_OVER');
        setIsProcessing(false);
        submitRunResult(score, false, level);
      }, 1800);
    }
  };

  /**
   * Final Score & XP submission via Vibe Arena anti-cheat pipeline
   */
  const submitRunResult = async (finalScore: number, isWin: boolean, finalLvl: number) => {
    try {
      // 1. Submit session finish
      await GameSessionManager.finishSession(finalScore, isWin, user, bestScore, {
        doorsEscaped: doorsEscapedCount,
        finalLevel: finalLvl,
        bestStreak,
      });

      // 2. Submit score to Vibe Arena App Store & Leaderboard
      await submitGameScore('escape-door', finalScore, isWin);

      // Update local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('escape_door_last_score', finalScore.toString());
        const currentBest = parseInt(localStorage.getItem('escape_door_best_score') || '0', 10);
        if (finalScore > currentBest) {
          localStorage.setItem('escape_door_best_score', finalScore.toString());
        }
      }
    } catch (err) {
      console.warn('Score submission note:', err);
    }
  };

  // Keyboard shortcut listener for fast accessibility (keys 1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING' && gameState !== 'ENDLESS') return;
      if (isProcessing) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= doorCount) {
        handleDoorClick(num - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isProcessing, doorCount]);

  if (!isMounted) return null;

  // Door grid CSS layout calculation based on count
  const getGridClasses = () => {
    switch (doorCount) {
      case 2:
        return 'grid grid-cols-2 max-w-md mx-auto gap-4 sm:gap-6';
      case 3:
        return 'grid grid-cols-1 sm:grid-cols-3 max-w-2xl mx-auto gap-3 sm:gap-5';
      case 4:
        return 'grid grid-cols-2 max-w-xl mx-auto gap-3 sm:gap-5';
      case 5:
        return 'grid grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto gap-3 sm:gap-4';
      case 6:
        return 'grid grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto gap-3 sm:gap-4';
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 max-w-2xl mx-auto gap-3 sm:gap-4';
    }
  };

  return (
    <div
      className={`relative w-full min-h-[580px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-[#070a10] via-[#0a0f18] to-[#040609] border border-[#00F0FF]/25 shadow-2xl transition-all duration-300 ${
        screenShake ? 'animate-[shake_0.4s_ease-in-out]' : ''
      }`}
      style={{
        boxShadow: '0 0 50px rgba(0, 240, 255, 0.08), inset 0 0 80px rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Background Cyber Chamber Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(0, 240, 255, 0.25) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* ============================================================== */}
      {/* TOP ARENA HUD (Active during PLAYING / SUCCESS / DANGER)        */}
      {/* ============================================================== */}
      {(gameState === 'PLAYING' ||
        gameState === 'DOOR_SELECTED' ||
        gameState === 'SUCCESS' ||
        gameState === 'DANGER' ||
        gameState === 'ENDLESS') && (
        <div className="relative z-20 p-4 sm:p-5 border-b border-white/[0.08] bg-[#090d15]/85 backdrop-blur-md">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Level & Lives */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-[#00F0FF]/30 text-white shadow-inner">
                <span className="text-sm">🚪</span>
                <span className="text-xs sm:text-sm font-black font-display tracking-wider text-[#00F0FF]">
                  {isEndless ? `ENDLESS LVL ${level}` : `LEVEL ${level} / 10`}
                </span>
              </div>

              <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                <span>1 LIFE</span>
              </div>
            </div>

            {/* Streak Indicator */}
            {streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-lg animate-bounce">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{streak} STREAK</span>
                <span className="text-[10px] text-yellow-200 bg-amber-500/30 px-1.5 py-0.5 rounded">
                  {streak >= 7 ? '2.0x' : streak >= 5 ? '1.5x' : streak >= 3 ? '1.25x' : '1.0x'}
                </span>
              </div>
            )}

            {/* Score & Audio Controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30 shadow-inner">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-gray-400 font-mono">SCORE:</span>
                <span className="text-xs sm:text-sm font-black text-amber-300 font-display">
                  {score.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handleToggleMute}
                className="p-2 rounded-xl bg-slate-900 border border-gray-800 hover:border-[#00F0FF]/50 text-gray-400 hover:text-[#00F0FF] transition-all cursor-pointer"
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                aria-label="Toggle Audio Mute"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              </button>
            </div>
          </div>

          {/* Progress Bar (Levels 1 to 10) */}
          {!isEndless && (
            <div className="max-w-4xl mx-auto mt-3 pt-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                <span>CHAMBER PROGRESS</span>
                <span>{Math.min(100, Math.round((level / 10) * 100))}% ESCAPED</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-gray-800 flex">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 h-full border-r border-slate-950 last:border-0 transition-all duration-500 ${
                      idx + 1 < level
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                        : idx + 1 === level
                        ? 'bg-[#00F0FF] animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.9)]'
                        : 'bg-slate-800/60'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. START SCREEN (IDLE)                                         */}
      {/* ============================================================== */}
      {gameState === 'IDLE' && (
        <div className="relative z-10 p-6 sm:p-12 flex flex-col items-center justify-center min-h-[560px] text-center space-y-6">
          {/* Main Title Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-xs font-mono text-[#00F0FF] shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEW ARENA CASUAL RELEASE</span>
          </div>

          {/* Door Animated Icon */}
          <div className="relative group cursor-pointer" onClick={() => handleStartGame(false)}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#00F0FF]/20 via-purple-600/20 to-pink-500/20 border-2 border-[#00F0FF]/50 flex items-center justify-center text-5xl sm:text-6xl shadow-[0_0_40px_rgba(0,240,255,0.25)] transform transition-transform group-hover:scale-105 group-hover:rotate-2">
              🚪
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-slate-900 border border-[#00F0FF]/50 text-[10px] font-mono text-cyan-300 whitespace-nowrap shadow">
              CHOOSE WISELY
            </div>
          </div>

          <div className="space-y-2 max-w-lg">
            <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight drop-shadow-md">
              ESCAPE FROM THE DOOR
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
              &quot;One door. One escape. Choose wisely.&quot;
            </p>
            <p className="text-[11px] text-gray-500 font-mono">
              Multiple mystery portals stand before you. Exactly <span className="text-emerald-400 font-bold">ONE</span> leads to safety. All others are instant danger.
            </p>
          </div>

          {/* Stored Real User Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full max-w-md pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center shadow-lg">
              <Trophy className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[10px] font-mono text-gray-400 uppercase">BEST SCORE</span>
              <span className="text-base sm:text-lg font-black text-amber-300 font-display">
                {bestScore.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center shadow-lg">
              <Crown className="w-4 h-4 text-[#00F0FF] mb-1" />
              <span className="text-[10px] font-mono text-gray-400 uppercase">BEST LEVEL</span>
              <span className="text-base sm:text-lg font-black text-[#00F0FF] font-display">
                {bestLevel} / 10
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center shadow-lg">
              <Flame className="w-4 h-4 text-orange-400 mb-1" />
              <span className="text-[10px] font-mono text-gray-400 uppercase">BEST STREAK</span>
              <span className="text-base sm:text-lg font-black text-orange-400 font-display">
                🔥 {bestStreak}
              </span>
            </div>
          </div>

          {/* Play CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => handleStartGame(false)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>PLAY NOW</span>
            </button>

            <Link
              href="/leaderboard"
              onClick={() => soundFx.playClick()}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-gray-300 hover:text-amber-400 text-xs font-bold font-mono transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>LEADERBOARD</span>
            </Link>
          </div>

          {/* Anti-cheat audit note */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/90 pt-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cryptographically Sealed Safe Door • Anti-Tamper Server Authority</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. PLAYING / ACTIVE LEVEL SCREEN                              */}
      {/* ============================================================== */}
      {(gameState === 'PLAYING' ||
        gameState === 'DOOR_SELECTED' ||
        gameState === 'SUCCESS' ||
        gameState === 'DANGER' ||
        gameState === 'ENDLESS') && (
        <div className="relative z-10 p-4 sm:p-8 flex flex-col items-center justify-center min-h-[460px] space-y-6">
          {/* Status Header Message */}
          <div className="text-center space-y-1">
            {gameState === 'SUCCESS' ? (
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-display font-black text-sm sm:text-base animate-bounce shadow-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SAFE! YOU ESCAPED!</span>
                <span className="text-xs font-mono text-emerald-200">
                  (+{lastScoreGained} PTS • +{lastXpGained} XP)
                </span>
              </div>
            ) : gameState === 'DANGER' ? (
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-display font-black text-sm sm:text-base animate-pulse shadow-lg">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>DANGER! THE DOOR WAS A TRAP!</span>
              </div>
            ) : (
              <>
                <h2 className="text-lg sm:text-2xl font-black text-white font-display tracking-tight flex items-center justify-center gap-2">
                  <span>CHOOSE YOUR ESCAPE DOOR</span>
                </h2>
                <p className="text-xs text-gray-400 font-mono">
                  {doorCount} Mystery Portals • Exactly 1 Safe Exit • {Math.round((1 / doorCount) * 100)}% Odds
                </p>
              </>
            )}
          </div>

          {/* Interactive Doors Grid */}
          <div className={`w-full ${getGridClasses()} py-2`}>
            {doors.map((door) => {
              const isSelected = selectedDoorIndex === door.id;
              const isRevealedSafe = revealedSafeIndex === door.id;
              const isDangerChosen = isSelected && gameState === 'DANGER';

              return (
                <div
                  key={door.id}
                  onClick={() => handleDoorClick(door.id)}
                  onMouseEnter={() => {
                    if (gameState === 'PLAYING' || gameState === 'ENDLESS') {
                      soundFx.playDoorHover();
                    }
                  }}
                  className={`relative group h-48 sm:h-56 rounded-2xl p-1 cursor-pointer transition-all duration-300 transform ${
                    gameState === 'PLAYING' || gameState === 'ENDLESS'
                      ? 'hover:-translate-y-2 hover:scale-[1.02] active:scale-95'
                      : 'cursor-default'
                  } ${
                    isSelected && isDangerChosen
                      ? 'ring-2 ring-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]'
                      : isRevealedSafe
                      ? 'ring-2 ring-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.7)]'
                      : 'hover:shadow-[0_0_25px_rgba(0,240,255,0.3)]'
                  }`}
                  style={{ perspective: '1000px' }}
                >
                  {/* Outer Door Frame with metallic borders */}
                  <div
                    className={`relative w-full h-full rounded-2xl overflow-hidden flex flex-col justify-between p-3.5 border transition-all duration-500 ${
                      isRevealedSafe
                        ? 'bg-gradient-to-b from-emerald-950/80 via-slate-900 to-emerald-950/90 border-emerald-400/80'
                        : isDangerChosen
                        ? 'bg-gradient-to-b from-rose-950/80 via-slate-900 to-rose-950/90 border-rose-500/80'
                        : isSelected
                        ? 'bg-slate-900 border-[#00F0FF] shadow-lg'
                        : 'bg-gradient-to-b from-[#101726]/90 via-[#0a0f18]/95 to-[#070b12] border-slate-800 hover:border-[#00F0FF]/60'
                    }`}
                  >
                    {/* Top Door Header */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-mono font-bold text-gray-400 group-hover:text-[#00F0FF] transition-colors">
                        {door.label}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-cyan-400/60 group-hover:bg-[#00F0FF] transition-colors shadow-sm" />
                    </div>

                    {/* Center Door Portal Visual / Mystery Runes */}
                    <div className="flex flex-col items-center justify-center my-auto space-y-2">
                      {/* Animated Door Graphic or Revealed Outcome */}
                      {door.isOpen ? (
                        isRevealedSafe ? (
                          <div className="flex flex-col items-center space-y-1 animate-[bounce_0.6s_ease-out]">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(52,211,153,0.6)]">
                              ✨
                            </div>
                            <span className="text-[11px] font-black font-display text-emerald-300 uppercase tracking-wider">
                              SAFE EXIT
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-1 animate-pulse">
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/30 border border-rose-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(244,63,94,0.6)]">
                              💥
                            </div>
                            <span className="text-[11px] font-black font-display text-rose-300 uppercase tracking-wider">
                              LETHAL TRAP
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center space-y-1.5">
                          {/* Portal Rune Ring */}
                          <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-cyan-500/30 group-hover:border-[#00F0FF] flex items-center justify-center text-2xl text-cyan-300 shadow-inner group-hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all">
                            🚪
                          </div>
                          <span className="text-[9px] font-mono text-gray-500 group-hover:text-cyan-300 transition-colors uppercase tracking-widest">
                            SEALED
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status / Selection Prompt */}
                    <div className="w-full text-center pt-1 border-t border-white/[0.05]">
                      {isRevealedSafe ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>SURVIVAL</span>
                        </span>
                      ) : isDangerChosen ? (
                        <span className="text-[10px] font-mono font-bold text-rose-400 flex items-center justify-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>TRAPPED</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-gray-500 group-hover:text-white transition-colors">
                          CLICK TO ENTER
                        </span>
                      )}
                    </div>

                    {/* Subtle Neon Edge Accents */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF]/40 to-transparent group-hover:via-[#00F0FF] transition-all" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick keyboard instruction tip */}
          <div className="text-[10px] font-mono text-gray-500 flex items-center gap-1.5">
            <Info className="w-3 h-3 text-[#00F0FF]" />
            <span>Tip: You can tap doors or press keys [1 to {doorCount}] on your keyboard!</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. GAME OVER SCREEN                                            */}
      {/* ============================================================== */}
      {gameState === 'GAME_OVER' && (
        <div className="relative z-10 p-6 sm:p-12 flex flex-col items-center justify-center min-h-[560px] text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-rose-950/70 border border-rose-500/50 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-pulse">
            💀
          </div>

          <div className="space-y-1 max-w-md">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
              GAME OVER
            </h2>
            <p className="text-xs sm:text-sm text-rose-300 font-sans">
              The door was a trap! Only one path was safe.
            </p>
            {selectedDoorIndex !== null && revealedSafeIndex !== null && (
              <p className="text-[11px] font-mono text-gray-400 pt-1">
                You chose <span className="text-rose-400 font-bold">Door {selectedDoorIndex + 1}</span>, but{' '}
                <span className="text-emerald-400 font-bold">Door {revealedSafeIndex + 1}</span> was the true safe exit.
              </p>
            )}
          </div>

          {/* Final Match Stats Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-lg">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center shadow">
              <span className="text-[9px] font-mono text-gray-400 uppercase">LEVEL REACHED</span>
              <span className="text-lg font-black text-white font-display">{level}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center shadow">
              <span className="text-[9px] font-mono text-gray-400 uppercase">FINAL SCORE</span>
              <span className="text-lg font-black text-[#00F0FF] font-display">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center shadow">
              <span className="text-[9px] font-mono text-gray-400 uppercase">DOORS ESCAPED</span>
              <span className="text-lg font-black text-emerald-400 font-display">
                {doorsEscapedCount}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col items-center shadow">
              <span className="text-[9px] font-mono text-gray-400 uppercase">BEST LEVEL</span>
              <span className="text-lg font-black text-amber-400 font-display">{bestLevel}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleStartGame(false)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>PLAY AGAIN</span>
            </button>

            <Link
              href="/leaderboard"
              onClick={() => soundFx.playClick()}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>LEADERBOARD</span>
            </Link>

            <Link
              href="/games"
              onClick={() => soundFx.playClick()}
              className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-gray-300 hover:text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>ALL VIBES</span>
            </Link>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. LEVEL 10 COMPLETE / VICTORY SCREEN                          */}
      {/* ============================================================== */}
      {gameState === 'COMPLETED' && (
        <div className="relative z-10 p-6 sm:p-12 flex flex-col items-center justify-center min-h-[560px] text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400/30 via-emerald-400/30 to-[#00F0FF]/30 border-2 border-amber-400 flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(251,191,36,0.5)] animate-bounce">
            🏆
          </div>

          <div className="space-y-1.5 max-w-md">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>LEVEL 10 MASTER REACHED</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight">
              YOU ESCAPED!
            </h2>
            <p className="text-sm text-gray-300 font-sans">
              &quot;You&apos;re officially a Door Master.&quot;
            </p>
            <p className="text-xs text-emerald-400 font-mono">
              You navigated all 10 deadly chambers with pure intuition and instinct.
            </p>
          </div>

          {/* Victory Rewards */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/40 flex flex-col items-center shadow-lg">
              <span className="text-[10px] font-mono text-gray-400 uppercase">FINAL SCORE</span>
              <span className="text-xl font-black text-amber-300 font-display">
                {score.toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 flex flex-col items-center shadow-lg">
              <span className="text-[10px] font-mono text-gray-400 uppercase">TOTAL XP</span>
              <span className="text-xl font-black text-indigo-400 font-display">
                +{(doorsEscapedCount * 75).toLocaleString()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-orange-500/40 flex flex-col items-center shadow-lg">
              <span className="text-[10px] font-mono text-gray-400 uppercase">BEST STREAK</span>
              <span className="text-xl font-black text-orange-400 font-display">🔥 {bestStreak}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setIsEndless(true);
                const nextLevel = 11;
                requestLevelRound(nextLevel, sessionId, true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(217,70,239,0.4)] flex items-center gap-2 transform active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>CONTINUE IN ENDLESS MODE 🔥</span>
            </button>

            <button
              onClick={() => handleStartGame(false)}
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>PLAY AGAIN</span>
            </button>

            <Link
              href="/leaderboard"
              onClick={() => soundFx.playClick()}
              className="px-5 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>VIEW LEADERBOARD</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
