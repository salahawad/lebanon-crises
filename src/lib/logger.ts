// ============================================================
// Production logger — zero dependencies, works in browser + server
// ============================================================

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  operation?: string;
  collection?: string;
  duration?: number;
  [key: string]: unknown;
}

interface Logger {
  debug(msg: string, ctx?: LogContext): void;
  info(msg: string, ctx?: LogContext): void;
  warn(msg: string, error?: unknown, ctx?: LogContext): void;
  error(msg: string, error?: unknown, ctx?: LogContext): void;
}

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isServer = typeof window === 'undefined';

function getMinLevel(): number {
  const env =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_LOG_LEVEL) || '';
  if (env && env in LEVEL_RANK) return LEVEL_RANK[env as LogLevel];
  // Default: debug in dev, warn in prod
  const isDev =
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  return isDev ? LEVEL_RANK.debug : LEVEL_RANK.warn;
}

function serializeError(err: unknown): { message: string; stack?: string; code?: string } | undefined {
  if (err == null) return undefined;
  if (err instanceof Error) {
    return {
      message: err.message,
      stack: err.stack,
      code: (err as Error & { code?: string }).code,
    };
  }
  return { message: String(err) };
}

function emitServer(
  level: LogLevel,
  module: string,
  msg: string,
  error: unknown | undefined,
  ctx: LogContext | undefined,
) {
  const entry: Record<string, unknown> = {
    level,
    module,
    msg,
    timestamp: new Date().toISOString(),
  };
  if (ctx) {
    for (const [k, v] of Object.entries(ctx)) {
      if (v !== undefined) entry[k] = v;
    }
  }
  const serialized = serializeError(error);
  if (serialized) entry.error = serialized;

  const line = JSON.stringify(entry);
  if (level === 'error') process.stderr.write(line + '\n');
  else process.stdout.write(line + '\n');
}

function emitClient(
  level: LogLevel,
  module: string,
  msg: string,
  error: unknown | undefined,
  ctx: LogContext | undefined,
) {
  const prefix = `[lebanon-crises] [${level.toUpperCase()}] ${module}:`;
  const args: unknown[] = [prefix, msg];
  if (ctx && Object.keys(ctx).length > 0) args.push(ctx);
  if (error !== undefined) args.push(error);

  switch (level) {
    case 'debug':
      console.debug(...args);
      break;
    case 'info':
      console.info(...args);
      break;
    case 'warn':
      console.warn(...args);
      break;
    case 'error':
      console.error(...args);
      break;
  }
}

function emit(
  level: LogLevel,
  module: string,
  msg: string,
  error: unknown | undefined,
  ctx: LogContext | undefined,
) {
  if (LEVEL_RANK[level] < getMinLevel()) return;
  if (isServer) emitServer(level, module, msg, error, ctx);
  else emitClient(level, module, msg, error, ctx);
}

export function createLogger(module: string): Logger {
  return {
    debug(msg, ctx?) {
      emit('debug', module, msg, undefined, ctx);
    },
    info(msg, ctx?) {
      emit('info', module, msg, undefined, ctx);
    },
    warn(msg, error?, ctx?) {
      emit('warn', module, msg, error, ctx);
    },
    error(msg, error?, ctx?) {
      emit('error', module, msg, error, ctx);
    },
  };
}
