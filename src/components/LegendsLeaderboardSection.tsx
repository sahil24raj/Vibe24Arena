'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { subscribeToCloudLeaderboard } from '@/lib/firebaseService';
import { LeaderboardEntry } from '@/types';
import { soundFx } from '@/lib/audio';

export const LegendsLeaderboardSection: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'week' | 'all' | 'today'>('week');
  const [topLeaderboard, setTopLeaderboard] = useState<LeaderboardEntry[]>([]);

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

  // Default podium champions matching the Stitch design
  const rank1 = topLeaderboard[0] || {
    rank: 1,
    username: 'Aarav',
    badge: 'Chor Sipahi King',
    level: 35,
    subtitle: 'Undefeated Sultan • Level 35',
    score: 2450,
    avatar: 'A'
  };

  const rank2 = topLeaderboard[1] || {
    rank: 2,
    username: 'Priya',
    badge: 'Mantri Master',
    level: 28,
    subtitle: 'Vibe Slayer • Level 28',
    score: 1820,
    avatar: 'P'
  };

  const rank3 = topLeaderboard[2] || {
    rank: 3,
    username: 'Kabir',
    badge: 'Auto Drift King',
    level: 22,
    subtitle: 'DesiRacer • Level 22',
    score: 1410,
    avatar: 'K'
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-12">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Section Title & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-primary font-label-md font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">emoji_events</span>
              <span>COMPETITIVE HALL OF FAME</span>
            </div>
            <h2 className="font-headline-xl uppercase text-on-surface tracking-tight mt-1">
              LEGENDS OF VIBE ARENA
            </h2>
            <p className="font-body-md text-soft-lavender">
              Verified global arena rankings. Crown the squad champion.
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-container-low border border-purple-500/20">
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveFilter('week');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-label-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'week'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
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
              className={`px-3.5 py-1.5 rounded-lg font-label-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-soft-lavender hover:text-on-surface'
              }`}
            >
              All-Time
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveFilter('today');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-label-sm font-bold transition-all cursor-pointer ${
                activeFilter === 'today'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-soft-lavender hover:text-on-surface'
              }`}
            >
              Today
            </button>
          </div>
        </div>

        {/* 3-Player 3D-Styled Visual Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8">
          {/* Rank 2: Silver / Cyan (Priya) */}
          <div className="order-2 md:order-1 p-6 rounded-3xl bg-surface-container flex flex-col items-center text-center relative group shadow-xl border border-purple-500/20">
            <div className="w-20 h-20 rounded-full bg-neon-cyan/20 p-1 mb-3 relative">
              <span className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center font-headline-md text-neon-cyan font-bold">
                {typeof rank2.avatar === 'string' && rank2.avatar.length === 1 ? rank2.avatar : 'P'}
              </span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-neon-cyan text-surface-purple font-label-sm font-bold px-2 py-0.5 rounded-full shadow-md">
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
              <span className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center font-headline-lg text-tertiary font-bold text-3xl">
                {typeof rank1.avatar === 'string' && rank1.avatar.length === 1 ? rank1.avatar : 'A'}
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
              <span className="w-full h-full rounded-full bg-surface-container-high flex items-center justify-center font-headline-md text-primary font-bold">
                {typeof rank3.avatar === 'string' && rank3.avatar.length === 1 ? rank3.avatar : 'K'}
              </span>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-on-primary font-label-sm font-bold px-2 py-0.5 rounded-full shadow-md">
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
              🔥 Aarav just scored +350 in Chor Sipahi • Priya smashed 6 runs in Spin Cricket • Kabir wiped out on Auto Rush Drift
            </span>
          </div>

          <Link
            href="/leaderboard"
            onClick={() => soundFx.playClick()}
            className="px-6 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg font-bold shrink-0 transition-colors flex items-center gap-2 border border-purple-500/20"
          >
            <span>VIEW FULL LEADERBOARD</span>
            <span className="material-symbols-outlined text-sm">trophy</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
