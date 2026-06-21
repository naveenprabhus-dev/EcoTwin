import { describe, it, expect } from 'vitest';
import { ReportGenerator } from './services/ReportGenerator';
import { CarbonStats } from './types';

describe('ReportGenerator Service Unit Tests', () => {
  it('compileLocalFallbackReport compiles a rich report based on score thresholds', () => {
    const excellentStats: CarbonStats = {
      score: 85,
      breakdown: {
        transport: 150,
        electricity: 50,
        food: 40,
        shopping: 10,
        waste: 10,
        total: 260,
      },
      dailyAverage: 8.5,
      monthlyAverage: 260,
      annualAverage: 3.1,
      treesEquivalent: 142,
      carbonSavedThisMonth: 30,
    };

    const r1 = ReportGenerator.compileLocalFallbackReport(excellentStats, [], 'Sprout');
    expect(r1.grade).toBe('A (Conservationist)');
    expect(r1.trend).toBe('down');
    expect(r1.percentageChange).toBe(12);
    expect(r1.achievements).toContain('Kept transportation index exceptionally light by walking, cycling, or transit routing.');
    expect(r1.futureProjections).toContain('360 kg');

    const basicStats: CarbonStats = {
      score: 45,
      breakdown: {
        transport: 400,
        electricity: 150,
        food: 120,
        shopping: 80,
        waste: 40,
        total: 790,
      },
      dailyAverage: 26.0,
      monthlyAverage: 790,
      annualAverage: 9.5,
      treesEquivalent: 430,
      carbonSavedThisMonth: 5,
    };

    const r2 = ReportGenerator.compileLocalFallbackReport(basicStats, [], 'Sprout');
    expect(r2.grade).toBe('C (High Impact)');
    expect(r2.trend).toBe('flat');
    expect(r2.percentageChange).toBe(3);
    const hasTransAch = r2.achievements.some(a => a.includes('transportation index exceptionally light'));
    expect(hasTransAch).toBe(false);
  });
});
