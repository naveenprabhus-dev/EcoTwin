import { useState, useEffect } from 'react';
import { Challenge, CompanionState } from '../types';
import { 
  CheckCircle2, Sparkles, Award, 
  Flame, Leaf, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';

interface ChallengesProps {
  userId: string;
  companion: CompanionState;
  onRefreshProfile: () => void;
}

export default function Challenges({ userId, companion, onRefreshProfile }: ChallengesProps) {
  const [challenges, setChallenges] = useState<(Challenge & { completed: boolean; claimed: boolean })[]>([]);
  const [loadingChallengeId, setLoadingChallengeId] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`/api/challenges?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.error('Failed to read challenges:', err);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [userId]);

  const handleClaimReward = async (id: string) => {
    setLoadingChallengeId(id);
    try {
      const response = await fetch('/api/challenges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, challengeId: id })
      });
      const data = await response.json();
      if (data.success) {
        await fetchChallenges();
        onRefreshProfile(); // triggers level up update on visual companion
      }
    } catch (err) {
      console.error('Failed to claim reward:', err);
    } finally {
      setLoadingChallengeId(null);
    }
  };

  // Badge list display
  const completedCount = challenges.filter(c => c.completed).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      
      {/* Upper banner: Streaks, Level Progress bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Streak and multiplier */}
        <div className="bg-art-dark text-white rounded-[32px] p-6 border border-art-border flex items-center justify-between shadow-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-widest text-art-sage font-extrabold uppercase">Consistency Streak</span>
            <h3 className="text-3xl font-serif italic font-bold text-white mt-1 flex items-center gap-1.5">
              {companion.streak} <span className="text-xs text-art-cream/80 font-normal font-sans">Active days</span>
            </h3>
            <span className="text-xs text-stone-200 block">Complete action logs daily to increase your eco streak multiplier!</span>
          </div>
          <div className="p-4 bg-orange-100 rounded-[20px] text-orange-600 animate-bounce">
            <Flame className="w-7 h-7 fill-orange-300 animate-none" />
          </div>
        </div>

        {/* Level and Level Progress */}
        <div className="bg-white rounded-[32px] p-6 border border-art-border shadow-xs col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center bg-[#F9FAF8] p-2 px-3 rounded-xl border border-art-border">
            <span className="text-xs font-semibold text-art-dark">Companion Experience</span>
            <span className="text-xs font-mono font-bold text-art-dark bg-art-pale border border-art-border px-2.5 py-0.5 rounded-full">
              Level {companion.level}
            </span>
          </div>

          <div className="pt-4">
            <div className="flex justify-between font-mono text-[10px] text-art-olive mb-1.5 font-bold uppercase">
              <span>XP Accumulation</span>
              <span className="font-bold">{companion.xp} / {companion.xpNeeded} XP</span>
            </div>
            <div className="w-full bg-art-cream h-2.5 rounded-full overflow-hidden border border-art-border/40">
              <motion.div 
                className="bg-art-forest h-full rounded-full animate-none"
                animate={{ width: `${Math.min(100, (companion.xp / companion.xpNeeded) * 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Main challenges collection split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Active tasks sheet list */}
        <div className="lg:col-span-8 bg-white p-6 rounded-[32px] border border-art-border shadow-xs">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-art-border">
            <div>
              <h3 className="text-2xl font-serif italic font-bold text-art-dark">
                ♻️ Green Challenges
              </h3>
              <p className="text-xs text-art-olive leading-relaxed font-semibold">Complete daily actions, claim XP, and unlock accessory items!</p>
            </div>
            <span className="text-xs font-bold text-art-dark bg-[#F9FAF8] px-3 py-1 rounded-full border border-art-border uppercase tracking-wider">
              {completedCount} / {challenges.length} Done
            </span>
          </div>

          <div className="space-y-3.5">
            {challenges.map(item => (
              <div 
                key={item.id} 
                className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  item.completed 
                    ? 'bg-[#F9FAF8]/60 border-art-border/60 opacity-80' 
                    : 'bg-white border-art-border hover:bg-art-cream/35 shadow-xs'
                }`}
              >
                
                {/* Details layout */}
                <div className="flex gap-3">
                  <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 border border-art-border/40 ${
                    item.category === 'transport' ? 'bg-emerald-50 text-emerald-900 border-emerald-100' :
                    item.category === 'energy' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                    item.category === 'food' ? 'bg-rose-50 text-rose-900 border-rose-100' :
                    item.category === 'shopping' ? 'bg-blue-50 text-blue-900 border-blue-100' : 'bg-purple-50 text-purple-900 border-purple-100'
                  }`}>
                    {item.category === 'transport' && <Leaf className="w-5 h-5 fill-emerald-100" />}
                    {item.category === 'energy' && <Leaf className="w-5 h-5 fill-amber-100" />}
                    {item.category === 'food' && <Leaf className="w-5 h-5 fill-rose-100" />}
                    {item.category === 'shopping' && <Leaf className="w-5 h-5 fill-blue-100" />}
                    {item.category === 'waste' && <Leaf className="w-5 h-5 fill-purple-100" />}
                  </div>

                  <div className="space-y-0.5">
                    <span className="font-bold text-art-dark text-sm block leading-tight">{item.title}</span>
                    <p className="text-xs text-art-text leading-snug font-sans font-semibold">{item.description}</p>
                    <div className="flex gap-2 items-center text-[10px] text-art-olive pt-1 font-bold">
                      <span className="font-mono bg-art-pale border border-[#E2E8E0] px-1.5 py-0.5 rounded text-art-dark">-{item.co2Saved} kg CO₂</span>
                      <span className="bg-amber-50 text-amber-950 border border-amber-100 px-1.5 py-0.5 rounded font-mono font-bold">+{item.xpReward} XP</span>
                    </div>
                  </div>
                </div>

                {/* Confirm rewards buttons */}
                <div>
                  {item.completed ? (
                    <span className="text-xs font-bold text-art-olive inline-flex items-center gap-1 bg-art-cream px-3.5 py-1.5 rounded-xl border border-art-border">
                      <CheckCircle2 className="w-3.5 h-3.5 text-art-olive" /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => handleClaimReward(item.id)}
                      disabled={loadingChallengeId === item.id}
                      className="w-full md:w-auto px-4 py-2.5 text-xs font-bold bg-art-dark hover:bg-art-forest text-white rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs border border-art-dark"
                    >
                      {loadingChallengeId === item.id ? 'Claiming...' : 'I Completed This'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right: Unlocked achievements visual badge showcases */}
        <div className="lg:col-span-4 bg-white p-6 rounded-[32px] border border-art-border shadow-xs space-y-4">
          <div>
            <h3 className="text-2xl font-serif italic font-bold text-art-dark">
              🏆 Badges
            </h3>
            <p className="text-xs text-art-olive mt-1 leading-relaxed font-semibold">Your badges indicate landmark environmental achievements.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { id: 'b1', name: 'Alley Biker', desc: 'Used zero fuel for travel', emoji: '🚲', unlocked: companion.streak >= 1 },
              { id: 'b2', name: 'Plastic Buster', desc: 'Unused single plastic', emoji: '🥤', unlocked: companion.streak >= 2 },
              { id: 'b3', name: 'Watt Guard', desc: 'Saved standby energy', emoji: '💡', unlocked: companion.level >= 2 },
              { id: 'b4', name: 'Veggie Baron', desc: 'No livestock diet week', emoji: '🥦', unlocked: companion.level >= 3 },
              { id: 'b5', name: 'Green Giant', desc: 'Footprint rating 90+', emoji: '🌳', unlocked: companion.level >= 4 }
            ].map(b => (
              <div 
                key={b.id} 
                className={`p-3.5 rounded-2xl border text-center relative transition-all flex flex-col items-center justify-center gap-1 ${
                  b.unlocked 
                    ? 'bg-[#F9FAF8] border-art-border text-art-dark' 
                    : 'bg-art-cream/30 border-art-border/40 text-art-olive/40 opacity-55 grayscale'
                }`}
              >
                <span className="text-3xl block">{b.emoji}</span>
                <span className="text-xs font-bold leading-none block text-art-dark mt-1">{b.name}</span>
                <span className="text-[8px] text-art-olive leading-tight block text-center font-sans font-semibold mt-0.5">{b.desc}</span>
                {b.unlocked && (
                  <span className="absolute top-1.5 right-1.5">
                    <ShieldCheck className="w-3 h-3 text-art-forest fill-art-pale" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
