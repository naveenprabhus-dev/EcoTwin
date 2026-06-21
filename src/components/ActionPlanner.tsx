import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  Calendar, CheckCircle, Circle, RotateCcw, Sparkles, 
  TrendingDown, Info, ChevronRight, Award, Trophy,
  Footprints, Zap, Sandwich, ShoppingBag, Trash2, HelpCircle
} from 'lucide-react';
import { UserProfile, ActionPlan, ActionPlanTask } from '../types';
import { EcoBuddyService } from '../services/ecoBuddyService';
import { CarbonEngine } from '../services/CarbonEngine';

interface ActionPlannerProps {
  userId: string;
  onRefreshProfile?: () => void;
}

/**
 * @component ActionPlanner
 * @description Renders a comprehensive, interactive 7-day carbon reduction program.
 * Empowers users to complete tactical eco-habits daily and simulate their cumulative 
 * long-term annual carbon reduction.
 * 
 * @param {ActionPlannerProps} props Component props
 * @param {string} props.userId Active user unique identifier
 * @param {() => void} [props.onRefreshProfile] Optional callback to sync stats across other tabs
 */
export default function ActionPlanner({ userId, onRefreshProfile }: ActionPlannerProps) {
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAdapting, setIsAdapting] = useState<boolean>(false);
  const [sliderCompliance, setSliderCompliance] = useState<number>(85); // Default 85% compliance rate
  const [reflectionText, setReflectionText] = useState<string | null>(null);
  const [isReflecting, setIsReflecting] = useState<boolean>(false);
  const [showReflectionModal, setShowReflectionModal] = useState<boolean>(false);
  const [annualAverage, setAnnualAverage] = useState<number>(5.2);
  const [profile, setProfile] = useState<any>(null);

  // Fetch plan on mount or userId change
  const fetchActionPlan = async () => {
    setIsLoading(true);
    try {
      // Fetch action plan
      const res = await fetch(`/api/action-planner?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.actionPlan) {
        setActionPlan(data.actionPlan);
        // Find first incomplete task's day or default to 1
        const firstIncomplete = data.actionPlan.tasks.find((t: ActionPlanTask) => !t.completed);
        if (firstIncomplete) {
          setSelectedDay(firstIncomplete.day);
        } else {
          setSelectedDay(1);
        }
      }

      // Fetch profile statistics dynamically for annual metrics
      const profileRes = await fetch(`/api/profile?userId=${userId}`);
      const profileData = await profileRes.json();
      if (profileData.success && profileData.profile) {
        setProfile(profileData.profile);
        if (profileData.profile.stats) {
          setAnnualAverage(profileData.profile.stats.annualAverage || 5.2);
        }
      }
    } catch (e) {
      console.error("Failed to load action planner state:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActionPlan();
  }, [userId]);

  // Handle task completion
  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch('/api/action-planner/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, taskId })
      });
      const data = await res.json();
      if (data.success) {
        // Optimistically update or re-fetch
        fetchActionPlan();
        if (onRefreshProfile) {
          onRefreshProfile();
        }
      }
    } catch (e) {
      console.error("Failed to mark action plan task completed:", e);
    }
  };

  // Adapt/Regenerate Plan
  const handleAdaptPlan = async () => {
    setIsAdapting(true);
    try {
      const res = await fetch('/api/action-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success && data.actionPlan) {
        setActionPlan(data.actionPlan);
        setSelectedDay(1);
        setReflectionText(null);
      }
    } catch (e) {
      console.error("Failed to adapt/generate action plan:", e);
    } finally {
      setIsAdapting(false);
    }
  };

  // Compile Reflection
  const handleRequestReflection = async () => {
    setIsReflecting(true);
    try {
      const res = await fetch('/api/action-planner/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success && data.reflection) {
        setReflectionText(data.reflection);
        setShowReflectionModal(true);
        // Update local plan if reflection is saved
        if (data.actionPlan) {
          setActionPlan(data.actionPlan);
        }
      }
    } catch (e) {
      console.error("Failed to compile weekly eco reflection:", e);
    } finally {
      setIsReflecting(false);
    }
  };

  if (isLoading || !actionPlan) {
    return (
      <div className="bg-art-cream rounded-3xl p-12 border-2 border-art-dark shadow-md flex flex-col items-center justify-center min-h-[300px]">
        <span className="relative flex h-8 w-8 mb-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-8 w-8 bg-emerald-600 items-center justify-center text-white text-xs">🌱</span>
        </span>
        <h4 className="font-serif italic font-bold text-art-dark">Assembling Adaptive Action Plan...</h4>
        <p className="text-xs text-art-olive mt-1 text-center max-w-sm">EcoBuddy is parsing your carbon statistics, onboarding choices, and logged achievements to formulate a personalized plan.</p>
      </div>
    );
  }

  // Categories metadata matching other parts of EcoTwin
  const catMeta = {
    transport: { icon: Footprints, label: 'Commuting', color: '#10b981', bg: 'bg-emerald-50 border-emerald-100 text-emerald-800' },
    energy: { icon: Zap, label: 'Energy Savings', color: '#f59e0b', bg: 'bg-amber-50 border-amber-100 text-amber-800' },
    food: { icon: Sandwich, label: 'Dietary Choice', color: '#ef4444', bg: 'bg-rose-50 border-rose-100 text-rose-800' },
    shopping: { icon: ShoppingBag, label: 'Thrifty Eco', color: '#3b82f6', bg: 'bg-blue-50 border-blue-100 text-blue-800' },
    waste: { icon: Trash2, label: 'Waste Auditing', color: '#8b5cf6', bg: 'bg-purple-50 border-purple-100 text-purple-800' }
  };

  const tasks = actionPlan.tasks || [];
  const completedTasks = tasks.filter(t => t.completed);
  const totalReduction = tasks.reduce((acc, t) => acc + t.co2Reduction, 0);
  const completedReduction = completedTasks.reduce((acc, t) => acc + t.co2Reduction, 0);
  const selectedTask = tasks.find(t => t.day === selectedDay) || tasks[0];

  // Prepare Forecasting Data based on compliance rate
  const complianceWeight = sliderCompliance / 100;
  const forecastData = [
    { name: 'Current', ideal: 0, projected: 0 },
    { name: 'Week 1', ideal: Math.round(totalReduction), projected: Math.round(totalReduction * complianceWeight) },
    { name: 'Month 1', ideal: Math.round(totalReduction * 4.3), projected: Math.round(totalReduction * 4.3 * complianceWeight) },
    { name: 'Month 3', ideal: Math.round(totalReduction * 13), projected: Math.round(totalReduction * 13 * complianceWeight) },
    { name: 'Year 1', ideal: Math.round(totalReduction * 52), projected: Math.round(totalReduction * 52 * complianceWeight) },
  ];

  return (
    <div className="space-y-6">
      
      {/* Overview Block */}
      <div id="eco-buddy-action-planner" className="bg-white rounded-3xl p-6 border-2 border-art-dark shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b-2 border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌱</span>
              <h3 className="font-serif italic text-xl font-bold text-art-dark">EcoBuddy Adaptive Action Planner</h3>
            </div>
            <p className="text-[11px] text-art-olive mt-1 max-w-2xl leading-relaxed font-semibold">
              Personalized action recommendations compiled from analyzing your carbon output habits, completed challenges, and lifestyle variables. Continuously adapts to your consistency!
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={handleAdaptPlan}
              disabled={isAdapting}
              className="px-4 py-2 bg-art-dark hover:bg-art-forest text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAdapting ? 'animate-spin' : ''}`} />
              {isAdapting ? 'Adapting Habits...' : 'Adapt with EcoBuddy'}
            </button>
            
            <button
              type="button"
              onClick={handleRequestReflection}
              className="px-4 py-2 bg-art-cream border border-art-border hover:bg-art-pale/40 text-art-dark text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              Weekly Summary
            </button>
          </div>
        </div>

        {/* Outer progress and tracker grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
          
          {/* Day Selector Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block mb-2">
              7-Day Sustainability Plan Map:
            </span>
            <div className="grid grid-cols-7 lg:grid-cols-1 gap-2">
              {tasks.map((task) => {
                const isSelected = selectedDay === task.day;
                const Icon = catMeta[task.category]?.icon || Info;
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setSelectedDay(task.day)}
                    className={`flex items-center justify-center lg:justify-between p-2.5 lg:px-4 rounded-xl border transition-all text-left text-xs font-semibold cursor-pointer ${
                      isSelected 
                        ? 'bg-art-pale/50 border-art-dark text-art-dark shadow-xs' 
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 font-bold hidden lg:inline">
                        Day {task.day}
                      </span>
                      <span className="lg:hidden font-bold">{task.day}</span>
                      <Icon className="w-3.5 h-3.5 hidden lg:inline" style={{ color: catMeta[task.category]?.color }} />
                    </div>
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 fill-emerald-100 hidden lg:block" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-350 hidden lg:block" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Micro Companion Guidance card */}
            <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex gap-3 items-start mt-4">
              <span className="text-xl">🦖</span>
              <div className="space-y-1">
                <span className="text-xs font-black text-slate-800 block">EcoBuddy Companion Tip:</span>
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold italic">
                  {completedTasks.length === 7 
                    ? "Wow! You've perfectly mapped and greenified all 7 actions! Click 'Adapt with EcoBuddy' to generate a fresh adaptive cycle!" 
                    : `Currently on Day ${selectedDay}. Completing today's recommendation offsets ${selectedTask.co2Reduction} kg CO₂ and rewards Sprout with +30 XP!`}
                </p>
              </div>
            </div>
          </div>

          {/* Active Detail Display */}
          <div className="lg:col-span-8 space-y-4 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            {selectedTask ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 font-sans">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-art-dark text-white font-black px-2.5 py-1 rounded-full uppercase">
                      Day {selectedTask.day} Target
                    </span>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${catMeta[selectedTask.category]?.bg}`}>
                      {catMeta[selectedTask.category]?.label}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="text-[10px] font-black text-[#f59e0b] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase">
                      Difficulty: {selectedTask.difficulty}
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full uppercase">
                      Impact: {selectedTask.impact}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-serif italic font-bold text-art-dark text-lg md:text-xl">
                    {selectedTask.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 font-semibold">
                    {selectedTask.description}
                  </p>

                  {/* EcoBuddy Selected reason description */}
                  <div className="bg-art-pale/40 border border-art-border rounded-xl p-3.5 mt-3 flex items-start gap-2 text-[11px] text-art-dark font-sans leading-relaxed font-semibold">
                    <span className="text-sm">🦖</span>
                    <div>
                      <span className="text-[10px] font-black text-art-olive uppercase tracking-wider block mb-0.5">EcoBuddy Selection reason:</span>
                      {EcoBuddyService.getSelectionExplanation(selectedTask, profile || { onboarding: {} } as any)}
                    </div>
                  </div>
                </div>

                {/* Metrics Stats Group */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white border border-slate-150 p-3.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-450 font-black block uppercase tracking-wider">CO₂ Saved</span>
                    <span className="text-base font-bold text-emerald-600 block mt-0.5">-{selectedTask.co2Reduction} kg CO₂</span>
                  </div>
                  <div className="bg-white border border-slate-150 p-3.5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-450 font-black block uppercase tracking-wider">Companion XP</span>
                    <span className="text-base font-bold text-amber-600 block mt-0.5">+30 XP</span>
                  </div>
                  <div className="bg-white border border-slate-150 p-3.5 rounded-xl text-center col-span-2 md:col-span-1">
                    <span className="text-[10px] text-slate-450 font-black block uppercase tracking-wider">Status Outcome</span>
                    <span className={`text-xs font-black block mt-1.5 ${selectedTask.completed ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {selectedTask.completed ? '✓ LOGGED GREEN' : '⏳ ACTIVE TARGET'}
                    </span>
                  </div>
                </div>

                {/* Confirm Active Log Trigger */}
                {!selectedTask.completed ? (
                  <button
                    type="button"
                    onClick={() => handleCompleteTask(selectedTask.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-xs uppercase"
                  >
                    <CheckCircle className="w-4 h-4" />
                    I Completed Today's Action!
                  </button>
                ) : (
                  <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 p-4 rounded-xl flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold font-sans">
                    <Trophy className="w-4 h-4 text-emerald-600 fill-emerald-100 animate-bounce" />
                    Action Completed & Logged! Checked in at {selectedTask.completedAt ? new Date(selectedTask.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently'}.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 text-slate-500 text-xs italic font-semibold">
                No active day target selected. Click a map item on the left.
              </div>
            )}
          </div>
        </div>

        {/* Micro Stats indicators block */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 mt-6 text-center">
          <div className="p-3">
            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Completed Cycle Tasks:</span>
            <span className="text-lg font-extrabold text-art-dark block mt-0.5">{completedTasks.length} / {tasks.length}</span>
          </div>
          <div className="p-3">
            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Averted Weight (Weekly):</span>
            <span className="text-lg font-extrabold text-[#10b981] block mt-0.5">{completedReduction.toFixed(1)} kg CO₂</span>
          </div>
          <div className="p-3">
            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Expected Plan Impact:</span>
            <span className="text-lg font-extrabold text-indigo-700 block mt-0.5">-{totalReduction.toFixed(1)} kg CO₂</span>
          </div>
          <div className="p-3">
            <span className="text-[9px] font-black text-slate-400 block uppercase tracking-widest">Success Compliancy:</span>
            <span className="text-lg font-extrabold text-amber-700 block mt-0.5">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Forecasting and Simulation Tool card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Compliance Simulator Controls */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-md space-y-5">
          <div>
            <h4 className="font-display font-bold text-slate-900 text-sm flex items-center gap-2">
              🔮 Compliance Rate Simulator
            </h4>
            <p className="text-xs text-slate-520 mt-1 leading-relaxed font-semibold">
              Adjust your expected compliance rate below. See how consistent execution of your EcoBuddy plan scales cumulative carbon savings over weeks, months, or year!
            </p>
          </div>

          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-600">
              <span>Your Compliance Level:</span>
              <span className="text-emerald-700 font-mono font-bold bg-white border border-slate-200 px-2.5 py-0.5 rounded">
                ⚡ {sliderCompliance}% Compliant
              </span>
            </div>
            
            <input 
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliderCompliance}
              onChange={(e) => setSliderCompliance(parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            <div className="text-[10px] text-slate-450 leading-relaxed font-semibold italic">
              - 100%: All recommended actions finished consistently.<br />
              - 50%: Logging half of the weekly action plan swap goals.<br />
              - 0%: Retaining current high-carbon baseline habits.
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl space-y-3">
            <div>
              <span className="text-[10px] font-black tracking-wider text-emerald-800 uppercase block">1-Year Savings Projection:</span>
              <span className="text-2xl font-extrabold text-emerald-950 block mt-1">
                -{Math.round(totalReduction * 52 * (sliderCompliance / 100))} kg CO₂
              </span>
              <p className="text-[10px] font-semibold text-emerald-700 mt-1 leading-relaxed">
                Equates directly to planting approximately <span className="font-bold underline">{Math.round((totalReduction * 52 * (sliderCompliance / 100)) / 22)}</span> deciduous trees worth of carbon capture! Keep leveling up.
              </p>
            </div>

            <div className="pt-2 border-t border-emerald-200/50 grid grid-cols-2 gap-2 text-left">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Current Annual Footprint</span>
                <span className="text-xs font-mono font-bold text-slate-800">{annualAverage.toFixed(1)} t CO₂/yr</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-emerald-800 uppercase block">Predicted Annual Footprint</span>
                <span className="text-xs font-mono font-bold text-emerald-700">
                  {Math.max(0.1, annualAverage - (totalReduction * 52 / 1000) * (sliderCompliance / 100)).toFixed(2)} t CO₂/yr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive projection chart */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-col justify-between">
          <div>
            <h4 className="font-display font-semibold text-slate-800 text-xs uppercase tracking-wider mb-1">
              Cumulative Carbon Savings Over Time (kg CO₂)
            </h4>
            <p className="text-[11px] text-slate-450 mb-4 font-semibold">Ideal Path (100% compliant) vs Your Simulated Path</p>
          </div>

          <div className="h-48 md:h-52 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIdeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c7d2fe" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#c7d2fe" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="ideal" name="Ideal (100% compliance)" stroke="#6366f1" fillOpacity={1} fill="url(#colorIdeal)" strokeWidth={2} />
                <Area type="monotone" dataKey="projected" name="My Path (Simulated)" stroke="#059669" fillOpacity={1} fill="url(#colorProj)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-black text-slate-500 uppercase tracking-wide justify-center pt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]" />
              <span>Perfect Compliance Path</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <span>Simulated Path</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reflection Summary Modal Dialog */}
      {showReflectionModal && reflectionText && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border-2 border-art-dark shadow-2xl relative space-y-5"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">📜</span>
                <h4 className="font-serif italic font-bold text-[#1e1b4b] text-base md:text-lg">
                  EcoBuddy Habit Reflection Report
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowReflectionModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono text-lg p-1.5 rounded-full hover:bg-slate-50 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 bg-indigo-50/70 border border-indigo-200/50 rounded-2xl text-xs md:text-sm text-slate-800 leading-relaxed font-semibold">
              <div className="prose prose-sm max-w-none text-slate-700 font-sans font-medium">
                {reflectionText.split('\n').map((line, idx) => {
                  if (line.startsWith('### ')) {
                    return <h5 key={idx} className="font-serif italic font-bold text-slate-900 text-sm mt-3 mb-1.5">{line.substring(4)}</h5>;
                  }
                  if (line.startsWith('**') || line.startsWith('* ')) {
                    return <p key={idx} className="my-1 text-slate-800 font-bold">{line}</p>;
                  }
                  return <p key={idx} className="my-2">{line}</p>;
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAdaptPlan}
                className="w-full bg-art-dark hover:bg-art-forest text-white py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs text-center flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Start Fresh 7-Day Plan
              </button>
              <button
                type="button"
                onClick={() => setShowReflectionModal(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                Done Reading
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
