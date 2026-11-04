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
    { key: 'brain', label: '🧠 Brain Vibes' }
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-12 bg-surface-container-lowest relative border-y border-purple-500/10" id="create-hub">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header and Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="font-label-md text-primary font-bold uppercase tracking-widest">
                COMPLETE COLLECTION
              </span>
              <h2 className="font-headline-xl uppercase text-on-surface tracking-tight mt-1">
                ALL GAMES ARENA (11)
              </h2>
              <p className="font-body-md text-soft-lavender">
                No downloads needed. Swipe through all 11 instant games or summon your squad.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <button
                onClick={() => handleScroll(-380)}
                className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                title="Scroll Left"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={() => handleScroll(380)}
                className="w-12 h-12 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                title="Scroll Right"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => {
              const active = selectedVibe === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedVibe(cat.key as any);
                  }}
                  className={`px-4 py-2 rounded-xl font-label-sm font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-primary-container text-on-primary-container shadow-md'
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
          className="flex gap-6 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        >
          {filteredGames.map((game) => (
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
                  <span>{game.multiplayer ? 'MULTIPLAYER' : 'SOLO'} • {game.duration}</span>
                  <span className="text-neon-cyan font-bold uppercase">{game.difficulty} IQ</span>
                </div>

                <h3 className="font-headline-md text-on-surface font-bold truncate">{game.title}</h3>
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
          ))}
        </div>
      </div>
    </section>
  );
};
