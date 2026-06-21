import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Logger } from './shared/utils/logger';
import { Analytics } from './shared/utils/analytics';
import { ErrorTracker } from './shared/utils/errorTracker';
import { UserDomain } from './domain/User';
import { CarbonProfileDomain } from './domain/CarbonProfile';
import { SustainabilityPlanDomain } from './domain/SustainabilityPlan';
import { PlanetStateDomain } from './domain/PlanetState';
import { EcoBuddyMemoryDomain } from './domain/EcoBuddyMemory';
import { OfflineStorage } from './services/OfflineStorage';

describe('EcoTwin Production Infrastructure Suite', () => {
  beforeEach(() => {
    Logger.clearHistory();
    Analytics.clearEvents();
    ErrorTracker.clear();
    OfflineStorage.clearQueuedLogs();
    OfflineStorage.clearQueuedChallenges();
  });

  describe('Observability Framework Tests', () => {
    it('accurately writes structured system logs', () => {
      Logger.info('Establishing clean engine state', 'TEST_CONTEXT', { service: 'CORE' });
      const logs = Logger.getHistory();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toBe('Establishing clean engine state');
      expect(logs[0].context).toBe('TEST_CONTEXT');
      expect(logs[0].level).toBe('INFO');
    });

    it('buffers telemetry events safely', () => {
      Analytics.track('user_onboarding_completed', 'usr_demo', { stage: 3 });
      const events = Analytics.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventName).toBe('user_onboarding_completed');
      expect(events[0].userId).toBe('usr_demo');
      expect(events[0].properties.stage).toBe(3);
    });

    it('captures and formats native diagnostics exceptions', () => {
      const error = new Error('Database write failure');
      ErrorTracker.capture(error, 'AUTH_SYNC', true);
      const errBuffer = ErrorTracker.getErrors();
      expect(errBuffer).toHaveLength(1);
      expect(errBuffer[0].message).toBe('Database write failure');
      expect(errBuffer[0].context).toBe('AUTH_SYNC');
      expect(errBuffer[0].fatal).toBe(true);
    });
  });

  describe('Domain Domain Entity Modelling Tests', () => {
    it('UserDomain instantiates raw payload validation', () => {
      const user = UserDomain.fromRaw({
        userId: 'usr_abc',
        email: 'user@test.org',
        name: 'Alex',
        onboarded: true
      });
      expect(user.isValid()).toBe(true);
      expect(user.name).toBe('Alex');
    });

    it('CarbonProfileDomain evaluates offsets and equivalency scales correctly', () => {
      const profileInfo = new CarbonProfileDomain('usr_abc', [], {
        score: 85,
        dailyAverage: 3.2,
        monthlyAverage: 96,
        annualAverage: 1100,
        treesEquivalent: 10,
        carbonSavedThisMonth: 12.5,
        breakdown: { total: 218 } // Exactly 10 trees (218 / 21.8)
      });
      expect(profileInfo.getTreesEquivalentOffset()).toBe(10);
    });

    it('SustainabilityPlanDomain projects modular reductions annual rate', () => {
      const plan = new SustainabilityPlanDomain('usr_abc', [
        {
          day: 1,
          title: 'Day 1',
          tasks: [
            { id: '1', title: 'Task 1', description: 'desc', co2Savings: 5.5, xpValue: 10, completed: true },
            { id: '2', title: 'Task 2', description: 'desc', co2Savings: 4.5, xpValue: 15, completed: false }
          ]
        }
      ], 10); // 10 kg weekly total plan savings
      expect(plan.getCompletionPercentage()).toBe(50);
      expect(plan.projectAnnualReduction()).toBe(520);
    });

    it('PlanetStateDomain translates scores to stages and scale factors', () => {
      const state = new PlanetStateDomain(90, 4, 'vibrant');
      expect(state.getBiosphereStage()).toBe('Guardian');
      expect(state.getCompanionScaleMultiplier()).toBeCloseTo(1.2);
    });

    it('EcoBuddyMemoryDomain queues interaction arrays flawlessly', () => {
      const memory = new EcoBuddyMemoryDomain('session_1');
      memory.addMessage('user', 'What are solar panels saving?');
      memory.addMessage('assistant', 'Solar panels reduce standby grid carbon.');
      const list = memory.getMessages();
      expect(list).toHaveLength(2);
      expect(list[0].sender).toBe('user');
      expect(memory.formatConversationLog()).toContain('USER: What are solar panels saving?');
    });
  });

  describe('Offline Caching & Resilience Storage Tests', () => {
    it('queues user actions locally during offline gaps', () => {
      expect(OfflineStorage.getQueuedLogs()).toHaveLength(0);
      OfflineStorage.queueLogAction('transport', 'Ride bicycle', -2.5, 30);
      const queue = OfflineStorage.getQueuedLogs();
      expect(queue).toHaveLength(1);
      expect(queue[0].activity).toBe('Ride bicycle');
      expect(queue[0].co2).toBe(-2.5);
    });

    it('queues offline completed challenge triggers', () => {
      OfflineStorage.queueChallengeCompletion('ch_green_commute');
      const queue = OfflineStorage.getQueuedChallenges();
      expect(queue).toHaveLength(1);
      expect(queue[0].challengeId).toBe('ch_green_commute');
    });
  });
});
