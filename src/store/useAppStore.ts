import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, GameItem, DailyChallenge, MultiplayerRoom, RecentMatch, CategoryKey } from '@/types';
import { soundFx } from '@/lib/audio';
import {
  signInWithGoogle,
  signInWithGoogleRedirect,
  checkRedirectResult,
  signInAnonymouslyWithFirebase,
  signUpWithEmail,
  signInWithEmail,
  sendPasswordReset,
  updateUserProfileData,
  submitGameScoreSecure,
  logoutFromFirebase,
  syncUserProfileToCloud,
  saveScoreToCloudLeaderboard,
  subscribeToAuth
} from '@/lib/firebaseService';

export type Game = GameItem;
export type { GameItem };

export const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') return 'usr_guest_srv';
  try {
    let id = localStorage.getItem('chill_arena_device_user_id');
    if (!id || id === 'usr_guest') {
      id = `usr_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36)}`;
      localStorage.setItem('chill_arena_device_user_id', id);
    }
    return id;
  } catch {
    return `usr_${Math.random().toString(36).substring(2, 8)}`;
  }
};

const INITIAL_USER: UserProfile = {
  id: typeof window !== 'undefined' ? getOrCreateDeviceId() : 'usr_guest',
  username: typeof window !== 'undefined' ? `Gamer_${getOrCreateDeviceId().slice(-4).toUpperCase()}` : 'Gamer',
  avatar: '🚀',
  authType: 'guest',
  xp: 0,
  level: 1,
  coins: 0,
  streak: 0,
  lastLoginDate: new Date().toISOString(),
  badges: [],
  unlockedSkins: ['default'],
  equippedSkin: 'default',
  stats: {
    gamesPlayed: 0,
    totalWins: 0,
    totalLosses: 0,
    winRate: 0,
    totalScore: 0,
    bestScore: 0,
    highScores: {},
    roastsWon: 0,
    sixesHit: 0,
    chaiServed: 0,
    penFlipsLanded: 0,
    eraserHits: 0,
    doorsEscaped: 0,
    bestDoorStreak: 0,
    bestDoorLevel: 0
  }
};

export const INITIAL_CHALLENGES: DailyChallenge[] = [
  {
    id: 'ch-1',
    title: 'Win 3 Matches Today',
    description: 'Score victory in any 3 local or online mini-game matches',
    icon: '🎯',
    rewardXP: 300,
    rewardCoins: 250,
    progress: 0,
    target: 3,
    category: 'general',
    claimed: false
  },
  {
    id: 'ch-2',
    title: 'Pen Flip Desk Master',
    description: 'Land 5 successful TIP flips in School Vibes Pen Flip',
    icon: '🏫',
    rewardXP: 250,
    rewardCoins: 200,
    progress: 0,
    target: 5,
    category: 'school',
    claimed: false
  },
  {
    id: 'ch-3',
    title: 'Mind Pot Rapid Fire',
    description: 'Answer 6 consecutive brain challenges correctly in Brain Pot',
    icon: '🧠',
    rewardXP: 350,
    rewardCoins: 300,
    progress: 0,
    target: 6,
    category: 'mind',
    claimed: false
  },
  {
    id: 'ch-4',
    title: 'Play 5 Meme Games',
    description: 'Survive in Caught Modi, CID Escape, or Tapri Tycoon',
    icon: '🔥',
    rewardXP: 200,
    rewardCoins: 150,
    progress: 0,
    target: 5,
    category: 'meme',
    claimed: false
  }
];

export const INITIAL_RECENT_MATCHES: RecentMatch[] = [];

export { GAMES_CATALOG } from '@/lib/gameCatalog';
import { GAMES_CATALOG } from '@/lib/gameCatalog';

interface AppState {
  user: UserProfile;
  isMuted: boolean;
  activeAuthModal: boolean;
  activeSpinModal: boolean;
  activeMultiplayerModal: boolean;
  selectedMultiplayerGame: GameItem | null;
  recentlyPlayedIds: string[];
  challenges: DailyChallenge[];
  activeRoom: MultiplayerRoom | null;
  recentMatches: RecentMatch[];
  
