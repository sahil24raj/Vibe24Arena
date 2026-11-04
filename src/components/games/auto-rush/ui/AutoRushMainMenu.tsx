'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Play, Wrench, Users2, HelpCircle, Volume2, VolumeX, Maximize, Minimize, Flame, Coins, Zap } from 'lucide-react';
import { VehicleConfig } from '../engine/types';
import { VehicleModelBuilder } from '../engine/VehicleModelBuilder';
import { useAppStore } from '@/store/useAppStore';

interface AutoRushMainMenuProps {
  currentVehicle: VehicleConfig;
  onStartRace: () => void;
  onOpenGarage: () => void;
  onOpenMultiplayer: () => void;
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const AutoRushMainMenu: React.FC<AutoRushMainMenuProps> = ({
  currentVehicle,
  onStartRace,
  onOpenGarage,
  onOpenMultiplayer,
  onOpenHelp,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen
}) => {
  const { user } = useAppStore();
  const { coins, xp, level } = user;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background 3D Turntable Auto
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(3.5, 2.0, 4.2);
    camera.lookAt(0, 0.8, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xff9933, 2.5);
    keyLight.position.set(4, 5, 3);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00d2ff, 2.0);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    const autoModel = VehicleModelBuilder.buildAutoRickshaw(currentVehicle);
    scene.add(autoModel);

    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      autoModel.rotation.y += 0.006;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
    };
  }, [currentVehicle]);

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-[#060B1E] via-[#0A1128] to-[#040817] flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden text-white">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#FF9933]/20 via-[#00D2FF]/20 to-[#FFD700]/20 blur-3xl pointer-events-none rounded-full" />

      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto z-10">
        {/* Brand Badge */}
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Flame className="w-5 h-5 text-[#FF9933] animate-pulse" />
          <span className="text-xs font-black tracking-widest text-[#FFD700] uppercase">
            VIBE ARENA · ORIGINAL 3D RACER
          </span>
        </div>

        {/* Player Stats & Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center gap-1.5 bg-black/50 border border-amber-500/40 px-3 py-1 rounded-full text-amber-300 font-black text-xs">
            <Coins className="w-4 h-4 text-[#FFD700]" />
            {coins}
          </div>

          <div className="flex items-center gap-1.5 bg-black/50 border border-cyan-500/40 px-3 py-1 rounded-full text-cyan-300 font-black text-xs">
            <Zap className="w-4 h-4 text-cyan-400" />
            LVL {level}
          </div>

          <button
            onClick={onOpenHelp}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white transition-all transform hover:scale-105"
            title="Controls & Instructions"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            className="p-2 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white transition-all transform hover:scale-105"
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2 bg-white/10 hover:bg-white/20 border border-[#00D2FF]/40 rounded-full text-[#00D2FF] hover:text-white transition-all transform hover:scale-105"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Center Layout: Title + 3D Vehicle Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full max-w-6xl mx-auto my-auto z-10">
        {/* Left: Animated Logo & Action Buttons */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="space-y-1">
            <div className="text-xs sm:text-sm font-black tracking-widest text-[#FF9933] uppercase">
              🇮🇳 THE GURUGRAM & DELHI GRAND PRIX
            </div>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_25px_rgba(255,153,51,0.6)]">
              AUTO RUSH <span className="text-[#FFD700]">3D</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-md font-medium">
              Race authentic Indian auto-rickshaws against 7 rivals through Cyber City, IFFCO Chowk, Kartavya Path and the Red Fort!
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onStartRace}
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-[#FF9933] via-[#FFD700] to-[#10B981] hover:opacity-95 text-black font-black text-base rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.4)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" /> START RACE (रेस शुरू करें)
            </button>

            <button
              onClick={onOpenGarage}
              className="py-3.5 px-6 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-sm rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4 text-amber-300" /> GARAGE (गैराज)
            </button>

            <button
              onClick={onOpenMultiplayer}
              className="py-3.5 px-6 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-400/40 text-cyan-300 font-black text-sm rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <Users2 className="w-4 h-4 text-cyan-400" /> MULTIPLAYER
            </button>
          </div>
        </div>

        {/* Right: Interactive 3D Auto Showcase */}
        <div className="lg:col-span-6 h-[260px] sm:h-[320px] relative rounded-3xl bg-black/30 border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Active Auto Info Plaque */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-xs">
            <div className="font-black text-white uppercase flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: currentVehicle.bodyColor }} />
              {currentVehicle.name}
            </div>
            <div className="text-amber-300 font-bold font-mono text-[11px]">
              "{currentVehicle.slogan}"
            </div>
          </div>
        </div>
      </div>

      {/* Footer Notice */}
      <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium border-t border-white/10 pt-3 max-w-6xl w-full mx-auto z-10">
        <div>Keyboard: W/A/S/D or Arrows · Shift: Drift · Space: Nitro · H: Horn</div>
        <div className="text-amber-400/80 font-bold">Vibe Arena · Proudly Made in India 🇮🇳</div>
      </div>
    </div>
  );
};
