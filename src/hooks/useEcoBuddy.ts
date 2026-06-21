import { useState, useEffect } from 'react';
import { ConversationLog, Goal, ActionPlan } from '../types';

export function useEcoBuddy(userId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);

  const fetchGoals = async () => {
    try {
      const res = await fetch(`/api/action-planner?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.actionPlan) {
        setActionPlan(data.actionPlan);
      }
    } catch (e) {
      console.error("useEcoBuddy failed to fetch action plan/goals:", e);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchGoals();
      // Preload baseline demo goals for high fidelity
      setGoals([
        {
          id: 'g_1',
          title: 'Unplug Vampire grid items daily',
          category: 'energy',
          targetDate: new Date(Date.now() + 6 * 24 * 3600 * 1000).toISOString().split('T')[0],
          completed: false,
          targetValue: 7,
          currentValue: 3,
          unit: 'days',
          buddyFeedback: 'Unplugging standby power prevents coal-fired power generation overhead!'
        },
        {
          id: 'g_2',
          title: 'Substitute beef dishes with veggie options',
          category: 'food',
          targetDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
          completed: false,
          targetValue: 4,
          currentValue: 2,
          unit: 'meals',
          buddyFeedback: 'Swapping beef with chickpea curry saves water and slaughters enteric methane output!'
        }
      ]);
    }
  }, [userId]);

  const handleToggleGoal = (id: string) => {
    setGoals(prev => prev.map(g => {
      if (g.id === id) {
        const nextValue = g.completed ? g.currentValue - 1 : g.currentValue + 1;
        const comp = nextValue >= g.targetValue;
        return {
          ...g,
          currentValue: Math.min(g.targetValue, Math.max(0, nextValue)),
          completed: comp
        };
      }
      return g;
    }));
  };

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    goals,
    setGoals,
    handleToggleGoal,
    actionPlan,
    fetchGoals
  };
}
