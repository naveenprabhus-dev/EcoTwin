import React, { useState } from 'react';
import { CompanionState, CarbonStats } from '../types';
import { 
  motion, AnimatePresence 
} from 'motion/react';
import { 
  User, Sparkles, Smile, RefreshCw, 
  Crown, ShieldAlert, BadgeCheck, Zap 
} from 'lucide-react';

interface ProfileAchievementsProps {
  userId: string;
  name: string;
  companion: CompanionState;
  stats: CarbonStats;
  onRefreshProfile: (updatedProfile?: any) => void;
}

export default function ProfileAchievements({ userId, name, companion, stats, onRefreshProfile }: ProfileAchievementsProps) {
  // Input fields state
  const [userName, setUserName] = useState(name);
  const [compName, setCompName] = useState(companion.name);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Forecast state
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<any | null>(null);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('/api/profile/details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: userName,
          companionName: compName
        })
      });
      const data = await response.json();
      if (data.success) {
        onRefreshProfile();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Failed to update name fields:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunForecast = async () => {
    setIsForecasting(true);
    setForecastResult(null);

    try {
      // Fetch Forecast Engine
      const response = await fetch('/api/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (data.success) {
        setForecastResult(data.forecast);
      }
    } catch (err) {
      console.error('Forecast engine failed:', err);
    } finally {
      setIsForecasting(false);
    }
  };

  const handleEquipAccessory = async (accName: string) => {
    try {
      const response = await fetch('/api/accessories/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accessory: accName })
      });
      const data = await response.json();
      if (data.success) {
        onRefreshProfile(data.profile);
      }
    } catch (err) {
      console.error('Equipping accessory failed:', err);
    }
  };

  // Immediate unlock trigger helper for demo playground joy
  const handleQuickUnlock = async (accName: string) => {
    try {
      const response = await fetch('/api/accessories/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accessory: accName })
      });
      const data = await response.json();
      if (data.success) {
        onRefreshProfile(data.profile);
      }
    } catch (err) {
      console.error('Unlocking failed:', err);
    }
  };

  // List of all accessories supported inside SVG canvas
  const ALL_ACCESSORIES = [
    { name: 'Cute Hat', type: 'garm', minLevel: 1, desc: 'Sporty baseball cap style' },
    { name: 'Tiny Sunglasses', type: 'glasses', minLevel: 2, desc: 'Cool dark circular shades' },
    { name: 'Flower Pot', type: 'decor', minLevel: 2, desc: 'Terracotta flower base' },
    { name: 'Background Woods', type: 'back', minLevel: 3, desc: 'Dense foliage backdrop' },
    { name: 'Monocles', type: 'glasses', minLevel: 4, desc: 'Vintage golden detective spectacle' },
    { name: 'Golden Cloak', type: 'garm', minLevel: 5, desc: 'Radiating thermal gold wrap' },
    { name: 'Eco Crown', type: 'garm', minLevel: 5, desc: 'Ultimate forest crown overlay' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* Left column Settings + Sandbox Access Dressing Game */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Settings Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
            <h3 className="text-lg font-display font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Account Settings
            </h3>

            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Your Full Name:</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Virtual Twin Name:</label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  className="w-full bg-white rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white hover:shadow-md text-xs font-semibold rounded-xl cursor-pointer transition-all"
                >
                  {isSaving ? 'Saving...' : 'Update Details'}
                </button>

                <AnimatePresence>
                  {saveSuccess && (
                    <motion.span 
                      initial={{ opacity: 0, x: -5 }} 
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-emerald-600 font-bold font-mono"
                    >
                      ✓ Saved successfully!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

            </form>
          </div>

          {/* Sandbox Dressing Room Grid selection */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Crown className="w-5 h-5 text-emerald-600" /> Companion Closet
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-normal">
                Unlock clothing accessories. Click on a product to dress or undress your living virtual companion!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[240px] overflow-y-auto p-1">
              {ALL_ACCESSORIES.map(acc => {
                const isUnlocked = companion.unlockedAccessories.includes(acc.name);
                const isEquipped = companion.equippedAccessories.includes(acc.name);
                
                return (
                  <div 
                    key={acc.name} 
                    className={`p-3 rounded-2xl border text-xs flex justify-between items-center transition-all ${
                      isEquipped 
                        ? 'border-emerald-500 bg-emerald-50/50' 
                        : isUnlocked 
                          ? 'border-slate-200 hover:border-slate-300 bg-white'
                          : 'border-slate-100 bg-slate-50 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800 block text-xs">{acc.name}</span>
                        <span className="text-[9px] text-gray-500 font-mono bg-slate-100 px-1 py-0.5 rounded leading-none">
                          Level {acc.minLevel}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-500 mt-0.5 block font-sans">{acc.desc}</span>
                    </div>

                    <div className="flex gap-2">
                      {isUnlocked ? (
                        <button
                          onClick={() => handleEquipAccessory(acc.name)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                            isEquipped 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {isEquipped ? 'Equipped' : 'Equip'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleQuickUnlock(acc.name)}
                          className="px-2.5 py-1 text-[9px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg cursor-pointer"
                        >
                          Unlock Sandbox Play
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>

          </div>

        </div>

        {/* Right column: ML Forecast Engine results panel */}
        <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                  🔮 Carbon Forecast Engine
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-normal">
                  Our machine-learning trajectory engine compiles your carbon habits to project next-year trend warnings and prevention targets.
                </p>
              </div>
            </div>

            <button
              onClick={handleRunForecast}
              disabled={isForecasting}
              className="mt-4 px-5 py-3 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
            >
              {isForecasting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Calculating ML Trend models...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-emerald-100" /> Run Forecast Prediction
                </>
              )}
            </button>
          </div>

          {/* Results Block */}
          <div className="flex-1 mt-6 flex flex-col justify-center min-h-[220px]">
            <AnimatePresence mode="wait">
              {!forecastResult && !isForecasting && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-6 text-slate-400"
                >
                  <Smile className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-semibold">Model Trajectory Idle</p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-0.5 leading-normal">
                    Click "Run Forecast Prediction" above to compute upcoming emission indexes under current household lifestyle guidelines.
                  </p>
                </motion.div>
              )}

              {isForecasting && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center p-6 text-slate-500 space-y-1"
                >
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-bold">Consolidating statistical metrics...</p>
                  <p className="text-[10px] text-slate-400">Querying regression algorithms aligned with world benchmarks...</p>
                </motion.div>
              )}

              {forecastResult && !isForecasting && (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Values row */}
                  <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="text-center border-r border-slate-200/50">
                      <span className="text-[9px] text-slate-500 block">Next Month</span>
                      <span className="text-xs font-bold text-slate-900 font-mono block mt-0.5">{forecastResult.nextMonthForecast}</span>
                    </div>
                    <div className="text-center border-r border-slate-200/50">
                      <span className="text-[9px] text-slate-500 block">Next Year</span>
                      <span className="text-xs font-bold text-slate-900 font-mono block mt-0.5">{forecastResult.nextYearForecast}</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[9px] text-slate-500 block">Growth Trend</span>
                      <span className={`text-xs font-bold font-mono block mt-0.5 ${
                        forecastResult.trendPercentage.startsWith('+') ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {forecastResult.trendPercentage}
                      </span>
                    </div>
                  </div>

                  {/* Warning Narrative */}
                  <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100/60 flex items-start gap-2 text-[11px] text-rose-900">
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <p className="leading-normal font-sans font-medium">
                      {forecastResult.narrative}
                    </p>
                  </div>

                  {/* ML suggestions list */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-bold block">Prevention Targets to mitigate growth:</span>
                    <div className="space-y-1 text-xs text-slate-700">
                      {forecastResult.preventionStrategies?.map((strat: string, s: number) => (
                        <p key={s} className="flex gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span className="font-sans font-medium">{strat}</span>
                        </p>
                      ))}
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
