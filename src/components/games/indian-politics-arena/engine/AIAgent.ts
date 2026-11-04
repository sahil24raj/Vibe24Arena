import { AIDifficulty, PlayerInput } from './types';
import { Fighter } from './Fighter';

export class AIAgent {
  private difficulty: AIDifficulty;
  private actionCooldown = 0;
  private currentInput: PlayerInput = {
    left: false,
    right: false,
    up: false,
    down: false,
    punch: false,
    kick: false,
    grab: false,
    super: false,
    block: false
  };

  constructor(difficulty: AIDifficulty = 'normal') {
    this.difficulty = difficulty;
  }

  public setDifficulty(diff: AIDifficulty) {
    this.difficulty = diff;
  }

  public decide(aiFighter: Fighter, opponent: Fighter): PlayerInput {
    // Reset momentary attack buttons
    this.currentInput.punch = false;
    this.currentInput.kick = false;
    this.currentInput.grab = false;
    this.currentInput.super = false;
    this.currentInput.up = false;

    if (this.actionCooldown > 0) {
      this.actionCooldown--;
      return this.currentInput;
    }

    const dist = Math.abs(aiFighter.x - opponent.x);
    const opponentIsAttacking = opponent.state === 'attack';

    // Difficulty Settings:
    // Easy: slow reaction, rarely blocks, attacks sporadically
    // Normal: balanced spacing, blocks predictable attacks, combos
    // Hard: whiff punishes, mixes up low/high, executes Super when available

    if (this.difficulty === 'easy') {
      this.actionCooldown = 15;
      if (dist > 150) {
        // Move towards opponent
        this.currentInput.left = aiFighter.x > opponent.x;
        this.currentInput.right = aiFighter.x < opponent.x;
        this.currentInput.down = false;
      } else {
        this.currentInput.left = false;
        this.currentInput.right = false;
        // Random attack
        const roll = Math.random();
        if (roll < 0.4) this.currentInput.punch = true;
        else if (roll < 0.7) this.currentInput.kick = true;
      }
      return this.currentInput;
    }

    if (this.difficulty === 'normal') {
      this.actionCooldown = 8;

      // Defensive reaction if opponent is in active attack phase
      if (opponentIsAttacking && Math.random() < 0.65) {
        // Hold back to block
        this.currentInput.left = aiFighter.x < opponent.x;
        this.currentInput.right = aiFighter.x > opponent.x;
        this.currentInput.down = opponent.currentMove?.height === 'low';
        return this.currentInput;
      }

      // Check Super Move
      if (aiFighter.superMeter >= 100 && dist < 220 && Math.random() < 0.8) {
        this.currentInput.super = true;
        return this.currentInput;
      }

      if (dist > 180) {
        // Close the gap
        this.currentInput.left = aiFighter.x > opponent.x;
        this.currentInput.right = aiFighter.x < opponent.x;
        this.currentInput.down = false;
      } else {
        // In melee range: execute combo / mixup
        this.currentInput.left = false;
        this.currentInput.right = false;
        const roll = Math.random();
        if (roll < 0.35) {
          this.currentInput.punch = true;
        } else if (roll < 0.65) {
          this.currentInput.kick = true;
        } else if (roll < 0.8) {
          // Low mixup
          this.currentInput.down = true;
          this.currentInput.kick = true;
        } else {
          // Command grab attempt
          this.currentInput.grab = true;
        }
      }
      return this.currentInput;
    }

    // --- HARD DIFFICULTY ---
    this.actionCooldown = 4; // High frame responsiveness

    // Instant Super punish
    if (aiFighter.superMeter >= 100 && dist < 250) {
      this.currentInput.super = true;
      return this.currentInput;
    }

    // High/Low block discipline
    if (opponentIsAttacking && opponent.movePhase === 'active') {
      this.currentInput.left = aiFighter.x < opponent.x;
      this.currentInput.right = aiFighter.x > opponent.x;
      this.currentInput.down = opponent.currentMove?.height === 'low';
      return this.currentInput;
    }

    // If opponent is recovering from a whiff, punish!
    if (opponent.state === 'attack' && opponent.movePhase === 'recovery') {
      if (dist < 140) {
        this.currentInput.punch = true;
        return this.currentInput;
      }
    }

    // Footsies spacing
    if (dist > 220) {
      this.currentInput.left = aiFighter.x > opponent.x;
      this.currentInput.right = aiFighter.x < opponent.x;
      this.currentInput.down = false;
    } else if (dist < 80) {
      // Point blank: grab or uppercut
      if (Math.random() < 0.4) {
        this.currentInput.grab = true;
      } else {
        this.currentInput.punch = true;
      }
    } else {
      // Mid-range pokes
      const roll = Math.random();
      if (roll < 0.4) {
        this.currentInput.kick = true;
      } else if (roll < 0.7) {
        this.currentInput.down = true;
        this.currentInput.kick = true; // Sweep
      } else {
        // Forward special
        if (aiFighter.facingRight) this.currentInput.right = true;
        else this.currentInput.left = true;
        this.currentInput.punch = true;
      }
    }

    return this.currentInput;
  }
}
