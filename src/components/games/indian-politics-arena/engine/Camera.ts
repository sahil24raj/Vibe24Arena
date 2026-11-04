import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';

export class Camera {
  public x = CANVAS_WIDTH / 2;
  public y = CANVAS_HEIGHT / 2;
  public zoom = 1.0;
  public targetZoom = 1.0;
  private trauma = 0; // 0 to 1
  public shakeOffsetX = 0;
  public shakeOffsetY = 0;

  public update(p1X: number, p2X: number) {
    // 1. Center camera on midpoint of both fighters
    const midX = (p1X + p2X) / 2;
    this.x += (midX - this.x) * 0.1;

    // 2. Adjust zoom based on distance
    const dist = Math.abs(p1X - p2X);
    if (dist < 260) {
      this.targetZoom = 1.15; // Close-up melee zoom
    } else if (dist > 500) {
      this.targetZoom = 0.92; // Pull back
    } else {
      this.targetZoom = 1.0;
    }
    this.zoom += (this.targetZoom - this.zoom) * 0.05;

    // 3. Trauma Shake decay
    if (this.trauma > 0) {
      const shakePower = Math.pow(this.trauma, 2) * 18;
      this.shakeOffsetX = (Math.random() * 2 - 1) * shakePower;
      this.shakeOffsetY = (Math.random() * 2 - 1) * shakePower;
      this.trauma = Math.max(0, this.trauma - 0.05);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public applyTransform(ctx: CanvasRenderingContext2D) {
    ctx.translate(
      CANVAS_WIDTH / 2 + this.shakeOffsetX,
      CANVAS_HEIGHT / 2 + this.shakeOffsetY
    );
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.x, -CANVAS_HEIGHT / 2);
  }
}
