export interface PlanTask {
  id: string;
  title: string;
  description: string;
  co2Savings: number;
  xpValue: number;
  completed: boolean;
}

export interface PlanDay {
  day: number;
  title: string;
  tasks: PlanTask[];
}

/**
 * Domain model representing a structured multi-day carbon mitigation roadmap.
 */
export class SustainabilityPlanDomain {
  constructor(
    public readonly userId: string,
    public readonly days: PlanDay[],
    public readonly totalCalculatedSavings: number
  ) {}

  /**
   * Evaluates completion rate of the entire plan.
   */
  public getCompletionPercentage(): number {
    let totalTasks = 0;
    let completedTasks = 0;

    this.days.forEach(d => {
      d.tasks.forEach(t => {
        totalTasks++;
        if (t.completed) completedTasks++;
      });
    });

    if (totalTasks === 0) return 100;
    return Math.round((completedTasks / totalTasks) * 100);
  }

  /**
   * Projects annual cumulative reduction in kilograms of carbon based on current habits.
   */
  public projectAnnualReduction(): number {
    return this.totalCalculatedSavings * 52; // Weekly to annual scaling
  }
}
