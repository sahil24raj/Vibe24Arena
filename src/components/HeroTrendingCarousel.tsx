'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore, GameItem } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

interface BattleCardData {
  id: string;
  title: string;
  badge: string;
  badgeBg: string;
  rating: string;
  statsLeft: string;
  statsRight: string;
  statsRightColor: string;
  description: string;
  buttonActionType: 'ROOM' | 'SOLO';
  image: string;
  route: string;
  hoverGlow: string;
}

const TOP_BATTLES: BattleCardData[] = [
  {
    id: 'auto-rush',
    title: 'Auto Rush 3D 🛺💨',
    badge: 'Squad Thrills',
    badgeBg: 'bg-secondary-container/90 text-on-secondary',
    rating: '4.98',
    statsLeft: 'MULTIPLAYER • 2-5 MIN',
    statsRight: 'MEDIUM IQ',
    statsRightColor: 'text-neon-cyan',
    description: 'The Gurugram Grand Prix! 8 Indian auto-rickshaws, real 3-wheel drift mechanics & nitrous overdrive!',
    buttonActionType: 'ROOM',
    image: '/games/auto-rush.jpg',
    route: '/games/auto-rush',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(139,44,255,0.4)]'
  },
  {
    id: 'indian-politics-arena',
    title: 'Indian Politics Arena ⚔️🏛️',
    badge: 'Trending Meme',
    badgeBg: 'bg-tertiary text-on-tertiary-fixed',
    rating: '4.99',
    statsLeft: 'MULTIPLAYER • 2-4 MIN',
    statsRight: 'HARD CHAOS',
    statsRightColor: 'text-error',
    description: 'Sansad Se Sadak Tak, Fight Karo! 8 satirical netas, real arcade combat engine and super attacks!',
    buttonActionType: 'ROOM',
    image: '/games/indian-politics-arena.jpg',
    route: '/games/indian-politics-arena',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(235,195,21,0.4)]'
  },
  {
    id: 'chor-sipahi',
    title: 'Chor Sipahi (Raja Mantri) 👑🥷',
    badge: 'Squad Classic',
    badgeBg: 'bg-neon-green/20 text-neon-green',
    rating: '4.98',
    statsLeft: '4 PLAYERS • 2-4 MIN',
    statsRight: 'SOCIAL BLUFF',
    statsRightColor: 'text-neon-green',
    description: 'Raja orders, Mantri hides, Sipahi investigates, Chor bluffs! The ultimate desi party deduction game.',
    buttonActionType: 'ROOM',
    image: '/games/chor-sipahi.jpg',
    route: '/games/chor-sipahi',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(72,240,120,0.4)]'
  },
  {
    id: 'escape-door',
    title: 'Escape From The Door 🚪',
    badge: 'Mystery Risk',
    badgeBg: 'bg-secondary-container/80 text-on-secondary',
    rating: '4.98',
    statsLeft: 'SOLO ARCADE • 1-3 MIN',
    statsRight: '142K PLAYS',
    statsRightColor: 'text-tertiary',
    description: 'Choose wisely. Exactly ONE cyber door leads to survival across 10 tense rooms and Endless Mode!',
    buttonActionType: 'SOLO',
    image: '/games/escape-door.jpg',
    route: '/games/escape-door',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]'
  },
  {
    id: 'genz-protest-run',
    title: 'GenZ Protest Run 🏃📢',
    badge: 'Desi Meme',
    badgeBg: 'bg-tertiary text-on-tertiary-fixed',
    rating: '4.99',
    statsLeft: 'SOLO ARCADE • 1-3 MIN',
    statsRight: 'CHAOS RUNNER',
    statsRightColor: 'text-neon-cyan',
    description: 'Dodge barricades, grab kulhad chai boosts, and dash your way through iconic Delhi checkpoints!',
    buttonActionType: 'SOLO',
    image: '/games/genz-protest-run.jpg',
    route: '/games/genz-protest-run',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(235,195,21,0.4)]'
  }
];

export const HeroTrendingCarousel: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { openMultiplayerModal } = useAppStore();

  const handleScroll = (offset: number) => {
    soundFx.playClick();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-10 bg-surface-container-lowest/80 border-y border-purple-500/10 relative">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Section Header with Carousel Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-tertiary font-label-md font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">local_fire_department</span>
              <span>HYPE ZONE</span>
            </div>
            <h2 className="font-headline-xl uppercase text-on-surface tracking-tight mt-1">
              TOP FEATURED BATTLES
            </h2>
            <p className="font-body-md text-soft-lavender">
              Jump straight into the most played rooms across India right now.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleScroll(-380)}
              className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
              title="Previous Battle"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => handleScroll(380)}
              className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
              title="Next Battle"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Carousel Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {TOP_BATTLES.map((battle) => {
            const catalogGame =
              GAMES_CATALOG.find((g) => g.id === battle.id) || GAMES_CATALOG[0];

            return (
              <div
                key={battle.id}
                className={`min-w-[320px] sm:min-w-[360px] max-w-[380px] snap-start shrink-0 rounded-2xl bg-surface-container p-4 flex flex-col justify-between shadow-xl ${battle.hoverGlow} transition-all group border border-purple-500/20`}
              >
                <div className="flex flex-col gap-2">
                  <div className="w-full h-48 rounded-xl bg-surface-purple overflow-hidden relative">
                    <img
                      src={battle.image}
                      alt={battle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded font-label-sm font-bold uppercase backdrop-blur-md ${battle.badgeBg}`}
                    >
                      {battle.badge}
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-surface-purple/90 text-tertiary font-label-sm font-bold flex items-center gap-1 backdrop-blur-md">
                      <span className="material-symbols-outlined text-sm">star</span> {battle.rating}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-soft-lavender font-label-sm pt-1">
                    <span>{battle.statsLeft}</span>
                    <span className={`font-bold ${battle.statsRightColor}`}>{battle.statsRight}</span>
                  </div>

                  <h3 className="font-headline-md text-on-surface font-bold truncate">{battle.title}</h3>
                  <p className="font-body-sm text-soft-lavender line-clamp-2">{battle.description}</p>
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <Link
                    href={battle.route}
                    onClick={() => soundFx.playClick()}
                    className="flex-1 py-3 rounded-lg bg-primary-container text-on-primary-container font-label-lg font-bold hover:bg-secondary-container transition-colors shadow-md text-center flex items-center justify-center gap-1.5"
                  >
                    <span>PLAY NOW</span>
                  </Link>

                  <button
                    onClick={() => {
                      soundFx.playClick();
                      if (battle.buttonActionType === 'ROOM') {
                        openMultiplayerModal(catalogGame);
                      } else {
                        window.location.href = battle.route;
                      }
                    }}
                    className="px-4 py-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg font-bold transition-colors cursor-pointer"
                  >
                    {battle.buttonActionType}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
