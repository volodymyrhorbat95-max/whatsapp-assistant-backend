import { Request, Response } from 'express';
import * as twilioService from '../services/twilioService';
import { addMessageToQueue } from '../jobs/messageQueue';

// POST /api/webhook/twilio
export const handleTwilioWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse incoming message
    const { from, to, content, isAudio, mediaUrl } = twilioService.parseIncomingMessage(req.body);

    console.log(`Received WhatsApp message from ${from} to ${to}: ${content}`);

    // Add message to queue for processing
    // This prevents system freeze under load
    await addMessageToQueue({
      from,
      to,
      content,
      isAudio,
      mediaUrl
    });

    // Return 200 immediately to Twilio
    // Actual processing happens in the queue worker
    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling Twilio webhook:', error);
    // Return 200 to prevent Twilio from retrying
    res.status(200).send('OK');
  }
};
