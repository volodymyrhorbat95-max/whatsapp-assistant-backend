import { Router } from 'express';
import webhookRoutes from './webhookRoutes';
import conversationRoutes from './conversationRoutes';
import clientRoutes from './clientRoutes';
import reportsRoutes from './reportsRoutes';
import orderRoutes from './orderRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

// Health check routes (no auth required)
router.use('/health', healthRoutes);

// Webhook routes (Twilio)
router.use('/webhook', webhookRoutes);

// Conversation routes
router.use('/conversations', conversationRoutes);

// Client routes
router.use('/clients', clientRoutes);

// Reports routes
router.use('/reports', reportsRoutes);

// Order routes
router.use('/orders', orderRoutes);

export default router;
