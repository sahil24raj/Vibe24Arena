'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { VehicleConfig } from '../engine/types';
import { INITIAL_VEHICLES, UPGRADE_PRICES } from '../engine/constants';
import { VehicleModelBuilder } from '../engine/VehicleModelBuilder';
import { ArrowLeft, Check, Sparkles, Zap, Shield, RotateCcw, Wrench, Palette, Coins } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface AutoRushGarageProps {
  currentVehicle: VehicleConfig;
  onSelectVehicle: (veh: VehicleConfig) => void;
  onBack: () => void;
}

export const AutoRushGarage: React.FC<AutoRushGarageProps> = ({
  currentVehicle,
  onSelectVehicle,
  onBack
}) => {
  const { user, addCoins } = useAppStore();
  const coins = user.coins;
  const [vehicles, setVehicles] = useState<VehicleConfig[]>(INITIAL_VEHICLES);
  const [selectedVehId, setSelectedVehId] = useState(currentVehicle.id);
  const [activeTab, setActiveTab] = useState<'vehicles' | 'upgrades' | 'paint'>('vehicles');

  const selectedVehicle = vehicles.find(v => v.id === selectedVehId) || vehicles[0];

  // 3D Showroom Turntable
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const autoModelRef = useRef<THREE.Group | null>(null);

  // Initialize 3D Showroom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(3.8, 2.2, 4.5);
    camera.lookAt(0, 0.9, 0);

    // Showroom Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const spot = new THREE.SpotLight(0xffd700, 3.5, 20, Math.PI / 4, 0.4);
    spot.position.set(0, 6, 3);
    spot.target.position.set(0, 0.8, 0);
    scene.add(spot);
    scene.add(spot.target);

    const rimLight = new THREE.DirectionalLight(0x00d2ff, 1.8);
    rimLight.position.set(-5, 4, -4);
    scene.add(rimLight);

    // Showroom Turntable Floor
    const discGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.1, 32);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.8,
      roughness: 0.2
    });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.position.y = -0.05;
    scene.add(disc);

    // Glowing Neon Ring around turntable
    const ringGeo = new THREE.RingGeometry(2.35, 2.45, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xff9933, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.02;
    scene.add(ring);

    // Animation loop for 360 rotation
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      if (autoModelRef.current) {
        autoModelRef.current.rotation.y += 0.008;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
    };
  }, []);

  // Update 3D Auto Model when vehicle changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (autoModelRef.current) {
      scene.remove(autoModelRef.current);
    }

    const model = VehicleModelBuilder.buildAutoRickshaw(selectedVehicle);
    autoModelRef.current = model;
    scene.add(model);
  }, [selectedVehicle]);

  // Upgrade Handler
  const handleUpgrade = (type: 'topSpeed' | 'accel' | 'handling' | 'nitro') => {
    const currentLevel = selectedVehicle.upgrades[type];
    if (currentLevel >= 5) return;

    const price = UPGRADE_PRICES[type][currentLevel];
    if (coins < price) {
      alert(`Need ${price} coins for this upgrade! Win races to earn more.`);
      return;
    }

    // Deduct coins
    addCoins(-price);

    // Apply upgrade
    setVehicles(prev =>
      prev.map(v => {
        if (v.id === selectedVehicle.id) {
          const newLevel = v.upgrades[type] + 1;
          const statGrowth = type === 'topSpeed' ? 2.5 : (type === 'accel' ? 3.0 : 2.8);
          return {
            ...v,
            stats: {
              ...v.stats,
              [type]: (v.stats as unknown as Record<string, number>)[type] + statGrowth
            },
            upgrades: {
              ...v.upgrades,
              [type]: newLevel
            }
          };
        }
        return v;
      })
    );
  };

  // Color Swatch Changer
  const handleColorChange = (part: 'bodyColor' | 'roofColor' | 'trimColor', color: string) => {
    setVehicles(prev =>
      prev.map(v => {
        if (v.id === selectedVehicle.id) {
          return { ...v, [part]: color };
        }
        return v;
      })
    );
  };

  const COLOR_PALETTE = [
    '#1e8c4e', // CNG Green
    '#f6c62a', // Classic Auto Yellow
    '#1f1f26', // Kaali Peeli Black
    '#ff4f9a', // Rani Pink
    '#2463d6', // Electric Blue
    '#c8242b', // Raja Red
    '#6b2bff', // Cyber Purple
    '#ff7a1a', // Bengal Tiger Orange
    '#ffffff', // Pearl White
    '#3ee0ff'  // Cyan Neon
  ];

  return (
    <div className="absolute inset-0 z-40 bg-[#060B1E] flex flex-col p-4 sm:p-6 select-none overflow-hidden text-white">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white font-bold transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO MENU
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400 rounded-full text-amber-300 font-black text-sm">
            <Coins className="w-4 h-4 text-[#FFD700]" />
            {coins} COINS
          </div>
          <button
            onClick={() => onSelectVehicle(selectedVehicle)}
            className="flex items-center gap-1.5 px-5 py-1.5 bg-gradient-to-r from-[#FF9933] to-[#FFD700] hover:from-[#F97316] hover:to-[#F59E0B] text-black font-black rounded-xl text-sm shadow-lg transition-all"
          >
            <Check className="w-4 h-4" /> SELECT AUTO
          </button>
        </div>
      </div>

      {/* Main Garage Layout: Left 3D Canvas + Right Tuning Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 mt-3">
        {/* Left: 3D Auto Showroom Canvas */}
        <div className="lg:col-span-7 bg-[#0B1536]/80 border border-white/15 rounded-3xl relative overflow-hidden flex flex-col justify-between p-4 shadow-2xl">
          <canvas ref={canvasRef} className="w-full h-full block min-h-[260px]" />

          {/* Slogan & Number Plate Plaque Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-3">
            <div>
              <div className="text-xl font-black uppercase text-white flex items-center gap-2">
                {selectedVehicle.name}
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FFD700] text-black font-black">
                  {selectedVehicle.tier}
                </span>
              </div>
              <div className="text-xs text-amber-300 font-semibold">{selectedVehicle.tagline}</div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-black text-gray-300 bg-white/10 px-2 py-0.5 rounded">
                {selectedVehicle.numberPlate}
              </div>
              <div className="text-[11px] font-bold text-[#FF9933] mt-0.5">
                "{selectedVehicle.slogan}"
              </div>
            </div>
          </div>
        </div>

        {/* Right: Vehicle List, Upgrades & Paint Customizer */}
        <div className="lg:col-span-5 bg-[#0B1536]/90 border border-white/15 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
          {/* Tabs */}
          <div className="grid grid-cols-3 border-b border-white/10 text-xs font-black uppercase">
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`py-3 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'vehicles' ? 'bg-[#FF9933] text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> 8 AUTOS
            </button>
            <button
              onClick={() => setActiveTab('upgrades')}
              className={`py-3 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upgrades' ? 'bg-[#FF9933] text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" /> TUNING
            </button>
            <button
              onClick={() => setActiveTab('paint')}
              className={`py-3 flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'paint' ? 'bg-[#FF9933] text-black shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> PAINT
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4">
            {/* TAB 1: VEHICLE ROSTER */}
            {activeTab === 'vehicles' && (
              <div className="grid grid-cols-2 gap-2.5">
                {vehicles.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVehId(v.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      selectedVehId === v.id
                        ? 'bg-gradient-to-br from-[#FF9933]/25 to-[#FFD700]/15 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                        : 'bg-black/40 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-white truncate">{v.name}</span>
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: v.bodyColor }} />
                      </div>
                      <div className="text-[10px] text-gray-400 truncate">{v.tagline}</div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 text-[10px]">
                      <span className="font-mono text-cyan-300 font-bold">{v.stats.topSpeed} KM/H</span>
                      <span className="text-amber-400 font-black">{v.price === 0 ? 'FREE' : `₹${v.price}`}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* TAB 2: TUNING UPGRADES */}
            {activeTab === 'upgrades' && (
              <div className="space-y-3.5">
                {(['topSpeed', 'accel', 'handling', 'nitro'] as const).map(statKey => {
                  const level = selectedVehicle.upgrades[statKey];
                  const price = level < 5 ? UPGRADE_PRICES[statKey][level] : null;
                  const statValue = Math.round((selectedVehicle.stats as unknown as Record<string, number>)[statKey]);

                  return (
                    <div key={statKey} className="bg-black/40 border border-white/10 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black uppercase">
                        <span className="text-white flex items-center gap-1.5">
                          {statKey === 'topSpeed' && '🚀 TOP SPEED'}
                          {statKey === 'accel' && '⚡ ACCELERATION'}
                          {statKey === 'handling' && '🎯 HANDLING & DRIFT'}
                          {statKey === 'nitro' && '🔥 NITRO THRUST'}
                        </span>
                        <span className="text-cyan-300 font-mono">{statValue}</span>
                      </div>

                      {/* Upgrade Pips (5 Levels) */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1.5 flex-1">
                          {[1, 2, 3, 4, 5].map(lvl => (
                            <span
                              key={lvl}
                              className={`h-2 flex-1 rounded-full ${
                                lvl <= level ? 'bg-[#FFD700] shadow-[0_0_8px_#FFD700]' : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>

                        {level < 5 ? (
                          <button
                            onClick={() => handleUpgrade(statKey)}
                            disabled={coins < (price || 0)}
                            className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-all ${
                              coins >= (price || 0)
                                ? 'bg-gradient-to-r from-[#FF9933] to-[#FFD700] text-black hover:scale-105 active:scale-95'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <Coins className="w-3 h-3" />
                            {price}
                          </button>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-400 uppercase">MAX</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: PAINT CUSTOMIZER */}
            {activeTab === 'paint' && (
              <div className="space-y-4">
                {/* Body Color */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-gray-300 uppercase">1. BODY COLOR</div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => handleColorChange('bodyColor', c)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all transform hover:scale-110 ${
                          selectedVehicle.bodyColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Roof Color */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-gray-300 uppercase">2. CANOPY ROOF COLOR</div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => handleColorChange('roofColor', c)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all transform hover:scale-110 ${
                          selectedVehicle.roofColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                {/* Trim Color */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-gray-300 uppercase">3. CHROME & TRIM COLOR</div>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PALETTE.map(c => (
                      <button
                        key={c}
                        onClick={() => handleColorChange('trimColor', c)}
                        className={`w-7 h-7 rounded-xl border-2 transition-all transform hover:scale-110 ${
                          selectedVehicle.trimColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
