import fs from 'fs';
import path from 'path';
import { UserProfile, OnboardingData, CarbonStats, Challenge, LeaderboardEntry, CompanionState, LoggedEntry } from '../src/types';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Default initial onboarding template
export const DEFAULT_ONBOARDING: OnboardingData = {
  transType: 'public',
  transDistWeekly: 50,
  monthlyElectricBill: 80,
  acUsage: 'medium',
  diet: 'vegetarian',
  shopFreq: 'weekly',
  fastFashion: false,
  recycleHabits: 'partial',
  wasteSegregation: true
};

// Preset Eco Challenges
export const DEFAULT_CHALLENGES: Challenge[] = [
  { id: 'c1', title: 'Car-Free Commute', description: 'Take public transport, walk, or bike to work/study today.', category: 'transport', xpReward: 50, co2Saved: 8.5, daily: true },
  { id: 'c2', title: 'Zero Wave Plastic', description: 'Refuse all single-use plastic cups, bags, or straws today.', category: 'waste', xpReward: 40, co2Saved: 1.2, daily: true },
  { id: 'c3', title: 'Power Down', description: 'Unplug idle chargers, switch off standby appliances, and turn off AC for 2 hours.', category: 'energy', xpReward: 30, co2Saved: 2.4, daily: true },
  { id: 'c4', title: 'Green Plate Lunch', description: 'Enjoy a fully plant-based meal today (no meat or dairy if possible).', category: 'food', xpReward: 35, co2Saved: 3.1, daily: true },
  { id: 'c5', title: 'Thrift Shopping Only', description: 'Avoid buying new clothes, or browse second-hand items if you must buy.', category: 'shopping', xpReward: 45, co2Saved: 6.0, daily: false },
  { id: 'c6', title: 'Sort Your Trash', description: 'Properly segregate wet, dry, and recyclable waste today.', category: 'waste', xpReward: 25, co2Saved: 1.0, daily: true },
  { id: 'c7', title: 'Tap Water Hero', description: 'Carry your reusable water bottle all day and avoid buying bottled water.', category: 'waste', xpReward: 20, co2Saved: 0.8, daily: true }
];

// Calculation utility for Carbon Stats
export function calculateCarbonStats(data: OnboardingData): CarbonStats {
  // 1. Transportation
  let transFactor = 0; // kg CO2 / km
  switch (data.transType) {
    case 'walking':
    case 'bicycle':
      transFactor = 0;
      break;
    case 'public':
      transFactor = 0.05;
      break;
    case 'twowheeler':
      transFactor = 0.12;
      break;
    case 'car':
      transFactor = 0.20;
      break;
    case 'flight':
      transFactor = 0.25;
      break;
  }
  const transportMonthly = Math.round(data.transDistWeekly * 4.3 * transFactor);

  // 2. Electricity & AC
  const kwhRate = 5; // kWh per $1
  const kgCo2PerKwh = 0.4;
  const electricityMonthly = Math.round(data.monthlyElectricBill * kwhRate * kgCo2PerKwh);
  
  let acFactor = 0;
  switch (data.acUsage) {
    case 'none': acFactor = 0; break;
    case 'low': acFactor = 30; break;
    case 'medium': acFactor = 75; break;
    case 'high': acFactor = 150; break;
  }
  const energyMonthly = electricityMonthly + acFactor;

  // 3. Food Habits
  let foodMonthly = 80; // vegetarian default
  if (data.diet === 'eggetarian') foodMonthly = 120;
  if (data.diet === 'nonvegetarian') foodMonthly = 250;

  // 4. Shopping Habits
  let shopFactor = 20;
  if (data.shopFreq === 'weekly') shopFactor = 80;
  if (data.shopFreq === 'daily') shopFactor = 200;
  if (data.fastFashion) shopFactor += 50;
  const shoppingMonthly = shopFactor;

  // 5. Waste Habits
  let wasteFactor = 40;
  if (data.recycleHabits === 'partial') wasteFactor = 20;
  if (data.recycleHabits === 'full') wasteFactor = 5;
  if (!data.wasteSegregation) wasteFactor += 10;
  const wasteMonthly = wasteFactor;

  // Grand totals
  const totalMonthly = transportMonthly + energyMonthly + foodMonthly + shoppingMonthly + wasteMonthly;
  const dailyAverage = Number((totalMonthly / 30.4).toFixed(1));
  const monthlyAverage = totalMonthly;
  const annualAverage = Number((totalMonthly * 12 / 1000).toFixed(1)); // tons / year

  // Sustainability score calculated (based on world average target of ~350kg/month being excellent)
  // Below 300kg is exceptional (Score ~90+)
  // Above 1000kg is very high emissions (Score ~10-20)
  let score = 100 - Math.min(100, Math.max(0, Math.round(((totalMonthly - 200) / 800) * 80)));
  if (score < 10) score = 10; // minimum score

  // Trees offset required (1 tree absorbs roughly 22kg CO2 per year, so 1.8kg CO2 per month)
  const treesEquivalent = Math.round(totalMonthly / 1.83);

  return {
    score,
    breakdown: {
      transport: transportMonthly,
      electricity: energyMonthly,
      food: foodMonthly,
      shopping: shoppingMonthly,
      waste: wasteMonthly,
      total: totalMonthly
    },
    dailyAverage,
    monthlyAverage,
    annualAverage,
    treesEquivalent,
    carbonSavedThisMonth: 45 // offset default base savings from active logged tasks
  };
}

// Memory database structure
interface Schema {
  users: Record<string, UserProfile>;
}

const initialDb: Schema = {
  users: {}
};

