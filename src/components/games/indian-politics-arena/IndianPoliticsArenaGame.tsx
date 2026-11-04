'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  AIDifficulty,
  ArenaConfig,
  CharacterConfig,
  GameMode,
  MatchStats,
  PlayerInput
} from './engine/types';
import {
  ARENAS_ROSTER,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CHARACTERS_ROSTER
} from './engine/constants';
import { CombatEngine } from './engine/CombatEngine';
import { InputManager } from './engine/InputManager';
import { FightingAudio } from './audio/FightingAudio';
import { LoadingScreen } from './ui/LoadingScreen';
import { MainMenuScreen } from './ui/MainMenuScreen';
import { CharacterSelectScreen } from './ui/CharacterSelectScreen';
import { FightHUD } from './ui/FightHUD';
import { PauseModal } from './ui/PauseModal';
import { VictoryNewspaper } from './ui/VictoryNewspaper';
import { MobileVirtualControls } from './ui/MobileVirtualControls';
import { MultiplayerLobbyModal } from './ui/MultiplayerLobbyModal';
import { useAppStore } from '@/store/useAppStore';
import { RotateCw, X, Shield, Zap, Gauge, Sparkles } from 'lucide-react';

type GameScreen =
  | 'loading'
  | 'menu'
  | 'select'
  | 'fight'
  | 'pause'
  | 'result'
  | 'multiplayer_lobby';

