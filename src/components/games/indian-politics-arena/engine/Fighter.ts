import {
  CharacterConfig,
  CombatHitEvent,
  FighterState,
  MoveDefinition,
  MoveId,
  PlayerInput
} from './types';
import {
  CANVAS_WIDTH,
  MAX_HP,
  MAX_SUPER,
  MOVES_TABLE,
  STAGE_FLOOR_Y,
  STAGE_LEFT_BOUND,
  STAGE_RIGHT_BOUND
} from './constants';

export class Fighter {
  public id: number; // 1 or 2
  public config: CharacterConfig;
  public x: number;
  public y: number;
  public vx = 0;
  public vy = 0;
  public facingRight: boolean;

  public hp = MAX_HP;
  public superMeter = 0;
  public wins = 0;

  public state: FighterState = 'idle';
  public currentMove: MoveDefinition | null = null;
  public movePhase: 'startup' | 'active' | 'recovery' | null = null;
  public moveFrame = 0;
  public hitConfirmed = false; // Prevents multi-hits on single active window

  public stunFrames = 0;
  public isInvulnerable = false;
  public animTick = 0;
  public comboCounter = 0;
  public comboResetTimer = 0;

  constructor(id: number, config: CharacterConfig, startX: number, facingRight: boolean) {
    this.id = id;
    this.config = config;
    this.x = startX;
    this.y = STAGE_FLOOR_Y;
    this.facingRight = facingRight;
  }

  public reset(startX: number, facingRight: boolean) {
    this.x = startX;
    this.y = STAGE_FLOOR_Y;
    this.vx = 0;
    this.vy = 0;
    this.facingRight = facingRight;
    this.hp = MAX_HP;
    this.superMeter = 0;
    this.state = 'idle';
    this.currentMove = null;
    this.movePhase = null;
    this.moveFrame = 0;
    this.hitConfirmed = false;
    this.stunFrames = 0;
    this.isInvulnerable = false;
    this.comboCounter = 0;
  }

  public update(input: PlayerInput, opponent: Fighter): CombatHitEvent | null {
    this.animTick++;

    // Combo reset countdown
    if (this.comboResetTimer > 0) {
      this.comboResetTimer--;
      if (this.comboResetTimer <= 0) {
        this.comboCounter = 0;
      }
    }

    // Auto-face opponent unless locked in attack / knockdown / stun
    if (this.isMovable()) {
      if (this.x < opponent.x) {
        this.facingRight = true;
      } else {
        this.facingRight = false;
      }
    }

    // Handle Stun (Hitstun / Blockstun)
    if (this.stunFrames > 0) {
      this.stunFrames--;
      this.applyFriction();
      this.applyPhysics();
      if (this.stunFrames <= 0) {
        if (this.state === 'knockdown') {
          this.state = 'wakeup';
          this.stunFrames = 18;
          this.isInvulnerable = true;
        } else if (this.state === 'wakeup') {
          this.state = 'idle';
          this.isInvulnerable = false;
        } else {
          this.state = 'idle';
        }
      }
      return null;
    }

    // If locked in Super Cinematic
    if (this.state === 'super') {
      this.moveFrame++;
      if (this.moveFrame > 60) {
        this.state = 'idle';
      }
      return null;
    }

    // Handle Attack Execution
    if (this.state === 'attack' && this.currentMove) {
      return this.updateAttack(input, opponent);
    }

    // Handle Ground vs Air
    if (this.isGrounded()) {
      this.handleGroundMovement(input, opponent);
    } else {
      this.handleAirMovement(input);
    }

    this.applyPhysics();
    this.constrainBounds();
    return null;
  }

