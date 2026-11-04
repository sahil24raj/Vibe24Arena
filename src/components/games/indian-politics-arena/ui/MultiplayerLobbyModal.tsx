'use client';

import React, { useState } from 'react';
import { ArrowLeft, Copy, Share2, Globe2, Check, Loader2 } from 'lucide-react';

interface MultiplayerLobbyModalProps {
  onHostRoom: () => void;
  onJoinRoom: (code: string) => void;
  onBack: () => void;
  roomCode: string | null;
  isConnecting: boolean;
  error: string | null;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  onHostRoom,
  onJoinRoom,
  onBack,
  roomCode,
  isConnecting,
  error
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!roomCode || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/games/indian-politics-arena?room=${roomCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    if (!roomCode || typeof window === 'undefined') return;
    const shareUrl = `${window.location.origin}/games/indian-politics-arena?room=${roomCode}`;
    const text = encodeURIComponent(
      `Bhai, Sansad Se Sadak Tak fight karte hain! Join my match in INDIAN POLITICS ARENA on Vibe Arena: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0B1536] border-2 border-[#00D2FF] rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> BACK
          </button>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#00D2FF] flex items-center gap-1">
            <Globe2 className="w-4 h-4" /> REAL-TIME MULTIPLAYER
          </span>
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            PLAY WITH A FRIEND
          </h2>
          <p className="text-xs text-gray-300">
            Challenge your friend to an online political duel in real-time.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-xs text-center font-semibold">
            {error}
          </div>
        )}

        {!roomCode ? (
          <div className="space-y-4">
            <button
              onClick={onHostRoom}
              disabled={isConnecting}
              className="w-full py-4 bg-gradient-to-r from-[#FF9933] to-[#FFD700] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-black text-lg rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {isConnecting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'HOST A ROOM'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 font-bold uppercase">OR JOIN WITH CODE</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (inputCode.trim()) onJoinRoom(inputCode.trim().toUpperCase());
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                placeholder="ROOM CODE"
                maxLength={6}
                className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-center text-lg font-mono font-bold text-white placeholder-gray-500 focus:outline-none focus:border-[#00D2FF] tracking-wider"
              />
              <button
                type="submit"
                disabled={!inputCode.trim() || isConnecting}
                className="px-6 py-3 bg-[#00D2FF] hover:bg-[#38BDF8] disabled:opacity-50 text-black font-black rounded-xl transition-all"
              >
                JOIN
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-black/40 border border-[#00D2FF]/40 rounded-2xl">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-widest block mb-1">
                YOUR ROOM CODE
              </span>
              <span className="text-4xl font-mono font-black text-[#FFD700] tracking-widest">
                {roomCode}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'COPIED LINK!' : 'COPY LINK'}
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="flex-1 py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 rounded-xl text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Share2 className="w-4 h-4" /> SHARE ON WHATSAPP
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-amber-300 font-semibold animate-pulse pt-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Waiting for your friend to enter room...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

