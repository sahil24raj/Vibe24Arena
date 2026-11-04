import { ArenaConfig } from './types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, STAGE_FLOOR_Y } from './constants';

export class ArenaRenderer {
  public static renderArena(
    ctx: CanvasRenderingContext2D,
    arena: ArenaConfig,
    cameraOffset: number,
    tick: number
  ) {
    // 1. Background Sky / Wall Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, STAGE_FLOOR_Y);
    grad.addColorStop(0, arena.bgGradient[0]);
    grad.addColorStop(1, arena.bgGradient[1]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Parallax Middleground Decor based on Arena Type
    ctx.save();
    ctx.translate(cameraOffset * 0.3, 0);

    if (arena.decorType === 'parliament') {
      this.drawParliamentBackdrop(ctx, tick);
    } else if (arena.decorType === 'rally') {
      this.drawRallyBackdrop(ctx, tick);
    } else if (arena.decorType === 'dharna') {
      this.drawDharnaBackdrop(ctx, tick);
    } else if (arena.decorType === 'studio') {
      this.drawStudioBackdrop(ctx, tick);
    }
    ctx.restore();

    // 3. Stage Floor
    this.drawStageFloor(ctx, arena);

    // 4. Foreground Stage Elements
    ctx.save();
    ctx.translate(cameraOffset * 0.8, 0);
    this.drawForegroundAccents(ctx, arena, tick);
    ctx.restore();
  }

  private static drawStageFloor(ctx: CanvasRenderingContext2D, arena: ArenaConfig) {
    const floorHeight = CANVAS_HEIGHT - STAGE_FLOOR_Y;

    // Floor Base
    ctx.fillStyle = arena.floorColor;
    ctx.fillRect(0, STAGE_FLOOR_Y, CANVAS_WIDTH, floorHeight);

    // Floor Boundary / Edge Neon Trim
    const lineGrad = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, 0);
    lineGrad.addColorStop(0, arena.accentColor);
    lineGrad.addColorStop(0.5, '#FFFFFF');
    lineGrad.addColorStop(1, arena.accentColor);

    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, STAGE_FLOOR_Y);
    ctx.lineTo(CANVAS_WIDTH, STAGE_FLOOR_Y);
    ctx.stroke();

