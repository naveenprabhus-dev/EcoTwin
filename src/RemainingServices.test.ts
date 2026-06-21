import { describe, it, expect } from 'vitest';
import { EcoBuddyService } from './services/ecoBuddyService';
import { ChallengeService } from './services/challengeService';
import { ReportService } from './services/reportService';
import { SimulatorService } from './services/simulatorService';
import { Goal, ActionPlanTask, UserProfile, Challenge, CarbonStats } from './types';

describe('Helper Services Unit Tests', () => {
  describe('EcoBuddyService', () => {
    it('getBuddyGoalFeedback returns progressive feedback', () => {
      const goal: Goal = {
        id: 'g1',
        title: 'Weekly target',
        category: 'energy',
        targetDate: '2026-06-25',
        completed: false,
        targetValue: 100,
        currentValue: 110,
        unit: 'kg',
      };
      expect(EcoBuddyService.getBuddyGoalFeedback(goal)).toContain('perfectly crushed');

      goal.currentValue = 85;
      expect(EcoBuddyService.getBuddyGoalFeedback(goal)).toContain('incredibly close');

      goal.currentValue = 20;
      expect(EcoBuddyService.getBuddyGoalFeedback(goal)).toContain('Keep swapping');
    });

    it('getSelectionExplanation yields descriptions for transport, food, energy, shopping, waste', () => {
      const mockProfile: UserProfile = {
        userId: 'u',
        email: 'e',
        name: 'N',
        onboarded: true,
        onboarding: {
          transType: 'car',
          diet: 'nonvegetarian',
        } as any,
        stats: {} as any,
        companion: {} as any,
        challenges: [],
        logs: [],
        conversations: [],
      };

      const task: ActionPlanTask = {
        id: 't',
        day: 1,
        title: 'T',
        description: 'D',
        category: 'transport',
        co2Reduction: 2,
        difficulty: 'easy',
        impact: 'low',
        completed: false,
      };

      expect(EcoBuddyService.getSelectionExplanation(task, mockProfile)).toContain('single-occupant');

      task.category = 'food';
      expect(EcoBuddyService.getSelectionExplanation(task, mockProfile)).toContain('swapping red meats');

      task.category = 'energy';
      expect(EcoBuddyService.getSelectionExplanation(task, mockProfile)).toContain('vampire');

      task.category = 'shopping';
      expect(EcoBuddyService.getSelectionExplanation(task, mockProfile)).toContain('circular thrifting');

      task.category = 'waste';
      expect(EcoBuddyService.getSelectionExplanation(task, mockProfile)).toContain('segregating organics');

      task.category = 'something_else' as any;
      expect(EcoBuddyService.getSelectionExplanation(task, mockProfile)).toContain('Formulated contextually');
    });
  });

  describe('ChallengeService', () => {
    it('checkLoggedCategorySuccess accurately spots matches', () => {
      const challenge: Challenge = {
        id: 'c',
        title: 'T',
        category: 'energy',
        description: 'D',
        xpReward: 20,
        co2Saved: 1.5,
        daily: false,
      };

      const logs = [
        { category: 'food', co2Difference: -1.0 },
        { category: 'energy', co2Difference: -2.0 },
      ] as any[];
      expect(ChallengeService.checkLoggedCategorySuccess(challenge, logs)).toBe(true);

      expect(ChallengeService.checkLoggedCategorySuccess(challenge, [])).toBe(false);
    });

    it('calculateXpRequirement returns exponential level thresholds', () => {
      expect(ChallengeService.calculateXpRequirement(1)).toBe(100);
      expect(ChallengeService.calculateXpRequirement(2)).toBe(150);
      expect(ChallengeService.calculateXpRequirement(3)).toBe(225);
    });
  });

  describe('ReportService', () => {
    it('calculateComplianceRate calculates percentages safely', () => {
      expect(ReportService.calculateComplianceRate([])).toBe(0);

      const logs = [
        { co2Difference: -1.0 } as any,
        { co2Difference: 0 } as any,
        { co2Difference: 1.5 } as any,
      ];
      // 2 completed out of 3 total = 67%
      expect(ReportService.calculateComplianceRate(logs)).toBe(67);
    });

    it('compileSuggestedImprovements maps stats breakdown to tips', () => {
      const stats: CarbonStats = {
        score: 60,
        breakdown: {
          transport: 150,
          electricity: 200,
          food: 120,
          shopping: 40,
          waste: 50,
          total: 560,
        },
        dailyAverage: 1.0,
        monthlyAverage: 560,
        annualAverage: 6.7,
        treesEquivalent: 50,
        carbonSavedThisMonth: 10,
      };

      const tips = ReportService.compileSuggestedImprovements(stats);
      expect(tips).toContain('Swap 2 single-passenger car drives for walking, bicycle rides, or public rail routes.');
      expect(tips).toContain('Unplug standing TV system loads and idle phone chargers overnight to trim grid vampire loads.');
      expect(tips).toContain('Swap beef/mutton with tasty poultry, fiber-rich legumes, or plant-based proteins twice weekly.');
      expect(tips).toContain('Implement strict backyard food scrap composting and separate clean reuse paper/plastics.');
    });
  });

  describe('SimulatorService', () => {
    it('forecasts co2 saved correctly over years scale', () => {
      const stats: CarbonStats = {
        score: 70,
        breakdown: {
          transport: 100,
          electricity: 100,
          food: 100,
          shopping: 50,
          waste: 50,
          total: 400,
        },
        dailyAverage: 1.0,
        monthlyAverage: 400,
        annualAverage: 4.8,
        treesEquivalent: 50,
        carbonSavedThisMonth: 10,
      };

      const result = SimulatorService.forecastReduction(stats, 20, 2);
      expect(result.currentAnnual).toBe(4800);
      expect(result.predictedAnnual).toBe(7680);
      expect(result.expectedCO2Saved).toBe(1920);
    });
  });
});
