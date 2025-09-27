/**
 * 日志工具
 */

interface LogLevel {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

class Logger {
  private currentLevel: number;

  constructor(level: keyof LogLevel = 'INFO') {
    this.currentLevel = LOG_LEVELS[level];
  }

  private shouldLog(level: keyof LogLevel): boolean {
    return LOG_LEVELS[level] >= this.currentLevel;
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  debug(message: string): void {
    if (this.shouldLog('DEBUG')) {
      console.log(this.formatMessage('DEBUG', message));
    }
  }

  info(message: string): void {
    if (this.shouldLog('INFO')) {
      console.log(this.formatMessage('INFO', message));
    }
  }

  warn(message: string): void {
    if (this.shouldLog('WARN')) {
      console.warn(this.formatMessage('WARN', message));
    }
  }

  error(message: string, error?: Error): void {
    if (this.shouldLog('ERROR')) {
      const errorMessage = error ? `${message}: ${error.message}` : message;
      console.error(this.formatMessage('ERROR', errorMessage));
      if (error && error.stack) {
        console.error(error.stack);
      }
    }
  }

  setLevel(level: keyof LogLevel): void {
    this.currentLevel = LOG_LEVELS[level];
  }
}

// 导出全局 logger 实例
export const logger = new Logger(process.env.LOG_LEVEL as keyof LogLevel || 'INFO');
export { Logger };
