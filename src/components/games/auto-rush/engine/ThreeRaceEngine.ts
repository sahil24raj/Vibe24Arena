import * as THREE from 'three';
import { RaceSettings, TrackConfig, VehicleConfig, VehiclePhysicsState } from './types';
import { VehicleModelBuilder } from './VehicleModelBuilder';
import { TrackManager } from './TrackManager';

export class ThreeRaceEngine {
  private canvas: HTMLCanvasElement;
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  // Environment & Track
  public trackManager: TrackManager;
  private settings: RaceSettings;
  private skyMesh: THREE.Mesh | null = null;
  private dirLight: THREE.DirectionalLight | null = null;

  // 3D Vehicle Meshes
  public playerVehicleMesh: THREE.Group | null = null;
  public aiVehicleMeshes: Map<string, THREE.Group> = new Map();

  // Particle Systems
  private particleGroup: THREE.Group = new THREE.Group();
  private particles: Array<{ mesh: THREE.Mesh; vx: number; vy: number; vz: number; life: number; maxLife: number }> = [];

  // Camera Settings
  public cameraMode: 'chase' | 'hood' | 'bumper' = 'chase';
  private targetCamPos = new THREE.Vector3();
  private targetLookAt = new THREE.Vector3();

  constructor(canvas: HTMLCanvasElement, track: TrackConfig, settings: RaceSettings) {
    this.canvas = canvas;
    this.settings = settings;

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
    this.camera = new THREE.PerspectiveCamera(54, canvas.width / canvas.height, 0.5, 1200);
    this.camera.position.set(0, 4, -10);

    this.trackManager = new TrackManager(track);
    this.scene.add(this.trackManager.trackGroup);
    this.scene.add(this.particleGroup);

    this.setupLightingAndEnvironment();
  }

