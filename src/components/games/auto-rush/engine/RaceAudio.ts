export class RaceAudio {
  private static instance: RaceAudio | null = null;
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isEngineRunning = false;
  private isMuted = false;

  public static getInstance(): RaceAudio {
    if (!RaceAudio.instance) {
      RaceAudio.instance = new RaceAudio();
    }
    return RaceAudio.instance;
  }

  private initContext(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted && this.engineGain) {
      this.engineGain.gain.value = 0;
    }
  }

  public startEngine(): void {
    if (this.isEngineRunning || this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      // Sawtooth wave for crisp 2-stroke Bajaj rickshaw engine buzz
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      // Low-pass filter to soften high frequencies
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Could not start race engine audio:', e);
    }
  }

  public updateEnginePitch(rpm: number, isNitro: boolean): void {
    if (!this.isEngineRunning || !this.engineOsc || !this.engineGain || !this.ctx || this.isMuted) return;

    try {
      // Map RPM (1000 - 5500) to frequency (55Hz - 240Hz)
      const baseFreq = 55 + (rpm / 5500) * 165;
      const targetFreq = isNitro ? baseFreq * 1.35 : baseFreq;

      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);

      const targetGain = isNitro ? 0.14 : 0.08;
      this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    } catch {
      // Ignore audio pitch errors
    }
  }

  public stopEngine(): void {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
      }
      this.isEngineRunning = false;
    } catch {
      this.isEngineRunning = false;
    }
  }

  public playHorn(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Dual-tone auto-rickshaw horn (440Hz + 587Hz)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(587, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.35);
      osc2.stop(this.ctx.currentTime + 0.35);
    } catch {}
  }

  public playCountdownTone(isGo = false): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isGo ? 880 : 440, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (isGo ? 0.5 : 0.25));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + (isGo ? 0.5 : 0.25));
    } catch {}
  }

  public playNitroSound(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(960, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    } catch {}
  }

  public playDriftScreech(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      // Noise burst for tyre screech
      const bufferSize = this.ctx.sampleRate * 0.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      filter.Q.setValueAtTime(4.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start();
    } catch {}
  }

  public playFinishCheer(): void {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.12 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.12);
        osc.stop(this.ctx!.currentTime + idx * 0.12 + 0.4);
      });
    } catch {}
  }
}
