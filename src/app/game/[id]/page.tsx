'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';

// 6 Core Interactive Arena Games + Classic Games
import { PenFlipCanvas } from '@/components/games/PenFlipCanvas';
import { SpinCricketCanvas } from '@/components/games/SpinCricketCanvas';
import { WordBuilderCanvas } from '@/components/games/WordBuilderCanvas';
import { TicTacToeCanvas } from '@/components/games/TicTacToeCanvas';
import { BrainPotCanvas } from '@/components/games/BrainPotCanvas';
import { ChorSipahiGame } from '@/components/games/chor-sipahi/ChorSipahiGame';
import { ModiRunCanvas } from '@/components/games/ModiRunCanvas';
import { CIDEscapeCanvas } from '@/components/games/CIDEscapeCanvas';
import { EmojiDodgeCanvas } from '@/components/games/EmojiDodgeCanvas';
import { EraserThrowCanvas } from '@/components/games/EraserThrowCanvas';
import { GullyCricketCanvas } from '@/components/games/GullyCricketCanvas';
import { ChaiTapriCanvas } from '@/components/games/ChaiTapriCanvas';
import { MemeClickerCanvas } from '@/components/games/MemeClickerCanvas';
import { FakeBombCanvas } from '@/components/games/fake-bomb/FakeBombCanvas';
import { EscapeDoorGame } from '@/components/games/escape-door/EscapeDoorGame';
import { GenZProtestRunCanvas } from '@/components/games/genz-protest-run/GenZProtestRunCanvas';

