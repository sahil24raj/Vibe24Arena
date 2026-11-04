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
import { isImageSource } from '@/components/profile/GamerAvatar';
import {
  Trophy,
  Crown,
  ArrowRight,
  Users
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
    <div className="flex flex-col w-full relative space-y-16 pb-12">
      {/* Real-time Multiplayer Modal */}
      <MultiplayerLobbyModal />

      {/* 1. HERO SECTION: Official Vibe Arena Narrative & Interactive Cyber Playground */}
      <VibeArenaHero />

      {/* 2. FEATURED GAMES SPOTLIGHT CAROUSEL */}
      <section className="space-y-4 max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              FEATURED & TRENDING GAMES
            </h2>
          </div>
          <Link
            href="/categories"
            onClick={() => soundFx.playClick()}
            className="text-xs font-mono text-neon-cyan hover:underline flex items-center gap-1 font-bold"
          >
            <span>View All ({GAMES_CATALOG.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <HeroTrendingCarousel />
      </section>

      {/* 3. PICK YOUR VIBE: Curated Categories & Bento Grid */}
      <PickYourVibeSection />

      {/* 4. THE SOCIAL DIFFERENTIATOR: Where Friends Come to Play */}
      <SquadSocialExperienceSection />

      {/* 5. GLOBAL PODIUM & VERIFIED CLOUD LEADERBOARD */}
      <section className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-[#141122]/90 backdrop-blur-xl border border-purple-500/30 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-500/20 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-solar-yellow" />
                <h2 className="text-xl sm:text-2xl font-black text-white font-headline uppercase tracking-tight">
                  VIBE PODIUM & CLOUD LEADERBOARD
                </h2>
              </div>
              <p className="text-xs text-soft-lavender font-body mt-1">
                Real high scores verified across all games. Challenge friends to take the #1 crown.
              </p>
            </div>

            <Link
              href="/leaderboard"
              onClick={() => soundFx.playClick()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B1730] border border-purple-500/30 hover:border-primary/50 text-xs font-mono font-bold text-white shrink-0 transition-all shadow-sm"
            >
              <span>FULL LEADERBOARD</span>
              <ArrowRight className="w-3.5 h-3.5 text-neon-cyan" />
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
                      ? 'bg-gradient-to-tr from-primary/20 via-[#1B1730] to-[#141122] border-solar-yellow/50 shadow-[0_0_25px_rgba(255,213,46,0.2)]'
                      : usr.rank === 2
                      ? 'bg-[#1B1730] border-neon-cyan/40 shadow-lg'
                      : 'bg-[#1B1730] border-purple-500/30'
                  }`}
                >
                  {usr.rank === 1 && (
                    <div className="absolute top-2 right-2 text-solar-yellow/20">
                      <Crown className="w-12 h-12" />
                    </div>
                  )}
                  <div className="flex items-center gap-3.5 relative z-10">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-headline font-black text-sm border ${
                        usr.rank === 1
                          ? 'bg-solar-yellow/20 border-solar-yellow/50 text-solar-yellow'
                          : usr.rank === 2
                          ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                          : 'bg-primary/20 border-primary/50 text-primary'
                      }`}
                    >
                      #{usr.rank}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#141122] border border-purple-500/30 flex items-center justify-center text-xl overflow-hidden">
                      {isImageSource(usr.avatar) ? (
                        <img src={usr.avatar} alt={usr.username} className="w-full h-full object-cover" />
                      ) : (
                        <span>{usr.avatar || '🎮'}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-headline">{usr.username}</h4>
                      <span className="text-[10px] text-soft-lavender font-mono block">{usr.badge || 'Gamer'}</span>
                      <span className="text-[9px] text-neon-green font-mono">{usr.wins || 0} Wins</span>
                    </div>
                  </div>

                  <div className="text-right font-mono relative z-10">
                    <span
                      className={`text-sm font-black block ${
                        usr.rank === 1 ? 'text-solar-yellow' : 'text-neon-cyan'
                      }`}
                    >
                      {usr.score.toLocaleString()}
                    </span>
                    <span className="text-[9px] text-soft-lavender/70">PTS</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 rounded-2xl bg-[#1B1730] border border-purple-500/20 space-y-2">
              <p className="text-xs font-bold text-white">No cloud scores recorded yet today.</p>
              <p className="text-[11px] text-soft-lavender">Play any game and be the first to claim the Vibe King crown!</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. CLOSING SQUAD BANTER CTA BANNER */}
      <section className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-12 bg-gradient-to-r from-[#1B1730] via-[#141122] to-[#100B24] border border-purple-500/30 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary/20 via-neon-cyan/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-purple-500/20 text-xs font-mono text-neon-green">
              <span>✨</span>
              <span>NO DOWNLOADS. NO BORING SETUP.</span>
            </div>

            <h3 className="text-3xl sm:text-5xl font-black text-white font-headline uppercase tracking-tight leading-tight">
              YOUR SQUAD IS WAITING. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] via-[#A855F7] to-[#06B6D4]">
                JUST PLAY.
              </span>
            </h3>

            <p className="text-xs sm:text-sm text-soft-lavender font-body leading-relaxed">
              Create a room in 3 seconds, drop the code into WhatsApp or Discord, and settle hostel bets in Chor Sipahi, Pen Flip, Auto Rush, or Spin Cricket.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  openMultiplayerModal(GAMES_CATALOG[0]);
                }}
                className="px-8 py-3.5 rounded-xl bg-primary-container hover:bg-secondary-container text-white text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,44,255,0.5)] cursor-pointer transition-all"
              >
                <Users className="w-4 h-4 text-neon-green" />
                <span>CREATE SQUAD ROOM NOW</span>
              </button>

              <Link
                href="/categories"
                onClick={() => soundFx.playClick()}
                className="px-6 py-3.5 rounded-xl bg-[#141122] hover:bg-white/[0.06] border border-purple-500/30 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span>BROWSE ALL VIBES</span>
                <ArrowRight className="w-4 h-4 text-neon-cyan" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
