/**
 * Logger utility using Singleton pattern
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LoggerConfig {
  level: LogLevel;
  service: string;
  enableColors?: boolean;
}

/**
 * Logger class implementing Singleton pattern
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private colors = {
    debug: '\x1b[36m', // Cyan
    info: '\x1b[32m', // Green
    warn: '\x1b[33m', // Yellow
    error: '\x1b[31m', // Red
    reset: '\x1b[0m',
  };

  private constructor(config: LoggerConfig) {
    this.config = config;
  }

  /**
   * Get Logger instance (Singleton)
   */
  static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      if (!config) {
        config = {
          level: LogLevel.INFO,
          service: 'ecomify',
          enableColors: true,
        };
      }
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const color = this.config.enableColors ? this.colors[level] : '';
    const reset = this.config.enableColors ? this.colors.reset : '';

    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `${color}[${timestamp}] [${this.config.service}] [${level.toUpperCase()}]${reset} ${message}${metaStr}`;
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }
  }

  error(message: string, error?: Error | any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const meta = error instanceof Error ? { stack: error.stack, ...error } : error;
      console.error(this.formatMessage(LogLevel.ERROR, message, meta));
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): Logger {
    const childConfig: LoggerConfig = {
      ...this.config,
      service: `${this.config.service}:${context}`,
    };
    return new Logger(childConfig);
  }
}

/**
 * Create a logger instance
 */
export function createLogger(service: string, level?: LogLevel): Logger {
  return Logger.getInstance({
    service,
    level: level || (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
    enableColors: process.env.NODE_ENV !== 'production',
  });
}