  // Actions
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openSpinModal: () => void;
  closeSpinModal: () => void;
  openMultiplayerModal: (game?: GameItem) => void;
  closeMultiplayerModal: () => void;
  setUser: (user: Partial<UserProfile>) => void;
  loginWithGoogle: (customDetails?: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; code?: string; isFallback?: boolean }>;
  loginWithGoogleRedirect: () => Promise<void>;
  loginWithEmail: (emailOrUsername: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; code?: string }>;
  registerWithEmail: (params: { email: string; password: string; username: string; displayName?: string; avatar?: string }) => Promise<{ success: boolean; error?: string; code?: string }>;
  sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileData: (updates: {
    avatar?: string;
    avatarType?: 'google' | 'upload' | 'preset';
    displayName?: string;
    username?: string;
    bio?: string;
    photoURL?: string;
    customAvatar?: string;
    privacySettings?: {
      isPublic: boolean;
      showStats: boolean;
      showGameHistory: boolean;
      showAchievements: boolean;
    };
  }) => Promise<{ success: boolean; error?: string }>;
  submitGameScore: (gameId: string, score: number, isWin?: boolean) => Promise<{ success: boolean; xpEarned: number; newHighScore: boolean; coinsEarned?: number }>;
  loginAnonymously: (customDetails?: Partial<UserProfile>) => Promise<{ success: boolean; error?: string; code?: string; isFallback?: boolean }>;
  initAuthListener: () => () => void;
  logout: () => Promise<void>;
  syncCloudData: () => Promise<boolean>;
  addCoins: (amount: number) => void;
  addXP: (amount: number) => void;
  updateHighScore: (gameId: string, score: number) => void;
  recordGameWin: (gameId: string) => void;
  addRecentlyPlayed: (gameId: string) => void;
  claimChallenge: (challengeId: string) => void;
  updateChallengeProgress: (category: CategoryKey | 'general' | string, amount: number) => void;
  createRoom: (gameId: string, mode?: 'local' | 'online' | 'ai') => MultiplayerRoom;
  joinRoom: (code: string) => boolean;
  leaveRoom: () => void;
  spinDailyReward: () => { coins: number; xp: number; rewardName: string; alreadyClaimed?: boolean };
  buyShopItem: (item: { id: string; name: string; priceCoins: number; skinKey?: string }) => { success: boolean; error?: string };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      isMuted: false,
      activeAuthModal: false,
      activeSpinModal: false,
      activeMultiplayerModal: false,
      selectedMultiplayerGame: null,
      recentlyPlayedIds: [],
      challenges: INITIAL_CHALLENGES,
      activeRoom: null,
      recentMatches: INITIAL_RECENT_MATCHES,

      setMuted: (muted) => {
        soundFx.isMuted = muted;
        set({ isMuted: muted });
      },
      toggleMute: () => {
        const nextState = !get().isMuted;
        soundFx.isMuted = nextState;
        set({ isMuted: nextState });
      },
      openAuthModal: () => set({ activeAuthModal: true }),
      closeAuthModal: () => set({ activeAuthModal: false }),
      openSpinModal: () => set({ activeSpinModal: true }),
      closeSpinModal: () => set({ activeSpinModal: false }),
      openMultiplayerModal: (game) => set({ activeMultiplayerModal: true, selectedMultiplayerGame: game || GAMES_CATALOG[0] }),
      closeMultiplayerModal: () => set({ activeMultiplayerModal: false, selectedMultiplayerGame: null }),

      setUser: (userUpdate) => {
        const updated = { ...get().user, ...userUpdate };
        set({ user: updated });
        if (updated.isCloudSynced && updated.uid) {
          syncUserProfileToCloud(updated);
        }
      },

      loginWithGoogle: async (customDetails) => {
        const res = await signInWithGoogle({ ...get().user, ...customDetails });
        if (res.success && res.user) {
          set({ user: res.user, activeAuthModal: false });
          soundFx.playLevelUp();
          return { success: true, isFallback: res.isFallback };
        }
        return { success: false, error: res.error || 'Failed to sign in with Google', code: res.code };
      },

      loginWithGoogleRedirect: async () => {
        await signInWithGoogleRedirect();
      },

