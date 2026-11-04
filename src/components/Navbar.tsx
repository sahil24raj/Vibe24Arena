'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
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
  VolumeX
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMuted, toggleMute } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (/ or Ctrl+K / Cmd+K)
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    soundFx.playClick();
    router.push(`/categories?q=${encodeURIComponent(searchQuery.trim())}`);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Gamepad2 },
    { href: '/categories', label: 'Categories', icon: LayoutGrid },
    { href: '/multiplayer', label: 'Multiplayer', icon: Swords, badge: 'PVP' },
    { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
    { href: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <header className="w-full bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      <div className="max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2.5 group cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F0FF] via-[#3B82F6] to-[#ADFF2F] p-[1.5px] shadow-[0_0_20px_rgba(0,240,255,0.35)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] group-hover:scale-105 transition-all duration-300">
              <div className="w-full h-full bg-[#080B14] rounded-[10px] flex items-center justify-center text-xl group-hover:rotate-6 transition-transform">
                🕹️
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-base tracking-wider text-white group-hover:text-[#00F0FF] transition-colors leading-none flex items-center gap-1">
                CHILL<span className="text-[#00F0FF]">ARENA</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse"></span>
              </span>
              <span className="text-[9px] font-mono text-slate-400 tracking-widest uppercase font-semibold leading-tight">
                ESPORTS & MEMES
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar (Only: Home, Categories, Multiplayer, Leaderboard, Profile) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#101524]/80 p-1.5 rounded-2xl border border-white/[0.06] shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => soundFx.playClick()}
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold font-display tracking-wide uppercase transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#00F0FF]/15 to-[#3B82F6]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform ${isActive ? 'text-[#00F0FF] scale-110' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-gradient-to-r from-[#FF0055] to-[#FF5500] text-white tracking-wider shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#00F0FF] rounded-full shadow-[0_0_8px_#00F0FF]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Professional Search Bar + Profile & Sound Controls */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Integrated Professional Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative hidden sm:flex items-center w-48 md:w-64 lg:w-72 group"
          >
            <Search className="w-4 h-4 absolute left-3 text-slate-400 group-focus-within:text-[#00F0FF] transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search games, memes... (/)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#101524]/90 border border-white/[0.08] group-focus-within:border-[#00F0FF]/60 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/20 transition-all font-sans"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2.5 hidden md:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white/[0.05] border border-white/10 rounded">
                /
              </kbd>
            )}
          </form>

          {/* Quick Profile & Coin Display Pill */}
          <Link
            href="/profile"
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-[#101524] border border-white/[0.08] hover:border-[#00F0FF]/40 hover:bg-[#141b2e] transition-all group cursor-pointer"
            title="View Profile & Stats"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#00F0FF] to-[#ADFF2F] text-slate-950 flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
              {user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http')) ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{user.avatar || '🎮'}</span>
              )}
            </div>
            <div className="hidden xl:flex flex-col text-left leading-none">
              <span className="text-xs font-bold text-slate-200 group-hover:text-white max-w-[85px] truncate font-display">
                {user.displayName || user.username}
              </span>
              <span className="text-[10px] font-mono text-[#00F0FF] font-semibold mt-0.5">
                LVL {user.level}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 pl-1 border-l border-white/10">
              <span>🪙</span>
              <span>{user.coins}</span>
            </div>
          </Link>

          {/* Audio FX Mute / Unmute Button */}
          <button
            onClick={() => {
              toggleMute();
              if (isMuted) soundFx.playClick();
            }}
            className="p-2 rounded-xl bg-[#101524] border border-white/[0.08] text-slate-400 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-all cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-[#101524] border border-white/[0.08] text-slate-300 hover:text-white hover:border-[#00F0FF]/40 transition-colors"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#00F0FF]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#080B14]/98 border-t border-white/[0.08] px-4 py-4 space-y-3 animate-in slide-in-from-top-3 duration-200">
          {/* Mobile Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search games, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#101524] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F0FF]"
            />
          </form>

          {/* Mobile Nav Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-display">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    soundFx.playClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    isActive
                      ? 'bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/40 shadow-sm'
                      : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded-md bg-gradient-to-r from-[#FF0055] to-[#FF5500] text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
