import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { ArenaConfig, CharacterConfig, FighterState, MoveId } from './types';
import { Fighter } from './Fighter';

export class ThreeFighterEngine {
  private canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  private gltfLoader: GLTFLoader;
  private modelCache: Map<string, GLTF> = new Map();

  // 3D Player Meshes & Mixers
  public p1Model: THREE.Group | null = null;
  public p2Model: THREE.Group | null = null;
  public p1Mixer: THREE.AnimationMixer | null = null;
  public p2Mixer: THREE.AnimationMixer | null = null;
  private p1Actions: Map<string, THREE.AnimationAction> = new Map();
  private p2Actions: Map<string, THREE.AnimationAction> = new Map();
  private p1CurrentAction: THREE.AnimationAction | null = null;
  private p2CurrentAction: THREE.AnimationAction | null = null;

  // 3D Props (Bulldozer, Chakra, etc.)
  private bulldozerModel: THREE.Group | null = null;
  private chakraMesh: THREE.Mesh | null = null;

  // Stage Elements
  private stageGroup: THREE.Group = new THREE.Group();
  private lightsGroup: THREE.Group = new THREE.Group();

  // Particle System
  private particleGroup: THREE.Group = new THREE.Group();
  private sparks: { mesh: THREE.Mesh; vx: number; vy: number; vz: number; life: number }[] = [];

