import fs from 'fs';
import path from 'path';
import { UserProfile, OnboardingData, CarbonStats, Challenge, LeaderboardEntry } from '../src/types';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize Firebase Admin once using compliant modern SDK signatures
const app = getApps().length === 0 ? initializeApp({
  projectId: firebaseConfig.projectId
}) : getApp();

export const firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Memory database structure
interface Schema {
  users: Record<string, UserProfile>;
}

let localDatabase: Schema = {
  users: {}
};

// Default initial onboarding template
export const DEFAULT_ONBOARDING: OnboardingData = {
  transType: 'public',
  transDistWeekly: 50,
  monthlyElectricBill: 3500,
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
  let transFactor = 0;
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

  const kwhRate = 0.114;
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

  let foodMonthly = 80;
  if (data.diet === 'eggetarian') foodMonthly = 120;
  if (data.diet === 'nonvegetarian') foodMonthly = 250;

  let shopFactor = 20;
  if (data.shopFreq === 'weekly') shopFactor = 80;
  if (data.shopFreq === 'daily') shopFactor = 200;
  if (data.fastFashion) shopFactor += 50;
  const shoppingMonthly = shopFactor;

  let wasteFactor = 40;
  if (data.recycleHabits === 'partial') wasteFactor = 20;
  if (data.recycleHabits === 'full') wasteFactor = 5;
  if (!data.wasteSegregation) wasteFactor += 10;
  const wasteMonthly = wasteFactor;

  const totalMonthly = transportMonthly + energyMonthly + foodMonthly + shoppingMonthly + wasteMonthly;
  const dailyAverage = Number((totalMonthly / 30.4).toFixed(1));
  const monthlyAverage = totalMonthly;
  const annualAverage = Number((totalMonthly * 12 / 1000).toFixed(1));

  let score = 100 - Math.min(100, Math.max(0, Math.round(((totalMonthly - 200) / 800) * 80)));
  if (score < 10) score = 10;

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
    carbonSavedThisMonth: 45
  };
}

// Save local DB to file
function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDatabase, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write local fallback database:', error);
  }
}

// Asynchronous push to Cloud Firestore
export function persistToFirestoreAsync(userId: string, profile: UserProfile) {
  firestore.collection('users').doc(userId).set(profile)
    .then(() => {
      console.log(`[Firestore Sync] Successfully persisted profile for: ${userId}`);
    })
    .catch(err => {
      console.error(`[Firestore Sync] Failed to save profile for ${userId}:`, err);
    });
}

// Bootstrap local database cache from Firestore at boot-up
async function bootstrapDatabase() {
  try {
    console.log("[Boot] Syncing memory cache with Google Cloud Firestore...");
    const snapshot = await firestore.collection('users').get();
    
    snapshot.forEach(doc => {
      localDatabase.users[doc.id] = doc.data() as UserProfile;
    });
    
    saveLocalDb();
    console.log(`[Boot] Successfully preloaded ${snapshot.size} profiles from Cloud Firestore.`);
  } catch (err) {
    console.warn("[Boot] Firestore sync failed, falling back to local db.json file storage:", err);
    if (fs.existsSync(DB_FILE)) {
      try {
        localDatabase = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      } catch (e) {
        console.error("[Boot] Local fallback database parse failure:", e);
      }
    }
  }
}

// Trigger initial Firestore fetch asynchronously on module load
bootstrapDatabase();

// Get user profile or create if not exists
export function getUserProfile(userId: string, email?: string): UserProfile {
  if (localDatabase.users[userId]) {
    const cached = localDatabase.users[userId];
    if (cached.onboarded && !cached.stats) {
      cached.stats = calculateCarbonStats(cached.onboarding);
    }
    if (!cached.conversations) cached.conversations = [];
    if (!cached.twin_state) cached.twin_state = [];
    if (!cached.sustainability_scores) cached.sustainability_scores = [];
    return cached;
  }

  // Create new profile structure
  const newProfile: UserProfile = {
    userId,
    email: email || 'user@example.com',
    name: email ? email.split('@')[0] : 'Eco Friend',
    onboarded: false,
    onboarding: { ...DEFAULT_ONBOARDING },
    companion: {
      name: 'Sprout',
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

  localDatabase.users[userId] = newProfile;
  saveLocalDb();
  
  // Persist background to cloud as well
  persistToFirestoreAsync(userId, newProfile);
  
  return newProfile;
}

// Update profile helper
export function updateUserProfile(userId: string, updateFn: (profile: UserProfile) => void): UserProfile {
  const profile = getUserProfile(userId);
  updateFn(profile);
  localDatabase.users[userId] = profile;
  saveLocalDb();
  
  // Persist background to cloud as well
  persistToFirestoreAsync(userId, profile);
  
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
    score: user.stats?.score ?? 50,
    level: user.companion.level,
    xp: user.companion.xp,
    relationship: 'Self',
    avatarUrl: '🦖'
  };

  return [userEntry, ...communityEntries].sort((a, b) => b.score - a.score);
}
