/**
 * Emotion System service.
 * Handles the mapping of carbon companion states to emotions,
 * and hosts browser-synthesized Web Audio oscillator chimes for emotional reactions.
 */

export interface CompanionEmotionConfig {
  mood: string;
  stateGroup: 'excellent' | 'good' | 'moderate' | 'high' | 'critical';
  bodyColor: string;
  cheekColor: string;
  moodText: string;
  description: string;
  bgGradient: string;
  faceAccent: string;
}

export type CompanionMoodType =
  | 'excited'
  | 'celebratory'
  | 'proud'
  | 'curious'
  | 'reflective'
  | 'concerned'
  | 'sad'
  | 'motivational'
  | 'playful';

export class EmotionSystem {
  /**
   * Translates the user's score to a companion mood type.
   */
  public static getMoodFromScore(score: number): CompanionMoodType {
    if (score >= 85) return 'excited';
    if (score >= 76) return 'celebratory';
    if (score >= 65) return 'proud';
    if (score >= 55) return 'curious';
    if (score >= 45) return 'playful';
    if (score >= 35) return 'reflective';
    if (score >= 25) return 'motivational';
    if (score >= 15) return 'concerned';
    return 'sad';
  }

  /**
   * Retrieves full styling metadata and description configurations for a companion mood.
   */
  public static getEmotionConfig(mood: CompanionMoodType, companionName: string): CompanionEmotionConfig {
    switch (mood) {
      case 'excited':
        return {
          mood: 'excited',
          stateGroup: 'excellent',
          bodyColor: '#22c55e',
          cheekColor: '#f43f5e',
          moodText: 'Radiant & Excited!',
          description: `Your eco-actions are amazing! ${companionName} is blooming with high-energy excitement, surrounded by fresh oxygen!`,
          bgGradient: 'from-emerald-300 via-green-100 to-emerald-400',
          faceAccent: '#15803d',
        };
      case 'celebratory':
        return {
          mood: 'celebratory',
          stateGroup: 'excellent',
          bodyColor: '#d97706',
          cheekColor: '#fb7185',
          moodText: 'Celebratory Cheer!',
          description: `Hooray! Streak milestone reached. ${companionName} is leaf-dancing and throwing a mini seed-shower celebration!`,
          bgGradient: 'from-amber-200 via-yellow-100 to-amber-300',
          faceAccent: '#78350f',
        };
      case 'proud':
        return {
          mood: 'proud',
          stateGroup: 'good',
          bodyColor: '#10b981',
          cheekColor: '#fda4af',
          moodText: 'Thriving & Proud!',
          description: `You've been showing up and keeping our footprint low. ${companionName} is feeling secure and proud!`,
          bgGradient: 'from-green-100 via-teal-50 to-emerald-200',
          faceAccent: '#115e59',
        };
      case 'curious':
        return {
          mood: 'curious',
          stateGroup: 'good',
          bodyColor: '#06b6d4',
          cheekColor: '#a5f3fc',
          moodText: 'Inquisitive & Curious',
          description: `Sprout is observing daily composting options! ${companionName} wants to know what other sustainable swaps can be made.`,
          bgGradient: 'from-cyan-100 via-teal-50 to-cyan-200',
          faceAccent: '#0e7490',
        };
      case 'reflective':
        return {
          mood: 'reflective',
          stateGroup: 'moderate',
          bodyColor: '#64748b',
          cheekColor: '#cbd5e1',
          moodText: 'Quietly Reflective',
          description: `Evaluating historical footprint trends. Let's think deeply about how we can manage standby loads.`,
          bgGradient: 'from-slate-100 via-stone-100 to-indigo-50',
          faceAccent: '#334155',
        };
      case 'concerned':
        return {
          mood: 'concerned',
          stateGroup: 'high',
          bodyColor: '#f97316',
          cheekColor: 'transparent',
          moodText: 'Slightly Concerned',
          description: `Hmm... I noticed our emissions are creeping up a bit today. Nothing we can't tackle together!`,
          bgGradient: 'from-orange-100 via-stone-200 to-amber-200',
          faceAccent: '#7c2d12',
        };
      case 'sad':
        return {
          mood: 'sad',
          stateGroup: 'critical',
          bodyColor: '#78716c',
          cheekColor: 'transparent',
          moodText: 'A Bit Sad & Worried',
          description: `Emissions have increased a bit, making ${companionName} feel a little cloudy. Let's complete a Challenge and clear the air!`,
          bgGradient: 'from-stone-400 via-neutral-300 to-zinc-500',
          faceAccent: '#292524',
        };
      case 'motivational':
        return {
          mood: 'motivational',
          stateGroup: 'moderate',
          bodyColor: '#f59e0b',
          cheekColor: '#fef08a',
          moodText: 'Start Fresh Today!',
          description: `Progress is about small steps, not perfection. ${companionName} is here to support you at every single swap!`,
          bgGradient: 'from-amber-50 via-yellow-100 to-amber-200',
          faceAccent: '#b45309',
        };
      case 'playful':
      default:
        return {
          mood: 'playful',
          stateGroup: 'good',
          bodyColor: '#14b8a6',
          cheekColor: '#fca5a5',
          moodText: 'Giggly & Playful',
          description: `Reusing items brings so much joy! Let's explore creative, sustainable habits today.`,
          bgGradient: 'from-orange-50 via-teal-100 to-amber-100',
          faceAccent: '#0f766e',
        };
    }
  }

  /**
   * Synthesize emotional procedurals via browser-native Web Audio API.
   * Plays corresponding synthesizer sounds based on interactive triggers.
   */
  public static playProceduralSound(type: 'giggle' | 'wink' | 'surprise' | 'love' | 'hero' | 'sleepy' | string): void {
    if (typeof window === 'undefined') return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'giggle') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(960, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'wink') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(1150, now + 0.12);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'surprise') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(950, now + 0.18);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'love') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(460, now + 0.12);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'hero') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(554, now + 0.08);
        osc.frequency.setValueAtTime(659, now + 0.15);
        osc.frequency.setValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'sleepy') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (err) {
      console.warn('[Emotion System] Audio Context interaction blocked:', err);
    }
  }
}
