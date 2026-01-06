import { Router } from 'express';
import * as conversationController from '../controllers/conversationController';

const router = Router();

// GET /api/conversations - Get all conversations
router.get('/', conversationController.getAllConversations);

// GET /api/conversations/:id - Get single conversation with messages
router.get('/:id', conversationController.getConversationById);

export default router;
