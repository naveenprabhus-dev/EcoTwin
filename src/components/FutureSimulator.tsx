import React, { useState, useMemo } from 'react';
import { CarbonStats, TransType, DietType, ShopFreqType } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, Legend } from 'recharts';
import { 
  Zap, Footprints, Sandwich, ShoppingBag, Trash2, 
  Sparkles, HelpCircle, ArrowRight, Save, Compass, CheckCircle2 
} from 'lucide-react';
import { motion } from 'motion/react';

interface FutureSimulatorProps {
  stats: CarbonStats;
  companionName: string;
  onRefreshStats?: () => void;
}

export default function FutureSimulator({ stats, companionName }: FutureSimulatorProps) {
  // Simulator States
  const [transType, setTransType] = useState<TransType | 'cycling'>('public');
  const [transDist, setTransDist] = useState<number>(30); // km/week
  const [electricBill, setElectricBill] = useState<number>(2500); // INR/month
  const [diet, setDiet] = useState<DietType>('vegetarian');
  const [shopFreq, setShopFreq] = useState<ShopFreqType>('rarely');
  const [hasRecycle, setHasRecycle] = useState<boolean>(true);

  // Recalculates simulated carbon footprint
  const simulatedStats = useMemo(() => {
    // 1. Transportation
    let transFactor = 0;
    if (transType === 'cycling') {
      transFactor = 0;
    } else if (transType === 'walking') {
      transFactor = 0;
    } else if (transType === 'public') {
      transFactor = 0.05;
    } else if (transType === 'twowheeler') {
      transFactor = 0.12;
    } else if (transType === 'car') {
      transFactor = 0.20;
    } else if (transType === 'flight') {
      transFactor = 0.25;
    }
    const transportMonthly = Math.round(transDist * 4.3 * transFactor);

    // 2. Electricity
    const kwhRate = 0.114;
    const kgCo2PerKwh = 0.4;
    const electricityMonthly = Math.round(electricBill * kwhRate * kgCo2PerKwh);

    // 3. Diet
    let foodMonthly = 80;
    if (diet === 'eggetarian') foodMonthly = 120;
    if (diet === 'nonvegetarian') foodMonthly = 250;

    // 4. Shopping
    let shopFactor = 20;
    if (shopFreq === 'weekly') shopFactor = 80;
    if (shopFreq === 'daily') shopFactor = 200;
    const shoppingMonthly = shopFactor;

    // 5. Waste (Heuristics based on recycle habits)
    const wasteMonthly = hasRecycle ? 5 : 40;

    const totalMonthly = transportMonthly + electricityMonthly + foodMonthly + shoppingMonthly + wasteMonthly;
    const treesEquivalent = Math.round(totalMonthly / 1.83);

    let score = 100 - Math.min(100, Math.max(0, Math.round(((totalMonthly - 200) / 800) * 80)));
    if (score < 10) score = 10;

    return {
      score,
      breakdown: {
        transport: transportMonthly,
        electricity: electricityMonthly,
        food: foodMonthly,
        shopping: shoppingMonthly,
        waste: wasteMonthly,
        total: totalMonthly
      },
      treesEquivalent
    };
  }, [transType, transDist, electricBill, diet, shopFreq, hasRecycle]);

  // Math differences
  const carbonDiff = stats.breakdown.total - simulatedStats.breakdown.total;
  const carbonDiffPct = stats.breakdown.total > 0 
    ? Math.round((carbonDiff / stats.breakdown.total) * 100) 
    : 0;

  const chartData = [
    {
      name: 'Commuting',
      Current: stats.breakdown.transport,
      Simulated: simulatedStats.breakdown.transport,
    },
    {
      name: 'Power Grid',
      Current: stats.breakdown.electricity,
      Simulated: simulatedStats.breakdown.electricity,
    },
    {
      name: 'Grub/Diet',
      Current: stats.breakdown.food,
      Simulated: simulatedStats.breakdown.food,
    },
    {
      name: 'Lifestyle',
      Current: stats.breakdown.shopping,
      Simulated: simulatedStats.breakdown.shopping,
    },
    {
      name: 'Trash/Waste',
      Current: stats.breakdown.waste,
      Simulated: simulatedStats.breakdown.waste,
    },
    {
      name: 'Monthly Total',
      Current: stats.breakdown.total,
      Simulated: simulatedStats.breakdown.total,
    }
  ];

  return (
    <section 
      aria-label="Future Carbon Simulator Workspace"
      className="space-y-6"
    >
      <div className="bg-white rounded-[32px] p-6 md:p-8 border border-art-border shadow-xs">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-art-border pb-4 mb-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-art-olive bg-art-pale px-3 py-1 rounded-full">
              Interactive sandbox
            </span>
            <h2 className="text-3xl font-serif italic text-art-dark mt-2 font-bold mb-1">
              Future Carbon Simulator
            </h2>
            <p className="text-xs text-art-olive font-medium mt-0.5">
              Simulate high-impact behavioral swaps to predict the positive evolution of {companionName} and your carbon rating.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Simulator Controls */}
          <div className="lg:col-span-4 space-y-6 bg-art-cream/40 p-6 rounded-[24px] border border-art-border">
            <h3 className="text-sm font-semibold text-art-dark uppercase tracking-wider font-sans mb-3">
              Configure Scenario Parameters
            </h3>

            {/* Commuting Swap */}
            <div className="space-y-2">
              <label htmlFor="sim-transport-type" className="text-xs font-black text-art-dark block">
                🚌 Commuting Choice:
              </label>
              <select
                id="sim-transport-type"
                value={transType}
                onChange={(e) => setTransType(e.target.value as any)}
                className="w-full bg-white border border-art-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-art-sage/20 text-art-dark font-semibold h-[38px]"
              >
                <option value="car">🚗 Gasoline SUV / Private Car</option>
                <option value="public">🚌 Green Public Transit</option>
                <option value="cycling">🚲 Bicycle Commute</option>
                <option value="walking">🚶 Walking Only</option>
                <option value="twowheeler">🏍️ Motorbike / Scooter</option>
                <option value="flight">✈️ Regular Domestic Flights</option>
              </select>
            </div>

            {/* Weekly Distance Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="sim-transport-dist" className="font-black text-art-dark">
                  Weekly Distance Commuted:
                </label>
                <span className="font-mono font-bold text-art-olive">{transDist} km</span>
              </div>
              <input
                id="sim-transport-dist"
                type="range"
                min="0"
                max="250"
                value={transDist}
                onChange={(e) => setTransDist(Number(e.target.value))}
                className="w-full accent-art-olive cursor-pointer"
                aria-describedby="dist-description"
              />
              <span id="dist-description" className="sr-only">Slide to simulate commute miles in kilometers</span>
            </div>

            {/* Electricity Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="sim-electric-bill" className="font-black text-art-dark">
                  Monthly Power/Electric Bill:
                </label>
                <span className="font-mono font-bold text-art-olive">₹{electricBill} / mo</span>
              </div>
              <input
                id="sim-electric-bill"
                type="range"
                min="0"
                max="15000"
                step="100"
                value={electricBill}
                onChange={(e) => setElectricBill(Number(e.target.value))}
                className="w-full accent-art-olive cursor-pointer"
              />
            </div>

            {/* Diet Swaps */}
            <div className="space-y-2">
              <label htmlFor="sim-diet-type" className="text-xs font-black text-art-dark block">
                🥗 Dietary Lifestyle:
              </label>
              <select
                id="sim-diet-type"
                value={diet}
                onChange={(e) => setDiet(e.target.value as any)}
                className="w-full bg-white border border-art-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-art-sage/20 text-art-dark font-semibold h-[38px]"
              >
                <option value="vegetarian">🥗 Strict Plant-Based / Vegetarian</option>
                <option value="eggetarian">🍳 Eggetarian (Eggs and Dairy)</option>
                <option value="nonvegetarian">🥩 Red Meat Heavy (Non-Vegetarian)</option>
              </select>
            </div>

            {/* Shopping Habits */}
            <div className="space-y-2">
              <label htmlFor="sim-shop-freq" className="text-xs font-black text-art-dark block">
                🛍️ Lifestyle Buying Frequency:
              </label>
              <select
                id="sim-shop-freq"
                value={shopFreq}
                onChange={(e) => setShopFreq(e.target.value as any)}
                className="w-full bg-white border border-art-border rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-art-sage/20 text-art-dark font-semibold h-[38px]"
              >
                <option value="rarely">🌿 Conscious Minimalist (Rarely buy new items)</option>
                <option value="weekly">🛍️ Weekly Dispatches (Medium footprint)</option>
                <option value="daily">💎 High Consumerism (Daily packages)</option>
              </select>
            </div>

            {/* Waste Recycling Habit */}
            <div className="flex items-center justify-between p-3 bg-white border border-art-border rounded-xl">
              <div className="text-xs">
                <label htmlFor="sim-recycle" className="font-extrabold text-art-dark block cursor-pointer">Recycle & Segregate Waste</label>
                <span className="text-[10px] text-art-olive/80 font-medium">Averts methane landfill vectors</span>
              </div>
              <input
                id="sim-recycle"
                type="checkbox"
                checked={hasRecycle}
                onChange={(e) => setHasRecycle(e.target.checked)}
                className="w-5 h-5 accent-art-olive cursor-pointer"
              />
            </div>
          </div>

          {/* Right panel: Visualization & Companion Preview comparison */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Split Metrics Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-white border-2 border-art-dark rounded-[24px] p-5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-art-olive font-black">
                  Current Footprint
                </span>
                <div className="mt-2 text-2xl font-serif italic text-art-dark font-black">
                  {stats.breakdown.total} <span className="text-xs font-sans not-italic text-art-olive font-normal">kg CO₂/mo</span>
                </div>
                <div className="text-xs text-art-olive/90 mt-1 font-semibold">
                  Companion rating: <span className="font-bold text-art-dark">{stats.score}/100</span>
                </div>
              </div>

              <div className="bg-white border-2 border-emerald-700 rounded-[24px] p-5 relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-emerald-500/10 px-2 py-0.5 rounded text-[8px] font-mono font-bold text-emerald-800">
                  Forecast
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 font-bold">
                  Simulated Future
                </span>
                <div className="mt-2 text-2xl font-serif italic text-emerald-900 font-black">
                  {simulatedStats.breakdown.total} <span className="text-xs font-sans not-italic text-emerald-700/80 font-normal">kg CO₂/mo</span>
                </div>
                <div className="text-xs text-emerald-800 mt-1 font-bold">
                  Companion rating: <span className="font-sans font-black underline">{simulatedStats.score}/100</span>
                </div>
              </div>

              <div className={`rounded-[24px] p-5 border-2 flex flex-col justify-between ${
                carbonDiff >= 0 
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950' 
                  : 'bg-rose-50 border-rose-500 text-rose-950'
              }`}>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider font-black opacity-80">
                    Net Reduction Estimate
                  </span>
                  <div className="mt-2 text-2xl font-serif italic font-extrabold">
                    {carbonDiff >= 0 ? `+${Math.abs(carbonDiff)}` : `-${Math.abs(carbonDiff)}`} <span className="text-xs font-sans not-italic font-medium">kg/mo</span>
                  </div>
                </div>
                <div className="text-xs font-black mt-2">
                  {carbonDiff >= 0 
                    ? `🎉 Cuts footprint by ${Math.abs(carbonDiffPct)}%!` 
                    : `⚠️ Adds footprint by ${Math.abs(carbonDiffPct)}%.`
                  }
                </div>
              </div>

            </div>

            {/* Compare Companion States in Real Time */}
            <div className="bg-art-cream rounded-[24px] border-2 border-art-dark p-5 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              
              {/* Current Pet look */}
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border-1 border-art-border">
                <div className="w-16 h-16 rounded-full bg-art-pale/40 border border-art-border flex items-center justify-center text-3xl shrink-0 select-none">
                  {stats.score >= 80 ? '🦁' : stats.score >= 60 ? '🦖' : stats.score >= 40 ? '🦊' : '🦥'}
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase text-art-olive tracking-wider block">Current state</span>
                  <span className="font-serif italic font-bold text-art-dark text-sm block">{companionName}</span>
                  <span className="p-1 bg-art-cream rounded text-[10px] font-sans font-bold text-art-olive/90 block w-max mt-1">
                    {stats.score >= 80 ? 'Excellent' : stats.score >= 60 ? 'Healthy' : 'Stressed'}
                  </span>
                </div>
              </div>

              {/* Future Simulated Pet Look */}
              <div className="flex items-center gap-3 bg-emerald-50 p-3.5 rounded-xl border-2 border-emerald-500">
                <div className="w-16 h-16 rounded-full bg-white/80 border border-emerald-200 flex items-center justify-center text-3xl shrink-0 select-none">
                  {simulatedStats.score >= 80 ? '🦁' : simulatedStats.score >= 60 ? '🦖' : simulatedStats.score >= 40 ? '🦊' : '🦥'}
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase text-emerald-800 tracking-wider block">Predicted twin state</span>
                  <span className="font-serif italic font-bold text-emerald-950 text-sm block">{companionName} Evolves</span>
                  <span className="p-1 bg-emerald-100 rounded text-[10px] font-sans font-black text-emerald-800 block w-max mt-1 animate-pulse">
                    {simulatedStats.score >= 80 ? '🌟 Forest Guardian' : simulatedStats.score >= 60 ? '🌱 Healthy Buddy' : '🤒 Unhealthy'}
                  </span>
                </div>
              </div>

            </div>

            {/* Compare Chart */}
            <div className="bg-white border border-art-border rounded-[24px] p-5 h-[300px]">
              <h3 className="text-xs font-mono font-bold uppercase text-art-dark tracking-wider mb-4">
                Comparison breakdown (Current vs simulated)
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#344E41' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#344E41' }} />
                  <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Value']} />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Current" fill="#E2E8E0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Simulated" fill="#588157" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Explainable Insights on simulated change */}
            <div className="bg-art-pale/40 border border-art-border rounded-[24px] p-5 space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase text-art-dark tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-art-olive" /> Explainable Simulation Scenario Insights
              </h3>

              <div className="space-y-2 text-xs font-medium text-slate-700 leading-relaxed font-sans">
                {transType === 'cycling' && (
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Commute Shift Impact:</strong> By cycling instead of driving, you avoid approximately <strong>{stats.breakdown.transport} kg CO₂</strong> of vehicular emissions monthly, directly purifying {companionName}'s airspace.</span>
                  </p>
                )}
                {transType === 'public' && stats.breakdown.transport > simulatedStats.breakdown.transport && (
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Green Transit Impact:</strong> Switching to green public transit reduces local urban tailpipe loads, saving around <strong>{Math.round(stats.breakdown.transport - simulatedStats.breakdown.transport)} kg CO₂</strong> monthly over private gasoline SUV use.</span>
                  </p>
                )}
                {diet === 'vegetarian' && stats.breakdown.food > 100 && (
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Plant-Based Choice:</strong> Cutting agricultural cattle vectors reduces global land-use burden and nitrogen oxide outputs by up to <strong>{Math.round(stats.breakdown.food - 80)} kg CO₂</strong> monthly.</span>
                  </p>
                )}
                {simulatedStats.breakdown.electricity < stats.breakdown.electricity && (
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Vampire Power Shutdown:</strong> Trimming home power drawing lowers standby burdens at substation grids, saving up to <strong>{Math.round(stats.breakdown.electricity - simulatedStats.breakdown.electricity)} kg CO₂</strong>.</span>
                  </p>
                )}
                {shopFreq === 'rarely' && stats.breakdown.shopping > 50 && (
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Conscious Consumerism:</strong> Buying second-hand clothes or electronics blocks industrial extraction and packaging dispatches, avoiding <strong>{Math.round(stats.breakdown.shopping - 20)} kg CO₂</strong> of shipping.</span>
                  </p>
                )}
                {hasRecycle && stats.breakdown.waste > simulatedStats.breakdown.waste && (
                  <p className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Landfill Mitigation:</strong> Separating and composting biodegradable items blocks direct solid organic decomposition at open landfills, mitigating up to <strong>{Math.round(stats.breakdown.waste - simulatedStats.breakdown.waste)} kg CO₂</strong> of greenhouse impact.</span>
                  </p>
                )}
                {carbonDiff > 0 ? (
                  <p className="text-emerald-800 font-extrabold mt-3 pt-3 border-t border-art-border flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                    <span>By implementing this simulation scenario permanently, your annual emissions drop by approx. <strong>{Number((carbonDiff * 12 / 1000).toFixed(2))} tons of CO₂</strong> per year!</span>
                  </p>
                ) : (
                  <p className="text-rose-800 font-extrabold mt-3 pt-3 border-t border-art-border flex items-center gap-1.5 text-xs">
                    <span>This simulated scenario indicates higher emissions. Modify preferences to save {companionName} from toxic carbon smog.</span>
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
