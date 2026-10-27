'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { GameCard } from '@/components/GameCard';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import { soundFx } from '@/lib/audio';
import { Flame, Search, Filter, Sparkles, Trophy, Swords, Zap, SlidersHorizontal } from 'lucide-react';

function GamesContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get('cat') || 'ALL';
  const initialQuery = searchParams.get('q') || '';

  const { openMultiplayerModal } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState<string>(
    initialCat === 'school' ? 'school' : initialCat === 'meme' ? 'meme' : initialCat === 'squad' ? 'squad' : 'ALL'
  );
  const [search, setSearch] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'plays' | 'duration'>('popular');

  const filterTabs = [
    { id: 'ALL', label: '🌟 ALL GAMES' },
    { id: 'meme', label: '🔥 TRENDING MEME VIBES' },
    { id: 'school', label: '🏫 SCHOOL VIBES' },
    { id: 'squad', label: '👥 SQUAD VIBES' }
  ];

  const filteredGames = useMemo(() => {
    let list = GAMES_CATALOG.filter((game) => {
      const matchesSearch =
        game.title.toLowerCase().includes(search.toLowerCase()) ||
        game.description.toLowerCase().includes(search.toLowerCase()) ||
        game.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === 'ALL') return true;
      return game.categoryKey === selectedFilter;
    });

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'plays') return b.playCount - a.playCount;
      if (sortBy === 'popular') return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0) || b.playCount - a.playCount;
      return 0;
    });

    return list;
  }, [selectedFilter, search, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      <MultiplayerLobbyModal />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 lg:p-8 rounded-3xl glass-panel border border-[#00F0FF]/25 bg-gradient-to-r from-[#0d121c] to-[#070a0e] shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/10 text-xs font-mono text-[#00F0FF] border border-[#00F0FF]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DISCOVER 12+ INSTANT BROWSER GAMES</span>
          </div>
          <h1 className="text-3xl font-black text-white font-display">GAME DISCOVERY ARENA</h1>
          <p className="text-xs text-gray-400 font-sans">
            Browse trending Indian memes, classroom nostalgia duels, and cognitive esports.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search titles, tags, memes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF] font-sans"
          />
        </div>
      </div>

      {/* Filter Tabs & Sort Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                soundFx.playClick();
                setSelectedFilter(tab.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold font-display transition-all ${
                selectedFilter === tab.id
                  ? 'bg-gradient-to-r from-[#00F0FF] to-[#ADFF2F] text-slate-950 shadow-md shadow-[#00F0FF]/20'
                  : 'bg-slate-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#00F0FF]" />
          <span>SORT:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 border border-gray-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#00F0FF]"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="plays">Most Played</option>
          </select>
        </div>
      </div>

      {/* Games Catalog Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              theme={game.categoryKey}
              onQuickPlay={() => openMultiplayerModal(game)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl glass-panel border border-gray-800 text-center space-y-3">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-bold text-white font-display">No mini-games matched your search</h3>
          <p className="text-xs text-gray-400 font-sans">Try searching for "Pen", "Cricket", "Modi", "Chai", or "Words"</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedFilter('ALL');
            }}
            className="cyber-button px-6 py-2 rounded-xl text-xs font-black text-slate-950 font-display"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono text-gray-500">Loading Games Catalog...</div>}>
      <GamesContent />
    </Suspense>
  );
}
