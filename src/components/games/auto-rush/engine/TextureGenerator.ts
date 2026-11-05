import * as THREE from 'three';

/**
 * Procedural Texture Generator for Tirri Run (Reverse-engineered from autorush.autos)
 * Generates high-performance, photorealistic canvas textures for:
 * - Indian Asphalt Roads (lanes, tyre grooves, aggregate noise, micro-cracks, tar patches)
 * - Indian Yellow/Black Curb Stones (with mortar lines and weathering)
 * - Modern Glass Skyscraper Facades (reflective grid, interior office glows)
 * - Indian Residential Houses (Ghar) (stucco plaster, balconies, AC units, windows)
 * - Ground-floor Dukan/Shopfronts (colorful signs, metal roll-up shutters)
 * - Checkered Start/Finish Racing Lines
 * - National Highway Overhead Signs
 */
export class TextureGenerator {
  private static cachedTextures: Map<string, THREE.Texture> = new Map();

  /**
   * Simple seeded pseudo-random number generator
   */
  private static createSeededRandom(seed: number) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /**
   * Generates authentic Indian road asphalt texture matching autorush.autos
   */
  public static createAsphaltTexture(widthMeters = 16, worn = false): THREE.Texture {
    const key = `asphalt_${widthMeters}_${worn}`;
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const w = 512;
    const h = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    const rng = this.createSeededRandom(101);

    // 1. Base dark asphalt color
    ctx.fillStyle = worn ? '#3a3c48' : '#2b2d38';
    ctx.fillRect(0, 0, w, h);

    // 2. Grain / Aggregate noise
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (rng() - 0.5) * (worn ? 36 : 24);
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // 3. Tyre wear dark grooves (where left and right auto wheels roll continuously)
    const laneWidth = w / 3;
    for (let lane = 0; lane < 3; lane++) {
      const centerX = lane * laneWidth + laneWidth / 2;
      [-laneWidth * 0.28, laneWidth * 0.28].forEach(offset => {
        const grooveX = centerX + offset;
        const grad = ctx.createLinearGradient(grooveX - 18, 0, grooveX + 18, 0);
        grad.addColorStop(0, 'rgba(15, 17, 24, 0)');
        grad.addColorStop(0.5, 'rgba(12, 14, 20, 0.45)');
        grad.addColorStop(1, 'rgba(15, 17, 24, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(grooveX - 18, 0, 36, h);
      });
    }

    // 4. Tar sealer repair patches and micro-cracks
    const patchCount = worn ? 8 : 4;
    for (let p = 0; p < patchCount; p++) {
      const px = 40 + rng() * (w - 80);
      const py = 60 + rng() * (h - 120);
      const pw = 40 + rng() * 80;
      const ph = 30 + rng() * 70;

      ctx.fillStyle = 'rgba(20, 22, 30, 0.55)';
      ctx.beginPath();
      ctx.roundRect(px, py, pw, ph, 8);
      ctx.fill();

      // Crack lines
      ctx.strokeStyle = 'rgba(10, 12, 16, 0.65)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      let cx = px + pw / 2;
      let cy = py + ph / 2;
      ctx.moveTo(cx, cy);
      for (let s = 0; s < 5; s++) {
        cx += (rng() - 0.5) * 35;
        cy += (rng() - 0.5) * 35;
        ctx.lineTo(cx, cy);
      }
      ctx.stroke();
    }

    // 5. Solid Edge Marking Lines (Left: Solid White, Right: Solid Yellow)
    const edgeMargin = 12;
    const lineWidth = 10;

    // Left edge line (White)
    ctx.fillStyle = 'rgba(240, 240, 245, 0.88)';
    ctx.fillRect(edgeMargin, 0, lineWidth, h);

    // Right edge line (Amber Yellow)
    ctx.fillStyle = 'rgba(245, 195, 40, 0.9)';
    ctx.fillRect(w - edgeMargin - lineWidth, 0, lineWidth, h);

    // 6. Dashed Center Lane Dividers (White dashed stripes)
    const dashLength = 80;
    const gapLength = 60;
    const dashWidth = 8;
    const dashColor = 'rgba(245, 245, 240, 0.85)';

    for (let lane = 1; lane < 3; lane++) {
      const lx = lane * laneWidth - dashWidth / 2;
      ctx.fillStyle = dashColor;
      for (let y = 0; y < h; y += dashLength + gapLength) {
        ctx.fillRect(lx, y, dashWidth, dashLength);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 40);
    texture.anisotropy = 8;

    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Alternating Indian yellow and black kerb stone texture
   */
  public static createKerbTexture(): THREE.Texture {
    const key = 'kerb_yellow_black';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const w = 64;
    const h = 128;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    // Top block: Indian Traffic Yellow
    ctx.fillStyle = '#f2c230';
    ctx.fillRect(0, 0, w, 64);

    // Bottom block: Deep Charcoal Black
    ctx.fillStyle = '#1c1c22';
    ctx.fillRect(0, 64, w, 64);

    // Mortar groove lines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 62, w, 3);
    ctx.fillRect(0, 126, w, 2);

    // Stone weathering highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(0, 0, w, 3);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Checkered start/finish line texture
   */
  public static createFinishCheckeredTexture(): THREE.Texture {
    const key = 'finish_checkered';
    if (this.cachedTextures.has(key)) return this.cachedTextures.get(key)!;

    const w = 256;
    const h = 64;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return new THREE.Texture();

    const tileSize = 16;
    for (let x = 0; x < w; x += tileSize) {
      for (let y = 0; y < h; y += tileSize) {
        const isWhite = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
        ctx.fillStyle = isWhite ? '#f4f1ea' : '#14141c';
        ctx.fillRect(x, y, tileSize, tileSize);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.repeat.set(1, 1);

    this.cachedTextures.set(key, texture);
    return texture;
  }

  /**
   * Modern Cyber City Glass Skyscraper Facade with reflective windows and office light glows
   */
  public static createGlassFacadeTexture(tint = '#1a365d'): { map: THREE.Texture; emissiveMap: THREE.Texture } {
    const key = `glass_facade_${tint}`;
    const w = 512;
    const h = 512;

    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = w;
    mapCanvas.height = h;
    const mCtx = mapCanvas.getContext('2d')!;

    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = w;
    emissiveCanvas.height = h;
    const eCtx = emissiveCanvas.getContext('2d')!;

    const rng = this.createSeededRandom(42);

    // Base mullion metal
    mCtx.fillStyle = '#1c2438';
    mCtx.fillRect(0, 0, w, h);

    // Emissive base black
    eCtx.fillStyle = '#000000';
    eCtx.fillRect(0, 0, w, h);

    const cols = 8;
    const rows = 12;
    const cellW = w / cols;
    const cellH = h / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW + 2;
        const y = r * cellH + 2;
        const panelW = cellW - 4;
        const panelH = cellH - 4;

        // Glass panel gradient
        const grad = mCtx.createLinearGradient(x, y, x + panelW, y + panelH);
        grad.addColorStop(0, '#537895');
        grad.addColorStop(0.5, '#1e3c72');
        grad.addColorStop(1, '#091c3e');
        mCtx.fillStyle = grad;
        mCtx.fillRect(x, y, panelW, panelH);

        // Office interior light (random lit windows)
        if (rng() < 0.38) {
          const warm = rng() < 0.7;
          eCtx.fillStyle = warm ? 'rgba(255, 214, 130, 0.85)' : 'rgba(180, 230, 255, 0.85)';
          eCtx.fillRect(x + 2, y + 2, panelW - 4, panelH - 4);
        }
      }
    }

    const mapTex = new THREE.CanvasTexture(mapCanvas);
    mapTex.wrapS = THREE.RepeatWrapping;
    mapTex.wrapT = THREE.RepeatWrapping;
    mapTex.repeat.set(2, 4);

    const emissiveTex = new THREE.CanvasTexture(emissiveCanvas);
    emissiveTex.wrapS = THREE.RepeatWrapping;
    emissiveTex.wrapT = THREE.RepeatWrapping;
    emissiveTex.repeat.set(2, 4);

    return { map: mapTex, emissiveMap: emissiveTex };
  }

  /**
   * Authentic Indian Residential House (Ghar) Facade
   * Features plaster/brick, window frames, lintels, and warm lights
   */
  public static createHouseFacadeTexture(baseColor = '#d97757'): { map: THREE.Texture; emissiveMap: THREE.Texture } {
    const w = 512;
    const h = 512;

    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = w;
    mapCanvas.height = h;
    const mCtx = mapCanvas.getContext('2d')!;

    const emissiveCanvas = document.createElement('canvas');
    emissiveCanvas.width = w;
    emissiveCanvas.height = h;
    const eCtx = emissiveCanvas.getContext('2d')!;

    const rng = this.createSeededRandom(77);

    // Stucco plaster wall
    mCtx.fillStyle = baseColor;
    mCtx.fillRect(0, 0, w, h);

    // Subtle wall texture noise
    const imgData = mCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (rng() - 0.5) * 22;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    mCtx.putImageData(imgData, 0, 0);

    eCtx.fillStyle = '#000000';
    eCtx.fillRect(0, 0, w, h);

    // Horizontal floor dividing cornices
    mCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    mCtx.fillRect(0, 168, w, 8);
    mCtx.fillRect(0, 338, w, 8);

    // Windows with sunshades (chhajja) and curtains
    const winCols = 4;
    const winRows = 3;
    const colW = w / winCols;
    const rowH = h / winRows;

    for (let r = 0; r < winRows; r++) {
      for (let c = 0; c < winCols; c++) {
        const wx = c * colW + 28;
        const wy = r * rowH + 34;
        const ww = 72;
        const wh = 76;

        // Chhajja (sunshade over window)
        mCtx.fillStyle = '#4a5568';
        mCtx.fillRect(wx - 8, wy - 12, ww + 16, 8);

        // Window frame
        mCtx.fillStyle = '#2d3748';
        mCtx.fillRect(wx, wy, ww, wh);

        // Glass pane
        mCtx.fillStyle = '#1a202c';
        mCtx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);

        // Window grill crossbars
        mCtx.strokeStyle = '#718096';
        mCtx.lineWidth = 1.5;
        mCtx.beginPath();
        mCtx.moveTo(wx + ww / 2, wy + 4);
        mCtx.lineTo(wx + ww / 2, wy + wh - 4);
        mCtx.moveTo(wx + 4, wy + wh / 2);
        mCtx.lineTo(wx + ww - 4, wy + wh / 2);
        mCtx.stroke();

        // Warm domestic light
        if (rng() < 0.6) {
          eCtx.fillStyle = 'rgba(255, 195, 80, 0.75)';
          eCtx.fillRect(wx + 4, wy + 4, ww - 8, wh - 8);
        }
      }
    }

    const mapTex = new THREE.CanvasTexture(mapCanvas);
    mapTex.wrapS = THREE.RepeatWrapping;
    mapTex.wrapT = THREE.RepeatWrapping;
    mapTex.repeat.set(1, 1);

    const emissiveTex = new THREE.CanvasTexture(emissiveCanvas);
    emissiveTex.wrapS = THREE.RepeatWrapping;
    emissiveTex.wrapT = THREE.RepeatWrapping;
    emissiveTex.repeat.set(1, 1);

    return { map: mapTex, emissiveMap: emissiveTex };
  }

  /**
   * Ground-Floor Indian Dukan / Shopfront Texture
   */
  public static createShopfrontTexture(shopName: string, boardColor = '#b91c1c'): THREE.Texture {
    const w = 512;
    const h = 256;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // 1. Roll-up corrugated steel shutter
    ctx.fillStyle = '#4a5568';
    ctx.fillRect(0, 60, w, h - 60);

    for (let y = 60; y < h; y += 10) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, y, w, 3);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fillRect(0, y + 3, w, 2);
    }

    // 2. Shop sign board
    ctx.fillStyle = boardColor;
    ctx.fillRect(10, 8, w - 20, 48);

    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.strokeRect(12, 10, w - 24, 44);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillText(shopName, w / 2, 34);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * National Highway Overhead Green Gantry Sign
   */
  public static createHighwayGantrySign(title: string, subtitle = 'NH-48 EXPRESSWAY'): THREE.Texture {
    const w = 512;
    const h = 180;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // Indian Highway Standard Green (#057857)
    ctx.fillStyle = '#057857';
    ctx.fillRect(0, 0, w, h);

    // White border with rounded corners
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Destination text
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(title, w / 2, 75);

    ctx.font = 'bold 20px sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(subtitle, w / 2, 125);

    // Ahead Arrow
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(w / 2, 142);
    ctx.lineTo(w / 2 - 14, 158);
    ctx.lineTo(w / 2 + 14, 158);
    ctx.closePath();
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }
}
