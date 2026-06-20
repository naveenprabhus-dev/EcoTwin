import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarbonTwinPet from './components/CarbonTwinPet';
import AICoach from './components/AICoach';

// 1. Mock standard layout elements dynamically to prevent unresolved tag exceptions
vi.mock('motion/react', () => {
  const elements = ['div', 'button', 'span', 'h1', 'p', 'header', 'footer', 'section', 'article', 'aside', 'main'];
  const mockMotion: any = {};
  elements.forEach((tag) => {
    mockMotion[tag] = ({ children, className, onClick, ...props }: any) => {
      const Tag = tag as any;
      return <Tag className={className} onClick={onClick} {...props}>{children}</Tag>;
    };
  });
  return {
    motion: mockMotion,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

const mockSpeak = vi.fn();
const mockCancel = vi.fn();

// Mock SpeechSynthesisUtterance Class correctly so 'new' keyword succeeds
class MockSpeechSynthesisUtterance {
  text: string;
  pitch = 1.0;
  rate = 1.0;
  voice = null;
  onstart = vi.fn();
  onend = vi.fn();
  onerror = vi.fn();

  constructor(text: string) {
    this.text = text;
  }
}

beforeEach(() => {
  vi.clearAllMocks();

  if (typeof window !== 'undefined') {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  }

  const mockedSynth = {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: vi.fn().mockReturnValue([]),
    pending: false,
    speaking: false,
    paused: false,
  };

  // Mock speech synthesis browser features on both scopes
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.speechSynthesis = mockedSynth;
    // @ts-ignore
    window.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
  }
  // @ts-ignore
  global.window.speechSynthesis = mockedSynth;
  // @ts-ignore
  global.SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
});

describe('Voice Assistant & Conversational Gemini AI tests', () => {
  it('triggers Synthesis speak when clicking interactive companion blob', async () => {
    render(
      <CarbonTwinPet 
        score={95} 
        equippedAccessories={[]} 
        name="Sprout" 
      />
    );

    // Find and click the companion body to trigger reaction dialogue and audio readout
    const petContainer = screen.getByTitle('Click to interact with Sprout!');
    expect(petContainer).toBeInTheDocument();
    
    fireEvent.click(petContainer);

    // Verify speech was called
    expect(mockSpeak).toHaveBeenCalled();
  });

  it('renders chatbot UI correctly and supports sending messages', async () => {
    // Setup fetch mock for Gemini chat call
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({
        success: true,
        reply: "Hello! As your AI Coach, I suggest switching to canvas shopping bags today."
      }),
    });

    const { container } = render(
      <AICoach 
        userId="user-test-idx" 
        companionName="Sprout" 
        score={80} 
      />
    );

    expect(screen.getByText(/Q&A Engine/i)).toBeInTheDocument();

    const inputField = screen.getByPlaceholderText(/Ask Sprout for energy/i);
    expect(inputField).toBeInTheDocument();

    // Type a message
    fireEvent.change(inputField, { target: { value: 'How do I reduce my food waste?' } });
    
    // Send message clicking the send button specifically
    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInTheDocument();
    if (submitBtn) {
      fireEvent.click(submitBtn);
    }

    await waitFor(() => {
      // It should display reply
      expect(screen.getByText(/Hello! As your AI Coach/i)).toBeInTheDocument();
    });
  });
});
