import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// All config from .env - NEVER hardcoded
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Retry configuration for 24/7 reliability
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second initial delay
const RETRY_BACKOFF_MULTIPLIER = 2; // Exponential backoff

// Lazy initialize Twilio client only when credentials are valid
let client: ReturnType<typeof twilio> | null = null;

const getTwilioClient = () => {
  if (!client) {
    if (!accountSid || !authToken || !accountSid.startsWith('AC')) {
      console.warn('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file.');
      throw new Error('Twilio credentials not configured');
    }
    client = twilio(accountSid, authToken);
  }
  return client;
};

/**
 * Delay utility for retry backoff
 */
const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send WhatsApp message with automatic retry on failure
 * Ensures 24/7 reliability by retrying failed sends with exponential backoff
 */
export const sendWhatsAppMessage = async (to: string, body: string): Promise<void> => {
  const twilioClient = getTwilioClient();

  // Ensure phone number has whatsapp: prefix
  const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await twilioClient.messages.create({
        from: whatsappNumber,
        to: toNumber,
        body: body
      });

      console.log(`WhatsApp message sent to ${to} (attempt ${attempt})`);
      return; // Success - exit function
    } catch (error: any) {
      lastError = error;
      console.error(`Error sending WhatsApp message (attempt ${attempt}/${MAX_RETRIES}):`, error.message);

      // Don't retry on authentication or invalid number errors
      if (error.code === 20003 || error.code === 21211 || error.code === 21614) {
        console.error('Non-retryable Twilio error, aborting retries');
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < MAX_RETRIES) {
        const waitTime = RETRY_DELAY_MS * Math.pow(RETRY_BACKOFF_MULTIPLIER, attempt - 1);
        console.log(`Retrying in ${waitTime}ms...`);
        await delay(waitTime);
      }
    }
  }

  // All retries exhausted
  console.error(`Failed to send WhatsApp message after ${MAX_RETRIES} attempts`);
  throw lastError;
};

// Parse incoming Twilio webhook
export const parseIncomingMessage = (body: any): {
  from: string;
  to: string;
  content: string;
  isAudio: boolean;
  mediaUrl?: string;
} => {
  const from = body.From?.replace('whatsapp:', '') || '';
  const to = body.To?.replace('whatsapp:', '') || '';
  const content = body.Body || '';
  const isAudio = body.MediaContentType0?.startsWith('audio/') || false;
  const mediaUrl = body.MediaUrl0;

  return {
    from,
    to,
    content,
    isAudio,
    mediaUrl
  };
};
