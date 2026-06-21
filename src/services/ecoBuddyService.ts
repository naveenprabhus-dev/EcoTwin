import { UserProfile, ActionPlanTask, Goal } from '../types';

export class EcoBuddyService {
  /**
   * Generates friendly coaching guidance based on active goals.
   */
  public static getBuddyGoalFeedback(goal: Goal): string {
    const remaining = goal.targetValue - goal.currentValue;
    if (remaining <= 0) {
      return `Phenomenal! You've perfectly crushed this goal. Sprout is looking exceptionally radiant! 🌟`;
    }
    const ratio = goal.currentValue / goal.targetValue;
    if (ratio >= 0.7) {
      return `We're so incredibly close to completing this! Just a few more green actions and we strike gold.`;
    }
    return `Keep swapping habits! Consistently tracking this category brings us closer to a pristine, cleaner atmosphere.`;
  }

  /**
   * Explains why a specific action was selected in the Adaptive Action Planner.
   * Fulfills Phase 2 checklist.
   */
  public static getSelectionExplanation(task: ActionPlanTask, profile: UserProfile): string {
    const type = task.category;
    const trans = profile.onboarding?.transType || 'car';
    const diet = profile.onboarding?.diet || 'nonvegetarian';

    if (type === 'transport') {
      if (trans === 'car') {
        return `Selected because single-occupant fossil travel contributes the majority of your weekly carbon profile. Cycling or buses represents your highest impact pivot.`;
      }
      return `Chosen to further build on your eco-friendly active transit style and maximize aerobic calorie burns!`;
    }
    if (type === 'food') {
      if (diet === 'nonvegetarian') {
        return `Selected since swapping red meats for wholesome plant-based substitutes is globally recognized as the single fastest method to scale down lifestyle methane.`;
      }
      return `Designed to lower grocery transport food miles by introducing localized organic seasonal vegetables.`;
    }
    if (type === 'energy') {
      return `Selected to target grid vampire electricity leakages. Unplugging stand-by systems trims baseline utility bills.`;
    }
    if (type === 'shopping') {
      return `Selected because circular thrifting completely avoids massive manufacturing, ocean freight, and microplastic production runs.`;
    }
    if (type === 'waste') {
      return `Selected since properly segregating organics for composting prevents high-density anaerobic landfill rotting and carbon gas generation.`;
    }
    return `Formulated contextually from recent active habits is ideal to maintain a perfect consistency score.`;
  }
}
