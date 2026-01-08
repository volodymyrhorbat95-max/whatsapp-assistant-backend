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
 */
export const getOverviewMetrics = async (
  startDate: Date,
  endDate: Date,
  clientId?: number
): Promise<OverviewMetrics> => {
  const whereClause: any = {
    startedAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (clientId) {
    whereClause.clientId = clientId;
  }

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
  const orderWhereClause: any = {
    createdAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (clientId) {
    orderWhereClause.clientId = clientId;
  }

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
 */
export const getPaymentMethodsBreakdown = async (
  startDate: Date,
  endDate: Date,
  clientId?: number
): Promise<PaymentMethodBreakdown[]> => {
  const whereClause: any = {
    createdAt: {
      [Op.between]: [startDate, endDate]
    },
    paymentMethod: {
      [Op.ne]: null
    }
  };

  if (clientId) {
    whereClause.clientId = clientId;
  }

  const orders = await Order.findAll({
    where: whereClause,
    attributes: ['paymentMethod']
  });

  // Count by payment method
  const counts: { [key: string]: number } = {};
  orders.forEach(order => {
    const method = order.paymentMethod || 'unknown';
    counts[method] = (counts[method] || 0) + 1;
  });

  // Convert to array
  return Object.entries(counts).map(([method, count]) => ({
    method,
    count
  }));
};

/**
 * Get peak hours (when most conversations start)
 */
export const getPeakHours = async (
  startDate: Date,
  endDate: Date,
  clientId?: number
): Promise<PeakHour[]> => {
  const whereClause: any = {
    startedAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (clientId) {
    whereClause.clientId = clientId;
  }

  const conversations = await Conversation.findAll({
    where: whereClause,
    attributes: ['startedAt']
  });

  // Count by hour (0-23)
  const hourCounts: { [hour: number]: number } = {};
  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }

  conversations.forEach(conv => {
    const hour = new Date(conv.startedAt).getHours();
    hourCounts[hour]++;
  });

  // Convert to array
  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour, 10),
    count
  }));
};

/**
 * Get top requested items/products
 */
export const getTopItems = async (
  startDate: Date,
  endDate: Date,
  clientId?: number
): Promise<TopItem[]> => {
  const whereClause: any = {
    createdAt: {
      [Op.between]: [startDate, endDate]
    }
  };

  if (clientId) {
    whereClause.clientId = clientId;
  }

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
 */
export const exportToCSV = async (
  startDate: Date,
  endDate: Date,
  clientId?: number
): Promise<string> => {
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
    csv += `${pm.method},${pm.count}\n`;
  });
  csv += '\n';

  // Top items section
  csv += 'Itens Mais Pedidos\n';
  csv += 'Item,Quantidade\n';
  topItems.forEach(item => {
    csv += `${item.name},${item.count}\n`;
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
