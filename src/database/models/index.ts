import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// All config from .env - NEVER hardcoded
// Connection pool configured for 24/7 operation stability
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: false,
  // Connection pool configuration for stability
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '20'),     // Maximum connections in pool
    min: parseInt(process.env.DB_POOL_MIN || '5'),      // Minimum connections to maintain
    acquire: 30000,                                      // Max time (ms) to wait for connection
    idle: 10000                                          // Max time (ms) connection can be idle before release
  },
  // Retry strategy for connection failures
  retry: {
    max: 3,                                              // Maximum retry attempts
    backoffBase: 1000,                                   // Initial backoff delay (ms)
    backoffExponent: 1.5                                 // Exponential backoff multiplier
  }
});

export default sequelize;
