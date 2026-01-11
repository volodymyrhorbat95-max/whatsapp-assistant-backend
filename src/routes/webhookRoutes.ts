import { Router, Request, Response, NextFunction } from 'express';
import * as webhookController from '../controllers/webhookController';
import { webhookLimiter } from '../middleware/rateLimiter';
import twilio from 'twilio';

const router = Router();

/**
 * Validates Twilio webhook signature to ensure requests actually come from Twilio
 * Prevents webhook spoofing attacks
 */
const validateTwilioRequest = (req: Request, res: Response, next: NextFunction): void => {
  const signature = req.headers['x-twilio-signature'] as string;
  const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!authToken) {
    console.error('TWILIO_AUTH_TOKEN not configured - skipping signature validation');
    next();
    return;
  }

  if (!signature) {
    console.warn('No X-Twilio-Signature header - rejecting request');
    res.status(403).json({ error: 'Missing signature' });
    return;
  }

  const isValid = twilio.validateRequest(
    authToken,
    signature,
    url,
    req.body
  );

  if (!isValid) {
    console.warn('Invalid Twilio signature - rejecting request');
    res.status(403).json({ error: 'Invalid signature' });
    return;
  }

  next();
};

// POST /api/webhook/twilio - Receive WhatsApp messages from Twilio
// Note: No requireAuth here - Twilio calls this endpoint
// Twilio signature validation prevents unauthorized webhook calls
router.post('/twilio', validateTwilioRequest, webhookLimiter, webhookController.handleTwilioWebhook);

export default router;
