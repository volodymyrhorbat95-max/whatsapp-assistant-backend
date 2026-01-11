// Reports Routes - API endpoints for metrics and analytics

import { Router, Request, Response } from 'express';
import * as reportsService from '../services/reportsService';
import { requireAuth } from '../middleware/auth';
import { reportsLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply rate limiting to all report routes (expensive queries)
router.use(reportsLimiter);

/**
 * GET /api/reports/overview
 * Get overview metrics (conversations, conversions, abandonments, average ticket)
 * CRITICAL: Query params: startDate, endDate, clientId (REQUIRED for data isolation)
 */
router.get('/overview', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    // CRITICAL: clientId is REQUIRED for multi-client data isolation
    if (!startDate || !endDate || !clientId) {
      res.status(400).json({ error: 'startDate, endDate, and clientId are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = parseInt(clientId as string, 10);

    // Validate dates are valid
    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format' });
      return;
    }

    if (isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid endDate format' });
      return;
    }

    if (end < start) {
      res.status(400).json({ error: 'endDate must be after or equal to startDate' });
      return;
    }

    // Validate clientId
    if (isNaN(client)) {
      res.status(400).json({ error: 'Invalid clientId format' });
      return;
    }

    const metrics = await reportsService.getOverviewMetrics(start, end, client);
    res.json(metrics);
  } catch (error: any) {
    console.error('Error fetching overview metrics:', error);
    res.status(500).json({ error: 'Failed to fetch overview metrics' });
  }
});

/**
 * GET /api/reports/payment-methods
 * Get payment methods breakdown
 * CRITICAL: Query params: startDate, endDate, clientId (REQUIRED for data isolation)
 */
router.get('/payment-methods', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    // CRITICAL: clientId is REQUIRED for multi-client data isolation
    if (!startDate || !endDate || !clientId) {
      res.status(400).json({ error: 'startDate, endDate, and clientId are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = parseInt(clientId as string, 10);

    // Validate dates
    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format' });
      return;
    }

    if (isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid endDate format' });
      return;
    }

    if (end < start) {
      res.status(400).json({ error: 'endDate must be after or equal to startDate' });
      return;
    }

    // Validate clientId
    if (isNaN(client)) {
      res.status(400).json({ error: 'Invalid clientId format' });
      return;
    }

    const breakdown = await reportsService.getPaymentMethodsBreakdown(start, end, client);
    res.json(breakdown);
  } catch (error: any) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

/**
 * GET /api/reports/peak-hours
 * Get peak hours (when most conversations start)
 * CRITICAL: Query params: startDate, endDate, clientId (REQUIRED for data isolation)
 */
router.get('/peak-hours', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    // CRITICAL: clientId is REQUIRED for multi-client data isolation
    if (!startDate || !endDate || !clientId) {
      res.status(400).json({ error: 'startDate, endDate, and clientId are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = parseInt(clientId as string, 10);

    // Validate dates
    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format' });
      return;
    }

    if (isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid endDate format' });
      return;
    }

    if (end < start) {
      res.status(400).json({ error: 'endDate must be after or equal to startDate' });
      return;
    }

    // Validate clientId
    if (isNaN(client)) {
      res.status(400).json({ error: 'Invalid clientId format' });
      return;
    }

    const peakHours = await reportsService.getPeakHours(start, end, client);
    res.json(peakHours);
  } catch (error: any) {
    console.error('Error fetching peak hours:', error);
    res.status(500).json({ error: 'Failed to fetch peak hours' });
  }
});

/**
 * GET /api/reports/top-items
 * Get most requested items/products
 * CRITICAL: Query params: startDate, endDate, clientId (REQUIRED for data isolation)
 */
router.get('/top-items', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    // CRITICAL: clientId is REQUIRED for multi-client data isolation
    if (!startDate || !endDate || !clientId) {
      res.status(400).json({ error: 'startDate, endDate, and clientId are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = parseInt(clientId as string, 10);

    // Validate dates
    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format' });
      return;
    }

    if (isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid endDate format' });
      return;
    }

    if (end < start) {
      res.status(400).json({ error: 'endDate must be after or equal to startDate' });
      return;
    }

    // Validate clientId
    if (isNaN(client)) {
      res.status(400).json({ error: 'Invalid clientId format' });
      return;
    }

    const topItems = await reportsService.getTopItems(start, end, client);
    res.json(topItems);
  } catch (error: any) {
    console.error('Error fetching top items:', error);
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
});

/**
 * GET /api/reports/financial-health
 * Get financial health metrics (margin estimation)
 * Query params: startDate, endDate, clientId (REQUIRED)
 */
router.get('/financial-health', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    if (!startDate || !endDate || !clientId) {
      res.status(400).json({ error: 'startDate, endDate, and clientId are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = parseInt(clientId as string, 10);

    // Validate dates
    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format' });
      return;
    }

    if (isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid endDate format' });
      return;
    }

    if (end < start) {
      res.status(400).json({ error: 'endDate must be after or equal to startDate' });
      return;
    }

    if (isNaN(client)) {
      res.status(400).json({ error: 'Invalid clientId' });
      return;
    }

    const financialHealth = await reportsService.getFinancialHealth(start, end, client);

    if (!financialHealth) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json(financialHealth);
  } catch (error: any) {
    console.error('Error fetching financial health:', error);
    res.status(500).json({ error: 'Failed to fetch financial health' });
  }
});

/**
 * GET /api/reports/export-csv
 * Export reports data to CSV
 * CRITICAL: Query params: startDate, endDate, clientId (REQUIRED for data isolation)
 */
router.get('/export-csv', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    // CRITICAL: clientId is REQUIRED for multi-client data isolation
    if (!startDate || !endDate || !clientId) {
      res.status(400).json({ error: 'startDate, endDate, and clientId are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = parseInt(clientId as string, 10);

    // Validate dates
    if (isNaN(start.getTime())) {
      res.status(400).json({ error: 'Invalid startDate format' });
      return;
    }

    if (isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid endDate format' });
      return;
    }

    if (end < start) {
      res.status(400).json({ error: 'endDate must be after or equal to startDate' });
      return;
    }

    // Validate clientId
    if (isNaN(client)) {
      res.status(400).json({ error: 'Invalid clientId format' });
      return;
    }

    const csv = await reportsService.exportToCSV(start, end, client);

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=relatorio.csv');
    res.send(csv);
  } catch (error: any) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default router;