import { SingleUnifiedMultiplayerModal } from '@/components/game-shell/SingleUnifiedMultiplayerModal';
import {
  Gamepad2,
  ThumbsUp,
  Share2,
  Flame,
  MessageSquare,
  Trophy,
  Star,
  Users,
  Clock,
  Zap,
  BookOpen,
  ArrowLeft,
  Swords
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GameErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GameErrorBoundary] Captured game runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[500px] rounded-3xl bg-[#0c1017] border border-pink-500/30 p-8 flex flex-col items-center justify-center text-center space-y-4 shadow-2xl">
          <span className="text-5xl">⚛️</span>
          <h3 className="text-xl font-black text-white font-display">Arena Standby</h3>
          <p className="text-xs text-gray-400 max-w-md">
            Click below to initialize the game arena session!
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-xs tracking-wider transition-all shadow-lg cursor-pointer"
          >
            LAUNCH GAME ARENA
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function GamePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, addRecentlyPlayed } = useAppStore();

  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [commentsList, setCommentsList] = useState<
    { id: string; user: string; text: string; time: string; likes: number }[]
  >([]);

  const game = GAMES_CATALOG.find((g) => g.id === id) || GAMES_CATALOG[0];

  useEffect(() => {
    addRecentlyPlayed(game.id);
  }, [game.id, addRecentlyPlayed]);

  const handleLike = () => {
    soundFx.playCoin();
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      confetti({ particleCount: 30, spread: 40 });
    } else {
      setLikes(Math.max(0, likes - 1));
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    soundFx.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('🎮 Game Duel Link Copied to Clipboard!');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    soundFx.playLevelUp();
    setCommentsList([
      {
        id: Date.now().toString(),
        user: user.displayName || user.username,
        text: commentText.trim(),
        time: 'Just now',
        likes: 0
      },
      ...commentsList
    ]);
    setCommentText('');
  };

  const renderGameCanvas = () => {
    switch (game.id) {
      case 'genz-protest-run':
        return (
          <React.Suspense fallback={<div className="p-8 text-center text-xs font-mono text-[#00F0FF]">Loading GenZ Protest Run...</div>}>
            <GenZProtestRunCanvas />
          </React.Suspense>
        );
      case 'escape-door':
        return (
          <React.Suspense fallback={<div className="p-8 text-center text-xs font-mono text-[#00F0FF]">Loading Escape From The Door...</div>}>
            <EscapeDoorGame />
          </React.Suspense>
        );
      case 'fake-bomb':
        return (
          <React.Suspense fallback={<div className="p-8 text-center text-xs font-mono text-[#00F0FF]">Loading Fake Bomb Chaos Core...</div>}>
            <FakeBombCanvas />
          </React.Suspense>
        );
      case 'chor-sipahi':
        return (
          <React.Suspense fallback={<div className="p-8 text-center text-xs font-mono text-[#00F0FF]">Loading Chor Sipahi...</div>}>
            <ChorSipahiGame />
          </React.Suspense>
        );
      case 'word-builder':
        return <WordBuilderCanvas />;
      case 'tic-tac-toe':
        return <TicTacToeCanvas />;
      case 'spin-cricket':
        return <SpinCricketCanvas />;
      case 'pen-flip':
        return <PenFlipCanvas />;
      case 'brain-pot':
        return <BrainPotCanvas />;
      case 'modi-run':
        return <ModiRunCanvas />;
      case 'cid-escape':
        return <CIDEscapeCanvas />;
      case 'emoji-dodge':
        return <EmojiDodgeCanvas />;
      case 'eraser-throw':
        return <EraserThrowCanvas />;
      case 'gully-cricket':
        return <GullyCricketCanvas />;
      case 'chai-tapri':
        return <ChaiTapriCanvas />;
      case 'meme-clicker':
        return <MemeClickerCanvas />;
      default:
        return <WordBuilderCanvas />;
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <SingleUnifiedMultiplayerModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        gameId={game.id}
        gameTitle={game.title}
        gameThumbnail={game.thumbnail}
        user={user}
      />

      {/* Back to Games Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/games"
          onClick={() => soundFx.playClick()}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-[#00F0FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>BACK TO GAMES CATALOG</span>
        </Link>

        {game.multiplayer && (
          <button
            onClick={() => {
              soundFx.playClick();
              setIsOnlineModalOpen(true);
            }}
            className="px-4 py-1.5 rounded-lg bg-lime-400/10 border border-lime-400/40 text-lime-400 hover:bg-lime-400 hover:text-slate-950 text-xs font-bold font-display flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(173,255,47,0.15)] cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5 text-lime-400 group-hover:text-slate-950" />
            <span>CREATE MULTIPLAYER ROOM (#CODE)</span>
          </button>
        )}
      </div>

      {/* Game Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl glass-panel border border-[#00F0FF]/20 bg-[#0c1017]/90">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{game.thumbnail}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-display flex items-center gap-2">
                {game.title}
              </h1>
              <div className="flex items-center gap-3 text-xs font-mono text-gray-400 pt-0.5">
                <span className="text-[#00F0FF]">{game.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {game.rating}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {game.duration}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              hasLiked
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/40'
                : 'bg-slate-900 border border-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{likes}</span>
          </button>

          <button
            onClick={handleShare}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-[#00F0FF] flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>SHARE DUEL LINK</span>
          </button>
        </div>
      </div>

      {/* LIVE GAME VIEWPORT */}
      <div className="w-full flex justify-center">
        <GameErrorBoundary fallbackTitle={game.title}>
          {renderGameCanvas()}
        </GameErrorBoundary>
      </div>

      {/* Game Details, Rules & Comments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* About & Rules */}
          <div className="glass-panel p-6 rounded-3xl border-gray-800 bg-[#0c1017]/90 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 font-display">
              <Gamepad2 className="w-5 h-5 text-[#00F0FF]" /> About {game.title}
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">{game.description}</p>

            {/* Rules */}
            {game.rules && game.rules.length > 0 && (
              <div className="pt-4 border-t border-gray-800">
                <h4 className="text-xs font-bold text-[#ADFF2F] uppercase tracking-wider mb-2 font-display flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Official Match Rules
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-300 font-mono">
                  {game.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F]" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Controls */}
            <div className="pt-4 border-t border-gray-800">
              <h4 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-2 font-display">
                Controls & Keys
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-400 font-mono">
                {game.controls.map((ctrl, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                    <span>{ctrl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gamer Comments section */}
          <div className="glass-panel p-6 rounded-3xl border-gray-800 bg-[#0c1017]/90 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2 font-display">
              <MessageSquare className="w-5 h-5 text-pink-400" /> Community Trash Talk & Reviews ({commentsList.length})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Post a funny comment or roast..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-950 border border-gray-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00F0FF]"
              />
              <button
                type="submit"
                className="cyber-button px-6 py-2.5 rounded-xl text-xs font-black text-slate-950 font-display shadow-lg"
              >
                Post
              </button>
            </form>

            {commentsList.length > 0 ? (
              <div className="space-y-3 pt-2 font-mono">
                {commentsList.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-gray-850 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#00F0FF]">{c.user}</span>
                      <span className="text-[10px] text-gray-500">{c.time}</span>
                    </div>
                    <p className="text-gray-300 font-sans">{c.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-800 rounded-2xl bg-slate-950/40 space-y-1">
                <p className="text-xs text-gray-400 font-sans">No reviews or roasts posted yet.</p>
                <p className="text-[10px] text-gray-600 font-sans">Be the first gamer to share tips or strategies for this game!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Recommended Games */}
        <div className="glass-panel p-6 rounded-3xl border-gray-800 bg-[#0c1017]/90 space-y-4">
          <h3 className="text-base font-black text-white flex items-center gap-2 font-display">
            <Flame className="w-5 h-5 text-pink-500" /> More Mini-Games
          </h3>

          <div className="space-y-3">
            {GAMES_CATALOG.filter((g) => g.id !== game.id).slice(0, 6).map((rec) => (
              <Link
                key={rec.id}
                href={`/game/${rec.id}`}
                onClick={() => soundFx.playClick()}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950/80 border border-gray-850 hover:border-[#00F0FF] transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-gray-800 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                  {rec.thumbnail}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white group-hover:text-[#00F0FF] transition-colors font-display truncate">
                    {rec.title}
                  </h4>
                  <span className="text-[10px] text-gray-400 font-mono block truncate">{rec.category}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
