'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { JackpotterCard } from '@/components/JackpotterCard';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import { soundFx } from '@/lib/audio';

const CATEGORY_PILLS = [
  { id: 'ALL', label: 'All Vibes', emoji: '🌟' },
  { id: 'meme', label: 'Meme Vibes', emoji: '🔥' },
  { id: 'school', label: 'School Vibes', emoji: '🎒' },
  { id: 'squad', label: 'Squad Vibes', emoji: '👥' },
  { id: 'brain', label: 'Brain Vibes', emoji: '🧠' }
];

function CategoriesContent() {
  const searchParams = useSearchParams();
  const catQuery = searchParams.get('cat') || searchParams.get('category') || searchParams.get('vibe') || 'ALL';
  const searchQueryParam = searchParams.get('q') || '';

  const [selectedCat, setSelectedCat] = useState<string>(catQuery);
  const [search, setSearch] = useState<string>(searchQueryParam);
  const { openMultiplayerModal } = useAppStore();

  useEffect(() => {
    if (catQuery) {
      setSelectedCat(catQuery);
    }
  }, [catQuery]);

  useEffect(() => {
    if (searchQueryParam) {
      setSearch(searchQueryParam);
    }
  }, [searchQueryParam]);

  const filtered = GAMES_CATALOG.filter((game) => {
    let matchesCat = false;
    if (selectedCat === 'ALL') {
      matchesCat = true;
    } else {
      matchesCat = game.categoryKey === selectedCat;
    }

    const matchesSearch =
      !search.trim() ||
      game.title.toLowerCase().includes(search.toLowerCase()) ||
      game.description.toLowerCase().includes(search.toLowerCase()) ||
      game.tagline.toLowerCase().includes(search.toLowerCase());

    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto pt-6">
      <MultiplayerLobbyModal />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-6 sm:p-8 rounded-3xl border border-purple-500/20 bg-surface-purple/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-primary-container/20 via-secondary/10 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-purple-500/20 text-xs font-label-sm text-neon-green font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
            <span>CATEGORIES &amp; MODES</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-headline-xl uppercase text-on-surface tracking-tight font-bold">
            EXPLORE ALL VIBES (11)
          </h1>
          <p className="font-body-md text-soft-lavender max-w-xl leading-relaxed">
            From last-bench school nostalgia to rapid cognitive battles and viral Indian meme fighters — pick your vibe and jump in instantly.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80 relative z-10">
          <span className="material-symbols-outlined text-soft-lavender text-lg absolute left-3.5 top-2.5 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search games, vibes, roasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-low border border-purple-500/20 focus:border-primary-container rounded-xl pl-10 pr-4 py-2.5 font-body-sm text-on-surface placeholder:text-soft-lavender/60 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Category Tabs Bar */}
      <section className="overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-2.5 min-w-max p-0.5">
          {CATEGORY_PILLS.map((pill) => {
            const isSelected = selectedCat === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCat(pill.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-label-md font-bold transition-all duration-200 border whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-primary-container text-on-primary-container border-primary shadow-[0_0_16px_rgba(139,44,255,0.4)]'
                    : 'bg-surface-container border-purple-500/10 text-soft-lavender hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                <span>{pill.emoji}</span>
                <span>{pill.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Summary & Total Count */}
      <div className="flex items-center justify-between text-xs font-label-md text-soft-lavender border-b border-purple-500/10 pb-3">
        <span className="flex items-center gap-2">
          <span>Active Filter:</span>
          <strong className="text-tertiary">
            {CATEGORY_PILLS.find((p) => p.id === selectedCat)?.label || 'All Vibes'}
          </strong>
        </span>
        <span>
          <strong className="text-on-surface">{filtered.length}</strong> Games Found
        </span>
      </div>

      {/* Clean Grid of Games */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((game) => (
            <div key={game.id} className="h-full">
              <JackpotterCard
                game={game}
                onQuickPlay={() => openMultiplayerModal(game)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-surface-container border border-purple-500/20 space-y-3">
          <span className="material-symbols-outlined text-4xl text-soft-lavender mx-auto">
            sports_esports
          </span>
          <h3 className="font-headline-sm text-on-surface font-bold">No games found matching your search.</h3>
          <p className="font-body-sm text-soft-lavender">
            Try searching for another game like Pen Flip, Cricket, Auto Rush, or switch to All Vibes.
          </p>
          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedCat('ALL');
              setSearch('');
            }}
            className="px-5 py-2.5 rounded-xl bg-tertiary text-on-tertiary-fixed font-label-sm font-bold shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            Clear Filters &rarr;
          </button>
        </div>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center font-label-md text-primary">
          Loading Trending Vibes...
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
