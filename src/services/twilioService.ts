import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

// All config from .env - NEVER hardcoded
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

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

// Send WhatsApp message
export const sendWhatsAppMessage = async (to: string, body: string): Promise<void> => {
  try {
    const twilioClient = getTwilioClient();

    // Ensure phone number has whatsapp: prefix
    const toNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    await twilioClient.messages.create({
      from: whatsappNumber,
      to: toNumber,
      body: body
    });

    console.log(`WhatsApp message sent to ${to}`);
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
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
