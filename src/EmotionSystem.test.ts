import { describe, it, expect, vi } from 'vitest';
import { EmotionSystem } from './services/EmotionSystem';

describe('EmotionSystem Service Unit Tests', () => {
  it('getMoodFromScore maps exact score values to moods', () => {
    expect(EmotionSystem.getMoodFromScore(90)).toBe('excited');
    expect(EmotionSystem.getMoodFromScore(80)).toBe('celebratory');
    expect(EmotionSystem.getMoodFromScore(70)).toBe('proud');
    expect(EmotionSystem.getMoodFromScore(60)).toBe('curious');
    expect(EmotionSystem.getMoodFromScore(50)).toBe('playful');
    expect(EmotionSystem.getMoodFromScore(40)).toBe('reflective');
    expect(EmotionSystem.getMoodFromScore(30)).toBe('motivational');
    expect(EmotionSystem.getMoodFromScore(20)).toBe('concerned');
    expect(EmotionSystem.getMoodFromScore(10)).toBe('sad');
  });

  it('getEmotionConfig returns styling configs for each companion mood', () => {
    const configExcited = EmotionSystem.getEmotionConfig('excited', 'Sprout');
    expect(configExcited.moodText).toBe('Radiant & Excited!');
    expect(configExcited.bodyColor).toBe('#22c55e');
    expect(configExcited.stateGroup).toBe('excellent');

    const configSad = EmotionSystem.getEmotionConfig('sad', 'Flora');
    expect(configSad.moodText).toBe('A Bit Sad & Worried');
    expect(configSad.stateGroup).toBe('critical');

    const configPlayful = EmotionSystem.getEmotionConfig('playful', 'Bob');
    expect(configPlayful.moodText).toBe('Giggly & Playful');
    expect(configPlayful.stateGroup).toBe('good');
  });

  it('playProceduralSound fails safe if window or AudioContext is undefined or mocked', () => {
    // Check it runs without throw when AudioContext is missing
    const originalAudioContext = window.AudioContext;
    (window as any).AudioContext = undefined;

    expect(() => {
      EmotionSystem.playProceduralSound('giggle');
    }).not.toThrow();

    // Mock interactive Web Audio API layers
    const mockOscillator = {
      connect: vi.fn(),
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      start: vi.fn(),
      stop: vi.fn(),
      type: 'sine',
    };

    const mockGain = {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    };

    const mockCtx = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGain),
      destination: {},
      currentTime: 10,
    };

    (window as any).AudioContext = function() {
      return mockCtx;
    };

    expect(() => {
      EmotionSystem.playProceduralSound('giggle');
      EmotionSystem.playProceduralSound('wink');
      EmotionSystem.playProceduralSound('surprise');
      EmotionSystem.playProceduralSound('love');
      EmotionSystem.playProceduralSound('hero');
      EmotionSystem.playProceduralSound('sleepy');
      EmotionSystem.playProceduralSound('unknown_sound');
    }).not.toThrow();

    // Restore Global properties
    if (originalAudioContext) {
      window.AudioContext = originalAudioContext;
    } else {
      delete (window as any).AudioContext;
    }
  });
});
