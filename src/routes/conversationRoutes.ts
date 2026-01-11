import { Router } from 'express';
import * as conversationController from '../controllers/conversationController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// GET /api/conversations - Get all conversations
router.get('/', requireAuth, conversationController.getAllConversations);

// GET /api/conversations/:id - Get single conversation with messages
router.get('/:id', requireAuth, conversationController.getConversationById);

export default router;
