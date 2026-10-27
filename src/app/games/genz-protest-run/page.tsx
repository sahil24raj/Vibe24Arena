'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { GenZProtestRunCanvas } from '@/components/games/genz-protest-run/GenZProtestRunCanvas';
import { ArrowLeft, Flame, Loader2, Sparkles, ShieldAlert, Award } from 'lucide-react';
import { soundFx } from '@/lib/audio';

export default function GenZProtestRunDedicatedPage() {
  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/games?cat=meme"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-[#00F0FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO MEME GAMES</span>
        </Link>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-500/40 text-[11px] font-mono text-orange-300 font-bold">
          <Flame className="w-3.5 h-3.5 text-orange-400" />
          <span>TRENDING MEME ARCADE RUNNER</span>
        </div>
      </div>

      {/* Main Game Arena Container */}
      <Suspense
        fallback={
          <div className="w-full min-h-[500px] flex flex-col items-center justify-center gap-3 text-orange-400">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="font-mono text-xs tracking-widest uppercase">
              Loading GenZ Protest Run Corridor...
            </span>
          </div>
        }
      >
        <GenZProtestRunCanvas />
      </Suspense>

      {/* Game Lore & Instructions Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <h2 className="text-base font-bold text-white font-display">
            HOW TO PLAY — द जेनज़ी प्रोटेस्ट रन (CHALO JANTAR MANTAR)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-300">
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <div className="text-orange-400 font-bold flex items-center gap-1.5">
              <span>🚐</span>
              <span>DODGE POLICE VANS</span>
            </div>
            <p className="text-gray-400 font-sans">
              Blue Dilli Police vans cruise towards you. Getting hit detains you for 5 seconds in the Free Van Seva!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <div className="text-yellow-400 font-bold flex items-center gap-1.5">
              <span>🚧</span>
              <span>JUMP OVER BARRICADES</span>
            </div>
            <p className="text-gray-400 font-sans">
              Yellow police barriers block your lanes. Hit <kbd className="px-1 py-0.5 rounded bg-slate-800 text-white font-mono">SPACE</kbd> or tap the <b>JUMP</b> button to clear them!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span>☕</span>
              <span>CHAI & SLOGAN BOOSTS</span>
            </div>
            <p className="text-gray-400 font-sans">
              Pick up cutting chai glasses to restore your जान (Health), and grab Megaphones for Slogan Invincibility speed rush!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
