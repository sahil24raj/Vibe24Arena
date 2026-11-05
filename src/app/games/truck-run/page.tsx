import { Metadata } from 'next';
import { TruckRunGame } from '@/components/games/truck-run/TruckRunGame';
import Link from 'next/link';
import { ArrowLeft, Flame, Sparkles, Trophy, Fuel, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Truck Run 🚛💨 — Desi Truck Highway Racing Game | Vibe Arena',
  description:
    'Drive the iconic Indian Tata 1613 heavy cargo truck (Desi Lorry) down the Grand Trunk Highway in full 3D Unity graphics! Blast musical horns, collect coins, avoid traffic, and conquer the Punjabi Dhaba corridors on Vibe Arena.'
};

export default function TruckRunPage() {
  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-start p-3 sm:p-6 pb-20">
      {/* Game Header Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between py-2 mb-4">
        <Link
          href="/games?cat=meme"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-xs font-mono font-bold transition-all text-gray-300 hover:text-amber-400 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO GAMES</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 px-3 py-1 rounded-full text-amber-300 text-xs font-mono font-bold shadow-md">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>NEW 3D UNITY HIGHWAY RUNNER</span>
          </div>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="w-full max-w-6xl flex-1 flex flex-col items-center justify-center">
        <TruckRunGame />
      </div>

      {/* Highlights Grid */}
      <div className="w-full max-w-6xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-gray-300">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
          <div className="text-amber-400 font-bold text-sm flex items-center gap-2">
            <span>🚛</span>
            <span>Iconic Tata 1613 Lorry</span>
          </div>
          <p className="text-gray-400 font-sans leading-relaxed">
            Authentic Indian truck simulation complete with custom hand-painted psychedelic truck art, floral motifs, and chrome fittings.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
          <div className="text-orange-400 font-bold text-sm flex items-center gap-2">
            <span>🔊</span>
            <span>Multi-Tone Desi Horn</span>
          </div>
          <p className="text-gray-400 font-sans leading-relaxed">
            Blast authentic pressure horn sequences to part heavy traffic, wake up slow lane hogs, and earn style bonuses.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-1.5">
          <div className="text-yellow-400 font-bold text-sm flex items-center gap-2">
            <span>⚡</span>
            <span>10s Nitro Turbo Boost</span>
          </div>
          <p className="text-gray-400 font-sans leading-relaxed">
            Grab highway power-ups outside Sher-e-Punjab Dhaba for high-speed invulnerability speed runs.
          </p>
        </div>
      </div>
    </div>
  );
}