      loginWithEmail: async (emailOrUsername, password, rememberMe = true) => {
        const res = await signInWithEmail(emailOrUsername, password, rememberMe, get().user);
        if (res.success && res.user) {
          set({ user: res.user, activeAuthModal: false });
          soundFx.playLevelUp();
          return { success: true };
        }
        return { success: false, error: res.error || 'Login failed', code: res.code };
      },

      registerWithEmail: async (params) => {
        const res = await signUpWithEmail(params, get().user);
        if (res.success && res.user) {
          set({ user: res.user, activeAuthModal: false });
          soundFx.playLevelUp();
          return { success: true };
        }
        return { success: false, error: res.error || 'Registration failed', code: res.code };
      },

      sendPasswordResetEmail: async (email) => {
        return await sendPasswordReset(email);
      },

      updateProfileData: async (updates) => {
        const currentUser = get().user;
        const uid = currentUser.uid || currentUser.id;
        
        // Optimistically update local store with safe editable fields
        const localUpdates: Partial<UserProfile> = {};
        if (updates.avatar !== undefined) localUpdates.avatar = updates.avatar;
        if (updates.avatarType !== undefined) localUpdates.avatarType = updates.avatarType;
        if (updates.displayName !== undefined) localUpdates.displayName = updates.displayName;
        if (updates.username !== undefined) localUpdates.username = updates.username;
        if (updates.bio !== undefined) localUpdates.bio = updates.bio;
        if (updates.photoURL !== undefined) localUpdates.photoURL = updates.photoURL;
        if (updates.customAvatar !== undefined) localUpdates.customAvatar = updates.customAvatar;
        if (updates.privacySettings !== undefined) localUpdates.privacySettings = updates.privacySettings;

        set({ user: { ...currentUser, ...localUpdates } });
        soundFx.playClick();

        const res = await updateUserProfileData(uid, updates);
        return res;
      },

      submitGameScore: async (gameId, score, isWin = true) => {
        const currentUser = get().user;
        const game = GAMES_CATALOG.find((g) => g.id === gameId);
        const gameTitle = game?.title || gameId;

        const res = await submitGameScoreSecure(gameId, gameTitle, score, currentUser);
        
        if (res.success) {
          const validatedScore = Math.max(0, Math.floor(score));
          const currentStats = currentUser.stats;
          const gamesPlayed = (currentStats.gamesPlayed || 0) + 1;
          const totalWins = (currentStats.totalWins || 0) + (isWin ? 1 : 0);
          const totalLosses = (currentStats.totalLosses || 0) + (isWin ? 0 : 1);
          const winRate = Math.round((totalWins / gamesPlayed) * 100);
          const totalScore = (currentStats.totalScore || 0) + validatedScore;
          const bestScore = Math.max(currentStats.bestScore || 0, validatedScore);
          const highScores = {
            ...currentStats.highScores,
            [gameId]: Math.max(currentStats.highScores[gameId] || 0, validatedScore)
          };

          const newXp = currentUser.xp + res.xpEarned;
          const newLevel = Math.floor(newXp / 500) + 1;
          const newCoins = currentUser.coins + (res.coinsEarned || 25);

          // Calculate real Rank based on total Score
          let rank: string = 'Bronze II';
          if (gamesPlayed === 0) rank = 'Unranked';
          else if (totalScore >= 10000) rank = 'Grandmaster';
          else if (totalScore >= 5000) rank = 'Diamond I';
          else if (totalScore >= 2500) rank = 'Platinum II';
          else if (totalScore >= 1000) rank = 'Gold III';
          else if (totalScore >= 500) rank = 'Silver I';
          else rank = 'Bronze II';

          // Check dynamic achievements
          const existingBadgeIds = new Set((currentUser.badges || []).map((b) => b.id));
          const newBadges = [...(currentUser.badges || [])];

          if (gamesPlayed >= 1 && !existingBadgeIds.has('b_first_game')) {
            newBadges.push({
              id: 'b_first_game',
              name: 'First Step',
              description: 'Completed your first game in Chill Arena',
              icon: '🎮',
              unlockedAt: new Date().toISOString(),
              category: 'gaming'
            });
          }
          if (totalWins >= 1 && !existingBadgeIds.has('b_first_win')) {
            newBadges.push({
              id: 'b_first_win',
              name: 'First Victory',
              description: 'Won your first match in the Arena',
              icon: '🏆',
              unlockedAt: new Date().toISOString(),
              category: 'gaming'
            });
          }
          if (bestScore >= 500 && !existingBadgeIds.has('b_high_score')) {
            newBadges.push({
              id: 'b_high_score',
              name: 'Score Master',
              description: 'Achieved a single game score of 500+',
              icon: '🔥',
              unlockedAt: new Date().toISOString(),
              category: 'legend'
            });
          }
          if (totalWins >= 10 && !existingBadgeIds.has('b_ten_wins')) {
            newBadges.push({
              id: 'b_ten_wins',
              name: 'Arena Champion',
              description: 'Achieved 10 victories in Chill Arena',
              icon: '👑',
              unlockedAt: new Date().toISOString(),
              category: 'legend'
            });
          }

          // Build Real Match History Record
          const newMatchRecord: RecentMatch = {
            id: `match_${Date.now()}`,
            gameId,
            gameTitle,
            gameIcon: game?.thumbnail || '🎮',
            player1: {
              name: currentUser.displayName || currentUser.username,
              avatar: currentUser.avatar,
              score: validatedScore
            },
            player2: {
              name: 'AI Challenger',
              avatar: '🤖',
              score: Math.max(0, validatedScore - 15)
            },
            winner: isWin ? (currentUser.displayName || currentUser.username) : 'AI Challenger',
            roastQuote: isWin ? 'Victory secured in the Arena!' : 'Hard luck! Keep training!',
            timeAgo: 'Just now'
          };

          const updatedUser: UserProfile = {
            ...currentUser,
            xp: newXp,
            level: newLevel,
            coins: newCoins,
            rank,
            badges: newBadges,
            stats: {
              ...currentStats,
              gamesPlayed,
              totalWins,
              totalLosses,
              winRate,
              totalScore,
              bestScore,
              highScores
            }
          };

          set((state) => ({
            user: updatedUser,
            recentMatches: [newMatchRecord, ...state.recentMatches].slice(0, 10)
          }));

          // Trigger Challenge Progress
          get().updateChallengeProgress('general', 1);
          if (game?.categoryKey) {
            get().updateChallengeProgress(game.categoryKey, 1);
          }

          if (updatedUser.isCloudSynced && updatedUser.uid) {
            syncUserProfileToCloud(updatedUser);
            saveScoreToCloudLeaderboard(gameId, gameTitle, validatedScore, updatedUser);
          }
        }
        return res;
      },

