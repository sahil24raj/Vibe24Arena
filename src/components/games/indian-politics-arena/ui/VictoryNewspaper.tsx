'use client';

import React from 'react';
import { CharacterConfig } from '../engine/types';
import { RotateCcw, Users, Trophy } from 'lucide-react';

interface VictoryNewspaperProps {
  winnerChar: CharacterConfig;
  loserChar: CharacterConfig;
  isP1Winner: boolean;
  onRematch: () => void;
  onCharacterSelect: () => void;
}

export const VictoryNewspaper: React.FC<VictoryNewspaperProps> = ({
  winnerChar,
  loserChar,
  isP1Winner,
  onRematch,
  onCharacterSelect
}) => {
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="absolute inset-0 z-50 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-[#F5F2EB] text-[#1E1B18] rounded-2xl shadow-2xl overflow-hidden border-4 border-[#292524] my-auto">
        {/* Newspaper Masthead */}
        <div className="border-b-4 border-[#292524] p-4 text-center bg-[#EFECE6]">
          <div className="flex items-center justify-between text-xs font-black tracking-widest text-[#78716C] border-b border-[#292524]/30 pb-1 mb-2">
            <span>VOL. 24 · ISSUE #420</span>
            <span>{currentDate}</span>
            <span>PRICE: 15 LAKH VIRTUAL COINS</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight font-serif drop-shadow-sm text-[#1C1917]">
            THE DAILY JUMLA
          </h1>
          <p className="text-xs uppercase font-extrabold tracking-widest text-[#78716C] mt-1">
            INDIA&apos;S MOST SENSATIONAL POLITICAL SATIRE GAZETTE · VIBE ARENA EDITION
          </p>
        </div>

        {/* Headline */}
        <div className="p-5 border-b-2 border-[#292524]/20 text-center">
          <span className="inline-block px-3 py-1 bg-[#DC2626] text-white font-black text-xs uppercase tracking-wider rounded-md mb-2">
            BREAKING ELECTION ARENA SPECIAL
          </span>
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#1C1917] font-serif leading-tight">
            {winnerChar.name} CLAIMS THE SUPREME KURSI!
          </h2>
          <p className="text-sm font-bold text-[#78716C] italic mt-1">
            {loserChar.name} DEFEATED IN DRAMATIC FINAL ROUND BLOWOUT!
          </p>
        </div>

        {/* Newspaper Body Columns */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-12 gap-5">
          {/* Winner Photo & Caption */}
          <div className="sm:col-span-5 bg-[#E7E5E4] p-3 rounded-xl border border-[#292524]/20 text-center flex flex-col items-center justify-center">
            <div className="text-7xl my-2 filter drop-shadow">{winnerChar.avatarIcon}</div>
            <div className="text-sm font-black uppercase text-[#1C1917] mt-1">
              {winnerChar.name}
            </div>
            <p className="text-[11px] font-semibold text-[#57534E] italic mt-1 px-1">
              &ldquo;{winnerChar.winLine}&rdquo;
            </p>
            <div className="mt-3 px-3 py-1 bg-[#16A34A] text-white font-black text-xs uppercase rounded-full">
              {isP1Winner ? 'YOU WIN!' : 'CPU PREVAILS!'}
            </div>
          </div>

          {/* Satirical Column Text */}
          <div className="sm:col-span-7 flex flex-col justify-between space-y-3 text-xs leading-relaxed font-serif text-[#292524]">
            <div>
              <p className="font-bold text-sm mb-1 text-[#1C1917]">
                Sensational Verdict from the Arena Floor:
              </p>
              <p>
                In a thrilling display of political acrobatics, {winnerChar.name} executed their
                feared signature special maneuver, completely dissolving {loserChar.name}&apos;s
                coalition and sweeping the electoral stage.
              </p>
            </div>

            {/* Loser's Hilarious Excuse Box */}
            <div className="bg-[#FEE2E2] border-l-4 border-[#DC2626] p-2.5 rounded text-[#991B1B]">
              <span className="font-bold uppercase text-[10px] block">
                Loser&apos;s Press Briefing Statement:
              </span>
              <p className="italic font-sans font-semibold">
                &ldquo;{loserChar.defeatExcuse}&rdquo; — {loserChar.name}
              </p>
            </div>

            <p className="text-[11px] text-[#78716C] font-sans">
              Sources confirm the chai stall outside the arena served over 4,000 cups during the
              exchange. Exit poll predictions were, as usual, completely wrong.
            </p>
          </div>
        </div>

        {/* Newspaper Footer Buttons */}
        <div className="p-4 bg-[#292524] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-[#FFD700]" />
            KURSI VICTORY RECORDED IN ARENA ARCHIVES
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onRematch}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-[#FF9933] to-[#FFD700] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-black text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> REMATCH
            </button>
            <button
              onClick={onCharacterSelect}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" /> ROSTER SELECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

