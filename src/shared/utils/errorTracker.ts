import { Logger } from './logger';

export interface TrackerError {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context?: string;
  fatal: boolean;
  resolved: boolean;
}

export class ErrorTracker {
  private static errors: TrackerError[] = [];
  private static readonly MAX_TRACKED = 100;

  /**
   * Captures, processes, and stores an application runtime exception.
   */
  public static capture(error: unknown, context?: string, fatal = false): void {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    
    const trackerError: TrackerError = {
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      message,
      stack,
      context,
      fatal,
      resolved: false
    };

    this.errors.push(trackerError);
    if (this.errors.length > this.MAX_TRACKED) {
      this.errors.shift();
    }

    // Direct telemetry routing
    Logger.error(`Captured Error: ${message}`, context || 'EXCEPTION_HANDLER', { fatal, stack });
  }

  /**
   * Retrieves all errors in memory.
   */
  public static getErrors(): TrackerError[] {
    return [...this.errors];
  }

  /**
   * Reset errors.
   */
  public static clear(): void {
    this.errors = [];
  }
}
