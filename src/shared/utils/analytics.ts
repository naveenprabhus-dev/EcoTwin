import { Logger } from './logger';

export interface AnalyticsEvent {
  eventName: string;
  timestamp: string;
  userId?: string;
  properties: Record<string, unknown>;
}

export class Analytics {
  private static events: AnalyticsEvent[] = [];
  private static readonly MAX_EVENTS = 500;

  /**
   * Tracks custom business and usage events.
   */
  public static track(eventName: string, userId?: string, properties: Record<string, unknown> = {}): void {
    const event: AnalyticsEvent = {
      eventName,
      timestamp: new Date().toISOString(),
      userId,
      properties
    };

    this.events.push(event);
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }

    Logger.info(`Analytics Event Tracked: ${eventName}`, 'ANALYTICS', { userId, ...properties });
  }

  /**
   * Retrieves all tracked event logs.
   */
  public static getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clears event buffers.
   */
  public static clearEvents(): void {
    this.events = [];
  }
}
