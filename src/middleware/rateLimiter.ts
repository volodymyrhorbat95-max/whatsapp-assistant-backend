// Rate Limiting Middleware
// Protects API from DoS attacks and brute force attempts

import rateLimit from 'express-rate-limit';

/**
 * Global rate limit: 100 requests per 15 minutes per IP
 * Applied to all /api routes
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health'
});

/**
 * Strict rate limit for expensive report endpoints
 * 30 requests per minute (allows 6 full page loads with 5 reports each)
 */
export const reportsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Max 30 requests per minute
  message: {
    error: 'Too many report requests',
    message: 'Please wait before requesting more reports'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Stricter limit for client creation
 * Prevents abuse of client registration
 */
export const createClientLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 new clients per hour per IP
  message: {
    error: 'Too many client registrations',
    message: 'Please wait before creating more clients'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Webhook rate limiter - more lenient as these come from Twilio
 * But still protect against flood attacks
 */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // Max 60 webhooks per minute (1 per second)
  message: {
    error: 'Too many webhook requests',
    message: 'Rate limit exceeded'
  },
  standardHeaders: true,
  legacyHeaders: false
});
