'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Gamepad2,
  Flame,
  Zap,
  Radio,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { useAppStore } from '@/store/useAppStore';

interface UnityInstance {
  SetFullscreen: (mode: number) => void;
  SendMessage: (gameObject: string, method: string, param?: string | number) => void;
  Quit: () => Promise<void>;
}

declare global {
  interface Window {
    createUnityInstance?: (
      canvas: HTMLCanvasElement,
      config: Record<string, unknown>,
      onProgress: (progress: number) => void
    ) => Promise<UnityInstance>;
  }
}

export const TruckRunGame: React.FC = () => {
  const { addXP, addCoins } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeHintIndex, setActiveHintIndex] = useState(0);
  const [showMobileControls, setShowMobileControls] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const unityInstanceRef = useRef<UnityInstance | null>(null);
  const activeKeysRef = useRef<Set<string>>(new Set());

  // Desi Truck Loading slogans
  const loadingHints = [
    '🚛 HORN OK PLEASE — BURI NAZAR WALE TERA MOOH KALA!',
    '☕ Warming up cutting chai at Sher-e-Punjab Dhaba...',
    '🛣️ Loading National Highway Grand Trunk Road asphalt...',
    '🔊 Tuning the legendary multi-tone desi musical pressure horn...',
    '⚡ Priming Tata 1613 heavy diesel 6-cylinder turbo engine...',
    '💎 Spawning golden coin streaks and diesel refill stops...'
  ];

  useEffect(() => {
    const hintInterval = setInterval(() => {
      setActiveHintIndex((prev) => (prev + 1) % loadingHints.length);
    }, 2800);
    return () => clearInterval(hintInterval);
  }, [loadingHints.length]);

  // Check if touch / mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setShowMobileControls(isTouch);
    }
  }, []);

  // Initialize Unity WebGL instance
  useEffect(() => {
    let isMounted = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const loaderScriptId = 'unity-truck-run-loader';
    let script = document.getElementById(loaderScriptId) as HTMLScriptElement | null;

    const launchUnity = () => {
      if (!window.createUnityInstance || !canvas || !isMounted) return;

      const buildUrl = '/unity/truck-run/Build';
      const config = {
        dataUrl: `${buildUrl}/truck-run.data`,
        frameworkUrl: `${buildUrl}/truck-run.framework.js`,
        codeUrl: `${buildUrl}/truck-run.wasm`,
        streamingAssetsUrl: 'StreamingAssets',
        companyName: 'VibeArena',
        productName: 'Truck Run',
        productVersion: '1.0.0',
        showBanner: (msg: string, type: string) => {
          console.warn(`[Unity ${type}]`, msg);
          if (type === 'error' && isMounted) {
            // Keep game running or show subtle note
            console.error('[Unity Error Banner]', msg);
          }
        }
      };

      window
        .createUnityInstance(canvas, config, (progress: number) => {
          if (!isMounted) return;
          setLoadProgress(Math.min(Math.round(progress * 100), 100));
        })
        .then((unityInstance) => {
          if (!isMounted) {
            try {
              unityInstance.Quit();
            } catch {
              // noop
            }
            return;
          }
          unityInstanceRef.current = unityInstance;
          setIsLoading(false);
          // Reward player XP on successfully starting the highway run
          addXP(50);
        })
        .catch((error) => {
          console.error('[TruckRun] Unity WebGL initialization error:', error);
          if (isMounted) {
            setLoadError(
              typeof error === 'string'
                ? error
                : error?.message || 'Failed to initialize 3D Highway Engine.'
            );
            setIsLoading(false);
          }
        });
    };

    if (!script) {
      script = document.createElement('script');
      script.id = loaderScriptId;
      script.src = '/unity/truck-run/Build/truck-run.loader.js';
      script.async = true;
      script.onload = () => {
        launchUnity();
      };
      script.onerror = () => {
        if (isMounted) {
          setLoadError('Could not load Truck Run engine scripts.');
          setIsLoading(false);
        }
      };
      document.body.appendChild(script);
    } else {
      if (window.createUnityInstance) {
        launchUnity();
      } else {
        script.addEventListener('load', launchUnity, { once: true });
      }
    }

    return () => {
      isMounted = false;
      if (unityInstanceRef.current) {
        try {
          unityInstanceRef.current.Quit().catch(() => {});
        } catch {
          // noop
        }
        unityInstanceRef.current = null;
      }
    };
  }, [addXP]);

  // Handle Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    soundFx.playClick();
    if (unityInstanceRef.current) {
      unityInstanceRef.current.SetFullscreen(1);
    } else if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  }, []);

  // Listen for native fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Synthetic Keyboard input helper for on-screen touch controls
  const sendKey = useCallback((code: string, key: string, keyCode: number, isDown: boolean) => {
    const canvas = canvasRef.current;
    const target = canvas || window;

    if (isDown) {
      if (activeKeysRef.current.has(code)) return;
      activeKeysRef.current.add(code);
      const event = new KeyboardEvent('keydown', {
        code,
        key,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(event);
      window.dispatchEvent(event);
    } else {
      activeKeysRef.current.delete(code);
      const event = new KeyboardEvent('keyup', {
        code,
        key,
        keyCode,
        which: keyCode,
        bubbles: true,
        cancelable: true
      });
      target.dispatchEvent(event);
      window.dispatchEvent(event);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Game Window Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[82vh] min-h-[420px] rounded-3xl overflow-hidden bg-slate-950 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] select-none"
      >
        {/* Unity Canvas */}
        <canvas
          ref={canvasRef}
          id="unity-canvas"
          tabIndex={1}
          className="w-full h-full block bg-black focus:outline-none cursor-default"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-gradient-to-b from-slate-950 via-[#110e08] to-slate-950 flex flex-col items-center justify-center p-6 text-center">
            {/* Animated Truck Badge */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600/30 via-orange-500/20 to-yellow-400/20 border border-amber-500/40 flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                <span className="text-5xl animate-bounce">🚛</span>
              </div>
              <div className="absolute -bottom-1 -right-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] tracking-wider uppercase font-mono shadow-md">
                3D HIGHWAY
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-yellow-200 font-display tracking-wider uppercase mb-2">
              TRUCK RUN — HORN OK PLEASE!
            </h2>
            <p className="text-xs sm:text-sm font-mono text-amber-200/80 max-w-lg mb-6 h-6 transition-all duration-300">
              {loadingHints[activeHintIndex]}
            </p>

            {/* Progress Bar */}
            <div className="w-full max-w-md space-y-2">
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-amber-500/30 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 rounded-full transition-all duration-200 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                  style={{ width: `${Math.max(loadProgress, 8)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                <span className="text-amber-400 font-bold">LOADING GRAND TRUNK HIGHWAY</span>
                <span className="font-bold text-white">{loadProgress}%</span>
              </div>
            </div>

            {/* Slogan Pill */}
            <div className="mt-8 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Use WASD or Arrow Keys • Space for Pressure Horn</span>
            </div>
          </div>
        )}

        {/* Error Fallback */}
        {loadError && !isLoading && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <span className="text-4xl">⚠️</span>
            <h3 className="text-lg font-bold text-white font-display">Highway Breakdown</h3>
            <p className="text-xs text-amber-300/80 max-w-md font-mono">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>RESTART ENGINE</span>
            </button>
          </div>
        )}

        {/* Top Control Overlay (Visible during game) */}
        {!isLoading && !loadError && (
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-auto">
            {/* Toggle Mobile Controls Overlay */}
            <button
              onClick={() => {
                soundFx.playClick();
                setShowMobileControls((prev) => !prev);
              }}
              className={`p-2 rounded-xl backdrop-blur-md border text-xs font-mono font-bold transition-all cursor-pointer ${
                showMobileControls
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-slate-900/80 text-gray-300 border-slate-700 hover:text-white'
              }`}
              title="Toggle Touch Controls"
            >
              <Gamepad2 className="w-4 h-4" />
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-700 text-gray-300 hover:text-white transition-all cursor-pointer shadow-lg"
              title="Fullscreen Mode"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Touch / Mobile Controls Overlay (For mobile devices or on-screen click) */}
        {!isLoading && !loadError && showMobileControls && (
          <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6">
            {/* Top Bar Banner */}
            <div className="flex justify-between items-center pointer-events-none">
              <div className="px-3 py-1 rounded-full bg-slate-950/80 border border-amber-500/40 text-[10px] font-mono text-amber-300 font-bold backdrop-blur-md">
                DESI CABIN CONTROLS
              </div>
            </div>

            {/* Bottom Row Controls */}
            <div className="flex justify-between items-end w-full pointer-events-none">
              {/* Left / Right Steering Buttons */}
              <div className="flex items-center gap-3 pointer-events-auto">
                <button
                  onPointerDown={() => sendKey('ArrowLeft', 'ArrowLeft', 37, true)}
                  onPointerUp={() => sendKey('ArrowLeft', 'ArrowLeft', 37, false)}
                  onPointerLeave={() => sendKey('ArrowLeft', 'ArrowLeft', 37, false)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-amber-500/40 active:bg-amber-500 active:text-slate-950 text-white flex items-center justify-center transition-transform active:scale-95 shadow-xl select-none"
                  aria-label="Steer Left"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  onPointerDown={() => sendKey('ArrowRight', 'ArrowRight', 39, true)}
                  onPointerUp={() => sendKey('ArrowRight', 'ArrowRight', 39, false)}
                  onPointerLeave={() => sendKey('ArrowRight', 'ArrowRight', 39, false)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-amber-500/40 active:bg-amber-500 active:text-slate-950 text-white flex items-center justify-center transition-transform active:scale-95 shadow-xl select-none"
                  aria-label="Steer Right"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </div>

              {/* Center Horn Button */}
              <div className="pointer-events-auto">
                <button
                  onPointerDown={() => {
                    soundFx.playClick();
                    sendKey('Space', ' ', 32, true);
                  }}
                  onPointerUp={() => sendKey('Space', ' ', 32, false)}
                  onPointerLeave={() => sendKey('Space', ' ', 32, false)}
                  className="px-4 py-3 sm:px-6 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 active:from-yellow-400 active:to-amber-500 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase font-display flex items-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 transition-transform select-none"
                  aria-label="Pressure Horn"
                >
                  <Flame className="w-4 h-4 fill-slate-950" />
                  <span>HORN OK!</span>
                </button>
              </div>

              {/* Right Accelerate / Brake Buttons */}
              <div className="flex flex-col items-center gap-2.5 pointer-events-auto">
                <button
                  onPointerDown={() => sendKey('ArrowUp', 'ArrowUp', 38, true)}
                  onPointerUp={() => sendKey('ArrowUp', 'ArrowUp', 38, false)}
                  onPointerLeave={() => sendKey('ArrowUp', 'ArrowUp', 38, false)}
                  className="w-14 h-12 sm:w-16 sm:h-14 rounded-2xl bg-emerald-600/80 backdrop-blur-md border border-emerald-400/50 active:bg-emerald-400 active:text-slate-950 text-white flex flex-col items-center justify-center transition-transform active:scale-95 shadow-xl select-none font-bold text-[10px]"
                  aria-label="Accelerate"
                >
                  <ChevronUp className="w-5 h-5" />
                  <span>GAS</span>
                </button>
                <button
                  onPointerDown={() => sendKey('ArrowDown', 'ArrowDown', 40, true)}
                  onPointerUp={() => sendKey('ArrowDown', 'ArrowDown', 40, false)}
                  onPointerLeave={() => sendKey('ArrowDown', 'ArrowDown', 40, false)}
                  className="w-14 h-12 sm:w-16 sm:h-14 rounded-2xl bg-rose-600/80 backdrop-blur-md border border-rose-400/50 active:bg-rose-400 active:text-white text-white flex flex-col items-center justify-center transition-transform active:scale-95 shadow-xl select-none font-bold text-[10px]"
                  aria-label="Brake"
                >
                  <ChevronDown className="w-5 h-5" />
                  <span>BRAKE</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Lore & Instructions Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🚛</span>
            <h2 className="text-base font-bold text-white font-display">
              HOW TO PLAY — TRUCK RUN (DESI HIGHWAY RACER)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>POWERED BY UNITY 3D URP ENGINE</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-300">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <span>🛣️</span>
              <span>STEER & DODGE TRAFFIC</span>
            </div>
            <p className="text-gray-400 font-sans leading-relaxed">
              Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono font-bold">A / D</kbd> or{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono font-bold">← / →</kbd> to weave
              between heavy trucks, passenger autos, and road barricades along the Grand Trunk Road.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="text-orange-400 font-bold flex items-center gap-1.5">
              <span>📢</span>
              <span>BLAST MUSICAL HORN</span>
            </div>
            <p className="text-gray-400 font-sans leading-relaxed">
              Hit <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono font-bold">SPACE</kbd> or tap{' '}
              <b>HORN OK</b> to honk the multi-tone pressure horn, clearing stubborn vehicles and activating highway nitro!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="text-yellow-400 font-bold flex items-center gap-1.5">
              <span>☕</span>
              <span>DHABA STOPS & COIN STREAKS</span>
            </div>
            <p className="text-gray-400 font-sans leading-relaxed">
              Collect gold coins, diesel drums, and speed tokens outside Sher-e-Punjab Dhaba to unlock turbo speeds and climb the leaderboard!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
