/**
 * Simple console logger for BOŞLUK
 * (Winston dependency olmadan basit implementation)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogMeta {
    [key: string]: any;
}

function formatLog(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaStr}`;
}

/**
 * Structured logging helpers
 */
export const log = {
    info: (message: string, meta?: LogMeta) => {
        console.log(formatLog('info', message, meta));
    },

    warn: (message: string, meta?: LogMeta) => {
        console.warn(formatLog('warn', message, meta));
    },

    error: (message: string, meta?: LogMeta) => {
        console.error(formatLog('error', message, meta));
    },

    debug: (message: string, meta?: LogMeta) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(formatLog('debug', message, meta));
        }
    },

    // Security events
    security: (event: string, meta?: LogMeta) => {
        console.warn(formatLog('warn', `[SECURITY] ${event}`, meta));
    },

    // API events
    api: (method: string, endpoint: string, meta?: LogMeta) => {
        console.log(formatLog('info', `[API] ${method} ${endpoint}`, meta));
    },
};

// Production: External logging integration point
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    log.info('Production mode: External logging ready (Sentry)');
}
