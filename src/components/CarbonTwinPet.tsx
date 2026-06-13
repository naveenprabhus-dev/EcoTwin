import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CloudRain, ShieldAlert, Heart, Laugh } from 'lucide-react';

interface CarbonTwinPetProps {
  score: number;
  equippedAccessories: string[];
  name: string;
  moodState?: 'feed' | 'dance' | 'idle' | 'petted';
  isSpeaking?: boolean;
  currentMood?: 'excited' | 'proud' | 'concerned' | 'sad' | 'motivational' | 'playful';
}

export default function CarbonTwinPet({ score, equippedAccessories, name, moodState = 'idle', isSpeaking = false, currentMood }: CarbonTwinPetProps) {
  // Interactivity and reaction states
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number }[]>([]);
  const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

  // Derive stateGroup as fallback
  let defaultStateGroup: 'excellent' | 'good' | 'moderate' | 'high' | 'critical' = 'good';
  if (score >= 80) defaultStateGroup = 'excellent';
  else if (score >= 60) defaultStateGroup = 'good';
  else if (score >= 40) defaultStateGroup = 'moderate';
  else if (score >= 20) defaultStateGroup = 'high';
  else defaultStateGroup = 'critical';

  // Determine standard companion mood if not specified
  const effectiveMood = currentMood || (
    score >= 80 ? 'excited' :
    score >= 63 ? 'proud' :
    score >= 48 ? 'playful' :
    score >= 28 ? 'concerned' : 'sad'
  );

  let stateGroup: 'excellent' | 'good' | 'moderate' | 'high' | 'critical' = 'good';
  let bodyColor = '';
  let cheekColor = '';
  let moodText = '';
  let description = '';
  let bgGradient = '';
  let faceAccent = '';

  switch (effectiveMood) {
    case 'excited':
      stateGroup = 'excellent';
      bodyColor = '#22c55e'; // Vibrant Green
      cheekColor = '#f43f5e'; // Pastel pink cheeks
      moodText = 'Radiant & Excited!';
      description = `Your eco-actions are amazing! ${name} is blooming with high-energy excitement, surrounded by fresh oxygen!`;
      bgGradient = 'from-emerald-300 via-green-100 to-emerald-400';
      faceAccent = '#15803d';
      break;
    case 'proud':
      stateGroup = 'good';
      bodyColor = '#10b981'; // Fresh Teal/Green
      cheekColor = '#fda4af'; // Light pink
      moodText = 'Thriving & Proud!';
      description = `You've been showing up and keeping our footprint low. ${name} is feeling secure and proud!`;
      bgGradient = 'from-green-100 via-teal-50 to-emerald-200';
      faceAccent = '#115e59';
      break;
    case 'concerned':
      stateGroup = 'high';
      bodyColor = '#f97316'; // Deep Orange
      cheekColor = 'transparent'; // No cheeks
      moodText = 'Slightly Concerned';
      description = `Hmm... I noticed our emissions are creeping up a bit today. Nothing we can't tackle together!`;
      bgGradient = 'from-orange-100 via-stone-200 to-amber-200';
      faceAccent = '#7c2d12';
      break;
    case 'sad':
      stateGroup = 'critical';
      bodyColor = '#78716c'; // Sick Ash Stone Gray
      cheekColor = 'transparent';
      moodText = 'A Bit Sad & Worried';
      description = `Emissions have increased a bit, making ${name} feel a little cloudy. Let's complete a Challenge and clear the air!`;
      bgGradient = 'from-stone-400 via-neutral-300 to-zinc-500';
      faceAccent = '#292524';
      break;
    case 'motivational':
      stateGroup = 'moderate';
      bodyColor = '#f59e0b'; // Warm Amber
      cheekColor = '#fef08a'; // Faint yellow cheek tint
      moodText = 'Start Fresh Today!';
      description = `Progress is about small steps, not perfection. ${name} is here to support you at every single swap!`;
      bgGradient = 'from-amber-50 via-yellow-100 to-amber-200';
      faceAccent = '#b45309';
      break;
    case 'playful':
      stateGroup = 'good';
      bodyColor = '#14b8a6'; // Playful Teal
      cheekColor = '#fca5a5';
      moodText = 'Giggly & Playful';
      description = `Reusing items brings so much joy! Let's explore creative, sustainable habits today.`;
      bgGradient = 'from-orange-50 via-teal-100 to-amber-100';
      faceAccent = '#0f766e';
      break;
  }

  // Accessories visuals
  const hasAccessory = (accName: string) => equippedAccessories.includes(accName);

  // Micro-animations presets based on active state / moodState
  let floatDuration = 3;
  let bounceY = [-10, 10];
  if (stateGroup === 'excellent') {
    floatDuration = 2;
    bounceY = [-15, 15];
  } else if (stateGroup === 'high') {
    floatDuration = 5;
    bounceY = [-4, 4];
  } else if (stateGroup === 'critical') {
    floatDuration = 6.5;
    bounceY = [-1, 2];
  }

  // Override animations for specific momentary triggers
  if (moodState === 'dance') {
    floatDuration = 0.8;
    bounceY = [-25, 0];
  }

  // Cute procedural audio synthesis utilizing browser Web Audio APIs
  const playCuteSound = (type: string) => {
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
      console.warn('Audio Context interaction prevented or blocked:', err);
    }
  };

  // Get matching dialog phrases depending on stateGroup and tapped reaction
  const getReactionDialogue = (kind: string, group: string): string => {
    const excellentLines: Record<string, string[]> = {
      giggle: [
        "Hehehe! That tickles so much! ✨",
        "Giggle! Your low carbon footprint make me so energetic!",
        "Hahaha! Look at us thriving in carbon zero!",
        "Wiggle wiggle! Keep tapping me! 🌸"
      ],
      wink: [
        "Wink! You are a certified carbon-zero champion! 🦖",
        "Looking sharp, eco hero! Together, we protect the sky!",
        "Wink! Let's check out a new eco challenge!",
        "Eco-ranger vibes only! 😉"
      ],
      surprise: [
        "Whoa! You tapped me with high-speed green energy! ⚡",
        "Gasp! Did we just plant another forest?",
        "Boing! Look at all these beautiful organic petals!",
        "Ooooh! An interactive touch!"
      ],
      love: [
        "Aww! You're the kindest eco-guardian ever! 💕",
        "My green heart is literally blooming with joy!",
        "Sending you fresh, pure oxygen love!",
        "I feel so secure and loved by you! 🌱"
      ],
      hero: [
        "Green Power: MAXIMUM LEVEL ACHIEVED! 🦸‍♂️",
        "Defeating global warming, one challenge at a time!",
        "Active, vibrant, and ready to save the planet!",
        "Eco-superstars assemble!"
      ],
      sleepy: [
        "Zzz... dreaming of glorious solar wind turbines...",
        "Yawn... feeling so cozy in this clean, organic grass...",
        "Zzz... carbon levels are zero, a perfect dry-nap weather..."
      ]
    };

    const goodLines: Record<string, string[]> = {
      giggle: [
        "Haha! That's ticklish! 😊",
        "Hehehe! I feel safe and healthy, thank you!",
        "Yay! Tickle fight under clean skies!",
        "Whoosh! That tickles my head leaf!"
      ],
      wink: [
        "Wink! We are a super great sustainable team!",
        "Looking mighty clean today! 😉",
        "Wink! Did you turn off an idle appliance?",
        "Let's complete another green task!"
      ],
      surprise: [
        "Oh! Hello there, friendly human!",
        "Gasp! Is it time for another green habit?",
        "Ah! I noticed you tapped me! How neat!",
        "Ooooh, fresh interaction!"
      ],
      love: [
        "Aww, thanks for caring! 💕",
        "You have a really beautiful green soul!",
        "Thanks for keeping my surrounding air tidy and clear!",
        "Warm green hugs to you!"
      ],
      hero: [
        "Clean, green, and ready for action! ⚡",
        "Confidence is key when sorting recycling index!",
        "Let's adopt a cold laundry cycle next!",
        "Eco actions are easy when we team up!"
      ],
      sleepy: [
        "Zzz... resting my leaf under the cool shade...",
        "Yawn... did you know forests take slow naps too?",
        "Feeling very serene and content..."
      ]
    };

    const worriedLines: Record<string, string[]> = {
      giggle: [
        "Ugh, a minor forced giggle... 🍂",
        "Cough... haha, that still kind of tickles!",
        "Hehe... thanks for checking in on me!",
        "Tickles help distract me from emissions!"
      ],
      wink: [
        "Wink... we can definitely turn this score around!",
        "A slightly shaky wink, but I believe in us!",
        "Let's watch our travel emissions, okay?",
        "Eco-alert! Ready for clean inputs!"
      ],
      surprise: [
        "Gasp! Is our electric bill going up again? ⚡",
        "Oh no! Did we use plastic-packed items?",
        "My head-leaf was startled!",
        "Wheeze! Watch out for dusty air indexes!"
      ],
      love: [
        "Thank you... I really needed a soft pet today. 💚",
        "Your touch gives me energy to keep clean!",
        "Let's work together to make the air crisper!",
        "A warm gentle pet cures carbon anxiety!"
      ],
      hero: [
        "Determined to recover! Let's crush a challenge! ⚡",
        "I won't give up! Show me the green transit routes!",
        "Fists up! We will defeat this smog!",
        "Let's actively lower those emissions!"
      ],
      sleepy: [
        "Yawn... feeling slightly fatigued by the dry air...",
        "Zzz... trying to filter carbon in my dreams...",
        "Exhausted... let's shut down idle devices."
      ]
    };

    const pool = group === 'excellent' ? excellentLines : group === 'good' ? goodLines : worriedLines;
    const array = pool[kind] || ["Hello! Tap me for reactions!"];
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

  const getReactionEmoji = (kind: string) => {
    switch (kind) {
      case 'giggle': return '✨';
      case 'wink': return '🎵';
      case 'surprise': return '💥';
      case 'love': return '💖';
      case 'hero': return '⚡';
      case 'sleepy': return '💤';
      default: return '🎉';
    }
  };

  // Click/Touch Tap handler on the virtual companion
  const handleTapPet = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const reactionList = ['giggle', 'wink', 'surprise', 'love', 'hero', 'sleepy'];
    // Cycle or pick random reaction kind to prevent repetition exhaustion
    const reactionKind = reactionList[Math.floor(Math.random() * reactionList.length)];
    setActiveReaction(reactionKind);
    
    const textPrompt = getReactionDialogue(reactionKind, stateGroup);
    setBubbleText(textPrompt);
    
    // Play custom synthesis audio pitch
    playCuteSound(reactionKind);

    // Speak out dialog using Browser SpeechSynthesis with high pitched companion voice!
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textPrompt);
        utterance.pitch = 1.65; // Cute high pitched virtual companion
        utterance.rate = 1.05; // Slightly fast cute pace
        utterance.onstart = () => setIsLocalSpeaking(true);
        utterance.onend = () => setIsLocalSpeaking(false);
        utterance.onerror = () => setIsLocalSpeaking(false);
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('SpeechSynthesis error:', err);
      }
    }
    
    // Spawn playful floating particles with offset
    const newParticles = Array.from({ length: 5 }).map((_, idx) => ({
      id: Date.now() + idx,
      char: getReactionEmoji(reactionKind),
      x: (Math.random() - 0.5) * 110,
      y: (Math.random() - 0.5) * 30 - 20
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    
    // Auto reset expressions after 3.2 seconds
    setTimeout(() => {
      setActiveReaction(curr => curr === reactionKind ? null : curr);
      setBubbleText(curr => curr === textPrompt ? null : curr);
    }, 3200);

    // Auto filter particles after 1.4 seconds
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1400);
  };

  // Setup reactive animation triggers based on state
  let customAnimate: any = {
    y: moodState === 'feed' ? [-10, -40, -10] : bounceY,
    rotate: moodState === 'dance' ? [-10, 10, -10, 10, 0] : [0, 0],
    scale: moodState === 'feed' ? [0.95, 1.15, 1] : [1, 1],
  };
  
  let customTransition: any = {
    y: {
      repeat: moodState === 'feed' ? 1 : Infinity,
      duration: floatDuration,
      ease: "easeInOut"
    },
    rotate: {
      repeat: moodState === 'dance' ? Infinity : 0,
      duration: 0.8
    }
  };

  // Inject taps and overrides
  if (activeReaction) {
    if (activeReaction === 'giggle') {
      customAnimate = {
        y: [-10, 8, -10, 8, -10],
        rotate: [-14, 14, -14, 14, 0],
        scale: [1, 1.08, 0.98, 1.08, 1],
      };
      customTransition = {
        duration: 0.7,
        ease: "easeInOut"
      };
    } else if (activeReaction === 'surprise') {
      customAnimate = {
        y: [0, -55, -10],
        scale: [1, 1.3, 0.9, 1.06, 1],
        rotate: [0, -8, 8, 0],
      };
      customTransition = {
        duration: 0.6,
        ease: "easeOut"
      };
    } else if (activeReaction === 'love') {
      customAnimate = {
        scale: [1, 1.16, 0.96, 1.16, 1],
        rotate: [-6, 6, -6, 6, 0],
        y: [-10, -25, -10],
      };
      customTransition = {
        duration: 1.1,
        ease: "easeInOut"
      };
    } else if (activeReaction === 'wink') {
      customAnimate = {
        rotate: [0, 12, -12, 0],
        scale: [1, 1.1, 1],
        y: [-10, -20, -10],
      };
      customTransition = {
        duration: 0.75,
        ease: "easeInOut"
      };
    } else if (activeReaction === 'hero') {
      customAnimate = {
        y: [-10, -40, -18],
        scale: [1, 1.2, 1.15],
        rotate: [0, 4, -4, 0],
      };
      customTransition = {
        duration: 0.85,
        ease: "easeOut"
      };
    } else if (activeReaction === 'sleepy') {
      customAnimate = {
        rotate: [-6, 6, -6],
        scale: [1, 0.96, 1],
        y: [-10, 4, -10],
      };
      customTransition = {
        y: {
          repeat: Infinity,
          duration: 3.2,
          ease: "easeInOut"
        },
        rotate: {
          repeat: Infinity,
          duration: 4.2,
          ease: "easeInOut"
        }
      };
    }
  }

  return (
    <div className={`relative w-full rounded-[32px] p-6 overflow-hidden bg-gradient-to-b ${bgGradient} border border-art-border shadow-xl transition-all duration-750 flex flex-col items-center justify-between min-h-[440px]`}>
      
      {/* Absolute environmental effects overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {stateGroup === 'excellent' && (
          <div className="absolute inset-0">
            {/* Sparkles Floating */}
            <motion.div 
              animate={{ y: [-20, -100], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 0 }}
              className="absolute top-3/4 left-1/4 text-emerald-400"
            >
              <Sparkles className="w-5 h-5 fill-emerald-300" />
            </motion.div>
            <motion.div 
              animate={{ y: [-10, -90], opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 4, delay: 1.5 }}
              className="absolute top-2/3 right-1/4 text-yellow-400"
            >
              <Sparkles className="w-4 h-4 fill-yellow-200" />
            </motion.div>
            {/* Beautiful organic floating hearts */}
            <motion.div 
              animate={{ y: [-15, -70], x: [0, -10, 5], opacity: [0, 0.8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
              className="absolute top-1/2 left-10 text-rose-400"
            >
              <Heart className="w-4 h-4 fill-rose-300" />
            </motion.div>
          </div>
        )}

        {stateGroup === 'critical' && (
          <div className="absolute inset-0">
            {/* Smog particles drifting */}
            <motion.div 
              animate={{ x: [-20, 150], y: [-10, -50], opacity: [0, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 4.5 }}
              className="absolute top-[40%] left-4 bg-stone-500 rounded-full w-12 h-4 blur-md"
            />
            <motion.div 
              animate={{ x: [10, -120], y: [15, -45], opacity: [0, 0.3, 0] }}
              transition={{ repeat: Infinity, duration: 6, delay: 1 }}
              className="absolute top-[60%] right-10 bg-neutral-600 rounded-full w-16 h-5 blur-md"
            />
            {/* Cough soot particle clouds */}
            {moodState === 'idle' && (
              <motion.div 
                animate={{ scale: [0.5, 2], opacity: [0, 0.5, 0], x: [-10, -40] }}
                transition={{ repeat: Infinity, duration: 2.5, repeatDelay: 1.5 }}
                className="absolute top-[52%] left-[42%] bg-stone-700 rounded-full w-6 h-6 blur-xs"
              />
            )}
          </div>
        )}
      </div>

      {/* Top Banner: State Details */}
      <div className="w-full flex justify-between items-center z-10">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-widest text-art-forest font-black">Companion Carbon Status</span>
          <h3 className="font-serif italic text-3xl font-bold text-art-dark mt-0.5">{name}</h3>
        </div>
        
        {/* Dynamic Badge */}
        <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 border text-[11px] font-bold uppercase tracking-wider
          ${stateGroup === 'excellent' && 'bg-art-forest text-white border-art-dark shadow-sm'}
          ${stateGroup === 'good' && 'bg-art-pale text-art-dark border-art-border'}
          ${stateGroup === 'moderate' && 'bg-amber-100 text-amber-900 border-amber-200'}
          ${stateGroup === 'high' && 'bg-orange-100 text-orange-900 border-orange-200'}
          ${stateGroup === 'critical' && 'bg-red-700 text-white border-red-800 animate-pulse'}
        `}>
          {stateGroup === 'excellent' && <Laugh className="w-3.5 h-3.5" />}
          {stateGroup === 'critical' && <ShieldAlert className="w-3.5 h-3.5" />}
          <span>{moodText}</span>
        </div>
      </div>

      {/* Centerpiece Container: Character Canvas */}
      <div className="relative w-full max-w-[280px] h-[255px] flex items-center justify-center mt-6">
        
        {/* Spring-loaded dialog bubble above Sprout */}
        <AnimatePresence>
          {bubbleText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.6, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 10 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="absolute -top-[52px] z-30 bg-white border-2 border-art-dark/85 rounded-2xl px-4 py-3 shadow-md max-w-[250px] text-center"
            >
              <p className="text-[11px] font-bold text-art-dark leading-snug font-serif italic">
                "{bubbleText}"
              </p>
              {/* speech bubble triangle pointers */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-white" />
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-[9px] border-x-transparent border-t-[9px] border-t-art-dark/85 -z-10" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ground scenery plants that change base status */}
        <div className="absolute bottom-2 inset-x-0 h-8 rounded-full bg-black/5 flex items-center justify-center">
          {/* Ground environment visual representation */}
          <div className="w-full h-full flex justify-around items-end px-4">
            {stateGroup === 'excellent' && (
              <>
                <span className="text-xl animate-bounce">🌸</span>
                <span className="text-2xl">🌱</span>
                <span className="text-base">🌼</span>
                <span className="text-2xl animate-pulse">🌱</span>
                <span className="text-xl">🍁</span>
              </>
            )}
            {stateGroup === 'good' && (
              <>
                <span className="text-md opacity-80">🌱</span>
                <span className="text-lg">🌿</span>
                <span className="text-sm opacity-80">🌱</span>
                <span className="text-lg">🌿</span>
              </>
            )}
            {stateGroup === 'moderate' && (
              <>
                <span className="text-sm opacity-60">🍃</span>
                <span className="text-md opacity-40">🍂</span>
                <span className="text-xs text-amber-800 opacity-60">🌾</span>
              </>
            )}
            {stateGroup === 'high' && (
              <>
                <span className="text-xs grayscale opacity-40">🍂</span>
                <span className="text-xs text-stone-600">🪨</span>
              </>
            )}
            {stateGroup === 'critical' && (
              <>
                <span className="text-sm opacity-20">🥀</span>
                <span className="text-sm text-stone-800 opacity-90">💨</span>
                <span className="text-xs text-zinc-700">🪨</span>
              </>
            )}
          </div>
        </div>

        {/* Floating Tap Particles */}
        <AnimatePresence>
          {particles.map(p => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, scale: 0.5, x: p.x, y: p.y }}
              animate={{ opacity: 0, scale: 2, y: p.y - 120, x: p.x + (Math.random() - 0.5) * 45 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, ease: "easeOut" }}
              className="absolute z-40 text-2xl pointer-events-none select-none"
            >
              {p.char}
            </motion.span>
          ))}
        </AnimatePresence>

        {/* The Animated SVG Character Wrapper */}
        <motion.div
          animate={customAnimate}
          transition={customTransition}
          onClick={handleTapPet}
          className="relative w-44 h-44 z-20 cursor-pointer select-none active:scale-95 transition-transform"
          title="Click to interact with Sprout!"
        >
          {/* Virtual Buddy Body Vector Design */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
            
            {/* Background Woods Equip accessory */}
            {hasAccessory('Background Woods') && (
              <g id="bg-woods-group" opacity="0.6">
                <circle cx="20" cy="30" r="12" fill="#86efac" />
                <rect x="18" y="28" width="4" height="20" fill="#78350f" />
                <circle cx="80" cy="35" r="10" fill="#a7f3d0" />
                <rect x="78" y="33" width="4" height="15" fill="#78350f" />
              </g>
            )}

            {/* FLOWER POT (Ground Accent) */}
            {hasAccessory('Flower Pot') && (
              <path d="M 35,90 L 65,90 L 60,78 L 40,78 Z" fill="#d97706" stroke="#92400e" strokeWidth="2" />
            )}

            {/* GOLDEN CLOAK Accessory */}
            {hasAccessory('Golden Cloak') && (
              <path d="M 15,62 C 15,62 30,52 50,52 C 70,52 85,62 85,62 C 85,78 75,88 50,88 C 25,88 15,78 15,62 Z" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            )}

            {/* MAIN CHARACTER BODY */}
            {/* Shapely blob with cheeks and custom reactions */}
            <path 
              d="M 50,15 C 25,15 15,35 15,55 C 15,75 25,85 50,85 C 75,85 85,75 85,55 C 85,35 75,15 50,15 Z" 
              fill={bodyColor} 
              stroke={faceAccent} 
              strokeWidth="3.5"
            />

            {/* Dynamic Head Leaf */}
            {stateGroup === 'excellent' && (
              <g id="head-leaves" transform="translate(50, 15)">
                <path d="M 0,0 C -15,-15 -10,-30 0,-32 C 10,-30 15,-15 0,0" fill="#4ade80" stroke="#166534" strokeWidth="1.5" />
                <path d="M 0,0 C 15,-15 10,-30 0,-32 C -10,-30 -15,-15 0,0" fill="#22c55e" stroke="#166534" strokeWidth="1.5" />
                <line x1="0" y1="0" x2="0" y2="-30" stroke="#166534" strokeWidth="1.5" />
              </g>
            )}
            {stateGroup === 'good' && (
              <g id="head-leaf" transform="translate(50, 15)">
                <path d="M 0,0 C 12,-12 10,-24 0,-26 C -10,-24 -12,-12 0,0" fill="#14b8a6" stroke="#0f766e" strokeWidth="2" />
                <line x1="0" y1="0" x2="0" y2="-22" stroke="#0f766e" strokeWidth="1.5" />
              </g>
            )}
            {stateGroup === 'moderate' && (
              <path d="M 50,15 Q 56,2 62,10" stroke="#b45309" strokeWidth="3" fill="none" />
            )}
            {stateGroup === 'high' && (
              <path d="M 50,15 L 50,4 Q 52,0 52,15" stroke="#7c2d12" strokeWidth="2.5" fill="none" />
            )}
            {stateGroup === 'critical' && (
              <g transform="translate(48,5)">
                <line x1="0" y1="0" x2="4" y2="10" stroke="#292524" strokeWidth="3" />
                <circle cx="2" cy="0" r="1.5" fill="#f43f5e" />
              </g>
            )}

            {/* EYE PAIRINGS */}
            <g id="eyes-group">
              {activeReaction ? (
                <>
                  {activeReaction === 'giggle' && (
                    <>
                      {/* Happy curved eyes ^ ^ */}
                      <path d="M 23,48 Q 31,38 39,48" fill="none" stroke={faceAccent} strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M 61,48 Q 69,38 77,48" fill="none" stroke={faceAccent} strokeWidth="4.5" strokeLinecap="round" />
                    </>
                  )}
                  {activeReaction === 'wink' && (
                    <>
                      {/* Left standard eye, right wink arch */}
                      <circle cx="33" cy="46" r="5" fill="#1e293b" />
                      <circle cx="31" cy="44" r="2" fill="#ffffff" />
                      <path d="M 61,48 Q 67,54 73,48" fill="none" stroke="#1e293b" strokeWidth="4.5" strokeLinecap="round" />
                    </>
                  )}
                  {activeReaction === 'surprise' && (
                    <>
                      {/* Wide round startled eyes */}
                      <circle cx="33" cy="45" r="7.5" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
                      <circle cx="33" cy="45" r="3" fill={faceAccent} />
                      <circle cx="67" cy="45" r="7.5" fill="#ffffff" stroke="#1e293b" strokeWidth="2.5" />
                      <circle cx="67" cy="45" r="3" fill={faceAccent} />
                    </>
                  )}
                  {activeReaction === 'love' && (
                    <>
                      {/* Floating glowing heart eyes */}
                      <path d="M 33,49 L 29,44 A 3.2,3.2 0 0,1 33,39 A 3.2,3.2 0 0,1 37,44 Z" fill="#f43f5e" stroke="#9f1239" strokeWidth="1" />
                      <path d="M 67,49 L 63,44 A 3.2,3.2 0 0,1 67,39 A 3.2,3.2 0 0,1 71,44 Z" fill="#f43f5e" stroke="#9f1239" strokeWidth="1" />
                    </>
                  )}
                  {activeReaction === 'hero' && (
                    <>
                      {/* Serious, focused, energetic eyes with angled action eyebrows */}
                      <circle cx="33" cy="46" r="4.5" fill="#1e293b" />
                      <path d="M 23,38 L 40,43" stroke={faceAccent} strokeWidth="3.5" strokeLinecap="round" />
                      <circle cx="67" cy="46" r="4.5" fill="#1e293b" />
                      <path d="M 77,38 L 60,43" stroke={faceAccent} strokeWidth="3.5" strokeLinecap="round" />
                    </>
                  )}
                  {activeReaction === 'sleepy' && (
                    <>
                      {/* Cozy closed down sleeping curves */}
                      <path d="M 26,46 Q 33,52 40,46" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                      <path d="M 60,46 Q 67,52 74,46" fill="none" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Standard state-driven visual styles */}
                  {stateGroup === 'excellent' && (
                    <>
                      {/* Left Starry Eye */}
                      <path d="M 30,40 L 35,45 L 30,50 L 25,45 Z" fill="#ffffff" />
                      <circle cx="30" cy="45" r="1.5" fill="#15803d" />
                      {/* Right Starry Eye */}
                      <path d="M 70,40 L 75,45 L 70,50 L 65,45 Z" fill="#ffffff" />
                      <circle cx="70" cy="45" r="1.5" fill="#15803d" />
                    </>
                  )}
                  
                  {/* Healthy standard sweet eyes */}
                  {stateGroup === 'good' && (
                    <>
                      <circle cx="33" cy="46" r="5" fill="#1e293b" />
                      <circle cx="31" cy="44" r="2" fill="#ffffff" />
                      <circle cx="67" cy="46" r="5" fill="#1e293b" />
                      <circle cx="65" cy="44" r="2" fill="#ffffff" />
                    </>
                  )}

                  {/* Moderate worried flat eyes */}
                  {stateGroup === 'moderate' && (
                    <>
                      <ellipse cx="33" cy="46" rx="4.5" ry="3.5" fill="#1e293b" />
                      <circle cx="31" cy="45" r="1.5" fill="#ffffff" />
                      <ellipse cx="67" cy="46" rx="4.5" ry="3.5" fill="#1e293b" />
                      <circle cx="65" cy="45" r="1.5" fill="#ffffff" />
                      {/* Worried tilted eyebrows */}
                      <path d="M 28,38 L 38,40" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 72,38 L 62,40" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  )}

                  {/* High impact sad downcast eyes */}
                  {stateGroup === 'high' && (
                    <>
                      <path d="M 27,48 Q 33,42 39,48" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M 61,48 Q 67,42 73,48" stroke="#7c2d12" strokeWidth="3" fill="none" strokeLinecap="round" />
                      {/* Sad eyebrows */}
                      <path d="M 25,41 L 35,37" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 75,41 L 65,37" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" />
                    </>
                  )}

                  {/* Critical closed pain-eyes */}
                  {stateGroup === 'critical' && (
                    <>
                      {/* Left X eye */}
                      <path d="M 28,42 L 36,50 M 36,42 L 28,50" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
                      {/* Right X eye */}
                      <path d="M 64,42 L 72,50 M 72,42 L 64,50" stroke="#1c1917" strokeWidth="3" strokeLinecap="round" />
                      {/* Sweat droplets */}
                      <path d="M 78,42 Q 81,46 78,48" stroke="#38bdf8" strokeWidth="2" fill="none" />
                    </>
                  )}
                </>
              )}
            </g>

            {/* CHEEK SHADOW BLUSHES */}
            <g id="cheeks">
              <circle cx="25" cy="53" r="5" fill={activeReaction === 'love' || activeReaction === 'giggle' ? '#f43f5e' : cheekColor} opacity={activeReaction === 'love' || activeReaction === 'giggle' ? '0.8' : '0.6'} />
              <circle cx="75" cy="53" r="5" fill={activeReaction === 'love' || activeReaction === 'giggle' ? '#f43f5e' : cheekColor} opacity={activeReaction === 'love' || activeReaction === 'giggle' ? '0.8' : '0.6'} />
            </g>

            {/* MOUTH CONFIGURATIONS */}
            <g id="mouth-group">
              {isSpeaking || isLocalSpeaking ? (
                // Lip-sync animated mouth talking
                <motion.ellipse 
                  cx="50" 
                  cy={stateGroup === 'high' || stateGroup === 'critical' ? '61' : '58'} 
                  rx="6" 
                  animate={{ ry: [1.5, 6.5, 1.5] }}
                  transition={{ repeat: Infinity, duration: 0.22, ease: "easeInOut" }}
                  fill="#fda4af" 
                  stroke={faceAccent} 
                  strokeWidth="2.5" 
                />
              ) : activeReaction ? (
                <>
                  {activeReaction === 'giggle' && (
                    // Wide happy laughing open mouth
                    <path d="M 38,55 Q 50,75 62,55 Z" fill="#fda4af" stroke={faceAccent} strokeWidth="3" />
                  )}
                  {activeReaction === 'wink' && (
                    <>
                      <path d="M 42,56 Q 49,63 56,58" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
                      <path d="M 46,58 Q 50,65 54,58 Z" fill="#f43f5e" />
                    </>
                  )}
                  {activeReaction === 'surprise' && (
                    // Shocked small circular mouth
                    <circle cx="50" cy="62" r="5.5" fill="#1e293b" />
                  )}
                  {activeReaction === 'love' && (
                    // Heart-warming snug smile line
                    <path d="M 42,57 Q 50,65 58,57" stroke="#9f1239" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  )}
                  {activeReaction === 'hero' && (
                    // Determined confident thin side smile
                    <path d="M 40,58 Q 50,58 55,54" stroke="#1e293b" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  )}
                  {activeReaction === 'sleepy' && (
                    // Cozy low sleeping yawn circle
                    <circle cx="50" cy="58" r="3" fill="#1e293b" />
                  )}
                </>
              ) : (
                <>
                  {stateGroup === 'excellent' && (
                    // Full happy laughing open mouth
                    <path d="M 40,55 Q 50,70 60,55 Z" fill="#fda4af" stroke="#15803d" strokeWidth="2" />
                  )}
                  {stateGroup === 'good' && (
                    // Gentle content smiling stroke
                    <path d="M 42,56 Q 50,65 58,56" stroke="#115e59" strokeWidth="3" fill="none" strokeLinecap="round" />
                  )}
                  {stateGroup === 'moderate' && (
                    // Straight horizontal worried line
                    <line x1="44" y1="58" x2="56" y2="58" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
                  )}
                  {stateGroup === 'high' && (
                    // Frowning downcast curved line
                    <path d="M 44,61 Q 50,54 56,61" stroke="#7c2d12" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  )}
                  {stateGroup === 'critical' && (
                    // Coughing circular mouth hole with distress outline
                    <circle cx="50" cy="61" r="5" fill="#292524" stroke="#1c1917" strokeWidth="2.5" />
                  )}
                </>
              )}
            </g>

            {/* ACCESSORY SPECIFICS (Layered on top of base head) */}
            
            {/* ECO CROWN Accessory */}
            {hasAccessory('Eco Crown') && (
              <g id="crown-group">
                <path d="M 30,17 L 35,5 L 50,14 L 65,5 L 70,17 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="35" cy="3" r="2" fill="#22c55e" />
                <circle cx="50" cy="11" r="2" fill="#3b82f6" />
                <circle cx="65" cy="3" r="2" fill="#ef4444" />
                <rect x="29" y="15" width="42" height="4" fill="#ca8a04" rx="1.5" />
              </g>
            )}

            {/* CUTE HAT Accessory */}
            {hasAccessory('Cute Hat') && (
              <g id="hat-group">
                {/* Red baseball cap style hat */}
                <ellipse cx="50" cy="16" rx="28" ry="10" fill="#ef4444" />
                <path d="M 48,16 C 65,16 88,14 88,24 C 88,28 72,26 48,26 Z" fill="#dc2626" />
                <rect x="42" y="6" width="16" height="4" rx="1" fill="#ffffff" />
              </g>
            )}

            {/* TINY SUNGLASSES Accessory */}
            {hasAccessory('Tiny Sunglasses') && (
              <g id="sunglasses-group">
                <rect x="23" y="41" width="18" height="10" rx="4" fill="#0f172a" />
                <rect x="59" y="41" width="18" height="10" rx="4" fill="#0f172a" />
                <line x1="41" y1="45" x2="59" y2="45" stroke="#0f172a" strokeWidth="3" />
                <line x1="18" y1="45" x2="23" y2="45" stroke="#0f172a" strokeWidth="2" />
                <line x1="77" y1="45" x2="82" y2="45" stroke="#0f172a" strokeWidth="2" />
              </g>
            )}

            {/* MONOCLES Accessory */}
            {hasAccessory('Monocles') && (
              <g id="monocles-group">
                <circle cx="67" cy="46" r="10" stroke="#facc15" strokeWidth="3.5" fill="none" />
                <line x1="77" y1="46" x2="88" y2="40" stroke="#facc15" strokeWidth="2" />
              </g>
            )}

          </svg>
        </motion.div>
      </div>

      {/* Interactive Environment & Scenery Theme Swaps */}
      <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-art-border/80 mt-4 z-10">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-art-olive">Scenery Habitat Theme</span>
            <span className="text-[10px] font-mono font-bold text-art-dark">Ambient Audio Ready</span>
          </div>
          
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'forest', label: '🌲 Forest', bg: 'from-emerald-50 to-green-100', desc: 'Soothes Sprout with fresh oxygen flows.' },
              { id: 'office', label: '🏠 Room', bg: 'from-stone-50 to-orange-100/60', desc: 'cozy indoor workspace settings.' },
              { id: 'dome', label: '🌐 Dome', bg: 'from-sky-50 to-emerald-50', desc: 'Futuristic atmospheric bio-barrier.' },
              { id: 'meadow', label: '☀️ Meadow', bg: 'from-yellow-50 to-amber-100/70', desc: 'Sunny open fields for energy accumulation.' }
            ].map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  try {
                    // Quick scenery feedback tone
                    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioCtx) {
                      const ctx = new AudioCtx();
                      const osc = ctx.createOscillator();
                      const gain = ctx.createGain();
                      osc.connect(gain);
                      gain.connect(ctx.destination);
                      osc.frequency.setValueAtTime(theme.id === 'forest' ? 523 : theme.id === 'office' ? 440 : theme.id === 'dome' ? 659 : 587, ctx.currentTime);
                      gain.gain.setValueAtTime(0.04, ctx.currentTime);
                      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                      osc.start();
                      osc.stop(ctx.currentTime + 0.15);
                    }
                  } catch (e) {}
                  playCuteSound('wink');
                }}
                className="px-1.5 py-2 text-[10px] font-bold rounded-lg border border-art-border bg-white hover:bg-slate-50 transition-all cursor-pointer text-center text-art-dark focus:ring-2 focus:ring-art-sage"
                title={theme.desc}
                aria-label={`Switch scenery theme to ${theme.label}`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Companion Emotional State Index */}
      <div className="w-full bg-white/90 rounded-2xl p-4 border border-art-border mt-4 z-10 shadow-xs">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-art-olive block mb-3 border-b border-art-border pb-1.5">
          Sprout Vitality & Emotional Indicators
        </span>

        <div className="grid grid-cols-4 gap-2 text-center">
          
          <div className="space-y-1">
            <div className="mx-auto w-10 h-10 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center font-bold text-xs text-emerald-800">
              {score}%
            </div>
            <span className="text-[10px] font-extrabold text-art-dark block">Happiness</span>
          </div>

          <div className="space-y-1">
            <div className="mx-auto w-10 h-10 rounded-full border-2 border-indigo-500 bg-indigo-50 flex items-center justify-center font-bold text-xs text-indigo-800">
              {Math.min(100, Math.round(score * 1.08))}%
            </div>
            <span className="text-[10px] font-extrabold text-art-dark block">Oxygen Purity</span>
          </div>

          <div className="space-y-1">
            <div className="mx-auto w-10 h-10 rounded-full border-2 border-blue-500 bg-blue-50 flex items-center justify-center font-bold text-xs text-blue-800">
              {score >= 50 ? '92%' : '45%'}
            </div>
            <span className="text-[10px] font-extrabold text-art-dark block">Hydration</span>
          </div>

          <div className="space-y-1">
            <div className="mx-auto w-10 h-10 rounded-full border-2 border-amber-500 bg-amber-50 flex items-center justify-center font-bold text-xs text-amber-800">
              {score >= 80 ? '98%' : score >= 60 ? '80%' : score >= 40 ? '62%' : '20%'}
            </div>
            <span className="text-[10px] font-extrabold text-art-dark block">Energy</span>
          </div>

        </div>
      </div>

      {/* Bottom informational card metadata */}
      <div className="w-full text-center mt-4 z-10 bg-white/70 backdrop-blur-sm rounded-[20px] p-4 border border-art-border select-none">
        <p className="text-art-dark text-xs leading-relaxed font-sans font-semibold">
          {description}
        </p>
      </div>

    </div>
  );
}
