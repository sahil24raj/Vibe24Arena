'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface HeroSpotlightItem {
  id: string;
  title: string;
  tabName: string;
  category: string;
  categoryClass: string;
  desc: string;
  image: string;
  fallbackImage: string;
  duration: string;
  players: string;
  rating: string;
  online: string;
  trending: string;
  trendingClass: string;
  lobby: string;
  route: string;
}

const SPOTLIGHT_GAMES: HeroSpotlightItem[] = [
  {
    id: 'auto-rush',
    title: 'Auto Rush 3D 🛺💨',
    tabName: '🛺 Auto Rush 3D',
    category: 'SPEED DRIFT',
    categoryClass: 'px-2 py-0.5 rounded bg-secondary-container/90 text-on-secondary font-label-sm text-xs uppercase font-bold',
    desc: 'The Gurugram Grand Prix! 8 Indian auto-rickshaws, real 3-wheel drift mechanics & nitrous overdrive!',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3MAkCfpxx00r712BIkoTKOUpsBSQTNmzdqjpvtDS4iX-UAm3zta3HhBbr33rgC6Squ_hxz6U-uwejTxj_u6wxpiySHtw1O-M4vx51UF58VPzzT7WFb2J4aJehVpAs8puXDh6nQS6F9uTaYntKXYNxcm0hmAzLUIyedDKzYVNEss7VaGGplA5suPzIOvRqhEQK37IzEy8CjWTe9LHTnjj4FM1igvGhnxg_4ROnTCRJ',
    fallbackImage: '/games/auto-rush.jpg',
    duration: '⏱️ 2-5 MIN',
    players: '👥 8 PLAYERS',
    rating: '4.98',
    online: '1,860 Online',
    trending: 'SQUAD THRILLS',
    trendingClass: 'px-2.5 py-1 rounded bg-secondary-container/90 text-on-secondary font-label-sm text-xs font-bold uppercase backdrop-blur-md shadow-md',
    lobby: '6/8 Drivers ready',
    route: '/games/auto-rush'
  },
  {
    id: 'indian-politics-arena',
    title: 'Indian Politics Arena ⚔️🏛️',
    tabName: '⚔️ Politics Arena',
    category: 'HARD CHAOS',
    categoryClass: 'px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-label-sm text-xs uppercase font-bold',
    desc: 'Sansad Se Sadak Tak, Fight Karo! 8 satirical netas, real arcade combat engine and super attacks!',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQXtRaL_0IA_rot7ufXTnrPoTulhYC7-sz8NO78uxzyvxNnmHWEjgQIA0Uql3_SOM4jcI8VwJYOA-Mt5hlpwK7R5pO_-yFLjm_9qxYkw9FnK67RJuzFB-JTNausSYQiq38bTMLlCogIZRQw8xy6oKTgY5kmIfYmBKKAwopB2LQfnILDSecO0pmxTZDqUh-uozthnVxUNIvtiHlb8wFENMmQaV5Amw8OeeDRcAREUaN',
    fallbackImage: '/games/indian-politics-arena.jpg',
    duration: '⏱️ 2-4 MIN',
    players: '👥 2-4 PLAYERS',
    rating: '4.99',
    online: '2,150 Online',
    trending: 'TRENDING MEME',
    trendingClass: 'px-2.5 py-1 rounded bg-tertiary text-on-tertiary-fixed font-label-sm text-xs font-bold uppercase backdrop-blur-md shadow-md',
    lobby: '2/4 Netas ready',
    route: '/games/indian-politics-arena'
  },
  {
    id: 'chor-sipahi',
    title: 'Chor Sipahi (Raja Mantri) 👑🥷',
    tabName: '👑 Chor Sipahi',
    category: 'SOCIAL BLUFF',
    categoryClass: 'px-2 py-0.5 rounded bg-neon-green/20 text-neon-green font-label-sm text-xs uppercase font-bold',
    desc: 'Raja orders, Mantri hides, Sipahi investigates, Chor bluffs! The ultimate desi party deduction game.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3aJre89_I3R41MIBjqQRndMhohVqrvJy-jZ4wEDb-T90foAKHOAOat9MXcJzNQlgyVcRdS02B2aUO4AvRg5YMpi9wIOK0Ve854h1_Z3M5P0-64OFlxsvTJGZs5-1ajO6REkRL5y8LidPY5ITxAM1AKoJS1W673BVzp3orhRndkwQBA0ItFjlQmBcErK0MFEamU--QVLgqliGYFUdtt24gOuladRaMvaZtZVcUWrKw',
    fallbackImage: '/games/chor-sipahi.jpg',
    duration: '⏱️ 2-4 MIN',
    players: '👥 4 PLAYERS',
    rating: '4.98',
    online: '1,240 Online',
    trending: 'SQUAD CLASSIC',
    trendingClass: 'px-2.5 py-1 rounded bg-neon-green/20 text-neon-green font-label-sm text-xs font-bold uppercase backdrop-blur-md shadow-md',
    lobby: '3/4 Squad waiting',
    route: '/games/chor-sipahi'
  },
  {
    id: 'escape-door',
    title: 'Escape From The Door 🚪',
    tabName: '🚪 Escape Door',
    category: 'MYSTERY RISK',
    categoryClass: 'px-2 py-0.5 rounded bg-secondary-container/80 text-on-secondary font-label-sm text-xs uppercase font-bold',
    desc: 'Choose wisely. Exactly ONE cyber door leads to survival across 10 tense rooms and Endless Mode!',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn_msyxAAqaqvb3m5sWGKi9LlUE4N_9o7pNf_2dEDs2UU2O6kJgFSwSxx9emifkQSx4E9fDQxwIibIjVPpx_0u26iQDgj6e07mukEAEbAZpX2CF8pXS2ZxL9AVBN2OFCI2YSzNCZgJp1CRMvgy7hlbJtX5VGcoFUlZnKzKu1_8BGGVyymgbzIddQ1so8WWnCKbnhXKq60TzyNrYt0jT3eYp14ybOSpYrjCPM5j1CEs',
    fallbackImage: '/games/escape-door.jpg',
    duration: '⏱️ 1-3 MIN',
    players: '👥 SOLO / SQUAD',
    rating: '4.98',
    online: '940 Online',
    trending: 'MYSTERY RISK',
    trendingClass: 'px-2.5 py-1 rounded bg-secondary-container/80 text-on-secondary font-label-sm text-xs font-bold uppercase backdrop-blur-md shadow-md',
    lobby: 'Instant Room ready',
    route: '/games/escape-door'
  }
];

