import React from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, AlertCircle, Bird, Heart, Trees, CloudRain,
  Flame, Cloud, Sun, Droplets, Leaf, Shield
} from 'lucide-react';

interface PlanetPulseEcosystemViewProps {
  score: number;
}

export default function PlanetPulseEcosystemView({ score }: PlanetPulseEcosystemViewProps) {
  // Determine active state index based on the 4 ecosystem thresholds
  // 1. Crisis: score < 40
  // 2. Recovery: score 40-59
  // 3. Thriving: score 60-79
  // 4. Planet Guardian: score >= 80
  let stateIndex = 1;
  let stateTitle = "Crisis";
  let stateColor = "text-rose-600 bg-rose-50 border-rose-200";
  let stateDesc = "High atmospheric greenhouse gases, dead forestry, and dusty smog haze.";

  if (score >= 80) {
    stateIndex = 4;
    stateTitle = "Planet Guardian";
    stateColor = "text-emerald-700 bg-emerald-50 border-emerald-300";
    stateDesc = "Fully restored planetary ecosystem, rich wildlife, lush forests, and crystal clean skies.";
  } else if (score >= 60) {
    stateIndex = 3;
    stateTitle = "Thriving";
    stateColor = "text-teal-700 bg-teal-50 border-teal-200";
    stateDesc = "Healthy forest cover, flowing water bodies, active birds, and flourishing biological life.";
  } else if (score >= 40) {
    stateIndex = 2;
    stateTitle = "Recovery";
    stateColor = "text-amber-700 bg-amber-50 border-amber-200";
    stateDesc = "Greying smog dissipating, initial green sprouts emerging, and healing atmosphere.";
  }

  // Generate interactive wildlife coordinate points
  const wildlife = [
    { id: 1, type: 'bird', icon: '🐦', x: '15%', y: '25%', delay: 0 },
    { id: 2, type: 'butterfly', icon: '🦋', x: '75%', y: '65%', delay: 0.5 },
    { id: 3, type: 'flower', icon: '🌸', x: '35%', y: '75%', delay: 0.2 },
    { id: 4, type: 'deer', icon: '🦌', x: '55%', y: '70%', delay: 0.8 },
  ];

  return (
    <div className="bg-white rounded-[32px] p-6 border-2 border-art-dark shadow-md space-y-5">
      <div className="flex justify-between items-center pb-3 border-b-2 border-slate-100">
        <div>
          <h4 className="font-serif italic font-extrabold text-art-dark text-sm flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" /> Planet Pulse Ecosystem
          </h4>
          <p className="text-[10px] text-art-olive leading-normal font-semibold">
            Sprout's environment evolves dynamically with your daily sustainability carbon rating.
          </p>
        </div>
        
        <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border ${stateColor}`}>
          Level {stateIndex}: {stateTitle}
        </span>
      </div>

      {/* Stylized Digital Earth SVG Canvas */}
      <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
        
        {/* Dynamic Atmosphere Sky Backdrop based on status */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          stateIndex === 1 ? 'bg-radial from-slate-800 to-zinc-950' :
          stateIndex === 2 ? 'bg-radial from-slate-700 via-sky-950 to-zinc-950' :
          stateIndex === 3 ? 'bg-radial from-sky-905 via-emerald-950/20 to-zinc-950' :
          'bg-radial from-sky-800 via-[#111e15] to-[#040805]'
        }`} />

        {/* Outer Halo Rings representing the Ozone Layer */}
        <motion.div 
          className={`absolute rounded-full border transition-all duration-1000 ${
            stateIndex === 1 ? 'h-52 w-52 border-stone-800/40 opacity-20' :
            stateIndex === 2 ? 'h-52 w-52 border-sky-600/30 opacity-40 animate-pulse' :
            stateIndex === 3 ? 'h-56 w-56 border-emerald-500/30 opacity-60 animate-pulse' :
            'h-60 w-60 border-emerald-400/50 opacity-80 animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.3)]'
          }`}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        />

        {/* 🌎 The Planetary Sphere with dynamic terrain layers */}
        <div className="relative h-44 w-44 rounded-full overflow-hidden border border-slate-700/50 shadow-2xl flex items-center justify-center">
          
          {/* Base Sphere Fill */}
          <div className={`absolute inset-0 transition-all duration-1000 ${
            stateIndex === 1 ? 'bg-stone-850' :
            stateIndex === 2 ? 'bg-[#273a30]' :
            stateIndex === 3 ? 'bg-[#183a24]' :
            'bg-[#0c2415]'
          }`} />

          {/* Liquid Ocean & Rivers Layer */}
          <motion.div 
            className={`absolute top-1/2 left-1/4 rounded-full transition-all duration-1000 ${
              stateIndex === 1 ? 'h-16 w-24 bg-stone-900 opacity-80' :
              stateIndex === 2 ? 'h-20 w-28 bg-[#1a2d3d] opacity-90' :
              stateIndex === 3 ? 'h-24 w-32 bg-sky-950/80 blur-xs' :
              'h-28 w-36 bg-cyan-900Shadow opacity-80'
            }`}
            animate={{ x: [0, 8, 0], y: [0, -5, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Continents & Forest foliage vectors */}
          <div className="absolute inset-0 p-4 grid grid-cols-3 gap-2 opacity-70">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div
                key={i}
                className={`rounded-full transition-all duration-1000 ${
                  stateIndex === 1 ? 'bg-stone-700 border-stone-800' :
                  stateIndex === 2 ? 'bg-[#3b593f] border-[#293d2b]' :
                  stateIndex === 3 ? 'bg-[#2e6e3d] border-[#1f4a29]' :
                  'bg-[#1f8c42] border-[#104d22]'
                } border`}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 6, delay: i * 0.5, repeat: Infinity }}
              />
            ))}
          </div>

          {/* CRISIS: Toxic Pollution gas rings */}
          {stateIndex === 1 && (
            <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center">
              <motion.div 
                animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-full text-center text-[10px] font-mono font-bold text-rose-400 p-2"
              >
                ☣️ OUTBREAK REGIME
              </motion.div>
            </div>
          )}

          {/* RECOVERY: Cloud and sun beams healing overlay */}
          {stateIndex === 2 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Sun className="w-10 h-10 text-amber-500/35 animate-spin" style={{ animationDuration: '40s' }} />
            </div>
          )}

          {/* THRIVING / GUARDIAN: Interactive Flying animals */}
          {stateIndex >= 3 && (
            <div className="absolute inset-0">
              {wildlife.map(animal => {
                if (stateIndex === 3 && (animal.type === 'deer' || animal.type === 'flower')) return null;
                return (
                  <motion.div
                    key={animal.id}
                    className="absolute text-sm select-none"
                    style={{ left: animal.x, top: animal.y }}
                    animate={{ y: [0, -4, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, delay: animal.delay, repeat: Infinity }}
                  >
                    {animal.icon}
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

        {/* Atmospheric Floating Elements on Sky layer */}
        <div className="absolute inset-0 pointer-events-none">
          {stateIndex === 1 && (
            <div className="absolute top-4 right-10 flex gap-2">
              <Cloud className="w-6 h-6 text-zinc-700 opacity-60 animate-bounce" />
              <Cloud className="w-8 h-8 text-stone-600 opacity-80" />
            </div>
          )}

          {stateIndex >= 3 && (
            <div className="absolute top-8 left-12">
              <Bird className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
          )}
        </div>

      </div>

      {/* Interactive explanations of the active state variables */}
      <div className="bg-[#F9FAF8] border border-art-border rounded-2xl p-4 space-y-2">
        <div className="flex gap-2 items-center text-xs font-serif italic text-art-dark font-extrabold">
          <span>{stateIndex === 1 ? '⚠️' : '🎉'}</span>
          <span>Ecosystem Context: {stateTitle}</span>
        </div>
        <p className="text-[11px] text-art-text leading-relaxed font-semibold">
          {stateDesc} Currently, the regional Carbon Index is <span className="font-bold underline">{score} points</span>. Complete daily tasks or logging habits pushes the Earth into Thriving and Planet Guardian.
        </p>
      </div>

      {/* Progress Scale Tracker */}
      <div className="space-y-1">
        <div className="flex justify-between font-mono text-[9px] text-slate-450 font-bold uppercase">
          <span>Ecosystem Rating Journey</span>
          <span>{score} / 100 Score</span>
        </div>
        
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-2D text-xs">
          <motion.div 
            className={`h-full rounded-full transition-colors duration-1000 ${
              stateIndex === 1 ? 'bg-rose-500' :
              stateIndex === 2 ? 'bg-amber-500' :
              stateIndex === 3 ? 'bg-teal-500' :
              'bg-emerald-500'
            }`}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.2 }}
          />
        </div>
      </div>
    </div>
  );
}
