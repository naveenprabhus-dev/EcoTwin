import { UserChallengeState } from '../types/challenges';
import { LoggedEntry, CarbonStats, OnboardingData } from '../types/carbon';
import { CompanionState } from '../types/ecoBuddy';

/**
 * Domain entity representing the active User Profile in the platform.
 */
export class UserDomain {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly name: string,
    public readonly onboarded: boolean,
    public readonly onboarding: OnboardingData,
    public readonly companion: CompanionState,
    public readonly challenges: UserChallengeState[],
    public readonly logs: LoggedEntry[],
    public readonly stats: CarbonStats
  ) {}

  /**
   * Validates user data fields for basic integrity checks.
   */
  public isValid(): boolean {
    if (!this.userId || this.userId.trim() === '') return false;
    if (!this.email || !this.email.includes('@')) return false;
    if (!this.name || this.name.trim() === '') return false;
    return true;
  }

  /**
   * Instantiates a UserDomain model from a raw database profile object.
   */
  public static fromRaw(raw: any): UserDomain {
    return new UserDomain(
      raw.userId || '',
      raw.email || '',
      raw.name || '',
      !!raw.onboarded,
      raw.onboarding || {},
      raw.companion || { name: 'Companion', level: 1, xp: 0, xpNeeded: 100, streak: 0, equippedAccessories: [], unlockedAccessories: [] },
      raw.challenges || [],
      raw.logs || [],
      raw.stats || { score: 100, breakdown: { total: 0 }, dailyAverage: 0, monthlyAverage: 0, annualAverage: 0, treesEquivalent: 0, carbonSavedThisMonth: 0 }
    );
  }
}
