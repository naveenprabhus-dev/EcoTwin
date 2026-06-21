import { LoggedEntry, CarbonStats } from '../types/carbon';

/**
 * Domain entity governing the calculations, stats summaries, and offsets metrics.
 */
export class CarbonProfileDomain {
  constructor(
    public readonly userId: string,
    public readonly logs: LoggedEntry[],
    public readonly stats: CarbonStats
  ) {}

  /**
   * Calculates the collective total carbon emissions inside this profile based on category.
   */
  public getLogsByTransitCategory(category: string): LoggedEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Summarizes the total offsets and trees required to mitigate the carbon footprint.
   */
  public getTreesEquivalentOffset(): number {
    // Standard rule: 1 tree mitigates roughly 21.8 kg CO2 per year
    const totalEmissions = this.stats.breakdown.total || 0;
    return Math.ceil(totalEmissions / 21.8);
  }
}
