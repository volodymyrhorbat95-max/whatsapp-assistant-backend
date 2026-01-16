// Input Validation Middleware
// Validates common input patterns to prevent errors and attacks

import { Request, Response, NextFunction } from 'express';
import { OrderStatus } from '../types';

/**
 * Validate that route parameter is a valid integer ID
 * Use before any route that has /:id parameter
 */
export const validateId = (paramName: string = 'id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = parseInt(req.params[paramName], 10);

    if (isNaN(id) || id < 1) {
      res.status(400).json({
        error: 'Invalid ID',
        message: `${paramName} must be a positive integer`
      });
      return;
    }

    next();
  };
};

/**
 * Validate date range parameters (startDate and endDate)
 * Ensures:
 * - Both dates are present
 * - Format is YYYY-MM-DD
 * - Dates are valid
 * - startDate is before endDate
 * - Range is not too large (max 1 year)
 */
export const validateDateRange = (req: Request, res: Response, next: NextFunction): void => {
  const { startDate, endDate } = req.query;

  // Check presence
  if (!startDate || !endDate) {
    res.status(400).json({
      error: 'Missing required parameters',
      message: 'startDate and endDate are required'
    });
    return;
  }

  // Validate format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(startDate as string) || !dateRegex.test(endDate as string)) {
    res.status(400).json({
      error: 'Invalid date format',
      message: 'Dates must be in YYYY-MM-DD format'
    });
    return;
  }

  // Parse dates
  const start = new Date(startDate as string);
  const end = new Date(endDate as string);

  // Check if valid dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    res.status(400).json({
      error: 'Invalid date values',
      message: 'Please provide valid dates'
    });
    return;
  }

  // Check range order
  if (start > end) {
    res.status(400).json({
      error: 'Invalid date range',
      message: 'startDate must be before or equal to endDate'
    });
    return;
  }

  // Check maximum range (365 days)
  const maxDays = 365;
  const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (daysDiff > maxDays) {
    res.status(400).json({
      error: 'Date range too large',
      message: `Maximum date range is ${maxDays} days`
    });
    return;
  }

  next();
};

/**
 * Validate order status parameter
 * Ensures status is one of the allowed values
 * Bug #7 Fix: Use centralized OrderStatus type
 */
export const validateOrderStatus = (req: Request, res: Response, next: NextFunction): void => {
  const { status } = req.body;

  // Use centralized type - single source of truth
  const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  if (!status) {
    res.status(400).json({
      error: 'Missing required parameter',
      message: 'status is required'
    });
    return;
  }

  if (!validStatuses.includes(status as OrderStatus)) {
    res.status(400).json({
      error: 'Invalid status',
      message: `Status must be one of: ${validStatuses.join(', ')}`
    });
    return;
  }

  next();
};

/**
 * Validate client segment parameter
 * Ensures segment is 'delivery' or 'clothing'
 */
export const validateClientSegment = (req: Request, res: Response, next: NextFunction): void => {
  const { segment } = req.body;

  const validSegments = ['delivery', 'clothing'];

  if (!segment) {
    res.status(400).json({
      error: 'Missing required parameter',
      message: 'segment is required'
    });
    return;
  }

  if (!validSegments.includes(segment)) {
    res.status(400).json({
      error: 'Invalid segment',
      message: `Segment must be one of: ${validSegments.join(', ')}`
    });
    return;
  }

  next();
};

/**
 * Validate required fields in request body
 * Usage: validateRequiredFields(['name', 'email', 'phone'])
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields = fields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      res.status(400).json({
        error: 'Missing required fields',
        message: `Required fields: ${missingFields.join(', ')}`
      });
      return;
    }

    next();
  };
};

/**
 * Validate ClientConfiguration structure
 * Ensures configuration object has valid structure if fields are present
 */
