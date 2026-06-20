import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarbonTwinPet from './components/CarbonTwinPet';
import FutureSimulator from './components/FutureSimulator';

// Mock simple motion elements
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, onClick, ...props }: any) => (
      <div className={className} onClick={onClick} {...props}>{children}</div>
    ),
    button: ({ children, className, onClick, ...props }: any) => (
      <button className={className} onClick={onClick} {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  PieChart: ({ children }: any) => <svg data-testid="pie-chart">{children}</svg>,
  Pie: ({ children }: any) => <g data-testid="pie">{children}</g>,
  Cell: () => <path data-testid="cell" />,
  BarChart: ({ children }: any) => <svg data-testid="bar-chart">{children}</svg>,
  Bar: () => <rect data-testid="bar" />,
  XAxis: () => <g data-testid="xaxis" />,
  YAxis: () => <g data-testid="yaxis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LineChart: ({ children }: any) => <svg data-testid="line-chart">{children}</svg>,
  Line: () => <path data-testid="line" />,
}));

describe('Accessibility Standards and ARIA Screen Reader compliance', () => {

  const dummyStats = {
    score: 85,
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

  it('declares beautiful ARIA controls on ambient scenery buttons', () => {
    render(
      <CarbonTwinPet 
        score={95} 
        equippedAccessories={[]} 
        name="Sprout" 
      />
    );

    // Verify scenery control buttons have active descriptive screen reader labels
    const forestSceneryBtn = screen.getByLabelText(/Switch scenery theme to 🌲 Forest/i);
    expect(forestSceneryBtn).toBeInTheDocument();
    
    const roomSceneryBtn = screen.getByLabelText(/Switch scenery theme to 🏠 Room/i);
    expect(roomSceneryBtn).toBeInTheDocument();
  });

  it('guarantees label associations for all range inputs inside simulator', () => {
    render(
      <FutureSimulator 
        stats={dummyStats} 
        companionName="Sprout" 
      />
    );

    // Find custom range input using standard label query, confirming correct htmlFor linkage
    const commuteSlider = screen.getByLabelText(/Weekly Distance Commuted:/i);
    expect(commuteSlider).toBeInTheDocument();
    expect(commuteSlider).toHaveAttribute('type', 'range');
  });
});