  // Camera & Shake
  private trauma = 0;
  private currentArenaId = '';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(canvas.width, canvas.height, false);
    this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 0.5, 100);
    this.camera.position.set(0, 1.8, 6.2);

    // Initialize GLTFLoader with DRACOLoader using official Google CDN for 100% reliable wasm decoding
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    dracoLoader.preload();

    this.gltfLoader = new GLTFLoader();
    this.gltfLoader.setDRACOLoader(dracoLoader);

    this.scene.add(this.stageGroup);
    this.scene.add(this.lightsGroup);
    this.scene.add(this.particleGroup);

    this.createSpecialProps();
  }

  private createSpecialProps() {
    // 1. Spinning 3D Chakra for Modi
    const chakraGeo = new THREE.TorusGeometry(0.5, 0.06, 16, 48);
    const chakraMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      emissive: 0xff9933,
      emissiveIntensity: 1.5,
      roughness: 0.2
    });
    this.chakraMesh = new THREE.Mesh(chakraGeo, chakraMat);
    this.chakraMesh.visible = false;
    this.scene.add(this.chakraMesh);

    // 2. Pre-load Bulldozer
    this.gltfLoader.load(
      '/models/bull1.glb',
      gltf => {
        this.bulldozerModel = gltf.scene;
        this.bulldozerModel.scale.set(0.012, 0.012, 0.012);
        this.bulldozerModel.visible = false;
        this.scene.add(this.bulldozerModel);
      },
      undefined,
      () => {}
    );
  }

  public async loadFighter(
    id: 1 | 2,
    char: CharacterConfig,
    onProgress?: (pct: number) => void
  ): Promise<void> {
    const url = char.modelUrl || `/models/${char.id}.glb`;

    // Remove existing model if any
    if (id === 1 && this.p1Model) {
      this.scene.remove(this.p1Model);
      this.p1Model = null;
      this.p1Mixer = null;
      this.p1Actions.clear();
    } else if (id === 2 && this.p2Model) {
      this.scene.remove(this.p2Model);
      this.p2Model = null;
      this.p2Mixer = null;
      this.p2Actions.clear();
    }

    let gltf = this.modelCache.get(url);
    if (!gltf) {
      try {
        gltf = await new Promise<GLTF>((resolve, reject) => {
          this.gltfLoader.load(
            url,
            g => {
              this.modelCache.set(url, g);
              resolve(g);
            },
            xhr => {
              if (xhr.lengthComputable && onProgress) {
                onProgress(Math.floor((xhr.loaded / xhr.total) * 100));
              }
            },
            err => {
              console.warn(`Error loading model from ${url}:`, err);
              reject(err);
            }
          );
        });
      } catch (e) {
        console.warn(`Could not load GLTF from ${url}, using stylized fallback model:`, e);
      }
    }

    let model: THREE.Group;
    const actions = new Map<string, THREE.AnimationAction>();
    let mixer: THREE.AnimationMixer;

    if (gltf && gltf.scene) {
      // Use official SkeletonUtils.clone for animated skinned mesh hierarchy
      model = SkeletonUtils.clone(gltf.scene) as THREE.Group;
      model.scale.set(1.15, 1.15, 1.15);

      model.traverse(node => {
        if ((node as THREE.Mesh).isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          // Crucial: avoid premature bounding box culling during active fighting animations
          (node as THREE.Mesh).frustumCulled = false;
        }
        // Emphasize politician caricature head (same as FightKaro 1.32x scale)
        if ((node as THREE.Bone).isBone && /Head/i.test(node.name) && !/Top/i.test(node.name)) {
          (node as THREE.Bone).scale.multiplyScalar(1.25);
        }
      });

      mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach(clip => {
        const action = mixer.clipAction(clip);
        actions.set(clip.name.toLowerCase(), action);
      });
    } else {
      model = this.createFallbackFighterMesh(char);
      mixer = new THREE.AnimationMixer(model);
    }

    if (id === 1) {
      this.p1Model = model;
      this.p1Mixer = mixer;
      this.p1Actions = actions;
      this.scene.add(model);
      this.playAction(1, 'walk_fwd');
    } else {
      this.p2Model = model;
      this.p2Mixer = mixer;
      this.p2Actions = actions;
      this.scene.add(model);
      this.playAction(2, 'walk_fwd');
    }
  }

  // Stylized 3D Fallback Mesh with Politician Face Texture
  private createFallbackFighterMesh(char: CharacterConfig): THREE.Group {
    const group = new THREE.Group();
    const primaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(char.accent),
      roughness: 0.3,
      metalness: 0.1
    });
    const secondaryMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(char.secondaryColor || '#ffffff'),
      roughness: 0.5
    });

    // Torso (Kurta/Suit)
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.4), primaryMat);
    torso.position.set(0, 0.95, 0);
    group.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), secondaryMat);
    head.position.set(0, 1.55, 0);
    group.add(head);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.6);
    const leftLeg = new THREE.Mesh(legGeo, secondaryMat);
    leftLeg.position.set(-0.2, 0.3, 0);
    const rightLeg = new THREE.Mesh(legGeo, secondaryMat);
    rightLeg.position.set(0.2, 0.3, 0);
    group.add(leftLeg, rightLeg);

    // Face Caricature Billboard Sprite if facePhoto exists
    if (char.facePhoto && typeof window !== 'undefined') {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(char.facePhoto, tex => {
        const spriteMat = new THREE.SpriteMaterial({ map: tex });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(0, 1.58, 0.15);
        sprite.scale.set(0.65, 0.65, 1);
        group.add(sprite);
      });
    }

    return group;
  }

  public setStage(arena: ArenaConfig) {
    if (this.currentArenaId === arena.id) return;
    this.currentArenaId = arena.id;

    // Clear old stage
    while (this.stageGroup.children.length > 0) {
      this.stageGroup.remove(this.stageGroup.children[0]);
    }
    while (this.lightsGroup.children.length > 0) {
      this.lightsGroup.remove(this.lightsGroup.children[0]);
    }

    // Sky Background Dome
    const skyGeo = new THREE.SphereGeometry(45, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(arena.bgGradient[0]),
      side: THREE.BackSide
    });
    const skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.stageGroup.add(skyMesh);

    // Stage Platform / Floor
    const floorGeo = new THREE.BoxGeometry(22, 1.2, 8);
    const floorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(arena.floorColor),
      roughness: 0.5,
      metalness: 0.1
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.6, 0);
    floorMesh.receiveShadow = true;
    this.stageGroup.add(floorMesh);

    // Glowing Neon Edge Line on Floor
    const edgeGeo = new THREE.BoxGeometry(22, 0.05, 0.1);
    const edgeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(arena.accentColor)
    });
    const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
    edgeMesh.position.set(0, 0.02, 1.8);
    this.stageGroup.add(edgeMesh);

    // Stage-specific 3D Decor
    if (arena.decorType === 'parliament') {
      this.buildParliamentDecor(arena);
    } else if (arena.decorType === 'dharna') {
      this.buildDharnaDecor(arena);
    } else {
      this.buildRallyDecor(arena);
    }

    // Set Vibrant Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.lightsGroup.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffeedd, 0x223344, 1.2);
    this.lightsGroup.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff8ee, 2.4);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 25;
    dirLight.shadow.camera.left = -10;
    dirLight.shadow.camera.right = 10;
    dirLight.shadow.camera.top = 10;
    dirLight.shadow.camera.bottom = -2;
    this.lightsGroup.add(dirLight);

    // Ambient colored spotlights
    const spot = new THREE.SpotLight(new THREE.Color(arena.accentColor), 2.5);
    spot.position.set(0, 8, -2);
    spot.target.position.set(0, 0, 0);
    this.lightsGroup.add(spot);
    this.lightsGroup.add(spot.target);
  }

  private buildParliamentDecor(arena: ArenaConfig) {
    // Grand Colonnade Pillars
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 8, 16);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1a2e4c,
      roughness: 0.3,
      metalness: 0.2
    });

    for (let x = -9; x <= 9; x += 2.2) {
      const p = new THREE.Mesh(pillarGeo, pillarMat);
      p.position.set(x, 4, -4);
      p.castShadow = true;
      this.stageGroup.add(p);
    }

    // Central Grand Speaker Chair
    const chairGeo = new THREE.BoxGeometry(2.4, 3.5, 0.6);
    const chairMat = new THREE.MeshStandardMaterial({
      color: 0x8b0000,
      roughness: 0.6
    });
    const chair = new THREE.Mesh(chairGeo, chairMat);
    chair.position.set(0, 1.75, -3.8);
    chair.castShadow = true;
    this.stageGroup.add(chair);
  }

  private buildDharnaDecor(arena: ArenaConfig) {
    // Barricades in Background
    const barGeo = new THREE.BoxGeometry(2.5, 1.0, 0.2);
    const barMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.4
    });

    for (let x = -8; x <= 8; x += 3.2) {
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set(x, 0.5, -3.5);
      bar.castShadow = true;
      this.stageGroup.add(bar);
    }
  }

  private buildRallyDecor(arena: ArenaConfig) {
    // Stage Scaffolding Trusses
    const trussGeo = new THREE.CylinderGeometry(0.08, 0.08, 8, 8);
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569 });

    for (let x = -8; x <= 8; x += 4) {
      const t = new THREE.Mesh(trussGeo, trussMat);
      t.position.set(x, 4, -3.8);
      this.stageGroup.add(t);
    }
  }

  public playAction(fighterId: 1 | 2, animName: string, loop = true) {
    const actions = fighterId === 1 ? this.p1Actions : this.p2Actions;
    if (!actions || actions.size === 0) return;

    const lower = animName.toLowerCase();
    let action = actions.get(lower);

    // Flexible fallback matching across character-specific clips
    if (!action) {
      if (lower.includes('kick')) {
        action = actions.get('kick') || actions.get('frontkick') || actions.get('kick_m') || actions.get('highkick') || actions.get('highkick_m') || actions.get('crescent') || actions.get('flyingkick');
      } else if (lower.includes('punch') || lower.includes('jab') || lower.includes('cross')) {
        action = actions.get('cross') || actions.get('jab') || actions.get('jab_m') || actions.get('cross_m') || actions.get('jabelbow') || actions.get('jabcross');
      } else if (lower.includes('upper')) {
        action = actions.get('uppercut') || actions.get('uppercut_m') || actions.get('elbowupper');
      } else if (lower.includes('crouch')) {
        action = actions.get('crouch');
      } else if (lower.includes('jump')) {
        action = actions.get('jump');
      } else if (lower.includes('hit')) {
        action = actions.get('hit');
      } else if (lower.includes('block')) {
        action = actions.get('block') || actions.get('guardbounce');
      } else if (lower.includes('knockdown')) {
        action = actions.get('knockdown');
      } else if (lower.includes('getup') || lower.includes('wakeup')) {
        action = actions.get('getup');
      } else if (lower.includes('special') || lower.includes('super')) {
        action = actions.get('palm') || actions.get('palm_m') || actions.get('butterfly') || actions.get('hurricane_m') || actions.get('slammer') || actions.get('kneeupper');
      }
      
      // General fallbacks
      if (!action) {
        action = actions.get('walk_fwd') || actions.values().next().value;
      }
    }

    if (!action) return;

    const currentAction = fighterId === 1 ? this.p1CurrentAction : this.p2CurrentAction;

    if (currentAction !== action) {
      if (currentAction) {
        currentAction.fadeOut(0.12);
      }
      action.reset().fadeIn(0.12);
      action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      action.clampWhenFinished = !loop;
      action.play();

      if (fighterId === 1) this.p1CurrentAction = action;
      else this.p2CurrentAction = action;
    }
  }

  public spawnSparks(x: number, y: number, color = 0xffd700, count = 12) {
    this.addTrauma(0.35);

    for (let i = 0; i < count; i++) {
      const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.05, 6, 6);
      const mat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.4 ? color : 0xffffff
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0);

      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.18;

      this.sparks.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 0.05,
        vz: (Math.random() - 0.5) * 0.1,
        life: 25 + Math.random() * 15
      });
      this.particleGroup.add(mesh);
    }
  }

  public addTrauma(amount: number) {
    this.trauma = Math.min(1.0, this.trauma + amount);
  }

  public update(delta: number, p1: Fighter, p2: Fighter, isSuperActive = false) {
    // 1. Update Animation Mixers
    if (this.p1Mixer) this.p1Mixer.update(delta);
    if (this.p2Mixer) this.p2Mixer.update(delta);

    // 2. Synchronize 3D P1 Model Position & State
    if (this.p1Model) {
      // Scale canvas X (80 to 880) to 3D X (-6 to +6)
      const target3DX = ((p1.x - 480) / 400) * 5.2;
      const target3DY = Math.max(0, (440 - p1.y) / 80);

      this.p1Model.position.set(target3DX, target3DY, 0);
      this.p1Model.rotation.y = p1.facingRight ? Math.PI / 2 : -Math.PI / 2;

      this.syncFighterAnimation(1, p1);
    }

    // 3. Synchronize 3D P2 Model Position & State
    if (this.p2Model) {
      const target3DX = ((p2.x - 480) / 400) * 5.2;
      const target3DY = Math.max(0, (440 - p2.y) / 80);

      this.p2Model.position.set(target3DX, target3DY, 0);
      this.p2Model.rotation.y = p2.facingRight ? Math.PI / 2 : -Math.PI / 2;

      this.syncFighterAnimation(2, p2);
    }

    // 4. Update Camera tracking (Dramatic zoom in Super, smooth midpoint in combat)
    const midX = ((((p1.x + p2.x) / 2) - 480) / 400) * 5.2;
    const dist = Math.abs(p1.x - p2.x) / 100;

    let targetCamX = midX;
    let targetCamZ = 4.8 + dist * 0.45;
    let lookAtX = midX;
    let lookAtY = 1.2;

    if (isSuperActive) {
      // Find super caster
      const caster = p1.superMeter === 0 && p1.state === 'super' ? p1 : (p2.superMeter === 0 && p2.state === 'super' ? p2 : (p1.superMeter < p2.superMeter ? p1 : p2));
      const caster3DX = ((caster.x - 480) / 400) * 5.2;
      targetCamX = caster3DX;
      targetCamZ = 3.6; // Dramatic close-up zoom
      lookAtX = caster3DX;
      lookAtY = 1.5;
    }

    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.12;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.1;

    // Shake
    if (this.trauma > 0) {
      const power = Math.pow(this.trauma, 2) * 0.25;
      this.camera.position.x += (Math.random() * 2 - 1) * power;
      this.camera.position.y = 1.8 + (Math.random() * 2 - 1) * power;
      this.trauma = Math.max(0, this.trauma - 0.04);
    } else {
      this.camera.position.y = 1.8;
    }
    this.camera.lookAt(lookAtX, lookAtY, 0);

    // 5. Update Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.mesh.position.x += s.vx;
      s.mesh.position.y += s.vy;
      s.mesh.position.z += s.vz;
      s.vy -= 0.008; // gravity
      s.life--;
      if (s.life <= 0) {
        this.particleGroup.remove(s.mesh);
        s.mesh.geometry.dispose();
        this.sparks.splice(i, 1);
      }
    }

    // 6. Special Super Props (Chakra, Bulldozer, Character Super VFX)
    const modiFighter = p1.config.id === 'modi' ? p1 : (p2.config.id === 'modi' ? p2 : null);
    if (this.chakraMesh) {
      if (isSuperActive && modiFighter) {
        this.chakraMesh.visible = true;
        const modi3DX = ((modiFighter.x - 480) / 400) * 5.2;
        this.chakraMesh.position.set(modi3DX + (modiFighter.facingRight ? 0.6 : -0.6), 2.1, 0.2);
        this.chakraMesh.rotation.z += 0.35;
        this.chakraMesh.rotation.x += 0.15;
        if (Math.random() < 0.4) {
          this.spawnSparks(this.chakraMesh.position.x, this.chakraMesh.position.y, 0xffd700, 4);
        }
      } else {
        this.chakraMesh.visible = false;
      }
    }

    const yogiFighter = p1.config.id === 'yogi' ? p1 : (p2.config.id === 'yogi' ? p2 : null);
    if (this.bulldozerModel) {
      if (isSuperActive && yogiFighter) {
        this.bulldozerModel.visible = true;
        const yogi3DX = ((yogiFighter.x - 480) / 400) * 5.2;
        this.bulldozerModel.position.set(yogi3DX + (yogiFighter.facingRight ? 0.8 : -0.8), 0, 0.3);
        this.bulldozerModel.rotation.y = yogiFighter.facingRight ? 0 : Math.PI;
        if (Math.random() < 0.5) {
          this.spawnSparks(this.bulldozerModel.position.x, 0.5, 0xf97316, 5);
        }
      } else {
        this.bulldozerModel.visible = false;
      }
    }

    // Rahul / Didi / Trump / Other Character Super VFX
    if (isSuperActive) {
      const rahulFighter = p1.config.id === 'rahul' ? p1 : (p2.config.id === 'rahul' ? p2 : null);
      if (rahulFighter && Math.random() < 0.4) {
        const rahul3DX = ((rahulFighter.x - 480) / 400) * 5.2;
        this.spawnSparks(rahul3DX, 1.6, 0xfacc15, 6); // Golden coin particles
      }
      const didiFighter = p1.config.id === 'didi' ? p1 : (p2.config.id === 'didi' ? p2 : null);
      if (didiFighter && Math.random() < 0.4) {
        const didi3DX = ((didiFighter.x - 480) / 400) * 5.2;
        this.spawnSparks(didi3DX, 1.4, 0x10b981, 6); // Mystical green cauldron spark
      }
    }

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  }

  private syncFighterAnimation(id: 1 | 2, fighter: Fighter) {
    const s = fighter.state;
    const m = fighter.currentMove?.id;

    if (s === 'knockdown') {
      this.playAction(id, 'knockdown', false);
    } else if (s === 'wakeup') {
      this.playAction(id, 'getup', false);
    } else if (s === 'hitstun') {
      this.playAction(id, 'hit', false);
    } else if (s === 'blockstun') {
      this.playAction(id, 'block', false);
    } else if (s === 'jump' || s === 'fall') {
      this.playAction(id, 'jump', false);
    } else if (s === 'crouch') {
      this.playAction(id, 'crouch', true);
    } else if (s === 'attack' && m) {
      if (m === 'jab') this.playAction(id, 'cross', false);
      else if (m === 'cross') this.playAction(id, 'cross_m', false);
      else if (m === 'kick') this.playAction(id, 'thrustkick', false);
      else if (m === 'uppercut') this.playAction(id, 'elbowupper', false);
      else if (m === 'roundhouse') this.playAction(id, 'roundhouse', false);
      else if (m === 'lowJab') this.playAction(id, 'lowjab', false);
      else if (m === 'sweep') this.playAction(id, 'sweep360', false);
      else if (m === 'special1') this.playAction(id, 'slammer', false);
      else if (m === 'special2') this.playAction(id, 'kneeupper', false);
      else if (m === 'grab') this.playAction(id, 'palm', false);
      else this.playAction(id, 'cross', false);
    } else if (s === 'walk_fwd') {
      this.playAction(id, 'walk_fwd', true);
    } else if (s === 'walk_back') {
      this.playAction(id, 'walk_back', true);
    } else {
      // Idle
      this.playAction(id, 'walk_fwd', true);
    }
  }

  public resize(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public dispose() {
    this.renderer.dispose();
  }
}

