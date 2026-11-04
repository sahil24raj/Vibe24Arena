'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import confetti from 'canvas-confetti';

const SPOTLIGHT_GAMES = [
  {
    id: 'chor-sipahi',
    tabName: '👑 Chor Sipahi',
    title: 'Chor Sipahi (Raja Mantri)',
    badge: 'SOCIAL BLUFF',
    tagline: 'ROYAL COURT DESI BLUFF',
    emoji: '👑🥷',
    duration: '2-4 Min',
    players: '4 Players',
    rating: '4.98',
    online: '1,240 Online',
    trending: '🔥 TRENDING #1',
    description: 'Raja gives the decree, Mantri investigates secretly, Sipahi finds the thief, and Chor bluffs for survival! Real-time voice & banter built-in.',
    squadWait: '3/4 Squad waiting',
    route: '/games/chor-sipahi',
    bgGradient: 'from-surface-purple via-primary-container/30 to-surface-container-high'
  },
  {
    id: 'auto-rush',
    tabName: '🛺 Auto Rush 3D',
    title: 'Auto Rush 3D 🛺💨',
    badge: '3D RACING',
    tagline: 'GURUGRAM GRAND PRIX',
    emoji: '🛺💨',
    duration: '2-5 Min',
    players: '8 Racers',
    rating: '4.98',
    online: '2,890 Online',
    trending: '🔥 POPULAR RACER',
    description: '8 Indian auto-rickshaws, real 3-wheel drift mechanics, dual nitro exhaust flames, and high-speed Delhi flyover street circuits!',
    squadWait: '7/8 Grid filled',
    route: '/games/auto-rush',
    bgGradient: 'from-surface-purple via-secondary-container/30 to-surface-container-high'
  },
  {
    id: 'indian-politics-arena',
    tabName: '⚔️ Politics Arena',
    title: 'Indian Politics Arena ⚔️🏛️',
    badge: 'SATIRICAL COMBAT',
    tagline: 'SANSAD SE SADAK TAK',
    emoji: '⚔️🏛️',
    duration: '2-4 Min',
    players: '1v1 / PvP',
    rating: '4.99',
    online: '1,840 Online',
    trending: '🔥 VIRAL MEME',
    description: 'Fight across Parliament, Election Rally, and 9 PM News Studio with hilarious netas, real arcade combos, and SHAKTI super moves!',
    squadWait: 'Lobby 1v1 Ready',
    route: '/games/indian-politics-arena',
    bgGradient: 'from-surface-purple via-tertiary-container/30 to-surface-container-high'
  },
  {
    id: 'escape-door',
    tabName: '🚪 Escape Door',
    title: 'Escape From The Door 🚪',
    badge: 'MYSTERY RISK',
    tagline: '10 DOORS OF DESTINY',
    emoji: '🚪⚡',
    duration: '1-3 Min',
    players: 'Solo / Squad',
    rating: '4.98',
    online: '1,120 Online',
    trending: '🔥 HIGH RISK',
    description: 'Choose wisely. Exactly ONE cyber vault door leads to survival across 10 tense rooms and high-stakes Endless Mode!',
    squadWait: 'Instant Match',
    route: '/games/escape-door',
    bgGradient: 'from-surface-purple via-neon-cyan/20 to-surface-container-high'
  }
];

