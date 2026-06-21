import React, { useState } from 'react';
import { CarbonStats, LoggedEntry } from '../types';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend 
} from 'recharts';
import { 
  Trees, Flame, Sparkles, Filter, 
  ArrowDownLeft, ArrowUpRight, Footprints, 
  Zap, ShoppingBag, Trash2, Sandwich, PlusCircle,
  UploadCloud, Loader2, Cpu
} from 'lucide-react';
import { motion } from 'motion/react';
import { CarbonEngine } from '../services/CarbonEngine';

interface DashboardProps {
  stats: CarbonStats;
  logs: LoggedEntry[];
  onAddCustomEntry: (category: any, activity: string, co2: number, xp: number) => void;
}

export default function Dashboard({ stats, logs, onAddCustomEntry }: DashboardProps) {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddLog, setShowAddLog] = useState(false);
  
  // Custom Log Form State
  const [customAct, setCustomAct] = useState('');
  const [customCat, setCustomCat] = useState<'transport' | 'energy' | 'food' | 'shopping' | 'waste'>('transport');
  const [customCo2, setCustomCo2] = useState('3.5');
  const [customXp, setCustomXp] = useState('25');

  // AI Prediction & Upload States
  const [isAddedEmission, setIsAddedEmission] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictedExplanation, setPredictedExplanation] = useState<string | null>(null);
  const [attachedImageBase64, setAttachedImageBase64] = useState<string | null>(null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);

  // Chart Formatting Data
  const pieData = [
    { name: 'Transport', value: stats.breakdown.transport, color: '#10b981', icon: Footprints },
    { name: 'Energy', value: stats.breakdown.electricity, color: '#f59e0b', icon: Zap },
    { name: 'Food', value: stats.breakdown.food, color: '#ef4444', icon: Sandwich },
    { name: 'Shopping', value: stats.breakdown.shopping, color: '#3b82f6', icon: ShoppingBag },
    { name: 'Waste', value: stats.breakdown.waste, color: '#8b5cf6', icon: Trash2 },
  ].filter(d => d.value > 0);

  // Simple hardcoded historical monthly comparison for trend analysis
  const trendData = [
    { month: 'Feb', emissions: Math.round(stats.breakdown.total * 1.15) },
    { month: 'Mar', emissions: Math.round(stats.breakdown.total * 1.1) },
    { month: 'Apr', emissions: Math.round(stats.breakdown.total * 1.05) },
    { month: 'May', emissions: Math.round(stats.breakdown.total * 0.95) },
    { month: 'Jun (Current)', emissions: stats.breakdown.total }
  ];

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAct.trim()) return;
    
    const co2Val = Number(customCo2);
    // If emissions are added, it's a positive addition. If saved, it's a negative difference.
    const finalCo2 = isAddedEmission ? Math.abs(co2Val) : -Math.abs(co2Val);
    
    onAddCustomEntry(
      customCat,
      customAct,
      finalCo2,
      Math.max(1, Number(customXp))
    );
    
    // Clear state
    setCustomAct('');
    setCustomCo2('3.5');
    setCustomXp('25');
    setIsAddedEmission(false);
    setPredictedExplanation(null);
    setAttachedImageBase64(null);
    setAttachedFileName(null);
    setShowAddLog(false);
  };

  const handlePredictWithAi = async () => {
    if (!customAct.trim() && !attachedImageBase64) {
      alert("Please enter some custom activity text OR upload/attach a photo so our AI model can predict carbon weight and XP decisions!");
      return;
    }
    
    setIsPredicting(true);
    setPredictedExplanation(null);
    
    try {
      const response = await fetch('/api/entries/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: customAct,
          imageBase64: attachedImageBase64 || undefined
        })
      });
      const data = await response.json();
      if (data.success && data.prediction) {
        const pred = data.prediction;
        setCustomAct(pred.activity);
        setCustomCat(pred.category);
        setCustomCo2(Math.abs(pred.co2Difference).toFixed(1));
        setCustomXp(pred.xpReward.toString());
        setIsAddedEmission(pred.isAddition);
        setPredictedExplanation(pred.explanation);
      } else {
        throw new Error('Fallback target');
      }
    } catch (err) {
      console.warn("Using offline carbon calculation heuristics:", err);
      // Fallback prediction via services
      const pred = CarbonEngine.estimateLogImpact(customAct, !!attachedImageBase64);
      setCustomAct(pred.activity);
      setCustomCat(pred.category);
      setCustomCo2(Math.abs(pred.co2Difference).toFixed(1));
      setCustomXp(pred.xpReward.toString());
      setIsAddedEmission(pred.isAddition);
      setPredictedExplanation(pred.explanation + " (Offline Heuristics Engine)");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleAttachedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAttachedFileName(file.name);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAttachedImageBase64(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredLogs = filterCategory === 'all' 
    ? logs 
    : logs.filter(log => log.category === filterCategory);

  return (
    <div className="space-y-6">
      
      {/* Top Banner metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Core sustainability score gauge */}
        <div className="bg-art-forest text-white rounded-[32px] p-6 border border-art-dark shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-[-10px] bottom-[-10px] text-art-sage/10 pointer-events-none">
            <Sparkles className="w-32 h-32" />
          </div>
          <div>
            <span className="text-[10px] font-mono tracking-widest text-art-sage font-bold uppercase">Eco Health Rating</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-5xl font-serif italic font-extrabold text-art-cream">{stats.score}</span>
              <span className="text-xl text-art-stone">/100</span>
            </div>
            <p className="text-xs text-art-stone mt-2 font-medium">
              {stats.score >= 80 ? 'Outstanding! Keeping our community green!' : 
               stats.score >= 60 ? 'Healthy baseline. Minor upgrades needed.' : 
               stats.score >= 40 ? 'Moderate footprint. Start challenges soon!' : 
               'High impact. Critical actions demanded.'}
            </p>
          </div>
          <div className="w-full bg-art-dark h-1.5 rounded-full overflow-hidden mt-6">
            <div className="bg-art-sage h-full rounded-full" style={{ width: `${stats.score}%` }} />
          </div>
        </div>

        {/* Tree equivalents needed */}
        <div className="bg-white rounded-[32px] p-6 border border-art-border shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-widest text-art-olive font-bold uppercase">Offsite Trees Offset</span>
            <h3 className="text-4xl font-serif italic font-bold text-art-dark mt-1">{stats.treesEquivalent}</h3>
            <span className="text-xs text-art-olive/90 block mt-1 font-medium leading-relaxed">Trees needed to fully absorb your monthly greenhouse outputs.</span>
          </div>
          <div className="p-4 bg-art-pale rounded-2xl text-art-dark">
            <Trees className="w-8 h-8 fill-art-sage/20 animate-pulse" />
          </div>
        </div>

        {/* Carbon saved this month */}
        <div className="bg-white rounded-[32px] p-6 border border-art-border shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-widest text-art-olive font-bold uppercase">CO₂ Offset Savings</span>
            <h3 className="text-4xl font-serif italic font-bold text-art-olive mt-1">{stats.carbonSavedThisMonth} <span className="text-sm font-sans font-normal text-art-olive/75">kg</span></h3>
            <span className="text-xs text-art-olive/90 block mt-1 font-medium leading-relaxed">Emissions avoided through your real-world logged activities.</span>
          </div>
          <div className="p-4 bg-art-pale rounded-2xl text-art-olive">
            <Sparkles className="w-8 h-8 fill-art-sage/10" />
          </div>
        </div>

        {/* Net Monthly output */}
        <div className="bg-white rounded-[32px] p-6 border border-art-border shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono tracking-widest text-art-olive font-bold uppercase">Monthly Net CO₂</span>
            <h3 className="text-4xl font-serif italic font-bold text-rose-800 mt-1">{stats.breakdown.total} <span className="text-sm font-sans font-normal text-art-olive/75">kg</span></h3>
            <span className="text-xs text-art-olive/90 block mt-1 font-medium leading-relaxed">Your total net emissions estimate (World avg is ~380kg/mo).</span>
          </div>
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-800">
            <Flame className="w-8 h-8 fill-rose-100" />
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Emissions Breakdown sector diagram */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-6 border border-art-border shadow-xs">
          <h3 className="text-xl font-serif italic font-bold text-art-dark mb-4 flex items-center gap-2">
            🌿 Monthly Carbon Breakdown <span className="text-xs font-mono text-art-olive bg-art-pale px-2.5 py-1 rounded-full font-bold">Active Vectors (kg CO₂ / month)</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Recharts Pie component */}
            <div className="md:col-span-7 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Emissions']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend details */}
            <div className="md:col-span-5 space-y-2.5">
              {pieData.map(item => {
                const percent = Math.round((item.value / stats.breakdown.total) * 100) || 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-sm bg-art-cream hover:bg-art-pale/40 transition-all p-2.5 rounded-xl border border-art-border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-art-dark text-xs">{item.name}</span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-art-dark font-black">{item.value} kg</span>
                      <span className="text-art-olive/80 ml-1 font-semibold">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* Right: Trend chart analysis */}
        <div className="lg:col-span-5 bg-white rounded-[32px] p-6 border border-art-border shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-serif italic font-bold text-art-dark mb-1">
              📈 Historical Trend Analysis
            </h3>
            <p className="text-xs text-art-olive font-medium mb-4">Visualizing emission outputs compared with historical months.</p>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#344E41' }} />
                <YAxis tick={{ fontSize: 10, fill: '#344E41' }} />
                <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Total Emissions']} />
                <Bar dataKey="emissions" fill="#DAD7CD" radius={[10, 10, 0, 0]}>
                  {trendData.map((entry, index) => (
                    <Cell 
                      key={`bcell-${index}`} 
                      fill={index === trendData.length - 1 ? '#588157' : '#E2E8E0'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Low list row: Logged sustainable actions */}
      <div className="bg-white rounded-[32px] p-6 border border-art-border shadow-xs">
        
        {/* Header line control panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-serif italic font-bold text-art-dark">
              🌱 Eco Action Log Book
            </h3>
            <p className="text-xs text-art-olive font-medium mt-0.5">Log actions or see daily completions to offset carbon and feed Sprout.</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick adding buttons */}
            <button
              onClick={() => setShowAddLog(!showAddLog)}
              className="px-4 py-2.5 text-xs font-bold bg-art-dark hover:bg-art-forest text-white rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-art-sage" /> Log Custom Action
            </button>

            {/* Filter Toggle triggers */}
            <div className="flex items-center gap-1 bg-art-cream p-1 rounded-xl text-art-dark border border-art-border">
              {[
                { id: 'all', label: 'All' },
                { id: 'transport', label: 'Commuting' },
                { id: 'energy', label: 'Power/AC' },
                { id: 'food', label: 'Grub/Diet' },
                { id: 'shopping', label: 'Shopping' },
                { id: 'waste', label: 'Waste' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFilterCategory(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    filterCategory === opt.id 
                      ? 'bg-white shadow-xs text-art-dark' 
                      : 'hover:bg-white/40 text-art-olive'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom log adding modal block */}
        {showAddLog && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 rounded-[28px] bg-art-cream border-2 border-art-dark shadow-sm space-y-4"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-art-border">
              <div>
                <h4 className="text-sm font-serif italic font-bold text-art-dark flex items-center gap-1.5">
                  <Cpu className="text-art-olive w-4 h-4" /> AI-Powered Intelligent Carbon Log
                </h4>
                <p className="text-[10px] text-art-olive font-medium">Type any activity or attach a picture, then let Gemini determine the precise CO₂ and XP metrics!</p>
              </div>

              {/* Upload element */}
              <div className="flex items-center gap-2">
                <input 
                  type="file"
                  id="dashboard-file-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAttachedFileUpload}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('dashboard-file-upload')?.click()}
                  className="bg-white hover:bg-art-stone text-art-dark border border-art-border text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-art-olive" />
                  {attachedFileName ? `📎 ${attachedFileName}` : "Attach Action Photo/Slip"}
                </button>
                {attachedImageBase64 && (
                  <button 
                    type="button"
                    onClick={() => { setAttachedImageBase64(null); setAttachedFileName(null); }}
                    className="text-xs text-rose-700 hover:underline font-black cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleCreateLog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Description Input */}
                <div className="md:col-span-8 space-y-1.5">
                  <label className="text-xs font-bold text-art-dark flex items-center justify-between">
                    <span>Describe your activity:</span>
                    <span className="text-[10px] font-normal text-art-olive">AI works best with details like distances, meals, or devices</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Drove 15km in my old petrol car / Composted leftover vegan salads..."
                      value={customAct}
                      onChange={(e) => setCustomAct(e.target.value)}
                      className="w-full bg-white rounded-xl border border-art-border pl-3.5 pr-28 py-2.5 hover:border-art-sage focus:border-art-dark focus:outline-none text-xs text-art-dark"
                      required
                    />
                    <button
                      type="button"
                      onClick={handlePredictWithAi}
                      disabled={isPredicting}
                      className="absolute right-1.5 top-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg px-3 py-1 text-[10px] flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                    >
                      {isPredicting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Predicting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 animate-pulse" />
                          AI Predict
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Category Selector */}
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-xs font-bold text-art-dark">Sector/Category:</label>
                  <select
                    value={customCat}
                    onChange={(e) => setCustomCat(e.target.value as any)}
                    className="w-full bg-white rounded-xl border border-art-border px-3 py-2 text-xs focus:outline-none text-art-dark font-semibold h-[38px]"
                  >
                    <option value="transport">Transportation</option>
                    <option value="energy">Energy & Power</option>
                    <option value="food">Diet & Food</option>
                    <option value="shopping">Eco Shopping</option>
                    <option value="waste">Waste Management</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Carbon Type Toggles & numeric adjustment keys */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white/70 p-4 rounded-2xl border border-art-border">
                {/* 1. Saved vs Added Carbon Emission Select Cards */}
                <div className="md:col-span-6 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-art-olive uppercase tracking-wide block">Carbon Emission Impact Intent</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddedEmission(false)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        !isAddedEmission
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-white border-art-border text-art-olive hover:bg-art-stone/20'
                      }`}
                    >
                      <span className="text-base">🟢 Avoided / Saved</span>
                      <span className="text-[9px] font-semibold text-emerald-600/80">Rewards Sprout with XP</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setIsAddedEmission(true)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                        isAddedEmission
                          ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                          : 'bg-white border-art-border text-art-olive hover:bg-art-stone/20'
                      }`}
                    >
                      <span className="text-base">🔴 Added Emissions</span>
                      <span className="text-[9px] font-semibold text-rose-500/80">Deducts Companion XP</span>
                    </button>
                  </div>
                </div>

                {/* 2. Co2 Weight */}
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-art-dark">CO₂ Impact (kg of carbon):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={customCo2}
                    onChange={(e) => setCustomCo2(e.target.value)}
                    className="w-full bg-white rounded-xl border border-art-border px-3 py-2 text-xs font-mono text-art-dark focus:outline-none font-bold"
                  />
                </div>

                {/* 3. XP rewards or deductions (Calculated dynamically by ML model) */}
                <div className="md:col-span-3 space-y-1.5 border-l border-art-border pl-0 md:pl-4 flex flex-col justify-center">
                  <label className="text-[10px] font-bold text-art-dark uppercase tracking-wide block">XP Impact (by AI Model):</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-extrabold px-3 py-1.5 rounded-xl border-2 border-art-dark shadow-sm flex items-center gap-1 shrink-0 ${
                      isAddedEmission ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {isAddedEmission ? '-' : '+'}{customXp} XP
                    </span>
                    <span className="text-[9px] text-art-olive font-semibold leading-tight">calculated based on action</span>
                  </div>
                </div>
              </div>

              {/* Explanatory Narrative predictions */}
              {predictedExplanation && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-200 text-[11px] text-emerald-900 rounded-xl leading-relaxed flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold">Gemini AI Estimation Narrative:</span>
                    <p className="font-semibold">{predictedExplanation}</p>
                  </div>
                </div>
              )}

              {/* Actions boxes */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLog(false)}
                  className="bg-art-stone/60 hover:bg-art-stone text-art-dark text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-art-dark hover:bg-art-forest text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  Save Log {isAddedEmission ? '📉 (Deduct XP)' : '📈 (Add XP)'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Logs Listing */}
        <div className="overflow-hidden border border-art-border rounded-2xl">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center bg-art-cream text-art-olive">
              <Filter className="w-10 h-10 mx-auto text-art-sage mb-2" />
              <p className="text-xs font-bold">No action records found for this category.</p>
              <button 
                onClick={() => setFilterCategory('all')} 
                className="text-xs text-art-dark font-black hover:underline mt-1 cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          ) : (
            <div className="divide-y divide-art-border bg-white">
              {filteredLogs.map(log => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-art-pale/20 transition-all">
                  
                  {/* Left elements: category icon + details */}
                  <div className="flex items-center gap-3.5">
                    <span className="text-xl">
                      {log.category === 'transport' && '🚲'}
                      {log.category === 'energy' && '🔌'}
                      {log.category === 'food' && '🥗'}
                      {log.category === 'shopping' && '👜'}
                      {log.category === 'waste' && '♻️'}
                      {log.category === 'general' && '⭐'}
                    </span>
                    <div>
                      <span className="font-bold text-art-dark text-sm block leading-snug">{log.activity}</span>
                      <span className="text-[10px] text-art-olive/80 font-mono block mt-0.5 font-bold uppercase tracking-wide">{log.date} • {log.category}</span>
                    </div>
                  </div>

                  {/* Right metrics: CO2 reduction + XP points */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-bold font-mono rounded-full px-2.5 py-0.5 ${
                        log.co2Difference <= 0 
                          ? 'bg-art-pale text-art-dark border border-art-border' 
                          : 'bg-rose-50 text-rose-800 border border-rose-100'
                      }`}>
                        {log.co2Difference <= 0 ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3" /> 
                            {Math.abs(log.co2Difference)} kg CO₂ Saved
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3" />
                            +{log.co2Difference} kg CO₂ Added
                          </>
                        )}
                      </span>
                    </div>

                    <div className="bg-amber-50 text-amber-900 border border-amber-200 font-mono text-xs font-bold px-2 py-1 rounded-lg">
                      +{log.xpReward} XP
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