// Seed an initial demo user
const DEMO_USER_ID = 'demo-user';
const demoUserProfile: UserProfile = {
  userId: DEMO_USER_ID,
  email: 'naveenprabhuvitap@gmail.com',
  name: 'Eco Warrior',
  onboarded: true,
  onboarding: { ...DEFAULT_ONBOARDING },
  companion: {
    name: 'Sprout',
    level: 3,
    xp: 220,
    xpNeeded: 500,
    streak: 4,
    equippedAccessories: ['Background Woods'],
    unlockedAccessories: ['Background Woods', 'Cute Hat', 'Flower Pot', 'Tiny Sunglasses']
  },
  challenges: [
    { challengeId: 'c1', completedAt: new Date(Date.now() - 3600000 * 4).toISOString(), claimed: true },
    { challengeId: 'c2', completedAt: null, claimed: false },
    { challengeId: 'c6', completedAt: new Date(Date.now() - 3600000 * 20).toISOString(), claimed: true }
  ],
  logs: [
    { id: '1', date: '2026-06-11', category: 'transport', activity: 'Rode public transit instead of driving', co2Difference: -8.5, xpReward: 50 },
    { id: '2', date: '2026-06-11', category: 'waste', activity: 'Sorted household recycle waste', co2Difference: -1.0, xpReward: 25 },
    { id: '3', date: '2026-06-10', category: 'food', activity: 'Ate a fully vegetarian dinner', co2Difference: -3.1, xpReward: 35 }
  ],
  stats: calculateCarbonStats({ ...DEFAULT_ONBOARDING }),
  conversations: [
    { id: 'sc1', sender: 'twin', text: "Hi! I'm Sprout, your Carbon Twin. I'm feeling great and ready to help you reduce our footprint!", dateTime: new Date(Date.now() - 3600000 * 2).toISOString() }
  ],
  twin_state: [
    { id: 'st1', score: 71, mood: "Healthy & Great", expression: "good", accessoryCount: 1, dateTime: new Date(Date.now() - 3600000 * 2).toISOString() }
  ],
  sustainability_scores: [
    { id: 'ss1', score: 71, dateTime: new Date(Date.now() - 3600000 * 2).toISOString() }
  ]
};

initialDb.users[DEMO_USER_ID] = demoUserProfile;

// Database helper functions
export function loadDatabase(): Schema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Failed to parse database file. Reinitializing clean database.', error);
  }
  // Initialize and write database
  saveDatabase(initialDb);
  return initialDb;
}

export function saveDatabase(data: Schema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write to database file:', error);
  }
}

// Get user profile or create if not exists
export function getUserProfile(userId: string, email?: string): UserProfile {
  const db = loadDatabase();
  if (db.users[userId]) {
    // Make sure stats are dynamic based on current onboarding if somehow out of sync
    if (db.users[userId].onboarded && !db.users[userId].stats) {
      db.users[userId].stats = calculateCarbonStats(db.users[userId].onboarding);
    }
    // Safely migrate existing users in the db file
    if (!db.users[userId].conversations) db.users[userId].conversations = [];
    if (!db.users[userId].twin_state) db.users[userId].twin_state = [];
    if (!db.users[userId].sustainability_scores) db.users[userId].sustainability_scores = [];
    return db.users[userId];
  }

  // Create new profile
  const newProfile: UserProfile = {
    userId,
    email: email || 'user@example.com',
    name: email ? email.split('@')[0] : 'Eco Friend',
    onboarded: false,
    onboarding: { ...DEFAULT_ONBOARDING },
    companion: {
      name: 'EcoBuddy',
      level: 1,
      xp: 0,
      xpNeeded: 100,
      streak: 0,
      equippedAccessories: [],
      unlockedAccessories: []
    },
    challenges: [],
    logs: [],
    stats: calculateCarbonStats(DEFAULT_ONBOARDING),
    conversations: [],
    twin_state: [],
    sustainability_scores: []
  };

  db.users[userId] = newProfile;
  saveDatabase(db);
  return newProfile;
}

// Update profile helper
export function updateUserProfile(userId: string, updateFn: (profile: UserProfile) => void): UserProfile {
  const db = loadDatabase();
  const profile = db.users[userId] || getUserProfile(userId);
  updateFn(profile);
  db.users[userId] = profile;
  saveDatabase(db);
  return profile;
}

// Get standard Leaderboard stand-ins including current user
export function getLeaderboard(userId: string): LeaderboardEntry[] {
  const user = getUserProfile(userId);
  
  const communityEntries: LeaderboardEntry[] = [
    { userId: 'l1', name: 'Alba Finch', score: 91, level: 8, xp: 4200, relationship: 'Community', avatarUrl: '🌱' },
    { userId: 'l2', name: 'Professor Oak', score: 85, level: 6, xp: 2800, relationship: 'College', avatarUrl: '🌳' },
    { userId: 'l3', name: 'Clara Waters', score: 78, level: 5, xp: 1950, relationship: 'Friend', avatarUrl: '💧' },
    { userId: 'l4', name: 'Dave Sun', score: 68, level: 4, xp: 1400, relationship: 'Friend', avatarUrl: '☀️' },
    { userId: 'l5', name: 'Greta Thun', score: 95, level: 10, xp: 9500, relationship: 'Community', avatarUrl: '🌍' }
  ];

  const userEntry: LeaderboardEntry = {
    userId: user.userId,
    name: user.name,
    score: user.stats.score,
    level: user.companion.level,
    xp: user.companion.xp,
    relationship: 'Self',
    avatarUrl: '🦖'
  };

  return [userEntry, ...communityEntries].sort((a, b) => b.score - a.score);
}
