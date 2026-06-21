import { CarbonStats, LoggedEntry } from './carbon';

export interface WeeklyReportData {
  reportId: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  aiInsightsText: string;
  avertedCO2: number; // kg
  complianceRate: number; // %
  topPerformingCategory: string;
  suggestedImprovements: string[];
}

export interface ReportStatistics {
  weekNumber: number;
  stats: CarbonStats;
  logsCount: number;
  efficiencyIndex: number;
}
