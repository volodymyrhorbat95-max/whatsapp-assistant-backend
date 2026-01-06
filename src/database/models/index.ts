import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// All config from .env - NEVER hardcoded
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  logging: false
});

export default sequelize;
