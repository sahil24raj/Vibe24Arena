'use client';

import React, { useState, useRef, useMemo } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore, GameItem } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

export const CreateHubSection: React.FC = () => {
  const [selectedVibe, setSelectedVibe] = useState<'all' | 'meme' | 'school' | 'squad' | 'brain'>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { openMultiplayerModal } = useAppStore();

  const handleScroll = (amt: number) => {
    soundFx.playClick();
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amt, behavior: 'smooth' });
    }
  };

  const filteredGames = useMemo(() => {
    if (selectedVibe === 'all') return GAMES_CATALOG;
    return GAMES_CATALOG.filter((g) => g.categoryKey === selectedVibe);
  }, [selectedVibe]);

  const categories = [
    { key: 'all', label: `All Vibes (${GAMES_CATALOG.length})` },
    { key: 'meme', label: '🔥 Meme Vibes' },
    { key: 'school', label: '🎒 School Vibes' },
    { key: 'squad', label: '👥 Squad Vibes' },
    { key: 'brain', label: '🧠 Mind Game Vibes' }
  ];

  return (
    <section className="w-full px-4 sm:px-8 xl:px-14 py-14 bg-surface-container-lowest relative border-y border-purple-500/10" id="create-hub">
      <div className="max-w-[1720px] mx-auto flex flex-col gap-8">
        {/* Header and Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-label-md text-primary font-bold uppercase tracking-widest">
                COMPLETE COLLECTION
              </span>
              <h2 className="font-headline-xl uppercase text-on-surface tracking-tight mt-1 text-3xl sm:text-4xl">
                ALL GAMES ARENA (11)
              </h2>
              <p className="font-body-lg text-soft-lavender">
                No downloads needed. Swipe through all 11 instant games or summon your squad.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => handleScroll(-420)}
                className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                title="Scroll Left"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => handleScroll(420)}
                className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                title="Scroll Right"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2.5 pt-1">
            {categories.map((cat) => {
              const active = selectedVibe === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedVibe(cat.key as any);
                  }}
                  className={`px-4 py-2.5 rounded-xl font-label-md font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-primary-container text-on-primary-container shadow-[0_0_16px_rgba(139,44,255,0.4)] scale-105'
                      : 'bg-surface-container text-soft-lavender hover:text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-7 overflow-x-auto pb-5 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {filteredGames.map((game) => (
            <div
              key={game.id}
              className="min-w-[360px] sm:min-w-[420px] max-w-[440px] snap-start shrink-0 rounded-3xl bg-surface-container p-5 sm:p-6 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_35px_rgba(139,44,255,0.4)] transition-all group border border-purple-500/20 hover:border-primary/50"
            >
              <div className="flex flex-col gap-3">
                {/* Clean Top Bar (Above Cover) */}
                <div className="flex items-center justify-between gap-2 px-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface-container-high border border-purple-500/20 text-xs font-label-md font-bold text-soft-lavender uppercase tracking-wider">
                    {game.categoryKey === 'meme' && <span className="text-tertiary">🔥 Meme Vibe</span>}
                    {game.categoryKey === 'school' && <span className="text-neon-cyan">🎒 School Vibe</span>}
                    {game.categoryKey === 'squad' && <span className="text-primary">👥 Squad Vibe</span>}
                    {game.categoryKey === 'brain' && <span className="text-neon-green">🧠 Mind Game Vibe</span>}
                  </span>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-purple/80 border border-purple-500/20 text-tertiary font-label-md font-bold">
                    <span className="material-symbols-outlined text-sm leading-none">star</span>
                    <span>{game.rating}</span>
                  </div>
                </div>

                {/* Pure Clean Artwork Cover - 16/9 aspect ratio prevents cutting off */}
                <Link
                  href={`/games/${game.slug || game.id}`}
                  onClick={() => soundFx.playClick()}
                  className="w-full aspect-[16/9] rounded-2xl bg-surface-purple overflow-hidden relative flex items-center justify-center block group border border-purple-500/10"
                >
                  {game.bannerImage ? (
                    <img
                      src={game.bannerImage}
                      alt={game.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-7xl">{game.thumbnail}</span>
                  )}
                </Link>

                <div className="flex items-center justify-between text-soft-lavender font-label-md pt-1 px-1">
                  <span className="font-semibold">{game.multiplayer ? '👥 MULTIPLAYER ARENA' : '🕹️ SOLO ARCADE'} • {game.duration}</span>
                  <span className="text-neon-cyan font-bold uppercase tracking-wider">{game.difficulty} IQ</span>
                </div>

                <div className="px-1 flex flex-col gap-1">
                  <Link
                    href={`/games/${game.slug || game.id}`}
                    onClick={() => soundFx.playClick()}
                  >
                    <h3 className="text-xl sm:text-2xl font-headline-sm text-on-surface font-bold truncate group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                  </Link>
                  <p className="font-body-md text-soft-lavender line-clamp-2 min-h-[44px]">
                    {game.tagline || game.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 mt-5 pt-3 border-t border-purple-500/15">
                {game.multiplayer ? (
                  <>
                    <Link
                      href={`/games/${game.slug || game.id}`}
                      onClick={() => soundFx.playClick()}
                      className="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-md font-bold hover:bg-secondary-container hover:scale-[1.02] transition-all shadow-md text-center flex items-center justify-center gap-1.5"
                    >
                      <span>PLAY NOW</span>
                      <span className="material-symbols-outlined text-base">bolt</span>
                    </Link>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        openMultiplayerModal(game);
                      }}
                      className="px-5 py-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md font-bold transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-base text-primary">groups</span>
                      <span>ROOM</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/games/${game.slug || game.id}`}
                    onClick={() => soundFx.playClick()}
                    className="w-full py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-md font-bold hover:bg-secondary-container hover:scale-[1.02] transition-all shadow-md text-center flex items-center justify-center gap-2"
                  >
                    <span>PLAY SOLO ARCADE</span>
                    <span className="material-symbols-outlined text-base">sports_esports</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

