import Conversation from '../database/models/Conversation';
import Message from '../database/models/Message';
import Client from '../database/models/Client';
import Order from '../database/models/Order';
import { ConversationListItem, ConversationWithMessages, CollectedData } from '../types';
import { Op } from 'sequelize';

// Get all conversations with optional filters
export const getAllConversations = async (filters?: {
  startDate?: Date;
  endDate?: Date;
  status?: string;
  converted?: boolean;
  clientId?: number;
}): Promise<ConversationListItem[]> => {
  const whereClause: any = {};

  // CRITICAL: Filter by clientId for multi-client data isolation
  if (filters?.clientId) {
    whereClause.clientId = filters.clientId;
  }

  if (filters?.startDate && filters?.endDate) {
    whereClause.startedAt = {
      [Op.between]: [filters.startDate, filters.endDate]
    };
  }

  if (filters?.status) {
    whereClause.status = filters.status;
  }

  // Bug #4 Fix: Optimized conversion filter using JOIN instead of N+1 queries
  const includeModels: any[] = [
    {
      model: Client,
      as: 'client',
      attributes: ['id', 'name', 'segment']
    }
  ];

  // Add Order association for conversion filtering
  if (filters?.converted !== undefined) {
    includeModels.push({
      model: Order,
      as: 'order',
      required: filters.converted, // INNER JOIN if converted=true, LEFT JOIN if converted=false
      attributes: ['id'] // Only need to know if order exists
    });
  }

  const conversations = await Conversation.findAll({
    where: whereClause,
    include: includeModels,
    order: [['lastMessageAt', 'DESC']]
  });

  // Filter out conversations without orders when converted=false
  let results = conversations;
  if (filters?.converted === false) {
    results = conversations.filter(conv => !conv.get('order'));
  }

  return results.map((conv) => ({
    id: conv.id,
    clientId: conv.clientId,
    customerPhone: conv.customerPhone,
    status: conv.status,
    startedAt: conv.startedAt,
    lastMessageAt: conv.lastMessageAt,
    client: conv.get('client') as ConversationListItem['client']
  }));
};

// Get single conversation with all messages and order
export const getConversationById = async (id: number): Promise<ConversationWithMessages | null> => {
  const conversation = await Conversation.findByPk(id, {
    include: [
      {
        model: Message,
        as: 'messages'
      },
      {
        model: Client,
        as: 'client'
      },
      {
        model: Order,
        as: 'order'
      }
    ],
    // CRITICAL FIX: Correct Sequelize syntax for ordering nested associations
    order: [[{ model: Message, as: 'messages' }, 'createdAt', 'ASC']]
  });

  if (!conversation) {
    return null;
  }

  return {
    id: conversation.id,
    clientId: conversation.clientId,
    customerPhone: conversation.customerPhone,
    status: conversation.status,
    transferReason: conversation.transferReason,
    currentState: conversation.currentState,
    collectedData: conversation.collectedData,
    flowType: conversation.flowType,
    startedAt: conversation.startedAt,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
    messages: (conversation.get('messages') as Message[]) || [],
    client: conversation.get('client') as Client,
    order: conversation.get('order') as Order | undefined
  };
};

// Find or create conversation for a customer
export const findOrCreateConversation = async (
  clientId: number,
  customerPhone: string
): Promise<Conversation> => {
  // Use findOrCreate to avoid race condition
  // This is atomic and prevents duplicate conversations from simultaneous messages
  const [conversation, created] = await Conversation.findOrCreate({
    where: {
      clientId,
      customerPhone,
      status: 'ongoing'
    },
    defaults: {
      clientId,
      customerPhone,
      status: 'ongoing',
      startedAt: new Date(),
      lastMessageAt: new Date()
    }
  });

  // If conversation already existed, update the timestamp
  if (!created) {
    await conversation.update({ lastMessageAt: new Date() });
  }

  return conversation;
};

// Update conversation lastMessageAt
export const updateConversationTimestamp = async (conversationId: number): Promise<void> => {
  await Conversation.update(
    { lastMessageAt: new Date() },
    { where: { id: conversationId } }
  );
};

// Update conversation state
export const updateState = async (
  conversationId: number,
  newState: string,
  collectedData?: CollectedData
): Promise<void> => {
  const updateData: any = {
    currentState: newState,
    lastMessageAt: new Date()
  };

  if (collectedData) {
    updateData.collectedData = collectedData;
  }

  await Conversation.update(updateData, { where: { id: conversationId } });
};

// Transfer conversation to human
export const transferToHuman = async (
  conversationId: number,
  reason: string
): Promise<void> => {
  await Conversation.update(
    {
      status: 'transferred',
      transferReason: reason,
      currentState: 'transferred_to_human',
      lastMessageAt: new Date()
    },
    { where: { id: conversationId } }
  );

  // Log human fallback with reason
  console.log(`Human fallback triggered for conversation ${conversationId}. Reason: ${reason}`);
};

// Mark conversation as completed
export const markCompleted = async (conversationId: number): Promise<void> => {
  await Conversation.update(
    {
      status: 'completed',
      lastMessageAt: new Date()
    },
    { where: { id: conversationId } }
  );
};

// Set flow type for conversation (based on client segment)
export const updateFlowType = async (
  conversationId: number,
  flowType: 'delivery' | 'clothing'
): Promise<void> => {
  await Conversation.update(
    {
      flowType,
      currentState: 'greeting',
      lastMessageAt: new Date()
    },
    { where: { id: conversationId } }
  );
};
