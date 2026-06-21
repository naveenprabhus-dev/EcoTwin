import { useState, useEffect } from 'react';
import { WeeklyReportData } from '../types/reports';

export function useReports(userId: string) {
  const [reports, setReports] = useState<WeeklyReportData[]>([]);
  const [isActiveLoading, setIsActiveLoading] = useState(false);

  useEffect(() => {
    if (userId) {
      setIsActiveLoading(true);
      // Populate standard initial reports for stable experience
      setReports([
        {
          reportId: 'rep_1',
          weekNumber: 1,
          startDate: '2026-06-01',
          endDate: '2026-06-07',
          aiInsightsText: 'You did exceptionally well with energy! Keep unplugging standby systems to prevent coal overhead grid leakage.',
          avertedCO2: 18.4,
          complianceRate: 85,
          topPerformingCategory: 'energy',
          suggestedImprovements: [
            'Commute via public transport once more instead of private transportation.',
            'Opt for a vegetarian dinner menu weekly to reduce cattle farm footprint impact.'
          ]
        }
      ]);
      setIsActiveLoading(false);
    }
  }, [userId]);

  return {
    reports,
    isActiveLoading
  };
}
