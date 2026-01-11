import Client from '../database/models/Client';
import { ClientConfiguration, ClientSegment } from '../types';

// Create new client
export const createClient = async (
  name: string,
  segment: ClientSegment,
  whatsappNumber: string,
  configuration?: ClientConfiguration
): Promise<Client> => {
  // Validate WhatsApp number format
  if (!whatsappNumber.startsWith('+')) {
    throw new Error('WhatsApp number must start with +');
  }

  const digitsOnly = whatsappNumber.replace(/\D/g, '');
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    throw new Error('WhatsApp number must have between 10-15 digits');
  }

  // Brazilian format validation
  const brazilianPattern = /^\+55\d{10,11}$/;
  if (!brazilianPattern.test(whatsappNumber)) {
    throw new Error('WhatsApp number must be in Brazilian format: +55 + DDD + Number');
  }

  const client = await Client.create({
    name,
    segment,
    whatsappNumber,
    status: 'active',
    configuration: configuration || {}
  });

  return client;
};

// Find client by WhatsApp number
export const findClientByWhatsAppNumber = async (whatsappNumber: string): Promise<Client | null> => {
  // Remove whatsapp: prefix if present
  const cleanNumber = whatsappNumber.replace('whatsapp:', '');

  const client = await Client.findOne({
    where: {
      whatsappNumber: cleanNumber,
      status: 'active'
    }
  });

  return client;
};

// Get all clients
export const getAllClients = async (): Promise<Client[]> => {
  const clients = await Client.findAll({
    order: [['name', 'ASC']]
  });

  return clients;
};

// Get client by ID
export const getClientById = async (id: number): Promise<Client | null> => {
  const client = await Client.findByPk(id);
  return client;
};

// Update client configuration
export const updateClientConfiguration = async (
  id: number,
  configuration: ClientConfiguration
): Promise<Client | null> => {
  const client = await Client.findByPk(id);

  if (!client) {
    return null;
  }

  // Validate catalog if present
  if (configuration.catalog && Array.isArray(configuration.catalog)) {
    for (const category of configuration.catalog) {
      if (!category.category || typeof category.category !== 'string') {
        throw new Error('Category name is required and must be a string');
      }

      if (!Array.isArray(category.items)) {
        throw new Error('Category items must be an array');
      }

      for (const item of category.items) {
        if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
          throw new Error('Item name is required');
        }

        if (typeof item.price !== 'number' || isNaN(item.price)) {
          throw new Error(`Invalid price for item "${item.name}"`);
        }

        if (item.price < 0) {
          throw new Error(`Price cannot be negative for item "${item.name}"`);
        }
      }
    }
  }

  client.configuration = configuration;
  await client.save();

  return client;
};
