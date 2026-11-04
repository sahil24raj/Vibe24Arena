'use client';

import React, { useState } from 'react';
import { Users2, ArrowLeft, Play, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { VehicleConfig } from '../engine/types';

interface AutoRushMultiplayerModalProps {
  onHostRoom: () => void;
  onJoinRoom: (pin: string) => void;
  onStartRace: () => void;
  onBack: () => void;
  roomPin: string | null;
  currentVehicle: VehicleConfig;
}

export const AutoRushMultiplayerModal: React.FC<AutoRushMultiplayerModalProps> = ({
  onHostRoom,
  onJoinRoom,
  onStartRace,
  onBack,
  roomPin,
  currentVehicle
}) => {
  const [pinInput, setPinInput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && roomPin) {
      navigator.clipboard.writeText(`${window.location.origin}/game/auto-rush?room=${roomPin}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#060B1E]/95 backdrop-blur-md flex items-center justify-center p-4 select-none text-white">
      <div className="max-w-md w-full bg-[#0B1536] border-2 border-[#00D2FF] rounded-3xl p-6 shadow-2xl flex flex-col space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK
          </button>

          <div className="flex items-center gap-1.5 text-cyan-300 font-black text-sm uppercase tracking-wider">
            <Users2 className="w-4 h-4" /> MULTIPLAYER GULLY
          </div>
        </div>

        {/* Room State */}
        {!roomPin ? (
          <div className="space-y-4">
            {/* Host Section */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-4 text-center space-y-3">
              <h3 className="font-black text-base text-white uppercase">CREATE PRIVATE ROOM</h3>
              <p className="text-xs text-gray-300">
                Host a multiplayer duel with up to 8 real players across any browser or device!
              </p>
              <button
                onClick={onHostRoom}
                className="w-full py-3 bg-gradient-to-r from-[#00D2FF] to-[#3B82F6] hover:opacity-90 text-black font-black text-sm rounded-xl shadow-lg transition-all transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-black" /> CREATE ROOM (कमरा बनाएं)
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400 font-bold justify-center">
              <span className="h-px bg-white/10 flex-1" />
              <span>OR JOIN WITH PIN</span>
              <span className="h-px bg-white/10 flex-1" />
            </div>

            {/* Join Section */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value.toUpperCase())}
                  placeholder="ENTER 4-DIGIT PIN"
                  className="flex-1 bg-black/60 border border-white/20 rounded-xl px-4 py-3 text-center text-lg font-mono font-black text-cyan-300 placeholder:text-gray-500 uppercase tracking-widest focus:outline-none focus:border-cyan-400"
                />
                <button
                  onClick={() => pinInput.length === 4 && onJoinRoom(pinInput)}
                  disabled={pinInput.length !== 4}
                  className={`px-5 py-3 rounded-xl font-black text-sm transition-all ${
                    pinInput.length === 4
                      ? 'bg-[#FF9933] text-black hover:bg-[#F97316] shadow-md'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  JOIN
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Room Lobby */
          <div className="space-y-4">
            <div className="bg-black/50 border border-cyan-400/30 rounded-2xl p-4 text-center space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                SHARE THIS 4-DIGIT ROOM PIN
              </span>
              <div className="text-4xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00D2FF] to-[#3B82F6] tracking-widest">
                {roomPin}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'LINK COPIED!' : 'COPY INVITE LINK'}</span>
                </button>
              </div>
            </div>

            {/* Connected Racers List */}
            <div className="space-y-2">
              <div className="text-xs font-black uppercase text-gray-400">
                CONNECTED RACERS (2 / 8 READY)
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                <div className="flex items-center justify-between p-2.5 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-white">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    YOU (HOST) — {currentVehicle.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">READY</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-bold text-gray-300">
                  <span>Raju Bhai — Dilli Classic</span>
                  <span className="text-[10px] text-cyan-300 font-mono">CONNECTED</span>
                </div>
              </div>
            </div>

            {/* Start Multiplayer Race Button */}
            <button
              onClick={onStartRace}
              className="w-full py-3.5 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-sm rounded-xl shadow-xl transition-all transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" /> START MULTIPLAYER DUEL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
