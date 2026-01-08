import Message from '../database/models/Message';
import { MessageDirection, MessageType } from '../types';
import { updateConversationTimestamp } from './conversationService';

// Create a new message
export const createMessage = async (
  conversationId: number,
  direction: MessageDirection,
  content: string,
  messageType: MessageType = 'text'
): Promise<Message> => {
  const message = await Message.create({
    conversationId,
    direction,
    content,
    messageType
  });

  // Log message received/sent
  const directionLabel = direction === 'incoming' ? 'received' : 'sent';
  console.log(`Message ${directionLabel} [${messageType}] for conversation ${conversationId}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`);

  // Update conversation timestamp
  await updateConversationTimestamp(conversationId);

  return message;
};

// Get all messages for a conversation
export const getMessagesByConversationId = async (conversationId: number): Promise<Message[]> => {
  const messages = await Message.findAll({
    where: { conversationId },
    order: [['createdAt', 'ASC']]
  });

  return messages;
};
