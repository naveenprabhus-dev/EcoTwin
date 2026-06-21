import { CarbonStats, LoggedEntry } from '../types';

export class ReportService {
  /**
   * Calculates overall compliance rate for action goals logged over the report period.
   */
  public static calculateComplianceRate(logs: LoggedEntry[]): number {
    if (!logs || logs.length === 0) return 0;
    const completedTasks = logs.filter(l => l.co2Difference <= 0).length;
    return Math.min(100, Math.round((completedTasks / Math.max(1, logs.length)) * 100));
  }

  /**
   * Identifies top performing category and suggested improvements.
   */
  public static compileSuggestedImprovements(stats: CarbonStats): string[] {
    const list: string[] = [];
    const { transport, electricity, food, waste } = stats.breakdown;

    if (transport > 100) {
      list.push("Swap 2 single-passenger car drives for walking, bicycle rides, or public rail routes.");
    }
    if (electricity > 120) {
      list.push("Unplug standing TV system loads and idle phone chargers overnight to trim grid vampire loads.");
    }
    if (food > 90) {
      list.push("Swap beef/mutton with tasty poultry, fiber-rich legumes, or plant-based proteins twice weekly.");
    }
    if (waste > 30) {
      list.push("Implement strict backyard food scrap composting and separate clean reuse paper/plastics.");
    }

    if (list.length === 0) {
      list.push("Keep leveling up your beautiful Sprout companion and claiming challenges!");
      list.push("Check the Adaptive Action Planner tomorrow for a fresh batch of tailored optimizations.");
    }

    return list;
  }
}
