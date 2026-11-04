'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GAMES_CATALOG, useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { MultiplayerLobbyModal } from '@/components/MultiplayerLobbyModal';
import { useRouter } from 'next/navigation';
import { createRoomOnServer } from '@/lib/multiplayer/realtimeService';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';

export default function MultiplayerPage() {
  const router = useRouter();
  const { user, openMultiplayerModal } = useAppStore();
  const [selectedGame, setSelectedGame] = useState<string>('chor-sipahi');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = normalizeRoomCode(roomCodeInput);
    if (!clean) return;
    soundFx.playClick();
    router.push(`/play/room/${clean}`);
  };

  const handleQuickCreateOnline = async () => {
    soundFx.playClick();
    setIsCreating(true);
    try {
      const res = await createRoomOnServer(selectedGame, user);
      if (res.success && res.data) {
        soundFx.playLevelUp();
        router.push(`/play/room/${res.data.roomCode}`);
      } else {
        alert(res.error || 'Failed to create room.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating room.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-12 pb-16 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto pt-6">
      <MultiplayerLobbyModal />

      {/* Header Banner */}
      <div className="p-8 sm:p-12 rounded-3xl border border-purple-500/20 bg-surface-purple/80 backdrop-blur-xl relative overflow-hidden shadow-2xl space-y-5">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-primary-container/20 via-secondary/10 to-transparent pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high border border-purple-500/20 font-label-sm text-neon-green font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-ping" />
          <span>CALL YOUR SQUAD • REAL-TIME MULTIPLAYER</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-headline-xl font-bold text-on-surface uppercase tracking-tight">
          CREATE YOUR VIBE. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
            JOIN THE SQUAD.
          </span>
        </h1>

        <p className="font-body-md text-soft-lavender max-w-2xl leading-relaxed">
          Generate an instant 6-character room code or shareable invite URL. Play real-time party matches and 1v1 duels synchronized across devices with zero lag.
        </p>

        {/* Quick Join Bar */}
        <form onSubmit={handleJoinSubmit} className="pt-2 flex flex-col sm:flex-row items-center gap-3 max-w-lg">
          <div className="relative w-full">
            <span className="material-symbols-outlined text-soft-lavender text-base absolute left-3.5 top-3.5 pointer-events-none">
              key
            </span>
            <input
              type="text"
              placeholder="ENTER 6-DIGIT ROOM CODE (e.g. X7K92P)"
              value={roomCodeInput}
              onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
              className="w-full bg-surface-container-low border border-purple-500/20 rounded-xl pl-10 pr-4 py-3 font-mono font-bold text-neon-green placeholder:text-soft-lavender/50 focus:outline-none focus:border-neon-green uppercase tracking-wider text-xs"
            />
          </div>
          <button
            type="submit"
            disabled={!roomCodeInput.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(139,44,255,0.4)]"
          >
            <span>JOIN ROOM</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </form>
      </div>

      {/* Main 3 Action Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Online Multiplayer Room */}
        <div className="p-6 rounded-3xl bg-surface-container border border-purple-500/20 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-2xl">
              🌐
            </div>
            <div>
              <div className="font-label-sm text-primary uppercase font-bold">ONLINE SQUAD</div>
              <h3 className="font-headline-sm text-on-surface font-bold">Host Online Room</h3>
            </div>
            <p className="font-body-sm text-soft-lavender leading-relaxed">
              Generate a unique room code or share an invite URL to challenge friends across different devices with real-time state synchronization.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="font-label-sm text-soft-lavender block font-bold">SELECT GAME FOR LOBBY:</label>
              <select
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                className="w-full bg-surface-container-low border border-purple-500/20 rounded-xl p-2.5 font-body-sm text-on-surface font-semibold focus:outline-none focus:border-primary-container"
              >
                {GAMES_CATALOG.filter((g) => g.multiplayer).map((g) => (
                  <option key={g.id} value={g.id} className="bg-surface-purple text-on-surface">
                    {g.thumbnail} {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleQuickCreateOnline}
            disabled={isCreating}
            className="w-full py-3.5 rounded-xl bg-tertiary text-on-tertiary-fixed font-headline-sm text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(235,195,21,0.5)] cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>{isCreating ? 'CREATING ROOM...' : 'LAUNCH ONLINE ROOM 🚀'}</span>
          </button>
        </div>

        {/* Card 2: Local Pass & Play */}
        <div className="p-6 rounded-3xl bg-surface-container border border-purple-500/20 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center text-2xl">
              📱
            </div>
            <div>
              <div className="font-label-sm text-neon-cyan uppercase font-bold">SAME DEVICE</div>
              <h3 className="font-headline-sm text-on-surface font-bold">Local Pass &amp; Play</h3>
            </div>
            <p className="font-body-sm text-soft-lavender leading-relaxed">
              Sitting together at the canteen table or in a hostel room? Hand the phone back-and-forth for instant turn-based battles.
            </p>

            <div className="p-3 rounded-xl bg-surface-container-low border border-purple-500/10 font-body-sm text-soft-lavender">
              <div className="font-bold text-on-surface mb-1">Recommended Local Games:</div>
              <div className="text-xs">Chor Sipahi (4-Player Chits), Pen Flip, Tic-Tac-Toe, Spin Cricket.</div>
            </div>
          </div>

          <Link
            href={`/game/${selectedGame}?mode=local`}
            onClick={() => soundFx.playClick()}
            className="w-full py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline-sm text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 border border-purple-500/20"
          >
            <span className="material-symbols-outlined text-base text-neon-cyan">group</span>
            <span>START PASS &amp; PLAY DUEL</span>
          </Link>
        </div>

        {/* Card 3: AI Bot Duel Arena */}
        <div className="p-6 rounded-3xl bg-surface-container border border-purple-500/20 flex flex-col justify-between space-y-6 shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-container/20 border border-primary/30 flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <div className="font-label-sm text-primary uppercase font-bold">SOLO PRACTICE</div>
              <h3 className="font-headline-sm text-on-surface font-bold">Challenge Smart AI</h3>
            </div>
            <p className="font-body-sm text-soft-lavender leading-relaxed">
              Squad offline? Warm up against calibrated AI bots across Easy, Medium, and Unbeatable levels with simulated human delays.
            </p>

            <div className="p-3 rounded-xl bg-surface-container-low border border-purple-500/10 font-body-sm text-soft-lavender">
              <div className="font-bold text-on-surface mb-1">Instant Practice:</div>
              <div className="text-xs">Zero wait time. Sharpen your word-building reflexes &amp; spin strategies.</div>
            </div>
          </div>

          <Link
            href={`/game/${selectedGame}?mode=ai`}
            onClick={() => soundFx.playClick()}
            className="w-full py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-headline-sm text-sm uppercase tracking-wider font-bold flex items-center justify-center gap-2 border border-purple-500/20"
          >
            <span className="material-symbols-outlined text-base text-primary">smart_toy</span>
            <span>DUEL AGAINST AI BOT</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
