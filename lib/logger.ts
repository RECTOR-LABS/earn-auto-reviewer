type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: Record<string, unknown>;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LEVEL = process.env.LOG_LEVEL as LogLevel || 'info';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[CURRENT_LEVEL];
}

function formatLog(entry: LogEntry): string {
  const { timestamp, level, context, message, data } = entry;
  const base = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
  return data ? `${base} ${JSON.stringify(data)}` : base;
}

function log(level: LogLevel, context: string, message: string, data?: Record<string, unknown>) {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    context,
    message,
    data,
  };

  const formatted = formatLog(entry);

  switch (level) {
    case 'error':
      console.error(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    default:
      console.log(formatted);
  }
}

export function createLogger(context: string) {
  return {
    debug: (message: string, data?: Record<string, unknown>) => log('debug', context, message, data),
    info: (message: string, data?: Record<string, unknown>) => log('info', context, message, data),
    warn: (message: string, data?: Record<string, unknown>) => log('warn', context, message, data),
    error: (message: string, data?: Record<string, unknown>) => log('error', context, message, data),
  };
}

export const logger = {
  api: createLogger('API'),
  reviewer: createLogger('Reviewer'),
  cache: createLogger('Cache'),
  github: createLogger('GitHub'),
  service: createLogger('ReviewService'),
};
