'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { soundFx } from '@/lib/audio';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import {
  Users,
  KeyRound,
  Share2,
  Hourglass,
  Flame,
  Crown,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

const SOCIAL_STEPS = [
  {
    step: '01',
    action: 'CREATE ROOM',
    headline: 'Create Your Vibe',
    description: 'Pick any game in 1 click. Get an instant, private 6-character room code with zero sign-up friction.',
    badge: 'INSTANT LOBBY',
    icon: Sparkles,
    highlightColor: 'border-primary/50 text-primary',
    quote: 'Dost bulao. Game lagao.'
  },
  {
    step: '02',
    action: 'INVITE FRIENDS',
    headline: 'Call Your Squad',
    description: 'Share your 1-tap invite link directly to WhatsApp, Discord or copy the room code to your group chat.',
    badge: '1-TAP INVITE',
    icon: Share2,
    highlightColor: 'border-neon-cyan/50 text-neon-cyan',
    quote: 'Who in your squad always says "last game"?'
  },
  {
    step: '03',
    action: 'WAITING ROOM',
    headline: 'Squad Loading... 👀',
    description: 'Watch friends drop in live with real-time avatars, ready badges, and live room matchmaking.',
    badge: 'LIVE SYNC',
    icon: Hourglass,
    highlightColor: 'border-neon-green/50 text-neon-green',
    quote: 'Bas ek aur game.'
  },
  {
    step: '04',
    action: 'GAME START',
    headline: 'LET THE CHAOS BEGIN',
    description: 'Simultaneous action, synchronized turns, high-energy rounds, and instant voice/text banter.',
    badge: 'CHAOS MODE',
    icon: Flame,
    highlightColor: 'border-solar-yellow/50 text-solar-yellow',
    quote: 'No downloads. No boring setup. Just play.'
  },
  {
    step: '05',
    action: 'THE RESULT',
    headline: 'VIBE KING 👑 or Bro... Skill Issue 💀',
    description: 'Winner gets crowned Vibe King with confetti fireworks. Losers get roasted on the squad leaderboard.',
    badge: 'BRAGGING RIGHTS',
    icon: Crown,
    highlightColor: 'border-primary/50 text-primary',
    quote: 'Your squad is waiting.'
  }
];

export const SquadSocialExperienceSection: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const { openMultiplayerModal } = useAppStore();

  const currentStep = SOCIAL_STEPS[activeStepIndex];

  return (
    <section className="w-full space-y-10 py-6 max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B1730] border border-purple-500/20 text-xs font-mono text-neon-cyan">
          <Users className="w-3.5 h-3.5" />
          <span>BUILT FOR SQUAD MOMENTS</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white font-headline-lg uppercase tracking-tight">
          WHERE FRIENDS <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] via-[#A855F7] to-[#06B6D4]">
            COME TO PLAY.
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-soft-lavender font-body leading-relaxed">
          Not another solitary single-player arcade. Vibe Arena is designed around friendship, hilarious competition, and unhinged squad banter.
        </p>
      </div>

      {/* Step Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {SOCIAL_STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = idx === activeStepIndex;

          return (
            <button
              key={s.step}
              onClick={() => {
                soundFx.playClick();
                setActiveStepIndex(idx);
              }}
              className={`p-4 rounded-2xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 border ${
                isActive
                  ? 'bg-[#1B1730] border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                  : 'bg-[#141122] border-purple-500/20 hover:border-purple-500/40 hover:bg-[#1B1730]/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono font-bold ${isActive ? 'text-primary' : 'text-soft-lavender/60'}`}>
                  {s.step}
                </span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-neon-cyan' : 'text-soft-lavender/60'}`} />
              </div>

              <div>
                <div className="text-[10px] font-mono text-soft-lavender uppercase tracking-wider">{s.action}</div>
                <div className={`text-xs font-bold font-headline mt-0.5 truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {s.headline}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Step Spotlight Showcase Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#1B1730]/90 backdrop-blur-xl border border-purple-500/30 relative overflow-hidden shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/20 via-transparent to-transparent pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Step Breakdown */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-purple-500/20 text-xs font-mono text-slate-300">
              <span className="font-bold text-primary">STEP {currentStep.step}</span>
              <span>•</span>
              <span className="text-neon-green">{currentStep.badge}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-black text-white font-headline">
              {currentStep.headline}
            </h3>

            <p className="text-sm text-soft-lavender font-body leading-relaxed max-w-lg">
              {currentStep.description}
            </p>

            {/* Conversational Quote */}
            <div className="p-3.5 rounded-xl bg-[#141122] border border-purple-500/25 inline-flex items-center gap-2.5 text-xs font-mono text-neon-cyan">
              <span>💬</span>
              <span>"{currentStep.quote}"</span>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  soundFx.playClick();
                  openMultiplayerModal(GAMES_CATALOG[0]);
                }}
                className="px-6 py-3 rounded-xl bg-primary-container hover:bg-secondary-container text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_16px_rgba(139,44,255,0.4)] cursor-pointer transition-all"
              >
                <Users className="w-3.5 h-3.5 text-neon-green" />
                <span>Create Your Vibe Room</span>
              </button>

              <Link
                href="/multiplayer"
                onClick={() => soundFx.playClick()}
                className="px-6 py-3 rounded-xl bg-[#141122] hover:bg-white/[0.06] border border-purple-500/30 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <span>Learn How It Works</span>
                <ArrowRight className="w-3.5 h-3.5 text-neon-cyan" />
              </Link>
            </div>
          </div>

          {/* Right: Live Experience Simulation Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-[#141122] border border-purple-500/30 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono border-b border-purple-500/20 pb-3">
                <span className="text-soft-lavender">ROOM #X7K92P</span>
                <span className="text-neon-green font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                  ONLINE
                </span>
              </div>

              {/* Simulation State Visual */}
              <div className="space-y-2.5 py-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1B1730] border border-primary/30">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">👑</span>
                    <div>
                      <div className="text-xs font-bold text-white font-headline">Aarav (Host)</div>
                      <div className="text-[10px] font-mono text-neon-green font-bold">VIBE KING 👑</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-solar-yellow">1,450 pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1B1730] border border-purple-500/20">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">🎯</span>
                    <div>
                      <div className="text-xs font-bold text-white font-headline">Priya</div>
                      <div className="text-[10px] font-mono text-neon-cyan">Runner Up</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300">1,200 pts</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1B1730] border border-purple-500/20">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">💀</span>
                    <div>
                      <div className="text-xs font-bold text-white font-headline">Kabir</div>
                      <div className="text-[10px] font-mono text-red-400">Bro... Skill Issue 💀</div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-red-400">450 pts</span>
                </div>
              </div>

              <div className="pt-2 text-center text-[11px] font-mono text-soft-lavender/70">
                Synchronized across all browsers in realtime
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default SquadSocialExperienceSection;
