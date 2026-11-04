'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Zap, 
  Target, 
  ShieldCheck, 
  Gamepad2, 
  ArrowUpRight, 
  Award, 
  Play, 
  Clock, 
  TrendingUp,
  User,
  ExternalLink,
  ChevronRight,
  BarChart2,
  Crown
} from 'lucide-react';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

export default function DashboardPage() {
  const { user, recentlyPlayedIds, challenges } = useAppStore();

  const totalScore = Object.values(user.stats.highScores || {}).reduce((a, b) => a + b, 0);
  const bestScore = Math.max(0, ...Object.values(user.stats.highScores || {}));
  const winRate = user.stats.gamesPlayed > 0 
    ? Math.round((user.stats.totalWins / user.stats.gamesPlayed) * 100) 
    : 0;
  const xpInCurrentLevel = user.xp % 500;
  const xpProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  const recentGames = (recentlyPlayedIds || [])
    .map((id) => GAMES_CATALOG.find((g) => g.id === id))
    .filter(Boolean);

  const topGames = GAMES_CATALOG.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121624]/90 via-[#182035]/80 to-[#121624]/90 border border-white/10 p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#00F0FF]/15 via-[#ADFF2F]/10 to-transparent blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#FF0055]/10 blur-[90px] pointer-events-none" />
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-[#00F0FF]/30 to-[#ADFF2F]/30 border-2 border-[#00F0FF] flex items-center justify-center text-3xl sm:text-4xl shadow-[0_0_25px_rgba(0,240,255,0.3)] overflow-hidden">
                {user.avatar && (user.avatar.startsWith('data:image/') || user.avatar.startsWith('http')) ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.avatar || '🎮'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[#00F0FF] text-black font-black text-[10px] tracking-wider uppercase border border-black shadow">
                LVL {user.level}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Welcome back, <span className="bg-gradient-to-r from-[#00F0FF] via-[#ADFF2F] to-white bg-clip-text text-transparent">{user.displayName || user.username}</span>!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {user.authType === 'email' ? 'Verified SaaS' : user.authType === 'google' ? 'Google Auth' : 'Gamer Pass'}
                </span>
              </div>
              <p className="text-sm text-slate-400">
                {user.bio || 'Climbing the Chill Arena leaderboards and smashing high scores.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              onClick={() => soundFx.playClick()}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 active:scale-95"
            >
              <User className="w-3.5 h-3.5" />
              Edit Profile
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => soundFx.playClick()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:opacity-95 active:scale-95"
            >
              <Crown className="w-3.5 h-3.5" />
              Leaderboard
            </Link>
          </div>
        </div>

        {/* Level & XP Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <div className="flex items-center gap-2 text-slate-300">
              <Zap className="w-4 h-4 text-[#00F0FF]" />
              <span>Level {user.level} Gamer Progression</span>
              <span className="text-slate-500 font-normal">({user.xp} Total XP)</span>
            </div>
            <span className="text-[#00F0FF]">{xpInCurrentLevel} / 500 XP to Level {user.level + 1}</span>
          </div>
          <div className="h-3 w-full bg-black/50 border border-white/10 rounded-full overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[#00F0FF] via-[#ADFF2F] to-[#00F0FF] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,240,255,0.5)]"
              style={{ width: `${xpProgressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Score */}
        <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#00F0FF]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Score</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{totalScore.toLocaleString()}</div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Cumulative
          </span>
        </div>

        {/* Best Score */}
        <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#00F0FF]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Best Record</span>
            <Crown className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{bestScore.toLocaleString()}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Peak mini-game</span>
        </div>

        {/* Current Rank */}
        <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#00F0FF]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tier Rank</span>
            <Award className="w-4 h-4 text-[#ADFF2F]" />
          </div>
          <div className="text-lg sm:text-xl font-black text-[#ADFF2F]">
            {user.stats.gamesPlayed === 0 ? 'Unranked' : user.level >= 10 ? 'Diamond II' : user.level >= 5 ? 'Gold I' : 'Silver III'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Tier status</span>
        </div>

        {/* Games Played */}
        <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#00F0FF]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Matches</span>
            <Gamepad2 className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{user.stats.gamesPlayed}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Rounds completed</span>
        </div>

        {/* Total Wins */}
        <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#00F0FF]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Wins</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{user.stats.totalWins}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Victories won</span>
        </div>

        {/* Win Rate */}
        <div className="bg-[#121624]/70 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#00F0FF]/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Win Rate</span>
            <BarChart2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">{winRate}%</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Efficiency ratio</span>
        </div>
      </div>

      {/* Main 2-Column Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Recent Games & Featured Arenas */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Play & Recent Games */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-[#00F0FF]" />
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  Jump Back In
                </h2>
              </div>
              <Link href="/games" className="text-xs text-[#00F0FF] hover:underline font-bold flex items-center gap-1">
                View All 12 Games <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(recentGames.length > 0 ? recentGames : topGames).slice(0, 4).map((game: any) => (
                <Link
                  key={game.id}
                  href={`/games/${game.slug}`}
                  onClick={() => soundFx.playClick()}
                  className="group relative overflow-hidden bg-[#121624]/80 border border-white/10 hover:border-[#00F0FF]/50 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,240,255,0.15)] flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      {game.thumbnail}
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      {game.categoryKey}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-base font-black text-white group-hover:text-[#00F0FF] transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                      {game.tagline}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Best: {user.stats.highScores?.[game.id] || 0} pts</span>
                    <span className="text-[#00F0FF] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Play Now <Play className="w-3 h-3 fill-current" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Daily Challenges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#ADFF2F]" />
                <h2 className="text-lg font-black text-white uppercase tracking-wider">
                  Active Quests & Rewards
                </h2>
              </div>
            </div>

            <div className="space-y-3">
              {challenges.map((ch) => (
                <div
                  key={ch.id}
                  className="bg-[#121624]/80 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                      {ch.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{ch.title}</h4>
                      <p className="text-xs text-slate-400">{ch.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-xs font-bold text-[#ADFF2F]">+{ch.rewardXP} XP</span>
                      <span className="text-[10px] text-slate-400 block">{ch.progress}/{ch.target}</span>
                    </div>
                    <button
                      disabled={ch.progress < ch.target || ch.claimed}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        ch.claimed
                          ? 'bg-white/5 text-slate-500 cursor-not-allowed'
                          : ch.progress >= ch.target
                          ? 'bg-[#ADFF2F] text-black shadow-[0_0_15px_rgba(173,255,47,0.4)] cursor-pointer'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}
                    >
                      {ch.claimed ? 'Claimed' : ch.progress >= ch.target ? 'Claim' : 'In Progress'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Badges & Account Overview */}
        <div className="space-y-6">
          {/* Gamer Badges & Achievements */}
          <div className="bg-[#121624]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Badges ({user.badges?.length || 0})
                </h3>
              </div>
              <Link href="/profile" className="text-xs text-[#00F0FF] hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(user.badges || []).slice(0, 4).map((badge) => (
                <div
                  key={badge.id}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center text-center space-y-1 hover:border-amber-400/40 transition-colors"
                >
                  <div className="text-2xl">{badge.icon}</div>
                  <span className="text-xs font-bold text-white">{badge.name}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">{badge.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Security & Info */}
          <div className="bg-[#121624]/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> Account Security
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Email Status</span>
                <span className="text-emerald-400 font-semibold">{user.email ? 'Connected & Secured' : 'Guest Mode'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">Cloud Sync</span>
                <span className="text-[#00F0FF] font-semibold">{user.isCloudSynced ? 'Live Synced 🟢' : 'Local Only'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400">Anti-Cheat Standing</span>
                <span className="text-emerald-400 font-semibold">100% Clean / Fair Play</span>
              </div>
            </div>

            <Link
              href="/profile"
              onClick={() => soundFx.playClick()}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all block text-center"
            >
              Manage Account Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
