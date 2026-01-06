// ===========================================
// SHARED TYPES - Must match database schema
// Copy these EXACTLY to frontend/src/types/index.ts
// ===========================================

// Client (business) types
export type ClientSegment = 'delivery' | 'clothing';
export type ClientStatus = 'active' | 'inactive';

export interface CatalogItem {
  name: string;
  price: number;
  size?: string;
  color?: string;
  gender?: string;
}

export interface CatalogCategory {
  category: string;
  items: CatalogItem[];
}

export interface OperatingHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

export interface CustomMessages {
  greeting?: string;
  confirmation?: string;
  farewell?: string;
  fallback?: string;
}

export interface ClientConfiguration {
  catalog?: CatalogCategory[];
  paymentMethods?: PaymentMethod[];
  operatingHours?: OperatingHours;
  messages?: CustomMessages;
}

export interface Client {
  id: number;
  name: string;
  segment: ClientSegment;
  whatsappNumber: string;
  status: ClientStatus;
  configuration: ClientConfiguration;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation types
export type ConversationStatus = 'ongoing' | 'completed' | 'abandoned' | 'transferred';
export type FlowType = 'delivery' | 'clothing';

export interface CollectedData {
  // Delivery fields
  items?: OrderItem[];
  address?: string;
  paymentMethod?: PaymentMethod;

  // Clothing fields
  product?: {
    name: string;
    size: string;
    color: string;
    price: number;
    type?: string;
    gender?: string;
  };
  deliveryType?: 'pickup' | 'delivery';
  availableOptions?: Array<{ name: string; price: number }>;

  [key: string]: any;
}

export interface Conversation {
  id: number;
  clientId: number;
  customerPhone: string;
  status: ConversationStatus;
  transferReason: string | null;
  currentState: string | null;
  collectedData: CollectedData | null;
  flowType: FlowType | null;
  startedAt: Date;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message types
export type MessageDirection = 'incoming' | 'outgoing';
export type MessageType = 'text' | 'audio';

export interface Message {
  id: number;
  conversationId: number;
  direction: MessageDirection;
  content: string;
  messageType: MessageType;
  createdAt: Date;
}

// Order types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'card' | 'cash';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  conversationId: number;
  clientId: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number | null;
  deliveryAddress: string | null;
  paymentMethod: PaymentMethod | null;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  client?: Client;
}

export interface ConversationListItem {
  id: number;
  clientId: number;
  customerPhone: string;
  status: ConversationStatus;
  startedAt: Date;
  lastMessageAt: Date;
  client?: {
    id: number;
    name: string;
    segment: ClientSegment;
  };
}

// API Request types
export interface CreateMessageRequest {
  conversationId: number;
  direction: MessageDirection;
  content: string;
  messageType?: MessageType;
}

export interface TwilioWebhookRequest {
  From: string;
  To: string;
  Body: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
}
