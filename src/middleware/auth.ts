// Authentication Middleware
// Provides basic API key authentication for all admin endpoints

import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include authenticated flag
declare global {
  namespace Express {
    interface Request {
      authenticated?: boolean;
    }
  }
}

/**
 * Basic API Key Authentication
 * Checks for X-API-Key header and validates against ADMIN_API_KEY from .env
 *
 * Usage:
 * - In production: Set strong random API key in .env (ADMIN_API_KEY=...)
 * - In requests: Add header "X-API-Key: your-api-key"
 *
 * Future: Replace with JWT-based authentication for multi-user support
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.ADMIN_API_KEY;

  // If no API key configured, deny access in production
  if (!validApiKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('SECURITY: ADMIN_API_KEY not set in production environment');
      res.status(500).json({ error: 'Server configuration error' });
      return;
    } else {
      // In development, warn but allow (for easier testing)
      console.warn('WARNING: ADMIN_API_KEY not set - authentication disabled in development');
      req.authenticated = true;
      next();
      return;
    }
  }

  // Check if API key provided
  if (!apiKey) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'X-API-Key header required'
    });
    return;
  }

  // Validate API key
  if (apiKey !== validApiKey) {
    console.warn('Authentication failed: Invalid API key attempt');
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
    return;
  }

  // Authentication successful
  req.authenticated = true;
  next();
};

/**
 * Optional authentication - doesn't block if not authenticated
 * But sets req.authenticated flag for conditional logic
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.ADMIN_API_KEY;

  if (validApiKey && apiKey === validApiKey) {
    req.authenticated = true;
  } else {
    req.authenticated = false;
  }

  next();
};
