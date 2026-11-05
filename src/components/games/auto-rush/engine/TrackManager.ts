import * as THREE from 'three';
import { TrackConfig } from './types';
import { TextureGenerator } from './TextureGenerator';

export class TrackManager {
  public config: TrackConfig;
  public spline: THREE.CatmullRomCurve3;
  public trackLength: number;
  public trackGroup: THREE.Group = new THREE.Group();
  public checkpoints: THREE.Vector3[] = [];

  constructor(config: TrackConfig) {
    this.config = config;

    // Build smooth CatmullRom spline from waypoints
    const points = config.waypoints.map(w => new THREE.Vector3(w.x, w.y || 0, w.z));
    this.spline = new THREE.CatmullRomCurve3(points, true, 'centripetal', 0.5);
    this.trackLength = this.spline.getLength();

    // Construct Realistic 3D Environment
    this.buildTrackMesh();
    this.buildCurbsAndGuardrails();
    this.buildStartFinishGantry();
    this.buildRealisticIndianCityscape();
    this.generateCheckpoints();
  }

  private generateCheckpoints(): void {
    const numCheckpoints = 24;
    this.checkpoints = [];
    for (let i = 0; i < numCheckpoints; i++) {
      const t = i / numCheckpoints;
      this.checkpoints.push(this.spline.getPointAt(t));
    }
  }

  /**
   * Builds realistic asphalt road mesh with authentic lane lines and tyre grooves
   */
  private buildTrackMesh(): void {
    const segments = 240;
    const roadWidth = this.config.roadWidth || 16;
    const halfWidth = roadWidth / 2;

    const roadGeo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    const uvRepeats = (this.trackLength / 18);

    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) % 1;
      const pt = this.spline.getPointAt(t);
      const tangent = this.spline.getTangentAt(t).normalize();
      const normal = new THREE.Vector3(0, 1, 0);
      const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();

      const leftPt = pt.clone().addScaledVector(binormal, -halfWidth);
      const rightPt = pt.clone().addScaledVector(binormal, halfWidth);

      positions.push(leftPt.x, leftPt.y + 0.02, leftPt.z);
      positions.push(rightPt.x, rightPt.y + 0.02, rightPt.z);

      normals.push(0, 1, 0, 0, 1, 0);

      const v = (i / segments) * uvRepeats;
      uvs.push(0, v, 1, v);

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

    // Realistic Asphalt Texture from TextureGenerator (autorush.autos style)
    const asphaltTex = TextureGenerator.createAsphaltTexture(roadWidth);
    asphaltTex.repeat.set(1, uvRepeats);

