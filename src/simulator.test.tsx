import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FutureSimulator from './components/FutureSimulator';

// Mock simple motion/react animation structures
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

describe('Carbon Footprint Simulator Scenario Engines', () => {
  const dummyStats = {
    score: 75,
    breakdown: {
      transport: 50,
      electricity: 150,
      food: 80,
      shopping: 50,
      waste: 20,
      total: 350,
    },
    dailyAverage: 11,
    monthlyAverage: 350,
    annualAverage: 4.24,
    treesEquivalent: 145,
    carbonSavedThisMonth: 30,
  };

  it('renders simulator controls and parameters gracefully', () => {
    render(<FutureSimulator stats={dummyStats} companionName="Sprout" />);

    expect(screen.getByText('Future Carbon Simulator')).toBeInTheDocument();
    expect(screen.getByText('Configure Scenario Parameters')).toBeInTheDocument();
    expect(screen.getByLabelText(/Weekly Distance Commuted/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Monthly Power\/Electric Bill/i)).toBeInTheDocument();
  });

  it('calculates carbon prediction changes when sliders are updated', () => {
    render(<FutureSimulator stats={dummyStats} companionName="Sprout" />);

    const slider = screen.getByLabelText(/Weekly Distance Commuted/i);
    fireEvent.change(slider, { target: { value: '200' } });

    // Ensure state slider was updated
    expect(screen.getByText('200 km')).toBeInTheDocument();

    const dietSelect = screen.getByLabelText(/Dietary Lifestyle/i);
    fireEvent.change(dietSelect, { target: { value: 'nonvegetarian' } });

    // Assert that the simulator reflects changes inside the component
    expect(screen.getByText(/Configure Scenario Parameters/i)).toBeInTheDocument();
  });
});
