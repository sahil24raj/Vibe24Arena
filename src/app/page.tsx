'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { VibeArenaHero } from '@/components/VibeArenaHero';
import { HeroTrendingCarousel } from '@/components/HeroTrendingCarousel';
import { PickYourVibeSection } from '@/components/PickYourVibeSection';
import { SquadSocialExperienceSection } from '@/components/SquadSocialExperienceSection';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import { subscribeToCloudLeaderboard } from '@/lib/firebaseService';
import { LeaderboardEntry } from '@/types';
import {
  Trophy,
  Crown,
  ArrowRight,
  Sparkles,
  Users,
  Gamepad2,
  Zap,
  Play
} from 'lucide-react';

export default function HomePage() {
  const [topLeaderboard, setTopLeaderboard] = useState<LeaderboardEntry[]>([]);
  const { openMultiplayerModal } = useAppStore();

  useEffect(() => {
    const unsub = subscribeToCloudLeaderboard((entries) => {
      if (entries && entries.length > 0) {
        const sorted = [...entries].sort((a, b) => b.score - a.score);
        setTopLeaderboard(sorted.slice(0, 3).map((e, idx) => ({ ...e, rank: idx + 1 })));
      } else {
        setTopLeaderboard([]);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  return (
    <div className="space-y-16">
      {/* Real-time Multiplayer Modal */}
      <MultiplayerLobbyModal />

      {/* 1. HERO SECTION: Official Vibe Arena Narrative & Interactive Playground */}
      <VibeArenaHero />

      {/* 2. FEATURED GAMES SPOTLIGHT CAROUSEL */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D946EF]" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              FEATURED & TRENDING GAMES
            </h2>
          </div>
          <Link
            href="/categories"
            onClick={() => soundFx.playClick()}
            className="text-xs font-mono text-[#06B6D4] hover:underline flex items-center gap-1"
          >
            <span>View All ({GAMES_CATALOG.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <HeroTrendingCarousel />
      </section>

      {/* 3. PICK YOUR VIBE: 6 Curated Categories & Products */}
      <PickYourVibeSection />

      {/* 4. THE SOCIAL DIFFERENTIATOR: Where Friends Come to Play */}
      <SquadSocialExperienceSection />

      {/* 5. GLOBAL PODIUM & VERIFIED CLOUD LEADERBOARD */}
      <section className="p-6 sm:p-8 rounded-3xl bg-[#10131D] border border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                VIBE PODIUM & LEADERBOARD
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-1">
              Real high scores verified across all games. Challenge friends to take the #1 crown.
            </p>
          </div>

          <Link
            href="/leaderboard"
            onClick={() => soundFx.playClick()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full va-btn-secondary text-xs font-mono font-bold text-white shrink-0"
          >
            <span>FULL LEADERBOARD</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#06B6D4]" />
          </Link>
        </div>

        {/* Podium Top 3 Cards */}
        {topLeaderboard.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topLeaderboard.map((usr) => (
              <div
                key={usr.rank}
                className={`p-5 rounded-2xl border transition-all flex items-center justify-between relative overflow-hidden ${
                  usr.rank === 1
                    ? 'bg-gradient-to-tr from-[#D946EF]/10 via-[#181C2A] to-[#10131D] border-[#D946EF]/40 shadow-lg shadow-[#D946EF]/10'
                    : 'bg-[#080A12] border-white/[0.08]'
                }`}
              >
                {usr.rank === 1 && (
                  <div className="absolute top-2 right-2 text-[#D946EF]/20">
                    <Crown className="w-12 h-12" />
                  </div>
                )}
                <div className="flex items-center gap-3.5 relative z-10">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm border ${
                      usr.rank === 1
                        ? 'bg-[#D946EF]/20 border-[#D946EF]/50 text-[#F472B6]'
                        : usr.rank === 2
                        ? 'bg-slate-700/20 border-slate-600/40 text-slate-300'
                        : 'bg-amber-700/20 border-amber-700/40 text-amber-500'
                    }`}
                  >
                    #{usr.rank}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#10131D] border border-white/10 flex items-center justify-center text-xl">
                    {usr.avatar || '🎮'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white font-display">{usr.username}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">{usr.badge || 'Player'}</span>
                    <span className="text-[9px] text-emerald-400 font-mono">{usr.wins || 0} Wins</span>
                  </div>
                </div>

                <div className="text-right font-mono relative z-10">
                  <span
                    className={`text-sm font-black block ${
                      usr.rank === 1 ? 'text-[#F472B6]' : 'text-[#38BDF8]'
                    }`}
                  >
                    {usr.score.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500">PTS</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-2xl bg-[#080A12] border border-white/[0.08] space-y-2">
            <p className="text-xs font-bold text-slate-300">No leaderboard scores recorded yet today.</p>
            <p className="text-[11px] text-slate-500">Play any game and be the first to claim the Vibe King crown!</p>
          </div>
        )}
      </section>

      {/* 6. CLOSING SQUAD BANTER CTA BANNER */}
      <section className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-[#181C2A] via-[#10131D] to-[#080A12] border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#D946EF]/10 via-[#06B6D4]/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-mono text-[#F472B6]">
            <span>✨</span>
            <span>NO DOWNLOADS. NO BORING SETUP.</span>
          </div>

          <h3 className="text-3xl sm:text-5xl font-black text-white font-display uppercase tracking-tight leading-tight">
            YOUR SQUAD IS WAITING. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] via-[#A855F7] to-[#06B6D4]">
              JUST PLAY.
            </span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
            Create a room in 3 seconds, drop the code into WhatsApp or Discord, and settle hostel bets in Chor Sipahi, Pen Flip or Spin Cricket.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => {
                soundFx.playClick();
                openMultiplayerModal(GAMES_CATALOG[0]);
              }}
              className="px-8 py-3.5 rounded-full va-btn-primary text-xs font-bold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>CREATE SQUAD ROOM NOW</span>
            </button>

            <Link
              href="/categories"
              onClick={() => soundFx.playClick()}
              className="px-6 py-3.5 rounded-full va-btn-secondary text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>BROWSE ALL VIBES</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
