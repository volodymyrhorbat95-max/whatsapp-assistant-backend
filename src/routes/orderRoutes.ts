// Order Routes - API endpoints for order management
// Handles order status updates and notifications

import { Router, Request, Response } from 'express';
import * as orderService from '../services/orderService';
import * as twilioService from '../services/twilioService';
import Conversation from '../database/models/Conversation';
import Client from '../database/models/Client';
import { OrderStatus } from '../types';

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
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id, 10);

    if (isNaN(orderId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    const order = await orderService.getOrderById(orderId);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json(order);
  } catch (error: any) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/orders/conversation/:conversationId
 * Get order by conversation ID
 */
router.get('/conversation/:conversationId', async (req: Request, res: Response): Promise<void> => {
  try {
    const conversationId = parseInt(req.params.conversationId, 10);

    if (isNaN(conversationId)) {
      res.status(400).json({ error: 'Invalid conversation ID' });
      return;
    }

    const orders = await orderService.getOrdersByConversation(conversationId);
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/orders/client/:clientId
 * Get all orders for a client
 */
router.get('/client/:clientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = parseInt(req.params.clientId, 10);

    if (isNaN(clientId)) {
      res.status(400).json({ error: 'Invalid client ID' });
      return;
    }

    const orders = await orderService.getOrdersByClient(clientId);
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/orders/:id/status
 * Update order status and notify customer via WhatsApp
 */
router.put('/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { status, notifyCustomer = true } = req.body;

    if (isNaN(orderId)) {
      res.status(400).json({ error: 'Invalid order ID' });
      return;
    }

    // Validate status
    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') });
      return;
    }

    // Update order status
    const order = await orderService.updateOrderStatus(orderId, status);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

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
            console.log('Customer notified of status change:', status);
          }
        }
      } catch (notifyError: any) {
        console.error('Failed to notify customer:', notifyError.message);
        // Don't fail the request if notification fails
      }
    }

    res.json(order);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
