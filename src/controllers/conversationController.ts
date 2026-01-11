import { Request, Response } from 'express';
import * as conversationService from '../services/conversationService';

// GET /api/conversations
export const getAllConversations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, status, converted, clientId } = req.query;

    // CRITICAL: clientId is required for multi-client data isolation
    if (!clientId) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'clientId query parameter is required'
      });
      return;
    }

    const filters: any = {};

    // Parse and validate clientId
    const parsedClientId = parseInt(clientId as string, 10);
    if (isNaN(parsedClientId)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'clientId must be a valid number'
      });
      return;
    }
    filters.clientId = parsedClientId;

    // Validate and parse dates
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      // Check if dates are valid
      if (isNaN(start.getTime())) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'startDate is not a valid date'
        });
        return;
      }

      if (isNaN(end.getTime())) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'endDate is not a valid date'
        });
        return;
      }

      // Ensure end date is after start date
      if (end < start) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'endDate must be after startDate'
        });
        return;
      }

      filters.startDate = start;
      filters.endDate = end;
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
    const conversationId = parseInt(id, 10);

    // Validate ID is a number
    if (isNaN(conversationId)) {
      res.status(400).json({ error: 'Invalid conversation ID' });
      return;
    }

    const conversation = await conversationService.getConversationById(conversationId);

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
