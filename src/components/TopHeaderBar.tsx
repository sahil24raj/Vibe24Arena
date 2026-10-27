'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { VibeArenaLogo } from '@/components/VibeArenaLogo';
import {
  Gamepad2,
  LayoutGrid,
  Swords,
  Trophy,
  User,
  Search,
  X,
  Menu,
  Volume2,
  VolumeX,
  Plus,
  KeyRound,
  ArrowRight,
  LogOut,
  Edit3,
  Award,
  Settings,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';
import { GamerAvatar } from '@/components/profile/GamerAvatar';

export const TopHeaderBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMuted, toggleMute, openMultiplayerModal, logout } = useAppStore();
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
    { href: '/categories', label: 'Collection', icon: LayoutGrid },
    { href: '/multiplayer', label: 'Play with Friends', icon: Swords, badge: 'SQUAD' },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy }
  ];

  return (
    <header className="w-full bg-[#080A12]/95 backdrop-blur-xl border-b border-white/[0.07] sticky top-0 z-40 transition-colors">
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            onClick={() => soundFx.playClick()}
            className="flex items-center"
          >
            <VibeArenaLogo size="md" showTagline={false} />
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 bg-[#10131D] px-2 py-1.5 rounded-full border border-white/[0.08]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => soundFx.playClick()}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'bg-[#181C2A] text-white border border-[#D946EF]/30 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D946EF]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded-full bg-[#D946EF]/20 text-[#F472B6] border border-[#D946EF]/40">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Actions + Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Quick Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden xl:flex items-center w-48 group"
          >
            <Search className="w-3.5 h-3.5 absolute left-3 text-slate-400 group-focus-within:text-[#06B6D4] transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search games... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#10131D] border border-white/[0.08] group-focus-within:border-[#06B6D4]/50 rounded-full pl-8.5 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#06B6D4]/30 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Join Room Button */}
          <div className="relative">
            <button
              onClick={() => {
                soundFx.playClick();
                setQuickJoinOpen(!quickJoinOpen);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full va-btn-secondary text-xs font-semibold cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Join Room</span>
            </button>

            {/* Quick Join Popover */}
            {quickJoinOpen && (
              <div className="absolute right-0 mt-2 w-72 p-4 rounded-2xl bg-[#10131D] border border-white/10 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-bold text-white mb-1 font-display">Join the Squad</div>
                <p className="text-[11px] text-slate-400 mb-3">Enter the 6-character room code from your squad.</p>
                <form onSubmit={handleQuickJoinSubmit} className="space-y-3">
                  <input
                    type="text"
                    placeholder="e.g. X7K92P"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#080A12] border border-white/15 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#06B6D4] uppercase focus:outline-none focus:border-[#06B6D4]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!joinCode.trim()}
                      className="flex-1 py-2 rounded-xl va-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <span>Join Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickJoinOpen(false)}
                      className="px-3 py-2 rounded-xl bg-white/[0.05] text-slate-400 hover:text-white text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Primary CTA: Create Room */}
          <button
            onClick={() => {
              soundFx.playClick();
              openMultiplayerModal(GAMES_CATALOG[0]);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full va-btn-primary text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Room</span>
          </button>

          {/* Profile Dropdown Menu Trigger & Container */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => {
                soundFx.playClick();
                setUserMenuOpen(!userMenuOpen);
              }}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-[#10131D] border border-white/[0.08] hover:border-[#00F0FF]/40 hover:bg-white/[0.04] transition-all cursor-pointer group"
              title="Gamer Profile & Menu"
              aria-haspopup="true"
              aria-expanded={userMenuOpen}
            >
              <GamerAvatar
                avatar={user.avatar}
                photoURL={user.photoURL}
                avatarType={user.avatarType}
                size="xs"
                showOnline={true}
                isOnline={true}
                glowEffect={false}
              />
              <span className="hidden xl:inline text-xs font-bold text-white max-w-[80px] truncate">
                {user.displayName || user.username}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 pl-0.5">
                <span>🪙</span>
                <span>{user.coins}</span>
              </div>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Gaming User Menu Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-2xl bg-[#0D101C]/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* User Identity Header */}
                <Link
                  href="/profile"
                  onClick={() => {
                    soundFx.playClick();
                    setUserMenuOpen(false);
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 transition-all group"
                >
                  <GamerAvatar
                    avatar={user.avatar}
                    photoURL={user.photoURL}
                    avatarType={user.avatarType}
                    size="md"
                    showOnline={true}
                    isOnline={true}
                    rank={user.rank as string}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white truncate group-hover:text-[#00F0FF] transition-colors">
                        {user.displayName || user.username}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 block truncate">
                      @{user.username}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                        LVL {user.level}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-[#ADFF2F]">
                        {user.rank || 'Bronze II'}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Quick Navigation Items */}
                <div className="mt-2 pt-2 border-t border-white/[0.08] space-y-0.5">
                  <Link
                    href="/profile"
                    onClick={() => {
                      soundFx.playClick();
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-[#00F0FF]" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    href="/profile?tab=edit"
                    onClick={() => {
                      soundFx.playClick();
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#ADFF2F]" />
                    <span>Edit Profile</span>
                  </Link>

                  <Link
                    href="/profile?tab=achievements"
                    onClick={() => {
                      soundFx.playClick();
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>Achievements</span>
                  </Link>

                  <Link
                    href="/profile?tab=settings"
                    onClick={() => {
                      soundFx.playClick();
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settings & Privacy</span>
                  </Link>
                </div>

                {/* Account Type Status & Logout */}
                <div className="mt-2 pt-2 border-t border-white/[0.08] flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    {user.authType === 'google' ? 'Google' : user.authType === 'email' ? 'Email' : 'Guest'}
                  </span>
                  <button
                    type="button"
                    onClick={async () => {
                      soundFx.playClick();
                      setUserMenuOpen(false);
                      await logout();
                      router.push('/login');
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Audio Mute/Unmute */}
          <button
            onClick={() => {
              soundFx.playClick();
              toggleMute();
            }}
            className="p-2 rounded-full bg-[#10131D] border border-white/[0.08] text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#10131D] border border-white/[0.08] text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0A0C16] border-b border-white/[0.08] px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          {/* Quick Search on Mobile */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search games, squad challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#10131D] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </form>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                openMultiplayerModal(GAMES_CATALOG[0]);
              }}
              className="p-3 rounded-xl va-btn-primary text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Room</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setMobileMenuOpen(false);
                setQuickJoinOpen(true);
              }}
              className="p-3 rounded-xl va-btn-secondary text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-4 h-4 text-[#06B6D4]" />
              <span>Join Room</span>
            </button>
          </div>

          <div className="space-y-1 pt-1 border-t border-white/[0.06]">
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
                  className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#D946EF]" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#D946EF]/20 text-[#F472B6]">
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
              className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.04]"
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
                  <div className="text-[10px] font-mono text-slate-400">
                    LVL {user.level} • @{user.username}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-400">
                🪙 {user.coins}
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
