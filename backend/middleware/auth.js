import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from './errorHandler.js';
import logger from '../config/logger.js';

export const authMiddleware = (req, res, next) => {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Attach user info to request
    req.user = decoded;

    logger.debug(`Authenticated request from user ${decoded.id} (${decoded.role})`);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new UnauthorizedError('Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Token expired'));
    } else {
      next(error);
    }
  }
};

// Role-based access control middleware
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
};

// Specific role middlewares
export const requireConcierge = requireRole('CONCIERGE', 'CLIENT', 'ADMIN');
export const requireDriver = requireRole('DRIVER', 'ADMIN');
export const requireOperator = requireRole('OPERATOR', 'ADMIN');
export const requireAdmin = requireRole('ADMIN');
