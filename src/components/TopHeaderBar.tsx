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
  ChevronDown,
  Bell
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

  const navItems = [
    { href: '/categories', label: 'All Vibes', icon: LayoutGrid },
    { href: '/multiplayer', label: 'Play with Friends', icon: Swords, badge: 'SQUAD' },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/shop', label: 'Rewards Shop', icon: ShoppingBag }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#141122]/95 backdrop-blur-xl border-b border-purple-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Logo & Desi Tagline */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <VibeArenaLogo size="md" showTagline={false} />
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-lg tracking-wider leading-none uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] via-[#A855F7] to-[#06B6D4]">
                VIBE ARENA
              </span>
              <span className="font-mono text-[9px] text-neon-green tracking-widest uppercase mt-0.5 font-bold">
                Dost. Games. Full Vibe.
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar with cyber glass styling */}
        <nav className="hidden xl:flex items-center gap-1.5 p-1.5 bg-[#1B1730]/90 rounded-2xl border border-purple-500/20 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => soundFx.playClick()}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_16px_rgba(139,44,255,0.4)] border border-primary/30'
                    : 'text-soft-lavender hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-primary'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-neon-green/20 text-neon-green border border-neon-green/40 shadow-[0_0_8px_rgba(72,240,120,0.3)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Actions + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden lg:flex items-center w-40 xl:w-48 group"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 text-soft-lavender group-focus-within:text-neon-cyan transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search vibes... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1B1730]/80 border border-purple-500/25 group-focus-within:border-neon-cyan/60 rounded-xl pl-8.5 pr-8 py-2 text-xs text-white placeholder-soft-lavender/60 focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-soft-lavender hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Quick Join Code Button & Popover */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setQuickJoinOpen(!quickJoinOpen);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1B1730] border border-purple-500/30 hover:border-neon-cyan/50 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(6,182,212,0.25)]"
              title="Enter 6-character room code"
            >
              <KeyRound className="w-3.5 h-3.5 text-neon-cyan" />
              <span>Join Code</span>
            </button>

            {quickJoinOpen && (
              <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-[#1B1730]/95 backdrop-blur-2xl border border-purple-500/30 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-white mb-1 font-display">Join Squad Battle</div>
                <p className="text-[11px] text-soft-lavender mb-3">Enter the 6-character code from your squad.</p>
                <form onSubmit={handleQuickJoinSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="e.g. X7K92P"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#141122] border border-purple-500/40 rounded-xl px-3 py-2 text-xs font-mono font-bold text-neon-cyan tracking-widest uppercase focus:outline-none focus:border-neon-cyan text-center"
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

          {/* Create Room Primary Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-container hover:bg-secondary-container text-white text-xs font-bold transition-all shadow-[0_0_14px_rgba(139,44,255,0.4)] hover:shadow-[0_0_20px_rgba(139,44,255,0.6)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-neon-green" />
            <span>Create Room</span>
          </button>

          {/* Daily Spin / Notifications Trigger */}
          <button
            onClick={() => {
              soundFx.playClick();
              useAppStore.getState().openSpinModal();
            }}
            className="relative p-2 rounded-xl bg-[#1B1730] border border-purple-500/25 text-soft-lavender hover:text-white hover:bg-white/[0.06] transition-colors"
            title="Daily Free Spin"
            aria-label="Daily Spin"
          >
            <Bell className="w-4 h-4 text-solar-yellow" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_#48F078] animate-ping" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-green" />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => {
              soundFx.playClick();
              toggleMute();
            }}
            className="p-2 rounded-xl bg-[#1B1730] border border-purple-500/25 text-soft-lavender hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neon-green" />}
          </button>

          {/* User Profile Trigger & Dropdown Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                soundFx.playClick();
                setUserMenuOpen(!userMenuOpen);
              }}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl bg-[#1B1730] border border-purple-500/30 hover:border-primary/50 hover:bg-white/[0.04] transition-all cursor-pointer group"
              title="Gamer Profile & Menu"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              {/* Uses GamerAvatar so base64 avatar images render cleanly without raw text leaks */}
              <GamerAvatar
                avatar={user.avatar}
                photoURL={user.photoURL}
                avatarType={user.avatarType}
                size="xs"
                showOnline={true}
                isOnline={true}
                glowEffect={false}
              />
              <span className="hidden sm:inline text-xs font-bold text-white max-w-[85px] truncate font-sans">
                {user.displayName || user.username}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-solar-yellow pl-1 border-l border-purple-500/20">
                <span>🪙</span>
                <span>{user.coins.toLocaleString()}</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-soft-lavender transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-3 w-60 rounded-2xl bg-[#141122]/98 backdrop-blur-2xl border border-purple-500/30 p-2.5 shadow-[0_12px_45px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-purple-500/20 mb-1.5">
                  <div className="font-bold text-white text-xs truncate">
                    {user.displayName || user.username}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono mt-0.5">
                    <span className="text-neon-cyan font-bold">LVL {user.level}</span>
                    <span className="text-soft-lavender">{user.authType === 'guest' ? 'Guest Player' : 'Verified Gamer'}</span>
                  </div>
                </div>

                <Link
                  href="/profile"
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/[0.06] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>My Profile & Stats</span>
                </Link>

                <Link
                  href="/shop"
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/[0.06] transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-solar-yellow" />
                  <span>Rewards & Shop</span>
                </Link>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                    openMultiplayerModal(GAMES_CATALOG[0]);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-neon-green" />
                  <span>Host Squad Lobby</span>
                </button>

                <div className="pt-1.5 mt-1 border-t border-purple-500/20">
                  {user.authType === 'guest' ? (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setUserMenuOpen(false);
                        openAuthModal();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-white bg-primary-container hover:bg-secondary-container transition-all shadow-[0_0_12px_rgba(139,44,255,0.4)] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Sign In / Save Progress</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
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
            className="xl:hidden p-2 rounded-xl bg-[#1B1730] border border-purple-500/25 text-soft-lavender hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#141122]/98 backdrop-blur-2xl border-b border-purple-500/30 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {/* Quick Search on Mobile */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-soft-lavender pointer-events-none" />
            <input
              type="text"
              placeholder="Search vibes, games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1B1730] border border-purple-500/30 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-soft-lavender/60 focus:outline-none focus:border-neon-cyan"
            />
          </form>

          {/* Mobile Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                openMultiplayerModal(GAMES_CATALOG[0]);
              }}
              className="p-2.5 rounded-xl bg-primary-container text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(139,44,255,0.4)]"
            >
              <Plus className="w-4 h-4 text-neon-green" />
              <span>Create Room</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                setQuickJoinOpen(true);
              }}
              className="p-2.5 rounded-xl bg-[#1B1730] border border-purple-500/30 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-neon-cyan" />
              <span>Join Code</span>
            </button>
          </div>

          {/* Mobile Nav Links */}
          <div className="space-y-1 pt-1 border-t border-purple-500/20">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/40">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/profile"
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-white hover:bg-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <GamerAvatar
                  avatar={user.avatar}
                  photoURL={user.photoURL}
                  avatarType={user.avatarType}
                  size="xs"
                  showOnline={true}
                  isOnline={true}
                  glowEffect={false}
                />
                <div className="text-left">
                  <div className="font-bold text-white leading-tight">
                    {user.displayName || user.username}
                  </div>
                  <div className="text-[10px] font-mono text-soft-lavender">
                    LVL {user.level} • @{user.username}
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-solar-yellow">
                🪙 {user.coins.toLocaleString()}
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