  private handleGroundMovement(input: PlayerInput, opponent: Fighter) {
    const isMovingForward =
      (this.facingRight && input.right) || (!this.facingRight && input.left);
    const isMovingBack =
      (this.facingRight && input.left) || (!this.facingRight && input.right);

    // 1. Check Super Attack Input
    if (input.super && this.superMeter >= MAX_SUPER) {
      this.triggerSuper();
      return;
    }

    // 2. Check Attacks
    if (input.grab) {
      this.initiateMove('grab');
      return;
    }

    if (input.down) {
      // Crouching
      this.state = 'crouch';
      this.vx = 0;
      if (input.punch) {
        this.initiateMove('lowJab');
        return;
      }
      if (input.kick) {
        this.initiateMove('sweep');
        return;
      }
      return;
    }

    // Check Command Specials (Forward + Punch / Kick)
    if (isMovingForward) {
      if (input.punch) {
        this.initiateMove('special1');
        return;
      }
      if (input.kick) {
        this.initiateMove('special2');
        return;
      }
    }

    // Neutral Attacks
    if (input.punch) {
      this.initiateMove('jab');
      return;
    }
    if (input.kick) {
      this.initiateMove('kick');
      return;
    }

    // Jump
    if (input.up) {
      this.state = 'jump';
      this.vy = -this.config.jumpV;
      if (isMovingForward) this.vx = (this.facingRight ? 1 : -1) * this.config.jumpVx;
      else if (isMovingBack) this.vx = (this.facingRight ? -1 : 1) * this.config.jumpVx;
      return;
    }

    // Horizontal Movement & Guarding
    if (isMovingForward) {
      this.state = 'walk_fwd';
      this.vx = (this.facingRight ? 1 : -1) * this.config.walkFwd;
    } else if (isMovingBack) {
      this.state = 'walk_back';
      this.vx = (this.facingRight ? -1 : 1) * this.config.walkBack;
    } else {
      this.state = 'idle';
      this.vx = 0;
    }
  }

  private handleAirMovement(input: PlayerInput) {
    if (input.punch) {
      this.initiateMove('airPunch');
    } else if (input.kick) {
      this.initiateMove('airKick');
    }
  }

  public initiateMove(moveId: MoveId) {
    const moveDef = MOVES_TABLE[moveId];
    if (!moveDef) return;

    this.state = 'attack';
    this.currentMove = moveDef;
    this.movePhase = 'startup';
    this.moveFrame = 0;
    this.hitConfirmed = false;

    // Apply forward lunge if applicable
    if (moveDef.lunge > 0 && this.isGrounded()) {
      this.vx = (this.facingRight ? 1 : -1) * moveDef.lunge;
    }
  }

  private updateAttack(input: PlayerInput, opponent: Fighter): CombatHitEvent | null {
    if (!this.currentMove) return null;
    this.moveFrame++;

    const totalStartup = this.currentMove.startup;
    const totalActive = totalStartup + this.currentMove.active;
    const totalDuration = totalActive + this.currentMove.recovery;

    // Phase Transitions
    if (this.moveFrame <= totalStartup) {
      this.movePhase = 'startup';
    } else if (this.moveFrame <= totalActive) {
      this.movePhase = 'active';

      // Check hit against opponent hurtbox
      if (!this.hitConfirmed) {
        const hitResult = this.checkHit(opponent);
        if (hitResult) {
          this.hitConfirmed = true;
          return hitResult;
        }
      }
    } else if (this.moveFrame <= totalDuration) {
      this.movePhase = 'recovery';

      // Combo Cancelling: If hit was confirmed, buffer chains
      if (this.hitConfirmed && this.currentMove.chains) {
        if (input.punch && this.currentMove.chains.punch) {
          this.initiateMove(this.currentMove.chains.punch);
          return null;
        }
        if (input.kick && this.currentMove.chains.kick) {
          this.initiateMove(this.currentMove.chains.kick);
          return null;
        }
      }
    } else {
      // Move Complete
      this.currentMove = null;
      this.movePhase = null;
      this.state = this.isGrounded() ? 'idle' : 'fall';
    }

    this.applyPhysics();
    this.constrainBounds();
    return null;
  }

