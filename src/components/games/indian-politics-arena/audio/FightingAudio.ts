export class FightingAudio {
  private static instance: FightingAudio;
  private ctx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private bgmOscillators: OscillatorNode[] = [];
  private isBgmPlaying = false;
  public muted = false;
  public volume = 0.8;

  private constructor() {
    this.setupUnlock();
  }

  public static getInstance(): FightingAudio {
    if (!FightingAudio.instance) {
      FightingAudio.instance = new FightingAudio();
    }
    return FightingAudio.instance;
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
      this.bgmGain.gain.value = 0.25;
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
    return this.muted;
  }

  // --- SFX Synthesis ---

  public playPunch() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Fast frequency drop + noise punch
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
    // Sub-bass impact + crack
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

  public playGrab() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(300, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.25);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
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
    // Dual frequency massive detonate
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

  public playRoundAnnounce() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);
      gain.gain.setValueAtTime(0.4, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.3);
    });
  }

  public playVictoryTheme() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const fanFare = [
      { f: 523.25, d: 0.18 }, // C5
      { f: 659.25, d: 0.18 }, // E5
      { f: 783.99, d: 0.18 }, // G5
      { f: 1046.5, d: 0.45 }  // C6
    ];

    let offset = 0;
    fanFare.forEach(note => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, t + offset);
      gain.gain.setValueAtTime(0.5, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, t + offset + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t + offset);
      osc.stop(t + offset + note.d);
      offset += note.d * 0.85;
    });
  }

  public playMenuClick() {
    if (this.muted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.05);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  // --- Dynamic Procedural Fight BGM (Dhol-inspired cadence & synth pulse) ---
  public startFightBGM() {
    if (this.isBgmPlaying) return;
    this.initCtx();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;
    this.runBgmLoop();
  }

  private runBgmLoop() {
    if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;

    // Pattern generator: 125 BPM fighting beat
    const bpm = 126;
    const beatInterval = 60 / bpm;
    const t = this.ctx.currentTime + 0.05;

    // Bass line notes (D Dorian / Indian Rag Bhairav inspired)
    const bassNotes = [73.42, 82.41, 73.42, 98.0, 73.42, 82.41, 110.0, 98.0];

    for (let step = 0; step < 16; step++) {
      const stepTime = t + step * (beatInterval / 2);
      
      // Kick / Dhol beat on downbeats
      if (step % 4 === 0) {
        this.triggerDholBeat(stepTime, 65, 0.25);
      } else if (step % 4 === 2) {
        this.triggerDholBeat(stepTime, 95, 0.18);
      }

      // Synth bass note
      const note = bassNotes[step % bassNotes.length];
      this.triggerSynthBass(stepTime, note, beatInterval * 0.4);
    }

    // Schedule next 16-step bar
    const barDuration = 16 * (beatInterval / 2) * 1000;
    setTimeout(() => {
      if (this.isBgmPlaying) {
        this.runBgmLoop();
      }
    }, barDuration - 80);
  }

  private triggerDholBeat(time: number, freq: number, gainVal: number) {
    if (!this.ctx || !this.bgmGain || this.muted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(25, time + 0.12);
      gain.gain.setValueAtTime(gainVal, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + 0.14);
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(time);
      osc.stop(time + 0.14);
    } catch {
      // safely handle context timing jitter
    }
  }

  private triggerSynthBass(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.bgmGain || this.muted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.005, time + duration);
      osc.connect(gain);
      gain.connect(this.bgmGain);
      osc.start(time);
      osc.stop(time + duration);
    } catch {
      // safely handle context timing jitter
    }
  }

  public stopFightBGM() {
    this.isBgmPlaying = false;
  }
}

export const fightingAudio = FightingAudio.getInstance();

