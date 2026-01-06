import { Router } from 'express';
import webhookRoutes from './webhookRoutes';
import conversationRoutes from './conversationRoutes';
import clientRoutes from './clientRoutes';
import reportsRoutes from './reportsRoutes';

const router = Router();

// Webhook routes (Twilio)
router.use('/webhook', webhookRoutes);

// Conversation routes
router.use('/conversations', conversationRoutes);

// Client routes
router.use('/clients', clientRoutes);

// Reports routes
router.use('/reports', reportsRoutes);

export default router;
