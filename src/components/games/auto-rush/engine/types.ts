export type CityId = 'gurugram' | 'delhi';
export type TimeOfDay = 'morning' | 'sunset' | 'night';
export type WeatherType = 'clear' | 'rain';
export type AIDifficulty = 'easy' | 'normal' | 'hard';
export type GameScreen = 'menu' | 'garage' | 'setup' | 'race' | 'podium' | 'multiplayer' | 'settings';

export interface VehicleStats {
  topSpeed: number;    // Base ~60 - 85 km/h multiplier
  accel: number;       // Base acceleration
  handling: number;    // Cornering traction & steering agility
  braking: number;     // Deceleration power
  nitroPower: number;  // Boost thrust multiplier
}

export interface VehicleConfig {
  id: string;
  name: string;
  tagline: string;
  tier: 'STARTER' | 'STREET' | 'PRO' | 'LEGEND';
  price: number;
  bodyColor: string;
  roofColor: string;
  trimColor: string;
  seatColor: string;
  slogan: string;
  numberPlate: string;
  stats: VehicleStats;
  maxStats: VehicleStats;
  upgrades: {
    topSpeed: number; // Current upgrade level (0 - 5)
    accel: number;
    handling: number;
    nitro: number;
  };
}

export interface TrackConfig {
  id: string;
  name: string;
  shortName: string;
  city: CityId;
  cityName: string;
  tagline: string;
  lengthMeters: number;
  lapsDefault: number;
  roadWidth: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  accentColor: string;
  skyColors: {
    morning: [string, string];
    sunset: [string, string];
    night: [string, string];
  };
  hasMetroPillars?: boolean;
  landmarks: string[];
  waypoints: Array<{ x: number; z: number; y?: number; width?: number }>;
}

export interface RaceSettings {
  trackId: string;
  laps: number;
  difficulty: AIDifficulty;
  timeOfDay: TimeOfDay;
  weather: WeatherType;
}

export interface VehiclePhysicsState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  yaw: number;           // Rotation around Y (heading)
  pitch: number;         // Rotation around X (acceleration / braking tilt)
  roll: number;          // Rotation around Z (sharp turn lean!)
  steeringAngle: number; // Front wheel angle
  speedKmh: number;
  rpm: number;
  gear: number;
  isGrounded: boolean;
  isDrifting: boolean;
  driftFactor: number;   // 0 to 1
  isNitroActive: boolean;
  nitroRemaining: number;// 0 to 100
  lap: number;
  currentCheckpoint: number;
  raceDistanceTraveled: number;
  lapTimes: number[];
  currentLapTime: number;
  bestLapTime: number;
  isFinished: boolean;
  finishPosition: number;
}

export interface RacerParticipant {
  id: string;
  name: string;
  isPlayer: boolean;
  vehicle: VehicleConfig;
  state: VehiclePhysicsState;
}

export interface PlayerControlsInput {
  throttle: number; // 0 to 1
  brake: number;    // 0 to 1 (also reverse if stopped)
  steer: number;    // -1 (left) to +1 (right)
  drift: boolean;
  nitro: boolean;
  horn: boolean;
  recover: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  vehicleName: string;
  time: string;
  isPlayer: boolean;
}

