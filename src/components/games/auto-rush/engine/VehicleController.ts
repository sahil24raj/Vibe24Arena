import { PlayerControlsInput, VehicleConfig, VehiclePhysicsState } from './types';

export class VehicleController {
  public config: VehicleConfig;
  public state: VehiclePhysicsState;

  // Physical parameters
  private maxForwardSpeedMs = 22; // ~80 km/h
  private maxReverseSpeedMs = 7;  // ~25 km/h
  private accelerationMs2 = 12;   // Base accel
  private brakingMs2 = 24;        // Strong brakes
  private dragCoefficient = 0.045;// Air resistance
  private rollingFriction = 0.08; // Ground friction
  private maxSteerAngle = 0.42;   // ~24 degrees

  constructor(config: VehicleConfig, startX = 0, startZ = 0, startYaw = 0) {
    this.config = config;

    // Apply vehicle stats + upgrades
    const speedBonus = 1 + (config.stats.topSpeed - 68) * 0.012 + config.upgrades.topSpeed * 0.04;
    const accelBonus = 1 + (config.stats.accel - 65) * 0.012 + config.upgrades.accel * 0.05;
    const handlingBonus = 1 + (config.stats.handling - 70) * 0.01 + config.upgrades.handling * 0.04;

    this.maxForwardSpeedMs = (config.stats.topSpeed / 3.6) * speedBonus;
    this.accelerationMs2 = 10 * accelBonus;
    this.maxSteerAngle = 0.42 * handlingBonus;

    this.state = {
      x: startX,
      y: 0,
      z: startZ,
      vx: 0,
      vy: 0,
      vz: 0,
      yaw: startYaw,
      pitch: 0,
      roll: 0,
      steeringAngle: 0,
      speedKmh: 0,
      rpm: 1000,
      gear: 1,
      isGrounded: true,
      isDrifting: false,
      driftFactor: 0,
      isNitroActive: false,
      nitroRemaining: 100,
      lap: 1,
      currentCheckpoint: 0,
      raceDistanceTraveled: 0,
      lapTimes: [],
      currentLapTime: 0,
      bestLapTime: 0,
      isFinished: false,
      finishPosition: 0
    };
  }

