'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAppStore } from '@/store/useAppStore';
import { soundFx } from '@/lib/audio';
import {
  Volume2,
  VolumeX,
  Trophy,
  Share2,
  Zap,
  ArrowLeft,
  Flame,
  Award,
  ShieldAlert,
  Sparkles
} from 'lucide-react';

// =========================================================================
// 1. CHARACTER DEFINITIONS
// =========================================================================
export interface ProtesterChar {
  id: string;
  name: string;
  title: string;
  tagline: string;
  avatarEmoji: string;
  badge: string;
  speed: number;       // forward speed multiplier
  agility: number;     // lane switch agility
  health: number;      // maximum health
  special: string;
  callout: string;
  colors: {
    skin: string;
    shirt: string;
    pants: string;
    accent: string;
    hair: string;
    shoes: string;
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
      pants: '#334155',
      accent: '#a855f7',
      hair: '#7c3aed',
      shoes: '#ffffff'
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
      hair: '#111827',
      shoes: '#78350f'
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
      hair: '#0f172a',
      shoes: '#1e293b'
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
      shirt: '#f1f5f9',
      pants: '#0f172a',
      accent: '#eab308',
      hair: '#ca8a04',
      shoes: '#f8fafc'
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
      hair: '#18181b',
      shoes: '#0f172a'
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
      hair: '#94a3b8',
      shoes: '#451a03'
    }
  }
];

// =========================================================================
// 2. ADVANCED PROCEDURAL AUDIO ENGINE (Sirens, Crowd, Van Engine, SFX)
// =========================================================================
class RealisticProtestAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private bgmInterval: number | null = null;
  private beatStep: number = 0;

  // Spatial siren nodes
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenLfo: OscillatorNode | null = null;
  private sirenActive: boolean = false;

  // Van engine rumble
  private engineSource: AudioBufferSourceNode | null = null;
  private engineGain: GainNode | null = null;

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
      this.stopContinuousSiren();
    } else {
      this.startBGM();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Realistic Jump & Land
  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);
    gain.gain.setValueAtTime(0.24, now);
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
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.04);
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Police Whistle with authentic dual-tone trill
  public playWhistle() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const o1 = this.ctx.createOscillator();
    const o2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    o1.type = 'sawtooth';
    o2.type = 'sine';
    o1.frequency.setValueAtTime(2600, now);
    o2.frequency.setValueAtTime(2850, now);
    o1.frequency.setValueAtTime(2450, now + 0.08);
    o2.frequency.setValueAtTime(2700, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    o1.connect(gain);
    o2.connect(gain);
    gain.connect(this.ctx.destination);

    o1.start(now);
    o2.start(now);
    o1.stop(now + 0.25);
    o2.stop(now + 0.25);
  }

  // Spatial Continuous Police Van Siren
  public updateSpatialSiren(closestVanDistance: number) {
    if (this.isMuted || closestVanDistance > 75) {
      if (this.sirenActive) this.stopContinuousSiren();
      return;
    }

    this.initCtx();
    if (!this.ctx) return;

    if (!this.sirenActive) {
      // Start siren oscillators
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();
      this.sirenLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.setValueAtTime(750, this.ctx.currentTime);

      // LFO frequency wail between 650Hz and 980Hz
      this.sirenLfo.type = 'sine';
      this.sirenLfo.frequency.setValueAtTime(1.8, this.ctx.currentTime); // wail cycles per sec
      lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);

      this.sirenLfo.connect(lfoGain);
      lfoGain.connect(this.sirenOsc.frequency);

      this.sirenGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);

      this.sirenOsc.start();
      this.sirenLfo.start();
      this.sirenActive = true;
    }

    // Distance attenuation volume (closer = much louder)
    if (this.sirenGain && this.ctx) {
      const norm = Math.max(0, 1 - closestVanDistance / 75);
      const targetGain = norm * norm * 0.22;
      this.sirenGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    }
  }

  public stopContinuousSiren() {
    if (!this.sirenActive) return;
    try {
      if (this.sirenOsc) {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      }
      if (this.sirenLfo) {
        this.sirenLfo.stop();
        this.sirenLfo.disconnect();
      }
      if (this.sirenGain) {
        this.sirenGain.disconnect();
      }
    } catch {}
    this.sirenOsc = null;
    this.sirenLfo = null;
    this.sirenGain = null;
    this.sirenActive = false;
  }

  // Van Brake Screech when police intercept
  public playTireScreech() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1850, now);
    osc.frequency.linearRampToValueAtTime(1200, now + 0.35);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }

  // Lathi stick hit / barricade crash
  public playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);
    gain.gain.setValueAtTime(0.42, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
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

  // Upbeat Bhangra / Dhol Protest March Beat
  public startBGM() {
    if (this.isMuted || this.bgmInterval) return;
    this.initCtx();
    this.beatStep = 0;
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy Dhol Bass Kick on step 0 and 2
      if (this.beatStep % 2 === 0) {
        const kick = this.ctx.createOscillator();
        const kGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(115, now);
        kick.frequency.exponentialRampToValueAtTime(42, now + 0.13);
        kGain.gain.setValueAtTime(0.22, now);
        kGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        kick.connect(kGain);
        kGain.connect(this.ctx.destination);
        kick.start(now);
        kick.stop(now + 0.15);
      }

      // Snappy Hi-Hat / Dholki Slap
      const hat = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();
      hat.type = 'triangle';
      hat.frequency.setValueAtTime(this.beatStep % 4 === 1 ? 850 : 1300, now);
      hGain.gain.setValueAtTime(0.05, now);
      hGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      hat.connect(hGain);
      hGain.connect(this.ctx.destination);
      hat.start(now);
      hat.stop(now + 0.05);

      this.beatStep = (this.beatStep + 1) % 8;
    }, 240); // 125 BPM
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

const audio = new RealisticProtestAudio();

// =========================================================================
// 3. 3D TYPES & SIMULATION ENTITIES
// =========================================================================
interface Camera3D {
  x: number;
  d: number;
  h: number;
  pitch: number;
}

interface Obstacle3D {
  id: number;
  type: 'van' | 'barricade' | 'cop' | 'puddle' | 'chai' | 'megaphone' | 'coin';
  x: number;
  d: number;
  h: number;
  w: number;
  length: number;
  height3D: number;
  active: boolean;
  state?: 'patrol' | 'chase' | 'return';
  dir?: number;
  patrolMin?: number;
  patrolMax?: number;
  speed?: number;
  sirenPhase?: number;
  headlightGlow?: number;
  label?: string;
}

interface Building3D {
  side: 'left' | 'right';
  x: number;
  d: number;
  w: number;
  depth: number;
  height: number;
  title: string;
  sub: string;
  wallCol: string;
  awningCol: string;
  signCol: string;
}

interface Tree3D {
  side: 'left' | 'right';
  x: number;
  d: number;
  trunkH: number;
  canopyR: number;
}

interface Lamppost3D {
  side: 'left' | 'right';
  x: number;
  d: number;
  h: number;
}

interface BannerGantry3D {
  d: number;
  bannerText: string;
  bannerColor: string;
}

interface ComicBubble3D {
  id: number;
  text: string;
  x: number;
  d: number;
  h: number;
  color: string;
  life: number;
  maxLife: number;
}

interface Particle3D {
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

// =========================================================================
// 4. MAIN REACT GAME COMPONENT
// =========================================================================
export function GenZProtestRunCanvas() {
  const { user, setUser } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Game UI States
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

  // Virtual Joystick State
  const [touchActive, setTouchActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchStickRef = useRef<{ active: boolean; startX: number; startY: number; dx: number; dy: number }>({
    active: false,
    startX: 0,
    startY: 0,
    dx: 0,
    dy: 0
  });

  // Desktop Keyboard Input State
  const keysRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean; jump: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false
  });

