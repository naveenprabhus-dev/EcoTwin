/**
 * Biosphere stage representation for the virtual companion planet.
 */
export type BiosphereStage = 'Crisis' | 'Recovery' | 'Thriving' | 'Guardian';

/**
 * Domain entity governing the carbon score, streak health, and companion eco state.
 */
export class PlanetStateDomain {
  constructor(
    public readonly score: number,
    public readonly activeStreak: number,
    public readonly pulseStatus: 'stable' | 'vibrant' | 'needs-attention'
  ) {}

  /**
   * Translates score into a high-fidelity aesthetic biosphere stage.
   */
  public getBiosphereStage(): BiosphereStage {
    if (this.score < 40) return 'Crisis';
    if (this.score < 65) return 'Recovery';
    if (this.score < 85) return 'Thriving';
    return 'Guardian';
  }

  /**
   * Computes the scale multiplier for the companion model rendering.
   */
  public getCompanionScaleMultiplier(): number {
    // Healthy streak scales size gracefully
    const bonus = Math.min(this.activeStreak * 0.05, 0.3);
    return 1.0 + bonus;
  }
}
