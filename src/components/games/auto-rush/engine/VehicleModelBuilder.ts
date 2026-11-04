import * as THREE from 'three';
import { VehicleConfig } from './types';

export class VehicleModelBuilder {
  /**
   * Builds an authentic 3D Indian Auto-Rickshaw model with Three.js
   * featuring body, canopy roof, 3 wheels, windshield, meter, and rear slogan plate.
   */
  public static buildAutoRickshaw(config: VehicleConfig): THREE.Group {
    const root = new THREE.Group();

    // 1. Materials
    const bodyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.bodyColor),
      roughness: 0.35,
      metalness: 0.25
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.roofColor),
      roughness: 0.5,
      metalness: 0.1
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.trimColor),
      roughness: 0.3,
      metalness: 0.4
    });

    const seatMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.seatColor),
      roughness: 0.8,
      metalness: 0.05
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a24,
      roughness: 0.4,
      metalness: 0.6
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      roughness: 0.15,
      metalness: 0.9
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x151518,
      roughness: 0.85,
      metalness: 0.05
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.8
    });

    const headlightMat = new THREE.MeshStandardMaterial({
      color: 0xfffae0,
      emissive: 0xfff0aa,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0xcc1100,
      emissive: 0x990000,
      emissiveIntensity: 0.6,
      roughness: 0.3
    });

    // 2. Chassis / Floorpan (Length 2.6m, Width 1.3m, Height 0.18m)
    const floorGeo = new THREE.BoxGeometry(1.24, 0.16, 2.3);
    const floorMesh = new THREE.Mesh(floorGeo, darkMetalMat);
    floorMesh.position.set(0, 0.35, 0);
    floorMesh.castShadow = true;
    floorMesh.receiveShadow = true;
    root.add(floorMesh);

    // Lower Body Tub (Green / Body Color sides)
    const tubGeo = new THREE.BoxGeometry(1.28, 0.45, 1.4);
    const tubMesh = new THREE.Mesh(tubGeo, bodyMat);
    tubMesh.position.set(0, 0.62, -0.4);
    tubMesh.castShadow = true;
    tubMesh.receiveShadow = true;
    root.add(tubMesh);

    // Front Nose Taper (Angle towards front single wheel)
    const noseGeo = new THREE.CylinderGeometry(0.38, 0.64, 0.85, 12);
    noseGeo.rotateX(Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo, bodyMat);
    noseMesh.position.set(0, 0.68, 0.7);
    noseMesh.scale.set(1.0, 0.7, 1.0);
    noseMesh.castShadow = true;
    root.add(noseMesh);

    // Front Mudguard (over front wheel)
    const frontFenderGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.22, 12, 1, false, 0, Math.PI);
    frontFenderGeo.rotateZ(Math.PI / 2);
    const frontFender = new THREE.Mesh(frontFenderGeo, trimMat);
    frontFender.position.set(0, 0.46, 1.05);
    frontFender.castShadow = true;
    root.add(frontFender);

    // 3. Three Wheels
    // Helper to create a wheel
    const createWheel = () => {
      const wGroup = new THREE.Group();
      // Tire
      const tireGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.16, 20);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, rubberMat);
      tire.castShadow = true;
      wGroup.add(tire);

      // Rim
      const rimGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.17, 16);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, chromeMat);
      wGroup.add(rim);

      // Hub Cap
      const hubGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const hub = new THREE.Mesh(hubGeo, trimMat);
      wGroup.add(hub);

      return wGroup;
    };

    // Front Wheel (Center, Z = +1.05)
    const frontWheel = createWheel();
    frontWheel.position.set(0, 0.26, 1.05);
    frontWheel.name = 'frontWheel';
    root.add(frontWheel);

    // Rear Left Wheel (X = -0.62, Z = -0.7)
    const rearLeftWheel = createWheel();
    rearLeftWheel.position.set(-0.64, 0.26, -0.7);
    rearLeftWheel.name = 'rearLeftWheel';
    root.add(rearLeftWheel);

    // Rear Right Wheel (X = +0.62, Z = -0.7)
    const rearRightWheel = createWheel();
    rearRightWheel.position.set(0.64, 0.26, -0.7);
    rearRightWheel.name = 'rearRightWheel';
    root.add(rearRightWheel);

    // 4. Canopy Roof Pillars (Thin Tubular Steel Frame)
    const pillarGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.05, 8);
    const pillarPositions = [
      [-0.56, 1.25, -1.05], // Rear Left
      [0.56, 1.25, -1.05],  // Rear Right
      [-0.58, 1.25, 0.25],  // Mid Left
      [0.58, 1.25, 0.25],   // Mid Right
      [-0.42, 1.22, 0.85],  // Front Left
      [0.42, 1.22, 0.85]    // Front Right
    ];
    pillarPositions.forEach(([px, py, pz]) => {
      const pMesh = new THREE.Mesh(pillarGeo, darkMetalMat);
      pMesh.position.set(px, py, pz);
      pMesh.castShadow = true;
      root.add(pMesh);
    });

    // 5. Iconic Curved Roof Canopy (Yellow / Roof Color)
    const roofCurveGeo = new THREE.BoxGeometry(1.3, 0.12, 2.2);
    const roofMesh = new THREE.Mesh(roofCurveGeo, roofMat);
    roofMesh.position.set(0, 1.76, -0.1);
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    root.add(roofMesh);

    // Front Roof Visor Lip
    const visorGeo = new THREE.BoxGeometry(1.24, 0.08, 0.28);
    visorGeo.rotateX(0.25);
    const visorMesh = new THREE.Mesh(visorGeo, roofMat);
    visorMesh.position.set(0, 1.73, 1.05);
    root.add(visorMesh);

    // 6. Windshield Glass
    const glassGeo = new THREE.BoxGeometry(1.0, 0.58, 0.03);
    glassGeo.rotateX(-0.18);
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.position.set(0, 1.22, 0.84);
    root.add(glassMesh);

    // Chrome Wiper
    const wiperGeo = new THREE.BoxGeometry(0.02, 0.38, 0.02);
    wiperGeo.rotateZ(0.35);
    const wiper = new THREE.Mesh(wiperGeo, darkMetalMat);
    wiper.position.set(-0.1, 1.22, 0.87);
    root.add(wiper);

    // 7. Interior: Driver Seat & Passenger Bench
    // Driver Seat
    const driverSeatGeo = new THREE.BoxGeometry(0.55, 0.15, 0.42);
    const driverSeat = new THREE.Mesh(driverSeatGeo, seatMat);
    driverSeat.position.set(0, 0.65, 0.15);
    root.add(driverSeat);

    // Passenger Bench
    const passSeatGeo = new THREE.BoxGeometry(1.15, 0.18, 0.48);
    const passSeat = new THREE.Mesh(passSeatGeo, seatMat);
    passSeat.position.set(0, 0.68, -0.75);
    root.add(passSeat);

    // Passenger Backrest
    const passBackGeo = new THREE.BoxGeometry(1.15, 0.42, 0.1);
    const passBack = new THREE.Mesh(passBackGeo, seatMat);
    passBack.position.set(0, 0.98, -1.02);
    root.add(passBack);

    // 8. Handlebars & Auto Fare Meter Box
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.58, 8);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, chromeMat);
    bar.position.set(0, 0.92, 0.65);
    root.add(bar);

    // Classic Yellow Fare Meter Box!
    const meterGeo = new THREE.BoxGeometry(0.14, 0.18, 0.12);
    const meterMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 });
    const meter = new THREE.Mesh(meterGeo, meterMat);
    meter.position.set(0.34, 0.88, 0.62);
    root.add(meter);

    // 9. Lights
    // Big Central Chrome Headlight
    const lightCaseGeo = new THREE.CylinderGeometry(0.14, 0.12, 0.16, 16);
    lightCaseGeo.rotateX(Math.PI / 2);
    const lightCase = new THREE.Mesh(lightCaseGeo, chromeMat);
    lightCase.position.set(0, 0.82, 1.14);
    root.add(lightCase);

    const lightLens = new THREE.Mesh(new THREE.CircleGeometry(0.12, 16), headlightMat);
    lightLens.position.set(0, 0.82, 1.23);
    root.add(lightLens);

    // Rear Taillights (Pair)
    [-0.52, 0.52].forEach(tx => {
      const tMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.04), taillightMat);
      tMesh.position.set(tx, 0.68, -1.16);
      root.add(tMesh);
    });

    // 10. Rear Slogan Canvas & License Plate
    const plateGeo = new THREE.BoxGeometry(0.55, 0.14, 0.02);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.position.set(0, 0.44, -1.16);
    root.add(plate);

    // Rear Slogan Flap (e.g. "HORN OK PLEASE")
    const sloganFlapGeo = new THREE.BoxGeometry(0.85, 0.2, 0.02);
    const sloganFlapMat = new THREE.MeshStandardMaterial({
      color: 0x222228,
      roughness: 0.6
    });
    const sloganFlap = new THREE.Mesh(sloganFlapGeo, sloganFlapMat);
    sloganFlap.position.set(0, 0.26, -1.15);
    root.add(sloganFlap);

    // 11. Dual Exhaust Pipes (Nitro Emission Points)
    const exhaustGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.25, 8);
    exhaustGeo.rotateX(Math.PI / 2);
    [-0.32, 0.32].forEach(ex => {
      const exh = new THREE.Mesh(exhaustGeo, darkMetalMat);
      exh.position.set(ex, 0.24, -1.18);
      root.add(exh);
    });

    return root;
  }
}
