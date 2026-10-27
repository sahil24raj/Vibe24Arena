'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Share2,
  Sparkles,
  Zap,
  Users,
  ShieldAlert,
  ArrowLeft,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';

// ==========================================
// CHARACTER DEFINITIONS
// ==========================================
export interface ProtesterChar {
  id: string;
  name: string;
  title: string;
  tagline: string;
  avatarEmoji: string;
  badge: string;
  speed: number;       // speed multiplier
  agility: number;     // lateral speed multiplier
  health: number;      // max health points
  special: string;
  callout: string;
  colors: {
    skin: string;
    shirt: string;
    pants: string;
    accent: string;
    hair: string;
  };
}

export const PROTEST_CHARACTERS: ProtesterChar[] = [
  {
    id: 'genz',
    name: 'Aarav (GenZ Rebel)',
    title: 'The Viral Influencer',
    tagline: 'Going live on Reels. No cap. 💅',
    avatarEmoji: '📱',
    badge: 'TOP SPRINT',
    speed: 1.15,
    agility: 1.25,
    health: 100,
    special: '+20% Sprint Agility & Chai Healing',
    callout: 'LIVE STREAM ON HAIN!',
    colors: {
      skin: '#e0a97a',
      shirt: '#ff5e00',
      pants: '#475569',
      accent: '#a855f7',
      hair: '#7c3aed'
    }
  },
  {
    id: 'neha',
    name: 'Neha (Slogan Queen)',
    title: 'Voice of the Students',
    tagline: 'Loudest slogan in all of Delhi! 📢',
    avatarEmoji: '📢',
    badge: 'MEGAPHONE PRO',
    speed: 1.0,
    agility: 1.05,
    health: 120,
    special: 'Megaphone Power lasts 2x longer',
    callout: 'AAWAAZ DO, HUM EK HAIN!',
    colors: {
      skin: '#c68a5a',
      shirt: '#f59e0b',
      pants: '#b91c1c',
      accent: '#ef4444',
      hair: '#1f2937'
    }
  },
  {
    id: 'abhijit',
    name: 'Abhijit (Exam Topper)',
    title: 'The Evidence Carrier',
    tagline: 'Formula yaad hai, rights bhi! Carries receipts. 📚',
    avatarEmoji: '👓',
    badge: 'HIGH STAMINA',
    speed: 0.95,
    agility: 1.1,
    health: 130,
    special: 'Higher barricade jump clearance',
    callout: 'PAPER LEAK CANCEL KARO!',
    colors: {
      skin: '#b97a50',
      shirt: '#2563eb',
      pants: '#1e293b',
      accent: '#06b6d4',
      hair: '#111827'
    }
  },
  {
    id: 'bunty',
    name: 'Bunty (Meme Lord)',
    title: 'Chief Shitposter',
    tagline: 'Protesting purely with dank shitposts. 🐕',
    avatarEmoji: '🐕',
    badge: 'MEME SHIELD',
    speed: 1.05,
    agility: 1.15,
    health: 100,
    special: '+50% Vibe Score from Meme Coins',
    callout: 'YEH TOH MEME MATERIAL HAIN!',
    colors: {
      skin: '#eab308',
      shirt: '#e2e8f0',
      pants: '#0f172a',
      accent: '#eab308',
      hair: '#ca8a04'
    }
  },
  {
    id: 'kabir',
    name: 'Kabir (Wheelchair Warrior)',
    title: 'The Unstoppable Rebel',
    tagline: 'Ramp ho ya na ho, aa rahe hain! ♿',
    avatarEmoji: '♿',
    badge: 'TURBO DRIFT',
    speed: 1.1,
    agility: 1.3,
    health: 110,
    special: 'Immune to road potholes & puddles',
    callout: 'HUM BHI AAYE HAIN!',
    colors: {
      skin: '#c48a5e',
      shirt: '#0284c7',
      pants: '#334155',
      accent: '#38bdf8',
      hair: '#18181b'
    }
  },
  {
    id: 'minister',
    name: 'Sharma Ji (Ex-Minister)',
    title: 'The Clarifier',
    tagline: 'Lost convoy. Here to "clarify statement". 👴',
    avatarEmoji: '👴',
    badge: 'FREE CHAI',
    speed: 0.85,
    agility: 0.85,
    health: 150,
    special: 'Max Health Tank, funny excuse popups',
    callout: 'MERE BAYAAN KO TOD-MAROD KE PESHA KIYA GAYA!',
    colors: {
      skin: '#d19c72',
      shirt: '#f8fafc',
      pants: '#f1f5f9',
      accent: '#64748b',
      hair: '#94a3b8'
    }
  }
];

// ==========================================
// PROCEDURAL AUDIO SYNTHESIZER
// ==========================================
class ProtestAudioEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private beatStep: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cjm_muted');
        this.isMuted = saved === '1';
      } catch {
        this.isMuted = false;
      }
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      localStorage.setItem('cjm_muted', muted ? '1' : '0');
    } catch {}
    if (muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.15);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playLand() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playWhistle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.setValueAtTime(2650, now + 0.05);
    osc.frequency.setValueAtTime(2350, now + 0.1);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playSiren() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.25);
    osc.frequency.linearRampToValueAtTime(650, now + 0.5);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }

  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  public playChai() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + i * 0.05;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playMegaphone() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.2);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 880, 880, 1108.73];
    notes.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = now + idx * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, st);
      gain.gain.setValueAtTime(0.25, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.3);
    });
  }

  public startBGM() {
    if (this.isMuted || this.bgmInterval) return;
    this.initCtx();
    this.beatStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;
      // Dhol kick on step 0 and 2
      if (this.beatStep % 2 === 0) {
        const kick = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(110, now);
        kick.frequency.exponentialRampToValueAtTime(42, now + 0.12);
        kGain.gain.setValueAtTime(0.2, now);
        kGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
        kick.connect(kGain);
        kGain.connect(this.ctx.destination);
        kick.start(now);
        kick.stop(now + 0.14);
      }
      // Clack / hi-hat on every step
      const hat = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();
      hat.type = 'triangle';
      hat.frequency.setValueAtTime(this.beatStep % 4 === 1 ? 800 : 1200, now);
      hGain.gain.setValueAtTime(0.05, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      hat.connect(hGain);
      hGain.connect(this.ctx.destination);
      hat.start(now);
      hat.stop(now + 0.05);

      this.beatStep = (this.beatStep + 1) % 8;
    }, 240); // ~125 BPM Bhangra / Protest march tempo
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

const audio = new ProtestAudioEngine();

// ==========================================
// 3D WORLD TYPES & ENTITIES
// ==========================================
interface WorldPoint {
  x: number; // lateral: -6.5 (left curb) to +6.5 (right curb)
  d: number; // depth distance forward along road (0 to 1000m)
  h: number; // vertical height (0 = ground, > 0 = airborne)
}

interface Obstacle {
  id: number;
  type: 'van' | 'barricade' | 'cop' | 'puddle' | 'chai' | 'megaphone' | 'coin';
  x: number;
  d: number;
  h: number;
  w: number;
  length: number;
  active: boolean;
  state?: 'patrol' | 'chase' | 'return';
  dir?: number;
  patrolMin?: number;
  patrolMax?: number;
  speed?: number;
  sirenPhase?: number;
  chaseCool?: number;
  label?: string;
}

interface SceneryShop {
  side: 'left' | 'right';
  d: number;
  title: string;
  sub: string;
  awningCol: string;
  signCol: string;
}

interface BannerGantry {
  d: number;
  bannerText: string;
  bannerColor: string;
}

