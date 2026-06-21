import { OnboardingData, CarbonStats } from '../types';

/**
 * Constants and multipliers used by the Carbon Calculation Engine.
 * Highly aligned with enterprise sustainability metrics.
 */
export const CARBON_MULTIPLIERS = {
  transport: {
    walking: 0.0,
    bicycle: 0.0,
    public: 0.05,
    twowheeler: 0.12,
    car: 0.20,
    flight: 0.25,
  },
  electricity: {
    kwhRate: 0.114,
    kgCo2PerKwh: 0.4,
  },
  acUsage: {
    none: 0,
    low: 30,
    medium: 75,
    high: 150,
  },
  diet: {
    vegetarian: 80,
    eggetarian: 120,
    nonvegetarian: 250,
  },
  shopping: {
    rarely: 20,
    weekly: 80,
    daily: 200,
    fastFashionSurcharge: 50,
  },
  waste: {
    none: 40,
    partial: 20,
    full: 5,
    noSegregationSurcharge: 10,
  },
};

export class CarbonEngine {
  public static readonly MULTIPLIERS = CARBON_MULTIPLIERS;

  /**
   * Calculates user carbon footprints and overall ecology health metrics
   * based on provided high-level onboarding questions.
   * 
   * @param data OnboardingData submitted by the user
   * @returns CarbonStats compiled metric reports
   */
  public static calculateCarbonStats(data: OnboardingData): CarbonStats {
    const multipliers = CARBON_MULTIPLIERS;
    // 1. Calculate Transportation output
    const transFactor = multipliers.transport[data.transType] ?? 0.05;
    const transportMonthly = Math.round(data.transDistWeekly * 4.3 * transFactor);

    // 2. Calculate Energy & Electricity/AC output
    const electricityMonthly = Math.round(
      data.monthlyElectricBill * 
      multipliers.electricity.kwhRate * 
      multipliers.electricity.kgCo2PerKwh
    );
    const acFactor = multipliers.acUsage[data.acUsage] ?? 75;
    const energyMonthly = electricityMonthly + acFactor;

    // 3. Calculate Diet outputs
    const foodMonthly = multipliers.diet[data.diet] ?? 80;

    // 4. Calculate Shopping behavior outputs
    let shoppingMonthly = multipliers.shopping[data.shopFreq] ?? 80;
    if (data.fastFashion) {
      shoppingMonthly += multipliers.shopping.fastFashionSurcharge;
    }

    // 5. Calculate Waste processing outputs
    let wasteMonthly = multipliers.waste[data.recycleHabits] ?? 20;
    if (!data.wasteSegregation) {
      wasteMonthly += multipliers.waste.noSegregationSurcharge;
    }

    // 6. Aggregate outputs
    const totalMonthly = transportMonthly + energyMonthly + foodMonthly + shoppingMonthly + wasteMonthly;
    const dailyAverage = Number((totalMonthly / 30.4).toFixed(1));
    const monthlyAverage = totalMonthly;
    const annualAverage = Number((totalMonthly * 12 / 1000).toFixed(1));

    // Determine overall green score out of 100
    let score = 100 - Math.min(100, Math.max(0, Math.round(((totalMonthly - 200) / 800) * 80)));
    if (score < 10) {
      score = 10;
    }

    // Calculate equivalent offset trees
    const treesEquivalent = Math.round(totalMonthly / 1.83);

    return {
      score,
      breakdown: {
        transport: transportMonthly,
        electricity: energyMonthly,
        food: foodMonthly,
        shopping: shoppingMonthly,
        waste: wasteMonthly,
        total: totalMonthly,
      },
      dailyAverage,
      monthlyAverage,
      annualAverage,
      treesEquivalent,
      carbonSavedThisMonth: 45, // Healthy default baseline
    };
  }

  /**
   * Offline heuristic algorithm to estimate added or saved CO2 emissions and XP points
   * based on user action logs.
   */
  public static estimateLogImpact(activity: string, isImage: boolean = false) {
    const lowered = (activity || '').toLowerCase();
    let detectedActivityName = activity || (isImage ? 'Uploaded action image' : 'Custom activity log');
    let predictedCategory: 'transport' | 'energy' | 'food' | 'shopping' | 'waste' | 'general' = 'general';
    let predictedCo2 = -1.5;
    let predictedXp = 20;
    let isAddition = false;
    let explanation = 'Predicted using local eco-action heuristics engine.';

    if (
      lowered.includes('drive') || 
      lowered.includes('car') || 
      lowered.includes('fly') || 
      lowered.includes('flight') || 
      lowered.includes('suv') || 
      lowered.includes('petrol') || 
      lowered.includes('gasoline')
    ) {
      detectedActivityName = activity || 'Drove gasoline vehicle';
      predictedCategory = 'transport';
      predictedCo2 = 12.5;
      predictedXp = 35;
      isAddition = true;
      explanation = 'Driving fossil-fuel transit adds massive CO2 emissions to the atmosphere.';
    } else if (
      lowered.includes('beef') || 
      lowered.includes('steak') || 
      lowered.includes('meat') || 
      lowered.includes('hamburger')
    ) {
      detectedActivityName = activity || 'Ate resource-heavy beef';
      predictedCategory = 'food';
      predictedCo2 = 4.8;
      predictedXp = 20;
      isAddition = true;
      explanation = 'Beef farming releases extreme methane and consumes critical agricultural land.';
    } else if (
      lowered.includes('unplug') || 
      lowered.includes('led') || 
      lowered.includes('solar') || 
      lowered.includes('cold water')
    ) {
      detectedActivityName = activity || 'Vampire energy reduction';
      predictedCategory = 'energy';
      predictedCo2 = -1.8;
      predictedXp = 25;
      isAddition = false;
      explanation = 'Reducing standby power loads directly curbs power grid overhead.';
    } else if (lowered.includes('recycle') || lowered.includes('compost')) {
      detectedActivityName = activity || 'Organic waste composting';
      predictedCategory = 'waste';
      predictedCo2 = -1.2;
      predictedXp = 20;
      isAddition = false;
      explanation = 'Proper organic division averts high methane landfill emissions.';
    } else if (
      lowered.includes('plant-based') || 
      lowered.includes('vegan') || 
      lowered.includes('vegetarian') || 
      lowered.includes('vegetable')
    ) {
      detectedActivityName = activity || 'Had a plant-based meal';
      predictedCategory = 'food';
      predictedCo2 = -2.1;
      predictedXp = 30;
      isAddition = false;
      explanation = 'Plant-based diet drastically lowers agricultural land use and greenhouse gas output.';
    } else if (activity) {
      if (
        lowered.includes('coal') || 
        lowered.includes('wasteful') || 
        lowered.includes('trash') || 
        lowered.includes('plastic bag') || 
        lowered.includes('fast fashion')
      ) {
        predictedCategory = 'general';
        predictedCo2 = 3.5;
        predictedXp = 15;
        isAddition = true;
        explanation = 'Increased consumption habits generate incremental overhead burden on local grids.';
      } else {
        detectedActivityName = activity;
        predictedCategory = 'general';
        predictedCo2 = -1.5;
        predictedXp = 15;
        isAddition = false;
        explanation = 'Responsible eco-habit lowers custom carbon index.';
      }
    }

    return {
      activity: detectedActivityName,
      category: predictedCategory,
      co2Difference: predictedCo2,
      xpReward: predictedXp,
      isAddition,
      explanation,
    };
  }
}
