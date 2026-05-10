// ============================================================
// 構造化ログ — 本番デバッグ用
// console.log/error の代わりにこちらを使う
// ============================================================

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function formatLog(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}] ${entry.message}`;
  if (entry.data) {
    return `${base} ${JSON.stringify(entry.data)}`;
  }
  return base;
}

function createEntry(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): LogEntry {
  return {
    level,
    module,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/** モジュール名を指定してロガーを取得 */
export function createLogger(module: string) {
  return {
    info(message: string, data?: Record<string, unknown>) {
      const entry = createEntry('info', module, message, data);
      console.log(formatLog(entry));
    },
    warn(message: string, data?: Record<string, unknown>) {
      const entry = createEntry('warn', module, message, data);
      console.warn(formatLog(entry));
    },
    error(message: string, error?: unknown, data?: Record<string, unknown>) {
      const errData: Record<string, unknown> = { ...data };
      if (error instanceof Error) {
        errData.errorName = error.name;
        errData.errorMessage = error.message;
        errData.stack = error.stack?.split('\n').slice(0, 3).join(' | ');
      }
      const entry = createEntry('error', module, message, errData);
      console.error(formatLog(entry));
    },
  };
}
