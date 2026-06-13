import React, { useState } from 'react';
import { OnboardingData, TransType, ACUsageType, DietType, ShopFreqType, RecycleType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, Car, Footprints, Bike, Plane, 
  Lightbulb, Zap, ShoppingBag, Trash2, 
  ChevronRight, ChevronLeft, Sparkles, CheckCircle2 
} from 'lucide-react';

interface OnboardingProps {
  initialData?: OnboardingData;
  onSubmit: (data: OnboardingData) => void;
}

export default function Onboarding({ initialData, onSubmit }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData || {
    transType: 'public',
    transDistWeekly: 50,
    monthlyElectricBill: 3500,
    acUsage: 'medium',
    diet: 'vegetarian',
    shopFreq: 'weekly',
    fastFashion: false,
    recycleHabits: 'partial',
    wasteSegregation: true
  });

  const nextStep = () => setStep(prev => Math.min(5, prev + 1));
  const prevStep = () => setStep(prev => Math.max(1, prev - 1));

  const totalSteps = 5;
  const progressPercent = (step / totalSteps) * 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(data);
  };

  const setTrans = (type: TransType) => setData(p => ({ ...p, transType: type }));
  const setDist = (val: number) => setData(p => ({ ...p, transDistWeekly: val }));
  const setBill = (val: number) => setData(p => ({ ...p, monthlyElectricBill: val }));
  const setAC = (usage: ACUsageType) => setData(p => ({ ...p, acUsage: usage }));
  const setDiet = (diet: DietType) => setData(p => ({ ...p, diet }));
  const setShop = (freq: ShopFreqType) => setData(p => ({ ...p, shopFreq: freq }));
  const setFastFashion = (ff: boolean) => setData(p => ({ ...p, fastFashion: ff }));
  const setRecycle = (hab: RecycleType) => setData(p => ({ ...p, recycleHabits: hab }));
  const setSegregation = (seg: boolean) => setData(p => ({ ...p, wasteSegregation: seg }));

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl border border-green-50 shadow-xl overflow-hidden">
      
      {/* Header Block */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-green-100 flex justify-between items-center">
        <div>
          <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Assessment Onboarding
          </span>
          <h2 className="text-xl font-display font-bold text-gray-900 mt-1">Configure Your Footprint</h2>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-emerald-700 bg-emerald-100/60 px-3 py-1 rounded-full">
            Step {step} of 5
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-1 bg-gray-100 w-full relative">
        <motion.div 
          className="absolute left-0 top-0 bottom-0 bg-emerald-500 rounded-r-full"
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: TRANSPORTATION */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-800 flex items-center gap-2">
                  <Car className="w-5 h-5 text-emerald-600" /> How do you get around?
                </h3>
                <p className="text-sm text-gray-600 mt-1">Select your primary mode of transit and estimate weekly travel distances.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { id: 'walking', label: 'Walking', icon: Footprints, desc: 'Zero impact' },
                  { id: 'bicycle', label: 'Bicycle', icon: Bike, desc: 'Eco friendly' },
                  { id: 'public', label: 'Public Bus/Rail', icon: Bus, desc: 'Low impact' },
                  { id: 'twowheeler', label: 'Scooter/Cycle', icon: Bike, desc: 'Medium impact' },
                  { id: 'car', label: 'Personal Car', icon: Car, desc: 'High impact' }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = data.transType === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTrans(item.id as TransType)}
                      className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md ring-2 ring-emerald-500/10' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-xs font-semibold">{item.label}</span>
                      <span className="text-[9px] text-gray-500">{item.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">Estimated Weekly Distance:</label>
                  <span className="text-emerald-700 font-mono text-sm font-bold bg-white px-2.5 py-1 rounded-md shadow-xs border border-slate-100">
                    {data.transDistWeekly} km / week
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="10"
                  value={data.transDistWeekly}
                  onChange={(e) => setDist(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>In-Neighborhood (0 km)</span>
                  <span>Heavy Commuter (400+ km)</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: ELECTRICITY & ENERGY */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-800 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-emerald-600" /> Home Energy Intake
                </h3>
                <p className="text-sm text-gray-600 mt-1">Understanding your household energy footprint allows calculating electric utility grids.</p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-slate-700">Average Monthly Power Bill:</label>
                  <span className="text-emerald-700 font-mono text-sm font-bold bg-white px-2.5 py-1 rounded-md shadow-xs border border-slate-100">
                    ₹{data.monthlyElectricBill} / month
                  </span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="15000"
                  step="100"
                  value={data.monthlyElectricBill}
                  onChange={(e) => setBill(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>Minimal utility (₹500)</span>
                  <span>High powered smart home (₹15,000+)</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 block">Air Conditioning Usage:</label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { id: 'none', label: 'No AC', desc: '0 hours/day' },
                    { id: 'low', label: 'Low', desc: '1-3 hours/day' },
                    { id: 'medium', label: 'Medium', desc: '4-8 hours/day' },
                    { id: 'high', label: 'Heavy AC', desc: '8+ hours/day' }
                  ].map(item => {
                    const isSelected = data.acUsage === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setAC(item.id as ACUsageType)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold shadow-xs' 
                            : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs block">{item.label}</span>
                        <span className="text-[9px] text-gray-500 font-normal">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FOOD HABITS */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-800 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-600" /> What's on your dinner plate?
                </h3>
                <p className="text-sm text-gray-600 mt-1">Agriculture & livestock production are major contributors to carbon vectors.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'vegetarian', label: 'Vegetarian', desc: 'Fully plant-focused meals. Excellent low carbon baseline footprint.', emoji: '🥗' },
                  { id: 'eggetarian', label: 'Eggetarian', desc: 'Plant based meals supplementing farm animal dairy/eggs.', emoji: '🍳' },
                  { id: 'nonvegetarian', label: 'Non-Vegetarian', desc: 'Meals including beef, pork, or poultry. Higher farming carbon multiplier.', emoji: '🍖' }
                ].map(item => {
                  const isSelected = data.diet === item.id;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setDiet(item.id as DietType)}
                      className={`p-5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md ring-2 ring-emerald-500/15' 
                          : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-sm font-semibold">{item.label}</span>
                      <span className="text-xs text-gray-600 leading-normal font-normal">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* STEP 4: SHOPPING HABITS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-800 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" /> Consumable Shopping Frequency
                </h3>
                <p className="text-sm text-gray-600 mt-1">Shipping dispatches, manufacturing delivery packets, and packaging footprint offsets.</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 block">Retail & Online Purchase Rate:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'rarely', label: 'Rarely', desc: 'Once a month' },
                    { id: 'weekly', label: 'Weekly', desc: '1-3 deliveries/wk' },
                    { id: 'daily', label: 'Daily', desc: 'Near-constant buys' }
                  ].map(item => {
                    const isSelected = data.shopFreq === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setShop(item.id as ShopFreqType)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold shadow-xs' 
                            : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs block">{item.label}</span>
                        <span className="text-[10px] text-gray-500 font-normal">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-slate-800 block">Fast Fashion Consumer?</span>
                  <span className="text-xs text-gray-500 block">Frequent purchases of discount synthetic clothing garments.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFastFashion(!data.fastFashion)}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 cursor-pointer ${
                    data.fastFashion ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <motion.div 
                    layout 
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: WASTE HABITS */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-display font-semibold text-gray-800 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-emerald-600" /> Waste Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">Landfills produce methane gas. Proper classification reduces soil carbon degradation.</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-slate-700 block">Recycling habits:</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'none', label: 'None', desc: 'All goes in dry garbage' },
                    { id: 'partial', label: 'Partial', desc: 'Recycle paper/cans only' },
                    { id: 'full', label: 'Full', desc: 'Zero landfill goal' }
                  ].map(item => {
                    const isSelected = data.recycleHabits === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setRecycle(item.id as RecycleType)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-semibold shadow-xs' 
                            : 'border-slate-200 text-slate-700 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-xs block">{item.label}</span>
                        <span className="text-[10px] text-gray-500 font-normal">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-sm font-semibold text-slate-800 block">Segregate Organic composting?</span>
                  <span className="text-xs text-gray-500 block">Dividing wet food scraps to let decomposers reuse biomass.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSegregation(!data.wasteSegregation)}
                  className={`w-14 h-8 rounded-full transition-all flex items-center px-1 cursor-pointer ${
                    data.wasteSegregation ? 'bg-emerald-500 justify-end' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <motion.div 
                    layout 
                    className="w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </button>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-center">
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl transition-all shadow-lg hover:shadow-emerald-600/20 flex items-center gap-2 cursor-pointer text-sm"
                >
                  <CheckCircle2 className="w-4.5 h-4.5" /> Submit Assessment Done
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Action Button Rails */}
        <div className="pt-8 border-t border-slate-100 flex justify-between mt-8">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium border flex items-center gap-1 cursor-pointer transition-all ${
              step === 1 
                ? 'opacity-40 pointer-events-none text-slate-400 border-slate-100' 
                : 'text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          {step < 5 && (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
            >
              Continue <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
