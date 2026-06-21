import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PlanetPulseEcosystem } from './services/PlanetPulseEcosystem';
import PlanetPulseEcosystemView from './components/PlanetPulseEcosystemView';
import { UserProfile } from './types';

// Mock motion
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>{children}</div>
    ),
  },
}));

describe('PlanetPulseEcosystem Tests (Service & Component)', () => {
  const mockProfile: UserProfile = {
    userId: 'usr_xyz',
    email: 'abc@gmail.com',
    name: 'Ronaldo',
    onboarded: true,
    onboarding: {} as any,
    stats: {
      score: 85,
      breakdown: { total: 100 } as any,
    } as any,
    companion: {
      name: 'Pikachu',
      level: 4,
      xp: 200,
      xpNeeded: 500,
      streak: 5,
      equippedAccessories: [],
      unlockedAccessories: ['hat'],
    },
    challenges: [],
    logs: [],
    conversations: [],
  };

  describe('PlanetPulseEcosystem Service Layer', () => {
    it('calculates correct pulse based on high score and active streak', () => {
      const pulse = PlanetPulseEcosystem.getEcosystemPulse(mockProfile);
      expect(pulse.pulseStatus).toBe('vibrant');
      expect(pulse.streakDays).toBe(5);
      expect(pulse.companionScale).toBe(1.2); // 1 + 4 * 0.05
    });

    it('returns needs-attention when score is critical', () => {
      const lowProfile = {
        ...mockProfile,
        stats: { score: 30 } as any,
      };
      const pulse = PlanetPulseEcosystem.getEcosystemPulse(lowProfile);
      expect(pulse.pulseStatus).toBe('needs-attention');
    });

    it('returns descriptive streak messages', () => {
      expect(PlanetPulseEcosystem.getStreakNarrative({ streak: 0 } as any))
        .toContain('Start an eco-saving streak today');
      
      expect(PlanetPulseEcosystem.getStreakNarrative({ streak: 2 } as any))
        .toContain('logged green habits for 2 consecutive days');

      expect(PlanetPulseEcosystem.getStreakNarrative({ streak: 5 } as any))
        .toContain('Amazing consecutive streak of 5 days!');
    });
  });

  describe('PlanetPulseEcosystemView Component', () => {
    it('renders Level 4: Planet Guardian state when score >= 80', () => {
      render(<PlanetPulseEcosystemView score={90} />);
      expect(screen.getByText('Level 4: Planet Guardian')).toBeInTheDocument();
      expect(screen.getByText(/Fully restored planetary ecosystem/)).toBeInTheDocument();
    });

    it('renders Level 3: Thriving when score is 60-79', () => {
      render(<PlanetPulseEcosystemView score={70} />);
      expect(screen.getByText('Level 3: Thriving')).toBeInTheDocument();
    });

    it('renders Level 2: Recovery when score is 40-59', () => {
      render(<PlanetPulseEcosystemView score={50} />);
      expect(screen.getByText('Level 2: Recovery')).toBeInTheDocument();
    });

    it('renders Level 1: Crisis when score < 40', () => {
      render(<PlanetPulseEcosystemView score={25} />);
      expect(screen.getByText('Level 1: Crisis')).toBeInTheDocument();
      expect(screen.getByText('☣️ OUTBREAK REGIME')).toBeInTheDocument();
    });
  });
});
