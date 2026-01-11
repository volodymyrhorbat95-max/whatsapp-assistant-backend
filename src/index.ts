import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import sequelize from './database/models';
import routes from './routes';
import { initializeMessageQueue } from './jobs/messageQueue';
import { globalLimiter } from './middleware/rateLimiter';

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet()); // Adds security headers

// CORS middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '1mb' })); // Max 1MB JSON payload
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Max 1MB URL-encoded

// Rate limiting middleware (applied to all /api routes)
app.use('/api', globalLimiter);

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', async (req, res) => {
  const health: any = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'unknown',
    version: '1.0.0',
    services: {
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

    health.services.database = {
      status: 'connected',
      details: {
        clientCount: parseInt(clientCount, 10),
        dialect: sequelize.getDialect()
      }
    };
  } catch (error: any) {
    health.services.database = {
      status: 'disconnected',
      details: {
        error: error.message
      }
    };
    health.status = 'degraded';
    isHealthy = false;
  }

  // Check Redis status (if not explicitly disabled)
  const REDIS_DISABLED = process.env.DISABLE_REDIS === 'true';
  if (REDIS_DISABLED) {
    health.services.redis = {
      status: 'disabled',
      details: {
        reason: 'Redis disabled via DISABLE_REDIS environment variable'
      }
    };
  } else {
    try {
      const { messageQueue } = require('./jobs/messageQueue');
      if (messageQueue) {
        // Try to ping Redis through the queue
        const waitingCount = await messageQueue.getWaitingCount();
        const activeCount = await messageQueue.getActiveCount();
        const failedCount = await messageQueue.getFailedCount();

        health.services.redis = {
          status: 'connected',
          details: {
            queue: {
              waiting: waitingCount,
              active: activeCount,
              failed: failedCount
            }
          }
        };
      } else {
        health.services.redis = {
          status: 'unavailable',
          details: {
            error: 'Message queue not initialized'
          }
        };
        health.status = 'degraded';
        isHealthy = false;
      }
    } catch (error: any) {
      health.services.redis = {
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

// Port from .env - NEVER hardcoded
const PORT = process.env.PORT || 3000;

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Initialize message queue (now async with fail-fast)
    await initializeMessageQueue();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
