import { Router } from 'express';
import * as webhookController from '../controllers/webhookController';

const router = Router();

// POST /api/webhook/twilio - Receive WhatsApp messages from Twilio
router.post('/twilio', webhookController.handleTwilioWebhook);

export default router;
