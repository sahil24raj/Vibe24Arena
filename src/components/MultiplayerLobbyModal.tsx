'use client';

import React, { useState } from 'react';
import { useAppStore, GAMES_CATALOG } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import { useRouter } from 'next/navigation';
import { createRoomOnServer } from '@/lib/multiplayer/realtimeService';
import { normalizeRoomCode } from '@/lib/multiplayer/roomCodeGenerator';

export const MultiplayerLobbyModal: React.FC = () => {
  const router = useRouter();
  const {
    activeMultiplayerModal,
    closeMultiplayerModal,
    selectedMultiplayerGame,
    user
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'quick'>('create');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [createdRoomCode, setCreatedRoomCode] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string>(
    selectedMultiplayerGame?.multiplayer ? selectedMultiplayerGame.id : 'chor-sipahi'
  );
  const [gameMode, setGameMode] = useState<'local' | 'online' | 'ai'>('online');

  React.useEffect(() => {
    if (selectedMultiplayerGame?.id && selectedMultiplayerGame.multiplayer) {
      setSelectedGameId(selectedMultiplayerGame.id);
    } else {
      setSelectedGameId('chor-sipahi');
    }
  }, [selectedMultiplayerGame]);

  if (!activeMultiplayerModal) return null;

  const handleCreateRoom = async () => {
    soundFx.playClick();

    if (gameMode === 'local' || gameMode === 'ai') {
      soundFx.playLevelUp();
      closeMultiplayerModal();
      router.push(`/game/${selectedGameId}?mode=${gameMode}`);
      return;
    }

    setIsCreating(true);
    try {
      const res = await createRoomOnServer(selectedGameId, user);
      if (res.success && res.data) {
        setCreatedRoomCode(res.data.roomCode);
        soundFx.playLevelUp();
        closeMultiplayerModal();
        router.push(`/play/room/${res.data.roomCode}`);
      } else {
        alert(res.error || 'Failed to create room. Please try again.');
      }
    } catch (err: any) {
      alert(err.message || 'Error creating multiplayer room.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = normalizeRoomCode(roomCodeInput);
    if (!cleanCode) return;
    soundFx.playClick();
    closeMultiplayerModal();
    router.push(`/play/room/${cleanCode}`);
  };

  const handleQuickMatch = async () => {
    soundFx.playClick();
    setIsCreating(true);
    try {
      const res = await createRoomOnServer(selectedGameId, user);
      if (res.success && res.data) {
        closeMultiplayerModal();
        router.push(`/play/room/${res.data.roomCode}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const chosenGame = GAMES_CATALOG.find((g) => g.id === selectedGameId) || GAMES_CATALOG[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-container-lowest/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden border border-purple-500/30 bg-surface-purple/95 p-6 lg:p-8 space-y-6 shadow-[0_0_60px_rgba(139,44,255,0.4)]">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary-container font-black text-xl shadow-[0_0_15px_rgba(139,44,255,0.5)]">
              👥
            </div>
            <div>
              <h2 className="font-headline-sm text-on-surface uppercase font-bold">
                MULTIPLAYER ARENA LOBBY
              </h2>
              <p className="font-body-sm text-soft-lavender">
                Challenge friends with 6-Char Code or Shareable Link
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              closeMultiplayerModal();
            }}
            className="p-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-soft-lavender hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 rounded-xl bg-surface-container-low border border-purple-500/20">
          {[
            { id: 'create', label: '⚔️ CREATE ROOM' },
            { id: 'join', label: '🔑 JOIN WITH CODE' },
            { id: 'quick', label: '⚡ QUICK MATCH' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playClick();
                setActiveTab(t.id as any);
              }}
              className={`flex-1 py-2 rounded-lg font-label-md font-bold transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-primary-container text-on-primary-container shadow-md'
                  : 'text-soft-lavender hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* CREATE ROOM CONTENT */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            {/* Game Selector */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-soft-lavender uppercase font-bold">
                SELECT GAME TO DUEL
              </label>
              <select
                value={selectedGameId}
                onChange={(e) => {
                  soundFx.playClick();
                  setSelectedGameId(e.target.value);
                }}
                className="w-full bg-surface-container border border-purple-500/20 rounded-xl p-3 font-body-sm text-on-surface font-bold focus:border-primary-container focus:outline-none cursor-pointer"
              >
                {GAMES_CATALOG.filter((g) => g.multiplayer).map((g) => (
                  <option key={g.id} value={g.id} className="bg-surface-purple text-on-surface">
                    {g.thumbnail} {g.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Toggle */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-soft-lavender uppercase font-bold">
                PLAY MODE
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'online', label: '🌐 Online Room' },
                  { id: 'local', label: '👥 Pass & Play' },
                  { id: 'ai', label: '🤖 vs Smart AI' }
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      soundFx.playClick();
                      setGameMode(m.id as any);
                    }}
                    className={`py-2 rounded-xl font-label-sm font-bold border transition-all cursor-pointer ${
                      gameMode === m.id
                        ? 'bg-primary-container/20 border-primary text-primary shadow-[0_0_12px_rgba(139,44,255,0.3)]'
                        : 'bg-surface-container border-purple-500/10 text-soft-lavender hover:text-on-surface'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full py-4 rounded-xl bg-tertiary text-on-tertiary-fixed font-headline-sm text-base uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(235,195,21,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl font-bold">bolt</span>
              <span>
                {isCreating
                  ? 'GENERATING ROOM...'
                  : gameMode === 'online'
                  ? 'CREATE & LAUNCH ROOM LOBBY 🚀'
                  : `START ${chosenGame.title.split(':')[0]}`}
              </span>
            </button>
          </div>
        )}

        {/* JOIN ROOM CONTENT */}
        {activeTab === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="font-label-sm text-soft-lavender uppercase font-bold">
                ENTER 6-CHARACTER ROOM CODE (e.g. X7K92P)
              </label>
              <input
                type="text"
                placeholder="X7K92P"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-surface-container border border-purple-500/20 rounded-xl p-4 text-center text-2xl font-mono font-black text-neon-green placeholder-purple-400/40 tracking-widest uppercase focus:border-neon-green focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={!roomCodeInput.trim()}
              className="w-full py-4 rounded-xl bg-primary-container text-on-primary-container font-headline-sm text-base uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,44,255,0.4)] hover:bg-secondary-container transition-all cursor-pointer"
            >
              <span>ENTER ROOM &amp; JOIN OPPONENT</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </form>
        )}

        {/* QUICK MATCH CONTENT */}
        {activeTab === 'quick' && (
          <div className="p-6 rounded-2xl bg-surface-container border border-purple-500/20 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 mx-auto flex items-center justify-center text-2xl animate-spin">
              ⚡
            </div>
            <div>
              <h3 className="font-headline-sm text-on-surface font-bold">INSTANT ONLINE MATCHMAKING</h3>
              <p className="font-body-sm text-soft-lavender mt-1">
                Creating room and opening lobby for {chosenGame.title.split(':')[0]}...
              </p>
            </div>
            <button
              onClick={handleQuickMatch}
              disabled={isCreating}
              className="px-8 py-3 rounded-xl bg-tertiary text-on-tertiary-fixed font-headline-sm text-sm uppercase tracking-wider font-bold shadow-[0_0_20px_rgba(235,195,21,0.5)] cursor-pointer"
            >
              {isCreating ? 'CONNECTING...' : 'LAUNCH INSTANT ROOM'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
