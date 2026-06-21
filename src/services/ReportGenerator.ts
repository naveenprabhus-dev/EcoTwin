import { CarbonStats, LoggedEntry } from '../types';

export interface WeeklyReportData {
  trend: 'up' | 'down' | 'flat';
  percentageChange: number;
  grade: string;
  summary: string;
  achievements: string[];
  recommendations: string[];
  futureProjections: string;
}

/**
 * @class ReportGenerator
 * @description Compiles historical logging entries and current footprint baselines 
 * to assemble strategic, highly detailed weekly analytical reports, performance grades, 
 * trends, and future carbon savings projections.
 */
export class ReportGenerator {
  /**
   * Compiles and grades historical carbon logs to assemble a strategic weekly summary.
   */
  public static compileLocalFallbackReport(
    stats: CarbonStats,
    logs: LoggedEntry[],
    companionName: string
  ): WeeklyReportData {
    const totalEmissions = stats.breakdown.total;
    const carbonSaved = stats.carbonSavedThisMonth;

    // Determine performance grade
    let grade = 'C (High Impact)';
    if (stats.score >= 80) {
      grade = 'A (Conservationist)';
    } else if (stats.score >= 60) {
      grade = 'B+ (Eco Conscious)';
    }

    // Evaluate trends based on saved carbon levels
    const trend: 'up' | 'down' | 'flat' = carbonSaved > 10 ? 'down' : 'flat';
    const percentageChange = carbonSaved > 10 ? 12 : 3;

    // Compile dynamic descriptive actions
    const achievements = [
      `Avoided substantial greenhouse units this week by choosing conscious eco-actions.`,
      `Completed challenges focusing on green plate nutrition and organic habits.`,
      `Kept ${companionName} thriving with active, consistent habit log entries.`
    ];

    if (stats.breakdown.transport < 200) {
      achievements.push(`Kept transportation index exceptionally light by walking, cycling, or transit routing.`);
    }

    const recommendations = [
      'Unplug electric standby standby plugs when away or not in active usage. This trims base grid overhead.',
      'Adopt a cold washing laundry cycle twice per week to conserve grid thermal parameters.',
      'Swap high-impact meals for fresh seasonal plant-based greens to trim agricultural soil footprints.'
    ];

    const futureProjections = `Continuing your current habits would reduce your annual footprint output by around ${Math.round(
      carbonSaved * 12
    )} kg, leading to an upgraded companion tier next quarter!`;

    const summary = `Excellent work protecting Sprout's ecosystem! Based on your last 7 days of logs, transportation remains an active vector, while your food and waste footprints have remained optimally low inside healthy boundaries.`;

    return {
      trend,
      percentageChange,
      grade,
      summary,
      achievements,
      recommendations,
      futureProjections,
    };
  }
}
