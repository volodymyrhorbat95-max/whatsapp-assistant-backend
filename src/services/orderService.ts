// Order Service - Handle order creation and management
// Saves confirmed delivery and clothing orders to database

import Order from '../database/models/Order';
import { CollectedData } from '../types';

/**
 * Create a new order from collected conversation data
 * @param conversationId - ID of conversation that generated this order
 * @param clientId - ID of client (business) this order belongs to
 * @param collectedData - Data collected during conversation flow
 * @returns Created order record
 */
export const createOrder = async (
  conversationId: number,
  clientId: number,
  collectedData: CollectedData
): Promise<Order> => {
  try {
    let items = collectedData.items || [];
    let totalAmount = 0;

    // Handle delivery flow (items array)
    if (items.length > 0) {
      totalAmount = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
    }
    // Handle clothing flow (single product)
    else if (collectedData.product) {
      items = [{
        name: collectedData.product.name,
        price: collectedData.product.price,
        quantity: 1
      }];
      totalAmount = collectedData.product.price;
    }
    else {
      throw new Error('Cannot create order with no items or product');
    }

    // Determine delivery address
    // For clothing: could be address (delivery) or null (pickup)
    const deliveryAddress = collectedData.address ||
      (collectedData.deliveryType === 'pickup' ? 'Retirar na loja' : null);

    // Create order
    const order = await Order.create({
      conversationId,
      clientId,
      status: 'confirmed',
      items,
      totalAmount,
      deliveryAddress,
      paymentMethod: collectedData.paymentMethod || null
    });

    console.log('Order created successfully:', order.id);
    return order;

  } catch (error: any) {
    console.error('Error creating order:', error.message);
    throw error;
  }
};

/**
 * Get order by ID
 * @param orderId - Order ID
 * @returns Order record or null
 */
export const getOrderById = async (orderId: number): Promise<Order | null> => {
  try {
    return await Order.findByPk(orderId);
  } catch (error: any) {
    console.error('Error fetching order:', error.message);
    return null;
  }
};

/**
 * Get all orders for a conversation
 * @param conversationId - Conversation ID
 * @returns Array of orders
 */
export const getOrdersByConversation = async (conversationId: number): Promise<Order[]> => {
  try {
    return await Order.findAll({
      where: { conversationId },
      order: [['createdAt', 'DESC']]
    });
  } catch (error: any) {
    console.error('Error fetching conversation orders:', error.message);
    return [];
  }
};

/**
 * Get all orders for a client
 * @param clientId - Client ID
 * @returns Array of orders
 */
export const getOrdersByClient = async (clientId: number): Promise<Order[]> => {
  try {
    return await Order.findAll({
      where: { clientId },
      order: [['createdAt', 'DESC']]
    });
  } catch (error: any) {
    console.error('Error fetching client orders:', error.message);
    return [];
  }
};

/**
 * Update order status
 * @param orderId - Order ID
 * @param status - New status
 * @returns Updated order or null
 */
export const updateOrderStatus = async (
  orderId: number,
  status: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
): Promise<Order | null> => {
  try {
    const order = await Order.findByPk(orderId);

    if (!order) {
      console.error('Order not found:', orderId);
      return null;
    }

    order.status = status;
    await order.save();

    console.log('Order status updated:', orderId, status);
    return order;

  } catch (error: any) {
    console.error('Error updating order status:', error.message);
    return null;
  }
};
