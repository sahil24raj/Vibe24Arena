'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { JackpotterCard } from '@/components/JackpotterCard';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import { soundFx } from '@/lib/audio';
import {
  Flame,
  Search,
  Backpack,
  Brain,
  Coffee,
  Users,
  Zap,
  Sparkles,
  Gamepad2
} from 'lucide-react';

const CATEGORY_PILLS = [
  { id: 'ALL', label: '🌟 All Vibes', icon: Sparkles, color: 'text-white' },
  { id: 'meme', label: '🔥 Trending Meme Vibes', icon: Flame, color: 'text-orange-400' },
  { id: 'school', label: '🏫 School Vibes', icon: Backpack, color: 'text-amber-400' },
  { id: 'squad', label: '👥 Squad Vibes', icon: Users, color: 'text-[#D946EF]' }
];

function CategoriesContent() {
  const searchParams = useSearchParams();
  const catQuery = searchParams.get('cat') || searchParams.get('category') || 'ALL';
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
    <div className="space-y-8 pb-16">
      <MultiplayerLobbyModal />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 p-6 sm:p-8 rounded-3xl border border-[#1E2844] bg-gradient-to-r from-[#0C1220] via-[#0E1528] to-[#080C16] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-[#00F0FF]/10 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF0055]/15 border border-[#FF0055]/30 text-xs font-mono text-[#FF0055] font-bold">
            <Flame className="w-3.5 h-3.5" />
            <span>TRENDING VIBES & GAME HUBS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 font-display uppercase tracking-wide">
            EXPLORE ALL VIBES
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-sans max-w-xl leading-relaxed">
            From 90s school bench duels to rapid cognitive battles and viral Indian meme games — pick your vibe and jump in instantly.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80 relative z-10">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search games, vibes, roasts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#080B14] border border-[#1E2844] focus:border-[#00F0FF] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-all font-sans"
          />
        </div>
      </div>

      {/* Category Tabs Bar */}
      <section className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2.5 min-w-max p-0.5">
          {CATEGORY_PILLS.map((pill) => {
            const Icon = pill.icon;
            const isSelected = selectedCat === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCat(pill.id);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-all duration-200 border whitespace-nowrap leading-none ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#121A30] to-[#1A2544] border-[#00F0FF] text-white shadow-lg shadow-[#00F0FF]/20 ring-1 ring-[#00F0FF]/40 scale-[1.02]'
                    : 'bg-[#0E1322] border-[#1C2640] text-gray-400 hover:text-white hover:border-gray-600 hover:bg-[#131A2E]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${pill.color}`} />
                <span>{pill.label}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Summary & Total Count */}
      <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-b border-[#1A243C] pb-3">
        <span className="flex items-center gap-2">
          <span>Showing:</span>
          <strong className="text-[#00F0FF]">
            {CATEGORY_PILLS.find((p) => p.id === selectedCat)?.label || 'All Vibes'}
          </strong>
        </span>
        <span>
          <strong className="text-white">{filtered.length}</strong> Games Found
        </span>
      </div>

      {/* Clean Grid of Games with 100% Uncropped Posters */}
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
        <div className="p-12 text-center rounded-3xl bg-[#0E1322] border border-[#1A243C] space-y-3">
          <Gamepad2 className="w-12 h-12 text-gray-500 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-white font-display">No games found matching your search.</h3>
          <p className="text-xs text-gray-400 font-sans">
            Try searching for another game like Pen Flip, Cricket, Modi Run, or switch to All Vibes.
          </p>
          <button
            onClick={() => {
              soundFx.playClick();
              setSelectedCat('ALL');
              setSearch('');
            }}
            className="px-5 py-2 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 text-[#00F0FF] font-mono text-xs font-bold hover:bg-[#00F0FF]/25 transition-all"
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
        <div className="p-12 text-center text-xs font-mono text-[#00F0FF]">
          Loading Trending Vibes...
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