    // Floor Pattern / Perspective Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    for (let x = -200; x < CANVAS_WIDTH + 200; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, STAGE_FLOOR_Y);
      ctx.lineTo(x - 50, CANVAS_HEIGHT);
      ctx.stroke();
    }
  }

  private static drawParliamentBackdrop(ctx: CanvasRenderingContext2D, tick: number) {
    // Grand Architectural Dome & Columns
    ctx.fillStyle = 'rgba(255, 215, 0, 0.08)';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 260, 280, Math.PI, 0);
    ctx.fill();

    // Classical Parliament Pillars
    ctx.fillStyle = '#0F263E';
    for (let i = 80; i < CANVAS_WIDTH; i += 120) {
      ctx.fillRect(i, 80, 24, STAGE_FLOOR_Y - 80);
      // Pillar Capitals
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(i - 4, 76, 32, 8);
      ctx.fillStyle = '#0F263E';
    }

    // Central Grand Speaker's Chair & National Emblem Silhouette
    ctx.fillStyle = '#1A365D';
    ctx.beginPath();
    ctx.roundRect(CANVAS_WIDTH / 2 - 60, STAGE_FLOOR_Y - 180, 120, 180, 16);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Tricolor Ribbon Banner across header
    const flagY = 35;
    ctx.fillStyle = '#FF9933';
    ctx.fillRect(100, flagY, CANVAS_WIDTH - 200, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(100, flagY + 6, CANVAS_WIDTH - 200, 6);
    ctx.fillStyle = '#138808';
    ctx.fillRect(100, flagY + 12, CANVAS_WIDTH - 200, 6);

    // Subtle Chandelier Glow
    const glow = 20 + Math.sin(tick * 0.05) * 6;
    ctx.fillStyle = 'rgba(255, 215, 0, 0.15)';
    ctx.beginPath();
    ctx.arc(CANVAS_WIDTH / 2, 80, glow, 0, Math.PI * 2);
    ctx.fill();
  }

  private static drawRallyBackdrop(ctx: CanvasRenderingContext2D, tick: number) {
    // High Campaign Stage Trusses & Spotlights
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    // Metal Scaffolding
    for (let x = 60; x < CANVAS_WIDTH; x += 180) {
      ctx.moveTo(x, 40);
      ctx.lineTo(x, STAGE_FLOOR_Y);
      ctx.moveTo(x, 40);
      ctx.lineTo(x + 180, STAGE_FLOOR_Y);
    }
    ctx.stroke();

    // Loudspeakers mounted on poles
    ctx.fillStyle = '#334155';
    [150, 480, 810].forEach(lx => {
      ctx.beginPath();
      ctx.moveTo(lx, 100);
      ctx.lineTo(lx - 25, 80);
      ctx.lineTo(lx - 25, 120);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(lx, 100);
      ctx.lineTo(lx + 25, 80);
      ctx.lineTo(lx + 25, 120);
      ctx.closePath();
      ctx.fill();
    });

    // Waving Crowd Silhouettes with Flags
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    for (let i = 0; i < CANVAS_WIDTH; i += 30) {
      const bob = Math.sin((tick + i) * 0.1) * 8;
      ctx.arc(i + 15, STAGE_FLOOR_Y - 25 + bob, 18, 0, Math.PI * 2);
    }
    ctx.fill();

    // Campaign Flags fluttering
    for (let f = 50; f < CANVAS_WIDTH; f += 140) {
      const flap = Math.sin((tick + f) * 0.15) * 12;
      ctx.fillStyle = f % 280 === 0 ? '#FF9933' : '#3B82F6';
      ctx.beginPath();
      ctx.moveTo(f, STAGE_FLOOR_Y - 60);
      ctx.lineTo(f + 35 + flap, STAGE_FLOOR_Y - 80);
      ctx.lineTo(f, STAGE_FLOOR_Y - 95);
      ctx.closePath();
      ctx.fill();
    }
  }

  private static drawDharnaBackdrop(ctx: CanvasRenderingContext2D, tick: number) {
    // Delhi Street Lamps with Warm Ambient Cones
    [180, 500, 780].forEach(lx => {
      // Lamp pole
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(lx, 120, 10, STAGE_FLOOR_Y - 120);

      // Light Cone
      const coneGrad = ctx.createLinearGradient(lx, 120, lx, STAGE_FLOOR_Y);
      coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      coneGrad.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(lx + 5, 120);
      ctx.lineTo(lx - 80, STAGE_FLOOR_Y);
      ctx.lineTo(lx + 90, STAGE_FLOOR_Y);
      ctx.closePath();
      ctx.fill();
    });

    // Yellow Delhi Police Barricades in Background
    ctx.fillStyle = '#EAB308';
    for (let bx = 40; bx < CANVAS_WIDTH; bx += 220) {
      ctx.fillRect(bx, STAGE_FLOOR_Y - 45, 120, 45);
      // Barricade black diagonal caution stripes
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(bx + 20, STAGE_FLOOR_Y - 45);
      ctx.lineTo(bx + 40, STAGE_FLOOR_Y - 45);
      ctx.lineTo(bx + 15, STAGE_FLOOR_Y);
      ctx.lineTo(bx - 5, STAGE_FLOOR_Y);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#EAB308';
    }

    // Street Chai Stall with boiling steam kettle
    ctx.fillStyle = '#451A03';
    ctx.fillRect(720, STAGE_FLOOR_Y - 70, 90, 70);
    // Steam particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let s = 0; s < 3; s++) {
      const steamY = STAGE_FLOOR_Y - 80 - ((tick * 1.5 + s * 25) % 60);
      ctx.beginPath();
      ctx.arc(765 + Math.sin(steamY * 0.1) * 6, steamY, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private static drawStudioBackdrop(ctx: CanvasRenderingContext2D, tick: number) {
    // Large Video Wall Screens
    const screens = [
      { x: 80, w: 220, label: 'TRP #1 LIVE' },
      { x: 370, w: 220, label: 'EXCLUSIVE DEBATE' },
      { x: 660, w: 220, label: 'BREAKING HEADLINES' }
    ];

    screens.forEach(s => {
      // Screen Frame
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(s.x, 80, s.w, 140);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(s.x, 80, s.w, 140);

      // Screen glow
      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.fillRect(s.x + 4, 84, s.w - 8, 132);

      // Audio waveform / visualizer bars
      ctx.fillStyle = '#38BDF8';
      for (let bar = 0; bar < 12; bar++) {
        const h = 15 + Math.sin(tick * 0.2 + bar) * 12;
        ctx.fillRect(s.x + 20 + bar * 15, 170 - h, 8, h);
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(s.label, s.x + 15, 105);
    });

    // Sweeping Studio Spotlights
    const angle1 = Math.sin(tick * 0.03) * 0.4;
    const angle2 = Math.cos(tick * 0.03) * 0.4;
    this.drawSpotlight(ctx, 150, 0, angle1, 'rgba(239, 68, 68, 0.12)');
    this.drawSpotlight(ctx, 810, 0, -angle2, 'rgba(56, 189, 248, 0.12)');

    // Neon Ticker Tape line
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(0, STAGE_FLOOR_Y - 28, CANVAS_WIDTH, 28);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 13px sans-serif';
    const tickerOffset = (tick * 2.5) % 600;
    ctx.fillText('🔴 BREAKING NEWS: THE NATION DEMANDS AN INSTANT K.O. IN ROUND 1! 🔴 STAY TUNED FOR LIVE RESULTS...', CANVAS_WIDTH - tickerOffset, STAGE_FLOOR_Y - 9);
  }

  private static drawSpotlight(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    color: string
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-70, CANVAS_HEIGHT);
    ctx.lineTo(70, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private static drawForegroundAccents(
    ctx: CanvasRenderingContext2D,
    arena: ArenaConfig,
    tick: number
  ) {
    // Subtle dust or atmospheric motes floating
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 15; i++) {
      const px = (i * 73 + tick * 0.4) % CANVAS_WIDTH;
      const py = (i * 37 + Math.sin(tick * 0.02 + i) * 20) % (STAGE_FLOOR_Y - 50);
      ctx.beginPath();
      ctx.arc(px, py + 100, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
