import { Metadata } from 'next';
import { AutoRushGame } from '@/components/games/auto-rush/AutoRushGame';
import Link from 'next/link';
import { ArrowLeft, Flame, Share2, ThumbsUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Auto Rush 3D — Indian Auto-Rickshaw Racing Game | Vibe Arena',
  description:
    'Race an Indian auto-rickshaw against 7 rivals through Gurugram and Delhi — Cyber City, NH-48, Kartavya Path and the Red Fort. Real 3-wheel physics, drift, nitro, garage upgrades, and multiplayer.'
};

export default function AutoRushPage() {
  return (
    <div className="min-h-screen bg-[#040817] text-white flex flex-col items-center justify-start p-3 sm:p-6">
      {/* Game Header Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between py-2 mb-3">
        <Link
          href="/games"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" /> All Games
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#FF9933]/20 border border-[#FF9933]/40 px-3 py-1 rounded-full text-[#FFD700] text-xs font-black">
            <Flame className="w-4 h-4 text-[#FF9933] animate-pulse" />
            🔥 Trending 3D Racer
          </div>
        </div>
      </div>

      {/* Main 3D Game Container */}
      <div className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center">
        <AutoRushGame />
      </div>

      {/* Game Details & Controls Overview */}
      <div className="w-full max-w-6xl mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-400">
        <div className="bg-[#0B1536]/60 border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-white font-bold text-sm">🛺 3-Wheel Physics</div>
          <p>
            Authentic vehicle simulation with center-of-mass body lean, front-wheel steering, and drift mechanics.
          </p>
        </div>
        <div className="bg-[#0B1536]/60 border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-white font-bold text-sm">🌆 Gurugram & Delhi Tracks</div>
          <p>
            Cyber City, NH-48 Expressway, Kartavya Path India Gate, and Old Delhi Red Fort circuits.
          </p>
        </div>
        <div className="bg-[#0B1536]/60 border border-white/10 rounded-2xl p-4 space-y-1">
          <div className="text-white font-bold text-sm">🛠️ 3D Garage Upgrades</div>
          <p>
            8 Indian autos, custom body & roof paint colors, Top Speed, Acceleration, Handling, and Nitro upgrades.
          </p>
        </div>
      </div>
    </div>
  );
}
