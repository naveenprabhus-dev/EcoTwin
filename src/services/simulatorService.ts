import { CarbonStats } from '../types';

export class SimulatorService {
  /**
   * Estimates long-term climate projections based on target reductions and compliance metrics.
   */
  public static forecastReduction(
    stats: CarbonStats, 
    reducedPercent: number, 
    years: number = 1
  ) {
    const monthlyTotal = stats.breakdown.total;
    const currentAnnual = monthlyTotal * 12;
    const reducedFactor = Math.max(0, 1 - reducedPercent / 100);
    const predictedMonthly = monthlyTotal * reducedFactor;
    const predictedAnnual = predictedMonthly * 12;
    const expectedCO2Saved = currentAnnual - predictedAnnual;

    return {
      currentAnnual: Math.round(currentAnnual),
      predictedAnnual: Math.round(predictedAnnual * years),
      expectedCO2Saved: Math.round(expectedCO2Saved * years),
      treesNeeded: Math.round(predictedMonthly / 1.83),
    };
  }
}
