import { Router } from 'express';
import * as webhookController from '../controllers/webhookController';
import { webhookLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/webhook/twilio - Receive WhatsApp messages from Twilio
// Note: No requireAuth here - Twilio calls this endpoint
// TODO: Add Twilio signature validation for security
router.post('/twilio', webhookLimiter, webhookController.handleTwilioWebhook);

export default router;
