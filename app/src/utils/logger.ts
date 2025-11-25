/**
 * Centralized logging utility
 * In production, only ERROR and WARN logs are shown
 * In development, all logs are shown
 */

type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

const LOG_LEVELS: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LOG_LEVEL: LogLevel = __DEV__ ? 'DEBUG' : 'ERROR';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LOG_LEVEL];
}

export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('DEBUG')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    if (shouldLog('INFO')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  warn: (message: string, ...args: any[]) => {
    if (shouldLog('WARN')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: any[]) => {
    if (shouldLog('ERROR')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },

  // For testing feedback
  test: (message: string, data?: any) => {
    console.log(`[TEST_LOG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  }
};

