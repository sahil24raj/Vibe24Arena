'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Globe,
  Users,
  Flame,
  Gamepad2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  ShieldCheck,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { soundFx } from '@/lib/audio';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import {
  fetchCloudLeaderboard,
  fetchAllCloudLeaderboard,
  subscribeToCloudLeaderboard
} from '@/lib/firebaseService';
import { LeaderboardEntry } from '@/types';
import { GamerAvatar } from '@/components/profile/GamerAvatar';

const PAGE_SIZE = 25;

export default function LeaderboardPage() {
  const { user } = useAppStore();
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Compute highest score of current user
  const highestUserScore = Math.max(0, ...Object.values(user.stats.highScores || {}));

  const loadData = useCallback(async (gameId = 'all', showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    setIsRefreshing(true);

    try {
      // Fetch exhaustive unified rankings (leaderboards collection + registered users)
      const data = await fetchAllCloudLeaderboard(gameId);
      setLeaderboardData(data);
    } catch (err) {
      console.warn('Error loading leaderboard data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedGameFilter, true);

    // Live push subscription
    const unsub = subscribeToCloudLeaderboard(
      (cloudEntries) => {
        if (cloudEntries && cloudEntries.length > 0) {
          loadData(selectedGameFilter, false);
        }
      },
      200,
      selectedGameFilter
    );

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [selectedGameFilter, loadData]);

  // Filter by search query
  const filteredData = useMemo(() => {
    let result = leaderboardData;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.username.toLowerCase().includes(q) ||
          (e.gameTitle && e.gameTitle.toLowerCase().includes(q))
      );
    }
    return result;
  }, [leaderboardData, searchQuery]);

  // Pagination calculation
  const totalUsers = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, currentPage]);

  const top1 = filteredData[0];
  const top2 = filteredData[1];
  const top3 = filteredData[2];

  const handlePageChange = (newPage: number) => {
    soundFx.playClick();
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header Banner */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-mono text-amber-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>PRODUCTION CLOUD ESPORTS ARENA STANDINGS</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight font-display">
          HALL OF FAME & RANKINGS
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 font-sans leading-relaxed">
          Real scores submitted by verified players across all classroom duels, social deduction games, and rapid mind battles.
        </p>

        {/* Live Sync Status Pill */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/40 text-[11px] font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Live Server Anti-Cheat Verified Records</span>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              loadData(selectedGameFilter, true);
            }}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] font-mono text-cyan-400 hover:text-white transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Game Filter Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-5xl mx-auto scrollbar-thin">
        <button
          onClick={() => {
            soundFx.playClick();
            setSelectedGameFilter('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedGameFilter === 'all'
              ? 'bg-gradient-to-r from-[#00F0FF] to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
          }`}
        >
          🌐 All Vibes Global
        </button>

        {GAMES_CATALOG.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              soundFx.playClick();
              setSelectedGameFilter(g.id);
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGameFilter === g.id
                ? 'bg-gradient-to-r from-[#00F0FF] to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900 border border-slate-800 text-gray-400 hover:text-white'
            }`}
          >
            <span>{g.thumbnail}</span>
            <span>{g.title}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by player username..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-gray-500 text-xs font-mono focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
        </div>
        <div className="text-xs font-mono text-gray-400 shrink-0">
          Showing <strong className="text-white">{totalUsers}</strong> Players
        </div>
      </div>

      {/* User Current Standing Info Card */}
      <div className="max-w-4xl mx-auto p-4 sm:p-5 rounded-2xl border border-[#00F0FF]/30 bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <GamerAvatar
            avatar={user.avatar}
            photoURL={user.photoURL}
            avatarType={user.avatarType}
            size="lg"
            showOnline={true}
            isOnline={true}
            rank={user.rank as string}
          />
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-sm font-black text-white">{user.displayName || user.username}</span>
              <span className="text-[10px] font-mono text-[#00F0FF] px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                LVL {user.level}
              </span>
              <span className="text-[10px] font-mono text-yellow-400 px-1.5 py-0.5 rounded bg-yellow-950 border border-yellow-800">
                {user.rank || 'Bronze II'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Your Personal Best:{' '}
              <strong className="text-[#00F0FF] font-mono">
                {highestUserScore > 0 ? `${highestUserScore.toLocaleString()} pts` : 'No score recorded yet'}
              </strong>
              {' • '}
              Total Wins: <strong className="text-emerald-400 font-mono">{user.stats.totalWins || 0}</strong>
            </p>
          </div>
        </div>

        <Link
          href="/games"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20"
        >
          <Play className="w-4 h-4 fill-current" />
          PLAY TO SET RECORD
        </Link>
      </div>

      {/* Top 3 Podium Cards (Rendered if entries exist) */}
      {filteredData.length >= 3 && currentPage === 1 && !searchQuery && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4 items-end">
          {/* Rank 2 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center order-2 sm:order-1 shadow-xl">
            <span className="text-3xl mb-1">🥈</span>
            <GamerAvatar avatar={top2.avatar} size="xl" rank="Silver" className="my-2" />
            <div className="text-sm font-black text-white">{top2.username}</div>
            <div className="text-[10px] text-gray-400 font-mono">{top2.gameTitle || 'Top Arena Match'}</div>
            <div className="text-xl font-black text-gray-300 font-mono mt-2">{top2.score.toLocaleString()} pts</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{top2.wins} Wins</div>
          </div>

          {/* Rank 1 (Champion) */}
          <div className="bg-gradient-to-b from-amber-500/20 to-slate-900 border-2 border-yellow-500/60 rounded-2xl p-6 text-center flex flex-col items-center order-1 sm:order-2 shadow-2xl shadow-yellow-500/10 scale-105">
            <span className="text-4xl mb-1 animate-bounce">👑</span>
            <GamerAvatar avatar={top1.avatar} size="2xl" rank="Grandmaster" className="my-2" />
            <div className="text-base font-black text-white">{top1.username}</div>
            <div className="text-xs text-yellow-400 font-mono font-bold">{top1.gameTitle || 'Top Arena Match'}</div>
            <div className="text-2xl font-black text-yellow-400 font-mono mt-2">{top1.score.toLocaleString()} pts</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{top1.wins} Wins</div>
            <span className="mt-2 text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-bold border border-yellow-500/30">
              ARENA CHAMPION
            </span>
          </div>

          {/* Rank 3 */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-center flex flex-col items-center order-3 shadow-xl">
            <span className="text-3xl mb-1">🥉</span>
            <GamerAvatar avatar={top3.avatar} size="xl" rank="Bronze" className="my-2" />
            <div className="text-sm font-black text-white">{top3.username}</div>
            <div className="text-[10px] text-gray-400 font-mono">{top3.gameTitle || 'Top Arena Match'}</div>
            <div className="text-xl font-black text-amber-500 font-mono mt-2">{top3.score.toLocaleString()} pts</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{top3.wins} Wins</div>
          </div>
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-gray-400">
          <span>ARENA PLAYERS ({totalUsers})</span>
          <span>SCORE & STATS</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-mono text-xs flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Fetching exhaustive verified rankings from Firestore...</span>
          </div>
        ) : filteredData.length === 0 ? (
          /* Honest Empty State */
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800/80 text-3xl flex items-center justify-center mx-auto text-gray-400">
              🏆
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No scores recorded for this category yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Be the first player to complete a match and claim the #1 Champion spot on the leaderboard!
              </p>
            </div>
            <Link
              href="/games"
              onClick={() => soundFx.playClick()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
            >
              <Play className="w-4 h-4 fill-current" />
              PLAY A GAME NOW
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {paginatedData.map((entry) => {
              const isCurrentUser =
                entry.username === user.username ||
                entry.username === user.displayName ||
                entry.username.toLowerCase() === (user.username || '').toLowerCase();

              return (
                <div
                  key={`${entry.rank}-${entry.username}-${entry.gameId}`}
                  className={`px-6 py-3.5 flex items-center justify-between transition-colors ${
                    isCurrentUser ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-7 text-center font-mono font-bold text-sm ${
                        entry.rank === 1
                          ? 'text-yellow-400 font-black'
                          : entry.rank === 2
                          ? 'text-gray-300 font-black'
                          : entry.rank === 3
                          ? 'text-amber-500 font-black'
                          : 'text-gray-500'
                      }`}
                    >
                      #{entry.rank}
                    </span>
                    <GamerAvatar avatar={entry.avatar} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-white">{entry.username}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{entry.gameTitle || 'Arena Game'}</span>
                        {entry.wins !== undefined && entry.wins > 0 && (
                          <span className="text-emerald-400">🏆 {entry.wins}W</span>
                        )}
                        {entry.xp !== undefined && entry.xp > 0 && (
                          <span className="text-cyan-400">⚡ {entry.xp} XP</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-sm text-[#00F0FF]">
                      {entry.score.toLocaleString()} PTS
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      {entry.badge || '⚡ Arena Competitor'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-gray-400">
              Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-gray-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
