// Reports Routes - API endpoints for metrics and analytics

import { Router, Request, Response } from 'express';
import * as reportsService from '../services/reportsService';

const router = Router();

/**
 * GET /api/reports/overview
 * Get overview metrics (conversations, conversions, abandonments, average ticket)
 * Query params: startDate, endDate, clientId (optional)
 */
router.get('/overview', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = clientId ? parseInt(clientId as string, 10) : undefined;

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
 * Query params: startDate, endDate, clientId (optional)
 */
router.get('/payment-methods', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = clientId ? parseInt(clientId as string, 10) : undefined;

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
 * Query params: startDate, endDate, clientId (optional)
 */
router.get('/peak-hours', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = clientId ? parseInt(clientId as string, 10) : undefined;

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
 * Query params: startDate, endDate, clientId (optional)
 */
router.get('/top-items', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = clientId ? parseInt(clientId as string, 10) : undefined;

    const topItems = await reportsService.getTopItems(start, end, client);
    res.json(topItems);
  } catch (error: any) {
    console.error('Error fetching top items:', error);
    res.status(500).json({ error: 'Failed to fetch top items' });
  }
});

/**
 * GET /api/reports/export-csv
 * Export reports data to CSV
 * Query params: startDate, endDate, clientId (optional)
 */
router.get('/export-csv', async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, clientId } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate and endDate are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    const client = clientId ? parseInt(clientId as string, 10) : undefined;

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
