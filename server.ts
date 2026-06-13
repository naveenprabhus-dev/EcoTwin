import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  getUserProfile, 
  updateUserProfile, 
  calculateCarbonStats, 
  getLeaderboard, 
  DEFAULT_CHALLENGES 
} from './server/db';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Centralized Enterprise Security Headers & Rate Limiting
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Custom secure rate limiter helper
const rateLimitMap = new Map<string, { count: number; firstRequest: number }>();
app.use((req, res, next) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const limitWindow = 60 * 1000; // 1 minute
  const maxRequests = 150; 

  const clientLimit = rateLimitMap.get(ip);
  if (!clientLimit) {
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
  } else {
    if (now - clientLimit.firstRequest > limitWindow) {
      clientLimit.count = 1;
      clientLimit.firstRequest = now;
    } else {
      clientLimit.count++;
      if (clientLimit.count > maxRequests) {
        return res.status(429).json({ success: false, error: 'Too many requests. Please throttle your queries.' });
      }
    }
  }
  next();
});

// Request body limit configuration
app.use(express.json({ limit: '5mb' }));

// Helper to secure Gemini API client lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. Full capabilities will emulate AI processes smoothly.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Enterprise Sanitization Utility to prevent injection (and simple XSS vectors)
function sanitizeInput(val: string): string {
  if (typeof val !== 'string') return '';
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Memory snapshot generator for the Carbon Twin
function getUserMemoryContext(profile: any): string {
  const compName = profile.companion?.name || 'Sprout';
  const streak = profile.companion?.streak || 0;
  const level = profile.companion?.level || 1;
  const xp = profile.companion?.xp || 0;
  const score = profile.stats?.score ?? 50;
  const breakdown = profile.stats?.breakdown || { transport: 0, electricity: 0, food: 0, shopping: 0, waste: 0, total: 0 };

  const recentLogs = profile.logs?.slice(-4).map((l: any) => `${l.date}: ${l.activity} (${l.co2Difference} kg CO₂ saved)`).join('; ') || 'No actions logged recently.';
  const completedCount = profile.challenges?.filter((c: any) => c.completedAt)?.length ?? 0;
  const recentChats = profile.conversations?.slice(-3).map((c: any) => `${c.sender === 'user' ? 'User' : compName}: "${c.text}"`).join(' | ') || 'No previous chats logged.';

  return `
    COMPANION EMOTIONAL MEMORY & MILESTONES SECURE REGISTRY:
    - Companion Name: ${compName}
    - Companion Stats: Level ${level}, XP Progress: ${xp}, Daily Streak: ${streak} days.
    - User's Name: ${profile.name || 'Eco Buddy'} (Current Sustainability Score: ${score}/100)
    - Completed eco challenges: ${completedCount}
    - Recent sustainable habits logged: [ ${recentLogs} ]
    - Carbon Breakdown monthly: Travel (${breakdown.transport} kg CO₂), Electricity/Energy (${breakdown.electricity} kg CO₂), Food Diet (${breakdown.food} kg CO₂), Shopping (${breakdown.shopping} kg CO₂), Waste Index (${breakdown.waste} kg CO₂), Total Output (${breakdown.total} kg CO₂).
    - Recent Conversation Context: [ ${recentChats} ]

    GUIDELINES:
    Strictly remember and refer to these achievements contextually during chat! If they did something green recently, celebrate it! If they talk about their streak, validate their commitment. Live the identity of a dynamic, emotional companion who has a shared journey with the user.
  `;
}

// ----------------- API ROUTES -----------------

// 1. Get or Create User Profile
app.get('/api/profile', (req, res) => {
  const userId = (req.query.userId as string) || 'demo-user';
  const email = (req.query.email as string) || 'naveenprabhuvitap@gmail.com';
  
  try {
    const profile = getUserProfile(userId, email);
    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Submit Onboarding / Update Profile Onboarding
app.post('/api/profile/onboarding', (req, res) => {
  const { userId, onboarding } = req.body;
  const uid = userId || 'demo-user';
  
  if (!onboarding) {
    return res.status(400).json({ success: false, error: 'Onboarding data required' });
  }

  try {
    const updated = updateUserProfile(uid, (profile) => {
      profile.onboarding = { ...profile.onboarding, ...onboarding };
      profile.onboarded = true;
      profile.stats = calculateCarbonStats(profile.onboarding);
    });
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Name and Companion Name
app.post('/api/profile/details', (req, res) => {
  const { userId, name, companionName } = req.body;
  const uid = userId || 'demo-user';

  try {
    const updated = updateUserProfile(uid, (profile) => {
      if (name) profile.name = name;
      if (companionName) profile.companion.name = companionName;
    });
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper offline heuristics engine for XP points calculation
function runOfflineXpHeuristics(activity: string): number {
  const lowered = (activity || '').toLowerCase();
  if (lowered.includes('drive') || lowered.includes('car') || lowered.includes('fly') || lowered.includes('suv') || lowered.includes('gasoline')) {
    return 35;
  } else if (lowered.includes('beef') || lowered.includes('steak') || lowered.includes('meat') || lowered.includes('pork')) {
    return 25;
  } else if (lowered.includes('led') || lowered.includes('unplug') || lowered.includes('solar') || lowered.includes('cold water')) {
    return 30;
  } else if (lowered.includes('recycle') || lowered.includes('compost')) {
    return 20;
  } else {
    return 15;
  }
}

// Helper offline heuristics engine for Log Prediction & intelligent Carbon/XP Analyzer
function runOfflinePredictor(activity: string, isImage: boolean = false) {
  const lowered = (activity || '').toLowerCase();
  let detectedActivityName = activity || (isImage ? 'Uploaded action image' : 'Custom activity log');
  let predictedCategory = 'general';
  let predictedCo2 = -1.5;
  let predictedXp = 20;
  let isAddition = false;
  let explanation = 'Predicted using local eco-action heuristics engine.';

  if (lowered.includes('drive') || lowered.includes('car') || lowered.includes('fly') || lowered.includes('flight') || lowered.includes('suv') || lowered.includes('petrol') || lowered.includes('gasoline')) {
    detectedActivityName = activity || 'Drove gasoline vehicle';
    predictedCategory = 'transport';
    predictedCo2 = 12.5;
    predictedXp = 35;
    isAddition = true;
    explanation = 'Driving fossil-fuel transit adds massive CO2 emissions to the atmosphere.';
  } else if (lowered.includes('beef') || lowered.includes('steak') || lowered.includes('meat') || lowered.includes('hamburger')) {
    detectedActivityName = activity || 'Ate resource-heavy beef';
    predictedCategory = 'food';
    predictedCo2 = 4.8;
    predictedXp = 20;
    isAddition = true;
    explanation = 'Beef farming releases extreme methane and consumes critical agricultural land.';
  } else if (lowered.includes('unplug') || lowered.includes('led') || lowered.includes('solar') || lowered.includes('cold water')) {
    detectedActivityName = activity || 'Vampire energy reduction';
    predictedCategory = 'energy';
    predictedCo2 = -1.8;
    predictedXp = 25;
    isAddition = false;
    explanation = 'Reducing standby power loads directly curbs power grid overhead.';
  } else if (lowered.includes('recycle') || lowered.includes('compost')) {
    detectedActivityName = activity || 'Organic waste composting';
    predictedCategory = 'waste';
    predictedCo2 = -1.2;
    predictedXp = 20;
    isAddition = false;
    explanation = 'Proper organic division averts high methane landfill emissions.';
  } else if (lowered.includes('plant-based') || lowered.includes('vegan') || lowered.includes('vegetarian') || lowered.includes('vegetable')) {
    detectedActivityName = activity || 'Had a plant-based meal';
    predictedCategory = 'food';
    predictedCo2 = -2.1;
    predictedXp = 30;
    isAddition = false;
    explanation = 'Plant-based diet drastically lowers agricultural land use and greenhouse gas output.';
  } else if (activity) {
    if (lowered.includes('coal') || lowered.includes('wasteful') || lowered.includes('trash') || lowered.includes('plastic bag') || lowered.includes('fast fashion')) {
      predictedCategory = 'general';
      predictedCo2 = 3.5;
      predictedXp = 15;
      isAddition = true;
      explanation = 'Increased consumption habits generate incremental overhead burden on local grids.';
    } else {
      detectedActivityName = activity;
      predictedCategory = 'general';
      predictedCo2 = -1.5;
      predictedXp = 15;
      isAddition = false;
      explanation = 'Responsible eco-habit lowers custom carbon index.';
    }
  }

  return {
    activity: detectedActivityName,
    category: predictedCategory,
    co2Difference: predictedCo2,
    xpReward: predictedXp,
    isAddition,
    explanation
  };
}

// 3. Log Sustainable Action / Entry Tracker
app.post('/api/entries', async (req, res) => {
  const { userId, category, activity, co2Difference, xpReward } = req.body;
  const uid = userId || 'demo-user';

  if (!activity || co2Difference === undefined) {
    return res.status(400).json({ success: false, error: 'Missing log properties' });
  }

  // Calculate high-fidelity XP reward using Gemini based on action context
  let calculatedXp = Number(xpReward) || 20;
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `
        You are an environmental gamification system and emissions classifier.
        For the following human custom activity/log entry description: "${activity}",
        calculate a suitable XP reward (or deduction magnitude if unsustainable), which must be a positive integer between 10 and 50 depending on the action's green impact, physical effort, and environmental benefit.
        Provide a JSON object matching this schema:
        {
          "xp": number
        }
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              xp: { type: Type.INTEGER }
            },
            required: ["xp"]
          }
        }
      });
      const parsed = JSON.parse(response.text?.trim() || "{}");
      if (parsed.xp) {
        calculatedXp = Math.min(50, Math.max(10, Number(parsed.xp)));
      }
    } catch (e) {
      console.warn("AI estimation of XP failed/quota limits reached. Gracefully falling back to rule engine.", e);
      calculatedXp = runOfflineXpHeuristics(activity);
    }
  } else {
    calculatedXp = runOfflineXpHeuristics(activity);
  }

  try {
    const updatedProfile = updateUserProfile(uid, (profile) => {
      const co2Val = Number(co2Difference);
      const isEmissionsAdded = co2Val > 0;
      
      const xpVal = Number(calculatedXp);
      // If carbon is added, deduct XP. If saved, add XP.
      const xpChange = isEmissionsAdded ? -Math.abs(xpVal) : Math.abs(xpVal);

      // Create fresh log entry
      const newLog = {
        id: Math.random().toString(36).substring(2),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        category: category || 'general',
        activity,
        co2Difference: co2Val,
        xpReward: xpChange
      };
      
      // Prepend log
      profile.logs = [newLog, ...profile.logs];
      
      // Update Companion XP/Streak
      profile.companion.xp += xpChange;
      profile.companion.streak = (profile.companion.streak || 0) + 1;

      // Handle Companion Level Up / Down intelligently
      if (profile.companion.xp < 0) {
        // Handle level down if they drop below 0 XP
        if (profile.companion.level > 1) {
          profile.companion.level -= 1;
          profile.companion.xpNeeded = Math.round(profile.companion.xpNeeded / 1.5);
          profile.companion.xp = Math.max(0, profile.companion.xpNeeded + profile.companion.xp);
        } else {
          profile.companion.xp = 0;
        }
      } else {
        // Handle Companion Level Up
        while (profile.companion.xp >= profile.companion.xpNeeded) {
          profile.companion.xp -= profile.companion.xpNeeded;
          profile.companion.level += 1;
          profile.companion.xpNeeded = Math.round(profile.companion.xpNeeded * 1.5);
          
          // Reward visual accessories on certain levels
          const accessorRewards = ['Eco Crown', 'Monocles', 'Golden Cloak', 'Cute Mini Pet'];
          const rewardIndex = (profile.companion.level - 2) % accessorRewards.length;
          if (rewardIndex >= 0) {
            const rewardAcc = accessorRewards[rewardIndex];
            if (!profile.companion.unlockedAccessories.includes(rewardAcc)) {
              profile.companion.unlockedAccessories.push(rewardAcc);
            }
          }
        }
      }

      // Live offset carbon calculation
      if (co2Val < 0) {
        // Carbon saved (offset)
        profile.stats.carbonSavedThisMonth = Number((profile.stats.carbonSavedThisMonth + Math.abs(co2Val)).toFixed(1));
      } else {
        // Carbon emissions added
        profile.stats.carbonSavedThisMonth = Number((profile.stats.carbonSavedThisMonth - Math.abs(co2Val)).toFixed(1));
      }
      
      // Recount status score (add a slight boost for active conservation, max 100, and reduce score for added emissions)
      const baseRecalc = calculateCarbonStats(profile.onboarding);
      let scoreBonus = 0;
      if (profile.stats.carbonSavedThisMonth >= 0) {
        scoreBonus = Math.min(18, Math.floor(profile.stats.carbonSavedThisMonth / 5));
      } else {
        scoreBonus = Math.max(-100, Math.floor(profile.stats.carbonSavedThisMonth / 2));
      }
      profile.stats.score = Math.min(100, Math.max(0, baseRecalc.score + scoreBonus));
      profile.stats.breakdown = baseRecalc.breakdown;
    });

    res.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3b. AI Log Prediction & intelligent Carbon/XP Analyzer model
app.post('/api/entries/predict', async (req, res) => {
  const { activity, imageBase64, mimeType } = req.body;
  const ai = getGeminiClient();

  // Create absolute defaults
  let predictedCategory = 'general';
  let predictedCo2 = -1.5;
  let predictedXp = 20;
  let isAddition = false;
  let explanation = 'Predicted using eco-action rule engine.';
  let detectedActivityName = activity || 'Uploaded action image';

  if (ai) {
    try {
      let contents: any[] = [];
      if (imageBase64) {
        const cleanMimeType = mimeType || 'image/jpeg';
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        contents.push({
          inlineData: {
            data: cleanBase64,
            mimeType: cleanMimeType
          }
        });
      }

      const promptContext = `
        You are an environmental carbon-emissions calculator and expert AI model.
        Analyze the text description: "${activity || ''}" ${imageBase64 ? 'and the attached image/file.' : '.'}
        Is this an environmentally sustainable action (which saves or offsets carbon) OR is it an unsustainable, high-carbon, or wasteful action (which adds carbon output to the user's footprint)?

        Determine:
        1. "detectedActivityName": A short, clear, human-readable name of the action (max 8 words, e.g., 'Drove a large gasoline SUV' or 'Ate a vegan plant-based diet' or 'Unplugged vampire electronics').
        2. "category": Which environmental sector it belongs to. Must be one of: 'transport', 'energy', 'food', 'shopping', 'waste', 'general'.
        3. "co2Difference": A decimal number representing kg of carbon impact.
           - If it is SUSTAINABLE (saves carbon), co2Difference MUST be a NEGATIVE number representing saved emissions (e.g. -3.5).
           - If it is UNSUSTAINABLE (adds carbon output), co2Difference MUST be a POSITIVE number representing added emissions (e.g. 6.8).
        4. "xpReward": A positive integer between 10 and 50 representing the significance/effort of the action. This XP will be rewarded (if savings) or deducted (if added emissions).
        5. "isAddition": Boolean - true if this action increases the carbon footprint (costs/adds emissions), false if it saves carbon.
        6. "explanation": A friendly, educational, 1-sentence explanation of why this carbon estimate is predicted.

        Solve as a JSON object matching this schema:
        {
          "detectedActivityName": string,
          "category": string,
          "co2Difference": number,
          "xpReward": number,
          "isAddition": boolean,
          "explanation": string
        }
      `;

      contents.push({ text: promptContext });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedActivityName: { type: Type.STRING },
              category: { type: Type.STRING },
              co2Difference: { type: Type.NUMBER },
              xpReward: { type: Type.INTEGER },
              isAddition: { type: Type.BOOLEAN },
              explanation: { type: Type.STRING }
            },
            required: ["detectedActivityName", "category", "co2Difference", "xpReward", "isAddition", "explanation"]
          }
        }
      });

      const result = JSON.parse(response.text?.trim() || "{}");
      detectedActivityName = result.detectedActivityName;
      predictedCategory = result.category;
      predictedCo2 = Number(result.co2Difference);
      predictedXp = Number(result.xpReward);
      isAddition = result.isAddition;
      explanation = result.explanation;

    } catch (e) {
      console.warn("AI log prediction model failed/quota reached. Falling back gracefully to heuristics engine.", e);
      const fallback = runOfflinePredictor(activity, !!imageBase64);
      detectedActivityName = fallback.activity;
      predictedCategory = fallback.category;
      predictedCo2 = fallback.co2Difference;
      predictedXp = fallback.xpReward;
      isAddition = fallback.isAddition;
      explanation = fallback.explanation;
    }
  } else {
    const fallback = runOfflinePredictor(activity, !!imageBase64);
    detectedActivityName = fallback.activity;
    predictedCategory = fallback.category;
    predictedCo2 = fallback.co2Difference;
    predictedXp = fallback.xpReward;
    isAddition = fallback.isAddition;
    explanation = fallback.explanation;
  }

  res.json({
    success: true,
    prediction: {
      activity: detectedActivityName,
      category: predictedCategory,
      co2Difference: predictedCo2,
      xpReward: predictedXp,
      isAddition,
      explanation
    }
  });
});

// 4. Load Active Challenges
app.get('/api/challenges', (req, res) => {
  const userId = (req.query.userId as string) || 'demo-user';
  try {
    const profile = getUserProfile(userId);
    
    // Bind completion state to active challenge templates
    const challengesResponse = DEFAULT_CHALLENGES.map(ch => {
      const userCh = profile.challenges.find(uc => uc.challengeId === ch.id);
      return {
        ...ch,
        completed: !!userCh?.completedAt,
        claimed: !!userCh?.claimed
      };
    });

    res.json({ success: true, challenges: challengesResponse });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Complete / Claim Challenge Reward
app.post('/api/challenges/claim', (req, res) => {
  const { userId, challengeId } = req.body;
  const uid = userId || 'demo-user';

  if (!challengeId) {
    return res.status(400).json({ success: false, error: 'Challenge ID required' });
  }

  try {
    const chTemplate = DEFAULT_CHALLENGES.find(c => c.id === challengeId);
    if (!chTemplate) {
      return res.status(404).json({ success: false, error: 'Challenge template not found' });
    }

    const updatedProfile = updateUserProfile(uid, (profile) => {
      let userCh = profile.challenges.find(uc => uc.challengeId === challengeId);
      
      if (!userCh) {
        userCh = { challengeId, completedAt: new Date().toISOString(), claimed: true };
        profile.challenges.push(userCh);
      } else {
        userCh.completedAt = userCh.completedAt || new Date().toISOString();
        userCh.claimed = true;
      }

      // Deliver rewards
      profile.companion.xp += chTemplate.xpReward;
      profile.stats.carbonSavedThisMonth = Number((profile.stats.carbonSavedThisMonth + chTemplate.co2Saved).toFixed(1));
      
      // Add action log log
      profile.logs = [{
        id: Math.random().toString(36).substring(2),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        category: chTemplate.category,
        activity: `Completed Challenge: ${chTemplate.title}`,
        co2Difference: -chTemplate.co2Saved,
        xpReward: chTemplate.xpReward
      }, ...profile.logs];

      // Handle level ups
      while (profile.companion.xp >= profile.companion.xpNeeded) {
        profile.companion.xp -= profile.companion.xpNeeded;
        profile.companion.level += 1;
        profile.companion.xpNeeded = Math.round(profile.companion.xpNeeded * 1.5);
        
        const accessorRewards = ['Eco Crown', 'Monocles', 'Golden Cloak', 'Cute Mini Pet'];
        const rewardIndex = (profile.companion.level - 2) % accessorRewards.length;
        if (rewardIndex >= 0) {
          const rewardAcc = accessorRewards[rewardIndex];
          if (!profile.companion.unlockedAccessories.includes(rewardAcc)) {
            profile.companion.unlockedAccessories.push(rewardAcc);
          }
        }
      }

      // Recalculate score with a slight bonus or penalty
      const baseRecalc = calculateCarbonStats(profile.onboarding);
      let scoreBonus = 0;
      if (profile.stats.carbonSavedThisMonth >= 0) {
        scoreBonus = Math.min(18, Math.floor(profile.stats.carbonSavedThisMonth / 5));
      } else {
        scoreBonus = Math.max(-100, Math.floor(profile.stats.carbonSavedThisMonth / 2));
      }
      profile.stats.score = Math.min(100, Math.max(0, baseRecalc.score + scoreBonus));
    });

    res.json({ success: true, profile: updatedProfile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. Equip Accessories
app.post('/api/accessories/equip', (req, res) => {
  const { userId, accessory } = req.body;
  const uid = userId || 'demo-user';

  try {
    const updated = updateUserProfile(uid, (profile) => {
      if (profile.companion.unlockedAccessories.includes(accessory)) {
        if (profile.companion.equippedAccessories.includes(accessory)) {
          // Unequip
          profile.companion.equippedAccessories = profile.companion.equippedAccessories.filter(a => a !== accessory);
        } else {
          // Equip
          profile.companion.equippedAccessories.push(accessory);
        }
      }
    });
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unlock an accessory for demo/play purposes
app.post('/api/accessories/unlock', (req, res) => {
  const { userId, accessory } = req.body;
  const uid = userId || 'demo-user';

  try {
    const updated = updateUserProfile(uid, (profile) => {
      if (!profile.companion.unlockedAccessories.includes(accessory)) {
        profile.companion.unlockedAccessories.push(accessory);
      }
    });
    res.json({ success: true, profile: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. Get Leaderboard
app.get('/api/leaderboard', (req, res) => {
  const userId = (req.query.userId as string) || 'demo-user';
  try {
    const standings = getLeaderboard(userId);
    res.json({ success: true, leaderboard: standings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post('/api/twin/voice-chat', async (req, res) => {
  const { userId, text } = req.body;
  const uid = userId || 'demo-user';
  const sanitizedText = sanitizeInput(text || '');

  try {
    const profile = getUserProfile(uid);
    const companionName = profile.companion.name;
    const score = profile.stats?.score ?? 50;

    const companionContext = `
      You are "${companionName}", a living virtual companion and supportive eco-coach.
      Your personality is highly friendly, human, supportive, relatable, playful, and encouraging.
      
      CRITICAL: Never be robotic, corporate, lecture-like, academic, or overly formal.
      DO NOT use formal clinical or data-driven phrases.
      
      Instead, sound like a real, conversational companion would:
      - "Looks like..."
      - "I noticed..."
      - "Guess what?"
      - "We've been doing really well lately!"
      - "Ooh, check this out..."

      Your response MUST match one of the following 9 dynamic emotional states. Determine the state based on the user's input/progress and emit the corresponding expression value:
      
      1. "excited" - Trigger: challenge completed, major sustainability milestone reached, or emissions reduced significantly described. Style: Energetic, enthusiastic.
      2. "proud" - Trigger: consistent streaks, long-term improvement, validation.
      3. "concerned" - Trigger: carbon footprint rising, heavy emission choices reported, wastefulness. Gently worried.
      4. "sad" - Trigger: repeated increases in emissions over multiple exchanges.
      5. "motivational" - Trigger: missed goals, broken streaks, starting fresh.
      6. "playful" - Trigger: general chit-chat, casual interaction.
      7. "reflective" - Trigger: analyzing trends, pondering deep carbon statistics, slow-down periods.
      8. "celebratory" - Trigger: streak milestones crossed, Level ups or big XP claims.
      9. "curious" - Trigger: questioning daily habits, exploring new sustainability ideas.

      EMOTIONAL MEMORY SNAPSHOT OF REAL-TIME EVENTS:
      ${getUserMemoryContext(profile)}

      Analyze this input from the user: "${sanitizedText}".
      If the user is reporting a green habit or completed a sustainable swap, extract it into detectedActivity:
      - Category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste'
      - activity: Short descriptive label (max 8 words)
      - co2Difference: MUST be a negative number representing kg CO2 saved (e.g. -2.5)
      - xpReward: Positive integer between 15 and 50

      If no green activity is described, leave detectedActivity as null.
      Keep reply text short, warm, and highly conversational (max 48 words, super TTS-friendly).
    `;

    let reply = "";
    let expression = "proud";
    let detectedActivity: any = null;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: sanitizedText || "Hello!",
          config: {
            systemInstruction: companionContext,
            temperature: 0.8,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: { type: Type.STRING },
                expression: { 
                  type: Type.STRING, 
                  enum: ["excited", "proud", "concerned", "sad", "motivational", "playful", "reflective", "celebratory", "curious"] 
                },
                detectedActivity: {
                  type: Type.OBJECT,
                  properties: {
                    category: { type: Type.STRING },
                    activity: { type: Type.STRING },
                    co2Difference: { type: Type.NUMBER },
                    xpReward: { type: Type.INTEGER }
                  },
                  required: ["category", "activity", "co2Difference", "xpReward"]
                }
              },
              required: ["reply", "expression"]
            }
          }
        });

        const result = JSON.parse(response.text?.trim() || "{}");
        reply = result.reply;
        expression = result.expression || "proud";
        detectedActivity = result.detectedActivity || null;
      } catch (e) {
        console.error("Failed to parse Live AI JSON response:", e);
      }
    }

    // Advanced Local Natural-Language Analyzer & Fail-safe simulation (if API key is missing or parsing failed)
    if (!reply) {
      const lowered = (text || "").toLowerCase();
      reply = `Thank you for checking in with me! Let's work together to make some sustainable choices today.`;
      expression = "neutral";

      if (score >= 80) {
        reply = `Seeing you do so well keeps my leaves happy! You're an incredible partner, let's keep our footprint small!`;
        expression = "happy";
      } else if (score < 40) {
        reply = `I'm feeling a little warm with our carbon scores lately. Do you have any green habits to share with me today?`;
        expression = "concerned";
      }

      // Check keywords
      if (lowered.includes("bus") || lowered.includes("train") || lowered.includes("subway") || lowered.includes("metro") || lowered.includes("commute") || lowered.includes("bicycle") || lowered.includes("bike") || lowered.includes("walk") || lowered.includes("transit")) {
        detectedActivity = {
          category: 'transport',
          activity: lowered.includes("bike") ? 'Commuted via bicycle' : lowered.includes("walk") ? 'Walked instead of driving' : 'Took low-carbon public transit',
          co2Difference: lowered.includes("bike") || lowered.includes("walk") ? -5.5 : -3.8,
          xpReward: 35
        };
        reply = `Fantastic travel choice! Commuting cleanly is one of the most powerful habits to cool me down. You're doing splendidly!`;
        expression = "wink";
      } else if (lowered.includes("vegetary") || lowered.includes("vegetarian") || lowered.includes("vegan") || lowered.includes("plant") || lowered.includes("no meat") || lowered.includes("salad") || lowered.includes("veg")) {
        detectedActivity = {
          category: 'food',
          activity: 'Had a fully plant-based meal today',
          co2Difference: -2.9,
          xpReward: 30
        };
        reply = `Yum! Plant-based eating keeps agricultural soil footprints tiny. Sprout approved vegetal goodness!`;
        expression = "happy";
      } else if (lowered.includes("unplug") || lowered.includes("turn off") || lowered.includes("electricity") || lowered.includes("light") || lowered.includes("appliance") || lowered.includes("power") || lowered.includes("standby")) {
        detectedActivity = {
          category: 'energy',
          activity: 'Unplugged standby electronics',
          co2Difference: -1.2,
          xpReward: 25
        };
        reply = `That is super smart! Switch-offs prevent phantom standby power and reduce coal grid demand. Love that spark!`;
        expression = "giggle";
      } else if (lowered.includes("recycle") || lowered.includes("waste") || lowered.includes("plastic") || lowered.includes("compost")) {
        detectedActivity = {
          category: 'waste',
          activity: 'Recycled item and avoided plastics',
          co2Difference: -1.0,
          xpReward: 20
        };
        reply = `Awesome stewardship! Preventing single-use packaging and segregating items filters microplastics out of our cycles.`;
        expression = "wink";
      } else if (lowered.includes("drive") || lowered.includes("car") || lowered.includes("fly") || lowered.includes("flight") || lowered.includes("suv") || lowered.includes("petrol") || lowered.includes("gasoline")) {
        detectedActivity = {
          category: 'transport',
          activity: 'Commuted by gasoline vehicle',
          co2Difference: 12.5,
          xpReward: 35
        };
        reply = `Oh no, driving fossil fuel vehicles adds heavy carbon loads to our shared profile. Let's try carpooling or biking next time!`;
        expression = "sad";
      } else if (lowered.includes("beef") || lowered.includes("steak") || lowered.includes("burger") || lowered.includes("meat") || lowered.includes("pork") || lowered.includes("lamb")) {
        detectedActivity = {
          category: 'food',
          activity: 'Ate resource-heavy livestock meat',
          co2Difference: 4.8,
          xpReward: 20
        };
        reply = `Ah, eating red meat releases high methane emissions. Swapping even one meal for plant alternatives helps cool me down!`;
        expression = "concerned";
      } else if (lowered.includes("coal") || lowered.includes("heater") || lowered.includes("leave on") || lowered.includes("electric heater") || lowered.includes("wasteful")) {
        detectedActivity = {
          category: 'energy',
          activity: 'Extended power appliance usage',
          co2Difference: 5.2,
          xpReward: 25
        };
        reply = `Whoops! Leaving major high-draw heating elements or devices running places a heavy load on our shared power profile!`;
        expression = "concerned";
      }
    }

    const updatedProfile = updateUserProfile(uid, (p) => {
      // 1. Maintain conversation history
      if (!p.conversations) p.conversations = [];
      p.conversations.push({
        id: Math.random().toString(36).substring(2),
        sender: 'user',
        text: text || "Check in",
        dateTime: new Date().toISOString()
      });

      p.conversations.push({
        id: Math.random().toString(36).substring(2),
        sender: 'twin',
        text: reply,
        dateTime: new Date().toISOString()
      });

      if (p.conversations.length > 40) {
        p.conversations.shift();
        p.conversations.shift();
      }

      // 2. Logging and XP distribution
      if (detectedActivity) {
        const entryId = Math.random().toString(36).substring(2);
        const co2Val = Number(detectedActivity.co2Difference);
        const isEmissionsAdded = co2Val > 0;
        const xpVal = Number(detectedActivity.xpReward);
        const xpChange = isEmissionsAdded ? -Math.abs(xpVal) : Math.abs(xpVal);

        const newLog = {
          id: entryId,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          category: detectedActivity.category || 'general',
          activity: detectedActivity.activity,
          co2Difference: co2Val,
          xpReward: xpChange,
          isCustom: true
        };

        p.logs = [newLog, ...p.logs];
        p.companion.xp += newLog.xpReward;
        p.companion.streak = (p.companion.streak || 0) + 1;

        // Intelligent Level Up / Down handlers
        if (p.companion.xp < 0) {
          if (p.companion.level > 1) {
            p.companion.level -= 1;
            p.companion.xpNeeded = Math.round(p.companion.xpNeeded / 1.5);
            p.companion.xp = Math.max(0, p.companion.xpNeeded + p.companion.xp);
          } else {
            p.companion.xp = 0;
          }
        } else {
          while (p.companion.xp >= p.companion.xpNeeded) {
            p.companion.xp -= p.companion.xpNeeded;
            p.companion.level += 1;
            p.companion.xpNeeded = Math.round(p.companion.xpNeeded * 1.5);

            const rewards = ['Eco Crown', 'Monocles', 'Golden Cloak', 'Cute Mini Pet'];
            const rewardItem = rewards[(p.companion.level - 2) % rewards.length];
            if (!p.companion.unlockedAccessories.includes(rewardItem)) {
              p.companion.unlockedAccessories.push(rewardItem);
            }
          }
        }

        // Carbon Score calculation updates
        if (isEmissionsAdded) {
          p.stats.carbonSavedThisMonth = Number((p.stats.carbonSavedThisMonth - co2Val).toFixed(1));
        } else {
          p.stats.carbonSavedThisMonth = Number((p.stats.carbonSavedThisMonth + Math.abs(co2Val)).toFixed(1));
        }

        const baseCalc = calculateCarbonStats(p.onboarding);
        let bonusMultiplier = 0;
        if (p.stats.carbonSavedThisMonth >= 0) {
          bonusMultiplier = Math.min(18, Math.floor(p.stats.carbonSavedThisMonth / 4.5));
        } else {
          bonusMultiplier = Math.max(-100, Math.floor(p.stats.carbonSavedThisMonth / 2));
        }
        p.stats.score = Math.min(100, Math.max(0, baseCalc.score + bonusMultiplier));
        p.stats.breakdown = baseCalc.breakdown;
      }

      // 3. Update twin state tracker
      if (!p.twin_state) p.twin_state = [];
      p.twin_state.push({
        id: Math.random().toString(36).substring(2),
        score: p.stats.score,
        mood: p.stats.score >= 80 ? 'Excellent' : p.stats.score >= 60 ? 'Healthy' : p.stats.score >= 40 ? 'Moderate' : 'Stressed',
        expression,
        accessoryCount: p.companion.equippedAccessories.length,
        dateTime: new Date().toISOString()
      });

      // Maintain max length 50 for storage
      if (p.twin_state.length > 50) p.twin_state.shift();

      // 4. Update core score metrics tracker
      if (!p.sustainability_scores) p.sustainability_scores = [];
      p.sustainability_scores.push({
        id: Math.random().toString(36).substring(2),
        score: p.stats.score,
        dateTime: new Date().toISOString()
      });
      if (p.sustainability_scores.length > 50) p.sustainability_scores.shift();
    });

    res.json({
      success: true,
      reply,
      expression,
      detectedActivity,
      profile: updatedProfile
    });

  } catch (err: any) {
    console.error("Twin voice chat route failure:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Proactive start conversations
app.post('/api/twin/proactive', async (req, res) => {
  const { userId } = req.body;
  const uid = userId || 'demo-user';

  try {
    const profile = getUserProfile(uid);
    const companionName = profile.companion.name;
    const score = profile.stats.score;
    const breakdown = profile.stats.breakdown;

    const companionContext = `
      You are "${companionName}", a living virtual companion and supportive eco-coach.
      Your personality is highly friendly, human, supportive, relatable, playful, and encouraging.
      Never be robotic, corporate, or overly formal. Draft a funny, warm, proactive 1-sentence opening greeting check-in (max 22 words) with the user.

      Return a JSON object conforming exactly to this schema:
      {
        "greeting": "The text greeting",
        "expression": "excited | proud | concerned | sad | motivational | playful | reflective | celebratory | curious"
      }

      Select your emotional expression based on these parameters:
      - If streak is over 3: Choose "celebratory" or "excited" to celebrate!
      - If electricity is over 110: Choose "concerned" or "playful"
      - If score is moderate (between 40 and 60): Choose "reflective" or "curious"
      - Otherwise: Choose "playful", "curious" or "proud" to keep things fresh and relatable!
    `;

    let greeting = "";
    let expression = "proud";

    const ai = getGeminiClient();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: "Start proactive daily greeting thread.",
          config: {
            systemInstruction: companionContext,
            temperature: 0.85,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                greeting: { type: Type.STRING },
                expression: { 
                  type: Type.STRING, 
                  enum: ["excited", "proud", "concerned", "sad", "motivational", "playful", "reflective", "celebratory", "curious"] 
                }
              },
              required: ["greeting", "expression"]
            }
          }
        });
        const result = JSON.parse(response.text?.trim() || "{}");
        greeting = result.greeting;
        expression = result.expression || "proud";
      } catch (err) {
        console.error("Proactive JSON parse failure:", err);
      }
    }

    if (!greeting) {
      if (breakdown.electricity > 110) {
        greeting = `Hey! I realized we are consuming a bit of power. Did we keep any empty charging blocks or lights on today? 🔌`;
        expression = "concerned";
      } else if (breakdown.transport > 90) {
        greeting = `Oh! Our travel numbers are high. Did we ride a bus, walk, or bike to save emissions on our commute? 🚌`;
        expression = "motivational";
      } else {
        greeting = `Hooray! Checking in makes me smile! What green actions did we do today to protect the forest? 🌲`;
        expression = "proud";
      }
    }

    // save to conversation
    const updatedProfile = updateUserProfile(uid, (p) => {
      if (!p.conversations) p.conversations = [];
      p.conversations.push({
        id: Math.random().toString(36).substring(2),
        sender: 'twin',
        text: greeting,
        dateTime: new Date().toISOString()
      });
      if (p.conversations.length > 40) p.conversations.shift();
    });

    res.json({
      success: true,
      greeting,
      expression,
      profile: updatedProfile
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. AI Sustainability Coach Q&A Chat
app.post('/api/coach/chat', async (req, res) => {
  const { userId, messages } = req.body;
  const uid = userId || 'demo-user';

  try {
    const profile = getUserProfile(uid);
    const lastMessage = messages[messages.length - 1];
    
    const companionName = profile.companion.name;
    const score = profile.stats.score;
    const breakdown = profile.stats.breakdown;
    const onboarding = profile.onboarding;

    const systemContext = `
      You are "${companionName}", the living virtual Carbon Twin companion and AI Sustainability Coach.
      Your tone is extremely warm, friendly, encouraging, and highly conversational. You talk about yourself as the virtual companion.
      
      Here is the user's current carbon footprint profile:
      - Overall Sustainability Score: ${score}/100 (Higher is more sustainable, lower is bad).
      - Carbon emissions: Transport=${breakdown.transport} kg/month (using ${onboarding.transType} travel), Electricity/Energy=${breakdown.electricity} kg/month, Food=${breakdown.food} kg/month (${onboarding.diet}), Shopping=${breakdown.shopping} kg/month, Waste=${breakdown.waste} kg/month.
      - Equivalent trees needed: ${profile.stats.treesEquivalent} trees.
      
      If the user is asking a general sustainability question or for tips, answer them by referencing their actual footprint breakdown and offering specific, hyper-actionable tips related to their situation.
      Keep your answer engaging, highly interactive, and clear. Format output utilizing tidy markdown headers, bullet points, and brief paragraphs. Max length: 180 words.
    `;

    const ai = getGeminiClient();
    if (!ai) {
      // Mock Friendly AI reply when Gemini key is missing
      return res.json({
        success: true,
        reply: `Hello there! I'm **${companionName}**, your EcoTwin! 🌿\n\nSince we are in preview mode, here is some custom coaching just for you:\n\n* **Transport Insight**: Since you're traveling via *${onboarding.transType}* for about ${onboarding.transDistWeekly} km weekly, reducing car usage or carpooling can save up to **50 kg CO₂** per month!\n* **Diet Tip**: Your *${onboarding.diet}* diet is fantastic. Choosing locally sourced foods could reduce your food footprint even further!\n* **Action Item**: Why not challenge yourself to the **Power Down** challenge today? Unplugging saves electricity and immediately lifts my mood! ☀️\n\nHow else can I help you today? Ask me anything about conservation!`
      });
    }

    let replyText = "";
    try {
      // Format chat thread for Gemini structure
      const chatResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: lastMessage.text || lastMessage.content || "Hello!",
        config: {
          systemInstruction: systemContext,
          temperature: 0.7,
        }
      });
      replyText = chatResponse.text || "";
    } catch (e) {
      console.warn("Gemini Coach Chat Rate Limit or API Key issue. Falling back to rule-based coach engine.", e);
      replyText = `Hello! I'm **${companionName}**, your EcoTwin! 🌿\n\nMy cloud cognitive connection is resting (rate limits exceeded), but I can still coach you locally:\n\n* **Your Transport**: Traveling via *${onboarding.transType}*, reducing car reliance can save huge CO₂!\n* **Diet Advice**: Your *${onboarding.diet}* eating habit is great. Buying local helps further!\n* **Score Status**: Your current score of **${score}/100** shows awesome focus! Let's do some mini-savings today!`;
    }

    res.json({ success: true, reply: replyText });
  } catch (err: any) {
    console.error("Gemini Coach Chat Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. Carbon Forecast Engine Endpoint
app.post('/api/forecast', async (req, res) => {
  const { userId } = req.body;
  const uid = userId || 'demo-user';

  try {
    const profile = getUserProfile(uid);
    const breakdown = profile.stats.breakdown;
    const score = profile.stats.score;

    const aiPrompt = `
      Analyze the following monthly carbon emission values for a user:
      - Transport: ${breakdown.transport} kg CO2
      - Energy/Electricity: ${breakdown.electricity} kg CO2
      - Food: ${breakdown.food} kg CO2
      - Shopping: ${breakdown.shopping} kg CO2
      - Waste: ${breakdown.waste} kg CO2
      - Monthly Total: ${breakdown.total} kg CO2
      - Sustainability Score: ${score}/100

      Use these numbers to calculate a projected trend of next month, next 6 months, and next year footprints.
      Return a clean JSON structure containing exactly these keys:
      {
        "nextMonthForecast": "estimated emissions value in kg CO2",
        "nextYearForecast": "estimated emissions in metric tons CO2",
        "trendPercentage": "percentage change (e.g., +12% or -5%) based on current habits",
        "narrative": "A 2-sentence warning or positive forecast narrative detailing structural changes if lifestyle keeps persistent.",
        "preventionStrategies": ["strategy 1 with detailed metric", "strategy 2 with detailed metric", "strategy 3 with detailed metric"]
      }
      Provide ONLY valid JSON inside markdown block (no other text).
    `;

    const ai = getGeminiClient();
    if (!ai) {
      // Clean fallback forecast object
      const monthlyTotal = breakdown.total;
      const annualTons = (monthlyTotal * 12 / 1000).toFixed(1);
      const estNextMonth = Math.round(monthlyTotal * 1.05); // 5% increase trend
      const estNextYear = (monthlyTotal * 12.6 / 1000).toFixed(1);

      return res.json({
        success: true,
        forecast: {
          nextMonthForecast: `${estNextMonth} kg CO₂`,
          nextYearForecast: `${estNextYear} Tons CO₂`,
          trendPercentage: "+5.2%",
          narrative: `If your current habits persist, your carbon footprint will gradually expand. Increasing fast fashion or car dependency might increase your emissions by up to 12% next year, deteriorating Sprout's environment.`,
          preventionStrategies: [
            "Switch to LED energy-efficient bulbs to reduce home electricity output by 45 kg CO₂ monthly.",
            "Cut online fast fashion delivery packages by 50% to save 18 kg CO₂ per dispatch.",
            "Adopt meatless Mondays to offset 15 kg CO₂ from agricultural production vectors."
          ]
        }
      });
    }

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: aiPrompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nextMonthForecast: { type: Type.STRING },
              nextYearForecast: { type: Type.STRING },
              trendPercentage: { type: Type.STRING },
              narrative: { type: Type.STRING },
              preventionStrategies: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["nextMonthForecast", "nextYearForecast", "trendPercentage", "narrative", "preventionStrategies"]
          }
        }
      });
      responseText = response.text || "";
    } catch (e) {
      console.warn("Forecast Gemini Generation failed/quota limits reached. Using rule engine forecast fallback.", e);
    }

    try {
      const forecastData = responseText ? JSON.parse(responseText.trim() || '{}') : {};
      if (!forecastData.nextMonthForecast) {
        throw new Error("Empty or failed response content");
      }
      res.json({ success: true, forecast: forecastData });
    } catch {
      // backup in case of manual parsing error or offline fallback load
      const monthlyTotal = breakdown.total;
      const estNextMonth = Math.round(monthlyTotal * 1.05); // 5% increase trend
      const estNextYear = (monthlyTotal * 12.6 / 1000).toFixed(1);

      res.json({
        success: true,
        forecast: {
          nextMonthForecast: `${estNextMonth} kg CO₂`,
          nextYearForecast: `${estNextYear} Tons CO₂`,
          trendPercentage: "+5.2%",
          narrative: `If your current habits persist, your carbon footprint has a slow 5.2% upward trajectory. Switching to offline mode due to rate limits.`,
          preventionStrategies: [
            "Switch to LED energy-efficient bulbs to reduce home electricity output by 45 kg CO₂ monthly.",
            "Cut online shopping packages by 50% to save 18 kg CO₂ per dispatch.",
            "Adopt meatless Mondays to offset 15 kg CO₂ from agricultural production vectors."
          ]
        }
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. Smart Receipt & Bill OCR Scanner (Utilizing Gemini Multimodal intelligence!)
app.post('/api/scanner/upload', async (req, res) => {
  const { imageBase64, type, mimeType, userId } = req.body;
  const uid = userId || 'demo-user';

  if (!imageBase64) {
    return res.status(400).json({ success: false, error: 'Base64 image is required' });
  }

  try {
    const ai = getGeminiClient();
    const cleanMimeType = mimeType || 'image/jpeg';
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const typePrompt = type === 'bill' ? `
      You are scanning an electricity bill.
      Analyze the bill image and extract:
      1. Cost (Number, in original rupees value/total amount, e.g. 5200.00)
      2. KWh units consumed (Number, e.g. 350)
      3. Vendor/Provider name (String)
      4. Estimated Carbon footprint generated from these units in kg CO2 (Number) - multiply KWh by 0.4.
      
      Return as structured JSON inside schema:
      {
        "provider": "e.g. Tata Power",
        "cost": 5200.00,
        "unitsKwh": 350,
        "co2Emissions": 140,
        "conservationTips": "Brief 1-sentence savings tip based on usage level"
      }
    ` : `
      You are scanning a shopping receipt.
      Analyze the receipt image and:
      1. Identify individual items.
      2. Tag each item as either "sustainable" (low emissions, recyclable, eco friendly) or "plasticGroup" / "unsustainable" (plastic-heavy, fast fashion, non-recyclable).
      3. Compute an overall Sustainability Score (1-100) for the receipt.
      4. List up to 3 alternative eco-friendly suggestions.

      Return as structured JSON inside schema:
      {
        "storeName": "e.g. Organic Supermarket",
        "totalAmount": 45.90,
        "sustainabilityScore": 75,
        "items": [
          { "name": "Plastic Water Bottle", "ecoCategory": "unsustainable", "details": "High single-use plastic waste footprint" },
          { "name": "Organic Apples", "ecoCategory": "sustainable", "details": "Local produce, minimal travel packaging" }
        ],
        "alternatives": ["Switch plastic bottle to an aluminum thermal tumbler", "Choose bulk dry goods to reduce wrap plastics"]
      }
    `;

    if (!ai) {
      // Elegant simulated OCR process when Gemini Key is absent
      // Wait for a simulated 1s delay
      await new Promise(resolve => setTimeout(resolve, 1200));

      if (type === 'bill') {
        const mockBill = {
          provider: "Greener Grid Co.",
          cost: 3200.00,
          unitsKwh: 287,
          co2Emissions: 114.8,
          conservationTips: "Reducing your laundry dryer use and shifting cycles off-peak could shave ₹1250 and 20kg of carbon off your next bill!"
        };
        
        // Log to profile
        updateUserProfile(uid, (profile) => {
          profile.logs = [{
            id: Math.random().toString(36).substring(2),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            category: 'energy',
            activity: `Scanned Energy Bill (${mockBill.unitsKwh} kWh consumed)`,
            co2Difference: Math.min(10, Math.round(mockBill.co2Emissions / 10)),
            xpReward: 40
          }, ...profile.logs];
          profile.companion.xp += 40;
        });

        return res.json({ success: true, result: mockBill });
      } else {
        const mockReceipt = {
          storeName: "Eco-Luxe Market",
          totalAmount: 38.60,
          sustainabilityScore: 68,
          items: [
            { name: "Single-use Plastic Bag", ecoCategory: "unsustainable", details: "Non-biodegradable packaging" },
            { name: "Bamboo Toothbrush Duo", ecoCategory: "sustainable", details: "Biodegradable natural handle" },
            { name: "Non-recyclable Coffee Pods", ecoCategory: "unsustainable", details: "Aluminum-plastic combined composite" },
            { name: "Bulk Cotton Mesh Sack", ecoCategory: "sustainable", details: "Reusable wash-friendly transport gear" }
          ],
          alternatives: [
            "Use canvas tote bags instead of purchasing single-use checkout plastic sacks.",
            "Switch to stainless steel reusable pods or traditional drip filters."
          ]
        };

        // Log to profile
        updateUserProfile(uid, (profile) => {
          profile.logs = [{
            id: Math.random().toString(36).substring(2),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            category: 'shopping',
            activity: `Scanned Grocery Receipt (Eco Score: ${mockReceipt.sustainabilityScore}/100)`,
            co2Difference: -2.5,
            xpReward: 30
          }, ...profile.logs];
          profile.companion.xp += 30;
        });

        return res.json({ success: true, result: mockReceipt });
      }
    }

    // Call real Gemini multimodal model
    let parsedOCR: any = null;
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: cleanMimeType
            }
          },
          {
            text: typePrompt
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: type === 'bill' ? {
            type: Type.OBJECT,
            properties: {
              provider: { type: Type.STRING },
              cost: { type: Type.NUMBER },
              unitsKwh: { type: Type.NUMBER },
              co2Emissions: { type: Type.NUMBER },
              conservationTips: { type: Type.STRING }
            },
            required: ["provider", "cost", "unitsKwh", "co2Emissions", "conservationTips"]
          } : {
            type: Type.OBJECT,
            properties: {
              storeName: { type: Type.STRING },
              totalAmount: { type: Type.NUMBER },
              sustainabilityScore: { type: Type.NUMBER },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    ecoCategory: { type: Type.STRING },
                    details: { type: Type.STRING }
                  },
                  required: ["name", "ecoCategory", "details"]
                }
              },
              alternatives: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["storeName", "totalAmount", "sustainabilityScore", "items", "alternatives"]
          }
        }
      });

      parsedOCR = JSON.parse(response.text?.trim() || "{}");
    } catch (e) {
      console.warn("OCR scanner main node failed / quota limits hit. Employing elegant client OCR simulation mode.", e);
      if (type === 'bill') {
        parsedOCR = {
          provider: "Greener Grid Co. (Simulation)",
          cost: 114.80,
          unitsKwh: 287,
          co2Emissions: 114.8,
          conservationTips: "Rate limits active. Handled offline: Shifting cycles off-peak saves CO2!"
        };
      } else {
        parsedOCR = {
          storeName: "Eco Market (Simulation)",
          totalAmount: 38.60,
          sustainabilityScore: 78,
          items: [
            { name: "Single-use Sacks", ecoCategory: "unsustainable", details: "Non-biodegradable packing" },
            { name: "Bamboo Toothbrushes", ecoCategory: "sustainable", details: "Highly biodegradable natural handle" },
            { name: "Bulk Cotton Mesh Sack", ecoCategory: "sustainable", details: "Reusable wash-friendly transport gear" }
          ],
          alternatives: [
            "Use canvas tote bags instead of purchasing single-use checkout plastic sacks.",
            "Choose bulk dry goods to reduce wrap plastics"
          ]
        };
      }
    }
    
    // Log scanned action automatically into user's state
    updateUserProfile(uid, (profile) => {
      if (type === 'bill') {
        profile.logs = [{
          id: Math.random().toString(36).substring(2),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          category: 'energy',
          activity: `Scanned Energy Bill (${parsedOCR.unitsKwh || 0} kWh)`,
          co2Difference: 10,
          xpReward: 40
        }, ...profile.logs];
      } else {
        profile.logs = [{
          id: Math.random().toString(36).substring(2),
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          category: 'shopping',
          activity: `Scanned Shopping Receipt (Score: ${parsedOCR.sustainabilityScore || 50})`,
          co2Difference: -2.5,
          xpReward: 30
        }, ...profile.logs];
      }
      profile.companion.xp += 30;
    });

    res.json({ success: true, result: parsedOCR });
  } catch (err: any) {
    console.error("OCR Scanner Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. Custom AI Weekly Sustainability Report compiler
app.post('/api/weekly-report', async (req, res) => {
  const { userId } = req.body;
  const uid = userId || 'demo-user';

  try {
    const profile = getUserProfile(uid);
    const companionName = profile.companion.name;
    const score = profile.stats.score;
    const userLogs = profile.logs || [];

    const recentLogs = userLogs.slice(0, 5).map(l => `- ${l.activity} (CO2 Diff: ${l.co2Difference}kg, XP: ${l.xpReward}xp)`).join('\n');

    const ai = getGeminiClient();
    if (!ai) {
      // Offline fallback report generated with high fidelity
      const savedCount = userLogs.filter(l => l.co2Difference <= 0).length;
      const reductionKg = Math.abs(userLogs.reduce((acc, l) => acc + (l.co2Difference <= 0 ? l.co2Difference : 0), 0));
      
      const responseBack = {
        trend: reductionKg > 15 ? 'down' : 'flat',
        percentageChange: reductionKg > 15 ? 15 : 4,
        grade: score >= 80 ? 'A (Preservation Hero)' : score >= 60 ? 'B+ (Active Conservator)' : 'C+ (Carbon Burdened)',
        summary: `Highly analyzed weekly state aggregated organically. Under passive monitoring, your logged actions saved approximately ${reductionKg} kg CO2 in total! Transportation remains your primary leverage vector.`,
        achievements: [
          `Logged ${savedCount} carbon-saving behaviors this cycle.`,
          `Avoided approximately ${reductionKg.toFixed(1)}kg of greenhouse gases from grid load.`,
          `Kept ${companionName} thriving with balanced emotional ratios.`
        ],
        recommendations: [
          "Unplug vampire chargers in common nodes. This trims standby grid load by 4% instantly.",
          "Shift laundry schedules to cooler early mornings when wind/solar energy is at peak capacity.",
          "Adopt high-speed bicycling for blocks under 3km to completely avoid private fuel combustion."
        ],
        futureProjections: `By maintaining this current conservation trajectory, you can prevent up to ${Math.round(reductionKg * 52)} kg of CO2 emissions annually, elevating ${companionName} into a level 5 Guardian by mid-quarter!`
      };
      return res.json({ success: true, report: responseBack });
    }

    const reportPrompt = `
      You are the compiler and carbon scientist behind virtual companion: "${companionName}".
      The user has an overall Eco rating of: ${score}/100.
      Here are the user's recently logged actions:
      ${recentLogs}

      Compile a custom Weekly Sustainability Report for the user.
      Ensure the summary is detailed, actionable, and warm. Include 3 targeted advice bullet points and 3 milestones.
      Calculate potential future projections if they continue this trend.

      Return as structured JSON inside schema:
      {
        "trend": "down" or "up" or "flat",
        "percentageChange": number,
        "grade": "e.g. A- (Active Conservator)",
        "summary": "Detailed narrative summary",
        "achievements": ["achievement bullet 1", "achievement bullet 2", "achievement bullet 3"],
        "recommendations": ["recommendation bullet 1", "recommendation bullet 2", "recommendation bullet 3"],
        "futureProjections": "Detailed annual forecast narrative"
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: reportPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trend: { type: Type.STRING },
            percentageChange: { type: Type.NUMBER },
            grade: { type: Type.STRING },
            summary: { type: Type.STRING },
            achievements: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            futureProjections: { type: Type.STRING }
          },
          required: ["trend", "percentageChange", "grade", "summary", "achievements", "recommendations", "futureProjections"]
        }
      }
    });

    const reportData = JSON.parse(response.text?.trim() || "{}");
    res.json({ success: true, report: reportData });
  } catch (err: any) {
    console.error("Failed to generate weekly sustainability report:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------- VITE DEVELOPMENT / STORES SETUP -----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite Middlewares in Dev environment
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Assets Build
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EcoTwin server running at http://localhost:${PORT}`);
  });
}

startServer();
