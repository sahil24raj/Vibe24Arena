'use client';

import { authenticatedFetch } from '@/lib/apiClient';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MultiplayerRoomState,
  RoomPlayer,
  PlayerActionPayload,
  MultiplayerApiResponse
} from '@/types/multiplayer';
import { useAppStore } from '@/store/useAppStore';
import {
  getRoomByCode,
  joinRoomOnServer,
  startMatchOnServer,
  submitPlayerActionOnServer,
  leaveRoomOnServer,
  subscribeToRoomUpdates,
  sendPlayerHeartbeat,
  addBotToRoomOnServer,
  removePlayerOrBotFromServer
} from './realtimeService';
import { normalizeRoomCode } from './roomCodeGenerator';
import { soundFx } from '@/lib/audio';
import { AIDifficulty } from '@/types/gameMode';

export interface UseMultiplayerRoomOptions {
  roomCode: string;
  autoJoin?: boolean;
  onGameStart?: (room: MultiplayerRoomState) => void;
  onGameFinish?: (winnerId: string | null, room: MultiplayerRoomState) => void;
}

export function useMultiplayerRoom({
  roomCode,
  autoJoin = true,
  onGameStart,
  onGameFinish
}: UseMultiplayerRoomOptions) {
  const { user } = useAppStore();
  const normalizedCode = normalizeRoomCode(roomCode);

  const [room, setRoom] = useState<MultiplayerRoomState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED'>('CONNECTED');
  const [isSubmittingAction, setIsSubmittingAction] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const prevStatusRef = useRef<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentPlayer: RoomPlayer | undefined = room?.players.find(
    (p) => p.id === user.id || p.userId === (user.uid || user.id)
  );

  const isHost = Boolean(currentPlayer?.isHost || (room && room.hostId === user.id));
  const isMyTurn = Boolean(room && room.currentTurnPlayerId === (currentPlayer?.id || user.id));

  // Initial Fetch & Auto-Join
  useEffect(() => {
    if (!normalizedCode) {
      setLoading(false);
      setError('No room code provided.');
      return;
    }

    let isMounted = true;

    const initRoom = async () => {
      setLoading(true);
      setError(null);

      try {
        if (autoJoin) {
          let joinRes = await joinRoomOnServer(normalizedCode, user);
          if (!joinRes.success) {
            // REST API fallback
            try {
              const res = await authenticatedFetch(`/api/rooms/${normalizedCode}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user })
              });
              if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                  joinRes = json;
                }
              }
            } catch {}
          }

          if (isMounted) {
            if (joinRes.success && joinRes.data) {
              setRoom(joinRes.data);
              setConnectionStatus('CONNECTED');
            } else {
              setError(joinRes.error || 'Failed to join room.');
            }
          }
        } else {
          let getRes = await getRoomByCode(normalizedCode);
          if (!getRes.success) {
            try {
              const res = await authenticatedFetch(`/api/rooms/${normalizedCode}`);
              if (res.ok) {
                const json = await res.json();
                if (json.success && json.data) {
                  getRes = json;
                }
              }
            } catch {}
          }

          if (isMounted) {
            if (getRes.success && getRes.data) {
              setRoom(getRes.data);
              setConnectionStatus('CONNECTED');
            } else {
              setError(getRes.error || 'Failed to load room.');
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error connecting to room.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initRoom();

    // Subscribe to realtime push updates
    const unsubscribe = subscribeToRoomUpdates(
      normalizedCode,
      (updatedRoom) => {
        if (!isMounted) return;
        setRoom((prev) => {
          // Reject stale state version
          if (prev && updatedRoom.stateVersion < prev.stateVersion) {
            return prev;
          }
          return updatedRoom;
        });
        setConnectionStatus('CONNECTED');

        // Status change audio / callbacks
        if (prevStatusRef.current !== updatedRoom.status) {
          if (updatedRoom.status === 'PLAYING') {
            soundFx.playLevelUp();
            if (onGameStart) onGameStart(updatedRoom);
          } else if (updatedRoom.status === 'FINISHED') {
            soundFx.playVictory();
            if (onGameFinish) onGameFinish(updatedRoom.winnerPlayerId, updatedRoom);
          } else if (updatedRoom.status === 'READY') {
            soundFx.playCoin();
          }
          prevStatusRef.current = updatedRoom.status;
        }
      },
      (subErr) => {
        console.warn('Realtime subscription issue:', subErr);
        setConnectionStatus('RECONNECTING');
      }
    );

    // Heartbeat presence interval (every 10s)
    heartbeatIntervalRef.current = setInterval(() => {
      const pid = user.id;
      if (pid && normalizedCode) {
        sendPlayerHeartbeat(normalizedCode, pid);
      }
    }, 10000);

    return () => {
      isMounted = false;
      unsubscribe();
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, [normalizedCode, autoJoin, user]);

  // Actions
  const startGame = useCallback(async () => {
    if (!room || !isHost) return { success: false, error: 'Only the host can start match' };
    soundFx.playClick();
    const res = await startMatchOnServer(normalizedCode, currentPlayer?.id || user.id);
    if (res.success && res.data) {
      setRoom(res.data);
    }
    return res;
  }, [room, isHost, normalizedCode, currentPlayer, user.id]);

  const submitAction = useCallback(
    async (actionType: string, actionData: Record<string, any> = {}) => {
      if (!room) return { success: false, error: 'No active room' };
      setIsSubmittingAction(true);

      const payload: PlayerActionPayload = {
        playerId: currentPlayer?.id || user.id,
        actionType,
        actionData,
        clientTimestamp: Date.now(),
        expectedVersion: room.stateVersion
      };

      const res = await submitPlayerActionOnServer(normalizedCode, payload);
      setIsSubmittingAction(false);

      if (res.success && res.data) {
        setRoom(res.data);
      }
      return res;
    },
    [room, currentPlayer, user.id, normalizedCode]
  );

  const leaveRoom = useCallback(async () => {
    soundFx.playClick();
    const pid = currentPlayer?.id || user.id;
    await leaveRoomOnServer(normalizedCode, pid);
  }, [normalizedCode, currentPlayer, user.id]);

  const copyRoomCode = useCallback(() => {
    soundFx.playCoin();
    if (navigator.clipboard && normalizedCode) {
      navigator.clipboard.writeText(normalizedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  }, [normalizedCode]);

  const copyInviteLink = useCallback(() => {
    soundFx.playCoin();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chill-arena24.vercel.app';
    const link = `${origin}/play/room/${normalizedCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }, [normalizedCode]);

  const shareNative = useCallback(() => {
    soundFx.playClick();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chill-arena24.vercel.app';
    const link = `${origin}/play/room/${normalizedCode}`;
    if (navigator.share) {
      navigator
        .share({
          title: `Play ${room?.gameTitle || 'Multiplayer Game'} on Chill Arena`,
          text: `Join my 1v1 battle room (#${normalizedCode}) on Chill Arena!`,
          url: link
        })
        .catch(() => {});
    } else {
      copyInviteLink();
    }
  }, [normalizedCode, room?.gameTitle, copyInviteLink]);

  const shareWhatsApp = useCallback(() => {
    soundFx.playClick();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chill-arena24.vercel.app';
    const link = `${origin}/play/room/${normalizedCode}`;
    const text = encodeURIComponent(
      `🔥 Challenge me in ${room?.gameTitle || 'Chill Arena'}!\n🔑 Room Code: ${normalizedCode}\n👉 Join here: ${link}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }, [normalizedCode, room?.gameTitle]);

  const addBot = useCallback(
    async (difficulty: AIDifficulty = 'medium') => {
      if (!room || !isHost) return { success: false, error: 'Only the host can add bots.' };
      soundFx.playClick();
      const res = await addBotToRoomOnServer(normalizedCode, currentPlayer?.id || user.id, difficulty);
      if (res.success && res.data) {
        setRoom(res.data);
      }
      return res;
    },
    [room, isHost, normalizedCode, currentPlayer, user.id]
  );

  const removePlayerOrBot = useCallback(
    async (targetPlayerId: string) => {
      if (!room || !isHost) return { success: false, error: 'Only the host can manage players.' };
      soundFx.playClick();
      const res = await removePlayerOrBotFromServer(normalizedCode, currentPlayer?.id || user.id, targetPlayerId);
      if (res.success && res.data) {
        setRoom(res.data);
      }
      return res;
    },
    [room, isHost, normalizedCode, currentPlayer, user.id]
  );

  return {
    room,
    loading,
    error,
    connectionStatus,
    currentPlayer,
    isHost,
    isMyTurn,
    isSubmittingAction,
    copiedCode,
    copiedLink,
    startGame,
    addBot,
    removePlayerOrBot,
    submitAction,
    leaveRoom,
    copyRoomCode,
    copyInviteLink,
    shareNative,
    shareWhatsApp
  };
}
