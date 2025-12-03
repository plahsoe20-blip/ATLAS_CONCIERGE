import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as crypto from 'crypto';

// Define custom request type for CSRF middleware
interface RequestWithSession {
  method: string;
  headers: any;
  body: any;
  session?: {
    csrfToken?: string;
    [key: string]: any;
  };
}

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: RequestWithSession, res: Response, next: NextFunction) {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Ensure session exists
    if (!req.session) {
      return res.status(500).json({
        statusCode: 500,
        message: 'Session not initialized',
        error: 'Internal Server Error',
      });
    }

    // Generate CSRF token if not exists
    if (!req.session.csrfToken) {
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
export const getCsrfToken = (req: RequestWithSession) => {
  // Initialize session if not exists
  if (!req.session) {
    throw new Error('Session middleware not configured');
  }

  // Generate CSRF token if not exists
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  return { csrfToken: req.session.csrfToken };
};
