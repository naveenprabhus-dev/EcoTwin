import { TransType, DietType, CarbonStats, LoggedEntry } from './carbon';

export interface CompanionState {
  name: string;
  level: number;
  xp: number;
  xpNeeded: number;
  streak: number;
  equippedAccessories: string[];
  unlockedAccessories: string[];
}

export interface ConversationLog {
  id: string;
  sender: 'user' | 'twin';
  text: string;
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

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  onboarded: boolean;
  onboarding: any; // OnboardingData
  companion: CompanionState;
  challenges: any[];
  logs: LoggedEntry[];
  stats: CarbonStats;
  conversations?: ConversationLog[];
  actionPlan?: ActionPlan;
}
