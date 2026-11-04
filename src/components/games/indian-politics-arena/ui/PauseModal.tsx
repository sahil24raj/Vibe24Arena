'use client';

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Coffee } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onQuit,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-[#060B1E]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0B1536] border-2 border-[#FFD700] rounded-3xl p-6 shadow-2xl text-center space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-[#FF9933]/20 border border-[#FF9933] flex items-center justify-center text-3xl">
            ☕
          </div>
          <h2 className="text-3xl font-black text-[#FFD700] uppercase tracking-tight">
            CHAI BREAK!
          </h2>
          <p className="text-sm font-semibold text-gray-300 italic">
            &ldquo;Sansad adjourned till further notice. Have a sip of chai!&rdquo;
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 bg-gradient-to-r from-[#FF9933] to-[#FFD700] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-black text-lg rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5"
          >
            <Play className="w-5 h-5 fill-black" /> RESUME FIGHT
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2.5"
          >
            <RotateCcw className="w-4 h-4" /> RESTART ROUND
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2.5"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-red-400" /> SOUND: MUTED
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-green-400" /> SOUND: ACTIVE
              </>
            )}
          </button>

          <button
            onClick={onQuit}
            className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-200 font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2.5"
          >
            <Home className="w-4 h-4" /> QUIT TO MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
