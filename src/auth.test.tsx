import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

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

// Mock Firebase Config & Modules
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(),
}));

vi.mock('firebase/auth', () => {
  const mockUser = {
    uid: 'test-uid-123',
    email: 'test@example.com',
    emailVerified: false,
    reload: vi.fn().mockResolvedValue(undefined),
  };
  return {
    getAuth: vi.fn().mockReturnValue({}),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    sendPasswordResetEmail: vi.fn(),
    sendEmailVerification: vi.fn(),
    signInAnonymously: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChanged: vi.fn((auth, cb) => {
      // Don't auto-login immediately so we can test forms
      cb(null);
      return vi.fn();
    }),
  };
});

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  doc: vi.fn(),
  getDocFromServer: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Mock fetch calls cleanly
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ success: true, profile: { onboarded: false } }),
  });
});

describe('Authentication flows', () => {
  it('renders login form initially and displays brand slogan', async () => {
    render(<App />);

    // Loader spins first, then displays main options
    await waitFor(() => {
      expect(screen.getByText(/Your carbon footprint, brought/i)).toBeInTheDocument();
      expect(screen.getByText('Secure Auth Check')).toBeInTheDocument();
    });
  });

  it('can transition to sign-up and password reset forms', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Secure Auth Check')).toBeInTheDocument();
    });

    // Go to Sign up page
    const goToRegisterBtn = screen.getByText('Join EcoTwin');
    fireEvent.click(goToRegisterBtn);

    expect(screen.getByText('Create Account')).toBeInTheDocument();

    // Go back to Login
    const goToLoginBtn = screen.getByText('Log In');
    fireEvent.click(goToLoginBtn);

    // Go to forgot page
    const goToForgotBtn = screen.getByText(/Forgot password/i);
    fireEvent.click(goToForgotBtn);

    expect(screen.getByText('Send Password Reset Link')).toBeInTheDocument();
  });

  it('validates signup parameters on registration click', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Secure Auth Check')).toBeInTheDocument();
    });

    const goToRegisterBtn = screen.getByText('Join EcoTwin');
    fireEvent.click(goToRegisterBtn);

    const form = screen.getByText('Create Account').closest('form');
    expect(form).toBeInTheDocument();
    if (form) {
      fireEvent.submit(form);
    }
    expect(screen.getByText(/Please fill out all the input fields/i)).toBeInTheDocument();
  });
});
