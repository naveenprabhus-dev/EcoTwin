import { UserProfile } from '../types';

export class MemorySystem {
  /**
   * Generates a structural companion emotional memory context.
   * This is securely sent inside model inputs to ensure the AI chat acts as a true companion.
   */
  public static getUserMemoryContext(profile: UserProfile): string {
    const compName = profile.companion?.name || 'Sprout';
    const streak = profile.companion?.streak || 0;
    const level = profile.companion?.level || 1;
    const xp = profile.companion?.xp || 0;
    const score = profile.stats?.score ?? 50;
    const breakdown = profile.stats?.breakdown || {
      transport: 0,
      electricity: 0,
      food: 0,
      shopping: 0,
      waste: 0,
      total: 0,
    };

    const recentLogs = profile.logs?.slice(-4)
      .map((l) => `${l.date}: ${l.activity} (${l.co2Difference} kg CO₂ saved)`)
      .join('; ') || 'No actions logged recently.';

    const completedCount = profile.challenges?.filter((c) => c.completedAt)?.length ?? 0;

    const recentChats = profile.conversations?.slice(-3)
      .map((c) => `${c.sender === 'user' ? 'User' : compName}: "${c.text}"`)
      .join(' | ') || 'No previous chats logged.';

    return `
COMPANION EMOTIONAL MEMORY & MILESTONES SECURE REGISTRY:
- Companion Name: ${compName}
- Companion Stats: Level ${level}, XP Progress: ${xp}, Daily Streak: ${streak} days.
- User's Name: ${profile.name || 'Eco Buddy'} (Current Sustainability Score: ${score}/100)
- Completed eco challenges: ${completedCount}
- Recent sustainable habits logged: [ ${recentLogs} ]
- Carbon Breakdown monthly: Travel (${breakdown.transport} kg CO₂), Electricity/Energy (${breakdown.electricity} kg CO₂), Food Diet (${breakdown.food} kg CO₂), Shopping (${breakdown.shopping} kg CO₂), Waste Index (${breakdown.waste} kg CO₂), Total Output (${breakdown.total} kg CO₂).
- Recent Conversation Context: [ ${recentChats} ]

GUIDELINES:
Strictly remember and refer to these achievements contextually during chat! If they did something green recently, celebrate it! If they talk about their streak, validate their commitment. Live the identity of a dynamic, emotional companion who has a shared journey with the user.
    `.trim();
  }
}
