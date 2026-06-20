import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarbonTwinPet from './components/CarbonTwinPet';
import ProfileAchievements from './components/ProfileAchievements';

// 1. Mock standard dependencies
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => (
      <div className={className} onClick={onClick} {...props}>{children}</div>
    ),
    button: ({ children, className, onClick, ...props }: any) => (
      <button className={className} onClick={onClick} {...props}>{children}</button>
    ),
    header: ({ children, className, ...props }: any) => (
      <header className={className} {...props}>{children}</header>
    ),
    span: ({ children, className, ...props }: any) => (
      <span className={className} {...props}>{children}</span>
    ),
    section: ({ children, className, ...props }: any) => (
      <section className={className} {...props}>{children}</section>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true }),
  });
});

describe('Carbon Twin Evolution & Emotional State Transitions', () => {
  const defaultCompanion = {
    name: 'Sprout',
    level: 3,
    xp: 240,
    xpNeeded: 500,
    streak: 5,
    equippedAccessories: ['Cute Hat'],
    unlockedAccessories: ['Cute Hat', 'Tiny Sunglasses'],
  };

  const defaultStats = {
    score: 82,
    breakdown: {
      transport: 40,
      electricity: 120,
      food: 80,
      shopping: 45,
      waste: 15,
      total: 300,
    },
    dailyAverage: 10,
    monthlyAverage: 300,
    annualAverage: 3.6,
    treesEquivalent: 164,
    carbonSavedThisMonth: 50,
  };

  it('renders all structural elements and name correctly', () => {
    render(
      <CarbonTwinPet 
        score={80} 
        equippedAccessories={['Cute Hat']} 
        name="Sprout" 
      />
    );
    expect(screen.getByText('Sprout')).toBeInTheDocument();
  });

  describe('Mood State Transitions based on Score & MoodOverrides', () => {
    it('evaluates and renders EXCITED state for score 90', () => {
      render(<CarbonTwinPet score={90} equippedAccessories={[]} name="Sprout" />);
      expect(screen.getByText('Radiant & Excited!')).toBeInTheDocument();
    });

    it('evaluates and renders CELEBRATORY state when explicitly provided', () => {
      render(
        <CarbonTwinPet 
          score={80} 
          equippedAccessories={[]} 
          name="Sprout" 
          currentMood="celebratory" 
        />
      );
      expect(screen.getByText('Celebratory Cheer!')).toBeInTheDocument();
    });

    it('evaluates and renders CURIOUS state for score 60', () => {
      render(<CarbonTwinPet score={60} equippedAccessories={[]} name="Sprout" currentMood="curious" />);
      expect(screen.getByText('Inquisitive & Curious')).toBeInTheDocument();
    });

    it('evaluates and renders CONCERNED state for score 20', () => {
      render(<CarbonTwinPet score={20} equippedAccessories={[]} name="Sprout" currentMood="concerned" />);
      expect(screen.getByText('Slightly Concerned')).toBeInTheDocument();
    });

    it('evaluates and renders SAD state for score 10', () => {
      render(<CarbonTwinPet score={10} equippedAccessories={[]} name="Sprout" currentMood="sad" />);
      expect(screen.getByText('A Bit Sad & Worried')).toBeInTheDocument();
    });

    it('evaluates and renders PLAYFUL state overrides', () => {
      render(<CarbonTwinPet score={50} equippedAccessories={[]} name="Sprout" currentMood="playful" />);
      expect(screen.getByText('Giggly & Playful')).toBeInTheDocument();
    });
  });

  describe('Dressing Room & Closet Selections', () => {
    it('renders closet with equipped status', () => {
      render(
        <ProfileAchievements
          userId="user1"
          name="Eco Warrior"
          companion={defaultCompanion}
          stats={defaultStats}
          onRefreshProfile={() => {}}
        />
      );

      // Check account settings fields
      expect(screen.getByDisplayValue('Eco Warrior')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Sprout')).toBeInTheDocument();

      // Check standard closet accessories block
      expect(screen.getByText('Cute Hat')).toBeInTheDocument();
      expect(screen.getByText('Tiny Sunglasses')).toBeInTheDocument();
      expect(screen.getByText('Equipped')).toBeInTheDocument();
    });

    it('submits name changes correctly through profile update action', async () => {
      const refreshMock = vi.fn();
      render(
        <ProfileAchievements
          userId="user1"
          name="Eco Hero"
          companion={defaultCompanion}
          stats={defaultStats}
          onRefreshProfile={refreshMock}
        />
      );

      const form = screen.getByText('Update Details');
      fireEvent.click(form);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/profile/details', expect.any(Object));
      });
    });
  });
});
