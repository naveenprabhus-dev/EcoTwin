import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceAssistantDrawer from './VoiceAssistantDrawer';
import { UserProfile } from '../types';

// Mock standard motion components
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

describe('VoiceAssistantDrawer Subcomponent', () => {
  const mockSetShowVoicePanel = vi.fn();
  const mockSetSelectedVoiceURI = vi.fn();
  const mockSetVoicePitch = vi.fn();
  const mockSetVoiceRate = vi.fn();
  const mockSetAssistantTextInput = vi.fn();
  const mockHandleAskPresetQuestion = vi.fn();
  const mockStartProactiveDailyCheckIn = vi.fn();
  const mockStartListeningVoice = vi.fn();
  const mockStopListeningVoice = vi.fn();

  const mockProfile: UserProfile = {
    userId: 'usr_abc',
    email: 'abc@gmail.com',
    name: 'Naveen',
    onboarded: true,
    onboarding: {} as any,
    companion: {
      name: 'EcoSprout',
      level: 4,
      xp: 200,
      xpNeeded: 500,
      streak: 5,
      equippedAccessories: [],
      unlockedAccessories: []
    },
    challenges: [],
    logs: [],
    stats: {
      score: 85,
      breakdown: {
        transport: 10,
        electricity: 20,
        food: 15,
        shopping: 5,
        waste: 12,
        total: 100
      },
      dailyAverage: 3.2,
      monthlyAverage: 100,
      annualAverage: 1.2,
      treesEquivalent: 5,
      carbonSavedThisMonth: 15
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when showVoicePanel flag is false', () => {
    render(
      <VoiceAssistantDrawer
        showVoicePanel={false}
        setShowVoicePanel={mockSetShowVoicePanel}
        profile={mockProfile}
        isTwinSpeaking={false}
        companionExpression="excited"
        voiceStatus="idle"
        availableVoices={[]}
        selectedVoiceURI=""
        setSelectedVoiceURI={mockSetSelectedVoiceURI}
        voicePitch={1.6}
        setVoicePitch={mockSetVoicePitch}
        voiceRate={1.05}
        setVoiceRate={mockSetVoiceRate}
        userTranscript=""
        twinReplyText="Hello Sprout!"
        assistantTextInput=""
        setAssistantTextInput={mockSetAssistantTextInput}
        handleAskPresetQuestion={mockHandleAskPresetQuestion}
        startProactiveDailyCheckIn={mockStartProactiveDailyCheckIn}
        isListening={false}
        startListeningVoice={mockStartListeningVoice}
        stopListeningVoice={mockStopListeningVoice}
      />
    );

    expect(screen.queryByText(/Carbon Twin Live Assistant/i)).not.toBeInTheDocument();
  });

  it('renders correctly and responds to text submit actions', () => {
    render(
      <VoiceAssistantDrawer
        showVoicePanel={true}
        setShowVoicePanel={mockSetShowVoicePanel}
        profile={mockProfile}
        isTwinSpeaking={false}
        companionExpression="excited"
        voiceStatus="idle"
        availableVoices={[]}
        selectedVoiceURI=""
        setSelectedVoiceURI={mockSetSelectedVoiceURI}
        voicePitch={1.6}
        setVoicePitch={mockSetVoicePitch}
        voiceRate={1.05}
        setVoiceRate={mockSetVoiceRate}
        userTranscript="I rode a bicycle!"
        twinReplyText="Awesome!"
        assistantTextInput="I took public transit"
        setAssistantTextInput={mockSetAssistantTextInput}
        handleAskPresetQuestion={mockHandleAskPresetQuestion}
        startProactiveDailyCheckIn={mockStartProactiveDailyCheckIn}
        isListening={false}
        startListeningVoice={mockStartListeningVoice}
        stopListeningVoice={mockStopListeningVoice}
      />
    );

    expect(screen.getByText(/Carbon Twin Live Assistant/i)).toBeInTheDocument();
    expect(screen.getByText(/I rode a bicycle!/i)).toBeInTheDocument();
    expect(screen.getByText(/Awesome!/i)).toBeInTheDocument();

    const textInput = screen.getByPlaceholderText(/I rode a train today/i);
    expect(textInput).toBeInTheDocument();

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    fireEvent.click(sendBtn);

    expect(mockHandleAskPresetQuestion).toHaveBeenCalledWith('I took public transit');
  });
});
