// Order Service - Handle order creation and management
// Saves confirmed delivery and clothing orders to database

import Order from '../database/models/Order';
import { CollectedData, OrderStatus } from '../types';

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
        quantity: 1,
        // Include clothing-specific fields for analytics
        size: collectedData.product.size,
        color: collectedData.product.color,
        gender: collectedData.product.gender
      }];
      totalAmount = collectedData.product.price;
    }
    else {
      throw new Error('Cannot create order with no items or product');
    }

    // CRITICAL VALIDATION: Validate all items before creating order
    for (const item of items) {
      // Validate item name
      if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
        throw new Error('Item name cannot be empty');
      }

      // Validate item price
      if (typeof item.price !== 'number' || isNaN(item.price)) {
        throw new Error(`Invalid price for item "${item.name}"`);
      }
      if (item.price < 0) {
        throw new Error(`Price cannot be negative for item "${item.name}"`);
      }

      // Validate item quantity
      if (typeof item.quantity !== 'number' || isNaN(item.quantity)) {
        throw new Error(`Invalid quantity for item "${item.name}"`);
      }
      if (item.quantity <= 0) {
        throw new Error(`Quantity must be greater than zero for item "${item.name}"`);
      }
      if (!Number.isInteger(item.quantity)) {
        throw new Error(`Quantity must be a whole number for item "${item.name}"`);
      }
    }

    // Validate total amount
    if (totalAmount <= 0) {
      throw new Error('Total amount must be greater than zero');
    }

    // Determine delivery address
    // For clothing: could be address (delivery) or null (pickup)
    const deliveryAddress = collectedData.address ||
      (collectedData.deliveryType === 'pickup' ? 'Retirar na loja' : null);

    // Create order
    // Order starts as 'pending' per requirements (Line 81): "The order was just created but not yet confirmed by the customer"
    // Business owner must confirm in dashboard to change to 'confirmed'
    const order = await Order.create({
      conversationId,
      clientId,
      status: 'pending',
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
 * Bug #7 Fix: Use centralized OrderStatus type
 */
export const updateOrderStatus = async (
  orderId: number,
  status: OrderStatus
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
