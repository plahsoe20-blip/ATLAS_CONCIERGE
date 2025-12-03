import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as xss from 'xss';

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return xss(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj !== null && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }
}

// SQL Injection Prevention (handled by Prisma ORM automatically)
// NoSQL Injection Prevention
export const sanitizeMongoQuery = (query: any): any => {
  if (typeof query === 'string') {
    return query.replace(/[$]/g, '');
  }

  if (Array.isArray(query)) {
    return query.map(sanitizeMongoQuery);
  }

  if (query !== null && typeof query === 'object') {
    const sanitized: any = {};
    for (const key in query) {
      if (query.hasOwnProperty(key) && !key.startsWith('$')) {
        sanitized[key] = sanitizeMongoQuery(query[key]);
      }
    }
    return sanitized;
  }

  return query;
};
