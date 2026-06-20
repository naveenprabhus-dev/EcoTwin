import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Challenges from './components/Challenges';
import Scanner from './components/Scanner';

// 1. Mock standard dependencies
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => (
      <div className={className} onClick={onClick} {...props}>{children}</div>
    ),
    button: ({ children, className, onClick, ...props }: any) => (
      <button className={className} onClick={onClick} {...props}>{children}</button>
    ),
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Challenges Completion and Scanned carbon entries workflows', () => {
  const dummyCompanion = {
    name: 'Sprout',
    level: 2,
    xp: 50,
    xpNeeded: 200,
    streak: 3,
    equippedAccessories: [],
    unlockedAccessories: []
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Active Challenges and Claim Mechanics', () => {
    it('shows Claim buttons when challenges are completed', async () => {
      // Mock challenges fetch return
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          challenges: [
            { id: 'c1', title: 'Energy Saver Extraordinaire', pointsWorth: 150, description: 'Turn off heavy plugs', completed: false, claimed: false }
          ]
        })
      });

      render(
        <Challenges 
          userId="usertest1" 
          companion={dummyCompanion} 
          onRefreshProfile={() => {}} 
        />
      );

      // Wait for challenge list render
      await waitFor(() => {
        expect(screen.getByText('Energy Saver Extraordinaire')).toBeInTheDocument();
      });

      const claimButton = screen.getByText('I Completed This');
      expect(claimButton).toBeInTheDocument();

      // Trigger claim call
      fireEvent.click(claimButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/challenges/claim', expect.any(Object));
      });
    });
  });

  describe('Document Scanners OCR Engine', () => {
    it('renders scanner choices and presets correctly', () => {
      render(<Scanner userId="usertest1" onRefreshProfile={() => {}} />);

      expect(screen.getByText(/Electricity Bill Scanner/i)).toBeInTheDocument();
      expect(screen.getByText(/Receipt Scanner/i)).toBeInTheDocument();
    });

    it('submits Simulated slip scanner presets successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve({
          success: true,
          result: {
            storeName: "Metro Food Co.",
            sustainabilityScore: 85,
            items: [
              { name: "Organic apples in bulk", ecoCategory: "sustainable", points: 20 },
              { name: "Plastic wrapped cucumbers", ecoCategory: "high-impact", points: -5 }
            ],
            alternatives: [
              "Choose loose organic cucumbers next time"
            ],
            co2Emissions: 12.5
          }
        })
      });

      render(<Scanner userId="usertest1" onRefreshProfile={() => {}} />);

      // Switch tab to Receipt Scanner
      const receiptTab = screen.getByText(/Receipt Scanner/i);
      fireEvent.click(receiptTab);

      // Click the supermarket checkout slip preset button
      const groceryPresetButton = screen.getByText(/Weekly supermarket checkout slip/i);
      fireEvent.click(groceryPresetButton);

      // Verify spinner loading, then receipt stats display
      await waitFor(() => {
        expect(screen.getByText(/Metro Food Co./i)).toBeInTheDocument();
        expect(screen.getByText(/Organic apples in bulk/i)).toBeInTheDocument();
      });
    });
  });
});
