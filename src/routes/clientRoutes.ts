// Client Routes - API endpoints for client management and configuration

import { Router, Request, Response } from 'express';
import * as clientService from '../services/clientService';
import { ClientConfiguration } from '../types';

const router = Router();

/**
 * GET /api/clients/:id
 * Fetch single client with full configuration
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = parseInt(req.params.id, 10);

    if (isNaN(clientId)) {
      res.status(400).json({ error: 'Invalid client ID' });
      return;
    }

    const client = await clientService.getClientById(clientId);

    if (!client) {
      res.status(404).json({ error: 'Client not found' });
      return;
    }

    res.json(client);
  } catch (error: any) {
    console.error('Error fetching client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/clients/:id
 * Update client configuration
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const clientId = parseInt(req.params.id, 10);

    if (isNaN(clientId)) {
      res.status(400).json({ error: 'Invalid client ID' });
      return;
    }

    const { configuration } = req.body;

    if (!configuration) {
      res.status(400).json({ error: 'Configuration is required' });
      return;
    }

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
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/clients
 * Get all clients
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await clientService.getAllClients();
    res.json(clients);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/clients
 * Create new client
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, segment, whatsappNumber, configuration } = req.body;

    if (!name || !segment || !whatsappNumber) {
      res.status(400).json({ error: 'Name, segment, and whatsappNumber are required' });
      return;
    }

    if (segment !== 'delivery' && segment !== 'clothing') {
      res.status(400).json({ error: 'Segment must be delivery or clothing' });
      return;
    }

    const newClient = await clientService.createClient(
      name,
      segment,
      whatsappNumber,
      configuration
    );

    res.status(201).json(newClient);
  } catch (error: any) {
    console.error('Error creating client:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
