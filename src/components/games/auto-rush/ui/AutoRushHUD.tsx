'use client';

import React from 'react';
import { VehiclePhysicsState } from '../engine/types';
import { Pause, Flame, Camera, Volume2, Maximize, Minimize } from 'lucide-react';

interface AutoRushHUDProps {
  playerState: VehiclePhysicsState;
  totalLaps: number;
  position: number;
  totalRacers: number;
  countdown: number | null; // 3, 2, 1, 0 (GO), or null
  isOffRoad: boolean;
  onPause: () => void;
  onToggleCamera: () => void;
  onHorn: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const AutoRushHUD: React.FC<AutoRushHUDProps> = ({
  playerState,
  totalLaps,
  position,
  totalRacers,
  countdown,
  isOffRoad,
  onPause,
  onToggleCamera,
  onHorn,
  isFullscreen,
  onToggleFullscreen
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${mins}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const getPositionSuffix = (pos: number) => {
    if (pos === 1) return 'ST';
    if (pos === 2) return 'ND';
    if (pos === 3) return 'RD';
    return 'TH';
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* 3-2-1-GO Fullscreen Countdown */}
      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="transform scale-150 animate-bounce flex flex-col items-center">
            {countdown > 0 ? (
              <span className="text-7xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#FF9933] drop-shadow-[0_10px_25px_rgba(255,153,51,0.9)]">
                {countdown}
              </span>
            ) : (
              <span className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#10B981] via-[#00D2FF] to-[#10B981] drop-shadow-[0_10px_30px_rgba(16,185,129,0.9)] animate-pulse">
                GO! CHALO!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Top Bar: Lap Counter, Timers, Race Position, Controls */}
      <div className="flex items-start justify-between w-full max-w-5xl mx-auto">
        {/* Left: Position Badge & Lap Counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Race Position */}
          <div className="px-3 sm:px-4 py-2 bg-[#0B1536]/90 border-2 border-[#FFD700] rounded-2xl shadow-xl flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black text-[#FFD700]">
              {position}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-300">
              {getPositionSuffix(position)}
            </span>
            <span className="text-[10px] sm:text-xs text-gray-400 font-bold ml-1">
              / {totalRacers}
            </span>
          </div>

          {/* Lap Counter */}
          <div className="px-3 sm:px-4 py-2 bg-[#0B1536]/90 border border-white/20 rounded-2xl shadow-lg flex flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              LAP
            </span>
            <span className="text-lg sm:text-xl font-black text-white">
              {Math.min(playerState.lap, totalLaps)} / {totalLaps}
            </span>
          </div>
        </div>

        {/* Center: Live Lap Times */}
        <div className="bg-[#0B1536]/90 border border-white/15 rounded-2xl px-3 sm:px-5 py-1.5 shadow-lg flex flex-col items-center">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            LAP TIME
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-cyan-300">
            {formatTime(playerState.currentLapTime)}
          </div>
          {playerState.bestLapTime > 0 && (
            <div className="text-[10px] text-amber-300 font-mono">
              BEST: {formatTime(playerState.bestLapTime)}
            </div>
          )}
        </div>

        {/* Right: Pause & Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onHorn}
            className="pointer-events-auto p-2 sm:p-2.5 bg-[#FF9933]/90 hover:bg-[#FF9933] border border-[#FFD700] rounded-xl text-black font-black transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center gap-1 text-xs"
            title="Horn (H)"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">HORN</span>
          </button>

          <button
            onClick={onToggleCamera}
            className="pointer-events-auto p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all transform hover:scale-105 active:scale-95"
            title="Change Camera (C)"
          >
            <Camera className="w-4 h-4" />
          </button>

          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="pointer-events-auto p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 border border-[#00D2FF]/40 rounded-xl text-[#00D2FF] hover:text-white transition-all transform hover:scale-105 active:scale-95"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onPause}
            className="pointer-events-auto p-2 sm:p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all transform hover:scale-105 active:scale-95"
            title="Pause (Esc / P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Toast: Off-Road Warning */}
      {isOffRoad && (
        <div className="self-center bg-red-600/90 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg border border-red-400 animate-pulse">
          ⚠ OFF TRACK — SPEED REDUCED
        </div>
      )}

      {/* Bottom Bar: Speedometer Gauge, Gear & Nitro Meter */}
      <div className="flex items-end justify-between w-full max-w-5xl mx-auto">
        {/* Left: Nitro Power Gauge */}
        <div className="bg-[#0B1536]/90 border border-white/20 rounded-2xl p-3 shadow-xl w-36 sm:w-48 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-black uppercase text-amber-300">
            <span className="flex items-center gap-1">
              <Flame className={`w-3.5 h-3.5 ${playerState.isNitroActive ? 'text-cyan-400 animate-bounce' : 'text-[#FF9933]'}`} />
              NITRO BOOST
            </span>
            <span>{Math.round(playerState.nitroRemaining)}%</span>
          </div>
          <div className="h-3 bg-black/60 rounded-full border border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                playerState.isNitroActive
                  ? 'bg-gradient-to-r from-[#00D2FF] to-[#3B82F6] shadow-[0_0_12px_#00D2FF] animate-pulse'
                  : 'bg-gradient-to-r from-[#FF9933] to-[#FFD700]'
              }`}
              style={{ width: `${Math.max(0, playerState.nitroRemaining)}%` }}
            />
          </div>
          <div className="text-[9px] text-gray-400 font-semibold text-right">
            Hold [SPACE] or Nitro
          </div>
        </div>

        {/* Right: Indian Auto-Rickshaw Speedometer Dial */}
        <div className="bg-[#0B1536]/95 border-2 border-[#FFD700] rounded-3xl p-3 sm:p-4 shadow-2xl flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl sm:text-5xl font-black text-white font-mono tracking-tight">
              {playerState.speedKmh}
            </div>
            <div className="text-[10px] font-extrabold uppercase text-[#FFD700] tracking-widest -mt-1">
              KM / H
            </div>
          </div>

          <div className="w-10 h-10 rounded-xl bg-black/60 border border-white/20 flex flex-col items-center justify-center text-cyan-300 font-black">
            <span className="text-[8px] text-gray-400">GEAR</span>
            <span className="text-base">{playerState.gear}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

