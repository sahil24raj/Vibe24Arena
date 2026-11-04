'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';

export const TopHeaderBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMuted, toggleMute, openMultiplayerModal, logout, openAuthModal } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickJoinOpen, setQuickJoinOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const handleQuickJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(joinCode);
    if (!clean) return;
    soundFx.playClick();
    setQuickJoinOpen(false);
    setJoinCode('');
    router.push(`/play/room/${clean}`);
  };

  const currentLevel = user.level || 1;
  const currentXP = user.xp || 0;
  const currentCoins = user.coins || 0;
  const xpInCurrentLevel = currentXP % 1000;
  const xpPercent = Math.min(100, Math.max(10, Math.round((xpInCurrentLevel / 1000) * 100)));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-surface-purple/90 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <Link
          href="/"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-3 shrink-0 group focus:outline-none"
        >
          <img
            alt="Vibe Arena Logo"
            className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
            src="/brand/vibe-arena-icon.png"
          />
          <div className="flex flex-col">
            <span className="font-headline-sm text-primary font-bold tracking-wider leading-none uppercase">
              VIBE ARENA
            </span>
            <span className="font-label-sm text-neon-green tracking-widest uppercase mt-0.5">
              Dost. Games. Full Vibe.
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Pill Container */}
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
              pathname.startsWith('/categories') || pathname.startsWith('/games')
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(139,44,255,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            All Vibes / Games
          </Link>
          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="px-4 py-1.5 rounded-lg font-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Create Room
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
          <Link
            href="/shop"
            onClick={() => soundFx.playClick()}
            className={`px-4 py-1.5 transition-colors rounded-lg font-label-lg ${
              pathname.startsWith('/shop')
                ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(139,44,255,0.4)]'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
            }`}
          >
            Rewards / Shop
          </Link>
        </nav>

        {/* Right Action Tools: Search, XP, Coins, Sound, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center bg-surface-container-low px-3 py-1.5 rounded-lg border border-purple-500/20 focus-within:border-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-soft-lavender text-lg mr-1.5">search</span>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none font-body-sm text-on-surface placeholder:text-soft-lavender/60 w-32 xl:w-44"
              placeholder="Search vibes, rooms..."
            />
            <kbd className="font-label-sm text-soft-lavender bg-surface-container-high px-1.5 py-0.5 rounded ml-1 border border-white/5">
              ⌘K
            </kbd>
          </form>

          {/* Level & XP Chip */}
          <Link
            href="/profile"
            onClick={() => soundFx.playClick()}
            className="hidden sm:flex flex-col gap-1 bg-surface-container-low px-3 py-1.5 rounded-lg border border-purple-500/20 hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
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

          {/* Coin Badge */}
          <Link
            href="/shop"
            onClick={() => soundFx.playCoin()}
            className="flex items-center gap-1.5 bg-surface-container-low px-2.5 sm:px-3 py-1.5 rounded-lg border border-tertiary-container/30 hover:border-tertiary/60 transition-colors"
            title="Your Vibe Coins"
          >
            <span className="text-base leading-none">🪙</span>
            <span className="font-label-md text-tertiary font-bold">{currentCoins.toLocaleString()}</span>
          </Link>

          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              toggleMute();
              soundFx.playClick();
            }}
            className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            <span className="material-symbols-outlined text-xl">
              {isMuted ? 'volume_off' : 'volume_up'}
            </span>
          </button>

          {/* Quick Room Code Join */}
          <button
            onClick={() => {
              soundFx.playClick();
              setQuickJoinOpen(!quickJoinOpen);
            }}
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm font-bold uppercase transition-colors border border-purple-500/20"
          >
            <span className="material-symbols-outlined text-sm">key</span>
            <span>JOIN CODE</span>
          </button>

          {/* Notifications / Daily Spin Trigger */}
          <button
            onClick={() => {
              soundFx.playClick();
              useAppStore.getState().openSpinModal();
            }}
            className="relative p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            title="Daily Free Spin"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#48F078] animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-green" />
          </button>

          {/* User Profile Avatar & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <div
              onClick={() => {
                soundFx.playClick();
                setUserMenuOpen(!userMenuOpen);
              }}
              className="flex items-center gap-1.5 pl-1 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-lg ring-2 ring-primary-container group-hover:ring-secondary transition-all">
                {user.avatar || '🚀'}
              </div>
              <span className="material-symbols-outlined text-soft-lavender text-sm group-hover:text-on-surface">
                expand_more
              </span>
            </div>

            {/* Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-surface-purple/95 backdrop-blur-2xl border border-purple-500/30 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50">
                <div className="px-3 py-2 border-b border-purple-500/20 mb-1">
                  <div className="font-label-lg text-on-surface font-bold truncate">{user.username}</div>
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
                  <span className="material-symbols-outlined text-lg text-primary">person</span>
                  <span>My Profile & Stats</span>
                </Link>

                <Link
                  href="/shop"
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined text-lg text-tertiary">storefront</span>
                  <span>Rewards Shop</span>
                </Link>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                    openMultiplayerModal(GAMES_CATALOG[0]);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-on-surface hover:bg-surface-container transition-colors text-left"
                >
                  <span className="material-symbols-outlined text-lg text-neon-cyan">group_add</span>
                  <span>Host Squad Lobby</span>
                </button>

                {user.authType === 'guest' ? (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setUserMenuOpen(false);
                      openAuthModal();
                    }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-on-primary-container bg-primary-container hover:bg-secondary-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">login</span>
                    <span>Sign In / Save Progress</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg font-label-md text-error hover:bg-error-container/20 transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="xl:hidden p-2 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Join Code Bar Popover */}
      {quickJoinOpen && (
        <div className="bg-surface-container-low border-b border-purple-500/20 px-4 py-2.5">
          <form
            onSubmit={handleQuickJoinSubmit}
            className="max-w-xl mx-auto flex items-center gap-2"
          >
            <span className="font-label-sm text-neon-green uppercase font-bold shrink-0">Enter Code:</span>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="#X7K92P"
              maxLength={8}
              className="flex-1 bg-surface-purple px-3 py-1.5 rounded-lg border border-purple-500/30 font-mono text-center text-sm font-bold tracking-widest text-on-surface uppercase focus:outline-none focus:border-neon-cyan"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-label-sm font-bold uppercase transition-all shadow-[0_0_12px_rgba(139,44,255,0.4)]"
            >
              JOIN
            </button>
            <button
              type="button"
              onClick={() => setQuickJoinOpen(false)}
              className="p-1 rounded text-soft-lavender hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-surface-purple/95 backdrop-blur-2xl border-b border-purple-500/30 px-4 py-4 flex flex-col gap-3">
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
            🎮 All Vibes / Games
          </Link>
          <button
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(false);
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="px-3 py-2 rounded-lg font-label-lg text-on-surface hover:bg-surface-container text-left"
          >
            👥 Create Squad Room
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
          <Link
            href="/shop"
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(false);
            }}
            className="px-3 py-2 rounded-lg font-label-lg text-on-surface hover:bg-surface-container"
          >
            🪙 Rewards & Shop
          </Link>
        </div>
      )}
    </header>
  );
};