export const VibeArenaHero: React.FC = () => {
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
      navigator.clipboard.writeText('https://vibearena.fun/play/room/X7K92P');
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
            <span className="w-2 h-2 rounded-full bg-neon-green -ml-3" />
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
            <Link
              href={activeGame.route}
              onClick={() => soundFx.playClick()}
              className="px-8 py-4 rounded-xl bg-tertiary text-on-tertiary-fixed font-headline-sm uppercase tracking-wider font-bold shadow-[0_0_30px_rgba(235,195,21,0.55)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-2xl font-bold">bolt</span>
              <span>PLAY NOW</span>
            </Link>

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
          <div className="relative w-full rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(139,44,255,0.45)] bg-surface-container-low border border-purple-500/20 flex flex-col backdrop-blur-xl">
            {/* Header Bar with Live Indicator & Quick Cycle Controls */}
            <div className="p-4 border-b border-purple-500/20 bg-surface-purple/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#48F078] animate-ping" />
                <span className="font-label-sm text-neon-green tracking-wider uppercase font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">local_fire_department</span> LIVE SPOTLIGHT
                </span>
              </div>

              {/* Tab Selector Arrows */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevSpotlight}
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center text-sm transition-all active:scale-90 cursor-pointer"
                  title="Previous Game"
                >
                  <span className="material-symbols-outlined text-base">chevron_left</span>
                </button>
                <button
                  onClick={handleNextSpotlight}
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center text-sm transition-all active:scale-90 cursor-pointer"
                  title="Next Game"
                >
                  <span className="material-symbols-outlined text-base">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Quick Tabs Navigation */}
            <div className="px-4 pt-2.5 pb-2 flex items-center gap-2 overflow-x-auto bg-surface-purple/50 no-scrollbar">
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

            {/* Hero Preview Canvas Banner */}
            <div
              className={`relative h-64 w-full bg-gradient-to-br ${activeGame.bgGradient} p-4 flex flex-col justify-between overflow-hidden group transition-colors duration-500`}
            >
              {/* Cyber Particles Backdrop */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary-container/30 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute left-10 -top-10 w-40 h-40 bg-secondary/20 rounded-full blur-2xl pointer-events-none" />

              {/* Badges Row */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full bg-tertiary text-on-tertiary-fixed font-label-sm font-bold uppercase tracking-wider shadow-md">
                  {activeGame.trending}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-surface-purple/90 border border-purple-500/20 text-neon-green font-label-sm font-bold flex items-center gap-1 backdrop-blur-md">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  {activeGame.online}
                </span>
              </div>

              {/* Center Cyber Game Graphic / Motif */}
              <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                <div className="w-20 h-20 rounded-2xl bg-surface-purple/90 border border-purple-500/30 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(139,44,255,0.5)] transform group-hover:scale-110 transition-transform duration-500">
                  {activeGame.emoji}
                </div>
                <span className="font-label-sm text-soft-lavender mt-2 tracking-widest uppercase font-bold">
                  {activeGame.tagline}
                </span>
              </div>

              {/* Floating Stats Pill Overlay */}
              <div className="relative z-10 flex items-center justify-between text-xs text-soft-lavender bg-surface-purple/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-500/20">
                <span className="flex items-center gap-1 text-on-surface font-bold">
                  <span>⏱️ {activeGame.duration}</span>
                </span>
                <span className="flex items-center gap-1 text-neon-green font-bold">
                  <span>👥 {activeGame.players}</span>
                </span>
                <span className="flex items-center gap-1 text-tertiary font-bold">
                  <span className="material-symbols-outlined text-sm">star</span> {activeGame.rating}
                </span>
              </div>
            </div>

            {/* Card Details & Instant Play Actions */}
            <div className="p-5 flex flex-col gap-3 bg-surface-container-low">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-on-surface font-bold">{activeGame.title}</h3>
                <span className="px-2 py-0.5 rounded bg-neon-green/20 text-neon-green font-label-sm uppercase font-bold">
                  {activeGame.badge}
                </span>
              </div>
              <p className="font-body-sm text-soft-lavender line-clamp-2">{activeGame.description}</p>

              {/* Quick Live Squad Teaser */}
              <div className="p-3 rounded-xl bg-surface-purple/80 border border-purple-500/20 flex items-center justify-between">
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
                  </div>
                  <span className="font-label-sm text-soft-lavender">{activeGame.squadWait}</span>
                </div>
                <span className="font-label-xs text-xs text-neon-cyan font-bold tracking-wider uppercase">
                  LOBBY READY
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href={activeGame.route}
                  onClick={() => soundFx.playClick()}
                  className="flex-1 py-3.5 rounded-xl bg-tertiary text-on-tertiary-fixed font-headline-sm text-base uppercase tracking-wider font-bold shadow-[0_0_25px_rgba(235,195,21,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-xl font-bold">bolt</span>
                  <span>PLAY INSTANTLY</span>
                </Link>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    openMultiplayerModal(selectedCatalogGame);
                  }}
                  className="px-4 py-3.5 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-base uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(139,44,255,0.4)] hover:bg-secondary-container transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xl font-bold">add</span>
                  <span>HOST ROOM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
