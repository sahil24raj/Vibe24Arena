import * as THREE from 'three';
import { AIDifficulty, RacerParticipant, TrackConfig, VehicleConfig } from './types';
import { VehicleController } from './VehicleController';
import { INITIAL_VEHICLES, AI_NAMES } from './constants';
import { TrackManager } from './TrackManager';

export class AIOpponentManager {
  public opponents: {
    participant: RacerParticipant;
    controller: VehicleController;
    splineProgress: number; // 0 to 1
    lateralOffset: number;  // Spacing across road width (-4 to +4)
    nitroCooldown: number;
  }[] = [];

  private trackManager: TrackManager;
  private difficulty: AIDifficulty;

  constructor(trackManager: TrackManager, difficulty: AIDifficulty = 'normal') {
    this.trackManager = trackManager;
    this.difficulty = difficulty;
    this.spawnOpponents();
  }

  public spawnOpponents(): void {
    this.opponents = [];
    const spline = this.trackManager.spline;

    // Pick 7 distinct vehicles & names
    for (let i = 0; i < 7; i++) {
      const vehTemplate = INITIAL_VEHICLES[(i + 1) % INITIAL_VEHICLES.length];
      const name = AI_NAMES[i % AI_NAMES.length];

      // Grid position: staggered start behind the start line
      const gridRow = Math.floor((i + 1) / 2);
      const gridSide = (i + 1) % 2 === 0 ? 1 : -1;
      const startT = (1.0 - (gridRow * 0.016)) % 1.0;

      const pt = spline.getPointAt(startT);
      const tangent = spline.getTangentAt(startT).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();
      const spawnPos = pt.clone().addScaledVector(binormal, gridSide * 3.8);

      const startYaw = Math.atan2(tangent.x, tangent.z);

      const controller = new VehicleController(vehTemplate, spawnPos.x, spawnPos.z, startYaw);

      this.opponents.push({
        participant: {
          id: `ai_${i}`,
          name,
          isPlayer: false,
          vehicle: vehTemplate,
          state: controller.state
        },
        controller,
        splineProgress: startT,
        lateralOffset: (Math.random() - 0.5) * 6,
        nitroCooldown: 4 + Math.random() * 8
      });
    }
  }

  public update(delta: number, totalLaps: number): void {
    const spline = this.trackManager.spline;
    const diffSpeedMul = this.difficulty === 'easy' ? 0.82 : (this.difficulty === 'normal' ? 0.94 : 1.04);

    this.opponents.forEach(ai => {
      const state = ai.controller.state;
      if (state.isFinished) return;

      // 1. Calculate Look-ahead Point along track spline
      const lookAheadDistT = 0.035; // ~50m ahead
      const targetT = (ai.splineProgress + lookAheadDistT) % 1.0;
      const targetPt = spline.getPointAt(targetT);
      const tangent = spline.getTangentAt(targetT).normalize();
      const binormal = new THREE.Vector3().crossVectors(tangent, new THREE.Vector3(0, 1, 0)).normalize();

      // Apply assigned lateral offset to form distinct racing lines
      const laneTarget = targetPt.clone().addScaledVector(binormal, ai.lateralOffset);

      // 2. Steer towards lookahead point
      const toTargetX = laneTarget.x - state.x;
      const toTargetZ = laneTarget.z - state.z;
      const targetAngle = Math.atan2(toTargetX, toTargetZ);

      // Angle difference
      let angleDiff = targetAngle - state.yaw;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      const steerInput = Math.max(-1, Math.min(1, angleDiff * 3.2));

      // 3. Dynamic throttle and corner braking
      const curveSharpness = Math.abs(angleDiff);
      let throttle = 1.0 * diffSpeedMul;
      let brake = 0;

      if (curveSharpness > 0.45) {
        // Sharp hairpin
        throttle = 0.35 * diffSpeedMul;
        if (state.speedKmh > 48) brake = 0.6;
      } else if (curveSharpness > 0.25) {
        // Moderate turn
        throttle = 0.75 * diffSpeedMul;
        if (state.speedKmh > 65) brake = 0.25;
      }

      // 4. Nitro usage on straightaways
      let nitro = false;
      ai.nitroCooldown -= delta;
      if (ai.nitroCooldown <= 0 && curveSharpness < 0.12 && state.speedKmh > 45) {
        nitro = true;
        if (state.nitroRemaining < 25) {
          ai.nitroCooldown = 12 + Math.random() * 10;
        }
      }

      // Step Controller Physics
      ai.controller.update(delta, {
        throttle,
        brake,
        steer: steerInput,
        drift: curveSharpness > 0.5 && state.speedKmh > 52,
        nitro,
        horn: false,
        recover: false
      });

      // 5. Update Lap & Checkpoint progress
      const progress = this.trackManager.updateRacerProgress(
        state.x,
        state.z,
        state.currentCheckpoint,
        state.lap,
        totalLaps
      );

      state.currentCheckpoint = progress.nextCheckpoint;
      if (progress.isLapCompleted) {
        state.lapTimes.push(state.currentLapTime);
        if (state.bestLapTime === 0 || state.currentLapTime < state.bestLapTime) {
          state.bestLapTime = state.currentLapTime;
        }
        state.currentLapTime = 0;
      }
      state.lap = progress.nextLap;
      state.isFinished = progress.isRaceFinished;

      // Approximate spline progress parameter
      ai.splineProgress = state.currentCheckpoint / this.trackManager.checkpoints.length;
    });
  }
}

