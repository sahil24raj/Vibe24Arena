'use client';

import React from 'react';
import { Trophy, Coins, Zap, RotateCcw, Wrench, Home, Flag } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface AutoRushPodiumModalProps {
  position: number;
  totalRacers: number;
  bestLapTime: number;
  totalRaceTime: number;
  onRematch: () => void;
  onGarage: () => void;
  onMenu: () => void;
}

export const AutoRushPodiumModal: React.FC<AutoRushPodiumModalProps> = ({
  position,
  totalRacers,
  bestLapTime,
  totalRaceTime,
  onRematch,
  onGarage,
  onMenu
}) => {
  const isPodium = position <= 3;
  const isWinner = position === 1;

  const earnedCoins = isWinner ? 350 : (position === 2 ? 220 : (position === 3 ? 150 : 60));
  const earnedXp = isWinner ? 400 : (position <= 3 ? 250 : 120);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 100);
    return `${mins}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="max-w-md w-full bg-[#0B1536] border-2 border-[#FFD700] rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center space-y-4">
        {/* Trophy / Ribbon Banner */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.6)] animate-bounce">
          <Trophy className="w-10 h-10 text-black" />
        </div>

        <div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide">
            {isWinner
              ? '🏆 CHAMPION OF THE GULLY!'
              : isPodium
              ? '🥈 PODIUM FINISH!'
              : '🏁 RACE FINISHED!'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-300 font-bold mt-1">
            Finished {position}
            {position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'} out of{' '}
            {totalRacers} Auto-Rickshaws
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">TOTAL TIME</span>
            <span className="text-base font-mono font-black text-cyan-300 mt-0.5">
              {formatTime(totalRaceTime)}
            </span>
          </div>

          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex flex-col items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase">BEST LAP</span>
            <span className="text-base font-mono font-black text-amber-300 mt-0.5">
              {bestLapTime > 0 ? formatTime(bestLapTime) : '--:--.--'}
            </span>
          </div>
        </div>

        {/* Rewards Earned Box */}
        <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border border-amber-400/40 rounded-2xl p-3 flex items-center justify-around">
          <div className="flex items-center gap-1.5 font-black text-amber-300 text-sm">
            <Coins className="w-4 h-4 text-[#FFD700]" />
            +{earnedCoins} COINS
          </div>
          <div className="flex items-center gap-1.5 font-black text-cyan-300 text-sm">
            <Zap className="w-4 h-4 text-cyan-400" />
            +{earnedXp} XP
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 w-full pt-2">
          <button
            onClick={onRematch}
            className="py-3 px-3 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#FFD700] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-black text-xs flex flex-col items-center justify-center gap-1 shadow-lg transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REMATCH</span>
          </button>

          <button
            onClick={onGarage}
            className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          >
            <Wrench className="w-4 h-4 text-amber-300" />
            <span>GARAGE</span>
          </button>

          <button
            onClick={onMenu}
            className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
