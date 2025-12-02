import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

/**
 * LoggerService
 * 
 * Custom logger implementation using Winston for structured logging.
 * Includes correlation IDs, company context, and log rotation.
 * 
 * @export
 * @class LoggerService
 * @implements {NestLoggerService}
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  private context?: string;

  constructor(context?: string) {
    this.context = context;
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      defaultMeta: { service: 'atlas-backend', context },
      transports: this.getTransports(),
    });
  }

  /**
   * Get logger transports based on environment
   */
  private getTransports(): winston.transport[] {
    const transports: winston.transport[] = [];

    // Console transport for development
    if (process.env.NODE_ENV !== 'production') {
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
              return `${timestamp} [${context || 'Application'}] ${level}: ${message} ${metaStr}`;
            }),
          ),
        }),
      );
    }

    // File transport for production
    if (process.env.NODE_ENV === 'production') {
      // Error logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      );

      // Combined logs
      transports.push(
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      );
    }

    return transports;
  }

  /**
   * Set context for logger
   */
  setContext(context: string) {
    this.context = context;
  }

  /**
   * Log with additional metadata
   */
  private logWithMeta(level: string, message: any, meta?: Record<string, any>) {
    const logMeta = {
      ...meta,
      context: this.context,
      timestamp: new Date().toISOString(),
    };

    this.logger.log(level, message, logMeta);
  }

  /**
   * Standard NestJS log methods
   */
  log(message: any, context?: string) {
    this.logWithMeta('info', message, { context: context || this.context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logWithMeta('error', message, {
      context: context || this.context,
      trace,
    });
  }

  warn(message: any, context?: string) {
    this.logWithMeta('warn', message, { context: context || this.context });
  }

  debug(message: any, context?: string) {
    this.logWithMeta('debug', message, { context: context || this.context });
  }

  verbose(message: any, context?: string) {
    this.logWithMeta('verbose', message, { context: context || this.context });
  }

  /**
   * Custom structured logging methods
   */
  logRequest(method: string, url: string, statusCode: number, duration: number, meta?: Record<string, any>) {
    this.logWithMeta('info', 'HTTP Request', {
      method,
      url,
      statusCode,
      duration,
      ...meta,
    });
  }

  logDatabase(query: string, duration: number, meta?: Record<string, any>) {
    this.logWithMeta('debug', 'Database Query', {
      query,
      duration,
      ...meta,
    });
  }

  logIntegration(service: string, action: string, success: boolean, duration: number, meta?: Record<string, any>) {
    this.logWithMeta(success ? 'info' : 'error', 'External Integration', {
      service,
      action,
      success,
      duration,
      ...meta,
    });
  }

  logSecurity(event: string, userId?: string, companyId?: string, meta?: Record<string, any>) {
    this.logWithMeta('warn', 'Security Event', {
      event,
      userId,
      companyId,
      ...meta,
    });
  }
}
