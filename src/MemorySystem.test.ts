import { describe, it, expect } from 'vitest';
import { MemorySystem } from './services/MemorySystem';
import { UserProfile } from './types';

describe('MemorySystem Service Unit Tests', () => {
  it('getUserMemoryContext correctly compiles complete companion and log contexts', () => {
    const mockProfile: UserProfile = {
      userId: 'test_user_id',
      email: 'user@test.com',
      name: 'Naveen',
      onboarded: true,
      onboarding: {
        transType: 'car',
        transDistWeekly: 50,
        monthlyElectricBill: 120,
        acUsage: 'medium',
        diet: 'vegetarian',
        shopFreq: 'weekly',
        fastFashion: false,
        recycleHabits: 'partial',
        wasteSegregation: true,
      },
      stats: {
        score: 74,
        breakdown: {
          transport: 43,
          electricity: 67,
          food: 80,
          shopping: 20,
          waste: 20,
          total: 230,
        },
        dailyAverage: 7.6,
        monthlyAverage: 230,
        annualAverage: 2.8,
        treesEquivalent: 126,
        carbonSavedThisMonth: 55,
      },
      companion: {
        name: 'EcoSprout',
        level: 3,
        xp: 140,
        xpNeeded: 500,
        streak: 5,
        equippedAccessories: [],
        unlockedAccessories: ['hat'],
      },
      challenges: [
        {
          challengeId: 'chal_1',
          completedAt: '2026-06-20T10:00:00.000Z',
          claimed: true,
        }
      ],
      logs: [
        {
          id: 'log_1',
          date: '2026-06-20',
          activity: 'Ate a healthy plant-based lunch',
          category: 'food',
          co2Difference: -2.1,
          xpReward: 30,
        }
      ],
      conversations: [
        {
          id: 'msg_1',
          sender: 'user',
          text: 'How can I save carbon?',
          dateTime: '2026-06-21T08:00:00.000Z',
        },
        {
          id: 'msg_2',
          sender: 'twin',
          text: 'Unplug stand-by systems!',
          dateTime: '2026-06-21T08:01:00.000Z',
        }
      ],
    };

    const ctx = MemorySystem.getUserMemoryContext(mockProfile);
    expect(ctx).toContain('EcoSprout');
    expect(ctx).toContain('Level 3');
    expect(ctx).toContain('XP Progress: 140');
    expect(ctx).toContain('Daily Streak: 5 days.');
    expect(ctx).toContain('Naveen');
    expect(ctx).toContain('Sustainability Score: 74/100');
    expect(ctx).toContain('Completed eco challenges: 1');
    expect(ctx).toContain('Ate a healthy plant-based lunch');
    expect(ctx).toContain('(-2.1 kg CO₂ saved)');
    expect(ctx).toContain('Travel (43 kg CO₂)');
    expect(ctx).toContain('Electricity/Energy (67 kg CO₂)');
    expect(ctx).toContain('User: "How can I save carbon?"');
    expect(ctx).toContain('EcoSprout: "Unplug stand-by systems!"');
  });

  it('getUserMemoryContext handles empty arrays and default values safely', () => {
    const minProfile: UserProfile = {
      userId: 'test_empty',
      email: 'empty@test.com',
      name: '',
      onboarded: false,
      onboarding: {} as any,
      stats: undefined as any,
      companion: undefined as any,
      challenges: undefined as any,
      logs: undefined as any,
      conversations: undefined as any,
    };

    const ctx = MemorySystem.getUserMemoryContext(minProfile);
    expect(ctx).toContain('Sprout');
    expect(ctx).toContain('Level 1');
    expect(ctx).toContain('Daily Streak: 0 days.');
    expect(ctx).toContain('Eco Buddy');
    expect(ctx).toContain('Current Sustainability Score: 50/100');
    expect(ctx).toContain('No actions logged recently.');
    expect(ctx).toContain('No previous chats logged.');
  });
});
