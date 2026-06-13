import { describe, it, expect } from 'vitest';
import { calculateCarbonStats } from '../server/db';

describe('calculateCarbonStats', () => {
  it('correctly calculates baseline carbon stats for default onboarding setup', () => {
    const stats = calculateCarbonStats({
      transType: 'public',
      transDistWeekly: 50,
      monthlyElectricBill: 80,
      acUsage: 'medium',
      diet: 'vegetarian',
      shopFreq: 'weekly',
      fastFashion: false,
      recycleHabits: 'partial',
      wasteSegregation: true
    });

    // Verify properties exist
    expect(stats).toBeDefined();
    expect(stats.score).toBeGreaterThan(0);
    expect(stats.score).toBeLessThanOrEqual(100);
    expect(stats.breakdown).toBeDefined();
    
    // Transport monthly estimate: 50 * 4.3 * 0.05 = 10.75 -> approx 11
    expect(stats.breakdown.transport).toBe(11);
    
    // Electricity monthly estimate: 80 * 5 * 0.4 = 160. AC medium: 75
    expect(stats.breakdown.electricity).toBe(235);
  });

  it('grades strict walking and bicycle diets higher than car driving and heavy eating habits', () => {
    const ecoFriendly = calculateCarbonStats({
      transType: 'walking',
      transDistWeekly: 10,
      monthlyElectricBill: 20,
      acUsage: 'none',
      diet: 'vegetarian',
      shopFreq: 'rarely',
      fastFashion: false,
      recycleHabits: 'full',
      wasteSegregation: true
    });

    const highCarbon = calculateCarbonStats({
      transType: 'car',
      transDistWeekly: 200,
      monthlyElectricBill: 300,
      acUsage: 'high',
      diet: 'nonvegetarian',
      shopFreq: 'daily',
      fastFashion: true,
      recycleHabits: 'none',
      wasteSegregation: false
    });

    // Score comparison: Clean travel & low consumption rewards a higher score
    expect(ecoFriendly.score).toBeGreaterThan(highCarbon.score);
    
    // Total carbon output comparison
    expect(ecoFriendly.breakdown.total).toBeLessThan(highCarbon.breakdown.total);
  });
});
