// Message parser - Extract meaning from customer input
// All messages in Brazilian Portuguese (PT-BR)

export interface ParsedMessage {
  intent: 'greeting' | 'yes' | 'no' | 'cancel' | 'complaint' | 'item_selection' | 'address' | 'payment' | 'unknown';
  value?: string;
  confidence: number;
}

// Normalize text for comparison
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ''); // Remove punctuation
};

// Check if message contains any of the keywords
const containsAny = (text: string, keywords: string[]): boolean => {
  const normalized = normalize(text);
  return keywords.some(keyword => normalized.includes(normalize(keyword)));
};

// Parse greeting messages
export const parseGreeting = (message: string): boolean => {
  const greetings = [
    'oi', 'ola', 'bom dia', 'boa tarde', 'boa noite',
    'opa', 'e ai', 'quero pedir', 'fazer pedido',
    'quero fazer um pedido', 'gostaria de pedir'
  ];
  return containsAny(message, greetings);
};

// Parse yes/confirmation
export const parseYes = (message: string): boolean => {
  const yesWords = [
    'sim', 'yes', 'confirmar', 'confirma', 'pode', 'ok',
    'tudo bem', 'isso mesmo', 'correto', 'certo', 'claro'
  ];
  return containsAny(message, yesWords);
};

// Parse no/negation
export const parseNo = (message: string): boolean => {
  const noWords = [
    'nao', 'não', 'no', 'negativo', 'nunca', 'jamais'
  ];
  return containsAny(message, noWords);
};

// Parse complaint/problem keywords
export const parseComplaint = (message: string): boolean => {
  const complaintWords = [
    'reclamar', 'reclamacao', 'gerente', 'problema',
    'insatisfeito', 'ruim', 'errado', 'cancelar pedido',
    'nao recebi', 'atrasado'
  ];
  return containsAny(message, complaintWords);
};

// Parse exchange/return requests
export const parseExchangeReturn = (message: string): boolean => {
  const exchangeReturnWords = [
    'trocar', 'devolver', 'troca', 'devolucao', 'devolução',
    'reembolso', 'estornar', 'estorno'
  ];
  return containsAny(message, exchangeReturnWords);
};

// Parse payment method
export const parsePayment = (message: string): 'pix' | 'card' | 'cash' | null => {
  const normalized = normalize(message);

  if (containsAny(normalized, ['pix'])) {
    return 'pix';
  }
  if (containsAny(normalized, ['cartao', 'cartão', 'card', 'credito', 'debito'])) {
    return 'card';
  }
  if (containsAny(normalized, ['dinheiro', 'cash', 'especie'])) {
    return 'cash';
  }

  return null;
};

// Extract item selection from message
export const parseItemSelection = (message: string, availableItems: string[]): string[] => {
  const normalized = normalize(message);
  const selectedItems: string[] = [];

  // Check each available item
  for (const item of availableItems) {
    const normalizedItem = normalize(item);
    if (normalized.includes(normalizedItem)) {
      selectedItems.push(item);
    }
  }

  return selectedItems;
};

// Parse category selection
export const parseCategory = (message: string): string | null => {
  const normalized = normalize(message);

  const categories = [
    { names: ['hamburguer', 'hamburgueres', 'burger'], value: 'Hambúrgueres' },
    { names: ['pizza', 'pizzas'], value: 'Pizzas' },
    { names: ['bebida', 'bebidas', 'drink'], value: 'Bebidas' }
  ];

  for (const category of categories) {
    if (containsAny(normalized, category.names)) {
      return category.value;
    }
  }

  return null;
};

// General message parser
export const parseMessage = (message: string): ParsedMessage => {
  // Check for greeting
  if (parseGreeting(message)) {
    return { intent: 'greeting', confidence: 0.9 };
  }

  // Check for complaint (high priority)
  if (parseComplaint(message)) {
    return { intent: 'complaint', confidence: 0.95 };
  }

  // Check for yes
  if (parseYes(message)) {
    return { intent: 'yes', confidence: 0.85 };
  }

  // Check for no
  if (parseNo(message)) {
    return { intent: 'no', confidence: 0.85 };
  }

  // Check for payment
  const payment = parsePayment(message);
  if (payment) {
    return { intent: 'payment', value: payment, confidence: 0.9 };
  }

  // Default to unknown
  return { intent: 'unknown', value: message, confidence: 0.0 };
};
