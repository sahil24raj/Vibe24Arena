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
      this.actionCooldown = 12;
      if (dist > 90) {
        // Aggressively close the distance towards opponent
        this.currentInput.left = aiFighter.x > opponent.x;
        this.currentInput.right = aiFighter.x < opponent.x;
        this.currentInput.down = false;
      } else {
        this.currentInput.left = false;
        this.currentInput.right = false;
        // Point-blank melee attacks
        const roll = Math.random();
        if (roll < 0.45) this.currentInput.punch = true;
        else if (roll < 0.8) this.currentInput.kick = true;
        else if (roll < 0.9) this.currentInput.grab = true;
      }
      return this.currentInput;
    }

    if (this.difficulty === 'normal') {
      this.actionCooldown = 6;

      // Defensive reaction if opponent is in active attack phase
      if (opponentIsAttacking && Math.random() < 0.6) {
        // Hold back to block
        this.currentInput.left = aiFighter.x < opponent.x;
        this.currentInput.right = aiFighter.x > opponent.x;
        this.currentInput.down = opponent.currentMove?.height === 'low';
        return this.currentInput;
      }

      // Check Super Move when meter is charged
      if (aiFighter.superMeter >= 100 && dist < 160 && Math.random() < 0.85) {
        this.currentInput.super = true;
        return this.currentInput;
      }

      if (dist > 85) {
        // Relentlessly close the gap until point-blank
        this.currentInput.left = aiFighter.x > opponent.x;
        this.currentInput.right = aiFighter.x < opponent.x;
        this.currentInput.down = false;
      } else {
        // In point-blank melee striking range: execute dynamic combos & mixups
        this.currentInput.left = false;
        this.currentInput.right = false;
        const roll = Math.random();
        if (roll < 0.38) {
          this.currentInput.punch = true;
        } else if (roll < 0.7) {
          this.currentInput.kick = true;
        } else if (roll < 0.85) {
          // Low ankle sweep
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
    this.actionCooldown = 3; // Frame-perfect responsiveness

    // Instant Super punish if in range
    if (aiFighter.superMeter >= 100 && dist < 180) {
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

    // Whiff punish
    if (opponent.state === 'attack' && opponent.movePhase === 'recovery') {
      if (dist < 110) {
        this.currentInput.punch = true;
        return this.currentInput;
      }
    }

    if (dist > 80) {
      // Aggressively hunt down player
      this.currentInput.left = aiFighter.x > opponent.x;
      this.currentInput.right = aiFighter.x < opponent.x;
      this.currentInput.down = false;
    } else {
      // Point blank: grab, uppercut, or low kick
      const roll = Math.random();
      if (roll < 0.35) {
        this.currentInput.grab = true;
      } else if (roll < 0.65) {
        this.currentInput.punch = true;
      } else {
        this.currentInput.down = true;
        this.currentInput.kick = true;
      }
    }

    return this.currentInput;
  }
}

