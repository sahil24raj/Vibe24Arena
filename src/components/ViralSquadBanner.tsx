'use client';

import React from 'react';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

export const ViralSquadBanner: React.FC = () => {
  const { openMultiplayerModal } = useAppStore();

  return (
    <section className="w-full px-4 sm:px-6 lg:px-12 py-12">
      <div className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-r from-primary-container via-surface-purple to-secondary-container p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-[0_0_50px_rgba(139,44,255,0.4)] flex flex-col md:flex-row items-center justify-between gap-8 border border-purple-500/30">
        <div className="flex flex-col gap-3 max-w-xl z-10 text-center md:text-left">
          <span className="px-3 py-1 rounded-full bg-tertiary text-on-tertiary-fixed font-label-sm font-bold uppercase self-center md:self-start shadow-md">
            THE SQUAD CODE
          </span>
          <h2 className="font-display-hero-mobile lg:font-display-hero text-on-surface uppercase tracking-tighter leading-tight">
            &ldquo;BAS EK AUR GAME.&rdquo;
          </h2>
          <p className="font-body-lg text-soft-lavender">
            Who in your squad chat always refuses to sleep? Drop the room code into WhatsApp right now and let the late night banter begin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 z-10">
          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="px-8 py-4 rounded-xl bg-tertiary text-on-tertiary-fixed font-headline-sm font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(235,195,21,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            DROP INTO SQUAD
          </button>
        </div>

        {/* Ambient Glow Sphere */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
      </div>
    </section>
  );
};

