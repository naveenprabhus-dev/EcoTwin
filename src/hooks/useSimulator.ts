import { useState } from 'react';
import { CarbonStats } from '../types';
import { SimulatorService } from '../services/simulatorService';

export function useSimulator(initialStats: CarbonStats) {
  const [targetReductionPercent, setTargetReductionPercent] = useState<number>(15);
  const [horizonYears, setHorizonYears] = useState<number>(1);

  const projection = SimulatorService.forecastReduction(initialStats, targetReductionPercent, horizonYears);

  return {
    targetReductionPercent,
    setTargetReductionPercent,
    horizonYears,
    setHorizonYears,
    projection
  };
}
