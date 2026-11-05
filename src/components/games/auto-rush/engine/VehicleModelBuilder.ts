import * as THREE from 'three';
import { VehicleConfig } from './types';

export class VehicleModelBuilder {
  /**
   * Builds an ultra-realistic 3D Indian Auto-Rickshaw ("Tirri") model
   * Reverse-engineered to match the iconic design of autorush.autos:
   * - Curved aerodynamic fiberglass canopy with rear overhang
   * - Lower pressed-metal tub with side passenger entry
   * - Steerable single front wheel with chrome fork suspension & mudguard
   * - Handlebar with meter box, central round chrome headlamp & amber blinkers
   * - Dual rear wheels with red mudflaps ("HORN OK PLEASE")
   * - Detailed passenger bench & driver seat
   * - Rear engine vents and chrome exhaust pipe
   */
  public static buildAutoRickshaw(config: VehicleConfig): THREE.Group {
    const root = new THREE.Group();
    root.name = 'auto_rickshaw_root';

    // 1. Dynamic Authentic Materials
    const bodyColor = new THREE.Color(config.bodyColor || '#1e8c4e');
    const roofColor = new THREE.Color(config.roofColor || '#f6c62a');
    const trimColor = new THREE.Color(config.trimColor || '#f6c62a');

    // High-gloss automotive finish for canopy & tub
    const bodyMat = new THREE.MeshStandardMaterial({
      color: bodyColor,
      roughness: 0.28,
      metalness: 0.35
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: roofColor,
      roughness: 0.38,
      metalness: 0.15
    });

    const darkChassisMat = new THREE.MeshStandardMaterial({
      color: 0x18181f,
      roughness: 0.7,
      metalness: 0.6
    });

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.12,
      metalness: 0.95
    });

    const rubberMat = new THREE.MeshStandardMaterial({
      color: 0x17171c,
      roughness: 0.92,
      metalness: 0.05
    });

    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      roughness: 0.25,
      metalness: 0.8
    });

    const seatMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(config.seatColor || '#5a2222'),
      roughness: 0.75,
      metalness: 0.08
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdbeafe,
      transparent: true,
      opacity: 0.5,
      roughness: 0.08,
      metalness: 0.1,
      transmission: 0.85
    });

    const headlampMat = new THREE.MeshStandardMaterial({
      color: 0xfffae5,
      emissive: 0xffea75,
      emissiveIntensity: 1.2,
      roughness: 0.15
    });

    const blinkerMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.8,
      roughness: 0.2
    });

    const taillampMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0xb91c1c,
      emissiveIntensity: 0.9,
      roughness: 0.2
    });

    // 2. Chassis Base & Underbody
    const chassisGeo = new THREE.BoxGeometry(1.22, 0.14, 2.4);
    const chassis = new THREE.Mesh(chassisGeo, darkChassisMat);
    chassis.position.set(0, 0.36, 0.05);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    root.add(chassis);

    // Tubular side crash guards (safety foot rails)
    [-0.64, 0.64].forEach(x => {
      const railGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.6, 8);
      railGeo.rotateX(Math.PI / 2);
      const rail = new THREE.Mesh(railGeo, chromeMat);
      rail.position.set(x, 0.32, -0.15);
      root.add(rail);
    });

    // 3. Lower Body Metal Tub (Green / Body Color)
    const tubGeo = new THREE.BoxGeometry(1.26, 0.52, 1.45);
    const tub = new THREE.Mesh(tubGeo, bodyMat);
    tub.position.set(0, 0.65, -0.42);
    tub.castShadow = true;
    tub.receiveShadow = true;
    root.add(tub);

    // Front Nose / Scuttle Taper (angled downwards towards single front wheel)
    const noseGeo = new THREE.CylinderGeometry(0.38, 0.63, 0.88, 16);
    noseGeo.rotateX(Math.PI / 2);
    const nose = new THREE.Mesh(noseGeo, bodyMat);
    nose.position.set(0, 0.72, 0.68);
    nose.scale.set(1.0, 0.74, 1.0);
    nose.castShadow = true;
    root.add(nose);

    // 4. Iconic Curved Fiberglass Canopy (Yellow Roof)
    const roofGroup = new THREE.Group();

    // Curved Top Hood using Cylinder segment
    const roofGeo = new THREE.CylinderGeometry(0.68, 0.68, 2.15, 20, 1, false, 0, Math.PI);
    roofGeo.rotateZ(Math.PI / 2);
    roofGeo.rotateY(Math.PI / 2);
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.set(0, 1.76, -0.18);
    roofMesh.scale.set(0.96, 0.44, 1.08);
    roofMesh.castShadow = true;
    roofGroup.add(roofMesh);

    // Roof rear luggage overhang lip
    const lipGeo = new THREE.BoxGeometry(1.28, 0.08, 0.22);
    const lipMesh = new THREE.Mesh(lipGeo, roofMat);
    lipMesh.position.set(0, 1.84, -1.28);
    lipMesh.castShadow = true;
    roofGroup.add(lipMesh);

    // Slender Roof Support Pillars (A, B, C Pillars)
    const pillarGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.95, 8);
    const pillarPositions = [
      [-0.56, 1.34, 0.32], // A Pillar Left
      [0.56, 1.34, 0.32],  // A Pillar Right
      [-0.60, 1.34, -0.45],// B Pillar Left
      [0.60, 1.34, -0.45], // B Pillar Right
      [-0.60, 1.34, -1.15],// C Pillar Left
      [0.60, 1.34, -1.15]  // C Pillar Right
    ];
    pillarPositions.forEach(([px, py, pz]) => {
      const p = new THREE.Mesh(pillarGeo, darkChassisMat);
      p.position.set(px, py, pz);
      roofGroup.add(p);
    });

    root.add(roofGroup);

    // 5. Windshield & Frame
    const windshieldGeo = new THREE.PlaneGeometry(1.08, 0.62);
    windshieldGeo.rotateX(-0.16);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 1.36, 0.36);
    root.add(windshield);

    // Black rubber windshield gasket frame
    const wsFrameGeo = new THREE.BoxGeometry(1.12, 0.66, 0.04);
    wsFrameGeo.rotateX(-0.16);
    const wsFrame = new THREE.Mesh(wsFrameGeo, darkChassisMat);
    wsFrame.position.set(0, 1.36, 0.34);
    root.add(wsFrame);

    // Wiper blade on front glass
    const wiperGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6);
    wiperGeo.rotateZ(0.65);
    const wiper = new THREE.Mesh(wiperGeo, darkChassisMat);
    wiper.position.set(0.12, 1.32, 0.38);
    root.add(wiper);

    // 6. Steerable Front Wheel Assembly (Front Fork + Wheel + Mudguard)
    const frontSteeringGroup = new THREE.Group();
    frontSteeringGroup.name = 'frontWheel';
    frontSteeringGroup.position.set(0, 0.28, 0.95);

    // Single Front Wheel Tire & Rim
    const tireGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.16, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const frontTire = new THREE.Mesh(tireGeo, rubberMat);
    frontTire.castShadow = true;
    frontSteeringGroup.add(frontTire);

    // Wheel Chrome Rim & Hubcap
    const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.17, 16);
    rimGeo.rotateZ(Math.PI / 2);
    const frontRim = new THREE.Mesh(rimGeo, rimMat);
    frontSteeringGroup.add(frontRim);

    // Curved Front Mudguard
    const mudguardGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.22, 16, 1, false, 0, Math.PI);
    mudguardGeo.rotateZ(Math.PI / 2);
    mudguardGeo.rotateY(Math.PI / 2);
    const mudguard = new THREE.Mesh(mudguardGeo, bodyMat);
    mudguard.position.set(0, 0.08, 0);
    mudguard.castShadow = true;
    frontSteeringGroup.add(mudguard);

    // Chromed Front Fork Struts
    [-0.11, 0.11].forEach(x => {
      const forkGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.52, 8);
      const fork = new THREE.Mesh(forkGeo, chromeMat);
      fork.position.set(x, 0.26, 0);
      frontSteeringGroup.add(fork);
    });

    root.add(frontSteeringGroup);

    // 7. Handlebar & Cockpit Controls
    const handlebarGroup = new THREE.Group();
    handlebarGroup.position.set(0, 0.96, 0.56);

    const barGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.62, 8);
    barGeo.rotateZ(Math.PI / 2);
    const bar = new THREE.Mesh(barGeo, chromeMat);
    handlebarGroup.add(bar);

    // Rubber Grips
    [-0.28, 0.28].forEach(x => {
      const gripGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.12, 8);
      gripGeo.rotateZ(Math.PI / 2);
      const grip = new THREE.Mesh(gripGeo, rubberMat);
      grip.position.x = x;
      handlebarGroup.add(grip);
    });

    // Indian Digital Auto Fare Meter Box on dash
    const meterGeo = new THREE.BoxGeometry(0.16, 0.12, 0.08);
    const meterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4
    });
    const meter = new THREE.Mesh(meterGeo, meterMat);
    meter.position.set(0.18, 0.05, 0.02);

    // Glowing green LED meter readout
    const meterScreenGeo = new THREE.PlaneGeometry(0.12, 0.06);
    const meterScreenMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const meterScreen = new THREE.Mesh(meterScreenGeo, meterScreenMat);
    meterScreen.position.set(0.18, 0.05, 0.065);
    handlebarGroup.add(meter);
    handlebarGroup.add(meterScreen);

    // Side view mirror on right cabin strut
    const mirrorStemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.18, 6);
    mirrorStemGeo.rotateZ(Math.PI / 4);
    const mirrorStem = new THREE.Mesh(mirrorStemGeo, chromeMat);
    mirrorStem.position.set(0.62, 1.25, 0.32);
    root.add(mirrorStem);

    const mirrorHeadGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12);
    mirrorHeadGeo.rotateX(Math.PI / 2);
    const mirrorHead = new THREE.Mesh(mirrorHeadGeo, chromeMat);
    mirrorHead.position.set(0.70, 1.32, 0.32);
    root.add(mirrorHead);

    root.add(handlebarGroup);

    // 8. Headlamp & Turn Indicators
    // Central Round Bullet Chrome Headlamp
    const headlampCasingGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.16, 16);
    headlampCasingGeo.rotateX(Math.PI / 2);
    const headlampCasing = new THREE.Mesh(headlampCasingGeo, chromeMat);
    headlampCasing.position.set(0, 0.88, 1.05);

    const headlampLensGeo = new THREE.CircleGeometry(0.11, 16);
    const headlampLens = new THREE.Mesh(headlampLensGeo, headlampMat);
    headlampLens.position.set(0, 0.88, 1.135);
    root.add(headlampCasing);
    root.add(headlampLens);

    // Left and Right Amber Indicator Blinkers
    [-0.42, 0.42].forEach(x => {
      const blinkerGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.04, 12);
      blinkerGeo.rotateX(Math.PI / 2);
      const blinker = new THREE.Mesh(blinkerGeo, blinkerMat);
      blinker.position.set(x, 0.78, 0.98);
      root.add(blinker);
    });

    // 9. Dual Rear Wheels
    const rearWheelRadius = 0.28;
    const rearWheelThickness = 0.18;

    // Rear Left Wheel
    const rearLeftWheel = new THREE.Group();
    rearLeftWheel.name = 'rearLeftWheel';
    rearLeftWheel.position.set(-0.64, 0.28, -0.68);

    const rTireGeo = new THREE.CylinderGeometry(rearWheelRadius, rearWheelRadius, rearWheelThickness, 24);
    rTireGeo.rotateZ(Math.PI / 2);
    const rTireLeft = new THREE.Mesh(rTireGeo, rubberMat);
    rTireLeft.castShadow = true;
    rearLeftWheel.add(rTireLeft);

    const rRimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.19, 16);
    rRimGeo.rotateZ(Math.PI / 2);
    const rRimLeft = new THREE.Mesh(rRimGeo, rimMat);
    rearLeftWheel.add(rRimLeft);
    root.add(rearLeftWheel);

    // Rear Right Wheel
    const rearRightWheel = new THREE.Group();
    rearRightWheel.name = 'rearRightWheel';
    rearRightWheel.position.set(0.64, 0.28, -0.68);

    const rTireRight = new THREE.Mesh(rTireGeo, rubberMat);
    rTireRight.castShadow = true;
    rearRightWheel.add(rTireRight);

    const rRimRight = new THREE.Mesh(rRimGeo, rimMat);
    rearRightWheel.add(rRimRight);
    root.add(rearRightWheel);

    // Flared Rear Wheel Fenders
    [-0.64, 0.64].forEach(x => {
      const fenderGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.24, 16, 1, false, 0, Math.PI);
      fenderGeo.rotateZ(Math.PI / 2);
      fenderGeo.rotateY(Math.PI / 2);
      const fender = new THREE.Mesh(fenderGeo, bodyMat);
      fender.position.set(x, 0.38, -0.68);
      fender.castShadow = true;
      root.add(fender);
    });

    // 10. Rear Mudflaps with Desi Slogans
    const mudflapMat = new THREE.MeshStandardMaterial({
      color: 0x991b1b,
      roughness: 0.8
    });
    [-0.62, 0.62].forEach((x, idx) => {
      const flapGeo = new THREE.BoxGeometry(0.24, 0.22, 0.02);
      const flap = new THREE.Mesh(flapGeo, mudflapMat);
      flap.position.set(x, 0.20, -0.98);
      root.add(flap);
    });

    // 11. Seating & Interior
    // Driver Bucket Seat
    const driverSeatGeo = new THREE.BoxGeometry(0.55, 0.18, 0.44);
    const driverSeat = new THREE.Mesh(driverSeatGeo, seatMat);
    driverSeat.position.set(0, 0.52, 0.14);
    driverSeat.castShadow = true;
    root.add(driverSeat);

    // Rear Wide Passenger Bench
    const passengerBenchGeo = new THREE.BoxGeometry(1.16, 0.24, 0.58);
    const passengerBench = new THREE.Mesh(passengerBenchGeo, seatMat);
    passengerBench.position.set(0, 0.58, -0.72);
    passengerBench.castShadow = true;
    root.add(passengerBench);

    // Passenger Backrest
    const backrestGeo = new THREE.BoxGeometry(1.16, 0.52, 0.12);
    const backrest = new THREE.Mesh(backrestGeo, seatMat);
    backrest.position.set(0, 0.94, -0.98);
    backrest.castShadow = true;
    root.add(backrest);

    // 12. Rear Tailgate, Engine Louvers, Slogan Plate & Taillights
    // Number / Slogan Plate
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = 256;
    plateCanvas.height = 64;
    const pCtx = plateCanvas.getContext('2d')!;
    pCtx.fillStyle = '#fef08a';
    pCtx.fillRect(0, 0, 256, 64);
    pCtx.strokeStyle = '#1e293b';
    pCtx.lineWidth = 3;
    pCtx.strokeRect(4, 4, 248, 56);
    pCtx.fillStyle = '#0f172a';
    pCtx.font = 'bold 20px monospace';
    pCtx.textAlign = 'center';
    pCtx.textBaseline = 'middle';
    pCtx.fillText(config.slogan || 'HORN OK PLEASE', 128, 32);

    const plateTex = new THREE.CanvasTexture(plateCanvas);
    const plateGeo = new THREE.PlaneGeometry(0.72, 0.18);
    const plateMat = new THREE.MeshBasicMaterial({ map: plateTex });
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.set(0, 0.62, -1.16);
    plateMesh.rotation.y = Math.PI;
    root.add(plateMesh);

    // Rear Dual Taillamps
    [-0.52, 0.52].forEach(x => {
      const tailGeo = new THREE.BoxGeometry(0.12, 0.08, 0.03);
      const tail = new THREE.Mesh(tailGeo, taillampMat);
      tail.position.set(x, 0.64, -1.16);
      root.add(tail);
    });

    // Chrome Exhaust Pipe
    const exhaustGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.38, 12);
    exhaustGeo.rotateX(Math.PI / 2);
    const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
    exhaust.position.set(-0.38, 0.25, -1.18);
    root.add(exhaust);

    // Exhaust Tip (Emissive glow anchor for nitro/backfire)
    const exhaustTipGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.05, 12);
    exhaustTipGeo.rotateX(Math.PI / 2);
    const exhaustTipMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });
    const exhaustTip = new THREE.Mesh(exhaustTipGeo, exhaustTipMat);
    exhaustTip.position.set(-0.38, 0.25, -1.37);
    root.add(exhaustTip);

    return root;
  }
}
