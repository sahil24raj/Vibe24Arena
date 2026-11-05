'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { isImageSource } from '@/components/profile/GamerAvatar';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';
import {
  User,
  ShoppingBag,
  Sparkles,
  LogOut
} from 'lucide-react';

export const TopHeaderBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, openMultiplayerModal, logout, openAuthModal } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut for search (/ or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileMenuOpen(false);
  };

  const currentLevel = user.level || 24;
  const currentXP = user.xp || 1450;
  const currentCoins = user.coins || 420;
  const xpInLevel = currentXP % 1000;
  const xpPercent = Math.min(100, Math.max(15, Math.round((xpInLevel / 1000) * 100)));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-surface-purple/90 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo & Professional Esports Tagline */}
        <Link
          href="/"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-3.5 shrink-0 group focus:outline-none select-none"
        >
          {/* Logo Emblem Container - Full bleed high-res squircle badge */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(217,70,239,0.55)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] group-hover:scale-105 transition-all duration-300 shrink-0 border border-purple-500/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Vibe Arena Logo"
              className="w-full h-full object-cover"
              src="/brand/vibe-arena-icon.png"
            />
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-headline-sm font-black text-xl sm:text-2xl tracking-wider text-white uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                VIBE
              </span>
              <span className="font-headline-sm font-black text-xl sm:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary via-neon-cyan to-neon-green uppercase drop-shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                ARENA
              </span>
              <span className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_10px_#48F078] animate-pulse ml-0.5" />
            </div>
            <span className="font-label-sm text-[10px] sm:text-[11px] text-soft-lavender font-bold tracking-[0.18em] uppercase mt-1 leading-none">
              YOUR SQUAD, YOUR VIBES, YOUR ARENA
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Bar matching screenshot & code.html (Home | All Vibes | Create Squad | Leaderboard) */}
        <nav className="hidden xl:flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-purple-500/10">
          <Link
            href="/"
            onClick={() => soundFx.playClick()}
            className={`px-4 py-1.5 transition-colors rounded-lg font-label-lg ${
              pathname === '/'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(139,44,255,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Home
          </Link>
          <Link
            href="/categories"
            onClick={() => soundFx.playClick()}
            className={`px-4 py-1.5 transition-colors rounded-lg font-label-lg ${
              pathname.startsWith('/categories')
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(139,44,255,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            All Vibes
          </Link>
          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="px-4 py-1.5 rounded-lg font-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Create Squad
          </button>
          <Link
            href="/leaderboard"
            onClick={() => soundFx.playClick()}
            className={`px-4 py-1.5 transition-colors rounded-lg font-label-lg ${
              pathname.startsWith('/leaderboard')
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(139,44,255,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Leaderboard
          </Link>
        </nav>

        {/* Right Section: Exact Screenshot Tools (Search, LVL XP, Coins, Bell, Avatar) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search with ⌘K badge */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center bg-surface-container-low px-3 py-1.5 rounded-lg border border-purple-500/20 focus-within:border-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-soft-lavender text-lg mr-1.5">search</span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search vibes, rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-on-surface placeholder:text-soft-lavender/60 w-36 xl:w-44"
            />
            <kbd className="font-label-sm text-soft-lavender bg-surface-container-high px-1.5 py-0.5 rounded ml-1 border border-white/5">
              ⌘K
            </kbd>
          </form>

          {/* Level & XP Progress Chip from code.html */}
          <Link
            href="/profile"
            onClick={() => soundFx.playClick()}
            className="hidden sm:flex flex-col gap-1 bg-surface-container-low px-3 py-1.5 rounded-lg border border-purple-500/20 hover:border-primary/40 transition-colors"
            title="View Level & Progress"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-label-sm text-primary font-bold">LVL {currentLevel}</span>
              <span className="font-label-sm text-soft-lavender">{currentXP.toLocaleString()} XP</span>
            </div>
            <div className="w-24 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-container to-secondary rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </Link>

          {/* Coin Badge Chip from code.html */}
          <Link
            href="/shop"
            onClick={() => soundFx.playCoin()}
            className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-tertiary-container/30 hover:border-tertiary transition-colors"
            title="Vibe Coins"
          >
            <span className="text-base leading-none">🪙</span>
            <span className="font-label-md text-tertiary font-bold">{currentCoins.toLocaleString()}</span>
          </Link>

          {/* Daily Spin / Notifications Trigger with Pulsing Neon Dot */}
          <button
            onClick={() => {
              soundFx.playClick();
              useAppStore.getState().openSpinModal();
            }}
            className="relative p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            title="Daily Free Spin"
            aria-label="Daily Spin"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#48F078]" />
          </button>

          {/* User Profile Avatar with safe image check & ring */}
          <div className="relative" ref={userMenuRef}>
            <div
              onClick={() => {
                soundFx.playClick();
                setUserMenuOpen(!userMenuOpen);
              }}
              className="flex items-center gap-1 pl-1 cursor-pointer group"
              title="User Menu"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary-container group-hover:ring-secondary transition-all flex items-center justify-center bg-surface-container-high">
                {isImageSource(user.avatar) || isImageSource(user.photoURL) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar || user.photoURL}
                    alt={user.displayName || user.username || 'User Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm select-none">{user.avatar || '🚀'}</span>
                )}
              </div>
              <span className="material-symbols-outlined text-soft-lavender text-sm group-hover:text-on-surface transition-transform duration-200">
                {userMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </div>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-surface-purple/95 backdrop-blur-2xl border border-purple-500/30 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-purple-500/20 mb-1">
                  <div className="font-label-lg text-on-surface font-bold truncate">
                    {user.displayName || user.username}
                  </div>
                  <div className="font-label-sm text-neon-green">
                    {user.authType === 'guest' ? 'Guest Player' : 'Verified Gamer'}
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container transition-colors"
                >
                  <User className="w-4 h-4 text-primary" />
                  <span>My Profile &amp; Stats</span>
                </Link>

                <Link
                  href="/shop"
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-tertiary" />
                  <span>Rewards Shop</span>
                </Link>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                    openMultiplayerModal(GAMES_CATALOG[0]);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-neon-cyan" />
                  <span>Host Squad Lobby</span>
                </button>

                <div className="pt-1 mt-1 border-t border-purple-500/20">
                  {user.authType === 'guest' ? (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setUserMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-on-primary-container bg-primary-container hover:bg-secondary-container transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Sign In / Save Progress</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-error hover:bg-error-container/20 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="xl:hidden p-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Toggle navigation"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-purple/95 backdrop-blur-2xl border-b border-purple-500/30 px-4 py-4 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="flex items-center bg-surface-container px-3 py-2 rounded-lg border border-purple-500/20">
            <span className="material-symbols-outlined text-soft-lavender text-lg mr-2">search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vibes, rooms..."
              className="bg-transparent border-none outline-none font-body-sm text-on-surface w-full"
            />
          </form>

          <Link
            href="/"
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(false);
            }}
            className="px-3 py-2 rounded-lg font-label-lg text-on-surface hover:bg-surface-container"
          >
            🏠 Home
          </Link>
          <Link
            href="/categories"
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(false);
            }}
            className="px-3 py-2 rounded-lg font-label-lg text-on-surface hover:bg-surface-container"
          >
            🎮 All Vibes
          </Link>
          <button
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(false);
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="px-3 py-2 rounded-lg font-label-lg text-on-surface hover:bg-surface-container text-left cursor-pointer"
          >
            👥 Create Squad
          </button>
          <Link
            href="/leaderboard"
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(false);
            }}
            className="px-3 py-2 rounded-lg font-label-lg text-on-surface hover:bg-surface-container"
          >
            🏆 Leaderboard
          </Link>
        </div>
      )}
    </header>
  );
};
