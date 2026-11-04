'use client';

import React, { useState } from 'react';
import {
  ARENAS_ROSTER,
  CHARACTERS_ROSTER
} from '../engine/constants';
import {
  AIDifficulty,
  ArenaConfig,
  CharacterConfig,
  GameMode
} from '../engine/types';
import {
  ArrowLeft,
  Swords,
  Zap,
  Shield,
  Gauge,
  Flame,
  Bot
} from 'lucide-react';

interface CharacterSelectScreenProps {
  mode: GameMode;
  onConfirmMatch: (
    p1: CharacterConfig,
    p2: CharacterConfig,
    arena: ArenaConfig,
    difficulty: AIDifficulty
  ) => void;
  onBack: () => void;
}

export const CharacterSelectScreen: React.FC<CharacterSelectScreenProps> = ({
  mode,
  onConfirmMatch,
  onBack
}) => {
  const [p1Index, setP1Index] = useState(0);
  const [p2Index, setP2Index] = useState(1);
  const [arenaIndex, setArenaIndex] = useState(0);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');
  const [pickingForP1, setPickingForP1] = useState(true);

  const p1Char = CHARACTERS_ROSTER[p1Index];
  const p2Char = CHARACTERS_ROSTER[p2Index];
  const currentArena = ARENAS_ROSTER[arenaIndex];

  const handleTileClick = (index: number) => {
    if (mode === 'twoplayer') {
      if (pickingForP1) {
        setP1Index(index);
        setPickingForP1(false);
      } else {
        setP2Index(index);
        setPickingForP1(true);
      }
    } else {
      // 1P vs CPU
      if (pickingForP1) {
        setP1Index(index);
      } else {
        setP2Index(index);
      }
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-[#060B1E] via-[#09112B] to-[#040817] flex flex-col justify-between p-4 sm:p-6 overflow-y-auto select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white font-bold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> BACK
        </button>

        <div className="text-center">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#FFD700]">
            {mode === 'twoplayer' ? '2-PLAYER LOCAL PICK' : 'SELECT YOUR NETA'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            FIGHTER SELECTION
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-gray-300">
          <span>MODE:</span>
          <span className="text-amber-400 font-bold uppercase">{mode}</span>
        </div>
      </div>

      {/* Main Selection Area: Left Fighter - Center Grid - Right Fighter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center my-auto py-2">
        {/* Left Side: P1 Profile Card */}
        <div className="lg:col-span-3 bg-[#0B1536]/80 border-2 border-[#FF9933] rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-[#FF9933] text-black font-black text-xs rounded-full">
              1P · YOU
            </span>
            <button
              onClick={() => setPickingForP1(true)}
              className={`text-xs font-bold px-2 py-0.5 rounded ${pickingForP1 ? 'bg-amber-400/30 text-amber-300 border border-amber-400' : 'text-gray-400'}`}
            >
              ACTIVE PICK
            </button>
          </div>

          <div className="text-center my-3">
            <div className="text-6xl mb-2 filter drop-shadow-lg">{p1Char.avatarIcon}</div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {p1Char.name}
            </h3>
            <p className="text-xs font-semibold text-amber-300">{p1Char.party}</p>
            <p className="text-xs text-gray-400 italic mt-1">&ldquo;{p1Char.introLine}&rdquo;</p>
          </div>

          {/* Stats Bar */}
          <div className="space-y-1.5 text-xs text-gray-300 bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold"><Zap className="w-3.5 h-3.5 text-amber-400" /> Power</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <span key={v} className={`w-3.5 h-1.5 rounded-sm ${v <= p1Char.stats.power ? 'bg-[#FF9933]' : 'bg-gray-700'}`} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold"><Gauge className="w-3.5 h-3.5 text-cyan-400" /> Speed</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <span key={v} className={`w-3.5 h-1.5 rounded-sm ${v <= p1Char.stats.speed ? 'bg-[#00D2FF]' : 'bg-gray-700'}`} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Defense</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <span key={v} className={`w-3.5 h-1.5 rounded-sm ${v <= p1Char.stats.defense ? 'bg-[#10B981]' : 'bg-gray-700'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-amber-300 font-semibold bg-[#FF9933]/15 p-2 rounded-lg border border-[#FF9933]/30">
            ⚡ SUPER: {p1Char.superName}
          </div>
        </div>

        {/* Center: 8-Fighter Grid + Stage/Diff Selectors */}
        <div className="lg:col-span-6 flex flex-col items-center gap-4">
          <div className="text-xs font-bold tracking-widest text-gray-400 uppercase">
            CLICK AVATAR TO CHOOSE {pickingForP1 ? '1P' : mode === 'twoplayer' ? '2P' : 'CPU'}
          </div>

          {/* 8 Roster Tiles */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 w-full max-w-lg">
            {CHARACTERS_ROSTER.map((char, index) => {
              const isP1 = p1Index === index;
              const isP2 = p2Index === index;

              return (
                <button
                  key={char.id}
                  onClick={() => handleTileClick(index)}
                  className={`relative p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 border-2 ${
                    isP1
                      ? 'border-[#FF9933] bg-[#FF9933]/20 shadow-[0_0_15px_rgba(255,153,51,0.5)]'
                      : isP2
                      ? 'border-[#00D2FF] bg-[#00D2FF]/20 shadow-[0_0_15px_rgba(0,210,255,0.5)]'
                      : 'border-white/10 bg-[#0B1536]/60 hover:border-white/30'
                  }`}
                >
                  {/* Indicators */}
                  {isP1 && (
                    <span className="absolute -top-2 -left-2 bg-[#FF9933] text-black font-black text-[10px] px-1.5 py-0.5 rounded-full shadow">
                      1P
                    </span>
                  )}
                  {isP2 && (
                    <span className="absolute -top-2 -right-2 bg-[#00D2FF] text-black font-black text-[10px] px-1.5 py-0.5 rounded-full shadow">
                      {mode === 'twoplayer' ? '2P' : 'CPU'}
                    </span>
                  )}

                  <span className="text-3xl sm:text-4xl">{char.avatarIcon}</span>
                  <span className="text-[10px] sm:text-xs font-black text-white mt-1 text-center truncate max-w-full">
                    {char.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Stage & CPU Options */}
          <div className="flex flex-wrap items-center justify-center gap-4 bg-black/40 p-3 rounded-2xl border border-white/10 w-full max-w-lg text-xs">
            {/* Arena Picker */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-gray-400">STAGE:</span>
              <select
                value={arenaIndex}
                onChange={e => setArenaIndex(Number(e.target.value))}
                className="bg-[#0B1536] border border-white/20 text-white font-bold py-1 px-2 rounded-lg outline-none cursor-pointer"
              >
                {ARENAS_ROSTER.map((arena, i) => (
                  <option key={arena.id} value={i}>
                    {arena.name} ({arena.hindiName})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty (if against CPU) */}
            {mode !== 'twoplayer' && (
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-400 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5" /> CPU:
                </span>
                {(['easy', 'normal', 'hard'] as AIDifficulty[]).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`uppercase font-bold px-2 py-0.5 rounded-md transition-colors ${
                      difficulty === d
                        ? 'bg-amber-400 text-black font-black'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FIGHT Button */}
          <button
            onClick={() => onConfirmMatch(p1Char, p2Char, currentArena, difficulty)}
            className="w-full max-w-sm py-4 bg-gradient-to-r from-[#FF9933] via-[#FFD700] to-[#FF9933] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-black text-xl rounded-2xl shadow-[0_0_30px_rgba(255,153,51,0.6)] transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider"
          >
            <Swords className="w-6 h-6 fill-black" />
            START FIGHT! (लड़ाई शुरू!)
          </button>
        </div>

        {/* Right Side: P2 / CPU Profile Card */}
        <div className="lg:col-span-3 bg-[#0B1536]/80 border-2 border-[#00D2FF] rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 bg-[#00D2FF] text-black font-black text-xs rounded-full uppercase">
              {mode === 'twoplayer' ? '2P · RIVAL' : 'CPU · OPPONENT'}
            </span>
            <button
              onClick={() => setPickingForP1(false)}
              className={`text-xs font-bold px-2 py-0.5 rounded ${!pickingForP1 ? 'bg-cyan-400/30 text-cyan-300 border border-cyan-400' : 'text-gray-400'}`}
            >
              ACTIVE PICK
            </button>
          </div>

          <div className="text-center my-3">
            <div className="text-6xl mb-2 filter drop-shadow-lg">{p2Char.avatarIcon}</div>
            <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {p2Char.name}
            </h3>
            <p className="text-xs font-semibold text-cyan-300">{p2Char.party}</p>
            <p className="text-xs text-gray-400 italic mt-1">&ldquo;{p2Char.introLine}&rdquo;</p>
          </div>

          {/* Stats Bar */}
          <div className="space-y-1.5 text-xs text-gray-300 bg-black/30 p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold"><Zap className="w-3.5 h-3.5 text-amber-400" /> Power</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <span key={v} className={`w-3.5 h-1.5 rounded-sm ${v <= p2Char.stats.power ? 'bg-[#FF9933]' : 'bg-gray-700'}`} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold"><Gauge className="w-3.5 h-3.5 text-cyan-400" /> Speed</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <span key={v} className={`w-3.5 h-1.5 rounded-sm ${v <= p2Char.stats.speed ? 'bg-[#00D2FF]' : 'bg-gray-700'}`} />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold"><Shield className="w-3.5 h-3.5 text-emerald-400" /> Defense</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(v => (
                  <span key={v} className={`w-3.5 h-1.5 rounded-sm ${v <= p2Char.stats.defense ? 'bg-[#10B981]' : 'bg-gray-700'}`} />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 text-[11px] text-cyan-300 font-semibold bg-[#00D2FF]/15 p-2 rounded-lg border border-[#00D2FF]/30">
            ⚡ SUPER: {p2Char.superName}
          </div>
        </div>
      </div>

      {/* Bottom Controls Legend */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-center text-xs text-gray-300 max-w-4xl mx-auto w-full">
        <span className="font-bold text-amber-400">Controls:</span> <b>A/D</b> Move · <b>W</b> Jump · <b>S</b> Crouch · <b>J</b> Punch · <b>K</b> Kick · <b>I</b> Grab · <b>L / Space</b> Super Attack · <b>Esc</b> Pause
      </div>
    </div>
  );
};

