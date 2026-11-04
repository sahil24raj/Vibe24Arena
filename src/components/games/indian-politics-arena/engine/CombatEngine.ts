import {
  ArenaConfig,
  CharacterConfig,
  CombatHitEvent,
  GameMode,
  MatchStats,
  PlayerInput
} from './types';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MAX_HP,
  ROUND_TIME_SECONDS
} from './constants';
import { Fighter } from './Fighter';
import { AIAgent } from './AIAgent';
import { Camera } from './Camera';
import { ParticleSystem } from './ParticleSystem';
import { FightingAudio } from '../audio/FightingAudio';
import { ArenaRenderer } from './ArenaRenderer';
import { CharacterRenderer } from './CharacterRenderer';

export class CombatEngine {
  public p1: Fighter;
  public p2: Fighter;
  public arena: ArenaConfig;
  public camera: Camera;
  public particles: ParticleSystem;
  public audio: FightingAudio;
  public ai: AIAgent;

  public mode: GameMode = 'quick';
  public round = 1;
  public p1Wins = 0;
  public p2Wins = 0;
  public timeRemaining = ROUND_TIME_SECONDS;
  public timerInterval = 0;
  public isMatchOver = false;
  public winner: number | null = null;
  public isPaused = false;

  // Super Move Cinematic State
  public superCinematicActive = false;
  public superCinematicFighter: Fighter | null = null;
  public superCinematicTimer = 0;

  // Slow-Mo KO
  public slowMoFactor = 1.0;
  public slowMoTimer = 0;

  public frameCount = 0;

  constructor(
    p1Char: CharacterConfig,
    p2Char: CharacterConfig,
    arena: ArenaConfig,
    mode: GameMode = 'quick'
  ) {
    this.arena = arena;
    this.mode = mode;
    this.camera = new Camera();
    this.particles = new ParticleSystem();
    this.audio = FightingAudio.getInstance();
    this.ai = new AIAgent('normal');

    this.p1 = new Fighter(1, p1Char, 300, true);
    this.p2 = new Fighter(2, p2Char, 660, false);
  }

  public update(p1Input: PlayerInput, p2InputOverride?: PlayerInput): CombatHitEvent[] {
    if (this.isPaused) return [];
    this.frameCount++;

    const hits: CombatHitEvent[] = [];

    // Handle Super Cinematic Freeze
    if (this.superCinematicActive) {
      this.superCinematicTimer--;
      if (this.superCinematicTimer <= 0) {
        this.superCinematicActive = false;
        // Deliver Super Hit!
        if (this.superCinematicFighter) {
          const target = this.superCinematicFighter.id === 1 ? this.p2 : this.p1;
          const superDmg = Math.floor(32 * this.superCinematicFighter.config.damageMul);
          target.takeDamage(
            superDmg,
            false,
            {
              id: 'special1',
              name: this.superCinematicFighter.config.superName,
              startup: 0,
              active: 0,
              recovery: 0,
              damage: superDmg,
              height: 'mid',
              reach: 1,
              hitstun: 40,
              blockstun: 20,
              knockdown: true,
              launch: 10,
              push: 80,
              lunge: 0
            },
            this.superCinematicFighter
          );

          this.particles.spawnSuperExplosion(
            target.x,
            target.y - 80,
            this.superCinematicFighter.config.accent
          );
          this.camera.addTrauma(0.85);
          this.audio.playSuperExplosion();

          hits.push({
            attackerId: this.superCinematicFighter.id,
            targetId: target.id,
            damage: superDmg,
            blocked: false,
            hitX: target.x,
            hitY: target.y - 80,
            moveName: this.superCinematicFighter.config.superName,
            knockdown: true,
            isSuper: true
          });
        }
      }
      return hits;
    }

    // Determine P2 Input (Local 2P override, Online input, or AI)
    let p2Input: PlayerInput;
    if (p2InputOverride) {
      p2Input = p2InputOverride;
    } else {
      p2Input = this.ai.decide(this.p2, this.p1);
    }

    // Check Trigger of Super Move
    if (p1Input.super && this.p1.superMeter >= 100 && !this.p1.currentMove) {
      this.triggerSuperCinematic(this.p1);
      return hits;
    }
    if (p2Input.super && this.p2.superMeter >= 100 && !this.p2.currentMove) {
      this.triggerSuperCinematic(this.p2);
      return hits;
    }

    // Update Fighters
    const hit1 = this.p1.update(p1Input, this.p2);
    const hit2 = this.p2.update(p2Input, this.p1);

    if (hit1) {
      hits.push(hit1);
      this.handleHitEvent(hit1);
    }
    if (hit2) {
      hits.push(hit2);
      this.handleHitEvent(hit2);
    }

    // Update Particles & Camera
    this.particles.update();
    this.camera.update(this.p1.x, this.p2.x);

    // Check Round Timer & Knockouts
    if (!this.isMatchOver) {
      this.timerInterval++;
      if (this.timerInterval >= 60) {
        this.timerInterval = 0;
        if (this.timeRemaining > 0) {
          this.timeRemaining--;
        }
      }

      // Check Round End Conditions
      if (this.p1.hp <= 0 || this.p2.hp <= 0 || this.timeRemaining <= 0) {
        this.resolveRoundEnd();
      }
    }

    return hits;
  }