interface ComicBubble {
  id: number;
  text: string;
  x: number;
  d: number;
  h: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Particle {
  x: number;
  d: number;
  h: number;
  vx: number;
  vd: number;
  vh: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export function GenZProtestRunCanvas() {
  const { user, setUser } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI States: 'title' | 'select' | 'play' | 'detained' | 'gameover' | 'victory'
  const [gameState, setGameState] = useState<'title' | 'select' | 'play' | 'detained' | 'gameover' | 'victory'>('title');
  const [selectedChar, setSelectedChar] = useState<ProtesterChar>(PROTEST_CHARACTERS[0]);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [distance, setDistance] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [detainedVansCount, setDetainedVansCount] = useState(0);
  const [detainedCountdown, setDetainedCountdown] = useState(5);
  const [score, setScore] = useState(0);
  const [chaiCollected, setChaiCollected] = useState(0);
  const [slogansBoosted, setSlogansBoosted] = useState(0);
  const [isMuted, setIsMuted] = useState(audio.isMuted);

  // Virtual Touch Joystick State
  const [touchActive, setTouchActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchStickRef = useRef<{ active: boolean; startX: number; startY: number; dx: number; dy: number }>({
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0
  });

  // Keyboard input state
  const keysRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean; jump: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false
  });

  // Game Simulation Engine Ref
  const gameRef = useRef<{
    running: boolean;
    player: {
      x: number;
      d: number;
      h: number;
      vx: number;
      vd: number;
      vh: number;
      scaleX: number;
      scaleY: number;
      tilt: number;
      walkPhase: number;
      invincibleTimer: number;
      speedBoostTimer: number;
      stumbleTimer: number;
      isJumping: boolean;
    };
    camera: {
      x: number;
      d: number;
      h: number;
      pitch: number;
    };
    obstacles: Obstacle[];
    shops: SceneryShop[];
    gantries: BannerGantry[];
    bubbles: ComicBubble[];
    particles: Particle[];
    nextObstacleId: number;
    nextBubbleId: number;
    detainedTimer: number;
    totalDistanceTarget: number;
    lastTime: number;
    nextSpawnDistance: number;
  }>({
    running: false,
    player: {
      x: 0,
      d: 0,
      h: 0,
      vx: 0,
      vd: 0,
      vh: 0,
      scaleX: 1,
      scaleY: 1,
      tilt: 0,
      walkPhase: 0,
      invincibleTimer: 0,
      speedBoostTimer: 0,
      stumbleTimer: 0,
      isJumping: false
    },
    camera: {
      x: 0,
      d: -8,
      h: 5.2,
      pitch: 0.38
    },
    obstacles: [],
    shops: [],
    gantries: [],
    bubbles: [],
    particles: [],
    nextObstacleId: 1,
    nextBubbleId: 1,
    detainedTimer: 0,
    totalDistanceTarget: 1000,
    lastTime: 0,
    nextSpawnDistance: 30
  });

  // Spawn Delhi Roadside Shops & Footbridges
  const initEnvironment = useCallback(() => {
    const shops: SceneryShop[] = [];
    const shopThemes = [
      { title: 'SHARMA JI XEROX', sub: 'STUDENT NOTES 50P', awning: '#e11d48', sign: '#fef08a' },
      { title: 'KADAK CHAI TAPRI', sub: 'CHAI 10₹ · SAMOSA 15₹', awning: '#d97706', sign: '#fed7aa' },
      { title: 'CONSTITUTION BOOK HUB', sub: 'LAW & LEGAL RIGHTS', awning: '#2563eb', sign: '#bfdbfe' },
      { title: 'AGGARWAL SWEETS', sub: 'DESI GHEE JALEBI', awning: '#ea580c', sign: '#ffedd5' },
      { title: 'VIRAL REELS STUDIO', sub: 'WIFI FREE · RING LIGHT', awning: '#9333ea', sign: '#f3e8ff' },
      { title: 'DELHI PAAN & STATIONERY', sub: 'CHIPPED PENCILS & WATER', awning: '#059669', sign: '#a7f3d0' }
    ];

    for (let d = 40; d < 1000; d += 65) {
      const leftTheme = shopThemes[Math.floor(Math.random() * shopThemes.length)];
      shops.push({
        side: 'left',
        d: d + (Math.random() * 10 - 5),
        title: leftTheme.title,
        sub: leftTheme.sub,
        awningCol: leftTheme.awning,
        signCol: leftTheme.sign
      });

      const rightTheme = shopThemes[Math.floor(Math.random() * shopThemes.length)];
      shops.push({
        side: 'right',
        d: d + 30 + (Math.random() * 10 - 5),
        title: rightTheme.title,
        sub: rightTheme.sub,
        awningCol: rightTheme.awning,
        signCol: rightTheme.sign
      });
    }

    const gantries: BannerGantry[] = [
      { d: 150, bannerText: '🚫 NO PAPER LEAKS — SIKSHA HAMARA HAK HAI! 🚫', bannerColor: '#dc2626' },
      { d: 350, bannerText: '🔥 VIBE ARENA STUDENTS UNION MARCHING TO JANTAR MANTAR 🔥', bannerColor: '#7c3aed' },
      { d: 550, bannerText: '📢 SAMAAN RUKHEGA NAHI! MARCH OF DIGNITY & TRUTH 📢', bannerColor: '#0284c7' },
      { d: 750, bannerText: '⚖️ RE-EXAM DILWAO! BACKBENCHERS UNITED ⚖️', bannerColor: '#ca8a04' },
      { d: 920, bannerText: '🇮🇳 JANTAR MANTAR PROTEST CAMP AHEAD (100M) 🇮🇳', bannerColor: '#16a34a' }
    ];

    gameRef.current.shops = shops;
    gameRef.current.gantries = gantries;
  }, []);

  // Spawn Obstacles (Police Vans, Barricades, Stick Police, Puddles, Chai, Megaphones, Coins)
  const spawnObstaclesAhead = useCallback((currentDist: number) => {
    const g = gameRef.current;
    if (currentDist + 140 < g.nextSpawnDistance || g.nextSpawnDistance >= g.totalDistanceTarget - 30) return;

    const d = g.nextSpawnDistance;
    const lanePositions = [-4.5, -1.8, 1.8, 4.5];

    // Every 30-50m, spawn obstacle cluster
    const clusterType = Math.random();

    if (clusterType < 0.32) {
      // Police Van blockade (1 or 2 lanes occupied)
      const lane = lanePositions[Math.floor(Math.random() * lanePositions.length)];
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'van',
        x: lane,
        d: d,
        h: 0,
        w: 2.5,
        length: 4.8,
        active: true,
        speed: 1.5,
        sirenPhase: 0,
        label: 'POLICE'
      });
    } else if (clusterType < 0.62) {
      // Yellow Barricade (Requires Jumping!)
      const laneA = lanePositions[Math.floor(Math.random() * 2)];
      const laneB = lanePositions[2 + Math.floor(Math.random() * 2)];
      [laneA, laneB].forEach((x) => {
        g.obstacles.push({
          id: g.nextObstacleId++,
          type: 'barricade',
          x: x,
          d: d,
          h: 0,
          w: 2.2,
          length: 0.8,
          active: true,
          label: 'POLICE BARRIER'
        });
      });
    } else if (clusterType < 0.82) {
      // Lathi Stick Squad (Khaki police patrolling laterally)
      const startX = (Math.random() < 0.5 ? -1 : 1) * 3.5;
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'cop',
        x: startX,
        d: d,
        h: 0,
        w: 1.2,
        length: 1.2,
        active: true,
        state: 'patrol',
        dir: startX > 0 ? -1 : 1,
        patrolMin: -4.5,
        patrolMax: 4.5,
        speed: 2.5,
        chaseCool: 0
      });
    } else {
      // Water puddle or slippery hazard
      const lane = lanePositions[Math.floor(Math.random() * lanePositions.length)];
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'puddle',
        x: lane,
        d: d,
        h: 0,
        w: 2.6,
        length: 2.6,
        active: true
      });
    }

    // Add Collectibles along road: Chai Cup or Megaphone or Coins
    const itemRoll = Math.random();
    const freeLanes = lanePositions.filter((lx) => !g.obstacles.some((o) => o.d === d && Math.abs(o.x - lx) < 2));
    const targetLane = freeLanes.length > 0 ? freeLanes[Math.floor(Math.random() * freeLanes.length)] : 0;

    if (itemRoll < 0.35) {
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'chai',
        x: targetLane,
        d: d + 12,
        h: 0.4,
        w: 1.2,
        length: 1.2,
        active: true
      });
    } else if (itemRoll < 0.6) {
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'megaphone',
        x: targetLane,
        d: d + 14,
        h: 0.5,
        w: 1.2,
        length: 1.2,
        active: true
      });
    } else {
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'coin',
        x: targetLane,
        d: d + 10,
        h: 0.4,
        w: 1.0,
        length: 1.0,
        active: true
      });
    }

    g.nextSpawnDistance += 32 + Math.random() * 18;
  }, []);

  // Add floating comic bubble
  const addComicBubble = useCallback((text: string, x: number, d: number, h: number, color = '#fef08a') => {
    gameRef.current.bubbles.push({
      id: gameRef.current.nextBubbleId++,
      text,
      x,
      d,
      h,
      color,
      life: 0,
      maxLife: 1.8
    });
  }, []);

  // Add impact/dust particles
  const addParticles = useCallback((x: number, d: number, h: number, count = 8, color = '#fbbf24') => {
    for (let i = 0; i < count; i++) {
      gameRef.current.particles.push({
        x: x + (Math.random() - 0.5) * 0.8,
        d: d + (Math.random() - 0.5) * 0.8,
        h: h + Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 3.5,
        vd: (Math.random() - 0.5) * 2.5,
        vh: Math.random() * 4 + 1,
        color,
        size: Math.random() * 0.2 + 0.15,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.4
      });
    }
  }, []);

  // Start / Reset Match
  const startMatch = useCallback((char: ProtesterChar) => {
    setSelectedChar(char);
    setMaxHealth(char.health);
    setHealth(char.health);
    setDistance(0);
    setElapsedTime(0);
    setDetainedVansCount(0);
    setScore(0);
    setChaiCollected(0);
    setSlogansBoosted(0);

    const g = gameRef.current;
    g.running = true;
    g.player = {
      x: 0,
      d: 4,
      h: 0,
      vx: 0,
      vd: 8 * char.speed,
      vh: 0,
      scaleX: 1,
      scaleY: 1,
      tilt: 0,
      walkPhase: 0,
      invincibleTimer: 0,
      speedBoostTimer: 0,
      stumbleTimer: 0,
      isJumping: false
    };
    g.camera = {
      x: 0,
      d: -4,
      h: 5.2,
      pitch: 0.38
    };
    g.obstacles = [];
    g.bubbles = [];
    g.particles = [];
    g.nextSpawnDistance = 35;
    g.lastTime = performance.now();

    initEnvironment();
    setGameState('play');
    audio.startBGM();

    addComicBubble(char.callout, 0, 8, 2.5, '#4ade80');
    soundFx.playLevelUp();
  }, [initEnvironment, addComicBubble]);

  // Jump Action Trigger
  const triggerJump = useCallback(() => {
    const p = gameRef.current.player;
    if (p.h === 0 && !p.isJumping) {
      p.isJumping = true;
      p.vh = 8.8; // jump upward velocity
      p.scaleX = 0.75;
      p.scaleY = 1.35;
      audio.playJump();
      addParticles(p.x, p.d, 0.1, 8, '#e2e8f0');
    }
  }, [addParticles]);

  // Keyboard Event Listeners
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'play') return;
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysRef.current.left = true;
        e.preventDefault();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysRef.current.right = true;
        e.preventDefault();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        keysRef.current.up = true;
        e.preventDefault();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        keysRef.current.down = true;
        e.preventDefault();
      } else if (e.code === 'Space') {
        triggerJump();
        e.preventDefault();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') keysRef.current.up = false;
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.down = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState, triggerJump]);

  // Touch Virtual Joystick Listeners
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStickRef.current = {
      active: true,
      startX: touch.clientX,
      startY: touch.clientY,
      dx: 0,
      dy: 0
    };
    setTouchActive(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStickRef.current.active) return;
    const touch = e.touches[0];
    const rawDx = touch.clientX - touchStickRef.current.startX;
    const rawDy = touch.clientY - touchStickRef.current.startY;
    const dist = Math.hypot(rawDx, rawDy);
    const maxRadius = 45;
    const angle = Math.atan2(rawDy, rawDx);
    const clampedDist = Math.min(dist, maxRadius);
    const clampedX = Math.cos(angle) * clampedDist;
    const clampedY = Math.sin(angle) * clampedDist;

    touchStickRef.current.dx = clampedX / maxRadius;
    touchStickRef.current.dy = clampedY / maxRadius;
    setKnobPos({ x: clampedX, y: clampedY });
  };

  const handleTouchEnd = () => {
    touchStickRef.current = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };
    setTouchActive(false);
    setKnobPos({ x: 0, y: 0 });
  };

  // Main 2.5D Canvas Render Loop
  useEffect(() => {
    let animId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // ==========================================
    // PERSPECTIVE PROJECTION MATHEMATICS
    // ==========================================
    const project = (
      wx: number,
      wd: number,
      wh: number,
      W: number,
      H: number,
      cam: { x: number; d: number; h: number; pitch: number }
    ) => {
      const cosP = Math.cos(cam.pitch);
      const sinP = Math.sin(cam.pitch);
      const focal = Math.min(H * 0.98, W * 0.88);

      const mx = wx - cam.x;
      const td = wd - cam.d;
      const oh = wh - cam.h;

      // transformed distance along camera ray
      const depth = td * cosP - oh * sinP;
      if (depth < 0.35) return null;

      const scale = focal / depth;
      const centerX = W / 2;
      const centerY = H * 0.52;

      return {
        x: centerX + mx * scale,
        y: centerY - (td * sinP + oh * cosP) * scale,
        s: scale,
        depth: depth
      };
    };

    // ==========================================
    // MAIN GAME FRAME TICK
    // ==========================================
    const renderFrame = (now: number) => {
      animId = requestAnimationFrame(renderFrame);

      const g = gameRef.current;
      const dt = Math.min((now - (g.lastTime || now)) / 1000, 0.05);
      g.lastTime = now;

      const W = canvas.width;
      const H = canvas.height;

      // Update simulation if playing
      if (gameState === 'play' && g.running) {
        setElapsedTime((prev) => prev + dt);

        const p = g.player;

        // Invincibility & Speed Boost Timers
        if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
        if (p.speedBoostTimer > 0) p.speedBoostTimer -= dt;
        if (p.stumbleTimer > 0) p.stumbleTimer -= dt;

        // Steering & Accelerating input
        let inputX = 0;
        let inputZ = 1.0; // base running forward

        if (keysRef.current.left) inputX -= 1;
        if (keysRef.current.right) inputX += 1;
        if (keysRef.current.up) inputZ += 0.45;
        if (keysRef.current.down) inputZ -= 0.55;

        // Combine with Touch Joystick
        if (touchStickRef.current.active) {
          inputX += touchStickRef.current.dx * 1.3;
          inputZ += -touchStickRef.current.dy * 0.7;
        }

        // Apply Speeds with Character Stats
        const baseSpeed = 16 * selectedChar.speed;
        const targetVd = Math.max(5, (baseSpeed * inputZ) * (p.speedBoostTimer > 0 ? 1.45 : 1) * (p.stumbleTimer > 0 ? 0.45 : 1));
        p.vd += (targetVd - p.vd) * Math.min(1, dt * 7);

        const targetVx = inputX * 12.5 * selectedChar.agility;
        p.vx += (targetVx - p.vx) * Math.min(1, dt * 9);

        // Update positions
        p.d += p.vd * dt;
        p.x = Math.max(-6.2, Math.min(6.2, p.x + p.vx * dt));

        // Jump & Gravity Physics
        if (p.isJumping || p.h > 0) {
          p.vh -= 26 * dt; // gravity
          p.h += p.vh * dt;
          if (p.h <= 0) {
            p.h = 0;
            p.vh = 0;
            p.isJumping = false;
            p.scaleX = 1.35;
            p.scaleY = 0.75;
            audio.playLand();
            addParticles(p.x, p.d, 0.1, 7, '#cbd5e1');
          }
        }

        // Squash & stretch recovery
        p.scaleX += (1 - p.scaleX) * Math.min(1, dt * 12);
        p.scaleY += (1 - p.scaleY) * Math.min(1, dt * 12);
        p.tilt += ((p.vx / 12) - p.tilt) * Math.min(1, dt * 10);
        p.walkPhase += dt * (p.vd * 1.4);

        setDistance(Math.min(1000, Math.floor(p.d)));
        setScore((prev) => prev + Math.round(p.vd * dt * 10));

        // Check if reached Jantar Mantar (1000m)
        if (p.d >= g.totalDistanceTarget) {
          g.running = false;
          setGameState('victory');
          audio.stopBGM();
          audio.playVictory();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

          // Update user awards
          setUser({
            xp: (user.xp || 0) + 500,
            coins: (user.coins || 0) + 350,
            stats: {
              ...user.stats,
              gamesPlayed: (user.stats?.gamesPlayed || 0) + 1,
              totalWins: (user.stats?.totalWins || 0) + 1,
              winRate: Math.round(((user.stats?.totalWins || 0) + 1) / ((user.stats?.gamesPlayed || 0) + 1) * 100),
              bestScore: Math.max(user.stats?.bestScore || 0, score + 1500)
            }
          });
        }

        // Spawn new obstacles ahead
        spawnObstaclesAhead(p.d);

        // Update Camera smoothly tracking player
        const targetCamX = p.x * 0.55;
        const targetCamD = p.d - 8.2;
        const targetCamH = 5.2 + p.h * 0.25;
        g.camera.x += (targetCamX - g.camera.x) * Math.min(1, dt * 8);
        g.camera.d += (targetCamD - g.camera.d) * Math.min(1, dt * 8);
        g.camera.h += (targetCamH - g.camera.h) * Math.min(1, dt * 8);

        // Update Obstacles & AI
        for (const obs of g.obstacles) {
          if (!obs.active) continue;

          // Police Van oncoming movement & flashing light
          if (obs.type === 'van') {
            obs.sirenPhase = ((obs.sirenPhase || 0) + dt * 10) % 2;
            obs.d -= obs.speed! * dt;
          }

          // Lathi Cop Patrol & Chase AI
          if (obs.type === 'cop') {
            const distToPlayer = Math.hypot(p.x - obs.x, p.d - obs.d);

            if (distToPlayer < 9 && p.invincibleTimer <= 0) {
              obs.state = 'chase';
              // Chase player direction
              const angle = Math.atan2(p.d - obs.d, p.x - obs.x);
              obs.x += Math.cos(angle) * obs.speed! * 1.35 * dt;
              obs.d += Math.sin(angle) * obs.speed! * 0.7 * dt;

              if (Math.random() < 0.015) {
                audio.playWhistle();
                addComicBubble(Math.random() < 0.5 ? 'OYE! RUK!' : 'PAKDO!', obs.x, obs.d, 2.5, '#ef4444');
              }
            } else {
              // Standard Lane Patrol
              obs.state = 'patrol';
              obs.x += (obs.dir || 1) * obs.speed! * dt;
              if (obs.x >= (obs.patrolMax || 4.5)) {
                obs.x = obs.patrolMax || 4.5;
                obs.dir = -1;
              } else if (obs.x <= (obs.patrolMin || -4.5)) {
                obs.x = obs.patrolMin || -4.5;
                obs.dir = 1;
              }
            }
          }

          // ==========================================
          // COLLISION DETECTION (Player vs Obstacle)
          // ==========================================
          const dx = Math.abs(p.x - obs.x);
          const dd = Math.abs(p.d - obs.d);

          if (dx < (obs.w * 0.7) && dd < (obs.length * 0.8)) {
            // Collision with Police Van -> DETAINED in Van for 5s
            if (obs.type === 'van') {
              if (p.invincibleTimer <= 0) {
                obs.active = false;
                audio.playSiren();
                setDetainedVansCount((c) => c + 1);
                setDetainedCountdown(5);
                setGameState('detained');
                g.detainedTimer = 5.0;
                addComicBubble('DETAINED BY DILLI POLICE!', p.x, p.d, 3, '#38bdf8');
                return;
              }
            }

            // Collision with Barricade -> Can be jumped over!
            else if (obs.type === 'barricade') {
              if (p.h > 1.1) {
                // Successfully cleared barricade by jumping!
                if (obs.active) {
                  obs.active = false;
                  addComicBubble('WHOOSH! JUMPED!', p.x, p.d, 2.8, '#4ade80');
                  setScore((s) => s + 150);
                }
              } else if (p.invincibleTimer <= 0) {
                obs.active = false;
                audio.playHit();
                addParticles(p.x, p.d, 1.0, 10, '#f59e0b');
                p.stumbleTimer = 0.8;
                p.vd = 2; // slow down impact
                const dmg = 25;
                setHealth((h) => {
                  const nextH = Math.max(0, h - dmg);
                  if (nextH <= 0) triggerGameOver('Barricade se takkar ho gayi! Exam hall miss ho gaya.');
                  return nextH;
                });
                addComicBubble('OUCH! BARRICADE!', p.x, p.d, 2.5, '#f59e0b');
              }
            }

            // Collision with Lathi Cop -> Hit with lathi stick
            else if (obs.type === 'cop') {
              if (p.invincibleTimer <= 0) {
                obs.active = false;
                audio.playHit();
                addParticles(p.x, p.d, 1.2, 12, '#ef4444');
                p.stumbleTimer = 0.9;
                const dmg = 40;
                setHealth((h) => {
                  const nextH = Math.max(0, h - dmg);
                  if (nextH <= 0) triggerGameOver('Lathi charge mein pack ho gaye! Health zero.');
                  return nextH;
                });
                addComicBubble('LATHI CHARGE! −40%', p.x, p.d, 2.5, '#ef4444');
              }
            }

            // Collision with Puddle -> Slip & slide
            else if (obs.type === 'puddle') {
              if (selectedChar.id !== 'kabir') { // Kabir's wheelchair is immune to puddles
                obs.active = false;
                p.stumbleTimer = 0.6;
                addParticles(p.x, p.d, 0.2, 8, '#38bdf8');
                addComicBubble('SLIP! SLIPPERY ROAD!', p.x, p.d, 2.0, '#38bdf8');
              }
            }

            // Collect Chai -> Health Restore
            else if (obs.type === 'chai') {
              obs.active = false;
              audio.playChai();
              setChaiCollected((c) => c + 1);
              setScore((s) => s + 200);
              const heal = selectedChar.id === 'genz' ? 35 : 25;
              setHealth((h) => Math.min(maxHealth, h + heal));
              addComicBubble('+30% KADAK CHAI!', p.x, p.d, 2.4, '#f59e0b');
              addParticles(p.x, p.d, 1.0, 10, '#fde68a');
            }

            // Collect Slogan Megaphone -> Invincibility & Speed Boost
            else if (obs.type === 'megaphone') {
              obs.active = false;
              audio.playMegaphone();
              setSlogansBoosted((s) => s + 1);
              setScore((s) => s + 300);
              p.invincibleTimer = selectedChar.id === 'neha' ? 8.0 : 5.0;
              p.speedBoostTimer = selectedChar.id === 'neha' ? 8.0 : 5.0;
              addComicBubble('SLOGAN BOOST! INQUILAB!', p.x, p.d, 2.8, '#a855f7');
              addParticles(p.x, p.d, 1.2, 14, '#c084fc');
            }

            // Collect Meme Coin -> Score boost
            else if (obs.type === 'coin') {
              obs.active = false;
              soundFx.playCoin();
              const pts = selectedChar.id === 'bunty' ? 250 : 150;
              setScore((s) => s + pts);
              addParticles(p.x, p.d, 0.8, 6, '#facc15');
            }
          }
        }

        // Clean up passed obstacles & particles
        g.obstacles = g.obstacles.filter((o) => o.d > p.d - 20);
        g.particles.forEach((part) => {
          part.x += part.vx * dt;
          part.d += part.vd * dt;
          part.h += part.vh * dt;
          part.vh -= 9.8 * dt;
          part.life += dt;
        });
        g.particles = g.particles.filter((part) => part.life < part.maxLife);

        // Update floating bubbles
        g.bubbles.forEach((b) => {
          b.h += dt * 0.8;
          b.life += dt;
        });
        g.bubbles = g.bubbles.filter((b) => b.life < b.maxLife);
      }

      // Handle Detained Countdown Screen
      if (gameState === 'detained') {
        g.detainedTimer -= dt;
        setDetainedCountdown(Math.ceil(Math.max(0, g.detainedTimer)));
        if (g.detainedTimer <= 0) {
          setGameState('play');
          g.player.invincibleTimer = 3.0; // 3 seconds grace period after release
          addComicBubble('RELEASED FROM POLICE VAN!', g.player.x, g.player.d, 3, '#4ade80');
        }
      }

      // ==========================================
      // CANVAS RENDERING PIPELINE
      // ==========================================
      ctx.clearRect(0, 0, W, H);

      // 1. Delhi Smog / Twilight Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.52);
      skyGrad.addColorStop(0, '#1e1124');
      skyGrad.addColorStop(0.4, '#4a1525');
      skyGrad.addColorStop(0.75, '#ea580c');
      skyGrad.addColorStop(1, '#fed7aa');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.55);

      // 2. Distant Horizon Silhouette: Delhi Parliament & India Gate
      const horizonY = H * 0.52;
      ctx.fillStyle = '#1e1b2e';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      // Skyline bumps
      for (let sx = 0; sx < W; sx += 40) {
        const bh = Math.sin(sx * 0.05) * 12 + Math.cos(sx * 0.02) * 8 + 14;
        ctx.lineTo(sx, horizonY - bh);
        ctx.lineTo(sx + 35, horizonY - bh);
      }
      ctx.lineTo(W, horizonY);
      ctx.closePath();
      ctx.fill();

      // Parliament Dome in center background
      const domeX = W / 2;
      ctx.fillStyle = '#2d1f3d';
      ctx.beginPath();
      ctx.arc(domeX, horizonY - 14, 28, Math.PI, 0, false);
      ctx.lineTo(domeX + 28, horizonY);
      ctx.lineTo(domeX - 28, horizonY);
      ctx.closePath();
      ctx.fill();

      // 3. Ground Pavements (Left & Right Sidewalks)
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      groundGrad.addColorStop(0, '#57534e');
      groundGrad.addColorStop(1, '#292524');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // 4. Perspective Road Surface (4 Lanes)
      const roadHalfWidth = 6.8;
      const roadNearLeft = project(-roadHalfWidth, g.camera.d + 1.5, 0, W, H, g.camera);
      const roadNearRight = project(roadHalfWidth, g.camera.d + 1.5, 0, W, H, g.camera);
      const roadFarLeft = project(-roadHalfWidth, g.camera.d + 180, 0, W, H, g.camera);
      const roadFarRight = project(roadHalfWidth, g.camera.d + 180, 0, W, H, g.camera);

      if (roadNearLeft && roadNearRight && roadFarLeft && roadFarRight) {
        // Dark Asphalt Highway
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(roadNearLeft.x, roadNearLeft.y);
        ctx.lineTo(roadFarLeft.x, roadFarLeft.y);
        ctx.lineTo(roadFarRight.x, roadFarRight.y);
        ctx.lineTo(roadNearRight.x, roadNearRight.y);
        ctx.closePath();
        ctx.fill();

        // Yellow Road Curbs on sides
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = Math.max(3, roadNearLeft.s * 0.12);
        ctx.beginPath();
        ctx.moveTo(roadNearLeft.x, roadNearLeft.y);
        ctx.lineTo(roadFarLeft.x, roadFarLeft.y);
        ctx.moveTo(roadNearRight.x, roadNearRight.y);
        ctx.lineTo(roadFarRight.x, roadFarRight.y);
        ctx.stroke();

        // Dashed White Lane Dividers
        const laneXValues = [-3.4, 0, 3.4];
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, roadNearLeft.s * 0.08);

        for (const lx of laneXValues) {
          ctx.beginPath();
          const stepDist = 8;
          const startDist = Math.floor(g.camera.d / stepDist) * stepDist;
          for (let segD = startDist; segD < g.camera.d + 160; segD += stepDist) {
            const p1 = project(lx, segD, 0, W, H, g.camera);
            const p2 = project(lx, segD + 4.5, 0, W, H, g.camera);
            if (p1 && p2) {
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
          ctx.stroke();
        }
      }

      // ==========================================
      // DEPTH-SORTED DRAWABLE OBJECTS
      // ==========================================
      interface Renderable {
        depth: number;
        draw: () => void;
      }

      const drawList: Renderable[] = [];

      // 5. Draw Roadside Shops
      for (const shop of g.shops) {
        if (shop.d < g.camera.d + 1 || shop.d > g.camera.d + 180) continue;
        const sideX = shop.side === 'left' ? -9.5 : 9.5;
        const pt = project(sideX, shop.d, 0, W, H, g.camera);
        if (!pt) continue;

        drawList.push({
          depth: pt.depth,
          draw: () => {
            const sw = pt.s * 4.8;
            const sh = pt.s * 3.6;

            // Shop Building facade
            ctx.fillStyle = '#334155';
            ctx.fillRect(pt.x - sw / 2, pt.y - sh, sw, sh);

            // Striped Awning roof
            ctx.fillStyle = shop.awningCol;
            ctx.fillRect(pt.x - sw / 2 - 4, pt.y - sh, sw + 8, sh * 0.28);

            // Bright Comic Shop Signboard
            ctx.fillStyle = shop.signCol;
            ctx.fillRect(pt.x - sw * 0.42, pt.y - sh * 0.88, sw * 0.84, sh * 0.38);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = Math.max(1, pt.s * 0.04);
            ctx.strokeRect(pt.x - sw * 0.42, pt.y - sh * 0.88, sw * 0.84, sh * 0.38);

            // Text
            if (pt.s > 10) {
              ctx.fillStyle = '#0f172a';
              ctx.font = `bold ${Math.max(8, Math.round(pt.s * 0.28))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(shop.title, pt.x, pt.y - sh * 0.68);
              ctx.font = `bold ${Math.max(6, Math.round(pt.s * 0.18))}px sans-serif`;
              ctx.fillText(shop.sub, pt.x, pt.y - sh * 0.54);
            }
          }
        });
      }

      // 6. Draw Overhead Banner Gantries (Footbridges)
      for (const gantry of g.gantries) {
        if (gantry.d < g.camera.d + 2 || gantry.d > g.camera.d + 180) continue;
        const leftPt = project(-7.5, gantry.d, 4.5, W, H, g.camera);
        const rightPt = project(7.5, gantry.d, 4.5, W, H, g.camera);
        const leftGround = project(-7.5, gantry.d, 0, W, H, g.camera);
        const rightGround = project(7.5, gantry.d, 0, W, H, g.camera);

        if (leftPt && rightPt && leftGround && rightGround) {
          drawList.push({
            depth: leftPt.depth,
            draw: () => {
              // Steel Pillars
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = Math.max(3, leftPt.s * 0.14);
              ctx.beginPath();
              ctx.moveTo(leftGround.x, leftGround.y);
              ctx.lineTo(leftPt.x, leftPt.y);
              ctx.moveTo(rightGround.x, rightGround.y);
              ctx.lineTo(rightPt.x, rightPt.y);
              ctx.stroke();

              // Crossbar
              ctx.lineWidth = Math.max(4, leftPt.s * 0.2);
              ctx.beginPath();
              ctx.moveTo(leftPt.x, leftPt.y);
              ctx.lineTo(rightPt.x, rightPt.y);
              ctx.stroke();

              // Huge Banner Board
              const bannerH = leftPt.s * 1.6;
              const bannerW = rightPt.x - leftPt.x;
              ctx.fillStyle = gantry.bannerColor;
              ctx.fillRect(leftPt.x, leftPt.y - bannerH / 2, bannerW, bannerH);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.strokeRect(leftPt.x, leftPt.y - bannerH / 2, bannerW, bannerH);

              // Banner Text
              ctx.fillStyle = '#ffffff';
              ctx.font = `900 ${Math.max(9, Math.round(leftPt.s * 0.35))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(gantry.bannerText, (leftPt.x + rightPt.x) / 2, leftPt.y + leftPt.s * 0.1);
            }
          });
        }
      }

      // 7. Draw Dynamic Obstacles (Vans, Barricades, Cops, Collectibles)
      for (const obs of g.obstacles) {
        if (!obs.active) continue;
        if (obs.d < g.camera.d + 1 || obs.d > g.camera.d + 180) continue;

        const pt = project(obs.x, obs.d, obs.h, W, H, g.camera);
        if (!pt) continue;

        drawList.push({
          depth: pt.depth,
          draw: () => {
            const scale = pt.s;

            // --- POLICE VAN ---
            if (obs.type === 'van') {
              const vw = scale * 2.6;
              const vh = scale * 2.2;

              // Van Shadow
              ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
              ctx.beginPath();
              ctx.ellipse(pt.x, pt.y, vw * 0.65, scale * 0.35, 0, 0, Math.PI * 2);
              ctx.fill();

              // Van Body (Delhi Police Navy & White)
              ctx.fillStyle = '#1e3a8a';
              ctx.fillRect(pt.x - vw / 2, pt.y - vh, vw, vh);

              // White police stripe in center
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(pt.x - vw / 2, pt.y - vh * 0.65, vw, vh * 0.32);

              // Windshield
              ctx.fillStyle = '#0ea5e9';
              ctx.fillRect(pt.x - vw * 0.42, pt.y - vh * 0.92, vw * 0.84, vh * 0.28);

              // "POLICE" Text
              ctx.fillStyle = '#1e3a8a';
              ctx.font = `bold ${Math.max(7, Math.round(scale * 0.22))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText('POLICE', pt.x, pt.y - vh * 0.44);

              // Flashing Rooftop Beacon Siren (Alternating Red / Blue)
              const isRed = (obs.sirenPhase || 0) < 1;
              ctx.fillStyle = isRed ? '#ef4444' : '#3b82f6';
              ctx.shadowColor = isRed ? '#ef4444' : '#3b82f6';
              ctx.shadowBlur = 12;
              ctx.fillRect(pt.x - scale * 0.35, pt.y - vh - scale * 0.35, scale * 0.7, scale * 0.35);
              ctx.shadowBlur = 0; // reset
            }

            // --- YELLOW/BLACK BARRICADE ---
            else if (obs.type === 'barricade') {
              const bw = scale * 2.4;
              const bh = scale * 1.35;

              // Shadow
              ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
              ctx.beginPath();
              ctx.ellipse(pt.x, pt.y, bw * 0.55, scale * 0.2, 0, 0, Math.PI * 2);
              ctx.fill();

              // Steel Legs
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = Math.max(2, scale * 0.08);
              ctx.beginPath();
              ctx.moveTo(pt.x - bw * 0.4, pt.y);
              ctx.lineTo(pt.x - bw * 0.4, pt.y - bh);
              ctx.moveTo(pt.x + bw * 0.4, pt.y);
              ctx.lineTo(pt.x + bw * 0.4, pt.y - bh);
              ctx.stroke();

              // Barricade Face (Yellow with diagonal black stripes)
              ctx.fillStyle = '#eab308';
              ctx.fillRect(pt.x - bw / 2, pt.y - bh, bw, bh * 0.75);

              // Stencil "DELHI POLICE"
              ctx.fillStyle = '#0f172a';
              ctx.font = `900 ${Math.max(6, Math.round(scale * 0.2))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText('POLICE', pt.x, pt.y - bh * 0.45);
            }

            // --- LATHI POLICE COP ---
            else if (obs.type === 'cop') {
              const cw = scale * 1.1;
              const ch = scale * 1.9;

              // Shadow
              ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
              ctx.beginPath();
              ctx.ellipse(pt.x, pt.y, cw * 0.5, scale * 0.2, 0, 0, Math.PI * 2);
              ctx.fill();

              // Khaki Uniform Shirt & Pants
              ctx.fillStyle = '#d97706'; // khaki
              ctx.fillRect(pt.x - cw * 0.35, pt.y - ch * 0.75, cw * 0.7, ch * 0.45); // shirt
              ctx.fillStyle = '#b45309';
              ctx.fillRect(pt.x - cw * 0.32, pt.y - ch * 0.32, cw * 0.64, ch * 0.32); // trousers

              // Police Cap
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y - ch * 0.85, cw * 0.35, 0, Math.PI * 2);
              ctx.fill();

              // Bamboo Lathi (Stick in hand)
              ctx.strokeStyle = '#ca8a04';
              ctx.lineWidth = Math.max(2, scale * 0.08);
              ctx.beginPath();
              ctx.moveTo(pt.x + cw * 0.38, pt.y - ch * 0.6);
              ctx.lineTo(pt.x + cw * 0.75, pt.y - ch * 0.1);
              ctx.stroke();
            }

            // --- WATER PUDDLE ---
            else if (obs.type === 'puddle') {
              ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
              ctx.beginPath();
              ctx.ellipse(pt.x, pt.y, scale * 1.3, scale * 0.55, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }

            // --- CHAI GLASS COLLECTIBLE ---
            else if (obs.type === 'chai') {
              const sz = scale * 0.9;
              ctx.fillStyle = '#f59e0b';
              ctx.beginPath();
              ctx.moveTo(pt.x - sz * 0.4, pt.y - sz);
              ctx.lineTo(pt.x + sz * 0.4, pt.y - sz);
              ctx.lineTo(pt.x + sz * 0.28, pt.y);
              ctx.lineTo(pt.x - sz * 0.28, pt.y);
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.stroke();

              // Steaming Aroma Wave
              ctx.strokeStyle = '#fed7aa';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y - sz * 1.3, sz * 0.25, 0, Math.PI);
              ctx.stroke();
            }

            // --- SLOGAN MEGAPHONE ---
            else if (obs.type === 'megaphone') {
              const sz = scale * 0.9;
              ctx.fillStyle = '#a855f7';
              ctx.beginPath();
              ctx.moveTo(pt.x - sz * 0.4, pt.y - sz * 0.3);
              ctx.lineTo(pt.x + sz * 0.5, pt.y - sz * 0.8);
              ctx.lineTo(pt.x + sz * 0.5, pt.y + sz * 0.2);
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.stroke();
            }

            // --- MEME COIN ---
            else if (obs.type === 'coin') {
              const r = scale * 0.55;
              ctx.fillStyle = '#eab308';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y - r, r, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              ctx.fillStyle = '#0f172a';
              ctx.font = `bold ${Math.max(7, Math.round(scale * 0.25))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText('₹', pt.x, pt.y - r * 0.7);
            }
          }
        });
      }

      // 8. Draw Player Character (In 3D World)
      const playerPt = project(g.player.x, g.player.d, g.player.h, W, H, g.camera);
      if (playerPt) {
        drawList.push({
          depth: playerPt.depth,
          draw: () => {
            const scale = playerPt.s;
            const px = playerPt.x;
            const py = playerPt.y;
            const pw = scale * 1.35 * g.player.scaleX;
            const ph = scale * 2.2 * g.player.scaleY;

            // Player Shadow (Stretches when jumping)
            const shadowPt = project(g.player.x, g.player.d, 0, W, H, g.camera);
            if (shadowPt) {
              const shadowAlpha = Math.max(0.12, 0.45 - g.player.h * 0.12);
              ctx.fillStyle = `rgba(15, 23, 42, ${shadowAlpha})`;
              ctx.beginPath();
              ctx.ellipse(shadowPt.x, shadowPt.y, pw * 0.5, scale * 0.2, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(g.player.tilt);

            // Flashing Invincibility Glow
            if (g.player.invincibleTimer > 0) {
              ctx.shadowColor = '#c084fc';
              ctx.shadowBlur = 18;
            }

            // Legs with walking animation
            const legSwing = Math.sin(g.player.walkPhase) * (scale * 0.28);
            ctx.fillStyle = selectedChar.colors.pants;
            // Left leg
            ctx.fillRect(-pw * 0.32, -ph * 0.35, pw * 0.26, ph * 0.35 + legSwing);
            // Right leg
            ctx.fillRect(pw * 0.06, -ph * 0.35, pw * 0.26, ph * 0.35 - legSwing);

            // Torso / Shirt
            ctx.fillStyle = selectedChar.colors.shirt;
            ctx.fillRect(-pw * 0.4, -ph * 0.78, pw * 0.8, ph * 0.45);

            // Backpack (Abhijit or GenZ)
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-pw * 0.28, -ph * 0.74, pw * 0.56, ph * 0.36);

            // Head
            ctx.fillStyle = selectedChar.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -ph * 0.86, pw * 0.32, 0, Math.PI * 2);
            ctx.fill();

            // Hair / Bucket Hat
            ctx.fillStyle = selectedChar.colors.hair;
            ctx.beginPath();
            ctx.arc(0, -ph * 0.94, pw * 0.34, Math.PI, 0, false);
            ctx.fill();

            // Special Wheelchair prop for Kabir
            if (selectedChar.id === 'kabir') {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = Math.max(2, scale * 0.1);
              ctx.beginPath();
              ctx.arc(-pw * 0.3, -ph * 0.15, scale * 0.45, 0, Math.PI * 2);
              ctx.arc(pw * 0.3, -ph * 0.15, scale * 0.45, 0, Math.PI * 2);
              ctx.stroke();
            }

            ctx.restore();
            ctx.shadowBlur = 0;
          }
        });
      }

      // 9. Draw Impact Particles
      for (const part of g.particles) {
        const pt = project(part.x, part.d, part.h, W, H, g.camera);
        if (!pt) continue;

        drawList.push({
          depth: pt.depth,
          draw: () => {
            const rad = Math.max(2, pt.s * part.size);
            ctx.fillStyle = part.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // Sort Drawables back to front (highest depth to lowest depth)
      drawList.sort((a, b) => b.depth - a.depth);
      for (const item of drawList) {
        item.draw();
      }

      // 10. Draw 2D Comic Speech Bubbles (Overhead UI layer)
      for (const bubble of g.bubbles) {
        const pt = project(bubble.x, bubble.d, bubble.h, W, H, g.camera);
        if (!pt) continue;

        const alpha = Math.max(0, 1 - bubble.life / bubble.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.font = '900 13px sans-serif';
        const txtW = ctx.measureText(bubble.text).width;
        const padX = 12;
        const padY = 6;
        const bx = pt.x - txtW / 2 - padX;
        const by = pt.y - 32;
        const bw = txtW + padX * 2;
        const bh = 24;

        // Comic Bubble Box
        ctx.fillStyle = bubble.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.fill();
        ctx.stroke();

        // Pointer triangle
        ctx.beginPath();
        ctx.moveTo(pt.x - 6, by + bh);
        ctx.lineTo(pt.x + 6, by + bh);
        ctx.lineTo(pt.x, by + bh + 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Text
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bubble.text, pt.x, by + bh / 2);

        ctx.restore();
      }

      // 11. Subtle Comic Halftone Dot Effect Overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.03)';
      ctx.fillRect(0, 0, W, H);
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, selectedChar, maxHealth, spawnObstaclesAhead, addParticles, addComicBubble, score, user, setUser]);

  // Trigger Game Over
  const triggerGameOver = (reason: string) => {
    gameRef.current.running = false;
    audio.stopBGM();
    audio.playHit();
    setGameState('gameover');
  };

  // Share Score / Challenge Friends
  const shareProtestRun = () => {
    soundFx.playClick();
    const text = `📢 Just ran ${distance}m in GENZ PROTEST RUN! Dodged ${detainedVansCount} Delhi police vans and collected ${chaiCollected} cutting chais! Can you beat my score of ${score}? 🇮🇳🔥`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('📋 Protest Score Copied to Clipboard! Share with your squad!');
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] sm:aspect-[16/9] min-h-[500px] max-h-[85vh] rounded-3xl overflow-hidden select-none bg-[#0a0710] border-2 border-[#ff5e00]/30 shadow-2xl font-sans"
    >
      {/* Canvas Viewport */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-pointer" />

      {/* ==================================================== */}
      {/* 1. TITLE SCREEN OVERLAY                              */}
      {/* ==================================================== */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#0a0710]/70 via-[#180a1c]/85 to-[#050209]/95 backdrop-blur-sm">
          {/* Top Pill */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/40 text-orange-400 text-xs font-mono font-bold tracking-wider animate-pulse">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>TRENDING INDIAN MEME ARENA ARCADE</span>
          </div>

          {/* Main Title Banner */}
          <div className="flex flex-col items-center text-center space-y-3 max-w-xl">
            <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-2xl sm:text-4xl tracking-tight shadow-xl border-2 border-yellow-300 transform -rotate-1">
              द जेनज़ी प्रोटेस्ट रन
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-wide uppercase drop-shadow-lg">
              GENZ PROTEST RUN
            </h1>
            <p className="text-xs sm:text-sm text-yellow-200/90 font-medium max-w-md">
              Dodge Dilli police vans, jump barricades, chug cutting chai & march 1000m all the way to Jantar Mantar!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-gray-300">
                🚐 Blue Police Van = 5s Free Van Seva
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-red-300">
                👮 Khaki Stick Squad = −40% जान
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-yellow-300">
                🚧 Yellow Barricade = JUMP It!
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <button
              onClick={() => {
                soundFx.playClick();
                setGameState('select');
              }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-slate-950 font-black text-sm sm:text-base tracking-widest uppercase transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>CHOOSE CHARACTER & MARCH</span>
            </button>
          </div>

          {/* Controls Footer */}
          <div className="text-[11px] font-mono text-gray-400 text-center">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">← / A</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">→ / D</kbd> Steer &nbsp;|&nbsp;{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">SPACE</kbd> Jump &nbsp;|&nbsp; Touch Joystick on Mobile
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. CHARACTER SELECTION SCREEN                        */}
      {/* ==================================================== */}
      {gameState === 'select' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-[#0a0710]/90 to-[#120817]/98 backdrop-blur-md overflow-y-auto">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                soundFx.playClick();
                setGameState('title');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>BACK TO TITLE</span>
            </button>
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-black text-white font-display">कौन चलेगा जंतर मंतर?</h2>
              <p className="text-[11px] font-mono text-orange-400">PICK YOUR PROTESTER</p>
            </div>
            <div className="w-16" />
          </div>

          {/* Character Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 max-w-4xl mx-auto w-full">
            {PROTEST_CHARACTERS.map((char) => (
              <div
                key={char.id}
                onClick={() => {
                  soundFx.playClick();
                  startMatch(char);
                }}
                className={`group relative p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedChar.id === char.id
                    ? 'bg-gradient-to-b from-orange-500/20 to-purple-900/40 border-orange-400 shadow-xl shadow-orange-500/20 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl sm:text-4xl">{char.avatarEmoji}</span>
                  <span className="px-2 py-0.5 rounded-md bg-orange-500/20 border border-orange-500/30 text-[10px] font-mono font-bold text-orange-300">
                    {char.badge}
                  </span>
                </div>

                <div className="my-2 space-y-0.5">
                  <h3 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                    {char.name}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-sans italic line-clamp-1">"{char.tagline}"</p>
                </div>

                <div className="space-y-1 text-[10px] font-mono text-gray-300 pt-1 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span>SPEED:</span>
                    <span className="text-orange-400 font-bold">{Math.round(char.speed * 100)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>जान (HP):</span>
                    <span className="text-emerald-400 font-bold">{char.health} HP</span>
                  </div>
                  <div className="text-[9px] text-yellow-300/80 truncate">★ {char.special}</div>
                </div>

                <button className="mt-3 w-full py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-950 font-black text-[11px] tracking-wider uppercase transition-all">
                  SELECT & RUN
                </button>
              </div>
            ))}
          </div>

          <p className="text-[11px] font-mono text-gray-500 text-center">
            Protest Corridor: 1000m to Jantar Mantar · Dodge Vans, Jump Barricades!
          </p>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. ACTIVE GAMEPLAY HUD                               */}
      {/* ==================================================== */}
      {gameState === 'play' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6">
          {/* Top HUD Bar */}
          <div className="flex items-center justify-between gap-3">
            {/* Health Bar (जान) */}
            <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/85 border border-slate-800 shadow-xl backdrop-blur-md">
              <span className="text-xs font-black text-red-400 font-display">जान</span>
              <div className="w-24 sm:w-36 h-3 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700">
                <div
                  className={`h-full transition-all duration-200 rounded-full ${
                    health > 60
                      ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                      : health > 30
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                      : 'bg-gradient-to-r from-red-600 to-rose-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, (health / maxHealth) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-white min-w-[32px] text-right">
                {Math.max(0, Math.round((health / maxHealth) * 100))}%
              </span>
            </div>

            {/* Distance Route Progress */}
            <div className="flex-1 max-w-xs hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-slate-950/85 border border-slate-800 shadow-xl backdrop-blur-md">
              <span className="text-[10px] font-mono text-gray-400">0M</span>
              <div className="flex-1 h-2 rounded-full bg-slate-800 relative overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-white to-green-500 rounded-full transition-all duration-100"
                  style={{ width: `${Math.min(100, (distance / 1000) * 100)}%` }}
                />
              </div>
              <span className="text-xs font-mono font-black text-orange-400">{distance}M</span>
              <span className="text-xs">🇮🇳</span>
            </div>

            {/* Stats Pills (Time, Van count, Sound toggle) */}
            <div className="pointer-events-auto flex items-center gap-2">
              <div className="px-2.5 py-1 rounded-xl bg-slate-950/85 border border-slate-800 text-xs font-mono text-white">
                <span className="text-gray-400">TIME </span>
                <span className="font-bold text-cyan-400">{elapsedTime.toFixed(1)}s</span>
              </div>

              <div className="px-2.5 py-1 rounded-xl bg-slate-950/85 border border-slate-800 text-xs font-mono text-white">
                <span className="text-gray-400">VAN </span>
                <span className="font-bold text-red-400">×{detainedVansCount}</span>
              </div>

              <button
                onClick={() => {
                  const muted = audio.toggleMute();
                  setIsMuted(muted);
                }}
                className="p-1.5 rounded-xl bg-slate-950/85 border border-slate-800 text-gray-300 hover:text-white transition-all cursor-pointer"
                aria-label="Toggle Sound"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
              </button>
            </div>
          </div>

          {/* Bottom Virtual Controls (Touch Mobile JoyStick & Jump Button) */}
          <div className="flex items-end justify-between pointer-events-auto">
            {/* Virtual Joystick Pad */}
            <div
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative w-28 h-28 rounded-full bg-slate-950/60 border-2 border-slate-700/80 backdrop-blur-md flex items-center justify-center touch-none sm:hidden"
            >
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 border-2 border-white shadow-lg pointer-events-none transition-transform duration-75"
                style={{
                  transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
                }}
              />
            </div>

            {/* Jump Button */}
            <button
              onClick={triggerJump}
              className="px-6 py-4 rounded-3xl bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-slate-950 font-black text-sm tracking-widest shadow-2xl active:scale-95 transition-all cursor-pointer border-2 border-white/50"
            >
              JUMP 🚀
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. DETAINED OVERLAY (Police Van Mini-Scene)         */}
      {/* ==================================================== */}
      {gameState === 'detained' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-md text-center">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border-2 border-blue-500 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 border-2 border-blue-500 text-3xl flex items-center justify-center mx-auto animate-bounce">
              🚐
            </div>
            <h2 className="text-3xl font-black text-blue-400 font-display uppercase tracking-wider">
              DETAINED!
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              Dilli Police ki free van seva mein aapka swaagat hain.<br />
              Tea & biscuits pending. Releasing in:
            </p>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-blue-600 text-white font-black text-4xl flex items-center justify-center mx-auto shadow-xl border-4 border-white animate-pulse">
              {detainedCountdown}
            </div>
            <p className="text-[11px] font-mono text-gray-400">
              Hold tight! You will be released back on the road automatically.
            </p>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. GAME OVER OVERLAY                                */}
      {/* ==================================================== */}
      {gameState === 'gameover' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md text-center">
          <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-red-500/50 shadow-2xl space-y-4">
            <span className="text-4xl">🤕</span>
            <h2 className="text-3xl font-black text-red-500 font-display tracking-tight uppercase">
              GAME OVER!
            </h2>
            <p className="text-xs text-gray-300 font-medium">
              Lathi charge aur barricade ne rokk diya! Jantar Mantar tak nahi pahuch paaye.
            </p>

            <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div className="text-left">
                <span className="text-gray-500 block">DISTANCE:</span>
                <span className="text-white font-bold">{distance}m / 1000m</span>
              </div>
              <div className="text-left">
                <span className="text-gray-500 block">SCORE:</span>
                <span className="text-yellow-400 font-bold">{score} pts</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  startMatch(selectedChar);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-xs tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                TRY AGAIN
              </button>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setGameState('select');
                }}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold text-xs transition-all cursor-pointer"
              >
                CHANGE CHARACTER
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. VICTORY OVERLAY (Jantar Mantar Reached!)         */}
      {/* ==================================================== */}
      {gameState === 'victory' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-slate-950/95 backdrop-blur-md text-center">
          <div className="max-w-lg w-full p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-emerald-500/60 shadow-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>PAHUCH GAYE JANTAR MANTAR! 🇮🇳</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white font-display uppercase tracking-tight">
              PROTEST VICTORY!
            </h2>
            <p className="text-xs text-gray-300">
              Aapne saare vans, barricades aur cops ko dodge karke demand poori karwa di!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-900">
                <span className="text-gray-500 block text-[10px]">TIME</span>
                <span className="text-cyan-400 font-bold">{elapsedTime.toFixed(1)}s</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900">
                <span className="text-gray-500 block text-[10px]">VANS DODGED</span>
                <span className="text-red-400 font-bold">{detainedVansCount}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900">
                <span className="text-gray-500 block text-[10px]">CHAI DRANK</span>
                <span className="text-amber-400 font-bold">{chaiCollected} ☕</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900">
                <span className="text-gray-500 block text-[10px]">FINAL SCORE</span>
                <span className="text-yellow-400 font-bold">{score}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-mono text-yellow-300 bg-yellow-400/10 p-2 rounded-xl border border-yellow-400/20">
              <Award className="w-4 h-4" />
              <span>REWARDS EARNED: +500 XP · +350 VIBE COINS</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  startMatch(selectedChar);
                }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-black text-xs tracking-wider uppercase transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                PLAY AGAIN
              </button>
              <button
                onClick={shareProtestRun}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>SHARE SCORE</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default GenZProtestRunCanvas;
