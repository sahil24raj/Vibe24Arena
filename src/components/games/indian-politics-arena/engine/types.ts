export type MoveId =
  | 'jab'
  | 'cross'
  | 'kick'
  | 'uppercut'
  | 'roundhouse'
  | 'finisher'
  | 'lowJab'
  | 'sweep'
  | 'special1'
  | 'special2'
  | 'airPunch'
  | 'airKick'
  | 'grab'
  | 'landing';

export type AttackHeight = 'high' | 'mid' | 'low';

export interface MoveDefinition {
  id: MoveId;
  name: string;
  startup: number;    // Startup frames (before hit active)
  active: number;     // Active damage frames
  recovery: number;   // Recovery frames after attack
  damage: number;     // Base damage (out of 100 max HP)
  height: AttackHeight;
  reach: number;      // Hitbox distance multiplier
  hitstun: number;    // Frames defender cannot act on hit
  blockstun: number;  // Frames defender cannot act on block
  knockdown: boolean; // Knocks defender onto back
  launch: number;     // Vertical launch velocity
  push: number;       // Pushback distance applied to defender
  lunge: number;      // Forward slide distance applied to attacker
  air?: boolean;
  crouching?: boolean;
  grab?: boolean;
  chains?: {
    punch?: MoveId;
    kick?: MoveId;
  };
}

export type FighterState =
  | 'idle'
  | 'walk_fwd'
  | 'walk_back'
  | 'crouch'
  | 'jump_squat'
  | 'jump'
  | 'fall'
  | 'landing'
  | 'attack'
  | 'hitstun'
  | 'blockstun'
  | 'grabbed'
  | 'knockdown'
  | 'wakeup'
  | 'super'
  | 'victory'
  | 'defeat';

export interface CharacterConfig {
  id: string;
  name: string;
  title: string;
  archetype: string;
  party: string;
  accent: string;
  secondaryColor: string;
  walkFwd: number;
  walkBack: number;
  jumpV: number;
  jumpVx: number;
  damageMul: number;
  defenseMul: number;
  description: string;
  superName: string;
  superDesc: string;
  special1Name: string;
  special2Name: string;
  introLine: string;
  winLine: string;
  defeatExcuse: string;
  avatarIcon: string;
  modelUrl?: string;
  facePhoto?: string;
  voiceUrl?: string;
  superSoundUrl?: string;
  stats: {
    power: number; // 1-5
    speed: number; // 1-5
    defense: number; // 1-5
    range: number; // 1-5
  };
}

export interface ArenaConfig {
  id: string;
  name: string;
  hindiName: string;
  subtitle: string;
  bgGradient: [string, string];
  floorColor: string;
  accentColor: string;
  crowdColor: string;
  decorType: 'parliament' | 'rally' | 'dharna' | 'studio';
}

export type GameMode = 'quick' | 'story' | 'twoplayer' | 'multiplayer';
export type AIDifficulty = 'easy' | 'normal' | 'hard';

export interface CombatHitEvent {
  attackerId: number;
  targetId: number;
  damage: number;
  blocked: boolean;
  hitX: number;
  hitY: number;
  moveName: string;
  knockdown: boolean;
  isSuper?: boolean;
}

export interface PlayerInput {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  punch: boolean;
  kick: boolean;
  grab: boolean;
  super: boolean;
  block: boolean;
}

export interface MatchStats {
  round: number;
  p1Wins: number;
  p2Wins: number;
  p1Hp: number;
  p2Hp: number;
  p1Super: number; // 0 - 100
  p2Super: number; // 0 - 100
  p1Combo: number;
  p2Combo: number;
  timeRemaining: number;
  isOver: boolean;
  winner: number | null; // 1 or 2
}

