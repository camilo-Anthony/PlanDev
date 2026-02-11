/**
 * Centralized Logger
 * 
 * Provides structured logging with environment-aware behavior.
 * In production, only errors are logged. In development, all levels are shown.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LoggerOptions {
    context?: string;
    data?: Record<string, unknown>;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV === 'development';

    private formatMessage(level: LogLevel, message: string, options?: LoggerOptions): string {
        const timestamp = new Date().toISOString();
        const context = options?.context ? `[${options.context}]` : '';
        return `${timestamp} ${level.toUpperCase()} ${context} ${message}`;
    }

    info(message: string, options?: LoggerOptions): void {
        if (this.isDevelopment) {
            console.log(this.formatMessage('info', message, options), options?.data || '');
        }
    }

    warn(message: string, options?: LoggerOptions): void {
        if (this.isDevelopment) {
            console.warn(this.formatMessage('warn', message, options), options?.data || '');
        }
    }

    error(message: string, error?: unknown, options?: LoggerOptions): void {
        // Always log errors, even in production
        console.error(
            this.formatMessage('error', message, options),
            error instanceof Error ? error.message : error
        );

        if (error instanceof Error && this.isDevelopment) {
            console.error('Stack trace:', error.stack);
        }
    }

    debug(message: string, options?: LoggerOptions): void {
        if (this.isDevelopment) {
            console.debug(this.formatMessage('debug', message, options), options?.data || '');
        }
    }
}

// Singleton instance
export const logger = new Logger();

// Helper for API route logging
export function logApiError(context: string, error: unknown): void {
    logger.error(`${context} API Error`, error, { context });
}

// Helper for client-side logging  
export function logClientError(context: string, error: unknown): void {
    logger.error(`${context} Client Error`, error, { context });
}
