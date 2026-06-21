import { UserProfile } from '../types';

/**
 * @class EcoBuddyAssistant
 * @description Custom LLM coaching helper service that builds personalized greetings for the 
 * virtual Carbon Companion, suggests high-impact environmental queries, and returns stable
 * fallback explanations during connectivity errors.
 */
export class EcoBuddyAssistant {
  private static responseCache = new Map<string, string>();

  /**
   * Retrieves a cached reply for similar questions if available, ensuring instant response.
   */
  public static getCachedResponse(question: string): string | undefined {
    const key = (question || '').trim().toLowerCase();
    return this.responseCache.get(key);
  }

  /**
   * Stores a generated assistant reply inside our fast-lookup cache.
   */
  public static cacheResponse(question: string, reply: string): void {
    const key = (question || '').trim().toLowerCase();
    // Prevent unbounded memory growth
    if (this.responseCache.size > 100) {
      const firstKey = this.responseCache.keys().next().value;
      if (firstKey !== undefined) this.responseCache.delete(firstKey);
    }
    this.responseCache.set(key, reply);
  }

  /**
   * List of sample questions for users to get quick Coaching tips.
   */
  public static readonly SAMPLE_QUESTIONS = [
    'How can I reduce my transportation emissions?',
    'Which foods have the lowest carbon footprints?',
    'Is cycling better than buses for commute metrics?',
    'How does segregating waste save atmosphere carbon?',
  ];

  /**
   * Formulates a high-quality, friendly contextual greeting from the Carbon Companion.
   */
  public static buildInitialGreeting(companionName: string, score: number): string {
    let extraTip = '';
    if (score >= 80) {
      extraTip = 'You are currently a certified Carbon Hero! ⭐ Let\'s keep our scores beautiful!';
    } else if (score >= 60) {
      extraTip = 'We have a great green baseline! What sustainable swaps should we try next?';
    } else {
      extraTip = 'I notice our carbon output is slightly heavy. No worries! Let\'s tackle a carbon challenge and clear the air!';
    }

    return `Hello! I'm **${companionName}**, your virtual Carbon Companion and Sustainability Coach. 🌿\n\nI can analyze your carbon breakdown, suggest personalized daily optimizations, and answer your ecological Q&As!\n\n${extraTip}\n\nWhat would you like to discuss today?`;
  }

  /**
   * Fallback coach response if API limits are crossed or requests timeout.
   */
  public static getFallbackReply(question: string, score: number): string {
    const lowered = (question || '').toLowerCase();

    if (lowered.includes('transport') || lowered.includes('bike') || lowered.includes('cycle') || lowered.includes('bus')) {
      return `### 🚲 Eco Commuting Advice\n\nCommuting is a leading source of carbon. Here are some smart upgrades:\n\n* **Public Networks**: Sharing routes in buses or trains reduces individual transport footprints by up to 80%.\n* **Microbility**: For shorter trips within blocks, walking or cycling cuts carbon entirely and boosts active cardiac health!\n* **Carpooling**: Renting shared vehicles is a solid backup if a personal car is forced.`;
    }

    if (lowered.includes('food') || lowered.includes('diet') || lowered.includes('veggie') || lowered.includes('meat') || lowered.includes('beef')) {
      return `### 🥗 Conscious Balanced Nutrition\n\nDiet choices represent massive emission offsets. Here is how we can reduce food impact:\n\n* **Reduce Red Meats**: Cattle farming consumes extensive clean water and land while emitting heavy methane. Swapping red meats for chicken or beans significantly lowers total footprint.\n* **Local Groceries**: Choosing seasonal items grown in nearby organic gardens avoids intercity freight transportation overhead.`;
    }

    if (lowered.includes('energy') || lowered.includes('electricity') || lowered.includes('unplug') || lowered.includes('appliance')) {
      return `### 🔌 Standing Grid Savings\n\nStandby loads represent "vampire" power loss. Implement these simple tricks:\n\n* **Master Switch**: Standard unplugging of idle screen units, console boxes, and dynamic chargers can trim baseline electric bills by 10%.\n* **AC Temperatures**: Operating cooling systems around 24-25°C maintains room serenity with massive power reductions.`;
    }

    return `### 🌿 Environmental Tip\n\nI encountered a brief connection hiccup, but let's talk conservation! Your current score is **${score}/100**.\n\n* **Unplug Idle Loads**: Shutting down appliances saves up to 10% of standby power.\n* **Travel Light**: Preferring walking or cycling in short distances cuts commute outputs entirely!\n\nFeel free to ask another specific question, I am always ready to help!`;
  }
}