    const asphaltMat = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.75,
      metalness: 0.15
    });

    const roadMesh = new THREE.Mesh(roadGeo, asphaltMat);
    roadMesh.receiveShadow = true;
    this.trackGroup.add(roadMesh);
  }

  /**
   * Builds alternating Yellow & Black Indian curb stones and steel guardrails
   */
  private buildCurbsAndGuardrails(): void {
    const segments = 120;
    const roadWidth = this.config.roadWidth || 16;
    const halfWidth = roadWidth / 2;

    const kerbMat = new THREE.MeshStandardMaterial({
      map: TextureGenerator.createKerbTexture(),
      roughness: 0.65
    });

    const guardrailMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.8
    });

    const reflectorMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const pt = this.spline.getPointAt(t);
      const tangent = this.spline.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      // Left & Right Curbs
      [-1, 1].forEach(side => {
        const curbPos = pt.clone().addScaledVector(binormal, side * (halfWidth + 0.28));
        const curbBoxGeo = new THREE.BoxGeometry(0.55, 0.18, (this.trackLength / segments) * 1.02);
        const curbMesh = new THREE.Mesh(curbBoxGeo, kerbMat);
        curbMesh.position.copy(curbPos);
        curbMesh.position.y += 0.09;
        curbMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        curbMesh.receiveShadow = true;
        this.trackGroup.add(curbMesh);
      });

      // Guardrails on outer edges (every 4th segment)
      if (i % 3 === 0) {
        [-1, 1].forEach(side => {
          const railPos = pt.clone().addScaledVector(binormal, side * (halfWidth + 1.25));
          const railGeo = new THREE.BoxGeometry(0.12, 0.45, 12.0);
          const rail = new THREE.Mesh(railGeo, guardrailMat);
          rail.position.copy(railPos);
          rail.position.y += 0.55;
          rail.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
          rail.castShadow = true;
          this.trackGroup.add(rail);

          // Support post
          const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
          const post = new THREE.Mesh(postGeo, guardrailMat);
          post.position.copy(railPos);
          post.position.y += 0.4;
          this.trackGroup.add(post);

          // Yellow reflector stud
          const studGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
          const stud = new THREE.Mesh(studGeo, reflectorMat);
          stud.position.copy(railPos).addScaledVector(binormal, -side * 0.08);
          stud.position.y += 0.65;
          this.trackGroup.add(stud);
        });
      }
    }
  }

  /**
   * Authentic Steel Truss Start/Finish Gantry with checkered line and overhead digital board
   */
  private buildStartFinishGantry(): void {
    const startPt = this.spline.getPointAt(0);
    const tangent = this.spline.getTangentAt(0).normalize();
    const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
    const halfWidth = (this.config.roadWidth || 16) / 2;

    const gantryGroup = new THREE.Group();

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.85
    });

    // Left and Right Steel Pillars
    const pillarGeo = new THREE.BoxGeometry(0.9, 8.5, 0.9);
    [-1, 1].forEach(side => {
      const p = new THREE.Mesh(pillarGeo, steelMat);
      p.position.copy(startPt).addScaledVector(binormal, side * (halfWidth + 1.4));
      p.position.y += 4.25;
      p.castShadow = true;
      gantryGroup.add(p);
    });

    // Overhead Truss Bridge
    const bridgeGeo = new THREE.BoxGeometry((halfWidth + 1.4) * 2 + 1.2, 1.4, 1.2);
    const bridge = new THREE.Mesh(bridgeGeo, steelMat);
    bridge.position.copy(startPt);
    bridge.position.y += 7.8;
    bridge.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
    bridge.castShadow = true;
    gantryGroup.add(bridge);

    // Checkered Finish Banner
    const checkeredTex = TextureGenerator.createFinishCheckeredTexture();
    const bannerGeo = new THREE.PlaneGeometry(halfWidth * 1.8, 1.2);
    const bannerMat = new THREE.MeshBasicMaterial({
      map: checkeredTex,
      side: THREE.DoubleSide
    });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.copy(startPt).addScaledVector(tangent, -0.6);
    banner.position.y += 7.2;
    banner.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    gantryGroup.add(banner);

    // Start Line on Road (Checkered Tile Strip)
    const lineGeo = new THREE.PlaneGeometry(this.config.roadWidth, 2.4);
    lineGeo.rotateX(-Math.PI / 2);
    const lineMat = new THREE.MeshBasicMaterial({ map: checkeredTex });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.position.copy(startPt);
    line.position.y = 0.04;
    line.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    gantryGroup.add(line);

    this.trackGroup.add(gantryGroup);
  }

  /**
   * Builds realistic Indian cityscape matching autorush.autos:
   * - Residential Houses (Ghar) with balconies, AC units, Sintex water tanks, and shops
   * - Cyber City Reflective Glass Skyscrapers
   * - Elevated Rapid Metro Viaduct with concrete piers & metro train
   * - Highway Overhead Green Signs & Street Lights
   */
  private buildRealisticIndianCityscape(): void {
    const isGurugram = this.config.city === 'gurugram';
    const halfWidth = (this.config.roadWidth || 16) / 2;

    // 1. Indian Residential Houses (Ghar) along the track sides
    const houseColors = ['#d97757', '#e2a76f', '#c2a68c', '#a3b899', '#dfba9b'];
    const shopNames = [
      'SHARMA CHAI CORNER',
      'DELHI SAMOSA & JALEBI',
      'GURUGRAM TYRE PUNCTURE',
      'SQUAD CYBER CAFE',
      'APNA DESI DHABA',
      'ROYAL AUTO SPARES'
    ];

    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Sintex Black
      roughness: 0.6,
      metalness: 0.1
    });

    const acMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
      metalness: 0.5
    });

    // Place houses along segments
    const houseCount = 18;
    for (let h = 0; h < houseCount; h++) {
      const t = (h / houseCount + 0.03) % 1;
      const pt = this.spline.getPointAt(t);
      const tangent = this.spline.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      const side = h % 2 === 0 ? 1 : -1;
      const distFromRoad = halfWidth + 8 + (h % 3) * 4;
      const housePos = pt.clone().addScaledVector(binormal, side * distFromRoad);

      const floors = 2 + (h % 3); // 2 to 4 floors
      const houseH = floors * 3.6;
      const houseW = 14 + (h % 4) * 2;
      const houseD = 12 + (h % 3) * 2;

      const houseGroup = new THREE.Group();
      houseGroup.position.copy(housePos);

      // House main block with plaster facade
      const { map: houseMap, emissiveMap: houseEmissive } = TextureGenerator.createHouseFacadeTexture(
        houseColors[h % houseColors.length]
      );
      const houseFacadeMat = new THREE.MeshStandardMaterial({
        map: houseMap,
        emissiveMap: houseEmissive,
        emissive: new THREE.Color(0xffffff),
        emissiveIntensity: 0.65,
        roughness: 0.8
      });

      const bodyGeo = new THREE.BoxGeometry(houseW, houseH, houseD);
      const houseMesh = new THREE.Mesh(bodyGeo, houseFacadeMat);
      houseMesh.position.y = houseH / 2;
      houseMesh.castShadow = true;
      houseMesh.receiveShadow = true;
      houseGroup.add(houseMesh);

      // Rooftop Parapet Wall
      const parapetGeo = new THREE.BoxGeometry(houseW + 0.4, 0.9, houseD + 0.4);
      const parapetMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8 });
      const parapet = new THREE.Mesh(parapetGeo, parapetMat);
      parapet.position.y = houseH + 0.45;
      houseGroup.add(parapet);

      // Rooftop Black Sintex Water Tank
      const tankGeo = new THREE.CylinderGeometry(0.9, 0.9, 1.8, 14);
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(-houseW * 0.28, houseH + 1.0, -houseD * 0.24);
      tank.castShadow = true;
      houseGroup.add(tank);

      // External AC Compressor Units on wall
      [-houseW * 0.25, houseW * 0.25].forEach(acX => {
        const acGeo = new THREE.BoxGeometry(1.0, 0.7, 0.45);
        const ac = new THREE.Mesh(acGeo, acMat);
        ac.position.set(acX, houseH * 0.6, -side * (houseD / 2 + 0.25));
        houseGroup.add(ac);
      });

      // Ground-Floor Dukan / Shopfront facing the road
      const shopGeo = new THREE.PlaneGeometry(houseW * 0.75, 3.2);
      const shopTex = TextureGenerator.createShopfrontTexture(
        shopNames[h % shopNames.length],
        h % 2 === 0 ? '#b91c1c' : '#1d4ed8'
      );
      const shopMat = new THREE.MeshBasicMaterial({ map: shopTex });
      const shopMesh = new THREE.Mesh(shopGeo, shopMat);
      shopMesh.position.set(0, 1.8, -side * (houseD / 2 + 0.05));
      if (side === 1) shopMesh.rotation.y = Math.PI;
      houseGroup.add(shopMesh);

      houseGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      this.trackGroup.add(houseGroup);
    }

    // 2. Cyber City Commercial Glass Skyscraper Towers
    if (isGurugram) {
      const towerLocations = [
        [220, -110], [360, 60], [480, 220], [400, 440], [140, 580], [-190, 480], [-340, 240], [-280, -60]
      ];

      towerLocations.forEach(([tx, tz], idx) => {
        const towerGroup = new THREE.Group();
        towerGroup.position.set(tx, 0, tz);

        const towerH = 75 + (idx % 4) * 25;
        const towerW = 34 + (idx % 3) * 6;

        const { map: glassMap, emissiveMap: glassEmissive } = TextureGenerator.createGlassFacadeTexture(
          idx % 2 === 0 ? '#1e3a8a' : '#0f766e'
        );
        const glassMat = new THREE.MeshStandardMaterial({
          map: glassMap,
          emissiveMap: glassEmissive,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.8,
          roughness: 0.15,
          metalness: 0.85
        });

        const towerGeo = new THREE.BoxGeometry(towerW, towerH, towerW);
        const towerMesh = new THREE.Mesh(towerGeo, glassMat);
        towerMesh.position.y = towerH / 2;
        towerMesh.castShadow = true;
        towerGroup.add(towerMesh);

        // Rooftop Telecommunication Antenna with Blinking Red Light
        const antennaGeo = new THREE.CylinderGeometry(0.12, 0.25, 14, 8);
        const antennaMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9 });
        const antenna = new THREE.Mesh(antennaGeo, antennaMat);
        antenna.position.set(0, towerH + 7, 0);
        towerGroup.add(antenna);

        const beaconGeo = new THREE.SphereGeometry(0.45, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(0, towerH + 14, 0);
        towerGroup.add(beacon);

        this.trackGroup.add(towerGroup);
      });

      // 3. Elevated Rapid Metro Viaduct & Overhead Metro Train
      const metroGroup = new THREE.Group();
      const metroTrackGeo = new THREE.BoxGeometry(8.5, 2.2, 340);
      const concreteMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.7 });
      const metroDeck = new THREE.Mesh(metroTrackGeo, concreteMat);
      metroDeck.position.set(120, 13.5, 260);
      metroGroup.add(metroDeck);

      // Support Piers
      const pierGeo = new THREE.CylinderGeometry(1.4, 1.6, 13.5, 8);
      for (let pz = 110; pz <= 410; pz += 60) {
        const pier = new THREE.Mesh(pierGeo, concreteMat);
        pier.position.set(120, 6.75, pz);
        pier.castShadow = true;
        metroGroup.add(pier);
      }

      // 3-Coach Modern Rapid Metro Train (Silver & Cyan)
      const coachMat = new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        metalness: 0.8,
        roughness: 0.2
      });
      for (let c = 0; c < 3; c++) {
        const coachGeo = new THREE.BoxGeometry(3.4, 3.2, 28);
        const coach = new THREE.Mesh(coachGeo, coachMat);
        coach.position.set(120, 16.2, 220 + c * 31);
        coach.castShadow = true;
        metroGroup.add(coach);
      }

      this.trackGroup.add(metroGroup);
    }

    // 4. Overhead Highway Green Directional Signs
    const gantryIntervals = [0.25, 0.65];
    gantryIntervals.forEach((t, i) => {
      const pt = this.spline.getPointAt(t);
      const tangent = this.spline.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      const gantryPillarsGeo = new THREE.CylinderGeometry(0.3, 0.3, 7.5, 8);
      const metalMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });

      [-1, 1].forEach(side => {
        const p = new THREE.Mesh(gantryPillarsGeo, metalMat);
        p.position.copy(pt).addScaledVector(binormal, side * (halfWidth + 2));
        p.position.y += 3.75;
        this.trackGroup.add(p);
      });

      const beamGeo = new THREE.BoxGeometry(this.config.roadWidth + 4.5, 0.4, 0.4);
      const beam = new THREE.Mesh(beamGeo, metalMat);
      beam.position.copy(pt);
      beam.position.y += 7.2;
      beam.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), binormal);
      this.trackGroup.add(beam);

      // Green Sign Board
      const signGeo = new THREE.PlaneGeometry(7.5, 2.6);
      const signTex = TextureGenerator.createHighwayGantrySign(
        i === 0 ? 'CYBER CITY ➜' : 'NH-48 EXPRESSWAY',
        'GURUGRAM GRAND PRIX'
      );
      const signMat = new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide });
      const sign = new THREE.Mesh(signGeo, signMat);
      sign.position.copy(pt);
      sign.position.y += 6.8;
      sign.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
      this.trackGroup.add(sign);
    });

    // 5. Street Lamps casting warm light onto the road
    for (let i = 0; i < 16; i++) {
      const t = i / 16;
      const pt = this.spline.getPointAt(t);
      const tangent = this.spline.getTangentAt(t).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 7.5, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.copy(pt).addScaledVector(binormal, halfWidth + 1.8);
      pole.position.y += 3.75;
      this.trackGroup.add(pole);

      // Arm curving over road
      const armGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6);
      armGeo.rotateZ(Math.PI / 3);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.copy(pt).addScaledVector(binormal, halfWidth + 0.8);
      arm.position.y += 7.2;
      this.trackGroup.add(arm);

      // Lamp Head with glowing yellow lens
      const lampHeadGeo = new THREE.BoxGeometry(0.4, 0.15, 0.6);
      const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const lampHead = new THREE.Mesh(lampHeadGeo, lampHeadMat);
      lampHead.position.copy(pt).addScaledVector(binormal, halfWidth + 0.2);
      lampHead.position.y += 7.4;
      this.trackGroup.add(lampHead);
    }
  }

  /**
   * Check vehicle distance to nearest spline checkpoint. If > half road width, vehicle is off-road.
   */
  public isOffRoad(x: number, z: number): boolean {
    const halfWidth = (this.config.roadWidth || 16) / 2;
    let minDist = Infinity;
    for (const cp of this.checkpoints) {
      const dx = x - cp.x;
      const dz = z - cp.z;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist) minDist = d;
    }
    return minDist > halfWidth + 2.0;
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

    // Checkpoint crossed within 28m radius
    if (distToCp < 28) {
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
