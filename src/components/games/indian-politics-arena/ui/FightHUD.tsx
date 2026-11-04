'use client';

import React from 'react';
import { CharacterConfig, MatchStats } from '../engine/types';
import { Pause, Flame, Maximize, Minimize } from 'lucide-react';

interface FightHUDProps {
  p1: CharacterConfig;
  p2: CharacterConfig;
  stats: MatchStats;
  onPause: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const FightHUD: React.FC<FightHUDProps> = ({
  p1,
  p2,
  stats,
  onPause,
  isFullscreen,
  onToggleFullscreen
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Header: Health Bars, Timer, Round Win Markers */}
      <div className="grid grid-cols-12 gap-2 sm:gap-4 items-start w-full max-w-5xl mx-auto">
        {/* P1 Side */}
        <div className="col-span-5 flex items-center gap-2 sm:gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#0B1536] border-2 border-[#FF9933] shadow-lg flex items-center justify-center text-2xl sm:text-3xl shrink-0 overflow-hidden">
            {p1.facePhoto ? (
              <img src={p1.facePhoto} alt={p1.name} className="w-full h-full object-cover" />
            ) : (
              p1.avatarIcon
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black">
              <span className="text-white uppercase truncate">{p1.name}</span>
              {/* Round Wins */}
              <div className="flex gap-1.5">
                {[1, 2].map(w => (
                  <span
                    key={w}
                    className={`w-3 h-3 rounded-full border border-black ${
                      w <= stats.p1Wins
                        ? 'bg-[#FFD700] shadow-[0_0_8px_#FFD700]'
                        : 'bg-black/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* HP Bar */}
            <div className="h-4 sm:h-5 bg-black/60 border border-white/20 rounded-lg p-0.5 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#DC2626] via-[#F59E0B] to-[#10B981] rounded transition-all duration-150"
                style={{ width: `${Math.max(0, stats.p1Hp)}%` }}
              />
            </div>

            {/* Shakti Super Meter */}
            <div className="flex items-center gap-1.5 text-[10px] font-black text-amber-300">
              <span className="tracking-widest">SHAKTI</span>
              <div className="flex-1 h-2 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    stats.p1Super >= 100
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FF9933] animate-pulse shadow-[0_0_10px_#FFD700]'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, stats.p1Super)}%` }}
                />
              </div>
              {stats.p1Super >= 100 && (
                <span className="animate-bounce text-[9px] bg-[#FFD700] text-black px-1 rounded font-black">
                  MAX
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Timer & Round Indicator */}
        <div className="col-span-2 flex flex-col items-center justify-center">
          <div className="px-3 sm:px-4 py-1 bg-[#060B1E]/90 border-2 border-[#FFD700] rounded-2xl shadow-xl flex flex-col items-center justify-center min-w-[65px] sm:min-w-[80px]">
            <span className="text-2xl sm:text-4xl font-black text-[#FFD700] tracking-tighter">
              {stats.timeRemaining}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-300 -mt-1">
              ROUND {stats.round}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={onPause}
              className="pointer-events-auto p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all transform hover:scale-105 active:scale-95"
              title="Pause (Esc)"
            >
              <Pause className="w-4 h-4" />
            </button>
            {onToggleFullscreen && (
              <button
                onClick={onToggleFullscreen}
                className="pointer-events-auto p-1.5 bg-white/10 hover:bg-white/20 border border-[#00D2FF]/40 rounded-xl text-[#00D2FF] hover:text-white transition-all transform hover:scale-105 active:scale-95"
                title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* P2 Side */}
        <div className="col-span-5 flex items-center flex-row-reverse gap-2 sm:gap-3">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-[#0B1536] border-2 border-[#00D2FF] shadow-lg flex items-center justify-center text-2xl sm:text-3xl shrink-0 overflow-hidden">
            {p2.facePhoto ? (
              <img src={p2.facePhoto} alt={p2.name} className="w-full h-full object-cover" />
            ) : (
              p2.avatarIcon
            )}
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs sm:text-sm font-black flex-row-reverse">
              <span className="text-white uppercase truncate">{p2.name}</span>
              {/* Round Wins */}
              <div className="flex gap-1.5">
                {[1, 2].map(w => (
                  <span
                    key={w}
                    className={`w-3 h-3 rounded-full border border-black ${
                      w <= stats.p2Wins
                        ? 'bg-[#00D2FF] shadow-[0_0_8px_#00D2FF]'
                        : 'bg-black/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* HP Bar */}
            <div className="h-4 sm:h-5 bg-black/60 border border-white/20 rounded-lg p-0.5 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-[#DC2626] via-[#F59E0B] to-[#10B981] rounded transition-all duration-150 float-right"
                style={{ width: `${Math.max(0, stats.p2Hp)}%` }}
              />
            </div>

            {/* Shakti Super Meter */}
            <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-300 flex-row-reverse">
              <span className="tracking-widest">SHAKTI</span>
              <div className="flex-1 h-2 bg-black/60 rounded-full border border-white/10 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 float-right ${
                    stats.p2Super >= 100
                      ? 'bg-gradient-to-l from-[#00D2FF] to-[#3B82F6] animate-pulse shadow-[0_0_10px_#00D2FF]'
                      : 'bg-cyan-400'
                  }`}
                  style={{ width: `${Math.min(100, stats.p2Super)}%` }}
                />
              </div>
              {stats.p2Super >= 100 && (
                <span className="animate-bounce text-[9px] bg-[#00D2FF] text-black px-1 rounded font-black">
                  MAX
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Combo Feedback Popups */}
      <div className="flex justify-between items-center w-full max-w-4xl mx-auto px-6">
        {/* P1 Combo */}
        <div>
          {stats.p1Combo >= 2 && (
            <div className="bg-[#FF9933] text-black font-black text-lg sm:text-2xl px-4 py-1 rounded-xl shadow-lg transform -rotate-6 animate-bounce">
              {stats.p1Combo} HITS! {stats.p1Combo >= 4 ? 'BAWAAL!' : 'DHAMAKA!'}
            </div>
          )}
        </div>

        {/* P2 Combo */}
        <div>
          {stats.p2Combo >= 2 && (
            <div className="bg-[#00D2FF] text-black font-black text-lg sm:text-2xl px-4 py-1 rounded-xl shadow-lg transform rotate-6 animate-bounce">
              {stats.p2Combo} HITS! {stats.p2Combo >= 4 ? 'BAWAAL!' : 'DHAMAKA!'}
            </div>
          )}
        </div>
      </div>

      {/* FightKaro Style Cinematic Super Attack Banner */}
      {stats.superActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/65 backdrop-blur-[2px] transition-all animate-in fade-in duration-200 z-50">
          <div className="w-full py-4 sm:py-6 bg-gradient-to-r from-transparent via-[#0B1536]/95 to-transparent border-y-4 border-[#FFD700] shadow-[0_0_35px_rgba(255,215,0,0.5)] flex items-center justify-center relative overflow-hidden">
            {/* Speed Lines Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none animate-pulse" />

            <div className="flex items-center gap-4 sm:gap-8 max-w-3xl px-6 relative z-10 transform -skew-x-6">
              {/* Fighter Photo */}
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-black border-3 border-[#FFD700] shadow-[0_0_20px_#FFD700] overflow-hidden shrink-0 transform skew-x-6">
                {stats.superFacePhoto ? (
                  <img
                    src={stats.superFacePhoto}
                    alt={stats.superCharacterName || 'Super'}
                    className="w-full h-full object-cover scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-amber-900/60 text-[#FFD700]">
                    ⚡
                  </div>
                )}
              </div>

              {/* Text Info */}
              <div className="space-y-1 transform skew-x-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFD700] text-black text-[11px] font-black uppercase tracking-wider animate-bounce">
                  ⚡ SUPER ATTACK UNLEASHED ⚡
                </div>
                <div className="text-xl sm:text-2xl font-black text-gray-200 uppercase tracking-wide">
                  {stats.superCharacterName}
                </div>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#FF9933] to-[#FF4500] tracking-tight drop-shadow-[0_2px_12px_rgba(255,153,51,0.8)]">
                  {stats.superMoveName}
                </div>
                {stats.superIntroLine && (
                  <div className="text-xs sm:text-sm font-bold text-amber-200/90 italic">
                    "{stats.superIntroLine}"
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="h-6" />
    </div>
  );
};

