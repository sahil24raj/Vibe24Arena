'use client';
import { authenticatedFetch } from '@/lib/apiClient';
import type { UserProfile } from '@/types';
import type { MultiplayerApiResponse, MultiplayerRoomState, PlayerActionPayload, RoomSettings } from '@/types/multiplayer';
import type { AIDifficulty } from '@/types/gameMode';
import { normalizeRoomCode } from './roomCodeGenerator';
async function call(path: string, body?: unknown): Promise<MultiplayerApiResponse<MultiplayerRoomState>> {
  try {
    const response = await authenticatedFetch(`/api/rooms${path}`, body === undefined ? {} : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return await response.json();
  } catch { return { success: false, error: 'Unable to connect to the room service.' }; }
}
const path = (code: string, operation = '') => `/${encodeURIComponent(normalizeRoomCode(code))}${operation ? `/${operation}` : ''}`;
export const createRoomOnServer = (gameId: string, _user: Partial<UserProfile>, settings?: Partial<RoomSettings>) => call('', { gameId, settings });
export const getRoomByCode = (code: string) => call(path(code));
export const joinRoomOnServer = (code: string, _user: Partial<UserProfile>) => call(path(code, 'join'), {});
export const startMatchOnServer = (code: string, _hostId: string) => call(path(code, 'start'), {});
export const submitPlayerActionOnServer = (code: string, payload: PlayerActionPayload) => call(path(code, 'action'), { payload });
export const leaveRoomOnServer = (code: string, _playerId: string) => call(path(code, 'leave'), {});
export const sendPlayerHeartbeat = (code: string, _playerId: string) => call(path(code, 'heartbeat'), {});
export const addBotToRoomOnServer = (code: string, _hostId: string, difficulty: AIDifficulty = 'medium') => call(path(code, 'bot'), { difficulty });
export const removePlayerOrBotFromServer = (code: string, _hostId: string, targetPlayerId: string) => call(path(code, 'remove'), { targetPlayerId });
export function subscribeToRoomUpdates(code: string, onUpdate: (room: MultiplayerRoomState) => void, onError?: (error: unknown) => void) {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout>;
  async function poll() {
    const result = await getRoomByCode(code);
    if (cancelled) return;
    if (result.success && result.data) onUpdate(result.data);
    else onError?.(result.error);
    timer = setTimeout(poll, 2500);
  }
  void poll();
  return () => { cancelled = true; clearTimeout(timer); };
}
