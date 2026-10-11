'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MultiplayerRoomState, RoomPlayer } from '@/types/multiplayer';
import { WordBuilderState } from '@/lib/multiplayer/adapters/WordBuilderAdapter';
import { soundFx } from '@/lib/audio';
import { Sparkles, Trophy, Shuffle, Delete, Send, Clock, CheckCircle2, AlertCircle, Bot, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MultiplayerWordBuilderProps {
  room: MultiplayerRoomState<WordBuilderState>;
  currentUserId: string;
  isHost: boolean;
  submitAction: (actionType: string, actionData?: Record<string, any>) => Promise<any>;
}

export const MultiplayerWordBuilder: React.FC<MultiplayerWordBuilderProps> = ({
  room,
  currentUserId,
  isHost,
  submitAction
}) => {
  const gameState = room.gameState;
  const players = room.players;
  const me = players.find((p) => p.id === currentUserId || p.userId === currentUserId) || players[0];
  const opponent = players.find((p) => p.id !== me.id) || players[1] || null;

  // Local state for letter selection & tile order
  const [tiles, setTiles] = useState<string[]>(gameState?.letters || ['W', 'O', 'R', 'D', 'S']);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [enteredWord, setEnteredWord] = useState<string>('');
  const [shakeInput, setShakeInput] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastScoredWord, setLastScoredWord] = useState<{ word: string; pts: number } | null>(null);

  // Sync tiles from gameState when room updates
  useEffect(() => {
    if (gameState?.letters && gameState.letters.length > 0) {
      setTiles(gameState.letters);
    }
  }, [gameState?.levelId, gameState?.letters]);

  // Match Countdown Timer
  const [timeLeft, setTimeLeft] = useState<number>(gameState?.timeRemainingSec || 60);

  useEffect(() => {
    if (room.status !== 'PLAYING') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isHost) {
            submitAction('TIME_UP', {});
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room.status, isHost, submitAction]);

  // Scores & found words from gameState
  const myScore = gameState?.playerScores?.[me.id] || 0;
  const opponentScore = opponent ? gameState?.playerScores?.[opponent.id] || 0 : 0;
  const myWords = gameState?.foundWordsMap?.[me.id] || [];
  const opponentWords = opponent ? gameState?.foundWordsMap?.[opponent.id] || [] : [];
  const targetWords = gameState?.targetWords || [];



  // Tile Clicks & Input
  const handleTileClick = (index: number) => {
    if (selectedIndices.includes(index)) return;
    soundFx.playClick();
    const newIndices = [...selectedIndices, index];
    setSelectedIndices(newIndices);
    setEnteredWord(newIndices.map((i) => tiles[i]).join(''));
    setErrorMsg(null);
  };

  const handleBackspace = () => {
    if (selectedIndices.length === 0) return;
    soundFx.playClick();
    const newIndices = selectedIndices.slice(0, -1);
    setSelectedIndices(newIndices);
    setEnteredWord(newIndices.map((i) => tiles[i]).join(''));
    setErrorMsg(null);
  };

  const handleClear = () => {
    soundFx.playClick();
    setSelectedIndices([]);
    setEnteredWord('');
    setErrorMsg(null);
  };

  const handleShuffle = () => {
    soundFx.playClick();
    const shuffled = [...tiles].sort(() => Math.random() - 0.5);
    setTiles(shuffled);
    setSelectedIndices([]);
    setEnteredWord('');
  };

  // Submit Word
  const handleSubmitWord = async () => {
    const wordToSubmit = enteredWord.trim().toUpperCase();
    if (wordToSubmit.length < 3) {
      soundFx.playWrong();
      setErrorMsg('Word must be at least 3 letters!');
      triggerShake();
      return;
    }

    if (myWords.includes(wordToSubmit)) {
      soundFx.playWrong();
      setErrorMsg(`"${wordToSubmit}" already found!`);
      triggerShake();
      return;
    }

    const res = await submitAction('SUBMIT_WORD', { word: wordToSubmit });

    if (res?.success) {
      soundFx.playCorrect();
      const isTarget = res.data?.gameState?.targetWords?.includes(wordToSubmit) || false;
      const pts = wordToSubmit.length * 50 + (isTarget ? 100 : 0);
      setLastScoredWord({ word: wordToSubmit, pts });
      handleClear();

      if (isTarget) {
        confetti({ particleCount: 30, spread: 45, origin: { y: 0.7 } });
      }
    } else {
      soundFx.playWrong();
      setErrorMsg(res?.error || 'Invalid dictionary word!');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShakeInput(true);
    setTimeout(() => setShakeInput(false), 500);
  };

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an external input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmitWord();
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        handleShuffle();
        return;
      }

      // Letter keys
      const keyUpper = e.key.toUpperCase();
      if (/^[A-Z]$/.test(keyUpper)) {
        // Find first unused tile with this letter
        const availableIdx = tiles.findIndex(
          (letter, idx) => letter === keyUpper && !selectedIndices.includes(idx)
        );
        if (availableIdx !== -1) {
          e.preventDefault();
          handleTileClick(availableIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tiles, selectedIndices, enteredWord, myWords, targetWords]);

  return (
    <div className="w-full h-full flex flex-col justify-between p-3 sm:p-5 select-none max-w-4xl mx-auto overflow-y-auto">
      {/* ========================================================= */}
      {/* 1. TOP LIVE SCOREBOARD & DUEL STATUS                      */}
      {/* ========================================================= */}
      <div className="w-full space-y-2">
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
          {/* Player 1 (You) */}
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">{me.avatar}</span>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-cyan-400 font-bold flex items-center gap-1 truncate">
                <span>{me.username}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300">YOU</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-display">
                {myScore} <span className="text-xs font-mono text-gray-400 font-normal">PTS</span>
              </div>
            </div>
          </div>

          {/* Player 2 (Opponent / Bot) */}
          <div className="flex items-center justify-end gap-2.5 text-right">
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-rose-400 font-bold flex items-center justify-end gap-1 truncate">
                {opponent?.isBot && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300">BOT</span>
                )}
                <span>{opponent?.username || 'Opponent'}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-display">
                {opponentScore} <span className="text-xs font-mono text-gray-400 font-normal">PTS</span>
              </div>
            </div>
            <span className="text-3xl">{opponent?.avatar || '👤'}</span>
          </div>
        </div>

        {/* Match Info Bar: Theme, Targets & Timer */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              THEME: {gameState?.theme || 'PVP WORD DUEL'}
            </span>
            <span className="hidden sm:inline-block text-gray-400">
              🎯 TARGETS: {targetWords.length}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-black font-mono text-sm border ${
              timeLeft <= 10
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 animate-pulse'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CENTER: SCRAMBLED TILES & CURRENT WORD DISPLAY         */}
      {/* ========================================================= */}
      <div className="flex flex-col items-center justify-center my-auto py-3 space-y-3 w-full">
        {/* Floating feedback alert */}
        {lastScoredWord && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono animate-bounce shadow-lg">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>+{lastScoredWord.pts} PTS FOR "{lastScoredWord.word}"!</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold font-mono shadow-lg">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Word Display Input Slot */}
        <div
          className={`w-full max-w-md min-h-[58px] sm:min-h-[68px] rounded-2xl bg-slate-950/90 border-2 ${
            shakeInput
              ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.4)] animate-shake'
              : enteredWord.length > 0
              ? 'border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.3)]'
              : 'border-slate-800'
          } flex items-center justify-center px-4 py-2 gap-2 flex-wrap transition-all backdrop-blur-md`}
        >
          {enteredWord.length === 0 ? (
            <span className="text-slate-600 text-xs sm:text-sm font-mono tracking-wider italic">
              Click tiles or type on keyboard...
            </span>
          ) : (
            enteredWord.split('').map((char, idx) => (
              <span
                key={idx}
                className="w-8 h-10 sm:w-10 sm:h-12 rounded-xl bg-gradient-to-b from-cyan-500/20 to-blue-500/20 border-2 border-cyan-400 text-cyan-300 font-display font-black text-lg sm:text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.3)] animate-in zoom-in-75 duration-100"
              >
                {char}
              </span>
            ))
          )}
        </div>

        {/* Scrambled Letter Tiles */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 py-2 max-w-xl">
          {tiles.map((letter, index) => {
            const isUsed = selectedIndices.includes(index);
            return (
              <button
                key={index}
                onClick={() => handleTileClick(index)}
                disabled={isUsed}
                className={`w-12 h-14 sm:w-16 sm:h-18 rounded-2xl font-black font-display text-xl sm:text-2xl transition-all duration-150 flex items-center justify-center cursor-pointer shadow-lg active:scale-95 ${
                  isUsed
                    ? 'bg-slate-900/40 border border-slate-850 text-slate-700 opacity-20 scale-95 shadow-none'
                    : 'bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 text-white hover:border-[#00F0FF] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:-translate-y-1'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Input Action Controls: Shuffle, Backspace, Submit */}
        <div className="flex items-center gap-2 sm:gap-3 w-full max-w-md">
          <button
            onClick={handleShuffle}
            title="Shuffle tiles (Spacebar)"
            className="flex-1 py-2.5 sm:py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-gray-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shuffle className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">SHUFFLE</span>
          </button>

          <button
            onClick={handleBackspace}
            title="Delete last letter (Backspace)"
            className="py-2.5 sm:py-3 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-gray-300 text-xs font-mono font-bold flex items-center justify-center transition-colors cursor-pointer"
          >
            <Delete className="w-4 h-4 text-rose-400" />
          </button>

          <button
            onClick={handleSubmitWord}
            disabled={enteredWord.length < 3}
            className={`flex-[2] py-2.5 sm:py-3 rounded-xl font-display text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
              enteredWord.length >= 3
                ? 'bg-gradient-to-r from-[#00F0FF] to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-cyan-500/25 cursor-pointer transform hover:scale-[1.02] active:scale-98'
                : 'bg-slate-800 text-gray-500 border border-slate-700 opacity-50 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 fill-current" />
            <span>SUBMIT WORD</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BOTTOM: LIVE WORDS COMPARISON TABS                     */}
      {/* ========================================================= */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800">
        {/* Your found words */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 max-h-24 overflow-y-auto">
          <div className="text-[10px] font-mono text-cyan-400 font-bold mb-1 flex items-center justify-between">
            <span>YOUR WORDS ({myWords.length})</span>
            <span>+{myScore} pts</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {myWords.length === 0 ? (
              <span className="text-[10px] text-gray-500 italic">No words submitted yet</span>
            ) : (
              myWords.map((w, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    targetWords.includes(w)
                      ? 'bg-amber-500/20 text-yellow-300 border border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}
                >
                  {w} {targetWords.includes(w) ? '⭐' : ''}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Opponent's found words */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 max-h-24 overflow-y-auto">
          <div className="text-[10px] font-mono text-rose-400 font-bold mb-1 flex items-center justify-between">
            <span>{opponent?.username || 'OPPONENT'}'S WORDS ({opponentWords.length})</span>
            <span>+{opponentScore} pts</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {opponentWords.length === 0 ? (
              <span className="text-[10px] text-gray-500 italic">No words submitted yet</span>
            ) : (
              opponentWords.map((w, i) => (
                <span
                  key={i}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    targetWords.includes(w)
                      ? 'bg-amber-500/20 text-yellow-300 border border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {w} {targetWords.includes(w) ? '⭐' : ''}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
