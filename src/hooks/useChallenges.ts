import { useState, useEffect } from 'react';
import { Challenge } from '../types';

export function useChallenges(userId: string) {
  const [challenges, setChallenges] = useState<(Challenge & { completed: boolean; claimed: boolean })[]>([]);
  const [isClaiming, setIsClaiming] = useState<string | null>(null);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`/api/challenges?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (err) {
      console.error('useChallenges failed to fetch challenges:', err);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchChallenges();
    }
  }, [userId]);

  return {
    challenges,
    isClaiming,
    setIsClaiming,
    fetchChallenges
  };
}
