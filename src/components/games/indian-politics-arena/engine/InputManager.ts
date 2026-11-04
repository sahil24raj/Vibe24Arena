import { PlayerInput } from './types';

export class InputManager {
  private p1Input: PlayerInput = {
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

  private p2Input: PlayerInput = {
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

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundKeyUp: (e: KeyboardEvent) => void;
  public isTwoPlayerLocal = false;

  constructor() {
    this.boundKeyDown = this.handleKeyDown.bind(this);
    this.boundKeyUp = this.handleKeyUp.bind(this);
  }

  public attach() {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);
  }

  public detach() {
    if (typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }

  private handleKeyDown(e: KeyboardEvent) {
    const code = e.code;
    const key = e.key.toLowerCase();

    // Prevent scrolling on arrows/space
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
      e.preventDefault();
    }

    // --- PLAYER 1 (WASD + J/K/I/L/Space) ---
    if (code === 'KeyA' || (!this.isTwoPlayerLocal && code === 'ArrowLeft')) {
      this.p1Input.left = true;
    }
    if (code === 'KeyD' || (!this.isTwoPlayerLocal && code === 'ArrowRight')) {
      this.p1Input.right = true;
    }
    if (code === 'KeyW' || (!this.isTwoPlayerLocal && code === 'ArrowUp')) {
      this.p1Input.up = true;
    }
    if (code === 'KeyS' || (!this.isTwoPlayerLocal && code === 'ArrowDown')) {
      this.p1Input.down = true;
    }
    if (code === 'KeyJ') {
      this.p1Input.punch = true;
    }
    if (code === 'KeyK') {
      this.p1Input.kick = true;
    }
    if (code === 'KeyI' || (code === 'KeyJ' && e.shiftKey)) {
      this.p1Input.grab = true;
    }
    if (code === 'KeyL' || (!this.isTwoPlayerLocal && code === 'Space')) {
      this.p1Input.super = true;
    }

    // --- PLAYER 2 (Arrows + Numpad or B/N/M/H) when 2P Local Mode is active ---
    if (this.isTwoPlayerLocal) {
      if (code === 'ArrowLeft') this.p2Input.left = true;
      if (code === 'ArrowRight') this.p2Input.right = true;
      if (code === 'ArrowUp') this.p2Input.up = true;
      if (code === 'ArrowDown') this.p2Input.down = true;

      // Numpad 1 or B -> Punch
      if (code === 'Numpad1' || key === 'b') this.p2Input.punch = true;
      // Numpad 2 or N -> Kick
      if (code === 'Numpad2' || key === 'n') this.p2Input.kick = true;
      // Numpad 4 or H -> Grab
      if (code === 'Numpad4' || key === 'h') this.p2Input.grab = true;
      // Numpad 5 or M -> Super
      if (code === 'Numpad5' || key === 'm') this.p2Input.super = true;
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    const code = e.code;
    const key = e.key.toLowerCase();

    // P1 Releases
    if (code === 'KeyA' || (!this.isTwoPlayerLocal && code === 'ArrowLeft')) {
      this.p1Input.left = false;
    }
    if (code === 'KeyD' || (!this.isTwoPlayerLocal && code === 'ArrowRight')) {
      this.p1Input.right = false;
    }
    if (code === 'KeyW' || (!this.isTwoPlayerLocal && code === 'ArrowUp')) {
      this.p1Input.up = false;
    }
    if (code === 'KeyS' || (!this.isTwoPlayerLocal && code === 'ArrowDown')) {
      this.p1Input.down = false;
    }
    if (code === 'KeyJ') {
      this.p1Input.punch = false;
    }
    if (code === 'KeyK') {
      this.p1Input.kick = false;
    }
    if (code === 'KeyI') {
      this.p1Input.grab = false;
    }
    if (code === 'KeyL' || (!this.isTwoPlayerLocal && code === 'Space')) {
      this.p1Input.super = false;
    }

    // P2 Releases
    if (this.isTwoPlayerLocal) {
      if (code === 'ArrowLeft') this.p2Input.left = false;
      if (code === 'ArrowRight') this.p2Input.right = false;
      if (code === 'ArrowUp') this.p2Input.up = false;
      if (code === 'ArrowDown') this.p2Input.down = false;
      if (code === 'Numpad1' || key === 'b') this.p2Input.punch = false;
      if (code === 'Numpad2' || key === 'n') this.p2Input.kick = false;
      if (code === 'Numpad4' || key === 'h') this.p2Input.grab = false;
      if (code === 'Numpad5' || key === 'm') this.p2Input.super = false;
    }
  }

  public getP1Input(): PlayerInput {
    return { ...this.p1Input };
  }

  public getP2Input(): PlayerInput {
    return { ...this.p2Input };
  }

  // --- Mobile Touch API Hook ---
  public setMobileAction(action: keyof PlayerInput, active: boolean) {
    this.p1Input[action] = active;
  }

  public clearAll() {
    Object.keys(this.p1Input).forEach(k => {
      (this.p1Input as unknown as Record<string, boolean>)[k] = false;
    });
    Object.keys(this.p2Input).forEach(k => {
      (this.p2Input as unknown as Record<string, boolean>)[k] = false;
    });
  }
}

