// Client Routes - API endpoints for client management and configuration

import { Router, Request, Response } from 'express';
import * as clientService from '../services/clientService';
import { ClientConfiguration } from '../types';
import { requireAuth } from '../middleware/auth';
import { createClientLimiter } from '../middleware/rateLimiter';
import { validateId, validateRequiredFields, validateClientSegment, validateClientConfiguration } from '../middleware/validators';

const router = Router();

/**
 * GET /api/clients/:id
 * Fetch single client with full configuration
 */
router.get('/:id', requireAuth, validateId('id'), async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const client = await clientService.getClientById(clientId);

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json(client);
  } catch (error: any) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * PUT /api/clients/:id
 * Update client configuration
 */
router.put('/:id', requireAuth, validateId('id'), validateClientConfiguration, async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = parseInt(req.params.id, 10);
    const { configuration } = req.body;
    const updatedClient = await clientService.updateClientConfiguration(
      clientId,
      configuration as ClientConfiguration
    );

    if (!updatedClient) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json(updatedClient);
  } catch (error: any) {
    console.error('Error updating client configuration:', error);

    // Handle validation errors from service layer
    if (error.message.includes('Category') ||
        error.message.includes('Item') ||
        error.message.includes('price') ||
        error.message.includes('required')) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }

    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * GET /api/clients
 * Get all clients
 */
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await clientService.getAllClients();
    res.json(clients);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

/**
 * POST /api/clients
 * Create new client
 */
router.post('/', requireAuth, createClientLimiter, validateRequiredFields(['name', 'segment', 'whatsappNumber']), validateClientSegment, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, segment, whatsappNumber, configuration } = req.body;
    const newClient = await clientService.createClient(
      name,
      segment,
      whatsappNumber,
      configuration
    );

    res.status(201).json(newClient);
  } catch (error: any) {
    console.error('Error creating client:', error);

    // Handle Sequelize unique constraint violation (duplicate WhatsApp number)
    if (error.name === 'SequelizeUniqueConstraintError') {
      res.status(400).json({
        error: 'Duplicate WhatsApp number',
        message: 'Este número de WhatsApp já está cadastrado para outro cliente'
      });
      return;
    }

    // Handle validation errors from service layer
    if (error.message.includes('Business name') ||
        error.message.includes('WhatsApp number')) {
      res.status(400).json({ error: 'Validation error', message: error.message });
      return;
    }

    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

export default router;
