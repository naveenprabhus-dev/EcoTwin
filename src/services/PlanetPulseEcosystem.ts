import { UserProfile, CompanionState } from '../types';

export interface EcosystemPulseState {
  isOnline: boolean;
  streakDays: number;
  unlockedCount: number;
  companionScale: number;
  pulseStatus: 'stable' | 'vibrant' | 'needs-attention';
}

export class PlanetPulseEcosystem {
  /**
   * Evaluates the local ecosystem health and connectivity status.
   */
  public static getEcosystemPulse(profile: UserProfile): EcosystemPulseState {
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const companion = profile.companion;
    const score = profile.stats?.score ?? 50;

    const streakDays = companion.streak;
    const unlockedCount = companion.unlockedAccessories?.length ?? 0;

    // Calculate interactive companion visual scale multiplier based on level
    const companionScale = 1 + Math.min(0.5, companion.level * 0.05);

    // Determine environmental pulses
    let pulseStatus: 'stable' | 'vibrant' | 'needs-attention' = 'stable';
    if (score >= 80 && streakDays >= 3) {
      pulseStatus = 'vibrant';
    } else if (score < 40) {
      pulseStatus = 'needs-attention';
    }

    return {
      isOnline,
      streakDays,
      unlockedCount,
      companionScale,
      pulseStatus,
    };
  }

  /**
   * Helper to format active logging streak descriptive text messages.
   */
  public static getStreakNarrative(companion: CompanionState): string {
    const streak = companion.streak;
    if (streak === 0) {
      return `Start an eco-saving streak today to nourish your Sprout with extra XP rewards!`;
    }
    if (streak < 3) {
      return `You have logged green habits for ${streak} consecutive days. Keep going!`;
    }
    return `Amazing consecutive streak of ${streak} days! Sprout is thriving with green health.`;
  }
}
