'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GAMES_CATALOG, GameItem, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Sparkles,
  Users,
  Swords,
  Coffee,
  Brain,
  GraduationCap,
  Play,
  Share2,
  Clock,
  Flame,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All Vibes', icon: Sparkles, color: 'text-[#F472B6]' },
  { id: 'meme', label: 'Trending Meme Vibes', icon: Flame, color: 'text-orange-400' },
  { id: 'school', label: 'School Vibes', icon: GraduationCap, color: 'text-amber-400' },
  { id: 'squad', label: 'Squad Vibes', icon: Users, color: 'text-[#D946EF]' }
];

export const PickYourVibeSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const { openMultiplayerModal } = useAppStore();

  const filteredGames = useMemo(() => {
    if (activeCategory === 'all') return GAMES_CATALOG;
    return GAMES_CATALOG.filter((g) => g.categoryKey === activeCategory);
  }, [activeCategory]);

  return (
    <section id="pick-your-vibe" className="w-full space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#D946EF] uppercase tracking-wider">
            <span>●</span>
            <span>CURATED ARCADE COLLECTION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
            PICK YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] to-[#06B6D4]">VIBE</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-sans max-w-xl">
            From 4-player social deduction to last-bench school nostalgia and high-speed mind battles. Choose your game and drop into the arena.
          </p>
        </div>

        {/* Total Count */}
        <div className="text-xs font-mono text-slate-500">
          Showing <span className="text-white font-bold">{filteredGames.length}</span> of {GAMES_CATALOG.length} Games
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                soundFx.playClick();
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#D946EF]/20 to-[#06B6D4]/20 border border-[#D946EF]/50 text-white shadow-sm'
                  : 'bg-[#10131D] border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
              <span>{cat.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Game Cards Grid - 2 balanced rows of 3 games */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game, idx) => {
          return (
            <div
              key={game.id}
              className="va-card rounded-2xl overflow-hidden flex flex-col group relative"
            >
              {/* Poster Image Container (CLEAN COVER - NO OVERLAY BADGES ON IMAGE) */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0A0C16]">
                <Image
                  src={game.bannerImage || `/games/${game.id}.jpg`}
                  alt={game.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Subtle Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#10131D] via-transparent to-black/20 opacity-80" />

                {/* Hover Quick Action Overlay */}
                <div className="absolute inset-0 bg-[#080A12]/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                  <Link
                    href={`/game/${game.id}`}
                    onClick={() => soundFx.playClick()}
                    className="px-4 py-2 rounded-xl va-btn-primary text-xs font-bold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Play Now</span>
                  </Link>

                  {game.multiplayer && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        soundFx.playClick();
                        openMultiplayerModal(game);
                      }}
                      className="px-3 py-2 rounded-xl va-btn-secondary text-xs font-bold flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform cursor-pointer"
                      title="Invite Squad to Room"
                    >
                      <Users className="w-3.5 h-3.5 text-[#06B6D4]" />
                      <span>Room</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  {/* Category & Multiplayer Badges MOVED BELOW COVER IMAGE */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-[10px] font-mono font-semibold text-slate-300">
                      {game.category}
                    </span>

                    {game.multiplayer ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#D946EF]/20 border border-[#D946EF]/40 text-[10px] font-mono font-bold text-[#F472B6]">
                        MULTIPLAYER
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-[10px] font-mono font-bold text-[#38BDF8]">
                        SOLO ARCADE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-white group-hover:text-[#F472B6] transition-colors truncate">
                      {game.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-400 font-sans line-clamp-2 leading-relaxed">
                    {game.tagline || game.description}
                  </p>
                </div>

                {/* Metadata Footer */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{game.duration || '1-2 min'}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 font-semibold">
                    <span>★</span>
                    <span>{game.rating || 4.9}</span>
                  </div>

                  <span className="text-slate-400 text-[10px] uppercase font-semibold">
                    {game.difficulty || 'Casual'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PickYourVibeSection;
