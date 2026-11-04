import { TrackConfig, VehicleConfig } from './types';

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const INITIAL_VEHICLES: VehicleConfig[] = [
  {
    id: 'classic',
    name: 'Dilli Classic',
    tagline: 'The green-yellow CNG legend of Delhi NCR',
    tier: 'STARTER',
    price: 0,
    bodyColor: '#1e8c4e',
    roofColor: '#f6c62a',
    trimColor: '#f6c62a',
    seatColor: '#7a2e2e',
    slogan: 'KEEP DISTANCE',
    numberPlate: 'DL 1R CN 4207',
    stats: { topSpeed: 68, accel: 65, handling: 70, braking: 70, nitroPower: 1.3 },
    maxStats: { topSpeed: 82, accel: 80, handling: 85, braking: 85, nitroPower: 1.55 },
    upgrades: { topSpeed: 0, accel: 0, handling: 0, nitro: 0 }
  },
  {
    id: 'mumbai',
    name: 'Mumbai Kaali-Peeli',
    tagline: 'Black & yellow, zero patience in peak traffic',
    tier: 'STARTER',
    price: 0,
    bodyColor: '#1f1f26',
    roofColor: '#f6c62a',
    trimColor: '#f6c62a',
    seatColor: '#3a3a48',
    slogan: 'HORN OK PLEASE',
    numberPlate: 'MH 02 AB 1987',
    stats: { topSpeed: 66, accel: 72, handling: 68, braking: 72, nitroPower: 1.35 },
    maxStats: { topSpeed: 80, accel: 86, handling: 82, braking: 85, nitroPower: 1.6 },
    upgrades: { topSpeed: 0, accel: 0, handling: 0, nitro: 0 }
  },
  {
    id: 'pink',
    name: 'Pink Rani',
    tagline: 'Quick hands, quicker turns through narrow gullies',
    tier: 'STREET',
    price: 2500,
    bodyColor: '#ff4f9a',
    roofColor: '#ffe0ef',
    trimColor: '#ffffff',
    seatColor: '#b81d5e',
    slogan: 'माँ का आशीर्वाद',
    numberPlate: 'HR 55 PK 0508',
    stats: { topSpeed: 70, accel: 70, handling: 82, braking: 75, nitroPower: 1.35 },
    maxStats: { topSpeed: 84, accel: 82, handling: 95, braking: 88, nitroPower: 1.6 },
    upgrades: { topSpeed: 0, accel: 0, handling: 0, nitro: 0 }
  },
  {
    id: 'electric',
    name: 'Bijli Blue EV',
    tagline: 'Instant electric torque, whisper quiet acceleration',
    tier: 'PRO',
    price: 6500,
    bodyColor: '#2463d6',
    roofColor: '#e9f2ff',
    trimColor: '#3ee0ff',
    seatColor: '#1b2a4a',
    slogan: 'ZERO POLLUTION',
    numberPlate: 'DL 1R EV 2030',
    stats: { topSpeed: 74, accel: 85, handling: 76, braking: 78, nitroPower: 1.45 },
    maxStats: { topSpeed: 88, accel: 98, handling: 88, braking: 90, nitroPower: 1.7 },
    upgrades: { topSpeed: 0, accel: 0, handling: 0, nitro: 0 }
  },
  {
    id: 'tiger',
    name: 'Bengal Tiger',
    tagline: 'Orange blur roaring down the highway',
    tier: 'STREET',
    price: 4500,
    bodyColor: '#ff7a1a',
    roofColor: '#1d1d22',
    trimColor: '#ffffff',
    seatColor: '#1d1d22',
    slogan: 'SOUND HORN',
    numberPlate: 'WB 04 TG 3131',
    stats: { topSpeed: 73, accel: 72, handling: 74, braking: 72, nitroPower: 1.38 },
    maxStats: { topSpeed: 86, accel: 84, handling: 86, braking: 84, nitroPower: 1.65 },
    upgrades: { topSpeed: 0, accel: 0, handling: 0, nitro: 0 }
  },
  {
    id: 'neon',
    name: 'Cyber Neon Tuk',
    tagline: 'Cyber City after dark with glowing neon trim',
    tier: 'PRO',
    price: 8500,
    bodyColor: '#6b2bff',
    roofColor: '#241440',
    trimColor: '#3dfcff',
    seatColor: '#241440',
    slogan: 'USE DIPPER AT NIGHT',
    numberPlate: 'HR 26 NE 0N0N',
    stats: { topSpeed: 76, accel: 78, handling: 78, braking: 76, nitroPower: 1.48 },
    maxStats: { topSpeed: 90, accel: 90, handling: 90, braking: 88, nitroPower: 1.75 },
    upgrades: { topSpeed: 0, accel: 0, handling: 0, nitro: 0 }
  },
  {
    id: 'sunshine',
    name: 'Chennai Sunshine',
    tagline: 'All-yellow, all-weather resilient machine',
    tier: 'STARTER',
    price: 0,
    bodyColor: '#ffc21a',
    roofColor: '#1d1d22',
    trimColor: '#1d1d22',
    seatColor: '#3a2a1a',
    slogan: 'जय माता दी',
    numberPlate: 'TN 09 AU 7777',
    stats: { topSpeed: 67, accel: 68, handling: 72, braking: 74, nitroPower: 1.32 },
    maxStats: { topSpeed: 81, accel: 80, handling: 86, braking: 86, nitroPower: 1.58 },
    upgrades: { topSpeed: 0, accel: 0, handling: 0, nitro: 0 }
  },
  {
    id: 'raja',
    name: 'Raja Red Sultan',
    tagline: 'Gold trim, top speed, no brakes, pure royalty',
    tier: 'LEGEND',
    price: 15000,
    bodyColor: '#c8242b',
    roofColor: '#1d1d22',
    trimColor: '#e8b33c',
    seatColor: '#5a1a1a',
    slogan: 'बुरी नज़र वाले तेरा मुँह काला',
    numberPlate: 'HR 26 RJ 0001',
    stats: { topSpeed: 82, accel: 76, handling: 72, braking: 70, nitroPower: 1.55 },
    maxStats: { topSpeed: 96, accel: 90, handling: 86, braking: 85, nitroPower: 1.85 },
    upgrades: { topSpeed: 0, accel: 0, handling: 0, nitro: 0 }
  }
];