export const VibeArenaHero: React.FC = () => {
  const router = useRouter();
  const { openMultiplayerModal } = useAppStore();
  const [activeSpotlightIdx, setActiveSpotlightIdx] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const activeGame = SPOTLIGHT_GAMES[activeSpotlightIdx];

  const handlePrevSpotlight = () => {
    soundFx.playClick();
    setActiveSpotlightIdx((prev) => (prev === 0 ? SPOTLIGHT_GAMES.length - 1 : prev - 1));
  };

  const handleNextSpotlight = () => {
    soundFx.playClick();
    setActiveSpotlightIdx((prev) => (prev === SPOTLIGHT_GAMES.length - 1 ? 0 : prev + 1));
  };

  const handleCopyLink = () => {
    soundFx.playCoin();
    setCopiedLink(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText('https://vibe24arena.vercel.app/play/room/X7K92P');
    }
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const selectedCatalogGame = GAMES_CATALOG.find((g) => g.id === activeGame.id) || GAMES_CATALOG[0];

  return (
    <section className="relative w-full px-4 sm:px-6 lg:px-12 py-10 lg:py-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: High-Voltage Pitch & Live Lobby Trigger */}
        <div className="lg:col-span-7 flex flex-col gap-6 z-10">
          {/* Micro Top Pill */}
          <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-surface-container-high/90 backdrop-blur-md border border-purple-500/20 shadow-[0_0_20px_rgba(139,44,255,0.25)]">
            <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_10px_#48F078] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-neon-green -ml-2.5" />
            <span className="font-label-sm text-neon-green tracking-widest uppercase font-bold">
              INSTANT PLAY • ZERO DOWNLOADS • 100% FREE
            </span>
          </div>

          {/* Display Hero Title */}
          <div className="flex flex-col">
            <h1 className="font-display-hero text-on-surface uppercase tracking-tighter leading-none">
              YOUR SQUAD.
              <br />
              YOUR ARENA.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary drop-shadow-[0_0_35px_rgba(139,44,255,0.7)]">
                YOUR VIBE.
              </span>
            </h1>
            <p className="font-body-lg text-soft-lavender max-w-xl mt-4 leading-relaxed">
              Dost bulao. Game lagao. Play instant desi multiplayer battles, settle hostel bets, roast your friends, and dominate the squad leaderboard. Instant 6-char codes, zero installations.
            </p>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={() => {
                soundFx.playClick();
                router.push(activeGame.route);
              }}
              className="px-8 py-4 rounded-xl bg-tertiary text-on-tertiary-fixed font-headline-sm uppercase tracking-wider font-bold shadow-[0_0_30px_rgba(235,195,21,0.55)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl font-bold">bolt</span>
              <span>PLAY NOW</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                openMultiplayerModal(selectedCatalogGame);
              }}
              className="px-8 py-4 rounded-xl bg-primary-container text-on-primary-container font-headline-sm uppercase tracking-wider font-bold shadow-[0_0_25px_rgba(139,44,255,0.6)] hover:bg-secondary-container transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl font-bold">group_add</span>
              <span>CREATE SQUAD ROOM</span>
            </button>
          </div>

          {/* Micro Feature Badges */}
          <div className="flex flex-wrap items-center gap-6 text-soft-lavender font-label-md pt-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary text-lg">tag</span>
              <span>Instant 6-Char Code</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-neon-cyan text-lg">devices</span>
              <span>Cross-Device Sync</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-neon-green text-lg">sports_esports</span>
              <span>11+ Desi Games Built-In</span>
            </div>
          </div>

          {/* Live Active Room Interactive Pill Card */}
          <div className="p-4 rounded-2xl bg-surface-purple/80 backdrop-blur-xl border border-purple-500/20 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container/30 border border-primary-container/40 flex items-center justify-center text-primary font-headline-sm text-2xl">
                👑
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-on-surface font-bold">Lobby #X7K92P</span>
                  <span className="px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green font-label-sm uppercase font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                    4/4 SQUAD
                  </span>
                </div>
                <span className="font-body-sm text-soft-lavender">Round 3/5: Chor Sipahi in progress</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-label-xs text-on-primary font-bold shadow-md">
                  A
                </span>
                <span className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-label-xs text-on-secondary font-bold shadow-md">
                  P
                </span>
                <span className="w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center font-label-xs text-surface-purple font-bold shadow-md">
                  K
                </span>
                <span className="w-8 h-8 rounded-full bg-tertiary flex items-center justify-center font-label-xs text-on-tertiary font-bold shadow-md">
                  R
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="p-2 ml-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors cursor-pointer"
                title="Copy Invite Link"
              >
                <span className="material-symbols-outlined text-lg">
                  {copiedLink ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Massive Cyber Mascot Artwork Frame */}
        <div className="lg:col-span-5 relative flex justify-center items-center">
          {/* Visual Glow Aura */}
          <div className="absolute inset-0 bg-gradient-to-tr from-primary-container via-secondary to-tertiary opacity-30 blur-3xl rounded-3xl -z-10" />

          {/* Spotlight Showcase Card Container */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(139,44,255,0.45)] bg-surface-container-low border border-purple-500/30 flex flex-col backdrop-blur-xl">
            {/* Header bar with Live Spotlight Tag and Arrows */}
            <div className="p-4 border-b border-purple-500/20 bg-surface-purple/90 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#48F078] animate-ping" />
                <span className="font-label-sm text-neon-green tracking-wider uppercase font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span> FEATURED SPOTLIGHT
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevSpotlight}
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all active:scale-90 shadow-sm cursor-pointer"
                  title="Previous Game"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button
                  onClick={handleNextSpotlight}
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all active:scale-90 shadow-sm cursor-pointer"
                  title="Next Game"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Quick Switcher Tabs */}
            <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto bg-surface-purple/60 border-b border-purple-500/10 no-scrollbar">
              {SPOTLIGHT_GAMES.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    setActiveSpotlightIdx(idx);
                  }}
                  className={`px-3 py-1 rounded-lg font-label-xs text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                    activeSpotlightIdx === idx
                      ? 'bg-primary-container text-on-primary-container shadow-sm'
                      : 'bg-surface-container text-soft-lavender hover:text-on-surface'
                  }`}
                >
                  {item.tabName}
                </button>
              ))}
            </div>

            {/* Artwork Showcase Banner */}
            <div className="relative h-64 w-full bg-surface-purple overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeGame.image}
                alt={activeGame.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = activeGame.fallbackImage;
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-purple via-transparent to-surface-purple/40 pointer-events-none" />

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 z-10">
                <span className={activeGame.trendingClass}>
                  {activeGame.trending}
                </span>
              </div>
              <div className="absolute top-3 right-3 z-10">
                <span className="px-2.5 py-1 rounded-full bg-surface-purple/90 border border-purple-500/20 text-neon-green font-label-sm text-xs font-bold flex items-center gap-1 backdrop-blur-md shadow-md">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>{activeGame.online}</span>
                </span>
              </div>

              {/* Bottom Artwork Meta Bar */}
              <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between text-xs text-soft-lavender bg-surface-purple/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/20">
                <span className="flex items-center gap-1 text-on-surface font-bold">
                  <span>{activeGame.duration}</span>
                </span>
                <span className="flex items-center gap-1 text-neon-cyan font-bold">
                  <span>{activeGame.players}</span>
                </span>
                <span className="flex items-center gap-1 text-tertiary font-bold">
                  <span className="material-symbols-outlined text-sm">star</span>
                  <span>{activeGame.rating}</span>
                </span>
              </div>
            </div>

            {/* Bottom Details & Play Action */}
            <div className="p-5 flex flex-col gap-3 bg-surface-container-low">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-on-surface font-bold">{activeGame.title}</h3>
                <span className={activeGame.categoryClass}>
                  {activeGame.category}
                </span>
              </div>
              <p className="font-body-sm text-soft-lavender line-clamp-2">
                {activeGame.desc}
              </p>

              {/* Live Room Waiting Status Bar */}
              <div className="p-2.5 rounded-xl bg-surface-purple/80 border border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center font-label-xs text-xs text-on-primary font-bold">
                      A
                    </span>
                    <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center font-label-xs text-xs text-on-secondary font-bold">
                      P
                    </span>
                    <span className="w-6 h-6 rounded-full bg-tertiary flex items-center justify-center font-label-xs text-xs text-on-tertiary font-bold">
                      K
                    </span>
                    <span className="w-6 h-6 rounded-full bg-neon-cyan flex items-center justify-center font-label-xs text-xs text-surface-purple font-bold">
                      R
                    </span>
                  </div>
                  <span className="font-label-sm text-soft-lavender">{activeGame.lobby}</span>
                </div>
                <span className="font-label-xs text-xs text-neon-green font-bold tracking-wider">
                  LOBBY READY
                </span>
              </div>

              {/* Action CTAs */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    router.push(activeGame.route);
                  }}
                  className="flex-1 py-3.5 rounded-xl bg-tertiary text-on-tertiary-fixed font-headline-sm text-base uppercase tracking-wider font-bold shadow-[0_0_25px_rgba(235,195,21,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl font-bold">bolt</span>
                  <span>PLAY INSTANTLY</span>
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    openMultiplayerModal(selectedCatalogGame);
                  }}
                  className="px-5 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-base uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(139,44,255,0.4)] hover:bg-secondary-container transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl font-bold">add</span>
                  <span>HOST ROOM</span>
                </button>
              </div>

              {/* Dot Pagination Indicator */}
              <div className="flex items-center justify-center gap-2 pt-1">
                {SPOTLIGHT_GAMES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      soundFx.playClick();
                      setActiveSpotlightIdx(i);
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeSpotlightIdx === i
                        ? 'w-6 bg-primary-container'
                        : 'w-2 bg-surface-container-high hover:bg-soft-lavender'
                    }`}
                    title={`Game ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
