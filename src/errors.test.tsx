import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Challenges from './components/Challenges';
import Scanner from './components/Scanner';
import AICoach from './components/AICoach';

// 1. Mock standard dependencies
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

describe('Network & API Error handling fallback tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    if (typeof window !== 'undefined') {
      window.HTMLElement.prototype.scrollIntoView = vi.fn();
    }
  });

  it('handles empty response gracefully when fetching active challenges list', async () => {
    // Force direct network rejection to trigger exception flow
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("API_DOWN_TIMEOUT"));

    render(
      <Challenges 
        userId="usererr" 
        companion={{ name: 'Sprout', level: 1, xp: 0, xpNeeded: 100, streak: 0, equippedAccessories: [], unlockedAccessories: [] }} 
        onRefreshProfile={() => {}} 
      />
    );

    // Verify console error was logged without breaking execution
    await waitFor(() => {
      // The screen should render nicely without rendering empty list crashes
      expect(screen.getByText('Consistency Streak')).toBeInTheDocument();
    });
  });

  it('handles scanning failures gracefully with stable backup OCR output', async () => {
    // API fails completely but scanner falls back to localized OCR placeholder values
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Internal Server Error"));

    render(<Scanner userId="usererr" onRefreshProfile={() => {}} />);

    const optionPreset = screen.getByText('Standard electric bill mockup');
    fireEvent.click(optionPreset);

    await waitFor(() => {
      // Should show local fallback OCR results standard to user
      expect(screen.getByText('City Power & Gas')).toBeInTheDocument();
    });
  });

  it('shows error notice when chatbot API post fails', async () => {
    // Force chat endpoint failure
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: false, error: "Quota limits exceeded on Gemini API key" })
    });

    const { container } = render(<AICoach userId="usererr" companionName="Sprout" score={75} />);

    const sendField = screen.getByPlaceholderText(/Ask Sprout for energy/i);
    fireEvent.change(sendField, { target: { value: 'How big is a tree?' } });

    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
    if (submitBtn) {
      fireEvent.click(submitBtn);
    }

    await waitFor(() => {
      expect(screen.getByText(/connection hiccup/i)).toBeInTheDocument();
    });
  });
});
