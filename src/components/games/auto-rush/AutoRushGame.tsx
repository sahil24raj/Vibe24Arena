'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameScreen, PlayerControlsInput, RaceSettings, VehicleConfig } from './engine/types';
import { INITIAL_VEHICLES, TRACKS_CATALOG } from './engine/constants';
import { VehicleController } from './engine/VehicleController';
import { AIOpponentManager } from './engine/AIOpponentManager';
import { ThreeRaceEngine } from './engine/ThreeRaceEngine';
import { RaceAudio } from './engine/RaceAudio';

import { AutoRushMainMenu } from './ui/AutoRushMainMenu';
import { AutoRushGarage } from './ui/AutoRushGarage';
import { AutoRushRaceSetup } from './ui/AutoRushRaceSetup';
import { AutoRushHUD } from './ui/AutoRushHUD';
import { AutoRushMobileControls } from './ui/AutoRushMobileControls';
import { AutoRushPodiumModal } from './ui/AutoRushPodiumModal';
import { AutoRushMultiplayerModal } from './ui/AutoRushMultiplayerModal';

import { useAppStore } from '@/store/useAppStore';
import { RotateCw, HelpCircle, X, Sparkles, Volume2, VolumeX } from 'lucide-react';

export const AutoRushGame: React.FC = () => {
  const { addCoins, addXP } = useAppStore();

  const [screen, setScreen] = useState<GameScreen>('menu');
  const [currentVehicle, setCurrentVehicle] = useState<VehicleConfig>(INITIAL_VEHICLES[0]);
  const [raceSettings, setRaceSettings] = useState<RaceSettings>({
    trackId: 'cyber',
    laps: 3,
    difficulty: 'normal',
    timeOfDay: 'sunset',
    weather: 'clear'
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);

  // Live Race State
  const [countdown, setCountdown] = useState<number | null>(null);
  const [playerPosition, setPlayerPosition] = useState(1);
  const [isOffRoad, setIsOffRoad] = useState(false);
  const [raceTotalTime, setRaceTotalTime] = useState(0);

  // Multiplayer Room State
  const [roomPin, setRoomPin] = useState<string | null>(null);

  // References
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeEngineRef = useRef<ThreeRaceEngine | null>(null);
  const playerControllerRef = useRef<VehicleController | null>(null);
  const aiOpponentManagerRef = useRef<AIOpponentManager | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Player controls buffer
  const controlsRef = useRef<PlayerControlsInput>({
    throttle: 0,
    brake: 0,
    steer: 0,
    drift: false,
    nitro: false,
    horn: false,
    recover: false
  });

  // Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'm' || e.key === 'M') {
        setIsMuted(prev => {
          const next = !prev;
          RaceAudio.getInstance().setMuted(next);
          return next;
        });
      }
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (screen === 'race') setIsPaused(p => !p);
      }
      if (e.key === 'h' || e.key === 'H') {
        RaceAudio.getInstance().playHorn();
      }
      if (e.key === 'c' || e.key === 'C') {
        if (threeEngineRef.current) {
          const modes: Array<'chase' | 'hood' | 'bumper'> = ['chase', 'hood', 'bumper'];
          const curIdx = modes.indexOf(threeEngineRef.current.cameraMode);
          threeEngineRef.current.cameraMode = modes[(curIdx + 1) % modes.length];
        }
      }

      // Driving Keys
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') controlsRef.current.throttle = 1;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') controlsRef.current.brake = 1;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') controlsRef.current.steer = -1;
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') controlsRef.current.steer = 1;
      if (e.key === 'Shift') controlsRef.current.drift = true;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        controlsRef.current.nitro = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') controlsRef.current.throttle = 0;
      if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') controlsRef.current.brake = 0;
      if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
        if (controlsRef.current.steer === -1) controlsRef.current.steer = 0;
      }
      if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
        if (controlsRef.current.steer === 1) controlsRef.current.steer = 0;
      }
      if (e.key === 'Shift') controlsRef.current.drift = false;
      if (e.key === ' ' || e.code === 'Space') controlsRef.current.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen, toggleFullscreen]);

  // Orientation Check
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

  // Launch Race Experience
  const startRace = (settings: RaceSettings) => {
    setRaceSettings(settings);
    setScreen('race');
    setIsPaused(false);
    setCountdown(3);
    setRaceTotalTime(0);

    const track = TRACKS_CATALOG.find(t => t.id === settings.trackId) || TRACKS_CATALOG[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Initialize 3D Engine
    if (threeEngineRef.current) {
      threeEngineRef.current.dispose();
    }
    const threeEngine = new ThreeRaceEngine(canvas, track, settings);
    threeEngineRef.current = threeEngine;

    // 2. Spawn Player Controller at Grid Position 1 (Pole position)
    const spline = threeEngine.trackManager.spline;
    const startPt = spline.getPointAt(0);
    const tangent = spline.getTangentAt(0).normalize();
    const startYaw = Math.atan2(tangent.x, tangent.z);

    const playerController = new VehicleController(currentVehicle, startPt.x, startPt.z, startYaw);
    playerControllerRef.current = playerController;
    threeEngine.setupPlayerVehicle(currentVehicle);

    // 3. Spawn 7 AI Rivals
    const aiManager = new AIOpponentManager(threeEngine.trackManager, settings.difficulty);
    aiOpponentManagerRef.current = aiManager;
    threeEngine.setupAIVehicles(aiManager.opponents);

    // 4. Start 2-Stroke Audio Engine
    RaceAudio.getInstance().startEngine();

    // 5. Run 3-2-1-GO Countdown Sequence
    RaceAudio.getInstance().playCountdownTone(false);
    let count = 3;
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
        RaceAudio.getInstance().playCountdownTone(false);
      } else if (count === 0) {
        setCountdown(0);
        RaceAudio.getInstance().playCountdownTone(true);
      } else {
        setCountdown(null);
        clearInterval(timer);
      }
    }, 900);

    lastTimeRef.current = performance.now();
  };

  // Main 60FPS Physics & Rendering Loop
  useEffect(() => {
    if (screen !== 'race') {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      RaceAudio.getInstance().stopEngine();
      return;
    }

    let isRunning = true;

    const gameLoop = (time: number) => {
      if (!isRunning) return;

      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.08);
      lastTimeRef.current = time;

      const player = playerControllerRef.current;
      const aiManager = aiOpponentManagerRef.current;
      const threeEngine = threeEngineRef.current;

      if (player && threeEngine && !isPaused) {
        // Freeze input during 3-2-1 countdown
        const activeInput = countdown !== null ? {
          throttle: 0,
          brake: 0,
          steer: 0,
          drift: false,
          nitro: false,
          horn: false,
          recover: false
        } : controlsRef.current;

        // Step Player Vehicle Physics
        player.update(delta, activeInput);
        setRaceTotalTime(t => t + delta);

        // Check Track Bounds (Off-road penalty)
        const offRoad = threeEngine.trackManager.isOffRoad(player.state.x, player.state.z);
        setIsOffRoad(offRoad);
        if (offRoad && player.state.speedKmh > 35) {
          player.state.vx *= 0.94;
          player.state.vz *= 0.94;
        }

        // Update Lap and Checkpoint Progression
        const lapProgress = threeEngine.trackManager.updateRacerProgress(
          player.state.x,
          player.state.z,
          player.state.currentCheckpoint,
          player.state.lap,
          raceSettings.laps
        );

        player.state.currentCheckpoint = lapProgress.nextCheckpoint;
        if (lapProgress.isLapCompleted) {
          player.state.lapTimes.push(player.state.currentLapTime);
          if (player.state.bestLapTime === 0 || player.state.currentLapTime < player.state.bestLapTime) {
            player.state.bestLapTime = player.state.currentLapTime;
          }
          player.state.currentLapTime = 0;
        }
        player.state.lap = lapProgress.nextLap;
        player.state.isFinished = lapProgress.isRaceFinished;

        // Step AI Rivals
        if (aiManager && countdown === null) {
          aiManager.update(delta, raceSettings.laps);
        }

        // Calculate Dynamic Race Position (1st to 8th)
        if (aiManager) {
          const allRacers = [
            { id: 'player', lap: player.state.lap, cp: player.state.currentCheckpoint },
            ...aiManager.opponents.map(o => ({ id: o.participant.id, lap: o.controller.state.lap, cp: o.controller.state.currentCheckpoint }))
          ];
          allRacers.sort((a, b) => {
            if (a.lap !== b.lap) return b.lap - a.lap;
            return b.cp - a.cp;
          });
          const playerRank = allRacers.findIndex(r => r.id === 'player') + 1;
          setPlayerPosition(playerRank);
        }

        // Audio Pitch Modulation
        RaceAudio.getInstance().updateEnginePitch(player.state.rpm, player.state.isNitroActive);

        // Render 3D Scene
        const aiStates = aiManager ? aiManager.opponents.map(o => ({ id: o.participant.id, state: o.controller.state })) : [];
        threeEngine.update(delta, player.state, aiStates);

        // Check Race Completion
        if (player.state.isFinished) {
          isRunning = false;
          RaceAudio.getInstance().playFinishCheer();
          setTimeout(() => {
            const coinsEarned = playerPosition === 1 ? 350 : (playerPosition <= 3 ? 200 : 80);
            addCoins(coinsEarned);
            addXP(300);
            setScreen('podium');
          }, 1500);
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      RaceAudio.getInstance().stopEngine();
    };
  }, [screen, isPaused, countdown, raceSettings.laps, playerPosition, addCoins, addXP]);

  // Mobile Control Patches
  const handleMobileControl = (patch: Partial<PlayerControlsInput>) => {
    controlsRef.current = { ...controlsRef.current, ...patch };
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full bg-[#060B1E] flex items-center justify-center select-none font-sans transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-[9999] w-screen h-screen rounded-none border-0'
          : 'h-[620px] max-h-[88vh] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
      }`}
    >
      {/* Mobile Orientation Prompt */}
      {isPortrait && (
        <div className="absolute inset-0 z-50 bg-[#060B1E] flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
          <RotateCw className="w-12 h-12 text-[#FF9933] animate-spin" />
          <h3 className="text-2xl font-black uppercase text-[#FFD700]">ROTATE TO LANDSCAPE</h3>
          <p className="text-sm text-gray-300 max-w-xs">
            AUTO RUSH 3D is engineered for horizontal 16:9 arcade street racing.
          </p>
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-contain block bg-[#0B1536]"
      />

      {/* Screen 1: Main Menu */}
      {screen === 'menu' && (
        <AutoRushMainMenu
          currentVehicle={currentVehicle}
          onStartRace={() => setScreen('setup')}
          onOpenGarage={() => setScreen('garage')}
          onOpenMultiplayer={() => setScreen('multiplayer')}
          onOpenHelp={() => setShowHelpModal(true)}
          isMuted={isMuted}
          onToggleMute={() => {
            setIsMuted(prev => {
              const next = !prev;
              RaceAudio.getInstance().setMuted(next);
              return next;
            });
          }}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Screen 2: 3D Garage */}
      {screen === 'garage' && (
        <AutoRushGarage
          currentVehicle={currentVehicle}
          onSelectVehicle={veh => {
            setCurrentVehicle(veh);
            setScreen('menu');
          }}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* Screen 3: Race Setup */}
      {screen === 'setup' && (
        <AutoRushRaceSetup
          onStartRace={startRace}
          onBack={() => setScreen('menu')}
        />
      )}

      {/* Screen 4: Live Race HUD & Mobile Controls */}
      {screen === 'race' && playerControllerRef.current && (
        <>
          <AutoRushHUD
            playerState={playerControllerRef.current.state}
            totalLaps={raceSettings.laps}
            position={playerPosition}
            totalRacers={8}
            countdown={countdown}
            isOffRoad={isOffRoad}
            onPause={() => setIsPaused(p => !p)}
            onToggleCamera={() => {
              if (threeEngineRef.current) {
                const modes: Array<'chase' | 'hood' | 'bumper'> = ['chase', 'hood', 'bumper'];
                const curIdx = modes.indexOf(threeEngineRef.current.cameraMode);
                threeEngineRef.current.cameraMode = modes[(curIdx + 1) % modes.length];
              }
            }}
            onHorn={() => RaceAudio.getInstance().playHorn()}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />

          <AutoRushMobileControls
            onControlChange={handleMobileControl}
            isNitroAvailable={playerControllerRef.current.state.nitroRemaining > 15}
          />
        </>
      )}

      {/* Screen 5: Podium Celebration Modal */}
      {screen === 'podium' && playerControllerRef.current && (
        <AutoRushPodiumModal
          position={playerPosition}
          totalRacers={8}
          bestLapTime={playerControllerRef.current.state.bestLapTime}
          totalRaceTime={raceTotalTime}
          onRematch={() => startRace(raceSettings)}
          onGarage={() => setScreen('garage')}
          onMenu={() => setScreen('menu')}
        />
      )}

      {/* Screen 6: Multiplayer Room Modal */}
      {screen === 'multiplayer' && (
        <AutoRushMultiplayerModal
          onHostRoom={() => {
            const pin = Math.floor(1000 + Math.random() * 9000).toString();
            setRoomPin(pin);
          }}
          onJoinRoom={pin => {
            setRoomPin(pin);
          }}
          onStartRace={() => startRace(raceSettings)}
          onBack={() => {
            setRoomPin(null);
            setScreen('menu');
          }}
          roomPin={roomPin}
          currentVehicle={currentVehicle}
        />
      )}

      {/* Pause Menu Modal */}
      {isPaused && screen === 'race' && (
        <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-[#0B1536] border-2 border-[#FFD700] rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <h3 className="text-2xl font-black uppercase text-white tracking-wider">
              PAUSED · रुका हुआ
            </h3>
            <p className="text-xs text-gray-300">Take a breath, adjust your mirrors!</p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsPaused(false)}
                className="w-full py-3 bg-gradient-to-r from-[#FF9933] to-[#FFD700] text-black font-black text-sm rounded-xl shadow-lg transition-all"
              >
                RESUME RACE (जारी रखें)
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  startRace(raceSettings);
                }}
                className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs rounded-xl transition-all"
              >
                RESTART (पुनः प्रारंभ)
              </button>
              <button
                onClick={() => {
                  setIsPaused(false);
                  setScreen('menu');
                }}
                className="w-full py-2.5 bg-red-950/60 hover:bg-red-900/60 border border-red-500/30 text-red-300 font-black text-xs rounded-xl transition-all"
              >
                QUIT TO MENU (बाहर निकलें)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls & Help Modal */}
      {showHelpModal && (
        <div className="absolute inset-0 z-50 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0B1536] border-2 border-[#00D2FF] rounded-3xl p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-cyan-300 font-black text-lg uppercase">
                <HelpCircle className="w-5 h-5" /> CONTROLS & RULES
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-1 bg-white/10 hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-1.5 font-mono">
                <div className="text-amber-300 font-bold">KEYBOARD CONTROLS:</div>
                <div>• W / ↑ : Accelerate (गैस दबाएं)</div>
                <div>• S / ↓ : Brake & Reverse (ब्रेक / पीछे)</div>
                <div>• A / D or ← / → : Steering (मोड़ें)</div>
                <div>• Shift : Drift Mode (ड्रिफ्ट स्लाइड)</div>
                <div>• Space : Nitro Thrust (नाइट्रो बूस्ट)</div>
                <div>• H : Rickshaw Horn (हॉर्न बजाएं)</div>
                <div>• C : Toggle Camera (Chase / Hood / Bumper)</div>
                <div>• F : Fullscreen Mode (पूर्ण स्क्रीन)</div>
              </div>

              <div className="bg-black/40 border border-white/10 rounded-xl p-3 space-y-1 text-gray-300">
                <div className="text-cyan-300 font-bold">GULLY RACING SECRETS:</div>
                <div>• Release throttle before entering sharp hairpins to avoid rolling over.</div>
                <div>• Hold Shift around turns to slide in style and gain exit speed!</div>
                <div>• Save your Nitro for long straightaways past Cyber City flyovers!</div>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-[#00D2FF] to-[#3B82F6] text-black font-black text-xs rounded-xl shadow-md"
            >
              GOT IT! (समझ गए)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
