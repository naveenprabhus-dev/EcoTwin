/**
 * Production-grade Structured Logger
 * Provides level-based logging with contextual metadata and ISO timestamps.
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, unknown>;
}

export class Logger {
  private static logHistory: LogEntry[] = [];
  private static readonly MAX_HISTORY = 200;

  private static format(level: LogLevel, message: string, context?: string, metadata?: Record<string, unknown>): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      metadata
    };

    this.logHistory.push(entry);
    if (this.logHistory.length > this.MAX_HISTORY) {
      this.logHistory.shift();
    }

    return entry;
  }

  public static debug(message: string, context?: string, metadata?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== 'production') {
      const entry = this.format('DEBUG', message, context, metadata);
      console.debug(`[${entry.timestamp}] [DEBUG] [${context || 'SYSTEM'}] ${message}`, metadata || '');
    }
  }

  public static info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const entry = this.format('INFO', message, context, metadata);
    console.info(`[${entry.timestamp}] [INFO] [${context || 'SYSTEM'}] ${message}`, metadata || '');
  }

  public static warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const entry = this.format('WARN', message, context, metadata);
    console.warn(`[${entry.timestamp}] [WARN] [${context || 'SYSTEM'}] ${message}`, metadata || '');
  }

  public static error(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const entry = this.format('ERROR', message, context, metadata);
    console.error(`[${entry.timestamp}] [ERROR] [${context || 'SYSTEM'}] ${message}`, metadata || '');
  }

  public static getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  public static clearHistory(): void {
    this.logHistory = [];
  }
}