  // Master Engine Simulation Ref
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
      footstepTimer: number;
    };
    camera: Camera3D;
    obstacles: Obstacle3D[];
    buildings: Building3D[];
    trees: Tree3D[];
    lampposts: Lamppost3D[];
    gantries: BannerGantry3D[];
    bubbles: ComicBubble3D[];
    particles: Particle3D[];
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
      d: 4,
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
      isJumping: false,
      footstepTimer: 0
    },
    camera: {
      x: 0,
      d: -4,
      h: 5.4,
      pitch: 0.38
    },
    obstacles: [],
    buildings: [],
    trees: [],
    lampposts: [],
    gantries: [],
    bubbles: [],
    particles: [],
    nextObstacleId: 1,
    nextBubbleId: 1,
    detainedTimer: 0,
    totalDistanceTarget: 1000,
    lastTime: 0,
    nextSpawnDistance: 32
  });

  // Initialize 3D City Environment (Delhi buildings, trees, streetlamps, gantries)
  const init3DEnvironment = useCallback(() => {
    const buildings: Building3D[] = [];
    const trees: Tree3D[] = [];
    const lampposts: Lamppost3D[] = [];

    const shopCatalog = [
      { title: 'SHARMA XEROX & STATIONERY', sub: 'STUDENT NOTES 50P · LAW BOOKS', wall: '#334155', awning: '#dc2626', sign: '#fef08a' },
      { title: 'KADAK CHAI KI TAPRI', sub: 'MASALA CHAI 10₹ · SAMOSA 15₹', wall: '#475569', awning: '#d97706', sign: '#fed7aa' },
      { title: 'CONSTITUTION LAW CORNER', sub: 'RIGHTS & CITIZEN FORUM', wall: '#1e293b', awning: '#2563eb', sign: '#bfdbfe' },
      { title: 'DELHI SAMOSA & JALEBI', sub: 'DESI GHEE REFRESHMENTS', wall: '#3f3f46', awning: '#ea580c', sign: '#ffedd5' },
      { title: 'VIRAL REELS & PODCAST LAB', sub: 'LIVE STREAMING · FREE WIFI', wall: '#2e1065', awning: '#9333ea', sign: '#f3e8ff' },
      { title: 'DELHI POLICE OUTPOST', sub: 'BEAT BOX · TRAFFIC CHECK', wall: '#172554', awning: '#1e40af', sign: '#dbeafe' }
    ];

    // Left & Right buildings with true 3D blocks
    for (let d = 30; d < 1000; d += 48) {
      const leftTheme = shopCatalog[Math.floor(Math.random() * shopCatalog.length)];
      buildings.push({
        side: 'left',
        x: -11.5,
        d: d + (Math.random() * 6 - 3),
        w: 6.5,
        depth: 26,
        height: 6.8 + Math.random() * 3.5,
        title: leftTheme.title,
        sub: leftTheme.sub,
        wallCol: leftTheme.wall,
        awningCol: leftTheme.awning,
        signCol: leftTheme.sign
      });

      const rightTheme = shopCatalog[Math.floor(Math.random() * shopCatalog.length)];
      buildings.push({
        side: 'right',
        x: 11.5,
        d: d + 22 + (Math.random() * 6 - 3),
        w: 6.5,
        depth: 26,
        height: 6.8 + Math.random() * 3.5,
        title: rightTheme.title,
        sub: rightTheme.sub,
        wallCol: rightTheme.wall,
        awningCol: rightTheme.awning,
        signCol: rightTheme.sign
      });

      // 3D Trees on sidewalk
      trees.push({
        side: 'left',
        x: -7.8,
        d: d + 12,
        trunkH: 2.8,
        canopyR: 2.4
      });
      trees.push({
        side: 'right',
        x: 7.8,
        d: d + 34,
        trunkH: 2.8,
        canopyR: 2.4
      });

      // 3D Street Lampposts
      lampposts.push({
        side: 'left',
        x: -7.2,
        d: d + 24,
        h: 4.8
      });
      lampposts.push({
        side: 'right',
        x: 7.2,
        d: d + 24,
        h: 4.8
      });
    }

    // Footbridges & Overhead Gantries
    const gantries: BannerGantry3D[] = [
      { d: 150, bannerText: '🚫 NO PAPER LEAKS — RE-EXAM DILWAO! 🚫', bannerColor: '#dc2626' },
      { d: 340, bannerText: '🔥 VIBE ARENA MARCH TO JANTAR MANTAR 🔥', bannerColor: '#7c3aed' },
      { d: 520, bannerText: '📢 INQUILAB ZINDABAD — STUDENTS UNITED! 📢', bannerColor: '#0284c7' },
      { d: 720, bannerText: '⚖️ JUSTICE FOR BACKBENCHERS · NO CORRUPTION ⚖️', bannerColor: '#ca8a04' },
      { d: 910, bannerText: '🇮🇳 JANTAR MANTAR CAMP AHEAD (100M) 🇮🇳', bannerColor: '#16a34a' }
    ];

    gameRef.current.buildings = buildings;
    gameRef.current.trees = trees;
    gameRef.current.lampposts = lampposts;
    gameRef.current.gantries = gantries;
  }, []);

  // Spawn Dynamic Obstacles & 3D Police Vans
  const spawnObstaclesAhead = useCallback((currentDist: number) => {
    const g = gameRef.current;
    if (currentDist + 150 < g.nextSpawnDistance || g.nextSpawnDistance >= g.totalDistanceTarget - 30) return;

    const d = g.nextSpawnDistance;
    const lanePositions = [-4.6, -1.8, 1.8, 4.6];
    const roll = Math.random();

    if (roll < 0.36) {
      // 3D Delhi Police Van with Cop inside & rooftop siren!
      const lane = lanePositions[Math.floor(Math.random() * lanePositions.length)];
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'van',
        x: lane,
        d: d,
        h: 0,
        w: 2.8,
        length: 5.4,
        height3D: 2.6,
        active: true,
        speed: 2.8,
        sirenPhase: 0,
        headlightGlow: 1.0,
        label: 'POLICE'
      });
    } else if (roll < 0.64) {
      // 3D Yellow/Black Police Barricade (Jumpable!)
      const laneA = lanePositions[Math.floor(Math.random() * 2)];
      const laneB = lanePositions[2 + Math.floor(Math.random() * 2)];
      [laneA, laneB].forEach((x) => {
        g.obstacles.push({
          id: g.nextObstacleId++,
          type: 'barricade',
          x: x,
          d: d,
          h: 0,
          w: 2.4,
          length: 0.9,
          height3D: 1.4,
          active: true,
          label: 'POLICE'
        });
      });
    } else if (roll < 0.84) {
      // 3D Khaki Lathi Cop Squad
      const startX = (Math.random() < 0.5 ? -1 : 1) * 3.6;
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'cop',
        x: startX,
        d: d,
        h: 0,
        w: 1.4,
        length: 1.4,
        height3D: 2.2,
        active: true,
        state: 'patrol',
        dir: startX > 0 ? -1 : 1,
        patrolMin: -4.8,
        patrolMax: 4.8,
        speed: 2.8
      });
    } else {
      // Road Puddle / Pothole
      const lane = lanePositions[Math.floor(Math.random() * lanePositions.length)];
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'puddle',
        x: lane,
        d: d,
        h: 0,
        w: 2.8,
        length: 2.8,
        height3D: 0.1,
        active: true
      });
    }

    // Collectibles: Chai, Megaphone, Meme Coins
    const itemRoll = Math.random();
    const freeLanes = lanePositions.filter((lx) => !g.obstacles.some((o) => o.d === d && Math.abs(o.x - lx) < 2.2));
    const targetLane = freeLanes.length > 0 ? freeLanes[Math.floor(Math.random() * freeLanes.length)] : 0;

    if (itemRoll < 0.35) {
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'chai',
        x: targetLane,
        d: d + 14,
        h: 0.5,
        w: 1.2,
        length: 1.2,
        height3D: 1.0,
        active: true
      });
    } else if (itemRoll < 0.6) {
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'megaphone',
        x: targetLane,
        d: d + 16,
        h: 0.6,
        w: 1.2,
        length: 1.2,
        height3D: 1.0,
        active: true
      });
    } else {
      g.obstacles.push({
        id: g.nextObstacleId++,
        type: 'coin',
        x: targetLane,
        d: d + 12,
        h: 0.5,
        w: 1.0,
        length: 1.0,
        height3D: 0.8,
        active: true
      });
    }

    g.nextSpawnDistance += 30 + Math.random() * 16;
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
        vh: Math.random() * 4 + 1.2,
        color,
        size: Math.random() * 0.22 + 0.16,
        life: 0,
        maxLife: Math.random() * 0.45 + 0.35
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
      vd: 8.5 * char.speed,
      vh: 0,
      scaleX: 1,
      scaleY: 1,
      tilt: 0,
      walkPhase: 0,
      invincibleTimer: 0,
      speedBoostTimer: 0,
      stumbleTimer: 0,
      isJumping: false,
      footstepTimer: 0
    };
    g.camera = {
      x: 0,
      d: -4,
      h: 5.4,
      pitch: 0.38
    };
    g.obstacles = [];
    g.bubbles = [];
    g.particles = [];
    g.nextSpawnDistance = 35;
    g.lastTime = performance.now();

    init3DEnvironment();
    setGameState('play');
    audio.startBGM();

    addComicBubble(char.callout, 0, 8, 2.8, '#4ade80');
    soundFx.playLevelUp();
  }, [init3DEnvironment, addComicBubble]);

  // Jump Action Trigger
  const triggerJump = useCallback(() => {
    const p = gameRef.current.player;
    if (p.h === 0 && !p.isJumping) {
      p.isJumping = true;
      p.vh = 9.2; // upward velocity
      p.scaleX = 0.72;
      p.scaleY = 1.38;
      audio.playJump();
      addParticles(p.x, p.d, 0.1, 9, '#e2e8f0');
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

  // Main 3D Canvas Render Loop
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

    // =====================================================================
    // 3D PERSPECTIVE PROJECTION SYSTEM (Accurate Camera & Focal Horizon)
    // =====================================================================
    const project = (
      wx: number,
      wd: number,
      wh: number,
      W: number,
      H: number,
      cam: Camera3D
    ) => {
      const cosP = Math.cos(cam.pitch);
      const sinP = Math.sin(cam.pitch);
      const focal = Math.min(H * 0.98, W * 0.88);

      const mx = wx - cam.x;
      const td = wd - cam.d;
      const oh = wh - cam.h;

      // Depth along camera ray
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

    // Helper: Draw 3D Polygonal Box with Perspective Shading
    const drawBox3D = (
      x: number,
      d: number,
      h: number,
      w: number,
      len: number,
      height: number,
      topColor: string,
      frontColor: string,
      sideColor: string
    ) => {
      const x1 = x - w / 2;
      const x2 = x + w / 2;
      const d1 = d - len / 2;
      const d2 = d + len / 2;
      const h1 = h;
      const h2 = h + height;

      const W = canvas.width;
      const H = canvas.height;

      // Project 8 corners
      const p1 = project(x1, d1, h1, W, H, g.camera); // bottom-front-left
      const p2 = project(x2, d1, h1, W, H, g.camera); // bottom-front-right
      const p3 = project(x2, d1, h2, W, H, g.camera); // top-front-right
      const p4 = project(x1, d1, h2, W, H, g.camera); // top-front-left

      const p5 = project(x1, d2, h1, W, H, g.camera); // bottom-back-left
      const p6 = project(x2, d2, h1, W, H, g.camera); // bottom-back-right
      const p7 = project(x2, d2, h2, W, H, g.camera); // top-back-right
      const p8 = project(x1, d2, h2, W, H, g.camera); // top-back-left

      if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6 || !p7 || !p8) return;

      // Front Face
      if (p1.y > p4.y) {
        ctx.fillStyle = frontColor;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Top Face
      if (p4.y > p8.y) {
        ctx.fillStyle = topColor;
        ctx.beginPath();
        ctx.moveTo(p4.x, p4.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p7.x, p7.y);
        ctx.lineTo(p8.x, p8.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.stroke();
      }

      // Left Face
      if (g.camera.x < x1) {
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.lineTo(p8.x, p8.y);
        ctx.lineTo(p5.x, p5.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.stroke();
      }
      // Right Face
      else if (g.camera.x > x2) {
        ctx.fillStyle = sideColor;
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p7.x, p7.y);
        ctx.lineTo(p6.x, p6.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.stroke();
      }
    };

    const g = gameRef.current;

    // =====================================================================
    // ANIMATION & PHYSICS SIMULATION
    // =====================================================================
    const renderFrame = (now: number) => {
      animId = requestAnimationFrame(renderFrame);

      const dt = Math.min((now - (g.lastTime || now)) / 1000, 0.05);
      g.lastTime = now;

      const W = canvas.width;
      const H = canvas.height;

      let closestVanDist = 999;

      if (gameState === 'play' && g.running) {
        setElapsedTime((prev) => prev + dt);

        const p = g.player;

        if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
        if (p.speedBoostTimer > 0) p.speedBoostTimer -= dt;
        if (p.stumbleTimer > 0) p.stumbleTimer -= dt;

        // Player Controls (Keyboard & Virtual Joystick)
        let inputX = 0;
        let inputZ = 1.0;

        if (keysRef.current.left) inputX -= 1;
        if (keysRef.current.right) inputX += 1;
        if (keysRef.current.up) inputZ += 0.45;
        if (keysRef.current.down) inputZ -= 0.55;

        if (touchStickRef.current.active) {
          inputX += touchStickRef.current.dx * 1.3;
          inputZ += -touchStickRef.current.dy * 0.7;
        }

        // Forward Velocity
        const baseSpeed = 16 * selectedChar.speed;
        const targetVd = Math.max(5, (baseSpeed * inputZ) * (p.speedBoostTimer > 0 ? 1.45 : 1) * (p.stumbleTimer > 0 ? 0.45 : 1));
        p.vd += (targetVd - p.vd) * Math.min(1, dt * 7);

        // Lateral Steering Velocity
        const targetVx = inputX * 13.5 * selectedChar.agility;
        p.vx += (targetVx - p.vx) * Math.min(1, dt * 9);

        p.d += p.vd * dt;
        p.x = Math.max(-6.2, Math.min(6.2, p.x + p.vx * dt));

        // Jump & Gravity
        if (p.isJumping || p.h > 0) {
          p.vh -= 26 * dt; // gravity
          p.h += p.vh * dt;
          if (p.h <= 0) {
            p.h = 0;
            p.vh = 0;
            p.isJumping = false;
            p.scaleX = 1.38;
            p.scaleY = 0.72;
            audio.playLand();
            addParticles(p.x, p.d, 0.1, 8, '#cbd5e1');
          }
        }

        // Footstep audio synchronization
        p.footstepTimer += dt * p.vd;
        if (p.footstepTimer > 3.2 && p.h === 0) {
          p.footstepTimer = 0;
          audio.playFootstep();
        }

        p.scaleX += (1 - p.scaleX) * Math.min(1, dt * 12);
        p.scaleY += (1 - p.scaleY) * Math.min(1, dt * 12);
        p.tilt += ((p.vx / 13.5) - p.tilt) * Math.min(1, dt * 10);
        p.walkPhase += dt * (p.vd * 1.5);

        setDistance(Math.min(1000, Math.floor(p.d)));
        setScore((prev) => prev + Math.round(p.vd * dt * 10));

        // Check Victory at 1000m
        if (p.d >= g.totalDistanceTarget) {
          g.running = false;
          setGameState('victory');
          audio.stopBGM();
          audio.stopContinuousSiren();
          audio.playVictory();
          confetti({ particleCount: 130, spread: 85, origin: { y: 0.6 } });

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

        spawnObstaclesAhead(p.d);

        // Camera smoothly chasing player
        const targetCamX = p.x * 0.55;
        const targetCamD = p.d - 8.2;
        const targetCamH = 5.4 + p.h * 0.25;
        g.camera.x += (targetCamX - g.camera.x) * Math.min(1, dt * 8);
        g.camera.d += (targetCamD - g.camera.d) * Math.min(1, dt * 8);
        g.camera.h += (targetCamH - g.camera.h) * Math.min(1, dt * 8);

        // Update Obstacles & AI
        for (const obs of g.obstacles) {
          if (!obs.active) continue;

          // 3D Police Van Oncoming Drive & Siren
          if (obs.type === 'van') {
            obs.sirenPhase = ((obs.sirenPhase || 0) + dt * 12) % 2;
            obs.d -= obs.speed! * dt;

            // Compute distance from player for spatial siren
            const distFromPlayer = obs.d - p.d;
            if (distFromPlayer > 0 && distFromPlayer < closestVanDist) {
              closestVanDist = distFromPlayer;
            }
          }

          // 3D Lathi Cop Patrol & Pursuit
          if (obs.type === 'cop') {
            const distToPlayer = Math.hypot(p.x - obs.x, p.d - obs.d);

            if (distToPlayer < 9.5 && p.invincibleTimer <= 0) {
              obs.state = 'chase';
              const angle = Math.atan2(p.d - obs.d, p.x - obs.x);
              obs.x += Math.cos(angle) * obs.speed! * 1.35 * dt;
              obs.d += Math.sin(angle) * obs.speed! * 0.7 * dt;

              if (Math.random() < 0.015) {
                audio.playWhistle();
                addComicBubble(Math.random() < 0.5 ? 'OYE! RUK!' : 'PAKDO!', obs.x, obs.d, 2.6, '#ef4444');
              }
            } else {
              obs.state = 'patrol';
              obs.x += (obs.dir || 1) * obs.speed! * dt;
              if (obs.x >= (obs.patrolMax || 4.8)) {
                obs.x = obs.patrolMax || 4.8;
                obs.dir = -1;
              } else if (obs.x <= (obs.patrolMin || -4.8)) {
                obs.x = obs.patrolMin || -4.8;
                obs.dir = 1;
              }
            }
          }

          // =================================================================
          // 3D COLLISION DETECTION
          // =================================================================
          const dx = Math.abs(p.x - obs.x);
          const dd = Math.abs(p.d - obs.d);

          if (dx < (obs.w * 0.7) && dd < (obs.length * 0.8)) {
            // Police Van Interception -> 5s Van Seva
            if (obs.type === 'van') {
              if (p.invincibleTimer <= 0) {
                obs.active = false;
                audio.playTireScreech();
                setDetainedVansCount((c) => c + 1);
                setDetainedCountdown(5);
                setGameState('detained');
                g.detainedTimer = 5.0;
                addComicBubble('POLICE VAN INTERCEPTION!', p.x, p.d, 3.2, '#38bdf8');
                return;
              }
            }

            // Yellow Police Barricade -> Cleared if Jumping!
            else if (obs.type === 'barricade') {
              if (p.h > 1.05) {
                if (obs.active) {
                  obs.active = false;
                  addComicBubble('WHOOSH! JUMPED BARRICADE!', p.x, p.d, 2.8, '#4ade80');
                  setScore((s) => s + 150);
                }
              } else if (p.invincibleTimer <= 0) {
                obs.active = false;
                audio.playHit();
                addParticles(p.x, p.d, 1.0, 10, '#f59e0b');
                p.stumbleTimer = 0.85;
                p.vd = 2;
                setHealth((h) => {
                  const nextH = Math.max(0, h - 25);
                  if (nextH <= 0) triggerGameOver('Barricade se takkar ho gayi! Exam hall miss ho gaya.');
                  return nextH;
                });
                addComicBubble('OUCH! BARRICADE!', p.x, p.d, 2.5, '#f59e0b');
              }
            }

            // Lathi Police Strike
            else if (obs.type === 'cop') {
              if (p.invincibleTimer <= 0) {
                obs.active = false;
                audio.playHit();
                addParticles(p.x, p.d, 1.2, 12, '#ef4444');
                p.stumbleTimer = 0.9;
                setHealth((h) => {
                  const nextH = Math.max(0, h - 40);
                  if (nextH <= 0) triggerGameOver('Lathi charge mein pack ho gaye! Health zero.');
                  return nextH;
                });
                addComicBubble('LATHI CHARGE! −40%', p.x, p.d, 2.5, '#ef4444');
              }
            }

            // Puddle Skid
            else if (obs.type === 'puddle') {
              if (selectedChar.id !== 'kabir') {
                obs.active = false;
                p.stumbleTimer = 0.6;
                addParticles(p.x, p.d, 0.2, 8, '#38bdf8');
                addComicBubble('SLIP! SLIPPERY ROAD!', p.x, p.d, 2.0, '#38bdf8');
              }
            }

            // Chai Health Restore
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

            // Megaphone Slogan Speed Boost
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

            // Meme Coin
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

        g.bubbles.forEach((b) => {
          b.h += dt * 0.8;
          b.life += dt;
        });
        g.bubbles = g.bubbles.filter((b) => b.life < b.maxLife);

        // Update Spatial Doppler Siren
        audio.updateSpatialSiren(closestVanDist);
      }

      // Detained Countdown Timer
      if (gameState === 'detained') {
        g.detainedTimer -= dt;
        setDetainedCountdown(Math.ceil(Math.max(0, g.detainedTimer)));
        if (g.detainedTimer <= 0) {
          setGameState('play');
          g.player.invincibleTimer = 3.0;
          addComicBubble('RELEASED FROM POLICE VAN!', g.player.x, g.player.d, 3.2, '#4ade80');
        }
      }

      // =====================================================================
      // COMPLETE 3D SCENE RENDERING PIPELINE
      // =====================================================================
      ctx.clearRect(0, 0, W, H);

      // 1. Sky & Atmosphere (Delhi Twilight smog gradient)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.52);
      skyGrad.addColorStop(0, '#11091a');
      skyGrad.addColorStop(0.35, '#3b1227');
      skyGrad.addColorStop(0.75, '#ea580c');
      skyGrad.addColorStop(1, '#ffedd5');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H * 0.55);

      // 2. Distant Horizon: Delhi Skyline & Parliament / India Gate
      const horizonY = H * 0.52;
      ctx.fillStyle = '#1e1b2e';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      for (let sx = 0; sx < W; sx += 40) {
        const bh = Math.sin(sx * 0.05) * 14 + Math.cos(sx * 0.02) * 9 + 16;
        ctx.lineTo(sx, horizonY - bh);
        ctx.lineTo(sx + 35, horizonY - bh);
      }
      ctx.lineTo(W, horizonY);
      ctx.closePath();
      ctx.fill();

      // Parliament Dome
      const domeX = W / 2;
      ctx.fillStyle = '#2d1f3d';
      ctx.beginPath();
      ctx.arc(domeX, horizonY - 16, 32, Math.PI, 0, false);
      ctx.lineTo(domeX + 32, horizonY);
      ctx.lineTo(domeX - 32, horizonY);
      ctx.closePath();
      ctx.fill();

      // 3. Ground Terrain & Sidewalk Floor
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, H);
      groundGrad.addColorStop(0, '#44403c');
      groundGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, W, H - horizonY);

      // 4. 4-Lane Highway Surface with Depth
      const roadHalfWidth = 7.2;
      const roadNearLeft = project(-roadHalfWidth, g.camera.d + 1.5, 0, W, H, g.camera);
      const roadNearRight = project(roadHalfWidth, g.camera.d + 1.5, 0, W, H, g.camera);
      const roadFarLeft = project(-roadHalfWidth, g.camera.d + 180, 0, W, H, g.camera);
      const roadFarRight = project(roadHalfWidth, g.camera.d + 180, 0, W, H, g.camera);

      if (roadNearLeft && roadNearRight && roadFarLeft && roadFarRight) {
        // Road Asphalt
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(roadNearLeft.x, roadNearLeft.y);
        ctx.lineTo(roadFarLeft.x, roadFarLeft.y);
        ctx.lineTo(roadFarRight.x, roadFarRight.y);
        ctx.lineTo(roadNearRight.x, roadNearRight.y);
        ctx.closePath();
        ctx.fill();

        // 3D Elevated Sidewalk Curb Step (Yellow & Black Striped Stone Blocks)
        const curbHeight = 0.35;
        const curbStepDist = 6;
        const curbStart = Math.floor(g.camera.d / curbStepDist) * curbStepDist;

        for (let cd = curbStart; cd < g.camera.d + 150; cd += curbStepDist) {
          const isYellow = Math.floor(cd / curbStepDist) % 2 === 0;
          ctx.fillStyle = isYellow ? '#eab308' : '#18181b';

          // Left curb face
          const cl1 = project(-roadHalfWidth, cd, 0, W, H, g.camera);
          const cl2 = project(-roadHalfWidth, cd + curbStepDist, 0, W, H, g.camera);
          const cl3 = project(-roadHalfWidth - 0.45, cd + curbStepDist, curbHeight, W, H, g.camera);
          const cl4 = project(-roadHalfWidth - 0.45, cd, curbHeight, W, H, g.camera);

          if (cl1 && cl2 && cl3 && cl4) {
            ctx.beginPath();
            ctx.moveTo(cl1.x, cl1.y);
            ctx.lineTo(cl2.x, cl2.y);
            ctx.lineTo(cl3.x, cl3.y);
            ctx.lineTo(cl4.x, cl4.y);
            ctx.closePath();
            ctx.fill();
          }

          // Right curb face
          const cr1 = project(roadHalfWidth, cd, 0, W, H, g.camera);
          const cr2 = project(roadHalfWidth, cd + curbStepDist, 0, W, H, g.camera);
          const cr3 = project(roadHalfWidth + 0.45, cd + curbStepDist, curbHeight, W, H, g.camera);
          const cr4 = project(roadHalfWidth + 0.45, cd, curbHeight, W, H, g.camera);

          if (cr1 && cr2 && cr3 && cr4) {
            ctx.beginPath();
            ctx.moveTo(cr1.x, cr1.y);
            ctx.lineTo(cr2.x, cr2.y);
            ctx.lineTo(cr3.x, cr3.y);
            ctx.lineTo(cr4.x, cr4.y);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Dashed White Lane Dividers
        const laneXValues = [-3.6, 0, 3.6];
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = Math.max(2, roadNearLeft.s * 0.08);

        for (const lx of laneXValues) {
          ctx.beginPath();
          const stepDist = 8;
          const startDist = Math.floor(g.camera.d / stepDist) * stepDist;
          for (let segD = startDist; segD < g.camera.d + 160; segD += stepDist) {
            const p1 = project(lx, segD, 0, W, H, g.camera);
            const p2 = project(lx, segD + 4.8, 0, W, H, g.camera);
            if (p1 && p2) {
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
            }
          }
          ctx.stroke();
        }
      }

      // =====================================================================
      // 3D DRAW LIST WITH BACK-TO-FRONT DEPTH SORTING
      // =====================================================================
      interface Renderable3D {
        depth: number;
        draw: () => void;
      }

      const drawList: Renderable3D[] = [];

      // 5. Draw 3D Buildings with Depth, Awnings, Windows & Signboards
      for (const bld of g.buildings) {
        if (bld.d < g.camera.d + 1 || bld.d > g.camera.d + 180) continue;
        const pt = project(bld.x, bld.d, 0, W, H, g.camera);
        if (!pt) continue;

        drawList.push({
          depth: pt.depth,
          draw: () => {
            // Main 3D Building Box
            drawBox3D(
              bld.x,
              bld.d,
              0,
              bld.w,
              bld.depth,
              bld.height,
              '#1e293b',       // roof
              bld.wallCol,     // front
              '#0f172a'        // side
            );

            // 3D Striped Awning & Signboard
            const signPt = project(bld.x, bld.d - bld.depth * 0.45, bld.height * 0.55, W, H, g.camera);
            if (signPt && signPt.s > 8) {
              const sw = signPt.s * 4.2;
              const sh = signPt.s * 1.6;

              ctx.fillStyle = bld.signCol;
              ctx.fillRect(signPt.x - sw / 2, signPt.y - sh / 2, sw, sh);
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = Math.max(1, signPt.s * 0.05);
              ctx.strokeRect(signPt.x - sw / 2, signPt.y - sh / 2, sw, sh);

              ctx.fillStyle = '#0f172a';
              ctx.font = `bold ${Math.max(7, Math.round(signPt.s * 0.26))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(bld.title, signPt.x, signPt.y - sh * 0.08);
              ctx.font = `bold ${Math.max(6, Math.round(signPt.s * 0.16))}px sans-serif`;
              ctx.fillText(bld.sub, signPt.x, signPt.y + sh * 0.28);
            }
          }
        });
      }

      // 6. Draw 3D Trees on Sidewalks
      for (const tree of g.trees) {
        if (tree.d < g.camera.d + 1 || tree.d > g.camera.d + 180) continue;
        const pt = project(tree.x, tree.d, 0, W, H, g.camera);
        if (!pt) continue;

        drawList.push({
          depth: pt.depth,
          draw: () => {
            const scale = pt.s;
            // Tree Trunk
            const topPt = project(tree.x, tree.d, tree.trunkH, W, H, g.camera);
            if (!topPt) return;

            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = Math.max(3, scale * 0.35);
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(topPt.x, topPt.y);
            ctx.stroke();

            // 3D Canopy Spheres
            const cr = scale * tree.canopyR;
            ctx.fillStyle = '#15803d';
            ctx.beginPath();
            ctx.arc(topPt.x, topPt.y - cr * 0.5, cr, 0, Math.PI * 2);
            ctx.fill();

            // Highlight layer
            ctx.fillStyle = '#22c55e';
            ctx.beginPath();
            ctx.arc(topPt.x - cr * 0.25, topPt.y - cr * 0.75, cr * 0.65, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      // 7. Draw 3D Street Lampposts
      for (const lamp of g.lampposts) {
        if (lamp.d < g.camera.d + 1 || lamp.d > g.camera.d + 180) continue;
        const pt = project(lamp.x, lamp.d, 0, W, H, g.camera);
        const topPt = project(lamp.x, lamp.d, lamp.h, W, H, g.camera);
        if (!pt || !topPt) continue;

        drawList.push({
          depth: pt.depth,
          draw: () => {
            const scale = pt.s;
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = Math.max(2, scale * 0.12);
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(topPt.x, topPt.y);
            // Arm arching over sidewalk
            ctx.lineTo(topPt.x + (lamp.side === 'left' ? scale * 0.8 : -scale * 0.8), topPt.y + scale * 0.2);
            ctx.stroke();

            // Glowing lantern bulb
            ctx.fillStyle = '#fef08a';
            ctx.shadowColor = '#fef08a';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(topPt.x + (lamp.side === 'left' ? scale * 0.8 : -scale * 0.8), topPt.y + scale * 0.25, Math.max(3, scale * 0.18), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });
      }

      // 8. Draw 3D Overhead Banner Gantries
      for (const gantry of g.gantries) {
        if (gantry.d < g.camera.d + 2 || gantry.d > g.camera.d + 180) continue;
        const leftPt = project(-7.8, gantry.d, 4.6, W, H, g.camera);
        const rightPt = project(7.8, gantry.d, 4.6, W, H, g.camera);
        const leftGround = project(-7.8, gantry.d, 0, W, H, g.camera);
        const rightGround = project(7.8, gantry.d, 0, W, H, g.camera);

        if (leftPt && rightPt && leftGround && rightGround) {
          drawList.push({
            depth: leftPt.depth,
            draw: () => {
              // 3D Steel Truss Pillars
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = Math.max(3, leftPt.s * 0.16);
              ctx.beginPath();
              ctx.moveTo(leftGround.x, leftGround.y);
              ctx.lineTo(leftPt.x, leftPt.y);
              ctx.moveTo(rightGround.x, rightGround.y);
              ctx.lineTo(rightPt.x, rightPt.y);
              ctx.stroke();

              // Crossbar
              ctx.lineWidth = Math.max(4, leftPt.s * 0.22);
              ctx.beginPath();
              ctx.moveTo(leftPt.x, leftPt.y);
              ctx.lineTo(rightPt.x, rightPt.y);
              ctx.stroke();

              // Banner
              const bannerH = leftPt.s * 1.8;
              const bannerW = rightPt.x - leftPt.x;
              ctx.fillStyle = gantry.bannerColor;
              ctx.fillRect(leftPt.x, leftPt.y - bannerH / 2, bannerW, bannerH);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2.5;
              ctx.strokeRect(leftPt.x, leftPt.y - bannerH / 2, bannerW, bannerH);

              ctx.fillStyle = '#ffffff';
              ctx.font = `900 ${Math.max(9, Math.round(leftPt.s * 0.36))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText(gantry.bannerText, (leftPt.x + rightPt.x) / 2, leftPt.y + leftPt.s * 0.12);
            }
          });
        }
      }

      // 9. Draw Dynamic 3D Obstacles (Police Vans with Cops, Barricades, Stick Police, Collectibles)
      for (const obs of g.obstacles) {
        if (!obs.active) continue;
        if (obs.d < g.camera.d + 1 || obs.d > g.camera.d + 180) continue;

        const pt = project(obs.x, obs.d, obs.h, W, H, g.camera);
        if (!pt) continue;

        drawList.push({
          depth: pt.depth,
          draw: () => {
            const scale = pt.s;

            // =============================================================
            // REALISTIC 3D POLICE VAN (With Cops Inside & Flashing Siren)
            // =============================================================
            if (obs.type === 'van') {
              const vw = scale * 2.8;
              const vh = scale * 2.6;

              // 1. Ground Shadow
              ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
              ctx.beginPath();
              ctx.ellipse(pt.x, pt.y, vw * 0.65, scale * 0.35, 0, 0, Math.PI * 2);
              ctx.fill();

              // 2. Headlight Beams illuminating the road toward the player!
              const beamLeft = project(obs.x - 0.9, obs.d - 7, 0, W, H, g.camera);
              const beamRight = project(obs.x + 0.9, obs.d - 7, 0, W, H, g.camera);
              if (beamLeft && beamRight) {
                const beamGrad = ctx.createLinearGradient(pt.x, pt.y, (beamLeft.x + beamRight.x) / 2, (beamLeft.y + beamRight.y) / 2);
                beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
                beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
                ctx.fillStyle = beamGrad;
                ctx.beginPath();
                ctx.moveTo(pt.x - vw * 0.38, pt.y - vh * 0.25);
                ctx.lineTo(beamLeft.x - scale * 0.8, beamLeft.y);
                ctx.lineTo(beamRight.x + scale * 0.8, beamRight.y);
                ctx.lineTo(pt.x + vw * 0.38, pt.y - vh * 0.25);
                ctx.closePath();
                ctx.fill();
              }

              // 3. 3D Van Main Chassis Box
              drawBox3D(
                obs.x,
                obs.d,
                0.3,
                obs.w,
                obs.length,
                obs.height3D,
                '#1e3a8a',       // Navy roof
                '#1e3a8a',       // Navy front
                '#0f172a'        // Dark side
              );

              // 4. White Delhi Police Center Band
              const bandPt = project(obs.x, obs.d - obs.length * 0.48, 1.0, W, H, g.camera);
              if (bandPt) {
                const bw = vw * 0.94;
                const bh = vh * 0.28;
                ctx.fillStyle = '#f8fafc';
                ctx.fillRect(bandPt.x - bw / 2, bandPt.y - bh / 2, bw, bh);

                ctx.fillStyle = '#1e3a8a';
                ctx.font = `900 ${Math.max(7, Math.round(scale * 0.26))}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('POLICE', bandPt.x, bandPt.y + bh * 0.2);
              }

              // 5. 3D Windshield Glass
              const glassPt = project(obs.x, obs.d - obs.length * 0.46, 1.8, W, H, g.camera);
              if (glassPt) {
                const gw = vw * 0.86;
                const gh = vh * 0.36;

                // Dark tinted glass
                ctx.fillStyle = '#0369a1';
                ctx.fillRect(glassPt.x - gw / 2, glassPt.y - gh / 2, gw, gh);
                ctx.strokeStyle = '#0f172a';
                ctx.lineWidth = 2;
                ctx.strokeRect(glassPt.x - gw / 2, glassPt.y - gh / 2, gw, gh);

                // =========================================================
                // POLICE COPS SITTING INSIDE THE VAN!
                // =========================================================
                // Left Driver Cop (Khaki uniform, Police Beret/Cap, Hands on Steering Wheel)
                const copLeftX = glassPt.x - gw * 0.25;
                const copY = glassPt.y + gh * 0.05;
                const copSize = scale * 0.45;

                // Khaki uniform body
                ctx.fillStyle = '#b45309';
                ctx.fillRect(copLeftX - copSize * 0.4, copY - copSize * 0.3, copSize * 0.8, copSize * 0.7);
                // Police Cap
                ctx.fillStyle = '#78350f';
                ctx.beginPath();
                ctx.arc(copLeftX, copY - copSize * 0.45, copSize * 0.35, Math.PI, 0, false);
                ctx.fill();
                // Face
                ctx.fillStyle = '#d97706';
                ctx.beginPath();
                ctx.arc(copLeftX, copY - copSize * 0.25, copSize * 0.28, 0, Math.PI * 2);
                ctx.fill();
                // Steering Wheel
                ctx.strokeStyle = '#18181b';
                ctx.lineWidth = Math.max(2, scale * 0.08);
                ctx.beginPath();
                ctx.arc(copLeftX, copY + copSize * 0.15, copSize * 0.3, 0, Math.PI * 2);
                ctx.stroke();

                // Right Passenger Cop (Navigator Cop with Radio/Specs)
                const copRightX = glassPt.x + gw * 0.25;
                ctx.fillStyle = '#b45309';
                ctx.fillRect(copRightX - copSize * 0.4, copY - copSize * 0.3, copSize * 0.8, copSize * 0.7);
                ctx.fillStyle = '#78350f';
                ctx.beginPath();
                ctx.arc(copRightX, copY - copSize * 0.45, copSize * 0.35, Math.PI, 0, false);
                ctx.fill();
                ctx.fillStyle = '#c2410c';
                ctx.beginPath();
                ctx.arc(copRightX, copY - copSize * 0.25, copSize * 0.28, 0, Math.PI * 2);
                ctx.fill();
              }

              // 6. Chrome Front Grille & Headlights
              const grillePt = project(obs.x, obs.d - obs.length * 0.5, 0.6, W, H, g.camera);
              if (grillePt) {
                const grw = vw * 0.55;
                const grh = vh * 0.22;
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(grillePt.x - grw / 2, grillePt.y - grh / 2, grw, grh);
                // Silver slats
                ctx.strokeStyle = '#cbd5e1';
                ctx.lineWidth = 1.5;
                for (let slat = -grh * 0.3; slat <= grh * 0.3; slat += 3) {
                  ctx.beginPath();
                  ctx.moveTo(grillePt.x - grw * 0.42, grillePt.y + slat);
                  ctx.lineTo(grillePt.x + grw * 0.42, grillePt.y + slat);
                  ctx.stroke();
                }

                // Dual Glowing Headlights
                ctx.fillStyle = '#fef08a';
                ctx.shadowColor = '#fef08a';
                ctx.shadowBlur = 12;
                ctx.fillRect(grillePt.x - vw * 0.42, grillePt.y - grh * 0.35, scale * 0.38, scale * 0.28);
                ctx.fillRect(grillePt.x + vw * 0.42 - scale * 0.38, grillePt.y - grh * 0.35, scale * 0.38, scale * 0.28);
                ctx.shadowBlur = 0;
              }

              // 7. Rooftop 3D Lightbar Siren (Flashing Blue & Red with Strobe Pulse)
              const sirenPt = project(obs.x, obs.d - obs.length * 0.2, obs.height3D + 0.3, W, H, g.camera);
              if (sirenPt) {
                const sw = scale * 1.5;
                const sh = scale * 0.38;
                const isRed = (obs.sirenPhase || 0) < 1;

                // Siren mounting bracket
                ctx.fillStyle = '#334155';
                ctx.fillRect(sirenPt.x - sw / 2, sirenPt.y - sh / 2, sw, sh);

                // Flashing Dual Beacons
                // Left Red strobe
                ctx.fillStyle = isRed ? '#ef4444' : '#7f1d1d';
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = isRed ? 18 : 2;
                ctx.fillRect(sirenPt.x - sw * 0.46, sirenPt.y - sh * 0.8, sw * 0.4, sh * 1.3);

                // Right Blue strobe
                ctx.fillStyle = !isRed ? '#38bdf8' : '#1e3a8a';
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = !isRed ? 18 : 2;
                ctx.fillRect(sirenPt.x + sw * 0.06, sirenPt.y - sh * 0.8, sw * 0.4, sh * 1.3);
                ctx.shadowBlur = 0;
              }
            }

            // =============================================================
            // 3D YELLOW/BLACK POLICE BARRICADE
            // =============================================================
            else if (obs.type === 'barricade') {
              const bw = scale * 2.4;
              const bh = scale * 1.4;

              // Shadow
              ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
              ctx.beginPath();
              ctx.ellipse(pt.x, pt.y, bw * 0.55, scale * 0.2, 0, 0, Math.PI * 2);
              ctx.fill();

              // 3D Tubular Steel Legs
              ctx.strokeStyle = '#475569';
              ctx.lineWidth = Math.max(2, scale * 0.1);
              ctx.beginPath();
              ctx.moveTo(pt.x - bw * 0.42, pt.y);
              ctx.lineTo(pt.x - bw * 0.42, pt.y - bh);
              ctx.moveTo(pt.x + bw * 0.42, pt.y);
              ctx.lineTo(pt.x + bw * 0.42, pt.y - bh);
              ctx.stroke();

              // Barricade Face with Chevron Hazard Stripes
              ctx.fillStyle = '#eab308';
              ctx.fillRect(pt.x - bw / 2, pt.y - bh, bw, bh * 0.75);

              // Black Diagonal Chevrons
              ctx.fillStyle = '#0f172a';
              for (let stripe = -bw / 2; stripe < bw / 2; stripe += 16) {
                ctx.beginPath();
                ctx.moveTo(pt.x + stripe, pt.y - bh);
                ctx.lineTo(pt.x + stripe + 8, pt.y - bh);
                ctx.lineTo(pt.x + stripe + 16, pt.y - bh + bh * 0.75);
                ctx.lineTo(pt.x + stripe + 8, pt.y - bh + bh * 0.75);
                ctx.closePath();
                ctx.fill();
              }

              // "POLICE" Sign Plate
              ctx.fillStyle = '#f8fafc';
              ctx.fillRect(pt.x - scale * 0.7, pt.y - bh * 0.65, scale * 1.4, scale * 0.38);
              ctx.fillStyle = '#dc2626';
              ctx.font = `900 ${Math.max(6, Math.round(scale * 0.22))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText('POLICE', pt.x, pt.y - bh * 0.42);
            }

            // =============================================================
            // 3D LATHI COP SQUAD (Khaki Officer with Bamboo Lathi)
            // =============================================================
            else if (obs.type === 'cop') {
              const cw = scale * 1.2;
              const ch = scale * 2.2;

              // Shadow
              ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
              ctx.beginPath();
              ctx.ellipse(pt.x, pt.y, cw * 0.5, scale * 0.2, 0, 0, Math.PI * 2);
              ctx.fill();

              // Legs in khaki trousers
              ctx.fillStyle = '#b45309';
              ctx.fillRect(pt.x - cw * 0.3, pt.y - ch * 0.4, cw * 0.24, ch * 0.4);
              ctx.fillRect(pt.x + cw * 0.06, pt.y - ch * 0.4, cw * 0.24, ch * 0.4);

              // Khaki Shirt with Belt & Police Badge
              ctx.fillStyle = '#d97706';
              ctx.fillRect(pt.x - cw * 0.38, pt.y - ch * 0.82, cw * 0.76, ch * 0.45);

              // Black Police Belt with Brass Buckle
              ctx.fillStyle = '#18181b';
              ctx.fillRect(pt.x - cw * 0.38, pt.y - ch * 0.44, cw * 0.76, ch * 0.08);
              ctx.fillStyle = '#eab308';
              ctx.fillRect(pt.x - cw * 0.1, pt.y - ch * 0.45, cw * 0.2, ch * 0.1);

              // Head & Mustache
              ctx.fillStyle = '#c2410c';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y - ch * 0.9, cw * 0.3, 0, Math.PI * 2);
              ctx.fill();

              // Khaki Police Beret / Peaked Cap
              ctx.fillStyle = '#78350f';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y - ch * 0.98, cw * 0.35, Math.PI, 0, false);
              ctx.fill();

              // 3D Bamboo Lathi in hand
              ctx.strokeStyle = '#ca8a04';
              ctx.lineWidth = Math.max(2, scale * 0.1);
              ctx.beginPath();
              ctx.moveTo(pt.x + cw * 0.4, pt.y - ch * 0.65);
              ctx.lineTo(pt.x + cw * 0.85, pt.y - ch * 0.12);
              ctx.stroke();
            }

            // Puddle
            else if (obs.type === 'puddle') {
              ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
              ctx.beginPath();
              ctx.ellipse(pt.x, pt.y, scale * 1.4, scale * 0.6, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
              ctx.lineWidth = 1.5;
              ctx.stroke();
            }

            // Cutting Chai Glass
            else if (obs.type === 'chai') {
              const sz = scale * 0.95;
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

              // Steam aroma wave
              ctx.strokeStyle = '#fed7aa';
              ctx.beginPath();
              ctx.arc(pt.x, pt.y - sz * 1.35, sz * 0.25, 0, Math.PI);
              ctx.stroke();
            }

            // Slogan Megaphone
            else if (obs.type === 'megaphone') {
              const sz = scale * 0.95;
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

            // Meme Coin
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
              ctx.font = `bold ${Math.max(7, Math.round(scale * 0.26))}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.fillText('₹', pt.x, pt.y - r * 0.7);
            }
          }
        });
      }

      // 10. Draw 3D Player Character with Hierarchical Joint Anatomy
      const playerPt = project(g.player.x, g.player.d, g.player.h, W, H, g.camera);
      if (playerPt) {
        drawList.push({
          depth: playerPt.depth,
          draw: () => {
            const scale = playerPt.s;
            const px = playerPt.x;
            const py = playerPt.y;
            const pw = scale * 1.35 * g.player.scaleX;
            const ph = scale * 2.3 * g.player.scaleY;

            // Accurate 3D Ground Shadow (scales with airborne jump height)
            const shadowPt = project(g.player.x, g.player.d, 0, W, H, g.camera);
            if (shadowPt) {
              const shadowAlpha = Math.max(0.12, 0.48 - g.player.h * 0.12);
              ctx.fillStyle = `rgba(15, 23, 42, ${shadowAlpha})`;
              ctx.beginPath();
              ctx.ellipse(shadowPt.x, shadowPt.y, pw * 0.5, scale * 0.22, 0, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(g.player.tilt);

            // Invincibility Strobe
            if (g.player.invincibleTimer > 0) {
              ctx.shadowColor = '#c084fc';
              ctx.shadowBlur = 18;
            }

            // Animated Running Legs with Knee Bend & Shoes
            const legSwing = Math.sin(g.player.walkPhase) * (scale * 0.32);
            ctx.fillStyle = selectedChar.colors.pants;
            // Left leg
            ctx.fillRect(-pw * 0.32, -ph * 0.38, pw * 0.26, ph * 0.38 + legSwing);
            // Right leg
            ctx.fillRect(pw * 0.06, -ph * 0.38, pw * 0.26, ph * 0.38 - legSwing);

            // Sneakers / Shoes
            ctx.fillStyle = selectedChar.colors.shoes;
            ctx.fillRect(-pw * 0.34, -ph * 0.04 + legSwing, pw * 0.3, ph * 0.08);
            ctx.fillRect(pw * 0.04, -ph * 0.04 - legSwing, pw * 0.3, ph * 0.08);

            // 3D Torso / Shirt with folds
            ctx.fillStyle = selectedChar.colors.shirt;
            ctx.fillRect(-pw * 0.42, -ph * 0.8, pw * 0.84, ph * 0.45);

            // Swinging Arms opposing legs
            const armSwing = Math.sin(g.player.walkPhase + Math.PI) * (scale * 0.25);
            ctx.fillStyle = selectedChar.colors.skin;
            ctx.fillRect(-pw * 0.52, -ph * 0.76 + armSwing, pw * 0.16, ph * 0.35);
            ctx.fillRect(pw * 0.38, -ph * 0.76 - armSwing, pw * 0.16, ph * 0.35);

            // 3D Backpack
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(-pw * 0.3, -ph * 0.76, pw * 0.6, ph * 0.38);

            // Head & Face
            ctx.fillStyle = selectedChar.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -ph * 0.88, pw * 0.34, 0, Math.PI * 2);
            ctx.fill();

            // Hair / Bucket Hat
            ctx.fillStyle = selectedChar.colors.hair;
            ctx.beginPath();
            ctx.arc(0, -ph * 0.96, pw * 0.36, Math.PI, 0, false);
            ctx.fill();

            // GenZ Sunglasses or Abhijit Specs
            if (selectedChar.id === 'genz') {
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(-pw * 0.22, -ph * 0.92, pw * 0.44, ph * 0.1);
            } else if (selectedChar.id === 'abhijit') {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(-pw * 0.22, -ph * 0.92, pw * 0.44, ph * 0.1);
            }

            // Wheelchair structure for Kabir
            if (selectedChar.id === 'kabir') {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = Math.max(2, scale * 0.12);
              ctx.beginPath();
              ctx.arc(-pw * 0.32, -ph * 0.15, scale * 0.48, 0, Math.PI * 2);
              ctx.arc(pw * 0.32, -ph * 0.15, scale * 0.48, 0, Math.PI * 2);
              ctx.stroke();
            }

            ctx.restore();
            ctx.shadowBlur = 0;
          }
        });
      }

      // 11. Draw Impact Particles
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

      // Execute Draw List in Depth Order (Farthest to Nearest)
      drawList.sort((a, b) => b.depth - a.depth);
      for (const item of drawList) {
        item.draw();
      }

      // 12. Draw Comic Speech Bubbles (Overhead 2D Layer)
      for (const bubble of g.bubbles) {
        const pt = project(bubble.x, bubble.d, bubble.h, W, H, g.camera);
        if (!pt) continue;

        const alpha = Math.max(0, 1 - bubble.life / bubble.maxLife);
        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.font = '900 13px sans-serif';
        const txtW = ctx.measureText(bubble.text).width;
        const padX = 12;
        const bx = pt.x - txtW / 2 - padX;
        const by = pt.y - 34;
        const bw = txtW + padX * 2;
        const bh = 24;

        ctx.fillStyle = bubble.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 6);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(pt.x - 6, by + bh);
        ctx.lineTo(pt.x + 6, by + bh);
        ctx.lineTo(pt.x, by + bh + 7);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bubble.text, pt.x, by + bh / 2);

        ctx.restore();
      }

      // Subtle Halftone Overlay
      ctx.fillStyle = 'rgba(15, 23, 42, 0.03)';
      ctx.fillRect(0, 0, W, H);
    };

    animId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animId);
      audio.stopContinuousSiren();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [gameState, selectedChar, maxHealth, spawnObstaclesAhead, addParticles, addComicBubble, score, user, setUser]);

  // Game Over Handler
  const triggerGameOver = (reason: string) => {
    gameRef.current.running = false;
    audio.stopBGM();
    audio.stopContinuousSiren();
    audio.playHit();
    setGameState('gameover');
  };

  // Share score
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
      className="relative w-full aspect-[4/3] sm:aspect-[16/9] min-h-[520px] max-h-[85vh] rounded-3xl overflow-hidden select-none bg-[#0a0710] border-2 border-[#ff5e00]/30 shadow-2xl font-sans"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block cursor-pointer" />

      {/* ==================================================== */}
      {/* TITLE SCREEN OVERLAY                                 */}
      {/* ==================================================== */}
      {gameState === 'title' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#0a0710]/70 via-[#180a1c]/85 to-[#050209]/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/40 text-orange-400 text-xs font-mono font-bold tracking-wider animate-pulse">
            <Flame className="w-4 h-4 text-orange-400" />
            <span>TRENDING 3D INDIAN MEME ARENA ARCADE</span>
          </div>

          <div className="flex flex-col items-center text-center space-y-3 max-w-xl">
            <div className="px-6 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-2xl sm:text-4xl tracking-tight shadow-xl border-2 border-yellow-300 transform -rotate-1">
              द जेनज़ी प्रोटेस्ट रन
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white font-display tracking-wide uppercase drop-shadow-lg">
              GENZ PROTEST RUN 3D
            </h1>
            <p className="text-xs sm:text-sm text-yellow-200/90 font-medium max-w-md">
              Dodge Dilli police vans, jump barricades, chug cutting chai & march 1000m all the way to Jantar Mantar!
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-gray-300">
                🚐 3D Police Van = 5s Free Van Seva
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-red-300">
                👮 Khaki Stick Squad = −40% जान
              </span>
              <span className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-yellow-300">
                🚧 Yellow Barricade = JUMP It!
              </span>
            </div>
          </div>

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

          <div className="text-[11px] font-mono text-gray-400 text-center">
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">← / A</kbd>{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">→ / D</kbd> Steer &nbsp;|&nbsp;{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white">SPACE</kbd> Jump &nbsp;|&nbsp; Touch Joystick on Mobile
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* CHARACTER SELECTION SCREEN                           */}
      {/* ==================================================== */}
      {gameState === 'select' && (
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-[#0a0710]/90 to-[#120817]/98 backdrop-blur-md overflow-y-auto">
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
              <p className="text-[11px] font-mono text-orange-400">PICK YOUR 3D PROTESTER</p>
            </div>
            <div className="w-16" />
          </div>

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
      {/* ACTIVE GAMEPLAY HUD                                  */}
      {/* ==================================================== */}
      {gameState === 'play' && (
        <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6">
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

            {/* Distance Progress */}
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

            {/* Stats Pills */}
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

          {/* Virtual Mobile Joystick + Jump Button */}
          <div className="flex items-end justify-between pointer-events-auto">
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
      {/* DETAINED OVERLAY (Police Van Detention Cutscene)     */}
      {/* ==================================================== */}
      {gameState === 'detained' && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center p-6 bg-slate-950/92 backdrop-blur-md text-center">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border-2 border-blue-500 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-blue-600/20 border-2 border-blue-500 text-3xl flex items-center justify-center mx-auto animate-bounce">
              🚐
            </div>
            <h2 className="text-3xl font-black text-blue-400 font-display uppercase tracking-wider">
              DETAINED!
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 font-medium">
              Dilli Police ki free van seva mein aapka swaagat hain.<br />
              Chai & Parle-G pending. Releasing in:
            </p>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-600 to-blue-600 text-white font-black text-4xl flex items-center justify-center mx-auto shadow-xl border-4 border-white animate-pulse">
              {detainedCountdown}
            </div>
            <p className="text-[11px] font-mono text-gray-400">
              Hold tight! Van doors will open automatically.
            </p>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* GAME OVER OVERLAY                                    */}
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
      {/* VICTORY OVERLAY (Jantar Mantar Reached!)             */}
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
