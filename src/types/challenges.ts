export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste';
  xpReward: number;
  co2Saved: number; // kg saved
  daily: boolean;
}

export interface UserChallengeState {
  challengeId: string;
  completedAt: string | null; // ISO Date string or null
  claimed: boolean;
}

export interface AchievementBadge {
  id: string;
  title: string;
  requirement: string;
  category: string;
  icon: string;
  unlockedAt?: string | null;
}
