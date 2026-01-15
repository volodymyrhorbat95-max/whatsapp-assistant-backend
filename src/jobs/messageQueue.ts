import { Queue, Worker, Job } from 'bullmq';
import dotenv from 'dotenv';
import * as clientService from '../services/clientService';
import * as conversationService from '../services/conversationService';
import * as messageService from '../services/messageService';
import * as twilioService from '../services/twilioService';
import * as audioService from '../services/audioService';
import * as orderService from '../services/orderService';
import * as flowEngine from '../engine/flowEngine';

dotenv.config();

// Redis connection from .env - NEVER hardcoded
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null
};

// Message queue interface
interface WhatsAppMessageJob {
  from: string;
  to: string;
  content: string;
  isAudio: boolean;
  mediaUrl?: string;
}

// Check if Redis should be disabled (set DISABLE_REDIS=true in .env to skip Redis)
const REDIS_DISABLED = process.env.DISABLE_REDIS === 'true';

// Create the queue (optional - only if Redis not explicitly disabled)
let messageQueue: Queue<WhatsAppMessageJob> | null = null;

if (!REDIS_DISABLED) {
  try {
    messageQueue = new Queue<WhatsAppMessageJob>('whatsapp-messages', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        },
        removeOnComplete: 100,
        removeOnFail: 100
      }
    });
  } catch (error) {
    console.warn('Redis not available - message queue disabled. WhatsApp functionality will not work.');
  }
}

export { messageQueue };

// Process messages
const processMessage = async (job: Job<WhatsAppMessageJob>): Promise<void> => {
  // Skip health-check jobs - they're only for testing Redis connectivity
  if (job.name === 'health-check') {
    return;
  }

  const { from, to, content: originalContent, isAudio, mediaUrl } = job.data;

  try {
    console.log(`Processing WhatsApp message from ${from} to ${to}`);

    // 1. Find client by WhatsApp number
    const client = await clientService.findClientByWhatsAppNumber(to);

    if (!client) {
      console.error(`No active client found for WhatsApp number: ${to}`);
      return;
    }

    // 2. Check for existing conversation (including transferred)
    // CRITICAL: If conversation is transferred, store message but DO NOT process through flow
    // Requirement: "The bot stops processing any further messages in this conversation"
    const existingConversation = await conversationService.findActiveConversation(
      client.id,
      from
    );

    // Handle transferred conversation - store message but don't respond
    if (existingConversation && existingConversation.status === 'transferred') {
      console.log(`Conversation ${existingConversation.id} is transferred - storing message only, no bot response`);

      // Store the incoming message for record-keeping (requirement)
      let content = originalContent;
      if (isAudio && mediaUrl) {
        const transcription = await audioService.processAudioMessage(mediaUrl);
        content = transcription || '[Audio transcription failed]';
      }

      await messageService.createMessage(
        existingConversation.id,
        'incoming',
        content || '[Message content unavailable]',
        isAudio ? 'audio' : 'text'
      );

      // Update timestamp on transferred conversation
      await conversationService.updateConversationTimestamp(existingConversation.id);

      console.log(`Message stored for transferred conversation ${existingConversation.id} - human agent will handle`);
      return; // Do not process further - human agent handles this
    }

    // 3. Find or create ongoing conversation (normal flow)
    const conversation = existingConversation || await conversationService.findOrCreateConversation(
      client.id,
      from
    );

    // Set flowType based on client segment on first message if not set
    if (!conversation.flowType) {
      const flowType = client.segment; // 'delivery' or 'clothing' from client config
      await conversationService.updateFlowType(conversation.id, flowType);
      conversation.flowType = flowType;
      conversation.currentState = 'greeting';
      conversation.collectedData = {};
    }

    // 4. Handle audio transcription if needed
    let content = originalContent;
    if (isAudio && mediaUrl) {
      console.log('Transcribing audio message...');
      const transcription = await audioService.processAudioMessage(mediaUrl);

      if (!transcription) {
        // Transcription failed - ask user to type
        const fallbackMessage = 'Não consegui entender o áudio. Pode escrever?';

        // Store incoming audio message (failed transcription)
        await messageService.createMessage(
          conversation.id,
          'incoming',
          '[Audio transcription failed]',
          'audio'
        );

        // Store outgoing message FIRST (before sending)
        // CRITICAL: Store before send to prevent data loss on retry
        await messageService.createMessage(
          conversation.id,
          'outgoing',
          fallbackMessage,
          'text'
        );

        // Send fallback message to customer
        await twilioService.sendWhatsAppMessage(from, fallbackMessage);

        return;
      }

      content = transcription;
      console.log('Audio transcribed:', content);
    }

    // 5. Save incoming message
    await messageService.createMessage(
      conversation.id,
      'incoming',
      content,
      isAudio ? 'audio' : 'text'
    );

    // 6. Process through flow engine
    const flowResponse = flowEngine.processMessage(
      conversation,
      content,
      client.configuration
    );

    // 7. Handle human transfer
    if (flowResponse.shouldTransfer && flowResponse.transferReason) {
      await conversationService.transferToHuman(
        conversation.id,
        flowResponse.transferReason
      );
    }

    // 8. Create order if confirmed (delivery flow)
    if (flowResponse.shouldCreateOrder && flowResponse.collectedData.items) {
      await orderService.createOrder(
        conversation.id,
        client.id,
        flowResponse.collectedData
      );

      // Mark conversation as completed
      await conversationService.markCompleted(conversation.id);
    }

    // 8b. Create reservation if confirmed (clothing flow)
    if (flowResponse.shouldCreateReservation && flowResponse.collectedData.product) {
      await orderService.createOrder(
        conversation.id,
        client.id,
        flowResponse.collectedData
      );

      // Mark conversation as completed
      await conversationService.markCompleted(conversation.id);
    }

    // 9. Update conversation state
    await conversationService.updateState(
      conversation.id,
      flowResponse.newState,
      flowResponse.collectedData
    );

    // 10. Save outgoing message FIRST (before sending)
    // CRITICAL: Store message before sending to prevent duplicates on retry
    // If we send first and createMessage fails, BullMQ retry will send again
    await messageService.createMessage(
      conversation.id,
      'outgoing',
      flowResponse.response,
      'text'
    );

    // 11. Send bot response via WhatsApp
    // If this fails, the message is stored but not sent - which is recoverable
    // The reverse (sent but not stored) violates the requirement
    await twilioService.sendWhatsAppMessage(from, flowResponse.response);

    console.log(`Message processed successfully for conversation ${conversation.id}`);
  } catch (error: any) {
    console.error('Error processing WhatsApp message:', {
      from,
      to,
      error: error.message,
      stack: error.stack,
      jobId: job.id
    });

    // Try to store and send error message to customer
    // CRITICAL: Every message must be stored for record-keeping (requirement)
    try {
      const errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns minutos.';

      // Try to store messages FIRST (before sending)
      // Find the conversation to store the error message
      const client = await clientService.findClientByWhatsAppNumber(to);
      if (client) {
        const conversation = await conversationService.findOrCreateConversation(client.id, from);

        // Store the original incoming message that caused the error (if not already stored)
        await messageService.createMessage(
          conversation.id,
          'incoming',
          originalContent || '[Message content unavailable]',
          isAudio ? 'audio' : 'text'
        );

        // Store the error response message BEFORE sending
        await messageService.createMessage(
          conversation.id,
          'outgoing',
          errorMessage,
          'text'
        );
      }

      // Send error message to customer (after storing)
      await twilioService.sendWhatsAppMessage(from, errorMessage);
    } catch (twilioError: any) {
      console.error('Failed to send/store error message to customer:', twilioError.message);
    }

    // Re-throw to let BullMQ retry mechanism handle it
    throw error;
  }
};

