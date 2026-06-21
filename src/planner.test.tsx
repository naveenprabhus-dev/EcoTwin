import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ActionPlanner from './components/ActionPlanner';

// Mock dependencies
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

// Mock recharts
vi.mock('recharts', () => {
  const OriginalModule = vi.importActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: any) => <div style={{ width: '100%', height: '100%' }}>{children}</div>,
    AreaChart: ({ children }: any) => <div>{children}</div>,
    Area: () => null,
    XAxis: () => null,
    YAxis: () => null,
    Tooltip: () => null,
    CartesianGrid: () => null,
  };
});

describe('EcoBuddy Adaptive Action Planner Unit Tests', () => {
  const mockPlan = {
    createdAt: new Date().toISOString(),
    currentDay: 1,
    complianceRate: 100,
    weeklyReflection: null,
    tasks: [
      {
        id: 'task_1',
        day: 1,
        title: 'Walk to public buses',
        description: 'Take carbon-friendly public transport instead of driving.',
        category: 'transport',
        co2Reduction: 5.4,
        difficulty: 'medium',
        impact: 'medium',
        completed: false
      },
      {
        id: 'task_2',
        day: 2,
        title: 'Kill Vampire screen charges',
        description: 'Unplug stand-by systems and idle chargers.',
        category: 'energy',
        co2Reduction: 2.1,
        difficulty: 'easy',
        impact: 'low',
        completed: false
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches action plan and renders the day selection and active task maps', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        actionPlan: mockPlan
      })
    });

    render(<ActionPlanner userId="user-demo" onRefreshProfile={() => {}} />);

    // Verify retrieval call is made on mounting
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/action-planner?userId=user-demo');
    });

    // Verify Active Day 1 displays the Walk action title
    await waitFor(() => {
      expect(screen.getByText('Walk to public buses')).toBeInTheDocument();
    });

    // Check description
    expect(screen.getByText('Take carbon-friendly public transport instead of driving.')).toBeInTheDocument();
  });

  it('submits task completion action endpoint successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        actionPlan: mockPlan
      })
    });

    render(<ActionPlanner userId="user-demo" onRefreshProfile={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Walk to public buses')).toBeInTheDocument();
    });

    // Fire complete event
    const completeBtn = screen.getByText("I Completed Today's Action!");
    expect(completeBtn).toBeInTheDocument();

    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/action-planner/complete-task', expect.any(Object));
    });
  });

  it('submits adaptation regeneration of 7-day sustainable agenda', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        actionPlan: mockPlan
      })
    });

    render(<ActionPlanner userId="user-demo" onRefreshProfile={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Walk to public buses')).toBeInTheDocument();
    });

    // Adapt layout
    const adaptBtn = screen.getByText('Adapt with EcoBuddy');
    expect(adaptBtn).toBeInTheDocument();

    fireEvent.click(adaptBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/action-planner/generate', expect.any(Object));
    });
  });
});
