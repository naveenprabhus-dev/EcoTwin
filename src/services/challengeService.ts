import { Challenge } from '../types';

export class ChallengeService {
  /**
   * Evaluates if a given challenge category can be mapped directly to user logs.
   */
  public static checkLoggedCategorySuccess(
    challenge: Challenge, 
    logs: any[]
  ): boolean {
    if (!logs || logs.length === 0) return false;
    return logs.some(l => l.category === challenge.category && l.co2Difference <= 0);
  }

  /**
   * Calculates companion level attributes and XP requirements dynamically.
   */
  public static calculateXpRequirement(level: number): number {
    return Math.round(100 * Math.pow(1.5, level - 1));
  }
}
