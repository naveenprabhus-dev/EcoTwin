import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from './components/Dashboard';
import WeeklyReport from './components/WeeklyReport';

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
}));

describe('Dashboard and Weekly Carbon Reporting analytics tests', () => {
  const dummyStats = {
    score: 88,
    breakdown: {
      transport: 30,
      electricity: 100,
      food: 60,
      shopping: 40,
      waste: 10,
      total: 240,
    },
    dailyAverage: 8,
    monthlyAverage: 240,
    annualAverage: 2.88,
    treesEquivalent: 120,
    carbonSavedThisMonth: 65,
  };

  const dummyLogs = [
    { id: 'l1', date: '2026-06-19', category: 'food' as const, activity: 'Ate all-plant vegan diet', co2Difference: -12.4, xpReward: 40 },
    { id: 'l2', date: '2026-06-19', category: 'energy' as const, activity: 'Turned off standby monitors', co2Difference: -2.3, xpReward: 15 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    const mockedSynth = {
      speak: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
      pending: false,
      speaking: false,
      paused: false,
    };
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.speechSynthesis = mockedSynth;
    }
    // @ts-ignore
    global.window.speechSynthesis = mockedSynth;
  });

  describe('Dashboard UI Rendering', () => {
    it('accurately displays sustainability rating and offsets', () => {
      render(
        <Dashboard 
          stats={dummyStats} 
          logs={dummyLogs} 
          onAddCustomEntry={() => {}} 
        />
      );

      // Verify general stats
      expect(screen.getByText('88')).toBeInTheDocument(); // Sustainability score
      expect(screen.getByText('120')).toBeInTheDocument(); // Offset equal trees
      expect(screen.getByText('Ate all-plant vegan diet')).toBeInTheDocument();
      expect(screen.getByText('Turned off standby monitors')).toBeInTheDocument();
    });

    it('can filter action logs by category click', () => {
      render(
        <Dashboard 
          stats={dummyStats} 
          logs={dummyLogs} 
          onAddCustomEntry={() => {}} 
        />
      );

      const foodButton = screen.getByText(/Grub\/Diet/i);
      expect(foodButton).toBeInTheDocument();
      fireEvent.click(foodButton);

      // Verify the list still contains the diet log
      expect(screen.getByText('Ate all-plant vegan diet')).toBeInTheDocument();
    });
  });

  describe('Weekly Report Generation System', () => {
    it('renders report placeholder block before action triggers', () => {
      render(
        <WeeklyReport
          userId="usertest"
          stats={dummyStats}
          logs={dummyLogs}
          companionName="Sprout"
        />
      );

      expect(screen.getByText('No active Weekly Report compiled')).toBeInTheDocument();
    });

    it('displays loading indicator during reports compiler requests', async () => {
      global.fetch = vi.fn().mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({
          json: () => Promise.resolve({
            success: true,
            report: {
              reportText: "Your carbon strategy is very impressive",
              impactGrade: "A",
              strengths: ["Clean transit usage"],
              weaknesses: ["High standby loads"],
              unlockedBadges: ["Zero Emission Hero"],
              carbonScore: 92,
              recommendations: ["Switch to LED bulbs"],
              nextMilestones: ["Reach 15-day streak"]
            }
          })
        }), 50))
      );

      render(
        <WeeklyReport
          userId="usertest"
          stats={dummyStats}
          logs={dummyLogs}
          companionName="Sprout"
        />
      );

      const compileButton = screen.getByText('Analyze & Generate Report');
      fireEvent.click(compileButton);

      expect(screen.getByText(/Compiling Metrics with Gemini AI/i)).toBeInTheDocument();
    });
  });
});
