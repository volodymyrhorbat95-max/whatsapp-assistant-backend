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
}): Promise<ConversationListItem[]> => {
  const whereClause: any = {};

  if (filters?.startDate && filters?.endDate) {
    whereClause.startedAt = {
      [Op.between]: [filters.startDate, filters.endDate]
    };
  }

  if (filters?.status) {
    whereClause.status = filters.status;
  }

  const conversations = await Conversation.findAll({
    where: whereClause,
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'segment']
      }
    ],
    order: [['lastMessageAt', 'DESC']]
  });

  let results = conversations.map((conv) => ({
    id: conv.id,
    clientId: conv.clientId,
    customerPhone: conv.customerPhone,
    status: conv.status,
    startedAt: conv.startedAt,
    lastMessageAt: conv.lastMessageAt,
    client: conv.get('client') as ConversationListItem['client']
  }));

  // Filter by converted if specified
  if (filters?.converted !== undefined) {
    const conversationIds = results.map(c => c.id);
    const orders = await Order.findAll({
      where: {
        conversationId: {
          [Op.in]: conversationIds
        }
      },
      attributes: ['conversationId']
    });

    const convertedIds = new Set(orders.map(o => o.conversationId));

    results = results.filter(conv => {
      const hasOrder = convertedIds.has(conv.id);
      return filters.converted ? hasOrder : !hasOrder;
    });
  }

  return results;
};

// Get single conversation with all messages and order
export const getConversationById = async (id: number): Promise<ConversationWithMessages | null> => {
  const conversation = await Conversation.findByPk(id, {
    include: [
      {
        model: Message,
        as: 'messages',
        order: [['createdAt', 'ASC']]
      },
      {
        model: Client,
        as: 'client'
      },
      {
        model: Order,
        as: 'order'
      }
    ]
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
  // Look for an existing ongoing conversation (within last 24 hours)
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  let conversation = await Conversation.findOne({
    where: {
      clientId,
      customerPhone,
      status: 'ongoing'
    },
    order: [['lastMessageAt', 'DESC']]
  });

  // If no ongoing conversation, create a new one
  if (!conversation) {
    conversation = await Conversation.create({
      clientId,
      customerPhone,
      status: 'ongoing',
      startedAt: new Date(),
      lastMessageAt: new Date()
    });
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
