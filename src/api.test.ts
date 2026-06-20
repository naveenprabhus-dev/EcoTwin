import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  calculateCarbonStats, 
  getUserProfile, 
  updateUserProfile, 
  getLeaderboard,
  DEFAULT_ONBOARDING
} from '../server/db';

// Mock fs readFileSync/writeFileSync so it doesn't write to local files during test runner runs
vi.mock('fs', async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(false),
    writeFileSync: vi.fn(),
    readFileSync: vi.fn().mockReturnValue('{}'),
  };
});

// Mock firebase-admin completely to prevent active network connects on test ports
vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn().mockReturnValue([]),
  initializeApp: vi.fn(),
  getApp: vi.fn(),
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: vi.fn().mockReturnValue({
    collection: vi.fn().mockReturnValue({
      doc: vi.fn().mockReturnValue({
        set: vi.fn().mockResolvedValue(true),
      }),
      get: vi.fn().mockResolvedValue({
        size: 0,
        forEach: vi.fn(),
      }),
    }),
  }),
}));

describe('Data Persistence & Server DB Utility Engine', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('creates a beautiful new companion profile on first-time login', () => {
      const uniqueId = `usr_${Math.random()}`;
      const profile = getUserProfile(uniqueId, 'hero@ecotwin.com');

      expect(profile).toBeDefined();
      expect(profile.userId).toBe(uniqueId);
      expect(profile.email).toBe('hero@ecotwin.com');
      expect(profile.name).toBe('hero');
      expect(profile.companion.name).toBe('Sprout');
      expect(profile.companion.level).toBe(1);
    });

    it('returns existing companion profile without overwriting on subsequent requests', () => {
      const userId = 'usr-classic';
      const original = getUserProfile(userId, 'classic@ecotwin.com');
      
      // Update name
      updateUserProfile(userId, (prof) => {
        prof.name = 'Updated Classic';
        prof.companion.level = 4;
      });

      const retrieved = getUserProfile(userId);
      expect(retrieved.name).toBe('Updated Classic');
      expect(retrieved.companion.level).toBe(4);
    });
  });

  describe('getLeaderboard', () => {
    it('generates leaderboard including the requested user with correct sorting', () => {
      const leaderboard = getLeaderboard('usr-classic');

      expect(leaderboard).toBeDefined();
      expect(leaderboard.length).toBe(6); // 1 self user + 5 community seeds

      // Check sorting matches descending order of carbon scores
      for (let i = 0; i < leaderboard.length - 1; i++) {
        expect(leaderboard[i].score).toBeGreaterThanOrEqual(leaderboard[i + 1].score);
      }
    });
  });
});
