'use client';

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
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
  fallbackImage: string;
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3MAkCfpxx00r712BIkoTKOUpsBSQTNmzdqjpvtDS4iX-UAm3zta3HhBbr33rgC6Squ_hxz6U-uwejTxj_u6wxpiySHtw1O-M4vx51UF58VPzzT7WFb2J4aJehVpAs8puXDh6nQS6F9uTaYntKXYNxcm0hmAzLUIyedDKzYVNEss7VaGGplA5suPzIOvRqhEQK37IzEy8CjWTe9LHTnjj4FM1igvGhnxg_4ROnTCRJ',
    fallbackImage: '/games/auto-rush.jpg',
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQXtRaL_0IA_rot7ufXTnrPoTulhYC7-sz8NO78uxzyvxNnmHWEjgQIA0Uql3_SOM4jcI8VwJYOA-Mt5hlpwK7R5pO_-yFLjm_9qxYkw9FnK67RJuzFB-JTNausSYQiq38bTMLlCogIZRQw8xy6oKTgY5kmIfYmBKKAwopB2LQfnILDSecO0pmxTZDqUh-uozthnVxUNIvtiHlb8wFENMmQaV5Amw8OeeDRcAREUaN',
    fallbackImage: '/games/indian-politics-arena.jpg',
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3aJre89_I3R41MIBjqQRndMhohVqrvJy-jZ4wEDb-T90foAKHOAOat9MXcJzNQlgyVcRdS02B2aUO4AvRg5YMpi9wIOK0Ve854h1_Z3M5P0-64OFlxsvTJGZs5-1ajO6REkRL5y8LidPY5ITxAM1AKoJS1W673BVzp3orhRndkwQBA0ItFjlQmBcErK0MFEamU--QVLgqliGYFUdtt24gOuladRaMvaZtZVcUWrKw',
    fallbackImage: '/games/chor-sipahi.jpg',
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBn_msyxAAqaqvb3m5sWGKi9LlUE4N_9o7pNf_2dEDs2UU2O6kJgFSwSxx9emifkQSx4E9fDQxwIibIjVPpx_0u26iQDgj6e07mukEAEbAZpX2CF8pXS2ZxL9AVBN2OFCI2YSzNCZgJp1CRMvgy7hlbJtX5VGcoFUlZnKzKu1_8BGGVyymgbzIddQ1so8WWnCKbnhXKq60TzyNrYt0jT3eYp14ybOSpYrjCPM5j1CEs',
    fallbackImage: '/games/escape-door.jpg',
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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDopg86fUCR_uCd2RDxWHzvuykODEbs7tasqB2tFTnJVEABiOhtpf_tAiZD8lI4TtzPJxg11CkEfEbKITdSHpRlZtTaQ7TMbkfy8tJ6oHezsJbruylxEp1q3waJ7aybawr-MB7Uoobqi7nvBLVv2TsfIB97Zyw4WY16CrHWEwBjfg1daDlfgN5fZcUBrE8U2zkmXdF6aVnP5bQXp5fpLJd9Dyh1MvitDIYE7HK4hvio',
    fallbackImage: '/games/genz-protest-run.jpg',
    route: '/games/genz-protest-run',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(235,195,21,0.4)]'
  }
];

export const HeroTrendingCarousel: React.FC = () => {
  const router = useRouter();
  const carouselRef = useRef<HTMLDivElement>(null);
  const { openMultiplayerModal } = useAppStore();

  const handleScroll = (amount: number) => {
    soundFx.playClick();
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  const handlePlayNow = (battle: BattleCardData) => {
    soundFx.playClick();
    router.push(battle.route);
  };

  const handleActionRoom = (battle: BattleCardData) => {
    soundFx.playClick();
    const game = GAMES_CATALOG.find((g) => g.id === battle.id) || GAMES_CATALOG[0];
    if (battle.buttonActionType === 'ROOM') {
      openMultiplayerModal(game);
    } else {
      router.push(battle.route);
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-10 bg-surface-container-lowest/80 relative">
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
              onClick={() => handleScroll(-360)}
              className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
              title="Previous Battles"
              aria-label="Previous Battles"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => handleScroll(360)}
              className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
              title="Next Battles"
              aria-label="Next Battles"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Carousel Scroll Container */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {TOP_BATTLES.map((battle) => (
            <div
              key={battle.id}
              className={`min-w-[320px] sm:min-w-[360px] max-w-[380px] snap-start shrink-0 rounded-2xl bg-surface-container p-4 flex flex-col justify-between shadow-xl ${battle.hoverGlow} transition-all group border border-purple-500/20`}
            >
              <div className="flex flex-col gap-2.5">
                <div className="w-full h-48 rounded-xl bg-surface-purple overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={battle.image}
                    alt={battle.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = battle.fallbackImage;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className={`absolute top-3 left-3 px-2.5 py-1 rounded font-label-sm font-bold uppercase backdrop-blur-md shadow-md ${battle.badgeBg}`}>
                    {battle.badge}
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-surface-purple/90 text-tertiary font-label-sm font-bold flex items-center gap-1 backdrop-blur-md shadow-md">
                    <span className="material-symbols-outlined text-sm">star</span>
                    <span>{battle.rating}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-soft-lavender font-label-sm pt-1">
                  <span>{battle.statsLeft}</span>
                  <span className={`font-bold ${battle.statsRightColor}`}>{battle.statsRight}</span>
                </div>

                <h3 className="font-headline-md text-on-surface font-bold">{battle.title}</h3>

                <p className="font-body-sm text-soft-lavender line-clamp-2">
                  {battle.description}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => handlePlayNow(battle)}
                  className="flex-1 py-3 rounded-lg bg-primary-container text-on-primary-container font-label-lg font-bold hover:bg-secondary-container transition-colors shadow-md cursor-pointer"
                >
                  PLAY NOW
                </button>
                <button
                  onClick={() => handleActionRoom(battle)}
                  className="px-4 py-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-lg font-bold transition-colors cursor-pointer"
                >
                  {battle.buttonActionType}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