  private setupLightingAndEnvironment(): void {
    const time = this.settings.timeOfDay;
    const skyColors = this.trackManager.config.skyColors[time];

    // 1. Sky Dome
    const skyGeo = new THREE.SphereGeometry(600, 32, 16);
    const skyMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(skyColors[0]),
      side: THREE.BackSide
    });
    this.skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(this.skyMesh);

    // Fog for depth
    this.scene.fog = new THREE.FogExp2(skyColors[0], 0.0025);

    // 2. Ground Plane
    const groundGeo = new THREE.PlaneGeometry(1500, 1500);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: time === 'night' ? 0x0a0e1a : 0x1c2b18,
      roughness: 0.95
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.receiveShadow = true;
    ground.position.y = -0.05;
    this.scene.add(ground);

    // 3. Dynamic Lighting based on Time of Day
    const ambientIntensity = time === 'morning' ? 1.4 : (time === 'sunset' ? 1.0 : 0.45);
    const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity);
    this.scene.add(ambient);

    const hemi = new THREE.HemisphereLight(
      time === 'sunset' ? 0xffaa66 : 0xddeeff,
      time === 'night' ? 0x111122 : 0x334422,
      time === 'night' ? 0.3 : 0.8
    );
    this.scene.add(hemi);

    const sunColor = time === 'sunset' ? 0xff7733 : (time === 'night' ? 0x4466aa : 0xfffaed);
    const dirIntensity = time === 'night' ? 0.6 : 2.2;

    this.dirLight = new THREE.DirectionalLight(sunColor, dirIntensity);
    this.dirLight.position.set(120, 220, 150);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 600;
    this.dirLight.shadow.camera.left = -150;
    this.dirLight.shadow.camera.right = 150;
    this.dirLight.shadow.camera.top = 150;
    this.dirLight.shadow.camera.bottom = -150;
    this.scene.add(this.dirLight);
  }

  public setupPlayerVehicle(config: VehicleConfig): void {
    if (this.playerVehicleMesh) {
      this.scene.remove(this.playerVehicleMesh);
    }
    this.playerVehicleMesh = VehicleModelBuilder.buildAutoRickshaw(config);
    this.scene.add(this.playerVehicleMesh);
  }

  public setupAIVehicles(opponents: Array<{ participant: { id: string; vehicle: VehicleConfig } }>): void {
    // Clear old AI meshes
    this.aiVehicleMeshes.forEach(mesh => this.scene.remove(mesh));
    this.aiVehicleMeshes.clear();

    opponents.forEach(ai => {
      const mesh = VehicleModelBuilder.buildAutoRickshaw(ai.participant.vehicle);
      this.aiVehicleMeshes.set(ai.participant.id, mesh);
      this.scene.add(mesh);
    });
  }

  public update(
    delta: number,
    playerState: VehiclePhysicsState,
    aiStates: Array<{ id: string; state: VehiclePhysicsState }>
  ): void {
    // 1. Update Player 3D Vehicle Transform & Animations
    if (this.playerVehicleMesh) {
      this.updateVehicleTransform(this.playerVehicleMesh, playerState);

      // Particle VFX: Smoke during drift
      if (playerState.isDrifting && playerState.speedKmh > 25) {
        this.spawnTireSmoke(playerState.x, playerState.z, playerState.yaw);
      }

      // Particle VFX: Dual Nitro flames
      if (playerState.isNitroActive) {
        this.spawnNitroFlames(playerState.x, playerState.z, playerState.yaw);
      }
    }

    // 2. Update AI 3D Vehicle Transforms
    aiStates.forEach(ai => {
      const mesh = this.aiVehicleMeshes.get(ai.id);
      if (mesh) {
        this.updateVehicleTransform(mesh, ai.state);

        if (ai.state.isNitroActive) {
          this.spawnNitroFlames(ai.state.x, ai.state.z, ai.state.yaw);
        }
      }
    });

    // 3. Update Camera Follow
    this.updateCamera(delta, playerState);

    // 4. Update Particle Lifecycle
    this.updateParticles(delta);

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  private updateVehicleTransform(mesh: THREE.Group, state: VehiclePhysicsState): void {
    mesh.position.set(state.x, state.y, state.z);
    mesh.rotation.set(0, 0, 0);

    // Compound rotation: Yaw + Pitch + Roll
    mesh.rotation.y = state.yaw;
    mesh.rotation.z = state.roll;
    mesh.rotation.x = state.pitch;

    // Rotate Wheels
    const wheelRotSpeed = (state.speedKmh / 3.6) / 0.26;
    const frontWheel = mesh.getObjectByName('frontWheel');
    const rearLeftWheel = mesh.getObjectByName('rearLeftWheel');
    const rearRightWheel = mesh.getObjectByName('rearRightWheel');

    if (frontWheel) {
      frontWheel.rotation.x += wheelRotSpeed * 0.016;
      frontWheel.rotation.y = state.steeringAngle * 1.2;
    }
    if (rearLeftWheel) rearLeftWheel.rotation.x += wheelRotSpeed * 0.016;
    if (rearRightWheel) rearRightWheel.rotation.x += wheelRotSpeed * 0.016;
  }

  private updateCamera(delta: number, playerState: VehiclePhysicsState): void {
    const forwardX = Math.sin(playerState.yaw);
    const forwardZ = Math.cos(playerState.yaw);

    const targetFov = playerState.isNitroActive ? 68 : 54;
    this.camera.fov += (targetFov - this.camera.fov) * Math.min(1, delta * 6);
    this.camera.updateProjectionMatrix();

    if (this.cameraMode === 'chase') {
      // Classic Third Person Chase Camera
      const followDist = playerState.isNitroActive ? 8.2 : 6.8;
      const followHeight = 2.8;

      const idealCamX = playerState.x - forwardX * followDist;
      const idealCamY = playerState.y + followHeight;
      const idealCamZ = playerState.z - forwardZ * followDist;

      this.camera.position.x += (idealCamX - this.camera.position.x) * Math.min(1, delta * 9);
      this.camera.position.y += (idealCamY - this.camera.position.y) * Math.min(1, delta * 9);
      this.camera.position.z += (idealCamZ - this.camera.position.z) * Math.min(1, delta * 9);

      // Look slightly ahead of auto
      const lookX = playerState.x + forwardX * 6;
      const lookY = playerState.y + 1.2;
      const lookZ = playerState.z + forwardZ * 6;
      this.camera.lookAt(lookX, lookY, lookZ);
    } else if (this.cameraMode === 'hood') {
      // Handlebar First-person View
      this.camera.position.set(
        playerState.x + forwardX * 0.4,
        playerState.y + 1.45,
        playerState.z + forwardZ * 0.4
      );
      this.camera.lookAt(
        playerState.x + forwardX * 25,
        playerState.y + 1.2,
        playerState.z + forwardZ * 25
      );
    } else {
      // Bumper Close View
      this.camera.position.set(
        playerState.x + forwardX * 1.4,
        playerState.y + 0.6,
        playerState.z + forwardZ * 1.4
      );
      this.camera.lookAt(
        playerState.x + forwardX * 30,
        playerState.y + 0.6,
        playerState.z + forwardZ * 30
      );
    }
  }

  private spawnTireSmoke(x: number, z: number, yaw: number): void {
    const rearX = Math.cos(yaw) * 0.65;
    const rearZ = -Math.sin(yaw) * 0.65;
    const forwardX = Math.sin(yaw) * 0.9;
    const forwardZ = Math.cos(yaw) * 0.9;

    [-1, 1].forEach(side => {
      const smokeGeo = new THREE.SphereGeometry(0.18 + Math.random() * 0.14, 6, 6);
      const smokeMat = new THREE.MeshBasicMaterial({
        color: 0xcccccc,
        transparent: true,
        opacity: 0.55
      });
      const mesh = new THREE.Mesh(smokeGeo, smokeMat);
      mesh.position.set(
        x - forwardX + rearX * side + (Math.random() - 0.5) * 0.2,
        0.18,
        z - forwardZ + rearZ * side + (Math.random() - 0.5) * 0.2
      );

      this.particles.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.4,
        vy: 0.6 + Math.random() * 0.5,
        vz: (Math.random() - 0.5) * 0.4,
        life: 0.4,
        maxLife: 0.4
      });
      this.particleGroup.add(mesh);
    });
  }

  private spawnNitroFlames(x: number, z: number, yaw: number): void {
    const forwardX = Math.sin(yaw);
    const forwardZ = Math.cos(yaw);
    const rightX = Math.cos(yaw);
    const rightZ = -Math.sin(yaw);

    [-0.32, 0.32].forEach(side => {
      const flameGeo = new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 6, 6);
      const isCyan = Math.random() > 0.4;
      const flameMat = new THREE.MeshBasicMaterial({
        color: isCyan ? 0x00d2ff : 0xff3fae,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(flameGeo, flameMat);
      mesh.position.set(
        x - forwardX * 1.3 + rightX * side,
        0.26,
        z - forwardZ * 1.3 + rightZ * side
      );

      this.particles.push({
        mesh,
        vx: -forwardX * (4 + Math.random() * 3),
        vy: (Math.random() - 0.5) * 0.4,
        vz: -forwardZ * (4 + Math.random() * 3),
        life: 0.2,
        maxLife: 0.2
      });
      this.particleGroup.add(mesh);
    });
  }

  private updateParticles(delta: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= delta;
      p.mesh.position.x += p.vx * delta;
      p.mesh.position.y += p.vy * delta;
      p.mesh.position.z += p.vz * delta;

      const scale = 1.0 + (1 - p.life / p.maxLife) * 1.8;
      p.mesh.scale.set(scale, scale, scale);

      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = (p.life / p.maxLife) * 0.6;
      }

      if (p.life <= 0) {
        this.particleGroup.remove(p.mesh);
        p.mesh.geometry.dispose();
        this.particles.splice(i, 1);
      }
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  public dispose(): void {
    this.renderer.dispose();
  }
}
