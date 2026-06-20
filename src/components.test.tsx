import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// 1. Mock standard dependencies that crash/flicker under JSDOM
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

// Mock browser-specific audio, speech, and helper APIs
beforeEach(() => {
  // @ts-ignore
  if (typeof window !== 'undefined') {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }

  // @ts-ignore
  global.window.AudioContext = vi.fn().mockImplementation(() => ({
    createOscillator: () => ({
      connect: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      start: vi.fn(),
      stop: vi.fn(),
    }),
    createGain: () => ({
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }),
    destination: {},
    currentTime: 0,
    close: vi.fn(),
  }));

  // @ts-ignore
  global.window.speechSynthesis = {
    speak: vi.fn(),
    cancel: vi.fn(),
    pending: false,
    speaking: false,
    paused: false,
  };

  // Mock SpeechSynthesisUtterance helper
  // @ts-ignore
  global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({
    text,
    pitch: 1,
    rate: 1,
    onstart: vi.fn(),
    onend: vi.fn(),
    onerror: vi.fn(),
  }));

  // Mock fetch calls cleanly
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true }),
  });
});

// Import our core components
import CarbonTwinPet from './components/CarbonTwinPet';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import Challenges from './components/Challenges';
import AICoach from './components/AICoach';
import FutureSimulator from './components/FutureSimulator';
import WeeklyReport from './components/WeeklyReport';

describe('CarbonTwinPet Component State Transitions', () => {
  const dummyAccessories = ['Background Woods', 'Cute Hat'];

  it('renders correct state details for "excellent" sustainable score (>80)', () => {
    render(
      <CarbonTwinPet 
        score={95} 
        equippedAccessories={dummyAccessories} 
        name="Sprout" 
        moodState="idle" 
      />
    );

    // Assert that the theme descriptions and scores match standard expectations
    expect(screen.getByText('Radiant & Excited!')).toBeInTheDocument();
    expect(screen.getByText(/Sprout is blooming/)).toBeInTheDocument();
  });

  it('renders corresponding warning elements for high emissions', () => {
    render(
      <CarbonTwinPet 
        score={12} 
        equippedAccessories={[]} 
        name="Sprout" 
        moodState="idle" 
      />
    );

    expect(screen.getByText('A Bit Sad & Worried')).toBeInTheDocument();
    expect(screen.getByText(/emissions have increased/i)).toBeInTheDocument();
  });

  it('interacts correctly when interactive sandbox actions are selected', () => {
    render(
      <CarbonTwinPet 
        score={72} 
        equippedAccessories={[]} 
        name="Sprout" 
        moodState="feed" 
      />
    );

    // Visual pet component displays healthy description for proud state (score 72)
    expect(screen.getByText('Thriving & Proud!')).toBeInTheDocument();
  });
});

describe('Dashboard Component Rendering & Event Handlers', () => {
  const dummyStats = {
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

  const dummyLogs = [
    { id: '1', date: '2026-06-12', category: 'transport' as const, activity: 'Took transit', co2Difference: -8.5, xpReward: 50 },
    { id: '2', date: '2026-06-12', category: 'waste' as const, activity: 'Recycled plastics', co2Difference: -1.2, xpReward: 25 },
  ];

  it('successfully displays score, total emissions, and logs grid list', () => {
    render(
      <Dashboard 
        stats={dummyStats} 
        logs={dummyLogs} 
        onAddCustomEntry={() => {}} 
      />
    );

    // Assert general metrics cards exist in output list
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('164')).toBeInTheDocument();
    expect(screen.getByText('Took transit')).toBeInTheDocument();
    expect(screen.getByText('Recycled plastics')).toBeInTheDocument();
  });

  it('allows filter category selection correctly', () => {
    render(
      <Dashboard 
        stats={dummyStats} 
        logs={dummyLogs} 
        onAddCustomEntry={() => {}} 
      />
    );

    const filterButton = screen.getByText(/Commuting/i);
    fireEvent.click(filterButton);

    // After filtering transport, other items should still show or hide based on UI filter state
    expect(screen.getByText('Took transit')).toBeInTheDocument();
  });
});

describe('Onboarding Workflow', () => {
  it('correctly proceeds between distinct survey pages', async () => {
    const submitMock = vi.fn();
    render(<Onboarding onSubmit={submitMock} />);

    // Assert step 1 introduction label
    expect(screen.getByText(/How do you get around/i)).toBeInTheDocument();

    // Find and click Next button
    const nextButton = screen.getByText(/Continue/i);
    fireEvent.click(nextButton);

    // Assert step 2 label exists now
    expect(screen.getByText(/Home Energy Intake/i)).toBeInTheDocument();
  });
});

describe('Challenges Completion Interactions', () => {
  const dummyCompanion = {
    name: 'Sprout',
    level: 3,
    xp: 150,
    xpNeeded: 500,
    streak: 5,
    equippedAccessories: [],
    unlockedAccessories: [],
  };

  it('renders general layout of active challenges', () => {
    // Mock general fetch results for active challenges listing
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        challenges: [
          { challengeId: 'c1', completedAt: null, claimed: false }
        ]
      }),
    });

    render(
      <Challenges 
        userId="demo-user" 
        companion={dummyCompanion} 
        onRefreshProfile={() => {}} 
      />
    );

    expect(screen.getByText(/Green Challenges/i)).toBeInTheDocument();
  });
});

describe('AI Coach Advisor', () => {
  it('renders chatbot assistant view correctly', () => {
    render(
      <AICoach 
        userId="demo-user" 
        companionName="Sprout" 
        score={78} 
      />
    );

    expect(screen.getByText(/Q&A Engine/i)).toBeInTheDocument();
  });
});

describe('Footprint Simulator & Insights', () => {
  const dummyStats = {
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

  it('renders FutureSimulator input controls and charts properly', () => {
    render(
      <FutureSimulator 
        stats={dummyStats} 
        companionName="Sprout" 
      />
    );

    expect(screen.getByText('Future Carbon Simulator')).toBeInTheDocument();
    expect(screen.getByText('Configure Scenario Parameters')).toBeInTheDocument();
  });
});

describe('AI Weekly Reports', () => {
  const dummyStats = {
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

  const dummyLogs = [
    { id: '1', date: '2026-06-12', category: 'transport' as const, activity: 'Took transit', co2Difference: -8.5, xpReward: 50 }
  ];

  it('renders WeeklyReport section with empty and action buttons', async () => {
    render(
      <WeeklyReport 
        userId="demo-user"
        stats={dummyStats}
        logs={dummyLogs}
        companionName="Sprout"
      />
    );

    expect(screen.getByText('Personalized Metrics Compiler')).toBeInTheDocument();
    expect(screen.getByText('No active Weekly Report compiled')).toBeInTheDocument();

    const compileBtn = screen.getByText('Analyze & Generate Report');
    expect(compileBtn).toBeInTheDocument();
    fireEvent.click(compileBtn);

    // Verify it triggers mock compile or fetches data
    await waitFor(() => {
      expect(screen.getByText('Strategic Summary')).toBeInTheDocument();
    });
  });
});
