import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { RedisService } from '@liaoliaots/nestjs-redis';

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(private readonly redisService: RedisService) {
    this.windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10); // 15 min
    this.maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const redis = this.redisService.getClient();

    // Use IP or user ID as key
    const identifier = req.user?.id || req.ip;
    const key = `rate-limit:${identifier}`;

    try {
      const current = await redis.get(key);
      const requests = current ? parseInt(current, 10) : 0;

      if (requests >= this.maxRequests) {
        return res.status(429).json({
          statusCode: 429,
          message: 'Too many requests, please try again later',
          error: 'Too Many Requests',
          retryAfter: this.windowMs / 1000,
        });
      }

      // Increment counter
      const pipeline = redis.pipeline();
      pipeline.incr(key);
      if (!current) {
        pipeline.expire(key, this.windowMs / 1000);
      }
      await pipeline.exec();

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', this.maxRequests - requests - 1);
      res.setHeader('X-RateLimit-Reset', Date.now() + this.windowMs);

      next();
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      next(); // Fail open - don't block requests if Redis is down
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