export const AI_NAMES = [
  'Raju Auto',
  'Pappu Driver',
  'Bunty Speed',
  'Chintu Rocket',
  'Guddu Bhai',
  'Sonu Express',
  'Tinku Storm',
  'Babloo Drift',
  'Munna Bhai',
  'Pinky Star'
];

export const UPGRADE_PRICES = {
  topSpeed: [400, 800, 1500, 2600, 4200],
  accel: [350, 750, 1400, 2400, 3800],
  handling: [300, 650, 1200, 2100, 3400],
  nitro: [450, 900, 1700, 2900, 4600]
};

// 4 Iconic Indian City Tracks
export const TRACKS_CATALOG: TrackConfig[] = [
  {
    id: 'cyber',
    name: 'CYBER CITY CIRCUIT',
    shortName: 'Cyber City',
    city: 'gurugram',
    cityName: 'Gurugram',
    tagline: 'Under the Rapid Metro line, IFFCO flyovers and gleaming glass towers',
    lengthMeters: 1420,
    lapsDefault: 3,
    roadWidth: 16,
    difficulty: 'Medium',
    accentColor: '#00D2FF',
    skyColors: {
      morning: ['#1e3a8a', '#93c5fd'],
      sunset: ['#4c1d95', '#f97316'],
      night: ['#050814', '#0d1829']
    },
    hasMetroPillars: true,
    landmarks: ['DLF Cyber City Towers', 'Rapid Metro Flyover', 'IFFCO Chowk Gantry', 'Neon Billboards'],
    waypoints: [
      { x: 0, z: 0 },
      { x: 120, z: -10 },
      { x: 260, z: 30 },
      { x: 380, z: 120 },
      { x: 440, z: 240 },
      { x: 410, z: 360 },
      { x: 300, z: 460 },
      { x: 160, z: 510 },
      { x: 20, z: 480 },
      { x: -120, z: 390 },
      { x: -220, z: 260 },
      { x: -260, z: 130 },
      { x: -210, z: 20 },
      { x: -100, z: -5 }
    ]
  },
  {
    id: 'nh48',
    name: 'NH-48 EXPRESSWAY',
    shortName: 'NH-48',
    city: 'gurugram',
    cityName: 'Gurugram',
    tagline: 'High-speed straightaway corridors, broad toll plaza curves and expressway U-turns',
    lengthMeters: 1850,
    lapsDefault: 3,
    roadWidth: 20,
    difficulty: 'Easy',
    accentColor: '#FF9933',
    skyColors: {
      morning: ['#0369a1', '#bae6fd'],
      sunset: ['#7c2d12', '#fb923c'],
      night: ['#020617', '#1e293b']
    },
    landmarks: ['Sirhaul Toll Plaza', 'Cyber Hub Overpass', 'Hero Honda Flyover', 'Ambient Mall Gantry'],
    waypoints: [
      { x: 0, z: 0 },
      { x: 300, z: -15 },
      { x: 550, z: 40 },
      { x: 680, z: 160 },
      { x: 620, z: 310 },
      { x: 450, z: 380 },
      { x: 100, z: 400 },
      { x: -250, z: 380 },
      { x: -480, z: 320 },
      { x: -580, z: 180 },
      { x: -510, z: 40 },
      { x: -260, z: -10 }
    ]
  },
  {
    id: 'kartavya',
    name: 'KARTAVYA PATH & INDIA GATE',
    shortName: 'India Gate',
    city: 'delhi',
    cityName: 'Delhi',
    tagline: 'Down the ceremonial boulevard, round the India Gate hexagon and past North Block',
    lengthMeters: 1620,
    lapsDefault: 3,
    roadWidth: 18,
    difficulty: 'Medium',
    accentColor: '#10B981',
    skyColors: {
      morning: ['#065f46', '#a7f3d0'],
      sunset: ['#831843', '#f43f5e'],
      night: ['#022c22', '#064e3b']
    },
    landmarks: ['India Gate Monument', 'Rashtrapati Bhavan Colonnade', 'Ceremonial Lawns', 'Kartavya Hexagon'],
    waypoints: [
      { x: 0, z: 0 },
      { x: 180, z: -5 },
      { x: 340, z: 60 },
      { x: 420, z: 180 },
      { x: 400, z: 320 },
      { x: 310, z: 420 },
      { x: 160, z: 470 },
      { x: 0, z: 480 },
      { x: -160, z: 440 },
      { x: -300, z: 340 },
      { x: -380, z: 200 },
      { x: -350, z: 80 },
      { x: -180, z: 10 }
    ]
  },
  {
    id: 'redfort',
    name: 'LAL QILA CIRCUIT',
    shortName: 'Red Fort',
    city: 'delhi',
    cityName: 'Delhi',
    tagline: 'Old Delhi thrills past Chandni Chowk bazaars, Lahori Gate and historic red sandstone walls',
    lengthMeters: 1380,
    lapsDefault: 3,
    roadWidth: 15,
    difficulty: 'Hard',
    accentColor: '#DC2626',
    skyColors: {
      morning: ['#991b1b', '#fecaca'],
      sunset: ['#581c87', '#ea580c'],
      night: ['#180808', '#2b1010']
    },
    landmarks: ['Lahori Gate Ramparts', 'Chandni Chowk Chauraha', 'Old Delhi Metro Station', 'Historic Bazaar Canopies'],
    waypoints: [
      { x: 0, z: 0 },
      { x: 140, z: 40 },
      { x: 260, z: 140 },
      { x: 310, z: 260 },
      { x: 240, z: 380 },
      { x: 110, z: 440 },
      { x: -40, z: 450 },
      { x: -170, z: 410 },
      { x: -280, z: 320 },
      { x: -310, z: 200 },
      { x: -260, z: 90 },
      { x: -120, z: 15 }
    ]
  }
];
