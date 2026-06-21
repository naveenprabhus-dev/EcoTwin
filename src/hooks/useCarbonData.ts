import { useState, useEffect } from 'react';
import { CarbonStats, LoggedEntry } from '../types';
import { CarbonEngine } from '../services/CarbonEngine';

export function useCarbonData(userId: string, initialStats?: CarbonStats, initialLogs?: LoggedEntry[]) {
  const [stats, setStats] = useState<CarbonStats | null>(initialStats || null);
  const [logs, setLogs] = useState<LoggedEntry[]>(initialLogs || []);

  useEffect(() => {
    if (initialStats) setStats(initialStats);
    if (initialLogs) setLogs(initialLogs);
  }, [initialStats, initialLogs]);

  const addCustomLogEntry = (category: any, activity: string, co2: number, xp: number) => {
    const newEntry: LoggedEntry = {
      id: 'custom_' + Math.random().toString(36).substring(2),
      date: new Date().toLocaleDateString(),
      category,
      activity,
      co2Difference: co2,
      xpReward: xp,
      isCustom: true
    };
    setLogs(prev => [newEntry, ...prev]);

    // recalculate score on the fly
    if (stats) {
      const breakdown = { ...stats.breakdown };
      if (breakdown[category as keyof typeof stats.breakdown] !== undefined) {
        breakdown[category as keyof typeof stats.breakdown] = Math.max(0, breakdown[category as keyof typeof stats.breakdown] + co2);
      }
      const total = breakdown.transport + breakdown.electricity + breakdown.food + breakdown.shopping + breakdown.waste;
      const dailyAverage = Number((total / 30.4).toFixed(1));
      const annualAverage = Number((total * 12 / 1000).toFixed(1));
      const score = Math.max(10, Math.min(100, stats.score - Math.round(co2 * 0.1)));

      setStats({
        ...stats,
        score,
        breakdown: {
          ...breakdown,
          total
        },
        dailyAverage,
        annualAverage
      });
    }
  };

  const equivalents = stats ? CarbonEngine.getRealWorldEquivalents(stats.carbonSavedThisMonth || 45) : { treeDays: 0, drivingKm: 0, ledHours: 0, laptopCharges: 0 };

  return {
    stats,
    logs,
    equivalents,
    addCustomLogEntry
  };
}
