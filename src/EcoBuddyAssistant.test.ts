import { describe, it, expect } from 'vitest';
import { EcoBuddyAssistant } from './services/EcoBuddyAssistant';

describe('EcoBuddyAssistant Service Unit Tests', () => {
  it('buildInitialGreeting yields customized greeting according to score thresholds', () => {
    const highGreeting = EcoBuddyAssistant.buildInitialGreeting('Sprout', 85);
    expect(highGreeting).toContain('Carbon Hero');
    expect(highGreeting).toContain('Sprout');

    const midGreeting = EcoBuddyAssistant.buildInitialGreeting('Flora', 70);
    expect(midGreeting).toContain('green baseline');
    expect(midGreeting).toContain('Flora');

    const lowGreeting = EcoBuddyAssistant.buildInitialGreeting('Bramble', 30);
    expect(lowGreeting).toContain('slightly heavy');
    expect(lowGreeting).toContain('Bramble');
  });

  it('getFallbackReply gives specific offline tips based on words in question', () => {
    const bikeRes = EcoBuddyAssistant.getFallbackReply('Should I ride a bike?', 50);
    expect(bikeRes).toContain('Eco Commuting Advice');
    expect(bikeRes).toContain('Microbility');

    const foodRes = EcoBuddyAssistant.getFallbackReply('Which food has lower impact?', 50);
    expect(foodRes).toContain('Conscious Balanced Nutrition');

    const energyRes = EcoBuddyAssistant.getFallbackReply('can you give me energy tips?', 50);
    expect(energyRes).toContain('Standing Grid Savings');

    const generalRes = EcoBuddyAssistant.getFallbackReply('Hello, are you ready?', 45);
    expect(generalRes).toContain('Environmental Tip');
    expect(generalRes).toContain('45/100');
  });
});
