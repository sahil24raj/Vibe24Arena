'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { IndianPoliticsArenaGame } from '@/components/games/indian-politics-arena/IndianPoliticsArenaGame';
import { ArrowLeft, Flame, Loader2, Sparkles, Swords, Trophy, ShieldCheck } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export default function IndianPoliticsArenaDedicatedPage() {
  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-[#FF9933] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO ARENA GAMES</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FF9933]/20 via-[#FFD700]/20 to-[#00D2FF]/20 border border-[#FF9933]/40 text-xs font-mono text-amber-300 font-bold">
          <Flame className="w-4 h-4 text-[#FF9933] animate-pulse" />
          <span>INDIAN POLITICS ARENA · 2026</span>
        </div>
      </div>

      {/* Main Game Arena Container with Suspense */}
      <Suspense
        fallback={
          <div className="w-full h-[620px] rounded-3xl bg-[#060B1E] border border-white/10 flex flex-col items-center justify-center gap-3 text-[#FF9933]">
            <Loader2 className="w-10 h-10 animate-spin text-[#FFD700]" />
            <span className="font-mono text-xs tracking-widest uppercase text-gray-300">
              Loading Indian Politics Arena Engine...
            </span>
          </div>
        }
      >
        <IndianPoliticsArenaGame />
      </Suspense>

      {/* Game Lore & Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-[#FF9933] font-bold text-sm">
            <Swords className="w-4 h-4" />
            <span>8 ORIGINAL SATIRE FIGHTERS</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Choose from Chai Commander, Vikas Baba, Jumlebaaz, Dharna King, Budget Boss, Media Master, Coalition King, and Janata Hero. Each fighter features custom frame data, unique speeds, signature specials, and explosive SHAKTI super moves.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-[#00D2FF] font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>4 ANIMATED HISTORIC ARENAS</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Clash inside the Grand Parliament Arena, election rally grounds, Jantar Mantar protest boulevard, or prime-time 9 PM newsroom studio complete with sweeping spotlights and breaking news ticker tapes.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-[#10B981] font-bold text-sm">
            <Trophy className="w-4 h-4" />
            <span>MULTIPLE GAME MODES</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed font-sans">
            Jump into Quick Fight vs AI, test your mettle in Story Mode, duel a friend side-by-side on the same keyboard in 2-Player Local Mode, or host an Online Room to share with your friends.
          </p>
        </div>
      </div>
    </div>
  );
}
