'use client';

import React from 'react';
import Link from 'next/link';
import { soundFx } from '@/lib/audio';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-purple-500/20 py-12 text-on-surface-variant mt-16">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-12 mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="font-headline-sm text-primary font-bold tracking-wider uppercase">
              VIBE ARENA
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-neon-green font-label-sm border border-neon-green/30 font-bold">
              FULL VIBE
            </span>
          </div>

          <p className="font-body-sm text-soft-lavender max-w-md leading-relaxed">
            A social gaming playground where friends create instant rooms, play quick multiplayer games, compete, joke around, and spend time together. Zero downloads, pure unadulterated vibe.
          </p>

          <div className="flex items-center gap-3 text-on-surface-variant pt-1">
            <span
              className="material-symbols-outlined text-lg hover:text-primary transition-colors cursor-pointer"
              title="Games"
            >
              sports_esports
            </span>
            <span
              className="material-symbols-outlined text-lg hover:text-primary transition-colors cursor-pointer"
              title="Squad Chat"
            >
              forum
            </span>
            <span
              className="material-symbols-outlined text-lg hover:text-primary transition-colors cursor-pointer"
              title="Voice Lobby"
            >
              headset_mic
            </span>
            <span
              className="material-symbols-outlined text-lg hover:text-primary transition-colors cursor-pointer"
              title="Leaderboards"
            >
              trophy
            </span>
          </div>
        </div>

        {/* Pick Your Vibe */}
        <div className="flex flex-col gap-2.5">
          <span className="font-label-lg text-on-surface uppercase tracking-wider font-bold">
            Pick Your Vibe
          </span>
          <Link
            href="/categories?vibe=meme"
            onClick={() => soundFx.playClick()}
            className="font-body-sm text-soft-lavender hover:text-neon-cyan transition-colors"
          >
            🔥 Meme Vibes
          </Link>
          <Link
            href="/categories?vibe=school"
            onClick={() => soundFx.playClick()}
            className="font-body-sm text-soft-lavender hover:text-neon-cyan transition-colors"
          >
            🎒 School Vibes
          </Link>
          <Link
            href="/categories?vibe=squad"
            onClick={() => soundFx.playClick()}
            className="font-body-sm text-soft-lavender hover:text-neon-cyan transition-colors"
          >
            👥 Squad Vibes
          </Link>
          <Link
            href="/categories?vibe=brain"
            onClick={() => soundFx.playClick()}
            className="font-body-sm text-soft-lavender hover:text-neon-cyan transition-colors"
          >
            🧠 Mind Game Vibes
          </Link>
        </div>

        {/* Platform Links */}
        <div className="flex flex-col gap-2.5">
          <span className="font-label-lg text-on-surface uppercase tracking-wider font-bold">
            Platform
          </span>
          <Link
            href="/multiplayer"
            onClick={() => soundFx.playClick()}
            className="font-body-sm text-soft-lavender hover:text-secondary transition-colors"
          >
            Play with Friends
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => soundFx.playClick()}
            className="font-body-sm text-soft-lavender hover:text-secondary transition-colors"
          >
            Vibe Leaderboard
          </Link>
          <Link
            href="/profile"
            onClick={() => soundFx.playClick()}
            className="font-body-sm text-soft-lavender hover:text-secondary transition-colors"
          >
            Gamer Profile &amp; Stats
          </Link>
          <Link
            href="/shop"
            onClick={() => soundFx.playClick()}
            className="font-body-sm text-soft-lavender hover:text-secondary transition-colors"
          >
            Rewards Store
          </Link>
        </div>

        {/* Squad Code Card */}
        <div className="flex flex-col gap-2.5">
          <span className="font-label-lg text-on-surface uppercase tracking-wider font-bold">
            Squad Code
          </span>
          <div className="p-4 rounded-xl bg-surface-container-low border border-purple-500/20 flex flex-col gap-1 shadow-md">
            <span className="font-headline-sm text-tertiary italic font-bold">
              &ldquo;Bas ek aur game.&rdquo;
            </span>
            <span className="font-label-sm text-soft-lavender">
              The holy gaming vow. Never break the squad circle.
            </span>
          </div>
        </div>
      </div>

      {/* Subfooter */}
      <div className="max-w-7xl px-4 sm:px-6 lg:px-12 mx-auto mt-10 pt-4 border-t border-purple-500/10 flex flex-col sm:flex-row items-center justify-between gap-3 font-label-md text-soft-lavender">
        <span>© 2026 Vibe Arena. Made for friends who game together.</span>
        <div className="flex items-center gap-4">
          <Link href="/categories" className="hover:text-on-surface transition-colors">
            Rules of Engagement
          </Link>
          <Link href="/leaderboard" className="hover:text-on-surface transition-colors">
            Fair Play Code
          </Link>
          <Link href="/profile" className="hover:text-on-surface transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
};
