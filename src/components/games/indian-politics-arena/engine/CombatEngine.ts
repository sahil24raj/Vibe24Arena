import {
  ArenaConfig,
  CharacterConfig,
  CombatHitEvent,
  GameMode,
  MatchStats,
  PlayerInput
} from './types';
import {
  MAX_HP,
  ROUND_TIME_SECONDS
} from './constants';
import { Fighter } from './Fighter';
import { AIAgent } from './AIAgent';
import { FightingAudio } from '../audio/FightingAudio';

export class CombatEngine {
  public p1: Fighter;
  public p2: Fighter;
  public arena: ArenaConfig;
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

  public frameCount = 0;

  constructor(
    p1Char: CharacterConfig,
    p2Char: CharacterConfig,
    arena: ArenaConfig,
    mode: GameMode = 'quick'
  ) {
    this.arena = arena;
    this.mode = mode;
    this.audio = FightingAudio.getInstance();
    this.ai = new AIAgent('normal');

    this.p1 = new Fighter(1, p1Char, 380, true);
    this.p2 = new Fighter(2, p2Char, 580, false);
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

    // Pushbox Collision: Keep fighters separated by min 65px so they don't clip through each other
    const distBetween = Math.abs(this.p1.x - this.p2.x);
    if (distBetween < 65) {
      const pushAmount = (65 - distBetween) / 2;
      if (this.p1.x < this.p2.x) {
        this.p1.x = Math.max(80, this.p1.x - pushAmount);
        this.p2.x = Math.min(880, this.p2.x + pushAmount);
      } else {
        this.p1.x = Math.min(880, this.p1.x + pushAmount);
        this.p2.x = Math.max(80, this.p2.x - pushAmount);
      }
    }

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
    this.superCinematicTimer = 75; // 75 frames freeze (1.25s cinematic buildup)

    // Play signature super audio or character voice
    if (fighter.config.superSoundUrl) {
      this.audio.playClip(fighter.config.superSoundUrl, 1.0);
    } else {
      this.audio.playSuperCharge();
    }
    this.audio.playFighterVoice(fighter.config.id);
  }

  private handleHitEvent(hit: CombatHitEvent) {
    if (hit.blocked) {
      this.audio.playBlock();
    } else {
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
      roundWinner = 1;
    } else if (this.p1.hp <= 0) {
      roundWinner = 2;
    } else if (this.p2.hp <= 0) {
      roundWinner = 1;
    } else {
      roundWinner = this.p1.hp >= this.p2.hp ? 1 : 2;
    }

    if (roundWinner === 1) {
      this.p1Wins++;
    } else {
      this.p2Wins++;
    }

    this.audio.playKOVoice();

    if (this.p1Wins >= 2 || this.p2Wins >= 2) {
      this.isMatchOver = true;
      this.winner = this.p1Wins >= 2 ? 1 : 2;
      setTimeout(() => {
        if (this.winner === 1) this.audio.playWinVoice();
        else this.audio.playLoseVoice();
      }, 1200);
    } else {
      this.round++;
      this.timeRemaining = ROUND_TIME_SECONDS;
      this.p1.reset(380, true);
      this.p2.reset(580, false);
      setTimeout(() => {
        this.audio.playRoundVoice(this.round);
      }, 1000);
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
    this.p1.reset(380, true);
    this.p2.reset(580, false);
    this.audio.playRoundVoice(1);
    this.audio.playFighterVoice(this.p1.config.id);
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
      winner: this.winner,
      superActive: this.superCinematicActive,
      superCasterId: this.superCinematicFighter?.id,
      superMoveName: this.superCinematicFighter?.config.superName,
      superCharacterName: this.superCinematicFighter?.config.name,
      superFacePhoto: this.superCinematicFighter?.config.facePhoto,
      superIntroLine: this.superCinematicFighter?.config.introLine,
      superAccent: this.superCinematicFighter?.config.accent
    };
  }
}
