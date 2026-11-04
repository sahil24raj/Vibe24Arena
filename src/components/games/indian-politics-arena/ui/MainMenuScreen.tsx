'use client';

import React from 'react';
import {
  Swords,
  Play,
  Trophy,
  Users2,
  Globe2,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  Flame,
  Maximize,
  Minimize
} from 'lucide-react';
import { GameMode } from '../engine/types';

interface MainMenuScreenProps {
  onStartMode: (mode: GameMode) => void;
  onOpenRoster: () => void;
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onStartMode,
  onOpenRoster,
  onOpenHelp,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-[#060B1E] via-[#0A1128] to-[#040817] flex flex-col items-center justify-between p-6 select-none overflow-hidden">
      {/* Background Decorative Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-[#FF9933]/20 via-[#00D2FF]/20 to-[#FFD700]/20 blur-3xl pointer-events-none rounded-full" />

      {/* Top Bar: Vibe Arena Branding & Audio */}
      <div className="w-full max-w-5xl flex items-center justify-between z-10">
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          <Flame className="w-5 h-5 text-[#FF9933] animate-pulse" />
          <span className="text-xs font-black tracking-widest text-[#FFD700] uppercase">
            VIBE ARENA ORIGINAL
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenHelp}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white transition-all transform hover:scale-105"
            title="Controls & Moves"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleMute}
            className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white transition-all transform hover:scale-105"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-green-400" />}
          </button>
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="p-2.5 bg-white/10 hover:bg-white/20 border border-[#00D2FF]/40 rounded-full text-[#00D2FF] hover:text-white transition-all transform hover:scale-105"
              title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Center Hero: Title & Taglines */}
      <div className="flex flex-col items-center text-center my-auto z-10 space-y-4">
        {/* Animated Tricolor Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF9933]/30 via-white/20 to-[#10B981]/30 border border-white/20 text-xs font-bold tracking-wider text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
          THE GREAT KURSI BATTLE · 2026 EDITION
        </div>

        {/* Grand Title */}
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#00D2FF]">
            INDIAN POLITICS
          </span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-[#F59E0B] to-[#FF9933]">
            ARENA
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-2xl font-bold tracking-wide text-amber-200/90 max-w-xl italic">
          &ldquo;Sansad Se Sadak Tak, Fight Karo!&rdquo;
        </p>

        {/* Menu Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full max-w-md pt-4">
          <button
            onClick={() => onStartMode('quick')}
            className="group relative px-6 py-4 bg-gradient-to-r from-[#FF9933] to-[#F59E0B] hover:from-[#F97316] hover:to-[#D97706] text-black font-black text-lg rounded-xl shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
          >
            <Play className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" />
            <span>QUICK FIGHT</span>
          </button>

          <button
            onClick={() => onStartMode('story')}
            className="group relative px-6 py-4 bg-gradient-to-r from-[#00D2FF] to-[#2563EB] hover:from-[#38BDF8] hover:to-[#1D4ED8] text-white font-black text-lg rounded-xl shadow-[0_0_25px_rgba(0,210,255,0.3)] transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3"
          >
            <Trophy className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
            <span>STORY MODE</span>
          </button>

          <button
            onClick={() => onStartMode('twoplayer')}
            className="group relative px-6 py-3.5 bg-[#132048] hover:bg-[#1A2D66] border border-white/20 text-white font-bold text-base rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5"
          >
            <Users2 className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>2-PLAYER LOCAL</span>
          </button>

          <button
            onClick={() => onStartMode('multiplayer')}
            className="group relative px-6 py-3.5 bg-[#132048] hover:bg-[#1A2D66] border border-white/20 text-white font-bold text-base rounded-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2.5"
          >
            <Globe2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>ONLINE ROOM</span>
          </button>
        </div>

        {/* Character Roster Button */}
        <button
          onClick={onOpenRoster}
          className="text-xs uppercase font-extrabold tracking-widest text-amber-300/80 hover:text-amber-200 transition-colors pt-2 underline underline-offset-4"
        >
          VIEW 8 SATIRICAL CHARACTERS & STATS ›
        </button>
      </div>

      {/* Footer Disclaimer */}
      <div className="z-10 text-center text-[11px] text-gray-400 max-w-xl">
        A 100% original browser fighting experience by Vibe Arena. Pure satire and parody under Art. 19(1)(a).
      </div>
    </div>
  );
};

