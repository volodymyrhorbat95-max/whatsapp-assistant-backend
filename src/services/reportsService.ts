// Reports Service - Generate metrics and analytics
// All metrics filtered by date range and client

import { Op } from 'sequelize';
import Conversation from '../database/models/Conversation';
import Order from '../database/models/Order';
import Message from '../database/models/Message';
import Client from '../database/models/Client';
import { BusinessCosts } from '../types';

export interface OverviewMetrics {
  conversationsStarted: number;
  conversions: number;
  abandonments: number;
  averageTicket: number;
}

export interface FinancialHealth {
  totalRevenue: number;
  fixedCosts: number;
  variableCosts: number;
  estimatedProfit: number;
  profitMargin: number;
  orderCount: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
}

export interface PeakHour {
  hour: number;
  count: number;
}

export interface TopItem {
  name: string;
  count: number;
}

/**
 * Get overview metrics for a date range
 * CRITICAL: clientId is REQUIRED for multi-client data isolation
 */
export const getOverviewMetrics = async (
  startDate: Date,
  endDate: Date,
  clientId: number
): Promise<OverviewMetrics> => {
  // CRITICAL: ALWAYS filter by clientId for data isolation
  const whereClause: any = {
    clientId,
    startedAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  // Conversations started
  const conversationsStarted = await Conversation.count({
    where: whereClause
  });

  // Conversions (completed conversations with orders)
  const conversions = await Conversation.count({
    where: {
      ...whereClause,
      status: 'completed'
    }
  });

  // Abandonments (ongoing conversations that stopped)
  const abandonments = await Conversation.count({
    where: {
      ...whereClause,
      status: 'abandoned'
    }
  });

  // Average ticket value
  // CRITICAL: ALWAYS filter by clientId for data isolation
  const orderWhereClause: any = {
    clientId,
    createdAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  const orders = await Order.findAll({
    where: orderWhereClause,
    attributes: ['totalAmount']
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;

  return {
    conversationsStarted,
    conversions,
    abandonments,
    averageTicket: Math.round(averageTicket * 100) / 100 // Round to 2 decimals
  };
};

/**
 * Get payment methods breakdown
 * CRITICAL: clientId is REQUIRED for multi-client data isolation
 * Returns ALL payment methods (pix, card, cash) even if count is 0 for proper chart display
 */
export const getPaymentMethodsBreakdown = async (
  startDate: Date,
  endDate: Date,
  clientId: number
): Promise<PaymentMethodBreakdown[]> => {
  // CRITICAL: ALWAYS filter by clientId for data isolation
  const whereClause: any = {
    clientId,
    createdAt: {
      [Op.between]: [startDate, endDate]
    },
    paymentMethod: {
      [Op.ne]: null
    }
  };

  const orders = await Order.findAll({
    where: whereClause,
    attributes: ['paymentMethod']
  });

  // Initialize all payment methods with 0 count
  // This ensures all methods appear in the chart even with no orders
  const allMethods = ['pix', 'card', 'cash'];
  const counts: { [key: string]: number } = {};
  allMethods.forEach(method => {
    counts[method] = 0;
  });

  // Count orders by payment method
  orders.forEach(order => {
    const method = order.paymentMethod || 'unknown';
    if (counts[method] !== undefined) {
      counts[method]++;
    } else {
      // Handle unexpected payment methods gracefully
      counts[method] = 1;
    }
  });

  // Convert to array in consistent order
  return allMethods.map(method => ({
    method,
    count: counts[method]
  }));
};

/**
 * Get peak hours (when most conversations start)
 * CRITICAL: clientId is REQUIRED for multi-client data isolation
 * Returns ALL 24 hours (0-23) sorted in order for proper chart display
 */
export const getPeakHours = async (
  startDate: Date,
  endDate: Date,
  clientId: number
): Promise<PeakHour[]> => {
  // CRITICAL: ALWAYS filter by clientId for data isolation
  const whereClause: any = {
    clientId,
    startedAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  const conversations = await Conversation.findAll({
    where: whereClause,
    attributes: ['startedAt']
  });

  // Initialize array with all 24 hours (0-23) with count 0
  // Using array ensures correct order (Object.entries doesn't guarantee order for numeric keys)
  const peakHours: PeakHour[] = [];
  for (let i = 0; i < 24; i++) {
    peakHours.push({ hour: i, count: 0 });
  }

  // Count conversations by hour
  conversations.forEach(conv => {
    const hour = new Date(conv.startedAt).getHours();
    if (hour >= 0 && hour < 24) {
      peakHours[hour].count++;
    }
  });

  return peakHours;
};

/**
 * Get top requested items/products
 * CRITICAL: clientId is REQUIRED for multi-client data isolation
 */
export const getTopItems = async (
  startDate: Date,
  endDate: Date,
  clientId: number
): Promise<TopItem[]> => {
  // CRITICAL: ALWAYS filter by clientId for data isolation
  const whereClause: any = {
    clientId,
    createdAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  const orders = await Order.findAll({
    where: whereClause,
    attributes: ['items']
  });

  // Count items
  const itemCounts: { [name: string]: number } = {};

  orders.forEach(order => {
    const items = order.items || [];
    items.forEach((item: any) => {
      const name = item.name;
      itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
    });
  });

  // Convert to array and sort by count descending
  const topItems = Object.entries(itemCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10

  return topItems;
};

/**
 * Export reports data to CSV format
 * CRITICAL: clientId is REQUIRED for multi-client data isolation
 */
export const exportToCSV = async (
  startDate: Date,
  endDate: Date,
  clientId: number
): Promise<string> => {
  // All called functions now require clientId - data isolation enforced
  const overview = await getOverviewMetrics(startDate, endDate, clientId);
  const paymentMethods = await getPaymentMethodsBreakdown(startDate, endDate, clientId);
  const topItems = await getTopItems(startDate, endDate, clientId);

  let csv = 'Relatório de Conversas\n\n';
  csv += 'Período:,' + startDate.toLocaleDateString('pt-BR') + ' a ' + endDate.toLocaleDateString('pt-BR') + '\n\n';

  // Overview section
  csv += 'Resumo Geral\n';
  csv += 'Métrica,Valor\n';
  csv += `Conversas Iniciadas,${overview.conversationsStarted}\n`;
  csv += `Conversões,${overview.conversions}\n`;
  csv += `Abandonos,${overview.abandonments}\n`;
  csv += `Ticket Médio,R$ ${overview.averageTicket.toFixed(2)}\n`;
  csv += '\n';

  // Payment methods section
  csv += 'Métodos de Pagamento\n';
  csv += 'Método,Quantidade\n';
  paymentMethods.forEach(pm => {
    csv += `"${pm.method}",${pm.count}\n`;
  });
  csv += '\n';

  // Top items section
  csv += 'Itens Mais Pedidos\n';
  csv += 'Item,Quantidade\n';
  topItems.forEach(item => {
    csv += `"${item.name}",${item.count}\n`;
  });

  return csv;
};

/**
 * Get financial health metrics (margin estimation)
 * Uses client's registered costs to estimate profit margin
 */
export const getFinancialHealth = async (
  startDate: Date,
  endDate: Date,
  clientId: number
): Promise<FinancialHealth | null> => {
  // Get client's cost configuration
  const client = await Client.findByPk(clientId);
  if (!client) {
    return null;
  }

  const config = client.configuration as { costs?: BusinessCosts } | null;
  const costs = config?.costs || {};
  const fixedCosts = costs.fixedCosts || 0;
  const variableCostPercent = costs.variableCostPercent || 0;

  // Get orders in date range
  const orders = await Order.findAll({
    where: {
      clientId,
      createdAt: {
        [Op.between]: [startDate, endDate]
      }
    },
    attributes: ['totalAmount']
  });

  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0);
  const orderCount = orders.length;

  // Calculate costs
  const variableCosts = totalRevenue * (variableCostPercent / 100);

  // Calculate profit
  const estimatedProfit = totalRevenue - fixedCosts - variableCosts;
  const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    fixedCosts: Math.round(fixedCosts * 100) / 100,
    variableCosts: Math.round(variableCosts * 100) / 100,
    estimatedProfit: Math.round(estimatedProfit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100,
    orderCount
  };
};
