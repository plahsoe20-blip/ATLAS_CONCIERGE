import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// import { RedisService } from '@liaoliaots/nestjs-redis';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

// Extend Request to include user
interface RequestWithUser extends Request {
  user?: {
    id?: string;
  };
  ip: string;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly requestCounts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 min
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
  }

  async use(req: RequestWithUser, res: Response, next: NextFunction) {
    // Use IP or user ID as key
    const identifier = req.user?.id || req.ip || 'unknown';
    const key = `rate-limit:${identifier}`;

    try {
      const now = Date.now();
      const record = this.requestCounts.get(key);

      if (record && now < record.resetTime) {
        if (record.count >= this.maxRequests) {
          return res.status(429).json({
            statusCode: 429,
            message: 'Too many requests, please try again later',
            error: 'Too Many Requests',
            retryAfter: Math.ceil((record.resetTime - now) / 1000),
          });
        }
        record.count++;
      } else {
        this.requestCounts.set(key, {
          count: 1,
          resetTime: now + this.windowMs,
        });
      }

      const currentRecord = this.requestCounts.get(key)!;
      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - currentRecord.count));
      res.setHeader('X-RateLimit-Reset', currentRecord.resetTime);

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Fail open - don't block requests if there's an error
    }
  }
}

// Per-endpoint rate limiting decorator
export const RateLimit = (maxRequests: number, windowMs: number = 60000) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req = args.find((arg) => arg.user !== undefined);
      if (!req) return originalMethod.apply(this, args);

      // Implement per-endpoint rate limiting logic
      // Similar to middleware but with custom limits

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
};
