'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

type VibeKey = 'meme' | 'school' | 'squad' | 'brain';

interface VibeTabConfig {
  key: VibeKey;
  label: string;
  emoji: string;
  tag: string;
  tagColor: string;
  gameCount: string;
  title: string;
  description: string;
  exploreLabel: string;
  exploreHref: string;
  glowBg: string;
  accentBtn: string;
  gameIds: string[];
}

const VIBE_CONFIGS: VibeTabConfig[] = [
  {
    key: 'meme',
    label: 'Meme Vibes',
    emoji: '🔥',
    tag: 'VIRAL DESI CHAOS',
    tagColor: 'bg-tertiary-container/30 text-tertiary',
    gameCount: '3 Games Ready',
    title: 'MEME VIBES',
    description: 'Satirical street races, unhinged political arenas, and chaotic escape runs built for peak banter with the boys.',
    exploreLabel: 'EXPLORE ALL MEME GAMES',
    exploreHref: '/categories?vibe=meme',
    glowBg: 'bg-tertiary/10',
    accentBtn: 'bg-tertiary text-on-tertiary-fixed shadow-[0_0_20px_rgba(235,195,21,0.3)]',
    gameIds: ['indian-politics-arena', 'genz-protest-run', 'escape-door']
  },
  {
    key: 'school',
    label: 'School Vibes',
    emoji: '🎒',
    tag: 'BACKBENCH NOSTALGIA',
    tagColor: 'bg-neon-cyan/20 text-neon-cyan',
    gameCount: '3 Games Ready',
    title: 'SCHOOL VIBES',
    description: 'Reynolds pen flips, rough notebook spin cricket, and quick tic-tac-toe duels between hostel lectures.',
    exploreLabel: 'EXPLORE SCHOOL VIBES',
    exploreHref: '/categories?vibe=school',
    glowBg: 'bg-neon-cyan/10',
    accentBtn: 'bg-surface-container-high hover:bg-surface-bright text-neon-cyan border border-purple-500/20',
    gameIds: ['pen-flip', 'spin-cricket', 'tic-tac-toe']
  },
  {
    key: 'squad',
    label: 'Squad Vibes',
    emoji: '👥',
    tag: 'SQUAD & MULTIPLAYER',
    tagColor: 'bg-primary-container/20 text-primary',
    gameCount: '3 Games Ready',
    title: 'SQUAD VIBES',
    description: 'Settle group chat arguments instantly. Social deduction, bluffing, and accidental self-destructions.',
    exploreLabel: 'EXPLORE SQUAD VIBES',
    exploreHref: '/categories?vibe=squad',
    glowBg: 'bg-primary-container/20',
    accentBtn: 'bg-primary-container text-on-primary-container shadow-[0_0_20px_rgba(139,44,255,0.4)]',
    gameIds: ['chor-sipahi', 'auto-rush', 'fake-bomb']
  },
  {
    key: 'brain',
    label: 'Brain & Puzzle Vibes',
    emoji: '⚡',
    tag: 'SPEED & INTELLECT',
    tagColor: 'bg-neon-green/20 text-neon-green',
    gameCount: '2 Games Ready',
    title: 'BRAIN & PUZZLE VIBES',
    description: 'Rapid 5-10 second micro-puzzles, anagram races, pattern matches, and cognitive showdowns.',
    exploreLabel: 'EXPLORE PUZZLE VIBES',
    exploreHref: '/categories?vibe=brain',
    glowBg: 'bg-neon-green/10',
    accentBtn: 'bg-surface-container-high hover:bg-surface-bright text-neon-green border border-purple-500/20',
    gameIds: ['brain-pot', 'word-builder']
  }
];