export const IndianPoliticsArenaGame: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>('loading');
  const [mode, setMode] = useState<GameMode>('quick');
  const [selectedP1, setSelectedP1] = useState<CharacterConfig>(CHARACTERS_ROSTER[0]);
  const [selectedP2, setSelectedP2] = useState<CharacterConfig>(CHARACTERS_ROSTER[1]);
  const [selectedArena, setSelectedArena] = useState<ArenaConfig>(ARENAS_ROSTER[0]);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');

  const [matchStats, setMatchStats] = useState<MatchStats | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Multiplayer Room State
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isConnectingRoom, setIsConnectingRoom] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<CombatEngine | null>(null);
  const inputManagerRef = useRef<InputManager | null>(null);
  const reqAnimRef = useRef<number | null>(null);

  const { user, addCoins, addXP } = useAppStore();

  // Check orientation for mobile
  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window !== 'undefined') {
        setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
      }
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Initialize Input Manager
  useEffect(() => {
    const im = new InputManager();
    im.attach();
    inputManagerRef.current = im;
    return () => {
      im.detach();
    };
  }, []);

  // Escape key for pause in fight
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape' && screen === 'fight') {
        if (engineRef.current) {
          engineRef.current.isPaused = true;
          setScreen('pause');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen]);

  // Audio Toggle
  const handleToggleMute = useCallback(() => {
    const muted = FightingAudio.getInstance().toggleMute();
    setIsMuted(muted);
  }, []);

  // Start Combat Loop
  const startCombat = useCallback(
    (
      p1Char: CharacterConfig,
      p2Char: CharacterConfig,
      arena: ArenaConfig,
      diff: AIDifficulty
    ) => {
      setSelectedP1(p1Char);
      setSelectedP2(p2Char);
      setSelectedArena(arena);
      setDifficulty(diff);

      const engine = new CombatEngine(p1Char, p2Char, arena, mode);
      engine.ai.setDifficulty(diff);
      engineRef.current = engine;

      if (inputManagerRef.current) {
        inputManagerRef.current.isTwoPlayerLocal = mode === 'twoplayer';
        inputManagerRef.current.clearAll();
      }

      setMatchStats(engine.getStats());
      setScreen('fight');

      FightingAudio.getInstance().playRoundAnnounce();
      FightingAudio.getInstance().startFightBGM();
    },
    [mode]
  );

  // Main Game Loop (60 FPS)
  useEffect(() => {
    if (screen !== 'fight') {
      if (reqAnimRef.current) {
        cancelAnimationFrame(reqAnimRef.current);
        reqAnimRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const loop = () => {
      if (!isRunning) return;

      const engine = engineRef.current;
      const im = inputManagerRef.current;

      if (engine && im) {
        // Read Inputs
        const p1Input = im.getP1Input();
        const p2Input = mode === 'twoplayer' ? im.getP2Input() : undefined;

        // Step Combat Engine
        engine.update(p1Input, p2Input);

        // Render Canvas
        engine.render(ctx);

        // Update UI Stats
        const currentStats = engine.getStats();
        setMatchStats(currentStats);

        // Check Match Over
        if (currentStats.isOver) {
          isRunning = false;
          // Award XP and coins
          if (currentStats.winner === 1) {
            addCoins(150);
            addXP(200);
          } else {
            addCoins(50);
            addXP(80);
          }
          setTimeout(() => {
            setScreen('result');
          }, 1000);
          return;
        }
      }

      reqAnimRef.current = requestAnimationFrame(loop);
    };

    reqAnimRef.current = requestAnimationFrame(loop);

    return () => {
      isRunning = false;
      if (reqAnimRef.current) {
        cancelAnimationFrame(reqAnimRef.current);
        reqAnimRef.current = null;
      }
    };
  }, [screen, mode, addCoins, addXP]);

  // Rematch
  const handleRematch = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.restartMatch();
      setScreen('fight');
      FightingAudio.getInstance().startFightBGM();
    } else {
      startCombat(selectedP1, selectedP2, selectedArena, difficulty);
    }
  }, [startCombat, selectedP1, selectedP2, selectedArena, difficulty]);

  // Host Online Room
  const handleHostRoom = () => {
    setIsConnectingRoom(true);
    setRoomError(null);
    setTimeout(() => {
      const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      setRoomCode(randomCode);
      setIsConnectingRoom(false);
    }, 600);
  };

  // Join Online Room
  const handleJoinRoom = (code: string) => {
    setIsConnectingRoom(true);
    setRoomError(null);
    setTimeout(() => {
      setIsConnectingRoom(false);
      setScreen('select');
    }, 600);
  };

  return (
    <div className="relative w-full h-[620px] max-h-[88vh] bg-[#060B1E] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center select-none font-sans">
      {/* Mobile Portrait Orientation Prompt */}
      {isPortrait && (
        <div className="absolute inset-0 z-50 bg-[#060B1E] flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
          <RotateCw className="w-12 h-12 text-[#FF9933] animate-spin" />
          <h3 className="text-2xl font-black uppercase text-[#FFD700]">
            ROTATE DEVICE TO LANDSCAPE
          </h3>
          <p className="text-sm text-gray-300 max-w-xs">
            INDIAN POLITICS ARENA is engineered for horizontal 16:9 arcade gameplay.
          </p>
        </div>
      )}

      {/* Primary Game Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain block bg-[#0B1536]"
      />

      {/* Screen 1: Satire Notice & Loading */}
      {screen === 'loading' && (
        <LoadingScreen onAccept={() => setScreen('menu')} />
      )}

      {/* Screen 2: Title / Main Menu */}
      {screen === 'menu' && (
        <MainMenuScreen
          onStartMode={m => {
            setMode(m);
            if (m === 'multiplayer') {
              setScreen('multiplayer_lobby');
            } else {
              setScreen('select');
            }
          }}
          onOpenRoster={() => setShowRosterModal(true)}
          onOpenHelp={() => setShowHelpModal(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Screen 3: Fighter Selection */}
      {screen === 'select' && (
        <CharacterSelectScreen
          mode={mode}
          onConfirmMatch={(p1, p2, arena, diff) => startCombat(p1, p2, arena, diff)}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* Screen 4: Active Fight HUD & Mobile Virtual Controls */}
      {screen === 'fight' && matchStats && (
        <>
          <FightHUD
            p1={selectedP1}
            p2={selectedP2}
            stats={matchStats}
            onPause={() => {
              if (engineRef.current) engineRef.current.isPaused = true;
              setScreen('pause');
            }}
          />

          {/* Virtual Mobile Joystick + Buttons */}
          <MobileVirtualControls
            isSuperReady={matchStats.p1Super >= 100}
            onAction={(action, active) => {
              if (inputManagerRef.current) {
                inputManagerRef.current.setMobileAction(action, active);
              }
            }}
          />
        </>
      )}

      {/* Screen 5: Pause Modal ("Chai Break") */}
      {screen === 'pause' && (
        <PauseModal
          onResume={() => {
            if (engineRef.current) engineRef.current.isPaused = false;
            setScreen('fight');
          }}
          onRestart={handleRematch}
          onQuit={() => {
            FightingAudio.getInstance().stopFightBGM();
            setScreen('menu');
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Screen 6: Victory Newspaper ("The Daily Jumla") */}
      {screen === 'result' && matchStats && (
        <VictoryNewspaper
          winnerChar={matchStats.winner === 1 ? selectedP1 : selectedP2}
          loserChar={matchStats.winner === 1 ? selectedP2 : selectedP1}
          isP1Winner={matchStats.winner === 1}
          onRematch={handleRematch}
          onCharacterSelect={() => {
            FightingAudio.getInstance().stopFightBGM();
            setScreen('select');
          }}
        />
      )}

      {/* Screen 7: Multiplayer Lobby */}
      {screen === 'multiplayer_lobby' && (
        <MultiplayerLobbyModal
          onHostRoom={handleHostRoom}
          onJoinRoom={handleJoinRoom}
          onBack={() => setScreen('menu')}
          roomCode={roomCode}
          isConnecting={isConnectingRoom}
          error={roomError}
        />
      )}

      {/* Optional: Character Roster Stat Viewer Modal */}
      {showRosterModal && (
        <div className="absolute inset-0 z-50 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-4xl w-full bg-[#0B1536] border-2 border-[#FFD700] rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[85vh] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-[#FFD700] font-black text-xl uppercase">
                <Sparkles className="w-5 h-5" /> 8 ORIGINAL SATIRICAL FIGHTERS
              </div>
              <button
                onClick={() => setShowRosterModal(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {CHARACTERS_ROSTER.map(c => (
                <div
                  key={c.id}
                  className="bg-black/40 border border-white/10 rounded-2xl p-4 flex gap-4 items-start"
                >
                  <div className="text-5xl shrink-0 p-2 bg-white/5 rounded-xl border border-white/10">
                    {c.avatarIcon}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-white uppercase">{c.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-amber-300">
                        {c.archetype}
                      </span>
                    </div>
                    <p className="text-xs text-amber-200/90 font-semibold">{c.party}</p>
                    <p className="text-xs text-gray-300">{c.description}</p>
                    <div className="text-[11px] text-[#00D2FF] font-semibold pt-1">
                      ⚡ Special 1: {c.special1Name} · Special 2: {c.special2Name}
                    </div>
                    <div className="text-[11px] text-[#FFD700] font-semibold">
                      🔥 Super: {c.superName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Optional: Controls Guide Modal */}
      {showHelpModal && (
        <div className="absolute inset-0 z-50 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0B1536] border-2 border-[#00D2FF] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-black text-[#00D2FF] uppercase">
                CONTROLS & MOVES GUIDE
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-200">
              <div className="p-3 bg-black/40 rounded-xl space-y-1.5">
                <span className="font-bold text-amber-400 uppercase text-xs block">
                  Keyboard Controls (Desktop)
                </span>
                <p><b>Movement:</b> A / D (or Left / Right Arrow)</p>
                <p><b>Jump:</b> W (or Up Arrow) · <b>Crouch:</b> S (or Down Arrow)</p>
                <p><b>Guard:</b> Hold Backwards (away from opponent)</p>
                <p><b>Punch:</b> J · <b>Kick:</b> K · <b>Grab:</b> I or J + K</p>
                <p><b>Super Move:</b> L or Spacebar (when SHAKTI is 100% full)</p>
                <p><b>Pause:</b> Escape</p>
              </div>

              <div className="p-3 bg-black/40 rounded-xl space-y-1.5">
                <span className="font-bold text-cyan-400 uppercase text-xs block">
                  Combos & Special Moves
                </span>
                <p><b>Triple Punch:</b> J, J, J (Jab → Cross → Rising Uppercut)</p>
                <p><b>Heavy Finish:</b> J, J, K (Jab → Cross → Finisher Strike)</p>
                <p><b>Low Trip:</b> ↓ + J, ↓ + K (Low Jab → Ground Sweep)</p>
                <p><b>Command Special 1:</b> → + J (Forward + Punch)</p>
                <p><b>Command Special 2:</b> → + K (Forward + Kick)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
