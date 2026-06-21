export type TransType = 'walking' | 'bicycle' | 'public' | 'twowheeler' | 'car' | 'flight';
export type ACUsageType = 'none' | 'low' | 'medium' | 'high';
export type DietType = 'vegetarian' | 'eggetarian' | 'nonvegetarian';
export type ShopFreqType = 'rarely' | 'weekly' | 'daily';
export type RecycleType = 'none' | 'partial' | 'full';

export interface OnboardingData {
  transType: TransType;
  transDistWeekly: number; // in km
  monthlyElectricBill: number; // in USD
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

export interface LoggedEntry {
  id: string;
  date: string; // ISO string
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste' | 'general';
  activity: string;
  co2Difference: number; // negative is saved/good
  xpReward: number;
  isCustom?: boolean;
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
