import { describe, it, expect } from 'vitest';
import { CarbonEngine } from './services/CarbonEngine';
import { OnboardingData } from './types';

describe('CarbonEngine Service Logic Unit Tests', () => {
  it('getRealWorldEquivalents translates kg CO2 saved into equivalents', () => {
    const res = CarbonEngine.getRealWorldEquivalents(10);
    expect(res.treeDays).toBeGreaterThan(0);
    expect(res.drivingKm).toBeGreaterThan(0);
    expect(res.ledHours).toBeGreaterThan(0);
    expect(res.laptopCharges).toBeGreaterThan(0);

    const zeroRes = CarbonEngine.getRealWorldEquivalents(0);
    expect(zeroRes.treeDays).toBe(0);
    expect(zeroRes.drivingKm).toBe(0);
  });

  it('getSectorContext returns informative answers for why and next steps', () => {
    const transCtx = CarbonEngine.getSectorContext('transport', 10);
    expect(transCtx.why).toContain('Transportation emissions');
    expect(transCtx.next).toContain('public networks');

    const foodCtx = CarbonEngine.getSectorContext('food', 10);
    expect(foodCtx.why).toContain('livestock farming');

    const invalidCtx = CarbonEngine.getSectorContext('unknown_xyz', 10);
    expect(invalidCtx.why).toContain('General consumption habits');
  });

  it('calculateCarbonStats runs enterprise formulas based on onboarding surveys', () => {
    const mockOnboarding: OnboardingData = {
      transType: 'car',
      transDistWeekly: 100,
      monthlyElectricBill: 250,
      acUsage: 'medium',
      diet: 'nonvegetarian',
      shopFreq: 'weekly',
      fastFashion: true,
      recycleHabits: 'partial',
      wasteSegregation: false,
    };

    const stats = CarbonEngine.calculateCarbonStats(mockOnboarding);
    expect(stats.score).toBeGreaterThanOrEqual(10);
    expect(stats.score).toBeLessThanOrEqual(100);
    expect(stats.breakdown.transport).toBeGreaterThan(0);
    expect(stats.breakdown.electricity).toBeGreaterThan(0);
    expect(stats.breakdown.food).toBeGreaterThan(0);
    expect(stats.breakdown.shopping).toBeGreaterThan(0);
    expect(stats.breakdown.waste).toBeGreaterThan(0);
    expect(stats.annualAverage).toBeGreaterThan(0);
    expect(stats.treesEquivalent).toBeGreaterThan(0);
  });

  it('estimateLogImpact maps text logs via offline heuristic classifier', () => {
    const driveImpact = CarbonEngine.estimateLogImpact('Drove gasoline SUV to park');
    expect(driveImpact.category).toBe('transport');
    expect(driveImpact.isAddition).toBe(true);
    expect(driveImpact.co2Difference).toBe(12.5);

    const veganMeal = CarbonEngine.estimateLogImpact('Had a vegan and healthy bowl');
    expect(veganMeal.category).toBe('food');
    expect(veganMeal.isAddition).toBe(false);
    expect(veganMeal.co2Difference).toBe(-2.1);

    const energySaver = CarbonEngine.estimateLogImpact('unplug stand-by systems');
    expect(energySaver.category).toBe('energy');
    expect(energySaver.isAddition).toBe(false);

    const compostSaver = CarbonEngine.estimateLogImpact('started a backyard build with compost recycling');
    expect(compostSaver.category).toBe('waste');
    expect(compostSaver.isAddition).toBe(false);

    const genericLog = CarbonEngine.estimateLogImpact('Read about environmental solutions');
    expect(genericLog.category).toBe('general');
    expect(genericLog.isAddition).toBe(false);
  });
});
