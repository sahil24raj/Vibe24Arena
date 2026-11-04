'use client';

import React from 'react';
import { ArrowLeft, ArrowRight, Flame, Volume2, Shield } from 'lucide-react';
import { PlayerControlsInput } from '../engine/types';

interface AutoRushMobileControlsProps {
  onControlChange: (patch: Partial<PlayerControlsInput>) => void;
  isNitroAvailable: boolean;
}

export const AutoRushMobileControls: React.FC<AutoRushMobileControlsProps> = ({
  onControlChange,
  isNitroAvailable
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-40 flex items-end justify-between p-3 sm:p-6 select-none md:hidden">
      {/* Left Steering Pad: Steer Left & Right */}
      <div className="pointer-events-auto flex gap-3 items-center">
        <button
          onTouchStart={() => onControlChange({ steer: -1 })}
          onTouchEnd={() => onControlChange({ steer: 0 })}
          onMouseDown={() => onControlChange({ steer: -1 })}
          onMouseUp={() => onControlChange({ steer: 0 })}
          className="w-16 h-16 rounded-2xl bg-[#0B1536]/85 border-2 border-white/30 text-white flex items-center justify-center text-xl shadow-2xl active:bg-[#FF9933] active:text-black active:scale-95 transition-all"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        <button
          onTouchStart={() => onControlChange({ steer: 1 })}
          onTouchEnd={() => onControlChange({ steer: 0 })}
          onMouseDown={() => onControlChange({ steer: 1 })}
          onMouseUp={() => onControlChange({ steer: 0 })}
          className="w-16 h-16 rounded-2xl bg-[#0B1536]/85 border-2 border-white/30 text-white flex items-center justify-center text-xl shadow-2xl active:bg-[#FF9933] active:text-black active:scale-95 transition-all"
        >
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>

      {/* Right Pedal Cluster: Gas, Brake, Nitro, Drift */}
      <div className="pointer-events-auto flex items-end gap-3">
        {/* Drift & Nitro Column */}
        <div className="flex flex-col gap-2">
          {/* Drift Button */}
          <button
            onTouchStart={() => onControlChange({ drift: true })}
            onTouchEnd={() => onControlChange({ drift: false })}
            onMouseDown={() => onControlChange({ drift: true })}
            onMouseUp={() => onControlChange({ drift: false })}
            className="w-12 h-12 rounded-xl bg-purple-900/80 border border-purple-400 text-purple-200 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all font-black text-[9px]"
          >
            DRIFT
          </button>

          {/* Nitro Button */}
          <button
            onTouchStart={() => onControlChange({ nitro: true })}
            onTouchEnd={() => onControlChange({ nitro: false })}
            onMouseDown={() => onControlChange({ nitro: true })}
            onMouseUp={() => onControlChange({ nitro: false })}
            disabled={!isNitroAvailable}
            className={`w-12 h-14 rounded-xl border flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all ${
              isNitroAvailable
                ? 'bg-gradient-to-t from-cyan-600 to-blue-500 border-cyan-300 text-white animate-pulse'
                : 'bg-gray-800/60 border-gray-600 text-gray-500 opacity-50'
            }`}
          >
            <Flame className="w-5 h-5 text-amber-300" />
            <span className="text-[8px] font-black uppercase">NITRO</span>
          </button>
        </div>

        {/* Brake / Reverse Pedal */}
        <button
          onTouchStart={() => onControlChange({ brake: 1 })}
          onTouchEnd={() => onControlChange({ brake: 0 })}
          onMouseDown={() => onControlChange({ brake: 1 })}
          onMouseUp={() => onControlChange({ brake: 0 })}
          className="w-16 h-20 rounded-2xl bg-red-900/80 border-2 border-red-500 text-white flex flex-col items-center justify-center shadow-xl active:bg-red-700 active:scale-95 transition-all font-black"
        >
          <span className="text-sm">BRAKE</span>
          <span className="text-[9px] text-red-200">REV</span>
        </button>

        {/* Gas Accelerator Pedal */}
        <button
          onTouchStart={() => onControlChange({ throttle: 1 })}
          onTouchEnd={() => onControlChange({ throttle: 0 })}
          onMouseDown={() => onControlChange({ throttle: 1 })}
          onMouseUp={() => onControlChange({ throttle: 0 })}
          className="w-18 h-28 rounded-2xl bg-gradient-to-t from-[#10B981] to-[#059669] border-2 border-emerald-300 text-white flex flex-col items-center justify-center shadow-2xl active:from-emerald-400 active:to-emerald-600 active:scale-95 transition-all font-black"
        >
          <span className="text-xl">GAS</span>
          <span className="text-[10px] text-emerald-100 uppercase tracking-widest">रेस</span>
        </button>
      </div>
    </div>
  );
};

