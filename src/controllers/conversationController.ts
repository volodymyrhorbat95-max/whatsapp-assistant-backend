import { Request, Response } from 'express';
import * as conversationService from '../services/conversationService';

// GET /api/conversations
export const getAllConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, status, converted } = req.query;

    const filters: any = {};

    if (startDate && endDate) {
      filters.startDate = new Date(startDate as string);
      filters.endDate = new Date(endDate as string);
    }

    if (status) {
      filters.status = status as string;
    }

    if (converted !== undefined && converted !== '') {
      filters.converted = converted === 'true';
    }

    const conversations = await conversationService.getAllConversations(filters);
    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// GET /api/conversations/:id
export const getConversationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const conversation = await conversationService.getConversationById(parseInt(id));

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};
