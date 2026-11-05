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
    badge: '3D Racing',
    badgeBg: 'bg-secondary-container/90 text-on-secondary',
    rating: '4.98',
    statsLeft: 'SOLO RACER • 2-5 MIN',
    statsRight: 'MEDIUM IQ',
    statsRightColor: 'text-neon-cyan',
    description: 'The Gurugram Grand Prix! 8 Indian auto-rickshaws, real 3-wheel drift mechanics & nitrous overdrive!',
    buttonActionType: 'SOLO',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3MAkCfpxx00r712BIkoTKOUpsBSQTNmzdqjpvtDS4iX-UAm3zta3HhBbr33rgC6Squ_hxz6U-uwejTxj_u6wxpiySHtw1O-M4vx51UF58VPzzT7WFb2J4aJehVpAs8puXDh6nQS6F9uTaYntKXYNxcm0hmAzLUIyedDKzYVNEss7VaGGplA5suPzIOvRqhEQK37IzEy8CjWTe9LHTnjj4FM1igvGhnxg_4ROnTCRJ',
    fallbackImage: '/games/auto-rush.jpg',
    route: '/games/auto-rush',
    hoverGlow: 'hover:shadow-[0_0_30px_rgba(139,44,255,0.4)]'
  },
  {
    id: 'indian-politics-arena',
    title: 'Indian Politics Arena ⚔️🏛️',
    badge: 'Meme Fighter',
    badgeBg: 'bg-tertiary text-on-tertiary-fixed',
    rating: '4.99',
    statsLeft: 'SOLO ARCADE • 2-4 MIN',
    statsRight: 'HARD CHAOS',
    statsRightColor: 'text-error',
    description: 'Sansad Se Sadak Tak, Fight Karo! 8 satirical netas, real arcade combat engine and super attacks!',
    buttonActionType: 'SOLO',
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
    <section className="w-full px-4 sm:px-8 xl:px-14 py-14 bg-surface-container-lowest/80 relative">
      <div className="max-w-[1720px] mx-auto flex flex-col gap-6">
        {/* Section Header with Carousel Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-tertiary font-label-md font-bold uppercase tracking-widest">
              <span className="material-symbols-outlined text-lg">local_fire_department</span>
              <span>HYPE ZONE</span>
            </div>
            <h2 className="font-headline-xl uppercase text-on-surface tracking-tight mt-1 text-3xl sm:text-4xl">
              TOP FEATURED BATTLES
            </h2>
            <p className="font-body-lg text-soft-lavender">
              Jump straight into the most played rooms across India right now.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleScroll(-420)}
              className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
              title="Previous Battles"
              aria-label="Previous Battles"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              onClick={() => handleScroll(420)}
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
          className="flex gap-7 overflow-x-auto pb-5 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {TOP_BATTLES.map((battle) => (
            <div
              key={battle.id}
              className={`min-w-[360px] sm:min-w-[420px] max-w-[440px] snap-start shrink-0 rounded-3xl bg-surface-container p-5 sm:p-6 flex flex-col justify-between shadow-2xl ${battle.hoverGlow} transition-all group border border-purple-500/20 hover:border-primary/50`}
            >
              <div className="flex flex-col gap-3">
                {/* Clean Top Bar (Above Cover) */}
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl font-label-md font-bold uppercase tracking-wider text-xs ${battle.badgeBg}`}>
                    {battle.badge}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-purple/80 border border-purple-500/20 text-tertiary font-label-md font-bold">
                    <span className="material-symbols-outlined text-sm leading-none">star</span>
                    <span>{battle.rating}</span>
                  </div>
                </div>

                {/* Pure Clean Artwork Cover - 16/9 aspect ratio prevents cutting off */}
                <div className="w-full aspect-[16/9] rounded-2xl bg-surface-purple overflow-hidden relative border border-purple-500/10 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={battle.image}
                    alt={battle.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = battle.fallbackImage;
                    }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <div className="flex items-center justify-between text-soft-lavender font-label-md pt-1 px-1">
                  <span className="font-semibold">{battle.statsLeft}</span>
                  <span className={`font-bold ${battle.statsRightColor}`}>{battle.statsRight}</span>
                </div>

                <div className="px-1 flex flex-col gap-1">
                  <h3 className="text-xl sm:text-2xl font-headline-sm text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                    {battle.title}
                  </h3>
                  <p className="font-body-md text-soft-lavender line-clamp-2 min-h-[44px]">
                    {battle.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mt-5 pt-3 border-t border-purple-500/15">
                <button
                  onClick={() => handlePlayNow(battle)}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-md font-bold hover:bg-secondary-container hover:scale-[1.02] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>PLAY NOW</span>
                  <span className="material-symbols-outlined text-base">bolt</span>
                </button>
                <button
                  onClick={() => handleActionRoom(battle)}
                  className="px-4 py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md font-bold transition-all hover:scale-[1.02] cursor-pointer"
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
