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

export const JackpotterCard: React.FC<JackpotterCardProps> = ({
  game,
  size = 'normal',
  onQuickPlay
}) => {
  const { openMultiplayerModal } = useAppStore();

  return (
    <div className="rounded-2xl bg-surface-container p-4 flex flex-col justify-between shadow-xl hover:shadow-[0_0_30px_rgba(139,44,255,0.4)] transition-all group border border-purple-500/20 h-full">
      <div className="flex flex-col gap-2">
        {/* Poster Viewport */}
        <Link
          href={`/games/${game.slug || game.id}`}
          onClick={() => soundFx.playClick()}
          className="w-full h-44 rounded-xl bg-surface-purple overflow-hidden relative flex items-center justify-center block group"
        >
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
        </Link>

        {/* Metadata */}
        <div className="flex items-center justify-between text-soft-lavender font-label-sm pt-1">
          <span>{game.multiplayer ? 'MULTIPLAYER' : 'SOLO'} • {game.duration}</span>
          <span className="text-neon-cyan font-bold uppercase">{game.difficulty} IQ</span>
        </div>

        {/* Title & Tagline */}
        <Link
          href={`/games/${game.slug || game.id}`}
          onClick={() => soundFx.playClick()}
        >
          <h4 className="font-headline-sm text-on-surface font-bold truncate group-hover:text-primary transition-colors">
            {game.title}
          </h4>
        </Link>
        <p className="font-body-sm text-soft-lavender line-clamp-2">
          {game.tagline || game.description}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 mt-4 pt-1 border-t border-purple-500/10">
        <Link
          href={`/games/${game.slug || game.id}`}
          onClick={() => soundFx.playClick()}
          className="flex-1 py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-sm font-bold hover:bg-secondary-container transition-colors shadow-md text-center flex items-center justify-center"
        >
          PLAY NOW
        </Link>

        <button
          onClick={() => {
            soundFx.playClick();
            if (game.multiplayer) {
              if (onQuickPlay) onQuickPlay(game);
              else openMultiplayerModal(game);
            } else {
              window.location.href = `/games/${game.slug || game.id}`;
            }
          }}
          className="px-3.5 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm font-bold transition-colors cursor-pointer"
        >
          {game.multiplayer ? 'ROOM' : 'SOLO'}
        </button>
      </div>
    </div>
  );
};
