import Client from '../database/models/Client';
import { ClientConfiguration, ClientSegment } from '../types';

// Create new client
export const createClient = async (
  name: string,
  segment: ClientSegment,
  whatsappNumber: string,
  configuration?: ClientConfiguration
): Promise<Client> => {
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

  client.configuration = configuration;
  await client.save();

  return client;
};
