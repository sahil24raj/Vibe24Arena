export type GameCategory =
  | '🔥 Trending Meme Vibes'
  | '🏫 School Vibes'
  | '👥 Squad Vibes'
  | (string & {});

export type CategoryKey =
  | 'meme'
  | 'school'
  | 'squad'
  | 'all';

export interface GameItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  category: GameCategory;
  categoryKey: CategoryKey;
  thumbnail: string;
  bannerImage: string;
  playCount: number;
  rating: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  duration: string;
  multiplayer: boolean;
  multiplayerModes?: ('local' | 'online' | 'ai')[];
  isTrending?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  controls: string[];
  tags: string[];
  rules?: string[];
}

export interface UserProfile {
  id: string;
  uid?: string;
  email?: string;
  photoURL?: string;
  isCloudSynced?: boolean;
  username: string;
  avatar: string;
  displayName?: string;
  bio?: string;
  createdAt?: string;
  authType: 'guest' | 'google' | 'email' | 'discord';
  xp: number;
  level: number;
  coins: number;
  streak: number;
  lastLoginDate: string;
  rank?: string | number;
  badges: Badge[];
  unlockedSkins: string[];
  equippedSkin: string;
  avatarType?: 'google' | 'upload' | 'preset';
  customAvatar?: string;
  privacySettings?: {
    isPublic: boolean;
    showStats: boolean;
    showGameHistory: boolean;
    showAchievements: boolean;
  };
  stats: {
    gamesPlayed: number;
    totalWins: number;
    totalLosses?: number;
    winRate: number;
    totalScore?: number;
    bestScore?: number;
    highScores: Record<string, number>;
    roastsWon: number;
    sixesHit: number;
    chaiServed: number;
    penFlipsLanded: number;
    eraserHits: number;
    doorsEscaped?: number;
    bestDoorStreak?: number;
    bestDoorLevel?: number;
  };
}


export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'meme' | 'gaming' | 'social' | 'legend' | 'school' | 'mind';
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  gameId?: string;
  gameTitle?: string;
  country: string;
  badge?: string;
  wins?: number;
  xp?: number;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rewardXP: number;
  rewardCoins: number;
  progress: number;
  target: number;
  category: CategoryKey | 'general' | string;
  claimed: boolean;
}

export interface MultiplayerRoom {
  code: string;
  gameId: string;
  gameTitle: string;
  hostName: string;
  hostAvatar: string;
  guestName?: string;
  guestAvatar?: string;
  mode: 'local' | 'online' | 'ai';
  status: 'waiting' | 'ready' | 'playing' | 'finished';
  createdAt: string;
}

export interface RecentMatch {
  id: string;
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  player1: { name: string; avatar: string; score: number };
  player2: { name: string; avatar: string; score: number };
  winner: string;
  roastQuote: string;
  timeAgo: string;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'skin' | 'frame' | 'emote' | 'battlepass' | 'coins';
  price: number;
  currency: 'coins' | 'usd';
  image: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
}
