'use client';

import React from 'react';
import { MultiplayerRoomState } from '@/types/multiplayer';
import { TicTacToeState } from '@/lib/multiplayer/adapters/TicTacToeAdapter';
import { soundFx } from '@/lib/audio';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';
import { useGameViewport } from '@/lib/game-engine/useGameViewport';

interface MultiplayerTicTacToeProps {
  room: MultiplayerRoomState<TicTacToeState>;
  currentUserId: string;
  isMyTurn: boolean;
  submitAction: (actionType: string, actionData?: Record<string, any>) => Promise<any>;
}

export const MultiplayerTicTacToe: React.FC<MultiplayerTicTacToeProps> = ({
  room,
  currentUserId,
  isMyTurn,
  submitAction
}) => {
  const { isFullscreen } = useGameViewport();
  const gameState = room.gameState;
  const board = gameState?.board || Array(9).fill(null);
  const mySymbol = gameState?.symbolMap?.[currentUserId] || 'X';
  const players = room.players;
  const player1 = players[0];
  const player2 = players[1];

  const handleCellClick = async (index: number) => {
    if (!isMyTurn || board[index] !== null) {
      soundFx.playWrong();
      return;
    }
    soundFx.playClick();
    await submitAction('PLACE_SYMBOL', { index });
  };

  const winningLine = gameState?.winningLine || [];
  const isHost = room.hostId === currentUserId;


  return (
    <div className={`w-full ${isFullscreen ? 'max-w-2xl' : 'max-w-xl'} mx-auto space-y-6 transition-all`}>
      {/* Player Score & Turn HUD */}
      <div className="grid grid-cols-2 gap-4">
        {/* Player 1 Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            room.currentTurnPlayerId === player1?.id
              ? 'bg-[#00F0FF]/15 border-[#00F0FF] shadow-lg shadow-cyan-500/20 scale-102'
              : 'bg-slate-900/80 border-slate-800 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{player1?.avatar || '👑'}</span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 font-display">
                  <span>{player1?.username || 'Player 1'}</span>
                  {player1?.id === currentUserId && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-cyan-400 font-bold">
                  Symbol: ❌ (X)
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-gray-400">SETS WON</div>
              <div className="text-xl font-black font-mono text-white">
                {gameState?.rounds?.playerScores?.[player1?.id || ''] || 0}
              </div>
            </div>
          </div>
          {room.currentTurnPlayerId === player1?.id && (
            <div className="mt-2 text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>CURRENT TURN</span>
            </div>
          )}
        </div>

        {/* Player 2 Card */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            room.currentTurnPlayerId === player2?.id
              ? 'bg-[#ADFF2F]/15 border-[#ADFF2F] shadow-lg shadow-lime-500/20 scale-102'
              : 'bg-slate-900/80 border-slate-800 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{player2?.avatar || '⚡'}</span>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5 font-display">
                  <span>{player2?.username || 'Player 2'}</span>
                  {player2?.id === currentUserId && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-lime-950 text-lime-300 border border-lime-800 font-mono">
                      YOU
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-lime-400 font-bold">
                  Symbol: ⭕ (O)
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-gray-400">SETS WON</div>
              <div className="text-xl font-black font-mono text-white">
                {gameState?.rounds?.playerScores?.[player2?.id || ''] || 0}
              </div>
            </div>
          </div>
          {room.currentTurnPlayerId === player2?.id && (
            <div className="mt-2 text-[10px] font-mono text-lime-300 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
              <span>CURRENT TURN</span>
            </div>
          )}
        </div>
      </div>

      {/* Turn Banner */}
      <div className="text-center">
        {isMyTurn ? (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-xs font-mono font-bold text-cyan-300 animate-pulse">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>IT'S YOUR TURN — PLACE YOUR {mySymbol}!</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-gray-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>Waiting for opponent to make their move...</span>
          </div>
        )}
      </div>

      {/* 3x3 Interactive Grid */}
      <div className={`p-4 sm:p-6 rounded-3xl glass-panel border-2 border-[#00F0FF]/30 bg-[#0c1017] shadow-2xl transition-all`}>
        <div className={`grid grid-cols-3 gap-2.5 sm:gap-3.5 aspect-square ${
          isFullscreen ? 'w-[min(55vmin,460px)] h-[min(55vmin,460px)]' : 'w-[min(70vmin,380px)] h-[min(70vmin,380px)]'
        } mx-auto transition-all`}>
          {board.map((cell, idx) => {
            const isWinningCell = winningLine.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={!isMyTurn || cell !== null}
                className={`rounded-2xl border flex items-center justify-center ${
                  isFullscreen ? 'text-4xl sm:text-6xl' : 'text-3xl sm:text-5xl'
                } font-black transition-all cursor-pointer select-none ${
                  isWinningCell
                    ? 'bg-yellow-500/25 border-yellow-400 text-yellow-300 shadow-xl shadow-yellow-500/30 scale-105'
                    : cell === 'X'
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-[#00F0FF]'
                    : cell === 'O'
                    ? 'bg-lime-950/40 border-lime-500/40 text-[#ADFF2F]'
                    : isMyTurn
                    ? 'bg-slate-900/80 border-slate-700 hover:border-[#00F0FF] hover:bg-slate-800/80'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-60'
                }`}
              >
                {cell === 'X' ? '❌' : cell === 'O' ? '⭕' : ''}
              </button>
            );
          })}
        </div>

        {/* Set Progress Info */}
        <div className="mt-5 text-center text-xs font-mono text-gray-400 flex items-center justify-center gap-4">
          <span>Set Round #{gameState?.rounds?.roundNumber || 1}</span>
          <span>•</span>
          <span>First to {gameState?.rounds?.targetWins || 2} sets wins championship!</span>
        </div>
      </div>
    </div>
  );
};
