export class FightingAudio {
  private static instance: FightingAudio;
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  public muted = false;
  public volume = 0.8;

  private constructor() {
    this.setupUnlock();
    this.preloadClips();
  }

  public static getInstance(): FightingAudio {
    if (!FightingAudio.instance) {
      FightingAudio.instance = new FightingAudio();
    }
    return FightingAudio.instance;
  }

  private preloadClips() {
    if (typeof window === 'undefined') return;
    const clips = [
      '/audio/fight.mp3',
      '/audio/round_1.mp3',
      '/audio/round_2.mp3',
      '/audio/final_round.mp3',
      '/audio/ko.mp3',
      '/audio/you_win.mp3',
      '/audio/you_lose.mp3',
      '/audio/modi.mp3',
      '/audio/rahul.mp3',
      '/audio/didi.mp3',
      '/audio/yogi.mp3',
      '/audio/trump.mp3',
      '/audio/nitin.mp3',
      '/audio/lalu.mp3',
      '/audio/mbapu.mp3',
      '/audio/bed_chakra.mp3',
      '/audio/bed_bulldozer.mp3',
      '/audio/bed_jadu.mp3',
      '/audio/aloolelo.mp3'
    ];

    clips.forEach(src => {
      try {
        const audio = new Audio(src);
        audio.preload = 'auto';
        this.audioCache.set(src, audio);
      } catch {}
    });
  }

  public playClip(url: string, volume = 0.9) {
    if (this.muted || typeof window === 'undefined') return;
    try {
      let audio = this.audioCache.get(url);
      if (!audio) {
        audio = new Audio(url);
        this.audioCache.set(url, audio);
      }
      audio.currentTime = 0;
      audio.volume = Math.max(0, Math.min(1, volume * this.volume));
      audio.play().catch(() => {});
    } catch {}
  }

  private setupUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      this.initCtx();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
  }

  private initCtx() {
    if (this.ctx || typeof window === 'undefined') return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : this.volume;

      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.value = -18;
      comp.knee.value = 6;
      comp.ratio.value = 8;
      comp.attack.value = 0.003;
      comp.release.value = 0.15;

      this.masterGain.connect(comp);
      comp.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.8;
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 0.35;
      this.bgmGain.connect(this.masterGain);
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.muted ? 0 : this.volume,
        this.ctx.currentTime
      );
    }
    if (this.bgmAudio) {
      this.bgmAudio.muted = this.muted;
    }
    return this.muted;
  }

  // --- Voice & Announcer Helpers ---
  public playRoundVoice(round: number) {
    if (round === 1) this.playClip('/audio/round_1.mp3');
    else if (round === 2) this.playClip('/audio/round_2.mp3');
    else this.playClip('/audio/final_round.mp3');

    setTimeout(() => {
      this.playClip('/audio/fight.mp3');
    }, 900);
  }

  public playKOVoice() {
    this.playClip('/audio/ko.mp3', 1.0);
  }

  public playWinVoice() {
    this.playClip('/audio/you_win.mp3', 1.0);
  }

  public playLoseVoice() {
    this.playClip('/audio/you_lose.mp3', 1.0);
  }

  public playFighterVoice(charId: string) {
    this.playClip(`/audio/${charId}.mp3`, 0.95);
  }

  // --- SFX Synthesis Fallbacks ---
  public playPunch() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playKick() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);

    gain.gain.setValueAtTime(0.65, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playHitHeavy() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 0.25);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.28);
  }

  public playBlock() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.08);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  public playSuperCharge() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, t);
    osc.frequency.exponentialRampToValueAtTime(650, t + 0.6);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.linearRampToValueAtTime(0.7, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.65);
  }

  public playSuperExplosion() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(140, t);
    osc1.frequency.exponentialRampToValueAtTime(25, t + 0.5);
    osc2.frequency.setValueAtTime(85, t);
    osc2.frequency.exponentialRampToValueAtTime(15, t + 0.6);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.65);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.65);
    osc2.stop(t + 0.65);
  }

  // --- Background Music ---
  public startFightBGM() {
    if (this.muted || typeof window === 'undefined') return;
    try {
      if (!this.bgmAudio) {
        this.bgmAudio = new Audio('/audio/battle.mp3');
        this.bgmAudio.loop = true;
      }
      this.bgmAudio.volume = 0.4 * this.volume;
      this.bgmAudio.currentTime = 0;
      this.bgmAudio.play().catch(() => {});
    } catch {}
  }

  public stopFightBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }
}

export const fightingAudio = FightingAudio.getInstance();
