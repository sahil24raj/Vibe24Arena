'use client';

import React, { useState } from 'react';
import { AIDifficulty, RaceSettings, TimeOfDay, WeatherType } from '../engine/types';
import { TRACKS_CATALOG } from '../engine/constants';
import { ArrowLeft, Play, Sun, Sunset, Moon, CloudRain, Flag, Gauge, ShieldAlert } from 'lucide-react';

interface AutoRushRaceSetupProps {
  onStartRace: (settings: RaceSettings) => void;
  onBack: () => void;
}

export const AutoRushRaceSetup: React.FC<AutoRushRaceSetupProps> = ({
  onStartRace,
  onBack
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState('cyber');
  const [laps, setLaps] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<AIDifficulty>('normal');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('sunset');
  const [weather, setWeather] = useState<WeatherType>('clear');

  const selectedTrack = TRACKS_CATALOG.find(t => t.id === selectedTrackId) || TRACKS_CATALOG[0];

  const handleLaunch = () => {
    onStartRace({
      trackId: selectedTrackId,
      laps,
      difficulty,
      timeOfDay,
      weather
    });
  };

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

        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#FF9933] via-[#FFD700] to-[#00D2FF]">
          RACE SETUP · रेस तैयारी
        </h2>

        <button
          onClick={handleLaunch}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] hover:from-emerald-400 hover:to-emerald-600 text-white font-black text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" /> START RACE (रेस शुरू करें)
        </button>
      </div>

      {/* Main Grid: Track Selection + Configuration Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 mt-3">
        {/* Left: 4 City Tracks Roster */}
        <div className="lg:col-span-7 bg-[#0B1536]/80 border border-white/15 rounded-3xl p-4 flex flex-col overflow-hidden shadow-2xl">
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
            1. SELECT CIRCUIT (ट्रैक चुनें)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto flex-1">
            {TRACKS_CATALOG.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTrackId(t.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  selectedTrackId === t.id
                    ? 'bg-gradient-to-br from-[#FF9933]/25 to-[#00D2FF]/20 border-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                    : 'bg-black/40 border-white/10 hover:border-white/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                      {t.cityName}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        t.difficulty === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : t.difficulty === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {t.difficulty}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white uppercase mt-2">{t.name}</h3>
                  <p className="text-xs text-gray-300 mt-1 line-clamp-2">{t.tagline}</p>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-2 mt-3 text-xs text-gray-400 font-mono">
                  <span>{t.lengthMeters} M</span>
                  <span className="text-amber-300 font-bold">{t.lapsDefault} LAPS</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Environment, Laps & Difficulty Settings */}
        <div className="lg:col-span-5 bg-[#0B1536]/90 border border-white/15 rounded-3xl p-5 flex flex-col justify-between shadow-2xl space-y-4 overflow-y-auto">
          {/* Laps Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-gray-300">
              <span className="flex items-center gap-1.5 text-white">
                <Flag className="w-4 h-4 text-[#FF9933]" /> NUMBER OF LAPS
              </span>
              <span className="text-cyan-300 font-mono">{laps} LAPS</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 5].map(l => (
                <button
                  key={l}
                  onClick={() => setLaps(l)}
                  className={`py-2.5 rounded-xl font-black text-xs transition-all border ${
                    laps === l
                      ? 'bg-[#FF9933] text-black border-[#FFD700] shadow-md'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  {l === 1 ? '1 LAP (SPRINT)' : `${l} LAPS`}
                </button>
              ))}
            </div>
          </div>

          {/* AI Difficulty */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase text-gray-300">
              <span className="flex items-center gap-1.5 text-white">
                <Gauge className="w-4 h-4 text-emerald-400" /> AI RIVAL DIFFICULTY
              </span>
              <span className="text-cyan-300 uppercase">{difficulty}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'normal', 'hard'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2.5 rounded-xl font-black text-xs uppercase transition-all border ${
                    difficulty === d
                      ? 'bg-gradient-to-r from-[#00D2FF] to-[#3B82F6] text-black border-cyan-300 shadow-md'
                      : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Time of Day */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-[#FFD700]" /> TIME OF DAY (समय)
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'morning', label: 'Morning', icon: Sun },
                { id: 'sunset', label: 'Sunset', icon: Sunset },
                { id: 'night', label: 'Night', icon: Moon }
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTimeOfDay(t.id as TimeOfDay)}
                    className={`py-2 rounded-xl font-black text-xs flex flex-col items-center gap-1 border transition-all ${
                      timeOfDay === t.id
                        ? 'bg-amber-500/20 text-[#FFD700] border-amber-400 shadow-md'
                        : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weather */}
          <div className="space-y-2">
            <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-blue-400" /> WEATHER (मौसम)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'clear', label: 'Clear Sky (साफ धूप)', icon: Sun },
                { id: 'rain', label: 'Monsoon Rain (बारिश)', icon: CloudRain }
              ].map(w => {
                const Icon = w.icon;
                return (
                  <button
                    key={w.id}
                    onClick={() => setWeather(w.id as WeatherType)}
                    className={`py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition-all ${
                      weather === w.id
                        ? 'bg-blue-600/25 text-cyan-300 border-cyan-400 shadow-md'
                        : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{w.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Launch Button */}
          <button
            onClick={handleLaunch}
            className="w-full py-3.5 bg-gradient-to-r from-[#FF9933] via-[#FFD700] to-[#10B981] hover:opacity-95 text-black font-black text-base rounded-2xl shadow-xl transition-all transform hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-black" /> CHALO! ENTER RACE
          </button>
        </div>
      </div>
    </div>
  );
};
