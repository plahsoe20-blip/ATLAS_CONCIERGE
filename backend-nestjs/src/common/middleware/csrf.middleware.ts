import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Generate CSRF token if not exists
    if (!req.session?.csrfToken) {
      req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }

    // Verify CSRF token for state-changing requests
    const token = req.headers['x-csrf-token'] || req.body._csrf;

    if (token !== req.session.csrfToken) {
      return res.status(403).json({
        statusCode: 403,
        message: 'Invalid CSRF token',
        error: 'Forbidden',
      });
    }

    next();
  }
}

// CSRF token endpoint
export const getCsrfToken = (req: Request) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return { csrfToken: req.session.csrfToken };
};
