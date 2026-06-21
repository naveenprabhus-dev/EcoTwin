import { LoggedEntry } from '../types/carbon';
import { Logger } from '../shared/utils/logger';

export interface QueuedLogEntry {
  id: string;
  category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste' | 'general';
  activity: string;
  co2: number;
  xp: number;
  timestamp: string;
}

export interface QueuedChallengeComplete {
  challengeId: string;
  timestamp: string;
}

/**
 * Production-ready Offline Resilience & Synchronization manager.
 * Caches weekly reports, user stats, and queues logs when network is down.
 */
export class OfflineStorage {
  private static readonly LOGS_QUEUE_KEY = 'ecotwin_offline_logs_queue';
  private static readonly CHALLENGES_QUEUE_KEY = 'ecotwin_offline_challenges_queue';
  private static readonly REPORTS_CACHE_KEY = 'ecotwin_weekly_reports_cache';

  /**
   * Safe localStorage wrapper to prevent crash environments.
   */
  private static isStorageAvailable(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Detects whether the user is currently online.
   */
  public static isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  }

  /**
   * Queues an activity log entry for future background synchronization.
   */
  public static queueLogAction(
    category: 'transport' | 'energy' | 'food' | 'shopping' | 'waste' | 'general',
    activity: string,
    co2: number,
    xp: number
  ): void {
    if (!this.isStorageAvailable()) return;

    try {
      const queue = this.getQueuedLogs();
      const newEntry: QueuedLogEntry = {
        id: Math.random().toString(36).substring(2, 11),
        category,
        activity,
        co2,
        xp,
        timestamp: new Date().toISOString()
      };

      queue.push(newEntry);
      localStorage.setItem(this.LOGS_QUEUE_KEY, JSON.stringify(queue));
      Logger.info(`Offline queued action successfully: ${activity}`, 'OFFLINE_SYNC');
    } catch (err) {
      Logger.error(`Error queuing offline action: ${err}`, 'OFFLINE_SYNC');
    }
  }

  /**
   * Pulls all pending queued offline activity logs.
   */
  public static getQueuedLogs(): QueuedLogEntry[] {
    if (!this.isStorageAvailable()) return [];

    try {
      const raw = localStorage.getItem(this.LOGS_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear queued offline activity logs.
   */
  public static clearQueuedLogs(): void {
    if (!this.isStorageAvailable()) return;
    localStorage.removeItem(this.LOGS_QUEUE_KEY);
  }

  /**
   * Queues completed challenge IDs for offline sync.
   */
  public static queueChallengeCompletion(challengeId: string): void {
    if (!this.isStorageAvailable()) return;

    try {
      const queue = this.getQueuedChallenges();
      const newEntry: QueuedChallengeComplete = {
        challengeId,
        timestamp: new Date().toISOString()
      };

      queue.push(newEntry);
      localStorage.setItem(this.CHALLENGES_QUEUE_KEY, JSON.stringify(queue));
      Logger.info(`Offline queued challenge completion: ${challengeId}`, 'OFFLINE_SYNC');
    } catch (err) {
      Logger.error(`Error queuing offline challenge: ${err}`, 'OFFLINE_SYNC');
    }
  }

  /**
   * Pulls all queued challenge achievements.
   */
  public static getQueuedChallenges(): QueuedChallengeComplete[] {
    if (!this.isStorageAvailable()) return [];

    try {
      const raw = localStorage.getItem(this.CHALLENGES_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clear queued challenges.
   */
  public static clearQueuedChallenges(): void {
    if (!this.isStorageAvailable()) return;
    localStorage.removeItem(this.CHALLENGES_QUEUE_KEY);
  }

  /**
   * Caches raw analytical reports in persistent state.
   */
  public static cacheReport(reportId: string, content: any): void {
    if (!this.isStorageAvailable()) return;

    try {
      const cache = this.getCachedReports();
      cache[reportId] = {
        content,
        cachedAt: new Date().toISOString()
      };
      localStorage.setItem(this.REPORTS_CACHE_KEY, JSON.stringify(cache));
    } catch (err) {
      Logger.error(`Error caching report: ${err}`, 'OFFLINE_STATION');
    }
  }

  /**
   * Pulls all cached analytical reports from local persistent state.
   */
  public static getCachedReports(): Record<string, { content: any; cachedAt: string }> {
    if (!this.isStorageAvailable()) return {};

    try {
      const raw = localStorage.getItem(this.REPORTS_CACHE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
}