      loginAnonymously: async (customDetails) => {
        const res = await signInAnonymouslyWithFirebase({ ...get().user, ...customDetails });
        if (res.success && res.user) {
          set({ user: res.user, activeAuthModal: false });
          soundFx.playLevelUp();
          return { success: true, isFallback: res.isFallback };
        }
        return { success: false, error: res.error || 'Failed to connect anonymously', code: res.code };
      },

      initAuthListener: () => {
        // Check for redirect login result on mount
        checkRedirectResult().then((redirectUser) => {
          if (redirectUser) {
            set({ user: redirectUser, activeAuthModal: false });
            soundFx.playLevelUp();
          }
        });

        const unsubscribe = subscribeToAuth((fbUser) => {
          if (fbUser) {
            const currentUser = get().user;
            const photo = fbUser.photoURL || currentUser.photoURL;
            const isGoogle = fbUser.providerData.some((p) => p.providerId === 'google.com');
            const shouldAdoptGooglePhoto = (currentUser.avatarType === 'google' || currentUser.avatar === '🚀' || !currentUser.avatar) && photo;

            if (currentUser.uid !== fbUser.uid || (!currentUser.photoURL && photo)) {
              set({
                user: {
                  ...currentUser,
                  id: fbUser.uid,
                  uid: fbUser.uid,
                  email: fbUser.email || currentUser.email,
                  photoURL: photo,
                  avatar: shouldAdoptGooglePhoto ? photo : (currentUser.avatar || '🚀'),
                  avatarType: shouldAdoptGooglePhoto ? 'google' : (currentUser.avatarType || 'preset'),
                  username: currentUser.username.startsWith('Guest_') && fbUser.displayName 
                    ? fbUser.displayName.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 15) 
                    : currentUser.username,
                  displayName: currentUser.displayName || fbUser.displayName || currentUser.username,
                  authType: isGoogle ? 'google' : currentUser.authType,
                  isCloudSynced: true
                }
              });
            }
          }
        });
        return unsubscribe;
      },


      logout: async () => {
        await logoutFromFirebase();
        set({
          user: {
            ...INITIAL_USER,
            id: `guest_${Date.now().toString().slice(-4)}`,
            username: `Guest_${Math.floor(1000 + Math.random() * 9000)}`,
            authType: 'guest',
            isCloudSynced: false,
            uid: undefined,
            email: undefined,
            photoURL: undefined
          }
        });
        soundFx.playClick();
      },

      syncCloudData: async () => {
        const currentUser = get().user;
        if (!currentUser.uid && currentUser.authType !== 'google') {
          return false;
        }
        const synced = await syncUserProfileToCloud(currentUser);
        if (synced) {
          set((state) => ({ user: { ...state.user, isCloudSynced: true } }));
        }
        return synced;
      },

      addCoins: (amount) => {
        soundFx.playCoin();
        const updatedUser = { ...get().user, coins: get().user.coins + amount };
        set({ user: updatedUser });
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }
      },

      addXP: (amount) => {
        const current = get().user;
        const newXp = current.xp + amount;
        const newLevel = Math.floor(newXp / 500) + 1;
        if (newLevel > current.level) {
          soundFx.playLevelUp();
        }
        const updatedUser = { ...current, xp: newXp, level: newLevel };
        set({ user: updatedUser });
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }
      },

      updateHighScore: (gameId, score) => {
        const currentStats = get().user.stats;
        const prevHigh = currentStats.highScores[gameId] || 0;
        if (score > prevHigh) {
          soundFx.playLevelUp();
          const updatedUser: UserProfile = {
            ...get().user,
            stats: {
              ...get().user.stats,
              highScores: {
                ...get().user.stats.highScores,
                [gameId]: score
              }
            }
          };
          set({ user: updatedUser });
          
          const game = GAMES_CATALOG.find((g) => g.id === gameId);
          saveScoreToCloudLeaderboard(gameId, game?.title || gameId, score, updatedUser);
          if (updatedUser.isCloudSynced && updatedUser.uid) {
            syncUserProfileToCloud(updatedUser);
          }
        }
      },

      recordGameWin: (gameId) => {
        const state = get();
        const gamesPlayed = state.user.stats.gamesPlayed + 1;
        const totalWins = state.user.stats.totalWins + 1;
        const winRate = Math.round((totalWins / gamesPlayed) * 100);

        const updatedUser: UserProfile = {
          ...state.user,
          stats: {
            ...state.user.stats,
            gamesPlayed,
            totalWins,
            winRate
          }
        };

        set({ user: updatedUser });
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }

        // Trigger challenge progress
        get().updateChallengeProgress('general', 1);
        const game = GAMES_CATALOG.find((g) => g.id === gameId);
        if (game?.categoryKey) {
          get().updateChallengeProgress(game.categoryKey, 1);
        }
      },

      addRecentlyPlayed: (gameId) => {
        set((state) => ({
          recentlyPlayedIds: [gameId, ...state.recentlyPlayedIds.filter((id) => id !== gameId)].slice(0, 6)
        }));
      },

      claimChallenge: (challengeId) => {
        const target = get().challenges.find((c) => c.id === challengeId);
        if (target && !target.claimed && target.progress >= target.target) {
          get().addCoins(target.rewardCoins);
          get().addXP(target.rewardXP);
          soundFx.playLevelUp();

          set((state) => ({
            challenges: state.challenges.map((c) =>
              c.id === challengeId ? { ...c, claimed: true } : c
            )
          }));
        }
      },

      updateChallengeProgress: (category, amount) => {
        set((state) => ({
          challenges: state.challenges.map((c) => {
            if (c.claimed) return c;
            if (c.category === category || (c.category === 'general' && category === 'general')) {
              const nextProgress = Math.min(c.target, c.progress + amount);
              return { ...c, progress: nextProgress };
            }
            return c;
          })
        }));
      },

      createRoom: (gameId, mode = 'local') => {
        const game = GAMES_CATALOG.find((g) => g.id === gameId) || GAMES_CATALOG[0];
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '#';
        for (let i = 0; i < 5; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        const room: MultiplayerRoom = {
          code,
          gameId: game.id,
          gameTitle: game.title,
          hostName: get().user.username,
          hostAvatar: get().user.avatar,
          guestName: mode === 'ai' ? '🤖 Bot_Chad' : mode === 'local' ? '🎮 Player 2 (Local)' : 'Waiting for Player...',
          guestAvatar: mode === 'ai' ? '🤖' : mode === 'local' ? '🕹️' : '⚪',
          mode,
          status: mode === 'online' ? 'waiting' : 'ready',
          createdAt: new Date().toISOString()
        };

        set({ activeRoom: room });
        return room;
      },

      joinRoom: (code) => {
        const normalized = code.toUpperCase().trim();
        const room: MultiplayerRoom = {
          code: normalized.startsWith('#') ? normalized : `#${normalized}`,
          gameId: 'pen-flip',
          gameTitle: 'Pen Flip Battle 🖊️',
          hostName: 'Room Host',
          hostAvatar: '👑',
          guestName: get().user.username,
          guestAvatar: get().user.avatar,
          mode: 'online',
          status: 'ready',
          createdAt: new Date().toISOString()
        };
        set({ activeRoom: room });
        return true;
      },

      leaveRoom: () => set({ activeRoom: null }),

      spinDailyReward: () => {
        const user = get().user;
        const todayStr = new Date().toISOString().slice(0, 10);
        
        if (user.badges?.some((b) => b.id === `spin_${todayStr}`)) {
          return { coins: 0, xp: 0, rewardName: 'Already claimed today! Next spin at 00:00 UTC.', alreadyClaimed: true };
        }

        const rewards = [
          { coins: 150, xp: 75, rewardName: '150 Coins + 75 XP' },
          { coins: 350, xp: 150, rewardName: '350 Coins + 150 XP' },
          { coins: 750, xp: 300, rewardName: '750 Bonus Coins 🪙' },
          { coins: 100, xp: 250, rewardName: '250 XP Boost 🚀' },
          { coins: 1000, xp: 500, rewardName: '1000 Coins + 500 XP Grand Prize' }
        ];
        const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
        
        const updatedUser: UserProfile = {
          ...user,
          coins: user.coins + randomReward.coins,
          xp: user.xp + randomReward.xp,
          badges: [
            ...user.badges.filter((b) => !b.id.startsWith('spin_')),
            {
              id: `spin_${todayStr}`,
              name: 'Daily Spinner',
              description: `Claimed daily wheel bonus on ${todayStr}`,
              icon: '🎁',
              unlockedAt: new Date().toISOString(),
              category: 'social'
            }
          ]
        };

        set({ user: updatedUser });
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }

        return randomReward;
      },

      buyShopItem: (item: { id: string; name: string; priceCoins: number; skinKey?: string }) => {
        const user = get().user;
        if (user.coins < item.priceCoins) {
          return {
            success: false,
            error: `Need ${item.priceCoins} Meme Coins! You currently have ${user.coins} coins.`
          };
        }

        const newUnlockedSkins = item.skinKey && !user.unlockedSkins.includes(item.skinKey)
          ? [...user.unlockedSkins, item.skinKey]
          : user.unlockedSkins;

        const updatedUser: UserProfile = {
          ...user,
          coins: user.coins - item.priceCoins,
          unlockedSkins: newUnlockedSkins,
          equippedSkin: item.skinKey || user.equippedSkin
        };

        set({ user: updatedUser });
        soundFx.playLevelUp();
        if (updatedUser.isCloudSynced && updatedUser.uid) {
          syncUserProfileToCloud(updatedUser);
        }
        return { success: true };
      }
    }),
    {
      name: 'memeverse-v2-storage',
      onRehydrateStorage: () => (state) => {
        if (state && (!state.user.id || state.user.id === 'usr_guest') && !state.user.uid) {
          const deviceId = getOrCreateDeviceId();
          state.user.id = deviceId;
          if (state.user.username === 'Gamer') {
            state.user.username = `Gamer_${deviceId.slice(-4).toUpperCase()}`;
          }
        }
      }
    }
  )
);

