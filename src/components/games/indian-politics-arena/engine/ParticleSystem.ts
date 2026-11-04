export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  type: 'spark' | 'smoke' | 'star' | 'energy';
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public spawnHitSparks(x: number, y: number, color = '#FFD700', count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 4,
        color: Math.random() > 0.3 ? color : '#FFFFFF',
        alpha: 1.0,
        decay: 0.035 + Math.random() * 0.04,
        type: 'spark'
      });
    }
  }

  public spawnBlockSparks(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.PI * 0.7 + Math.random() * Math.PI * 0.6;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3,
        color: '#60A5FA',
        alpha: 1.0,
        decay: 0.05,
        type: 'spark'
      });
    }
  }

  public spawnDustTrail(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y - Math.random() * 8,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.5 - Math.random() * 1.5,
        size: 5 + Math.random() * 6,
        color: 'rgba(209, 213, 219, 0.4)',
        alpha: 0.6,
        decay: 0.025,
        type: 'smoke'
      });
    }
  }

  public spawnSuperExplosion(x: number, y: number, accentColor: string) {
    // 40 particles bursting outwards
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 8,
        color: i % 2 === 0 ? accentColor : '#FFFFFF',
        alpha: 1.0,
        decay: 0.02,
        type: 'energy'
      });
    }
  }

  public update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.type === 'spark') {
        p.vy += 0.2; // gravity on sparks
        p.vx *= 0.95;
      } else if (p.type === 'smoke') {
        p.size += 0.2;
      }

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  public clear() {
    this.particles = [];
  }
}

