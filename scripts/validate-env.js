#!/usr/bin/env node
/**
 * Environment Variable Validation Script
 *
 * Validates that all required environment variables are set before starting the application.
 * Run this script during deployment or before starting the server to catch configuration issues early.
 *
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate-env
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Required environment variables with validation rules
const requiredEnvVars = [
  {
    name: 'NODE_ENV',
    description: 'Environment mode',
    required: true,
    allowedValues: ['development', 'production', 'test'],
    validate: (value) => ['development', 'production', 'test'].includes(value)
  },
  {
    name: 'PORT',
    description: 'Backend server port',
    required: true,
    validate: (value) => {
      const port = parseInt(value, 10);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    example: '5000'
  },
  {
    name: 'DB_HOST',
    description: 'PostgreSQL host',
    required: true,
    example: 'localhost'
  },
  {
    name: 'DB_PORT',
    description: 'PostgreSQL port',
    required: true,
    validate: (value) => {
      const port = parseInt(value, 10);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    example: '5432'
  },
  {
    name: 'DB_NAME',
    description: 'PostgreSQL database name',
    required: true,
    example: 'whatsapp_assistant'
  },
  {
    name: 'DB_USER',
    description: 'PostgreSQL user',
    required: true,
    example: 'whatsapp_user'
  },
  {
    name: 'DB_PASSWORD',
    description: 'PostgreSQL password',
    required: true,
    validate: (value) => value.length >= 8,
    errorMessage: 'Database password must be at least 8 characters'
  },
  {
    name: 'REDIS_HOST',
    description: 'Redis host',
    required: true,
    example: 'localhost'
  },
  {
    name: 'REDIS_PORT',
    description: 'Redis port',
    required: true,
    validate: (value) => {
      const port = parseInt(value, 10);
      return !isNaN(port) && port > 0 && port < 65536;
    },
    example: '6379'
  },
  {
    name: 'TWILIO_ACCOUNT_SID',
    description: 'Twilio Account SID',
    required: true,
    validate: (value) => value.startsWith('AC') && value.length === 34,
    errorMessage: 'Twilio Account SID should start with "AC" and be 34 characters long',
    example: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  },
  {
    name: 'TWILIO_AUTH_TOKEN',
    description: 'Twilio Auth Token',
    required: true,
    validate: (value) => value.length === 32,
    errorMessage: 'Twilio Auth Token should be 32 characters long'
  },
  {
    name: 'TWILIO_WHATSAPP_FROM',
    description: 'Twilio WhatsApp number',
    required: true,
    validate: (value) => value.startsWith('whatsapp:+'),
    errorMessage: 'Twilio WhatsApp number should start with "whatsapp:+"',
    example: 'whatsapp:+14155238886'
  },
  {
    name: 'OPENAI_API_KEY',
    description: 'OpenAI API key for Whisper',
    required: true,
    validate: (value) => value.startsWith('sk-') && value.length > 20,
    errorMessage: 'OpenAI API key should start with "sk-" and be at least 20 characters',
    example: 'sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
  }
];

/**
 * Main validation function
 */
function validateEnvironment() {
  console.log(`${colors.blue}${colors.bold}Environment Variable Validation${colors.reset}\n`);

  // Check if .env file exists
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log(`${colors.yellow}Warning: .env file not found at ${envPath}${colors.reset}`);
    console.log(`${colors.yellow}Checking environment variables from system...${colors.reset}\n`);
  } else {
    console.log(`${colors.green}✓ Found .env file at ${envPath}${colors.reset}\n`);
  }

  let hasErrors = false;
  let hasWarnings = false;
  const errors = [];
  const warnings = [];

  // Validate each required variable
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];

    // Check if variable is set
    if (!value || value.trim() === '') {
      if (envVar.required) {
        errors.push({
          name: envVar.name,
          message: `Missing required environment variable`,
          description: envVar.description,
          example: envVar.example
        });
        hasErrors = true;
      } else {
        warnings.push({
          name: envVar.name,
          message: `Optional environment variable not set`,
          description: envVar.description
        });
        hasWarnings = true;
      }
      continue;
    }

    // Validate value if validator function provided
    if (envVar.validate && !envVar.validate(value)) {
      errors.push({
        name: envVar.name,
        message: envVar.errorMessage || `Invalid value for ${envVar.name}`,
        description: envVar.description,
        example: envVar.example,
        currentValue: maskSensitiveValue(envVar.name, value)
      });
      hasErrors = true;
      continue;
    }

    // Variable is valid
    console.log(`${colors.green}✓ ${envVar.name}${colors.reset}: ${maskSensitiveValue(envVar.name, value)}`);
  }

  console.log(''); // Empty line

  // Display warnings
  if (hasWarnings) {
    console.log(`${colors.yellow}${colors.bold}Warnings:${colors.reset}\n`);
    for (const warning of warnings) {
      console.log(`${colors.yellow}⚠ ${warning.name}${colors.reset}`);
      console.log(`  ${warning.message}`);
      console.log(`  Description: ${warning.description}\n`);
    }
  }

  // Display errors
  if (hasErrors) {
    console.log(`${colors.red}${colors.bold}Errors:${colors.reset}\n`);
    for (const error of errors) {
      console.log(`${colors.red}✗ ${error.name}${colors.reset}`);
      console.log(`  ${error.message}`);
      console.log(`  Description: ${error.description}`);
      if (error.example) {
        console.log(`  Example: ${error.example}`);
      }
      if (error.currentValue) {
        console.log(`  Current: ${error.currentValue}`);
      }
      console.log('');
    }

    console.log(`${colors.red}${colors.bold}Validation failed. Please fix the errors above before starting the application.${colors.reset}\n`);
    process.exit(1);
  }

  // Success
  console.log(`${colors.green}${colors.bold}✓ All required environment variables are valid${colors.reset}\n`);

  // Additional recommendations for production
  if (process.env.NODE_ENV === 'production') {
    console.log(`${colors.blue}${colors.bold}Production Environment Checklist:${colors.reset}\n`);

    const productionChecks = [
      {
        condition: process.env.DB_PASSWORD && process.env.DB_PASSWORD.length >= 16,
        message: 'Database password is strong (16+ characters)',
        recommendation: 'Use a strong database password (16+ characters) for production'
      },
      {
        condition: process.env.PORT && parseInt(process.env.PORT) !== 5000,
        message: 'Using non-default port',
        recommendation: 'Consider using a non-default port for security'
      },
      {
        condition: process.env.DB_HOST && process.env.DB_HOST !== 'localhost',
        message: 'Database host is not localhost',
        recommendation: 'Ensure database host is properly configured'
      }
    ];

    for (const check of productionChecks) {
      if (check.condition) {
        console.log(`${colors.green}✓${colors.reset} ${check.message}`);
      } else {
        console.log(`${colors.yellow}⚠${colors.reset} ${check.recommendation}`);
      }
    }

    console.log('');
  }

  process.exit(0);
}

/**
 * Mask sensitive values for display
 */
function maskSensitiveValue(name, value) {
  const sensitiveKeys = ['PASSWORD', 'TOKEN', 'KEY', 'SECRET'];
  const isSensitive = sensitiveKeys.some(key => name.includes(key));

  if (isSensitive) {
    if (value.length <= 8) {
      return '********';
    }
    return value.substring(0, 4) + '****' + value.substring(value.length - 4);
  }

  return value;
}

/**
 * Load .env file if dotenv is available
 */
function loadDotenv() {
  try {
    require('dotenv').config();
  } catch (error) {
    // dotenv not installed or error loading, continue with system env vars
  }
}

// Run validation
loadDotenv();
validateEnvironment();