  private checkHit(opponent: Fighter): CombatHitEvent | null {
    if (opponent.isInvulnerable || opponent.hp <= 0) return null;
    if (!this.currentMove) return null;

    // Calculate Hitbox & Target Hurtbox distance
    const dist = Math.abs(this.x - opponent.x);
    const reachLimit = 95 * this.currentMove.reach;

    // Vertical overlap test
    const yDiff = Math.abs(this.y - opponent.y);
    if (yDiff > 70 && !this.currentMove.air) return null;

    if (dist <= reachLimit) {
      // Check Guard / Block status
      const isOpponentGuarding =
        (opponent.facingRight && opponent.x > this.x) ||
        (!opponent.facingRight && opponent.x < this.x);

      let isBlocked = false;
      if (this.currentMove.grab) {
        // Grab is unblockable if standing, but whiffs on crouch or jump
        isBlocked = false;
      } else if (isOpponentGuarding) {
        if (this.currentMove.height === 'low' && opponent.state === 'crouch') {
          isBlocked = true;
        } else if (this.currentMove.height === 'high' && opponent.state !== 'crouch') {
          isBlocked = true;
        } else if (this.currentMove.height === 'mid') {
          isBlocked = true;
        }
      }

      // Calculate Damage
      const rawDamage = this.currentMove.damage * this.config.damageMul;
      const finalDamage = isBlocked
        ? Math.max(1, Math.floor(rawDamage * 0.12)) // Minor chip damage
        : Math.floor(rawDamage / opponent.config.defenseMul);

      // Apply to Opponent
      opponent.takeDamage(finalDamage, isBlocked, this.currentMove, this);

      // Grant Super Meter
      this.superMeter = Math.min(MAX_SUPER, this.superMeter + 6);
      opponent.superMeter = Math.min(MAX_SUPER, opponent.superMeter + 9);

      // Combo update
      if (!isBlocked) {
        this.comboCounter++;
        this.comboResetTimer = 45; // 45 frames window to chain
      }

      const hitX = (this.x + opponent.x) / 2;
      const hitY = this.y - 75;

      return {
        attackerId: this.id,
        targetId: opponent.id,
        damage: finalDamage,
        blocked: isBlocked,
        hitX,
        hitY,
        moveName: this.currentMove.name,
        knockdown: !isBlocked && this.currentMove.knockdown
      };
    }

    return null;
  }

  public takeDamage(
    amount: number,
    isBlocked: boolean,
    move: MoveDefinition,
    attacker: Fighter
  ) {
    this.hp = Math.max(0, this.hp - amount);

    const pushDir = attacker.x < this.x ? 1 : -1;

    if (isBlocked) {
      this.state = 'blockstun';
      this.stunFrames = move.blockstun;
      this.vx = pushDir * (move.push * 0.4);
    } else {
      if (move.knockdown || this.hp <= 0) {
        this.state = 'knockdown';
        this.stunFrames = 35;
        this.vx = pushDir * (move.push * 0.8);
        this.vy = -move.launch;
      } else {
        this.state = 'hitstun';
        this.stunFrames = move.hitstun;
        this.vx = pushDir * move.push;
      }
    }
  }

  public triggerSuper() {
    this.superMeter = 0;
    this.state = 'super';
    this.moveFrame = 0;
    this.vx = 0;
  }

  private applyPhysics() {
    // Gravity
    if (!this.isGrounded()) {
      this.vy += 0.65; // gravity constant
      this.y += this.vy;
      if (this.y >= STAGE_FLOOR_Y) {
        this.y = STAGE_FLOOR_Y;
        this.vy = 0;
        if (this.state === 'fall' || this.state === 'jump') {
          this.state = 'landing';
          this.stunFrames = 4;
        }
      }
    }

    // Horizontal Velocity & Friction
    this.x += this.vx;
    this.applyFriction();
  }

  private applyFriction() {
    if (this.isGrounded()) {
      this.vx *= 0.82;
      if (Math.abs(this.vx) < 0.1) this.vx = 0;
    } else {
      this.vx *= 0.96;
    }
  }

  private constrainBounds() {
    if (this.x < STAGE_LEFT_BOUND) {
      this.x = STAGE_LEFT_BOUND;
      this.vx = 0;
    } else if (this.x > STAGE_RIGHT_BOUND) {
      this.x = STAGE_RIGHT_BOUND;
      this.vx = 0;
    }
  }

  public isGrounded(): boolean {
    return this.y >= STAGE_FLOOR_Y;
  }

  public isMovable(): boolean {
    return (
      this.state !== 'attack' &&
      this.state !== 'hitstun' &&
      this.state !== 'blockstun' &&
      this.state !== 'knockdown' &&
      this.state !== 'wakeup' &&
      this.state !== 'super'
    );
  }
}
