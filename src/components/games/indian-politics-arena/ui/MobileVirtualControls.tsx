'use client';

import React from 'react';
import { PlayerInput } from '../engine/types';
import { Flame, Shield, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface MobileVirtualControlsProps {
  onAction: (action: keyof PlayerInput, active: boolean) => void;
  isSuperReady: boolean;
}

export const MobileVirtualControls: React.FC<MobileVirtualControlsProps> = ({
  onAction,
  isSuperReady
}) => {
  return (
    <div className="absolute inset-x-0 bottom-3 z-30 pointer-events-none flex items-end justify-between px-4 sm:px-8 select-none touch-none">
      {/* Left: Directional Cross Pad (D-Pad) */}
      <div className="pointer-events-auto bg-black/40 backdrop-blur-md p-2 rounded-3xl border border-white/10 shadow-2xl">
        <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
          {/* Top: Jump */}
          <div />
          <button
            onTouchStart={() => onAction('up', true)}
            onTouchEnd={() => onAction('up', false)}
            onMouseDown={() => onAction('up', true)}
            onMouseUp={() => onAction('up', false)}
            className="bg-white/15 active:bg-[#FFD700] active:text-black text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div />

          {/* Left: Move Left / Block */}
          <button
            onTouchStart={() => onAction('left', true)}
            onTouchEnd={() => onAction('left', false)}
            onMouseDown={() => onAction('left', true)}
            onMouseUp={() => onAction('left', false)}
            className="bg-white/15 active:bg-[#FFD700] active:text-black text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Center: Neutral */}
          <div className="bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 text-xs font-mono">
            MOVE
          </div>

          {/* Right: Move Right */}
          <button
            onTouchStart={() => onAction('right', true)}
            onTouchEnd={() => onAction('right', false)}
            onMouseDown={() => onAction('right', true)}
            onMouseUp={() => onAction('right', false)}
            className="bg-white/15 active:bg-[#FFD700] active:text-black text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* Bottom: Crouch */}
          <div />
          <button
            onTouchStart={() => onAction('down', true)}
            onTouchEnd={() => onAction('down', false)}
            onMouseDown={() => onAction('down', true)}
            onMouseUp={() => onAction('down', false)}
            className="bg-white/15 active:bg-[#FFD700] active:text-black text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow border border-white/20 active:scale-95 transition-transform"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <div />
        </div>
      </div>

      {/* Right: Action Buttons (Punch, Kick, Grab, Super) */}
      <div className="pointer-events-auto flex items-end gap-2.5">
        {/* Grab & Super Column */}
        <div className="flex flex-col gap-2.5">
          <button
            onTouchStart={() => onAction('grab', true)}
            onTouchEnd={() => onAction('grab', false)}
            onMouseDown={() => onAction('grab', true)}
            onMouseUp={() => onAction('grab', false)}
            className="w-14 h-14 rounded-2xl bg-[#1E293B]/80 border border-white/20 text-white font-black text-xs shadow-lg active:scale-95 flex flex-col items-center justify-center"
          >
            <Shield className="w-4 h-4 text-emerald-400 mb-0.5" />
            GRAB
          </button>

          <button
            onTouchStart={() => onAction('super', true)}
            onTouchEnd={() => onAction('super', false)}
            onMouseDown={() => onAction('super', true)}
            onMouseUp={() => onAction('super', false)}
            disabled={!isSuperReady}
            className={`w-14 h-14 rounded-2xl border font-black text-xs shadow-lg active:scale-95 flex flex-col items-center justify-center transition-all ${
              isSuperReady
                ? 'bg-gradient-to-r from-[#FFD700] to-[#FF9933] border-amber-300 text-black animate-pulse shadow-[0_0_15px_#FFD700]'
                : 'bg-black/40 border-white/10 text-gray-500 opacity-60'
            }`}
          >
            <Flame className="w-4 h-4 text-red-500 mb-0.5" />
            SUPER
          </button>
        </div>

        {/* Primary Combat Column (Punch, Kick) */}
        <div className="flex gap-2.5">
          <button
            onTouchStart={() => onAction('punch', true)}
            onTouchEnd={() => onAction('punch', false)}
            onMouseDown={() => onAction('punch', true)}
            onMouseUp={() => onAction('punch', false)}
            className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#FF9933] to-[#F97316] text-black font-black text-sm shadow-xl active:scale-90 border-2 border-amber-300 flex items-center justify-center transition-transform"
          >
            PUNCH
          </button>

          <button
            onTouchStart={() => onAction('kick', true)}
            onTouchEnd={() => onAction('kick', false)}
            onMouseDown={() => onAction('kick', true)}
            onMouseUp={() => onAction('kick', false)}
            className="w-16 h-16 rounded-2xl bg-gradient-to-b from-[#00D2FF] to-[#2563EB] text-white font-black text-sm shadow-xl active:scale-90 border-2 border-cyan-300 flex items-center justify-center transition-transform"
          >
            KICK
          </button>
        </div>
      </div>
    </div>
  );
};

