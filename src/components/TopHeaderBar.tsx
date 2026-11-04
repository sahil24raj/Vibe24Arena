'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { VibeArenaLogo } from '@/components/VibeArenaLogo';
import { GamerAvatar } from '@/components/profile/GamerAvatar';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';
import {
  LayoutGrid,
  Swords,
  Trophy,
  ShoppingBag,
  Search,
  X,
  Menu,
  Volume2,
  VolumeX,
  Plus,
  KeyRound,
  ArrowRight,
  LogOut,
  User,
  Sparkles,
  ChevronDown
} from 'lucide-react';

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
  const xpInLevel = currentXP % 1000;
  const xpPercent = Math.min(100, Math.max(12, Math.round((xpInLevel / 1000) * 100)));

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-surface-purple/90 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand Logo & Desi Tagline */}
        <Link
          href="/"
          onClick={() => soundFx.playClick()}
          className="flex items-center gap-3 shrink-0 group focus:outline-none"
        >
          <VibeArenaLogo size="md" showTagline={false} />
          <div className="flex flex-col">
            <span className="font-headline-sm text-primary font-bold tracking-wider leading-none uppercase">
              VIBE ARENA
            </span>
            <span className="font-label-sm text-neon-green tracking-widest uppercase mt-0.5">
              Dost. Games. Full Vibe.
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Bar matching code.html */}
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

        {/* Right Section: Actions + Profile */}
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

          {/* Quick Join Code Button & Popover */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setQuickJoinOpen(!quickJoinOpen);
              }}
              className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm font-bold uppercase transition-colors border border-purple-500/20"
              title="Enter Room Code"
            >
              <KeyRound className="w-3.5 h-3.5 text-neon-cyan" />
              <span>JOIN CODE</span>
            </button>

            {quickJoinOpen && (
              <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-surface-purple/95 backdrop-blur-2xl border border-purple-500/30 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-white mb-1 font-display">Join Squad Battle</div>
                <p className="text-[11px] text-soft-lavender mb-3">Enter the 6-character code from your squad.</p>
                <form onSubmit={handleQuickJoinSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="e.g. X7K92P"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-surface-container-low border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neon-cyan tracking-widest uppercase focus:outline-none focus:border-neon-cyan text-center"
                    autoFocus
                    maxLength={8}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!joinCode.trim()}
                      className="flex-1 py-2 rounded-xl bg-primary-container hover:bg-secondary-container text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all cursor-pointer shadow-[0_0_12px_rgba(139,44,255,0.4)]"
                    >
                      <span>Join Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickJoinOpen(false)}
                      className="px-3 py-2 rounded-xl bg-white/[0.05] text-soft-lavender hover:text-white text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => {
              soundFx.playClick();
              toggleMute();
            }}
            className="p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neon-green" />}
          </button>

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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#48F078] animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-green" />
          </button>

          {/* User Profile Avatar with safe GamerAvatar rendering & Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <div
              onClick={() => {
                soundFx.playClick();
                setUserMenuOpen(!userMenuOpen);
              }}
              className="flex items-center gap-1.5 pl-1 cursor-pointer group"
              title="User Menu"
            >
              <GamerAvatar
                avatar={user.avatar}
                photoURL={user.photoURL}
                avatarType={user.avatarType}
                size="sm"
                showOnline={true}
                isOnline={true}
                glowEffect={false}
              />
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
            🎮 All Vibes / Games
          </Link>
          <button
            onClick={() => {
              soundFx.playClick();
              setMobileMenuOpen(false);
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="px-3 py-2 rounded-lg font-label-lg text-on-surface hover:bg-surface-container text-left cursor-pointer"
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
            🪙 Rewards &amp; Shop
          </Link>
        </div>
      )}
    </header>
  );
};
