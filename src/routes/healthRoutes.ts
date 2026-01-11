// Health Check Routes
// Provides endpoints for monitoring system health

import { Router, Request, Response } from 'express';
import sequelize from '../database/models';

const router = Router();

/**
 * GET /api/health - Comprehensive health check
 * Returns health status of all system components
 */
router.get('/', async (req: Request, res: Response) => {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    checks: {
      database: { status: 'unknown', details: null },
      redis: { status: 'unknown', details: null }
    }
  };

  let isHealthy = true;

  // Check database connection
  try {
    await sequelize.authenticate();
    const result: any = await sequelize.query('SELECT COUNT(*) as count FROM clients');
    const clientCount = result[0][0]?.count || 0;

    health.checks.database = {
      status: 'ok',
      details: {
        clientCount: parseInt(clientCount, 10),
        dialect: sequelize.getDialect()
      }
    };
  } catch (error: any) {
    health.checks.database = {
      status: 'error',
      details: {
        error: error.message
      }
    };
    health.status = 'degraded';
    isHealthy = false;
  }

  // Check Redis status (if not disabled)
  const REDIS_DISABLED = process.env.DISABLE_REDIS === 'true';
  if (REDIS_DISABLED) {
    health.checks.redis = {
      status: 'disabled',
      details: {
        reason: 'Redis disabled via DISABLE_REDIS environment variable'
      }
    };
  } else {
    try {
      const { messageQueue } = require('../jobs/messageQueue');
      if (messageQueue) {
        const waitingCount = await messageQueue.getWaitingCount();
        const activeCount = await messageQueue.getActiveCount();
        const failedCount = await messageQueue.getFailedCount();

        health.checks.redis = {
          status: 'ok',
          details: {
            queue: {
              waiting: waitingCount,
              active: activeCount,
              failed: failedCount
            }
          }
        };
      } else {
        health.checks.redis = {
          status: 'unavailable',
          details: {
            error: 'Message queue not initialized'
          }
        };
        health.status = 'degraded';
        isHealthy = false;
      }
    } catch (error: any) {
      health.checks.redis = {
        status: 'error',
        details: {
          error: error.message
        }
      };
      health.status = 'degraded';
      isHealthy = false;
    }
  }

  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).json(health);
});

/**
 * GET /api/health/live - Liveness probe
 * Simple check that process is running
 * Used by container orchestrators (Kubernetes, Docker)
 */
router.get('/live', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/health/ready - Readiness probe
 * Checks if system can handle requests
 * Used by load balancers
 */
router.get('/ready', async (req: Request, res: Response) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'not ready',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
