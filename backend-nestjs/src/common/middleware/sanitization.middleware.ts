import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
// import * as xss from 'xss';

// Simple XSS sanitization function
const sanitizeValue = (value: any): any => {
  if (typeof value === 'string') {
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (typeof value === 'object' && value !== null) {
    const sanitized: any = {};
    for (const key in value) {
      sanitized[key] = sanitizeValue(value[key]);
    }
    return sanitized;
  }
  return value;
};

@Injectable()
export class InputSanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body) {
      req.body = sanitizeValue(req.body);
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeValue(req.query);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeValue(req.params);
    }

    next();
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
