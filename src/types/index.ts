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
  // Core messages (already existed)
  greeting?: string;
  confirmation?: string;
  farewell?: string;
  fallback?: string;
  closedMessage?: string;
  closedMessageWithHours?: string;  // "Olá! No momento estamos fechados. Nosso horário é das {open} às {close}..."

  // Transfer/Fallback messages
  transferToHuman?: string;        // "Vou te conectar com um atendente agora..."
  exchangeReturnTransfer?: string; // "Vou te conectar com um atendente para te ajudar..."
  alreadyWithAgent?: string;       // "Você já está em contato com um atendente..."
  systemError?: string;            // "Desculpe, ocorreu um erro..."

  // Audio/Error handling messages
  audioTranscriptionFailed?: string; // "Não consegui entender o áudio. Pode escrever?"
  processingError?: string;          // "Desculpe, ocorreu um erro ao processar..."

  // Order status notification messages (sent when business updates order status)
  // CRITICAL: These are sent to customers via WhatsApp - must be configurable
  statusPending?: string;          // "Seu pedido está pendente."
  statusConfirmed?: string;        // "Seu pedido foi confirmado!"
  statusPreparing?: string;        // "Seu pedido está sendo preparado! 🍳"
  statusOutForDelivery?: string;   // "Seu pedido saiu para entrega! 🚗"
  statusDelivered?: string;        // "Seu pedido foi entregue! Obrigado pela preferência! 🎉"
  statusCancelled?: string;        // "Seu pedido foi cancelado."

  // Delivery flow messages
  askGreeting?: string;            // "Olá! Para fazer um pedido, diga 'oi'..."
  chooseCategory?: string;         // "Por favor, escolha uma categoria: {categories}"
  itemAdded?: string;              // "{item} adicionado! R$ {price}..."
  noItemsYet?: string;             // "Você ainda não adicionou nenhum item..."
  askAddress?: string;             // "Ótimo! Qual o endereço para entrega?"
  itemNotFound?: string;           // "Desculpe, não encontrei esse item..."
  addressConfirmed?: string;       // "Endereço confirmado: {address}..."
  invalidAddress?: string;         // "Por favor, forneça um endereço completo..."
  paymentNotAccepted?: string;     // "Desculpe, não aceitamos {method}..."
  choosePayment?: string;          // "Por favor, escolha: {methods}"
  askConfirmation?: string;        // "Posso confirmar seu pedido?"
  orderCancelled?: string;         // "Pedido cancelado..."
  pleaseConfirm?: string;          // "Por favor, confirme: Sim ou Não?"
  orderAlreadyConfirmed?: string;  // "Seu pedido já foi confirmado!..."

  // Menu display messages (delivery)
  menuNotAvailable?: string;       // "Desculpe, o cardápio não está disponível no momento."
  menuHeader?: string;             // "📋 *Nosso Cardápio:*"
  menuFooter?: string;             // "Qual categoria você gostaria?"
  categoryNoItems?: string;        // "Desculpe, não temos itens disponíveis em {category} no momento."
  categoryItemsFooter?: string;    // "Qual você gostaria?"

  // Clothing flow messages
  askProductType?: string;         // "Olá! Que produto você está procurando?"
  askGender?: string;              // "É masculino ou feminino?"
  invalidGender?: string;          // "Não entendi. É masculino ou feminino?"
  askSize?: string;                // "Qual tamanho? (PP, P, M, G, GG, XG)"
  invalidSize?: string;            // "Não entendi o tamanho..."
  productNotAvailable?: string;    // "Desculpe, não temos esse produto disponível..."
  chooseOption?: string;           // "Qual você gostaria? (Digite o número ou nome)"
  invalidOption?: string;          // "Não entendi qual você quer..."
  askDeliveryType?: string;        // "Você quer retirar na loja ou entregar?"
  invalidDeliveryType?: string;    // "Não entendi. Você quer retirar ou entregar?"
  pickupConfirmed?: string;        // "Certo! Você vai retirar na loja..."
  reservationCancelled?: string;   // "Sem problemas. Se quiser fazer outro pedido..."
  reservationAlreadyConfirmed?: string; // "Sua reserva já foi confirmada..."

  // Clothing product display messages
  optionsHeader?: string;          // "Temos essas opções:"
  productSelected?: string;        // "Ótimo! {product} por R$ {price}."
}

// Financial health - costs for margin estimation
export interface BusinessCosts {
  fixedCosts?: number;     // Monthly fixed costs (rent, utilities, etc.)
  variableCostPercent?: number;  // Variable cost as % of revenue (ingredients, materials)
}

export interface ClientConfiguration {
  catalog?: CatalogCategory[];
  paymentMethods?: PaymentMethod[];
  operatingHours?: OperatingHours;
  messages?: CustomMessages;
  costs?: BusinessCosts;
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
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'pix' | 'card' | 'cash';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  // Clothing-specific fields (optional, only populated for clothing orders)
  size?: string;
  color?: string;
  gender?: string;
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
  order?: Order;
}

export interface OrderUpdateResponse extends Order {
  notification: {
    status: 'sent' | 'failed' | 'skipped';
    error?: string;
  };
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