export const validateClientConfiguration = (req: Request, res: Response, next: NextFunction): void => {
  const { configuration } = req.body;

  if (!configuration) {
    res.status(400).json({
      error: 'Missing required parameter',
      message: 'configuration is required'
    });
    return;
  }

  if (typeof configuration !== 'object' || Array.isArray(configuration)) {
    res.status(400).json({
      error: 'Invalid configuration',
      message: 'configuration must be an object'
    });
    return;
  }

  // Validate catalog structure if present
  if (configuration.catalog !== undefined) {
    if (!Array.isArray(configuration.catalog)) {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'configuration.catalog must be an array'
      });
      return;
    }

    for (let i = 0; i < configuration.catalog.length; i++) {
      const category = configuration.catalog[i];

      if (typeof category !== 'object' || !category.category || !Array.isArray(category.items)) {
        res.status(400).json({
          error: 'Invalid configuration',
          message: `catalog[${i}] must have 'category' (string) and 'items' (array)`
        });
        return;
      }

      // Validate category name is not empty (trim whitespace)
      if (typeof category.category !== 'string' || category.category.trim().length === 0) {
        res.status(400).json({
          error: 'Invalid configuration',
          message: `O nome da categoria ${i + 1} não pode estar vazio`
        });
        return;
      }

      for (let j = 0; j < category.items.length; j++) {
        const item = category.items[j];

        if (typeof item !== 'object' || typeof item.name !== 'string' || typeof item.price !== 'number') {
          res.status(400).json({
            error: 'Invalid configuration',
            message: `catalog[${i}].items[${j}] must have 'name' (string) and 'price' (number)`
          });
          return;
        }

        // Validate item name is not empty (trim whitespace)
        if (item.name.trim().length === 0) {
          res.status(400).json({
            error: 'Invalid configuration',
            message: `O nome do item na categoria "${category.category}" não pode estar vazio`
          });
          return;
        }

        if (item.price < 0) {
          res.status(400).json({
            error: 'Invalid configuration',
            message: `catalog[${i}].items[${j}].price must be non-negative`
          });
          return;
        }
      }
    }
  }

  // Validate paymentMethods if present
  if (configuration.paymentMethods !== undefined) {
    if (!Array.isArray(configuration.paymentMethods)) {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'configuration.paymentMethods must be an array'
      });
      return;
    }

    const validPaymentMethods = ['pix', 'card', 'cash'];
    for (const method of configuration.paymentMethods) {
      if (!validPaymentMethods.includes(method)) {
        res.status(400).json({
          error: 'Invalid configuration',
          message: `paymentMethods must contain only: ${validPaymentMethods.join(', ')}`
        });
        return;
      }
    }
  }

  // Validate operatingHours if present
  if (configuration.operatingHours !== undefined) {
    if (typeof configuration.operatingHours !== 'object' || Array.isArray(configuration.operatingHours)) {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'configuration.operatingHours must be an object'
      });
      return;
    }

    for (const day in configuration.operatingHours) {
      const hours = configuration.operatingHours[day];
      if (typeof hours !== 'object' || typeof hours.open !== 'string' || typeof hours.close !== 'string') {
        res.status(400).json({
          error: 'Invalid configuration',
          message: `operatingHours.${day} must have 'open' and 'close' as strings`
        });
        return;
      }
    }
  }

  // Validate messages if present
  if (configuration.messages !== undefined) {
    if (typeof configuration.messages !== 'object' || Array.isArray(configuration.messages)) {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'configuration.messages must be an object'
      });
      return;
    }

    // All valid message keys from CustomMessages interface
    // CRITICAL: Must include ALL configurable messages for Predictable, Deterministic Responses requirement
    const validMessageKeys = [
      // Core messages
      'greeting', 'confirmation', 'farewell', 'fallback', 'closedMessage', 'closedMessageWithHours',
      // Transfer/Fallback messages
      'transferToHuman', 'exchangeReturnTransfer', 'alreadyWithAgent', 'systemError',
      // Audio/Error handling messages
      'audioTranscriptionFailed', 'processingError',
      // Order status notification messages (sent when business updates order status)
      'statusPending', 'statusConfirmed', 'statusPreparing', 'statusOutForDelivery', 'statusDelivered', 'statusCancelled',
      // Delivery flow messages
      'askGreeting', 'chooseCategory', 'itemAdded', 'noItemsYet', 'askAddress', 'itemNotFound',
      'addressConfirmed', 'invalidAddress', 'paymentNotAccepted', 'choosePayment', 'askConfirmation',
      'orderCancelled', 'pleaseConfirm', 'orderAlreadyConfirmed',
      // Menu display messages (delivery)
      'menuNotAvailable', 'menuHeader', 'menuFooter', 'categoryNoItems', 'categoryItemsFooter',
      // Clothing flow messages
      'askProductType', 'askGender', 'invalidGender', 'askSize', 'invalidSize', 'productNotAvailable',
      'chooseOption', 'invalidOption', 'askDeliveryType', 'invalidDeliveryType', 'pickupConfirmed',
      'reservationCancelled', 'reservationAlreadyConfirmed',
      // Clothing product display messages
      'optionsHeader', 'productSelected',
      // Order summary labels (delivery)
      'orderSummaryHeader', 'orderSummaryItems', 'orderSummaryTotal', 'orderSummaryAddress', 'orderSummaryPayment',
      // Reservation summary labels (clothing)
      'reservationSummaryHeader', 'reservationSummaryProduct', 'reservationSummarySize', 'reservationSummaryColor',
      'reservationSummaryPrice', 'reservationSummaryDelivery', 'reservationSummaryPickup'
    ];
    for (const key in configuration.messages) {
      if (!validMessageKeys.includes(key)) {
        res.status(400).json({
          error: 'Invalid configuration',
          message: `messages.${key} is not a valid message key`
        });
        return;
      }

      if (typeof configuration.messages[key] !== 'string') {
        res.status(400).json({
          error: 'Invalid configuration',
          message: `messages.${key} must be a string`
        });
        return;
      }
    }
  }

  // Validate costs if present
  if (configuration.costs !== undefined) {
    if (typeof configuration.costs !== 'object' || Array.isArray(configuration.costs)) {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'configuration.costs must be an object'
      });
      return;
    }

    if (configuration.costs.fixedCosts !== undefined && typeof configuration.costs.fixedCosts !== 'number') {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'costs.fixedCosts must be a number'
      });
      return;
    }

    if (configuration.costs.variableCostPercent !== undefined && typeof configuration.costs.variableCostPercent !== 'number') {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'costs.variableCostPercent must be a number'
      });
      return;
    }

    if (configuration.costs.fixedCosts !== undefined && configuration.costs.fixedCosts < 0) {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'costs.fixedCosts must be non-negative'
      });
      return;
    }

    if (configuration.costs.variableCostPercent !== undefined && (configuration.costs.variableCostPercent < 0 || configuration.costs.variableCostPercent > 100)) {
      res.status(400).json({
        error: 'Invalid configuration',
        message: 'costs.variableCostPercent must be between 0 and 100'
      });
      return;
    }
  }

  next();
};
