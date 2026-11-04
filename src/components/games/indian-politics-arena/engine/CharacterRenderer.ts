import { CharacterConfig, FighterState, MoveId } from './types';

export class CharacterRenderer {
  public static renderFighter(
    ctx: CanvasRenderingContext2D,
    config: CharacterConfig,
    x: number,
    y: number,
    facingRight: boolean,
    state: FighterState,
    currentMove: MoveId | null,
    frameCounter: number,
    isHit: boolean,
    isSuperActive: boolean
  ) {
    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    // Shadow on floor
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    const shadowWidth = state === 'crouch' ? 55 : 45;
    ctx.ellipse(0, 0, shadowWidth, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hit flash / trauma shake
    if (isHit && Math.floor(frameCounter / 2) % 2 === 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FF0055';
      ctx.shadowBlur = 20;
    }

    // Super aura
    if (isSuperActive) {
      ctx.save();
      const pulse = 15 + Math.sin(frameCounter * 0.2) * 8;
      ctx.strokeStyle = config.accent;
      ctx.lineWidth = 3;
      ctx.shadowColor = config.accent;
      ctx.shadowBlur = pulse;
      ctx.strokeRect(-40, -170, 80, 170);
      ctx.restore();
    }

    // Dynamic animation offsets based on state
    let headY = -120;
    let bodyY = -75;
    let armLeftAngle = 0.2;
    let armRightAngle = -0.4;
    let legLeftAngle = 0;
    let legRightAngle = 0;

    const idleBob = Math.sin(frameCounter * 0.08) * 3;

    if (state === 'idle') {
      headY += idleBob;
      bodyY += idleBob * 0.8;
      armRightAngle += Math.sin(frameCounter * 0.08) * 0.1;
      armLeftAngle -= Math.sin(frameCounter * 0.08) * 0.1;
    } else if (state === 'walk_fwd') {
      const walkCycle = Math.sin(frameCounter * 0.25);
      legLeftAngle = walkCycle * 0.5;
      legRightAngle = -walkCycle * 0.5;
      armLeftAngle = -walkCycle * 0.4;
      armRightAngle = walkCycle * 0.4;
      headY += Math.abs(walkCycle) * 4;
    } else if (state === 'walk_back') {
      const walkCycle = Math.sin(frameCounter * 0.2);
      legLeftAngle = -walkCycle * 0.4;
      legRightAngle = walkCycle * 0.4;
      armLeftAngle = walkCycle * 0.3;
      armRightAngle = -walkCycle * 0.3;
    } else if (state === 'crouch') {
      headY = -85;
      bodyY = -50;
      legLeftAngle = 0.8;
      legRightAngle = 0.8;
    } else if (state === 'jump' || state === 'fall') {
      headY = -135;
      bodyY = -90;
      legLeftAngle = -0.4;
      legRightAngle = 0.5;
      armLeftAngle = -1.2;
      armRightAngle = 1.0;
    } else if (state === 'hitstun') {
      headY = -115;
      bodyY = -70;
      armLeftAngle = -1.4;
      armRightAngle = -0.8;
      ctx.rotate(-0.15);
    } else if (state === 'knockdown') {
      // Horizontal knocked down on floor
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-70, 30);
    } else if (state === 'attack') {
      if (currentMove === 'jab' || currentMove === 'cross') {
        armRightAngle = 1.5; // Straight punch forward
        armLeftAngle = -0.3; // Guard hand back
      } else if (currentMove === 'uppercut') {
        armRightAngle = -2.2; // Rising fist
        headY -= 10;
      } else if (currentMove === 'kick') {
        legRightAngle = 1.4; // Front kick
        bodyY += 5;
      } else if (currentMove === 'roundhouse') {
        legRightAngle = 1.9; // High head kick
        ctx.rotate(-0.1);
      } else if (currentMove === 'sweep') {
        headY = -80;
        bodyY = -45;
        legRightAngle = 1.6; // Ground sweep
      } else if (currentMove === 'special1' || currentMove === 'special2') {
        armRightAngle = 1.7;
        armLeftAngle = 1.2;
        // Energy sparks around hands
        ctx.save();
        ctx.fillStyle = config.accent;
        ctx.shadowColor = config.accent;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(60, -85, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    // --- DRAW FIGHTER BODY PARTS ---

    // 1. Back Arm
    this.drawLimb(ctx, -15, bodyY - 15, 28, armLeftAngle, config.secondaryColor, '#D1D5DB');

    // 2. Back Leg
    this.drawLeg(ctx, -12, bodyY + 30, 42, legLeftAngle, '#1F2937', '#111827');

    // 3. Front Leg
    this.drawLeg(ctx, 12, bodyY + 30, 42, legRightAngle, '#374151', '#111827');

    // 4. Torso / Clothes (Customized per character)
    this.drawTorso(ctx, 0, bodyY, config);

    // 5. Head & Facial Hair / Accessories
    this.drawHead(ctx, 0, headY, config, state);

    // 6. Front Arm
    this.drawLimb(ctx, 18, bodyY - 15, 30, armRightAngle, config.accent, '#F3F4F6');

    // 7. Attack Effects (Punch Trails / Kick Swooshes)
    if (state === 'attack' && currentMove) {
      this.drawAttackFx(ctx, currentMove, config.accent);
    }

    ctx.restore();
  }

  private static drawLimb(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    length: number,
    angle: number,
    color: string,
    handColor: string
  ) {
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    // Sleeve / Arm
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-7, 0, 14, length, 6);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fist / Hand
    ctx.fillStyle = handColor;
    ctx.beginPath();
    ctx.arc(0, length + 4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private static drawLeg(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    length: number,
    angle: number,
    pantsColor: string,
    shoeColor: string
  ) {
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    // Pants
    ctx.fillStyle = pantsColor;
    ctx.beginPath();
    ctx.roundRect(-8, 0, 16, length, 5);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Shoes / Kolhapuri / Formal Shoes
    ctx.fillStyle = shoeColor;
    ctx.beginPath();
    ctx.roundRect(-8, length - 2, 22, 10, 4);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  private static drawTorso(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    config: CharacterConfig
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Main Jacket / Kurta / Suit
    ctx.fillStyle = config.accent;
    ctx.beginPath();
    ctx.roundRect(-22, -35, 44, 68, 10);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Collar / Shawl / Nehru Jacket details
    ctx.fillStyle = config.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(-16, -35);
    ctx.lineTo(0, -10);
    ctx.lineTo(16, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Center button line
    ctx.strokeStyle = '#F9FAFB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, 25);
    ctx.stroke();

    // Signature Character Chest Badge / Emblem
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(10, -20, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private static drawHead(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    config: CharacterConfig,
    state: FighterState
  ) {
    ctx.save();
    ctx.translate(x, y);

    // Neck
    ctx.fillStyle = '#E5E7EB';
    ctx.fillRect(-6, 12, 12, 14);

    // Face / Head Shape
    ctx.fillStyle = '#F3F4F6';
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Character-Specific Hair / Turbans / Accessories
    if (config.id === 'chai_commander') {
      // White neat hair + beard + spectacles
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(0, -10, 18, Math.PI, 0); // top hair
      ctx.fill();

      // White Beard
      ctx.beginPath();
      ctx.arc(0, 10, 16, 0, Math.PI);
      ctx.fill();
      ctx.stroke();

      // Glasses
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, -4, 8, 8);
      ctx.strokeRect(-12, -4, 8, 8);
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(2, 0);
      ctx.stroke();
    } else if (config.id === 'vikas_baba') {
      // Saffron wrap / bald crown with saffron tilak
      ctx.fillStyle = '#FF9933';
      ctx.beginPath();
      ctx.fillRect(-3, -12, 6, 10);
      ctx.fill();

      // Determined thick brows
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-2, -3);
      ctx.moveTo(2, -3);
      ctx.lineTo(10, -5);
      ctx.stroke();
    } else if (config.id === 'dharna_king') {
      // Muffler wrap around head/neck + spectacles
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.roundRect(-22, 10, 44, 14, 6);
      ctx.fill();
      ctx.stroke();

      // Round wireframe spectacles
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(6, 0, 5, 0, Math.PI * 2);
      ctx.arc(-6, 0, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (config.id === 'budget_boss') {
      // Neat formal hair bun
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(-16, -8, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (config.id === 'media_master') {
      // Broadcaster headset with boom mic
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, -8, 20, Math.PI, 0);
      ctx.stroke();

      // Mic arm pointing to mouth
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(8, 10);
      ctx.stroke();
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(8, 10, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Modern side-part hair
      ctx.fillStyle = '#1F2937';
      ctx.beginPath();
      ctx.arc(0, -8, 19, Math.PI * 0.9, Math.PI * 0.1);
      ctx.fill();
    }

    // Eyes
    ctx.fillStyle = '#111827';
    if (state === 'hitstun' || state === 'knockdown') {
      // X X eyes when knocked down
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText('X', -8, 2);
      ctx.fillText('X', 4, 2);
    } else {
      ctx.beginPath();
      ctx.arc(-5, -1, 2.5, 0, Math.PI * 2);
      ctx.arc(6, -1, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (state === 'attack') {
      // Open battle shout
      ctx.fillStyle = '#B91C1C';
      ctx.ellipse(2, 9, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.moveTo(-3, 8);
      ctx.lineTo(5, 8);
      ctx.stroke();
    }

    ctx.restore();
  }

  private static drawAttackFx(
    ctx: CanvasRenderingContext2D,
    move: MoveId,
    accent: string
  ) {
    ctx.save();
    ctx.strokeStyle = accent;
    ctx.fillStyle = accent;
    ctx.lineWidth = 4;

    if (move === 'jab' || move === 'cross') {
      // Impact line trail
      ctx.beginPath();
      ctx.moveTo(35, -75);
      ctx.lineTo(65, -75);
      ctx.stroke();
    } else if (move === 'kick' || move === 'roundhouse') {
      // Arc slash
      ctx.beginPath();
      ctx.arc(20, -50, 45, -0.4, 0.6);
      ctx.stroke();
    } else if (move === 'uppercut') {
      // Vertical upward streak
      ctx.beginPath();
      ctx.moveTo(25, -60);
      ctx.lineTo(35, -130);
      ctx.stroke();
    }
    ctx.restore();
  }
}