export const PickYourVibeSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VibeKey>('meme');
  const carouselRef = useRef<HTMLDivElement>(null);
  const { openMultiplayerModal } = useAppStore();

  const currentConfig = VIBE_CONFIGS.find((c) => c.key === activeTab) || VIBE_CONFIGS[0];

  const handleScroll = (amount: number) => {
    soundFx.playClick();
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handleTabChange = (key: VibeKey) => {
    soundFx.playClick();
    setActiveTab(key);
  };

  return (
    <section id="pick-your-vibe" className="w-full px-4 sm:px-6 lg:px-12 py-12 scroll-mt-24">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-surface-container-high border border-purple-500/20 text-neon-green font-label-sm uppercase tracking-widest font-bold shadow-md">
            <span className="material-symbols-outlined text-base">category</span>
            <span>CATEGORIES &amp; MODES</span>
          </div>
          <h2 className="font-headline-xl uppercase text-on-surface tracking-tight mt-2">
            PICK YOUR VIBE ● CHOOSE YOUR CHAOS
          </h2>
          <p className="font-body-lg text-soft-lavender max-w-2xl mt-1">
            From unhinged 4-player bluffing to nostalgic last-bench school games and rapid brain showdowns.
          </p>
        </div>

        {/* Bento Tab Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-surface-container-low border border-purple-500/20 backdrop-blur-xl max-w-4xl mx-auto">
          {VIBE_CONFIGS.map((config) => {
            const isActive = activeTab === config.key;
            return (
              <button
                key={config.key}
                onClick={() => handleTabChange(config.key)}
                className={`px-5 py-2.5 rounded-xl font-label-md font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-tertiary text-on-tertiary-fixed shadow-[0_0_20px_rgba(235,195,21,0.4)]'
                    : 'text-soft-lavender hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span className="text-lg leading-none">{config.emoji}</span>
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>

        {/* Vibe Showcase Panel */}
        <div className="flex flex-col gap-6">
          {/* Banner */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-surface-purple via-surface-container to-surface-container-high border border-purple-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div
              className={`absolute -right-10 -bottom-10 w-48 h-48 ${currentConfig.glowBg} rounded-full blur-2xl pointer-events-none`}
            />
            <div className="flex flex-col gap-1 z-10">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-label-sm font-bold uppercase tracking-wider ${currentConfig.tagColor}`}>
                  {currentConfig.emoji} {currentConfig.tag}
                </span>
                <span className="font-label-sm text-neon-green font-bold">
                  {currentConfig.gameCount}
                </span>
              </div>
              <h3 className="font-headline-lg uppercase text-on-surface font-bold tracking-tight">
                {currentConfig.title}
              </h3>
              <p className="font-body-md text-soft-lavender max-w-xl">
                {currentConfig.description}
              </p>
            </div>

            <div className="flex items-center gap-3 z-10 self-start md:self-auto">
              <Link
                href={currentConfig.exploreHref}
                onClick={() => soundFx.playClick()}
                className={`px-6 py-3 rounded-xl font-label-lg font-bold hover:scale-105 transition-transform flex items-center gap-2 ${currentConfig.accentBtn}`}
              >
                <span>{currentConfig.exploreLabel}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleScroll(-360)}
                  className="w-10 h-10 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                  title="Previous Games"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button
                  onClick={() => handleScroll(360)}
                  className="w-10 h-10 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                  title="Next Games"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Carousel for Active Vibe */}
          <div
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
          >
            {currentConfig.gameIds.map((gameId) => {
              const game = GAMES_CATALOG.find((g) => g.id === gameId);
              if (!game) return null;

              return (
                <div
                  key={game.id}
                  className="min-w-[320px] sm:min-w-[360px] max-w-[380px] snap-start shrink-0 rounded-2xl bg-surface-container p-4 flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(139,44,255,0.4)] transition-all group border border-purple-500/20"
                >
                  <div className="flex flex-col gap-2">
                    <div className="w-full h-48 rounded-xl bg-surface-purple overflow-hidden relative flex items-center justify-center">
                      {game.bannerImage ? (
                        <img
                          src={game.bannerImage}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-6xl">{game.thumbnail}</span>
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-secondary-container/90 text-on-secondary font-label-sm font-bold uppercase backdrop-blur-md">
                        {game.categoryKey?.toUpperCase()} VIBE
                      </div>
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-surface-purple/90 text-tertiary font-label-sm font-bold flex items-center gap-1 backdrop-blur-md">
                        <span className="material-symbols-outlined text-sm">star</span> {game.rating}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-soft-lavender font-label-sm pt-1">
                      <span>{game.multiplayer ? 'MULTIPLAYER' : 'SOLO ARCADE'} • {game.duration}</span>
                      <span className="text-neon-cyan font-bold uppercase">{game.difficulty} IQ</span>
                    </div>

                    <h4 className="font-headline-md text-on-surface font-bold truncate">{game.title}</h4>
                    <p className="font-body-sm text-soft-lavender line-clamp-2">{game.tagline || game.description}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Link
                      href={`/games/${game.slug || game.id}`}
                      onClick={() => soundFx.playClick()}
                      className="flex-1 py-3 rounded-lg bg-primary-container text-on-primary-container font-label-lg font-bold hover:bg-secondary-container transition-colors shadow-md text-center flex items-center justify-center"
                    >
                      PLAY NOW
                    </Link>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        if (game.multiplayer) {
                          openMultiplayerModal(game);
                        } else {
                          window.location.href = `/games/${game.slug || game.id}`;
                        }
                      }}
                      className="px-4 py-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg font-bold transition-colors cursor-pointer"
                    >
                      {game.multiplayer ? 'ROOM' : 'SOLO'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {VIBE_CONFIGS.map((c) => (
              <button
                key={c.key}
                onClick={() => handleTabChange(c.key)}
                className={`transition-all cursor-pointer ${
                  activeTab === c.key
                    ? 'w-8 h-2.5 rounded-full bg-tertiary'
                    : 'w-2.5 h-2.5 rounded-full bg-surface-container-high hover:bg-soft-lavender'
                }`}
                title={c.label}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