// Create the worker (optional - only if Redis not explicitly disabled)
let messageWorker: Worker<WhatsAppMessageJob> | null = null;

if (!REDIS_DISABLED) {
  try {
    messageWorker = new Worker<WhatsAppMessageJob>(
      'whatsapp-messages',
      processMessage,
      {
        connection,
        concurrency: 5
      }
    );

    // Worker event handlers
    messageWorker.on('completed', (job) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    messageWorker.on('failed', (job, err) => {
      console.error(`Job ${job?.id} failed:`, err.message);
    });
  } catch (error) {
    console.warn('Redis worker not available');
  }
}

export { messageWorker };

// Add message to queue
export const addMessageToQueue = async (data: WhatsAppMessageJob): Promise<void> => {
  if (!messageQueue) {
    console.warn('Message queue not available - Redis not running');
    return;
  }
  await messageQueue.add('process-message', data);
  console.log(`Message added to queue from ${data.from}`);
};

// Initialize queue (call on server start)
export const initializeMessageQueue = async (): Promise<void> => {
  // If Redis is explicitly disabled, just log and return
  if (REDIS_DISABLED) {
    console.log('✅ Redis explicitly disabled via DISABLE_REDIS=true');
    console.log('⚠️  WhatsApp functionality will NOT work');
    return;
  }

  // If we got here, Redis should be available
  if (messageQueue && messageWorker) {
    // Test Redis connection by adding a test job
    try {
      await messageQueue.add('health-check', {
        from: 'health-check',
        to: 'health-check',
        content: 'health-check',
        isAudio: false
      }, {
        removeOnComplete: true,
        removeOnFail: true
      });
      console.log('✅ Message queue initialized with Redis');
      console.log('✅ WhatsApp functionality is ACTIVE');
    } catch (error: any) {
      console.error('❌ Redis connection test failed:', error.message);

      // In production, FAIL FAST - refuse to start
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ CRITICAL: Refusing to start server without Redis in production');
        console.error('❌ Set DISABLE_REDIS=true in .env if you want to start without WhatsApp functionality');
        throw new Error('Redis connection failed in production environment');
      } else {
        console.warn('⚠️  Development mode: Server will start but WhatsApp will NOT work');
      }
    }
  } else {
    console.warn('⚠️  Message queue NOT initialized - Redis not available');
    console.warn('⚠️  WhatsApp functionality is DISABLED');

    // In production, this is a critical failure
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ CRITICAL: Cannot start without Redis in production');
      throw new Error('Redis not available in production environment');
    }
  }
};
