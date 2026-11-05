'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscribeToCloudLeaderboard } from '@/lib/firebaseService';
import { LeaderboardEntry } from '@/types';
import { soundFx } from '@/lib/audio';
import { isImageSource } from '@/components/profile/GamerAvatar';

export const LegendsLeaderboardSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'today' | 'week' | 'all'>('today');
  const [cloudLeaderboard, setCloudLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const unsub = subscribeToCloudLeaderboard((entries) => {
      if (entries && entries.length > 0) {
        const sorted = [...entries].sort((a, b) => b.score - a.score);
        setCloudLeaderboard(sorted.slice(0, 3).map((e, idx) => ({ ...e, rank: idx + 1 })));
      } else {
        setCloudLeaderboard([]);
      }
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Default podium champions matching the Stitch design system from code.html
  const rank1 = cloudLeaderboard[0] || {
    rank: 1,
    username: 'Aarav',
    badge: 'Chor Sipahi King',
    level: 35,
    subtitle: 'Undefeated Sultan • Level 35',
    score: 2450,
    avatar: 'A'
  };

  const rank2 = cloudLeaderboard[1] || {
    rank: 2,
    username: 'Priya',
    badge: 'Mantri Master',
    level: 28,
    subtitle: 'Vibe Slayer • Level 28',
    score: 1820,
    avatar: 'P'
  };

  const rank3 = cloudLeaderboard[2] || {
    rank: 3,
    username: 'Kabir',
    badge: 'Auto Drift King',
    level: 22,
    subtitle: 'DesiRacer • Level 22',
    score: 1410,
    avatar: 'K'
  };

  return (
    <section className="w-full px-4 sm:px-8 xl:px-14 py-14 relative">
      <div className="max-w-[1720px] mx-auto flex flex-col gap-8">
        {/* Section Title & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="font-label-md text-tertiary uppercase tracking-widest font-bold">
              HONOR ROLL
            </span>
            <h2 className="font-headline-xl uppercase text-on-surface tracking-tight mt-1">
              LEGENDS OF VIBE ARENA 👑
            </h2>
            <p className="font-body-md text-soft-lavender">
              Real scores verified across all squad rooms today.
            </p>
          </div>

          {/* Filter Tabs matching stitch code.html */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container self-start sm:self-auto border border-purple-500/20">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveFilter('today');
              }}
              className={`px-4 py-1.5 rounded-lg font-label-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'today'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-soft-lavender hover:text-on-surface'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveFilter('week');
              }}
              className={`px-4 py-1.5 rounded-lg font-label-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'week'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-soft-lavender hover:text-on-surface'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveFilter('all');
              }}
              className={`px-4 py-1.5 rounded-lg font-label-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-soft-lavender hover:text-on-surface'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* 3-Player 3D-Styled Visual Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
          {/* Rank 2: Silver / Cyan (Priya) */}
          <div className="order-2 md:order-1 p-6 rounded-3xl bg-surface-container flex flex-col items-center text-center relative group shadow-xl border border-purple-500/20">
            <div className="w-20 h-20 rounded-full bg-neon-cyan/20 p-1 mb-3 relative">
              <span className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center font-headline-md text-neon-cyan font-bold overflow-hidden">
                {isImageSource(rank2.avatar) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rank2.avatar} alt={rank2.username} className="w-full h-full object-cover" />
                ) : (
                  typeof rank2.avatar === 'string' && rank2.avatar.length <= 2 ? rank2.avatar : 'P'
                )}
              </span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neon-cyan text-surface-purple font-label-sm font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                #2
              </span>
            </div>
            <span className="font-headline-sm text-on-surface font-bold">{rank2.username}</span>
            <span className="font-label-sm text-neon-cyan">{rank2.badge || 'Vibe Slayer • Level 28'}</span>
            <div className="mt-4 p-3 w-full rounded-xl bg-surface-container-high flex items-center justify-between border border-purple-500/10">
              <span className="font-body-sm text-soft-lavender">{rank2.badge || 'Mantri Master'}</span>
              <span className="font-label-lg text-neon-cyan font-bold">{rank2.score.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Rank 1: Gold / Elevated Center (Aarav) */}
          <div className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-surface-container-high to-surface-container flex flex-col items-center text-center relative shadow-[0_0_40px_rgba(235,195,21,0.35)] -mt-4 md:-mt-8 border border-tertiary/40">
            <div className="text-3xl mb-1 animate-bounce">👑</div>
            <div className="w-24 h-24 rounded-full bg-tertiary/30 p-1 mb-3 relative">
              <span className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center font-headline-lg text-tertiary font-bold text-3xl overflow-hidden">
                {isImageSource(rank1.avatar) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rank1.avatar} alt={rank1.username} className="w-full h-full object-cover" />
                ) : (
                  typeof rank1.avatar === 'string' && rank1.avatar.length <= 2 ? rank1.avatar : 'A'
                )}
              </span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-tertiary text-on-tertiary-fixed font-label-sm font-bold px-3 py-0.5 rounded-full shadow-lg whitespace-nowrap">
                #1 SULTAN
              </span>
            </div>
            <span className="font-headline-md text-on-surface font-bold">{rank1.username}</span>
            <span className="font-label-sm text-tertiary">{rank1.badge || 'Undefeated Sultan • Level 35'}</span>
            <div className="mt-4 p-3.5 w-full rounded-xl bg-surface-container-highest flex items-center justify-between border border-tertiary/20">
              <span className="font-body-sm text-on-surface font-semibold">{rank1.badge || 'Chor Sipahi King'}</span>
              <span className="font-headline-sm text-tertiary font-bold">{rank1.score.toLocaleString()} pts</span>
            </div>
          </div>

          {/* Rank 3: Bronze / Violet (Kabir) */}
          <div className="order-3 md:order-3 p-6 rounded-3xl bg-surface-container flex flex-col items-center text-center relative group shadow-xl border border-purple-500/20">
            <div className="w-20 h-20 rounded-full bg-primary/20 p-1 mb-3 relative">
              <span className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center font-headline-md text-primary font-bold overflow-hidden">
                {isImageSource(rank3.avatar) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={rank3.avatar} alt={rank3.username} className="w-full h-full object-cover" />
                ) : (
                  typeof rank3.avatar === 'string' && rank3.avatar.length <= 2 ? rank3.avatar : 'K'
                )}
              </span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-sm font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                #3
              </span>
            </div>
            <span className="font-headline-sm text-on-surface font-bold">{rank3.username}</span>
            <span className="font-label-sm text-primary">{rank3.badge || 'DesiRacer • Level 22'}</span>
            <div className="mt-4 p-3 w-full rounded-xl bg-surface-container-high flex items-center justify-between border border-purple-500/10">
              <span className="font-body-sm text-soft-lavender">{rank3.badge || 'Auto Drift King'}</span>
              <span className="font-label-lg text-primary font-bold">{rank3.score.toLocaleString()} pts</span>
            </div>
          </div>
        </div>

        {/* Live Squad Activity Ticker & Full Leaderboard CTA */}
        <div className="p-5 rounded-2xl bg-surface-container-low border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto w-full sm:w-auto no-scrollbar">
            <span className="px-2.5 py-1 rounded bg-neon-green/20 text-neon-green font-label-sm font-bold uppercase shrink-0">
              LIVE MATCH TICKER
            </span>
            <span className="font-body-sm text-soft-lavender truncate">
              🔥 Aarav just scored +350 in Chor Sipahi • Priya smashed 6 runs in Spin Cricket • Kabir wiped out on Tirri Run Drift
            </span>
          </div>

          <Link
            href="/leaderboard"
            onClick={() => soundFx.playClick()}
            className="px-6 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg font-bold shrink-0 transition-colors flex items-center gap-2 border border-purple-500/20 cursor-pointer"
          >
            <span>VIEW FULL LEADERBOARD</span>
            <span className="material-symbols-outlined text-sm">trophy</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