  private triggerSuperCinematic(fighter: Fighter) {
    fighter.superMeter = 0;
    this.superCinematicActive = true;
    this.superCinematicFighter = fighter;
    this.superCinematicTimer = 35; // 35 frames freeze
    this.audio.playSuperCharge();
    this.camera.addTrauma(0.5);
  }

  private handleHitEvent(hit: CombatHitEvent) {
    this.camera.addTrauma(hit.blocked ? 0.15 : 0.4);

    if (hit.blocked) {
      this.particles.spawnBlockSparks(hit.hitX, hit.hitY);
      this.audio.playBlock();
    } else {
      this.particles.spawnHitSparks(hit.hitX, hit.hitY, '#FFD700', hit.knockdown ? 22 : 12);
      if (hit.knockdown) {
        this.audio.playHitHeavy();
      } else {
        this.audio.playPunch();
      }
    }
  }

  private resolveRoundEnd() {
    let roundWinner: number;
    if (this.p1.hp <= 0 && this.p2.hp <= 0) {
      // Double KO -> Tie breaker to higher remaining
      roundWinner = 1;
    } else if (this.p1.hp <= 0) {
      roundWinner = 2;
    } else if (this.p2.hp <= 0) {
      roundWinner = 1;
    } else {
      // Time over
      roundWinner = this.p1.hp >= this.p2.hp ? 1 : 2;
    }

    if (roundWinner === 1) {
      this.p1Wins++;
    } else {
      this.p2Wins++;
    }

    if (this.p1Wins >= 2 || this.p2Wins >= 2) {
      // Match Won!
      this.isMatchOver = true;
      this.winner = this.p1Wins >= 2 ? 1 : 2;
      this.audio.playVictoryTheme();
    } else {
      // Reset for next round
      this.round++;
      this.timeRemaining = ROUND_TIME_SECONDS;
      this.p1.reset(300, true);
      this.p2.reset(660, false);
      this.audio.playRoundAnnounce();
    }
  }

  public restartMatch() {
    this.round = 1;
    this.p1Wins = 0;
    this.p2Wins = 0;
    this.timeRemaining = ROUND_TIME_SECONDS;
    this.isMatchOver = false;
    this.winner = null;
    this.isPaused = false;
    this.superCinematicActive = false;
    this.p1.reset(300, true);
    this.p2.reset(660, false);
    this.particles.clear();
    this.audio.playRoundAnnounce();
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Arena (Background + Parallax + Floor)
    ArenaRenderer.renderArena(ctx, this.arena, this.camera.shakeOffsetX, this.frameCount);

    // 2. Apply Camera World Transform for In-Fight Entities
    ctx.save();
    this.camera.applyTransform(ctx);

    // Draw Particles
    this.particles.render(ctx);

    // Render P1 Fighter
    CharacterRenderer.renderFighter(
      ctx,
      this.p1.config,
      this.p1.x,
      this.p1.y,
      this.p1.facingRight,
      this.p1.state,
      this.p1.currentMove?.id ?? null,
      this.frameCount,
      this.p1.state === 'hitstun',
      this.p1.superMeter >= 100
    );

    // Render P2 Fighter
    CharacterRenderer.renderFighter(
      ctx,
      this.p2.config,
      this.p2.x,
      this.p2.y,
      this.p2.facingRight,
      this.p2.state,
      this.p2.currentMove?.id ?? null,
      this.frameCount,
      this.p2.state === 'hitstun',
      this.p2.superMeter >= 100
    );

    ctx.restore();

    // 3. Super Move Cinematic Dramatic Banner Overlay
    if (this.superCinematicActive && this.superCinematicFighter) {
      this.renderSuperCinematicBanner(ctx, this.superCinematicFighter);
    }

    ctx.restore();
  }

  private renderSuperCinematicBanner(ctx: CanvasRenderingContext2D, fighter: Fighter) {
    ctx.save();
    // Dark letterbox cinema bars
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 180, CANVAS_WIDTH, 180);

    // Golden / Character Accent Border
    ctx.strokeStyle = fighter.config.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 180, CANVAS_WIDTH, 180);

    // Title
    ctx.fillStyle = fighter.config.accent;
    ctx.font = '900 42px "Bebas Neue", sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = fighter.config.accent;
    ctx.shadowBlur = 20;
    ctx.fillText(`⚡ ${fighter.config.superName} ⚡`, CANVAS_WIDTH / 2, 245);

    // Tagline / Quote
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 18px sans-serif';
    ctx.shadowBlur = 0;
    ctx.fillText(`"${fighter.config.introLine}"`, CANVAS_WIDTH / 2, 285);
    ctx.fillText(`${fighter.config.superDesc}`, CANVAS_WIDTH / 2, 315);

    ctx.restore();
  }

  public getStats(): MatchStats {
    return {
      round: this.round,
      p1Wins: this.p1Wins,
      p2Wins: this.p2Wins,
      p1Hp: this.p1.hp,
      p2Hp: this.p2.hp,
      p1Super: this.p1.superMeter,
      p2Super: this.p2.superMeter,
      p1Combo: this.p1.comboCounter,
      p2Combo: this.p2.comboCounter,
      timeRemaining: this.timeRemaining,
      isOver: this.isMatchOver,
      winner: this.winner
    };
  }
}