  public update(delta: number, input: PlayerControlsInput): void {
    if (this.state.isFinished) {
      // Gentle coast to stop
      this.state.vx *= 0.94;
      this.state.vz *= 0.94;
      this.updateSpeedAndEngine();
      return;
    }

    this.state.currentLapTime += delta;

    // 1. Nitro Handling
    if (input.nitro && this.state.nitroRemaining > 0 && input.throttle > 0) {
      this.state.isNitroActive = true;
      this.state.nitroRemaining = Math.max(0, this.state.nitroRemaining - delta * 22);
    } else {
      this.state.isNitroActive = false;
      // Passive recharge
      if (!input.nitro) {
        this.state.nitroRemaining = Math.min(100, this.state.nitroRemaining + delta * 6);
      }
    }

    const nitroMultiplier = this.state.isNitroActive ? this.config.stats.nitroPower : 1.0;
    const currentMaxSpeed = this.maxForwardSpeedMs * (this.state.isNitroActive ? 1.25 : 1.0);

    // 2. Current velocity along forward heading
    const forwardX = Math.sin(this.state.yaw);
    const forwardZ = Math.cos(this.state.yaw);
    const rightX = Math.cos(this.state.yaw);
    const rightZ = -Math.sin(this.state.yaw);

    const currentForwardSpeed = this.state.vx * forwardX + this.state.vz * forwardZ;
    const currentLateralSpeed = this.state.vx * rightX + this.state.vz * rightZ;

    // 3. Steering Angle calculation (Speed-sensitive steering)
    const speedRatio = Math.min(1, Math.abs(currentForwardSpeed) / this.maxForwardSpeedMs);
    const effectiveMaxSteer = this.maxSteerAngle * (1 - speedRatio * 0.45);
    const targetSteer = -input.steer * effectiveMaxSteer;
    this.state.steeringAngle += (targetSteer - this.state.steeringAngle) * Math.min(1, delta * 12);

    // 4. Drift Mechanics
    const isDriftingInitiated = input.drift && Math.abs(currentForwardSpeed) > 7 && Math.abs(input.steer) > 0.2;
    if (isDriftingInitiated) {
      this.state.isDrifting = true;
      this.state.driftFactor = Math.min(1.0, this.state.driftFactor + delta * 2.5);
    } else {
      this.state.isDrifting = false;
      this.state.driftFactor = Math.max(0, this.state.driftFactor - delta * 3.0);
    }

    // 5. Yaw Rotation (Turn rate)
    const turnGrip = this.state.isDrifting ? 1.45 : 1.0;
    const turnDirection = currentForwardSpeed >= -0.5 ? 1 : -1;
    const yawRate = (currentForwardSpeed / 2.4) * Math.tan(this.state.steeringAngle) * turnGrip * turnDirection;
    this.state.yaw += yawRate * delta;

    // 6. Acceleration and Braking Forces
    let forwardForce = 0;

    if (input.throttle > 0) {
      if (currentForwardSpeed < currentMaxSpeed) {
        forwardForce += this.accelerationMs2 * input.throttle * nitroMultiplier;
      }
    }

    if (input.brake > 0) {
      if (currentForwardSpeed > 0.8) {
        // Active Braking
        forwardForce -= this.brakingMs2 * input.brake;
      } else {
        // Reverse Gear
        if (currentForwardSpeed > -this.maxReverseSpeedMs) {
          forwardForce -= this.accelerationMs2 * 0.65 * input.brake;
        }
      }
    }

    // Passive Deceleration & Rolling Resistance
    forwardForce -= currentForwardSpeed * this.dragCoefficient * Math.abs(currentForwardSpeed);
    forwardForce -= currentForwardSpeed * this.rollingFriction * 9.8;

    // Lateral Tire Grip & Slip
    const lateralGripFactor = this.state.isDrifting ? 0.35 : 0.88;
    const correctedLateralSpeed = currentLateralSpeed * (1 - lateralGripFactor * Math.min(1, delta * 15));

    // Reconstruct velocity from forward & lateral components
    const newForwardSpeed = currentForwardSpeed + forwardForce * delta;

    this.state.vx = forwardX * newForwardSpeed + rightX * correctedLateralSpeed;
    this.state.vz = forwardZ * newForwardSpeed + rightZ * correctedLateralSpeed;

    // 7. Update World Positions
    this.state.x += this.state.vx * delta;
    this.state.z += this.state.vz * delta;

    // 8. Auto-Rickshaw Body Roll & Pitch (The iconic Rickshaw tilt!)
    const rollTarget = (currentLateralSpeed / 12) * 0.18 + (this.state.isDrifting ? (input.steer > 0 ? 0.06 : -0.06) : 0);
    this.state.roll += (rollTarget - this.state.roll) * Math.min(1, delta * 8);

    const pitchTarget = (forwardForce / 25) * 0.05;
    this.state.pitch += (pitchTarget - this.state.pitch) * Math.min(1, delta * 10);

    // 9. Update Speed & Engine Audio State
    this.updateSpeedAndEngine();
  }

  private updateSpeedAndEngine(): void {
    const speedMs = Math.sqrt(this.state.vx * this.state.vx + this.state.vz * this.state.vz);
    this.state.speedKmh = Math.round(speedMs * 3.6);

    // Gear & RPM Calculation for realistic 2-stroke sound
    const kmh = this.state.speedKmh;
    if (kmh < 18) {
      this.state.gear = 1;
      this.state.rpm = 1000 + (kmh / 18) * 3500;
    } else if (kmh < 40) {
      this.state.gear = 2;
      this.state.rpm = 2200 + ((kmh - 18) / 22) * 3800;
    } else if (kmh < 65) {
      this.state.gear = 3;
      this.state.rpm = 2600 + ((kmh - 40) / 25) * 4000;
    } else {
      this.state.gear = 4;
      this.state.rpm = 3000 + ((kmh - 65) / 35) * 4500;
    }
  }

  public resetTo(x: number, z: number, yaw: number): void {
    this.state.x = x;
    this.state.y = 0;
    this.state.z = z;
    this.state.vx = 0;
    this.state.vy = 0;
    this.state.vz = 0;
    this.state.yaw = yaw;
    this.state.pitch = 0;
    this.state.roll = 0;
    this.state.steeringAngle = 0;
    this.state.speedKmh = 0;
    this.state.isDrifting = false;
    this.state.isNitroActive = false;
  }
}

