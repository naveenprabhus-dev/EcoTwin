export type TransType = 'walking' | 'bicycle' | 'public' | 'twowheeler' | 'car' | 'flight';
export type ACUsageType = 'none' | 'low' | 'medium' | 'high';
export type DietType = 'vegetarian' | 'eggetarian' | 'nonvegetarian';
export type ShopFreqType = 'rarely' | 'weekly' | 'daily';
export type RecycleType = 'none' | 'partial' | 'full';

export interface OnboardingData {
  transType: TransType;
  transDistWeekly: number; // in km
  monthlyElectricBill: number; // in USD or currency
  acUsage: ACUsageType;
  diet: DietType;
  shopFreq: ShopFreqType;
  fastFashion: boolean;
  recycleHabits: RecycleType;
  wasteSegregation: boolean;
}

export interface CarbonStats {
  score: number; // 0-100
  breakdown: {
    transport: number; // kg CO2 / month
    electricity: number; // kg CO2 / month
    food: number; // kg CO2 / month
    shopping: number; // kg CO2 / month
    waste: number; // kg CO2 / month
    total: number; // kg CO2 / month
  };
  dailyAverage: number; // kg CO2
  monthlyAverage: number;
  annualAverage: number;
  treesEquivalent: number; // Trees needed to offset monthly
  carbonSavedThisMonth: number; // kg CO2
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste';
  xpReward: number;
  co2Saved: number; // kg CO2 saved
  daily: boolean;
}

export interface UserChallengeState {
  challengeId: string;
  completedAt: string | null; // ISO Date or null if not done
  claimed: boolean;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  score: number;
  level: number;
  xp: number;
  relationship: 'Self' | 'Friend' | 'College' | 'Community';
  avatarUrl?: string;
}

export interface CompanionState {
  name: string;
  level: number;
  xp: number;
  xpNeeded: number;
  streak: number;
  equippedAccessories: string[];
  unlockedAccessories: string[];
}

export interface LoggedEntry {
  id: string;
  date: string; // ISO string or short date
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste' | 'general';
  activity: string;
  co2Difference: number; // negative is saved/good, positive is added
  xpReward: number;
  isCustom?: boolean;
}

export interface ConversationLog {
  id: string;
  sender: 'user' | 'twin';
  text: string;
  dateTime: string;
}

export interface TwinStateLog {
  id: string;
  score: number;
  mood: string;
  expression: string;
  accessoryCount: number;
  dateTime: string;
}

export interface SustainabilityScoreLog {
  id: string;
  score: number;
  dateTime: string;
}

export interface ActionPlanTask {
  id: string;
  day: number;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste';
  co2Reduction: number;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  completed: boolean;
  completedAt?: string | null;
}

export interface ActionPlan {
  createdAt: string;
  tasks: ActionPlanTask[];
  currentDay: number;
  complianceRate: number;
  weeklyReflection?: string | null;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  onboarded: boolean;
  onboarding: OnboardingData;
  companion: CompanionState;
  challenges: UserChallengeState[];
  logs: LoggedEntry[];
  stats: CarbonStats;
  conversations?: ConversationLog[];
  twin_state?: TwinStateLog[];
  sustainability_scores?: SustainabilityScoreLog[];
  actionPlan?: ActionPlan;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  completed: boolean;
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste';
  targetValue: number;
  currentValue: number;
  unit: string;
  buddyFeedback?: string;
}

