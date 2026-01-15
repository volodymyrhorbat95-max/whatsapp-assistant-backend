// Order Routes - API endpoints for order management
// Handles order status updates and notifications

import { Router, Request, Response } from 'express';
import * as orderService from '../services/orderService';
import * as twilioService from '../services/twilioService';
import * as messageService from '../services/messageService';
import Conversation from '../database/models/Conversation';
import Client from '../database/models/Client';
import { OrderStatus } from '../types';
import { requireAuth } from '../middleware/auth';
import { validateId, validateOrderStatus } from '../middleware/validators';

const router = Router();

// Status messages in Brazilian Portuguese
const STATUS_MESSAGES: Record<OrderStatus, string> = {
  pending: 'Seu pedido está pendente.',
  confirmed: 'Seu pedido foi confirmado!',
  preparing: 'Seu pedido está sendo preparado! 🍳',
  out_for_delivery: 'Seu pedido saiu para entrega! 🚗',
  delivered: 'Seu pedido foi entregue! Obrigado pela preferência! 🎉',
  cancelled: 'Seu pedido foi cancelado.'
};

/**
 * GET /api/orders/:id
 * Get single order by ID
 * SECURITY: Requires clientId query parameter to prevent cross-client data access
 */
router.get('/:id', requireAuth, validateId('id'), async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string, 10) : undefined;

    // CRITICAL: clientId is required for multi-client data isolation
    if (!clientId || isNaN(clientId)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'clientId query parameter is required'
      });
      return;
    }

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // CRITICAL: Verify order belongs to the specified client
    if (order.clientId !== clientId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'This order does not belong to the specified client'
      });
      return;
    }

    res.json(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/orders/conversation/:conversationId
 * Get order by conversation ID
 * SECURITY: Requires clientId query parameter to prevent cross-client data access
 */
router.get('/conversation/:conversationId', requireAuth, validateId('conversationId'), async (req: Request, res: Response): Promise<void> => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string, 10) : undefined;

    // CRITICAL: clientId is required for multi-client data isolation
    if (!clientId || isNaN(clientId)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'clientId query parameter is required'
      });
      return;
    }

    // Verify conversation belongs to this client
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    if (conversation.clientId !== clientId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'This conversation does not belong to the specified client'
      });
      return;
    }

    const orders = await orderService.getOrdersByConversation(conversationId);
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/orders/client/:clientId
 * Get all orders for a client
 */
router.get('/client/:clientId', requireAuth, validateId('clientId'), async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = parseInt(req.params.clientId, 10);
    const orders = await orderService.getOrdersByClient(clientId);
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * PUT /api/orders/:id/status
 * Update order status and notify customer via WhatsApp
 * SECURITY: Requires clientId in request body to prevent cross-client order modification
 */
router.put('/:id/status', requireAuth, validateId('id'), validateOrderStatus, async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status, notifyCustomer = true, clientId } = req.body;

    // CRITICAL: clientId is required for multi-client data isolation
    if (!clientId || typeof clientId !== 'number') {
      res.status(400).json({
        error: 'Bad Request',
        message: 'clientId is required in request body'
      });
      return;
    }

    // Fetch order and verify ownership BEFORE updating
    const existingOrder = await orderService.getOrderById(orderId);

    if (!existingOrder) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // CRITICAL: Verify order belongs to this client
    if (existingOrder.clientId !== clientId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'This order does not belong to the specified client'
      });
      return;
    }

    // Update order status
    const order = await orderService.updateOrderStatus(orderId, status);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Bug #5 Fix: Track notification status and return in response
    let notificationStatus: 'sent' | 'failed' | 'skipped' = 'skipped';
    let notificationError: string | undefined;

    // Notify customer via WhatsApp if requested
    if (notifyCustomer) {
      try {
        // Get conversation to find customer phone
        const conversation = await Conversation.findByPk(order.conversationId);
        if (conversation) {
          // Get client to find WhatsApp number
          const client = await Client.findByPk(order.clientId);
          if (client) {
            const statusMessage = STATUS_MESSAGES[status as OrderStatus];
            // Send message to customer phone
            await twilioService.sendWhatsAppMessage(
              conversation.customerPhone,
              statusMessage
            );

            // CRITICAL: Store the notification message in database
            // Requirement: "Every single message - both incoming from customers and outgoing
            // from the bot - must be permanently stored in the database for record-keeping"
            await messageService.createMessage(
              conversation.id,
              'outgoing',
              statusMessage,
              'text'
            );

            notificationStatus = 'sent';
            console.log('Customer notified of status change:', status);
          }
        }
      } catch (notifyError: any) {
        notificationStatus = 'failed';
        notificationError = notifyError.message;
        console.error('Failed to notify customer:', notifyError.message);
        // Don't fail the request if notification fails
      }
    }

    res.json({
      ...order.toJSON(),
      notification: {
        status: notificationStatus,
        error: notificationError
      }
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
