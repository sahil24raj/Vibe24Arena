'use client';

import React from 'react';
import Link from 'next/link';
import { GameItem } from '@/types';
import { soundFx } from '@/lib/audio';
import { useAppStore } from '@/store/useAppStore';

interface JackpotterCardProps {
  game: GameItem;
  size?: 'normal' | 'compact' | 'featured';
  onQuickPlay?: (game: GameItem) => void;
}

const getCategoryPill = (key?: string) => {
  switch (key) {
    case 'meme':
      return {
        label: 'Meme Vibes',
        emoji: '🔥',
        className: 'text-tertiary bg-tertiary/10 border-tertiary/30'
      };
    case 'school':
      return {
        label: 'School Vibes',
        emoji: '🎒',
        className: 'text-neon-cyan bg-neon-cyan/10 border-neon-cyan/30'
      };
    case 'squad':
      return {
        label: 'Squad Vibes',
        emoji: '👥',
        className: 'text-primary bg-primary/10 border-primary/30'
      };
    case 'brain':
      return {
        label: 'Mind Game Vibes',
        emoji: '🧠',
        className: 'text-neon-green bg-neon-green/10 border-neon-green/30'
      };
    default:
      return {
        label: 'Desi Vibes',
        emoji: '🎮',
        className: 'text-soft-lavender bg-surface-container-high border-purple-500/20'
      };
  }
};

export const JackpotterCard: React.FC<JackpotterCardProps> = ({
  game,
  size = 'normal',
  onQuickPlay
}) => {
  const { openMultiplayerModal } = useAppStore();
  const catPill = getCategoryPill(game.categoryKey);

  return (
    <div className="rounded-3xl bg-surface-container p-5 sm:p-6 flex flex-col justify-between shadow-2xl hover:shadow-[0_0_40px_rgba(139,44,255,0.45)] hover:-translate-y-1.5 transition-all duration-300 group border border-purple-500/20 hover:border-primary/50 h-full">
      <div className="flex flex-col gap-3.5">
        {/* Card Header Bar (Above Image) - Displays Category & Rating so cover is 100% clean */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-label-md font-bold uppercase tracking-wider text-xs ${catPill.className}`}>
            <span>{catPill.emoji}</span>
            <span>{catPill.label}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-purple/80 border border-purple-500/20 text-tertiary font-label-md font-bold shadow-sm">
            <span className="material-symbols-outlined text-sm leading-none text-tertiary">star</span>
            <span>{game.rating}</span>
          </div>
        </div>

        {/* Pure Clean Poster Viewport - 16/9 aspect ratio prevents any part of the cover from getting cut off */}
        <Link
          href={`/games/${game.slug || game.id}`}
          onClick={() => soundFx.playClick()}
          className="w-full aspect-[16/9] rounded-2xl bg-surface-purple overflow-hidden relative flex items-center justify-center block group border border-purple-500/10 shadow-inner"
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

        {/* Metadata (Below Cover) */}
        <div className="flex items-center justify-between text-soft-lavender font-label-md pt-0.5 px-1">
          <span className="font-semibold tracking-wide">
            {game.multiplayer ? '👥 MULTIPLAYER ARENA' : '🕹️ SOLO ARCADE'} • {game.duration}
          </span>
          <span className="text-neon-cyan font-bold uppercase tracking-wider">{game.difficulty} IQ</span>
        </div>

        {/* Title & Tagline */}
        <div className="px-1 flex flex-col gap-1">
          <Link
            href={`/games/${game.slug || game.id}`}
            onClick={() => soundFx.playClick()}
          >
            <h4 className="text-xl sm:text-2xl font-bold font-headline-sm text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
              {game.title}
            </h4>
          </Link>
          <p className="font-body-md text-soft-lavender line-clamp-2 min-h-[44px] leading-relaxed">
            {game.tagline || game.description}
          </p>
        </div>
      </div>

      {/* Action Buttons: Clean mapping between Solo and Multiplayer */}
      <div className="flex items-center gap-2.5 mt-5 pt-3.5 border-t border-purple-500/15">
        {game.multiplayer ? (
          <>
            <Link
              href={`/games/${game.slug || game.id}`}
              onClick={() => soundFx.playClick()}
              className="flex-1 py-3 px-4 rounded-xl bg-primary-container text-on-primary-container font-label-md font-bold hover:bg-secondary-container hover:scale-[1.02] transition-all shadow-md text-center flex items-center justify-center gap-2"
            >
              <span>PLAY NOW</span>
              <span className="material-symbols-outlined text-base">bolt</span>
            </Link>

            <button
              onClick={() => {
                soundFx.playClick();
                if (onQuickPlay) onQuickPlay(game);
                else openMultiplayerModal(game);
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
  );
};
