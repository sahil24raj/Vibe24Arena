import * as THREE from 'three';
import { TrackConfig } from './types';

export class TrackManager {
  public config: TrackConfig;
  public spline: THREE.CatmullRomCurve3;
  public trackLength: number;
  public trackGroup: THREE.Group = new THREE.Group();
  public checkpoints: THREE.Vector3[] = [];

  constructor(config: TrackConfig) {
    this.config = config;

    // Build CatmullRom spline from 2D waypoints
    const points = config.waypoints.map(w => new THREE.Vector3(w.x, w.y || 0, w.z));
    this.spline = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    this.trackLength = this.spline.getLength();

    // Create 3D track environment
    this.buildTrackMesh();
    this.buildStartFinishGantry();
    this.buildCityDecorations();
    this.generateCheckpoints();
  }

  private generateCheckpoints(): void {
    const numCheckpoints = 16;
    this.checkpoints = [];
    for (let i = 0; i < numCheckpoints; i++) {
      const t = i / numCheckpoints;
      this.checkpoints.push(this.spline.getPointAt(t));
    }
  }

  private buildTrackMesh(): void {
    const segments = 180;
    const roadWidth = this.config.roadWidth;
    const halfWidth = roadWidth / 2;

    const roadGeo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    // Road curve points & tangent frames
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pt = this.spline.getPointAt(t % 1);
      const tangent = this.spline.getTangentAt(t % 1).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      // Left edge
      const leftPt = pt.clone().addScaledVector(binormal, -halfWidth);
      // Right edge
      const rightPt = pt.clone().addScaledVector(binormal, halfWidth);

      positions.push(leftPt.x, leftPt.y + 0.02, leftPt.z);
      positions.push(rightPt.x, rightPt.y + 0.02, rightPt.z);

      normals.push(0, 1, 0, 0, 1, 0);
      uvs.push(0, i * 4, 1, i * 4);

      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    roadGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    roadGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    roadGeo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    roadGeo.setIndex(indices);

    // Asphalt Material
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x242428,
      roughness: 0.8,
      metalness: 0.1
    });

    const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
    roadMesh.receiveShadow = true;
    this.trackGroup.add(roadMesh);

    // Side Kerbs (Red & White alternating racing curbs)
    this.buildCurbs(segments, halfWidth);
  }

  private buildCurbs(segments: number, halfWidth: number): void {
    const curbGeoLeft = new THREE.BoxGeometry(0.6, 0.18, 2.5);
    const redMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf3f4f6, roughness: 0.5 });

    for (let i = 0; i < segments; i += 2) {
      const t = i / segments;
      const pt = this.spline.getPointAt(t);
      const tangent = this.spline.getTangentAt(t).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const mat = (i / 2) % 2 === 0 ? redMat : whiteMat;

      // Left curb
      const lPos = pt.clone().addScaledVector(binormal, -halfWidth - 0.3);
      const curbL = new THREE.Mesh(curbGeoLeft, mat);
      curbL.position.copy(lPos);
      curbL.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      this.trackGroup.add(curbL);

      // Right curb
      const rPos = pt.clone().addScaledVector(binormal, halfWidth + 0.3);
      const curbR = new THREE.Mesh(curbGeoLeft, mat);
      curbR.position.copy(rPos);
      curbR.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      this.trackGroup.add(curbR);
    }
  }

  private buildStartFinishGantry(): void {
    const startPt = this.spline.getPointAt(0);
    const tangent = this.spline.getTangentAt(0).normalize();
    const normal = new THREE.Vector3(0, 1, 0);
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
    const halfWidth = this.config.roadWidth / 2;

    const gantryGroup = new THREE.Group();

    // Steel Pillars on sides
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.35, 7.5, 12);

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.copy(startPt).addScaledVector(binormal, -halfWidth - 1.2);
    leftPillar.position.y += 3.75;
    gantryGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.copy(startPt).addScaledVector(binormal, halfWidth + 1.2);
    rightPillar.position.y += 3.75;
    gantryGroup.add(rightPillar);

    // Crossbar Bridge
    const crossbarGeo = new THREE.BoxGeometry(this.config.roadWidth + 3.0, 1.2, 1.0);
    const crossbar = new THREE.Mesh(crossbarGeo, pillarMat);
    crossbar.position.copy(startPt);
    crossbar.position.y += 7.2;
    crossbar.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
    gantryGroup.add(crossbar);

    // Checkered Finish Banner
    const bannerGeo = new THREE.PlaneGeometry(this.config.roadWidth * 0.75, 1.4);
    const bannerMat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide
    });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.copy(startPt).addScaledVector(tangent, -0.4);
    banner.position.y += 6.5;
    banner.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    gantryGroup.add(banner);

    // Start Line on Road (Checker Stripe)
    const startLineGeo = new THREE.PlaneGeometry(this.config.roadWidth, 2.0);
    startLineGeo.rotateX(-Math.PI / 2);
    const startLineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const startLine = new THREE.Mesh(startLineGeo, startLineMat);
    startLine.position.copy(startPt);
    startLine.position.y = 0.04;
    startLine.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    gantryGroup.add(startLine);

    this.trackGroup.add(gantryGroup);
  }

  private buildCityDecorations(): void {
    const isGurugram = this.config.city === 'gurugram';

    if (isGurugram) {
      // 1. Cyber City Glass Towers along the outer boundary
      const towerGeo = new THREE.BoxGeometry(32, 75, 32);
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        roughness: 0.1,
        metalness: 0.9
      });

      const towerLocations = [
        [180, -90], [320, 40], [460, 200], [380, 420], [120, 560], [-180, 460], [-320, 220], [-260, -40]
      ];
      towerLocations.forEach(([tx, tz]) => {
        const tower = new THREE.Mesh(towerGeo, glassMat);
        tower.position.set(tx, 37.5, tz);
        tower.castShadow = true;
        this.trackGroup.add(tower);
      });

      // 2. Rapid Metro Elevated Track & Pillars
      const metroTrackGeo = new THREE.BoxGeometry(10, 2.5, 300);
      const metroMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 });
      const metro = new THREE.Mesh(metroTrackGeo, metroMat);
      metro.position.set(100, 14, 250);
      this.trackGroup.add(metro);

      // Metro concrete pillars
      const pilGeo = new THREE.CylinderGeometry(1.2, 1.2, 14, 12);
      for (let pz = 100; pz <= 400; pz += 50) {
        const pil = new THREE.Mesh(pilGeo, metroMat);
        pil.position.set(100, 7, pz);
        this.trackGroup.add(pil);
      }
    } else {
      // Delhi Circuit: Monument Pillars & Trees
      const monumentGeo = new THREE.BoxGeometry(18, 36, 12);
      const sandstoneMat = new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        roughness: 0.7,
        metalness: 0.1
      });
      const monument = new THREE.Mesh(monumentGeo, sandstoneMat);
      monument.position.set(0, 18, 240);
      this.trackGroup.add(monument);

      // Trees along Kartavya Path
      const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 5, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
      const foliageGeo = new THREE.SphereGeometry(3.2, 8, 8);
      const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });

      for (let i = 0; i < 20; i++) {
        const t = (i / 20);
        const pt = this.spline.getPointAt(t);
        const tangent = this.spline.getTangentAt(t).normalize();
        const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
        const treePos = pt.clone().addScaledVector(binormal, (i % 2 === 0 ? 1 : -1) * (this.config.roadWidth / 2 + 6));

        const tree = new THREE.Group();
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 2.5;
        tree.add(trunk);
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.y = 5.8;
        tree.add(foliage);
        tree.position.copy(treePos);
        this.trackGroup.add(tree);
      }
    }
  }

  /**
   * Check vehicle distance to nearest spline point. If > half road width, vehicle is off-road.
   */
  public isOffRoad(x: number, z: number): boolean {
    const halfWidth = this.config.roadWidth / 2;
    // Check against checkpoints for fast distance check
    let minDist = Infinity;
    for (const cp of this.checkpoints) {
      const dx = x - cp.x;
      const dz = z - cp.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist) minDist = d;
    }
    return minDist > halfWidth + 1.5;
  }

  /**
   * Check checkpoint progress and returns new lap if crossed finish line.
   */
  public updateRacerProgress(
    x: number,
    z: number,
    currentCp: number,
    currentLap: number,
    totalLaps: number
  ): { nextCheckpoint: number; nextLap: number; isLapCompleted: boolean; isRaceFinished: boolean } {
    const targetCpIndex = (currentCp + 1) % this.checkpoints.length;
    const targetCp = this.checkpoints[targetCpIndex];

    const dx = x - targetCp.x;
    const dz = z - targetCp.z;
    const distToCp = Math.sqrt(dx * dx + dz * dz);

    let nextCheckpoint = currentCp;
    let nextLap = currentLap;
    let isLapCompleted = false;
    let isRaceFinished = false;

    // Checkpoint crossed within 24m radius
    if (distToCp < 24) {
      nextCheckpoint = targetCpIndex;
      // If we crossed checkpoint 0 after visiting last checkpoint, a lap completed!
      if (targetCpIndex === 0 && currentCp === this.checkpoints.length - 1) {
        isLapCompleted = true;
        nextLap = currentLap + 1;
        if (nextLap > totalLaps) {
          isRaceFinished = true;
        }
      }
    }

    return { nextCheckpoint, nextLap, isLapCompleted, isRaceFinished };
  }
}
