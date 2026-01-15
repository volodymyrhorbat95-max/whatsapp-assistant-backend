// Delivery Flow - Deterministic state machine for delivery orders
// All messages in Brazilian Portuguese (PT-BR)
// CRITICAL: All bot responses must come from configuration (Predictable, Deterministic Responses requirement)

import { ClientConfiguration, CollectedData, OrderItem } from '../types';
import * as parser from './messageParser';
import * as validators from './validators';

export type DeliveryState =
  | 'greeting'
  | 'showing_menu'
  | 'collecting_items'
  | 'asking_address'
  | 'asking_payment'
  | 'confirming_order'
  | 'order_confirmed'
  | 'transferred_to_human';

export interface FlowResponse {
  response: string;
  newState: DeliveryState;
  collectedData: CollectedData;
  shouldTransfer: boolean;
  transferReason?: string;
  shouldCreateOrder: boolean;
}

// Format menu for display
// CRITICAL: All text must come from configuration (Predictable, Deterministic Responses requirement)
const formatMenu = (config: ClientConfiguration): string => {
  // Get configurable messages with defaults
  const menuNotAvailable = config.messages?.menuNotAvailable || 'Desculpe, o cardápio não está disponível no momento.';
  const menuHeader = config.messages?.menuHeader || '📋 *Nosso Cardápio:*';
  const menuFooter = config.messages?.menuFooter || 'Qual categoria você gostaria?';

  if (!config.catalog || config.catalog.length === 0) {
    return menuNotAvailable;
  }

  // Filter out categories with no items
  const categoriesWithItems = config.catalog.filter(cat => cat.items && cat.items.length > 0);

  if (categoriesWithItems.length === 0) {
    return menuNotAvailable;
  }

  let menu = `${menuHeader}\n\n`;

  for (const category of categoriesWithItems) {
    menu += `*${category.category}:*\n`;
    for (const item of category.items) {
      menu += `• ${item.name} - R$ ${item.price.toFixed(2)}\n`;
    }
    menu += '\n';
  }

  menu += menuFooter;

  return menu;
};

// Find item in catalog
const findItemInCatalog = (itemName: string, config: ClientConfiguration): OrderItem | null => {
  if (!config.catalog) return null;

  for (const category of config.catalog) {
    for (const item of category.items) {
      const normalizedItem = item.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const normalizedInput = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

      if (normalizedItem.includes(normalizedInput) || normalizedInput.includes(normalizedItem)) {
        return {
          name: item.name,
          price: item.price,
          quantity: 1
        };
      }
    }
  }

  return null;
};

// Get items from category
// CRITICAL: All text must come from configuration (Predictable, Deterministic Responses requirement)
const getItemsFromCategory = (categoryName: string, config: ClientConfiguration): string => {
  if (!config.catalog) return '';

  // Get configurable messages with defaults
  const categoryNoItemsTemplate = config.messages?.categoryNoItems || 'Desculpe, não temos itens disponíveis em {category} no momento.';
  const categoryItemsFooter = config.messages?.categoryItemsFooter || 'Qual você gostaria?';

  for (const category of config.catalog) {
    const normalizedCat = category.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedInput = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (normalizedCat.includes(normalizedInput) || normalizedInput.includes(normalizedCat)) {
      // Handle empty category (no items)
      if (!category.items || category.items.length === 0) {
        return categoryNoItemsTemplate.replace('{category}', category.category);
      }

      let response = `*${category.category}:*\n\n`;
      for (const item of category.items) {
        response += `• ${item.name} - R$ ${item.price.toFixed(2)}\n`;
      }
      response += '\n' + categoryItemsFooter;
      return response;
    }
  }

  return '';
};

// Helper: Replace placeholders in message templates
const formatMessage = (template: string, values: { [key: string]: string }): string => {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
};

// Process message based on current state
export const processDeliveryFlow = (
  currentState: DeliveryState | null,
  message: string,
  collectedData: CollectedData,
  config: ClientConfiguration
): FlowResponse => {
  // Start with greeting if no state
  if (!currentState) {
    currentState = 'greeting';
  }

  // Get ALL messages from config with defaults
  // CRITICAL: Every response MUST be configurable (Predictable, Deterministic Responses requirement)
  const msg = {
    // Core messages
    greeting: config.messages?.greeting || 'Olá! Bem-vindo! 😊',
    confirmation: config.messages?.confirmation || 'Pedido confirmado! 🎉',
    farewell: config.messages?.farewell || 'Em breve estará a caminho. Obrigado!',

    // Transfer messages
    transferToHuman: config.messages?.transferToHuman || 'Vou te conectar com um atendente agora. Um momento, por favor.',
    exchangeReturnTransfer: config.messages?.exchangeReturnTransfer || 'Vou te conectar com um atendente para te ajudar com isso.',
    alreadyWithAgent: config.messages?.alreadyWithAgent || 'Você já está em contato com um atendente. Aguarde um momento.',
    systemError: config.messages?.systemError || 'Desculpe, ocorreu um erro. Vou te conectar com um atendente.',

    // Flow messages
    askGreeting: config.messages?.askGreeting || 'Olá! Para fazer um pedido, diga "oi" ou "quero fazer um pedido".',
    chooseCategory: config.messages?.chooseCategory || 'Por favor, escolha uma categoria: {categories}.',
    itemAdded: config.messages?.itemAdded || '{item} adicionado! R$ {price}\n\nQuer mais alguma coisa?',
    noItemsYet: config.messages?.noItemsYet || 'Você ainda não adicionou nenhum item. Qual você gostaria?',
    askAddress: config.messages?.askAddress || 'Ótimo! Qual o endereço para entrega?',
    itemNotFound: config.messages?.itemNotFound || 'Desculpe, não encontrei esse item no cardápio. Pode tentar novamente?',
    addressConfirmed: config.messages?.addressConfirmed || 'Endereço confirmado: {address}\n\nForma de pagamento: Pix, Cartão ou Dinheiro?',
    invalidAddress: config.messages?.invalidAddress || 'Por favor, forneça um endereço completo com número.',
    paymentNotAccepted: config.messages?.paymentNotAccepted || 'Desculpe, não aceitamos {method}. Aceitamos: {accepted}.',
    choosePayment: config.messages?.choosePayment || 'Por favor, escolha: {methods}.',
    askConfirmation: config.messages?.askConfirmation || 'Posso confirmar seu pedido?',
    orderCancelled: config.messages?.orderCancelled || 'Pedido cancelado. Se quiser fazer um novo pedido, é só me chamar!',
    pleaseConfirm: config.messages?.pleaseConfirm || 'Por favor, confirme: Sim ou Não?',
    orderAlreadyConfirmed: config.messages?.orderAlreadyConfirmed || 'Seu pedido já foi confirmado! Se precisar de algo mais, é só chamar.'
  };

  // Check for complaints at any stage
  if (parser.parseComplaint(message)) {
    return {
      response: msg.transferToHuman,
      newState: 'transferred_to_human',
      collectedData,
      shouldTransfer: true,
      transferReason: 'Customer complaint detected',
      shouldCreateOrder: false
    };
  }

  // Check for exchange/return requests at any stage
  if (parser.parseExchangeReturn(message)) {
    return {
      response: msg.exchangeReturnTransfer,
      newState: 'transferred_to_human',
      collectedData,
      shouldTransfer: true,
      transferReason: 'Exchange or return request',
      shouldCreateOrder: false
    };
  }

  // State machine logic
  switch (currentState) {
    case 'greeting': {
      if (parser.parseGreeting(message)) {
        const menuText = formatMenu(config);
        return {
          response: `${msg.greeting}\n\n${menuText}`,
          newState: 'showing_menu',
          collectedData: { ...collectedData, items: [] },
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: msg.askGreeting,
        newState: 'greeting',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'showing_menu': {
      // Try to parse category (pass config for dynamic matching)
      const category = parser.parseCategory(message, config);
      if (category) {
        const itemsText = getItemsFromCategory(category, config);
        if (itemsText) {
          return {
            response: itemsText,
            newState: 'collecting_items',
            collectedData,
            shouldTransfer: false,
            shouldCreateOrder: false
          };
        }
      }

      // Build dynamic category list from config
      const categoryList = config.catalog && config.catalog.length > 0
        ? config.catalog.map(c => c.category).join(', ')
        : 'Hambúrgueres, Pizzas ou Bebidas';

      return {
        response: formatMessage(msg.chooseCategory, { categories: categoryList }),
        newState: 'showing_menu',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'collecting_items': {
      const item = findItemInCatalog(message, config);

      if (item) {
        const items = collectedData.items || [];
        items.push(item);

        const updatedData = { ...collectedData, items };

        return {
          response: formatMessage(msg.itemAdded, {
            item: item.name,
            price: item.price.toFixed(2)
          }),
          newState: 'collecting_items',
          collectedData: updatedData,
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      // Check if customer says no (done ordering)
      if (parser.parseNo(message)) {
        if (!collectedData.items || collectedData.items.length === 0) {
          return {
            response: msg.noItemsYet,
            newState: 'collecting_items',
            collectedData,
            shouldTransfer: false,
            shouldCreateOrder: false
          };
        }

        return {
          response: msg.askAddress,
          newState: 'asking_address',
          collectedData,
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: msg.itemNotFound,
        newState: 'collecting_items',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'asking_address': {
      if (validators.validateAddress(message)) {
        const updatedData = { ...collectedData, address: message };

        return {
          response: formatMessage(msg.addressConfirmed, { address: message }),
          newState: 'asking_payment',
          collectedData: updatedData,
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: msg.invalidAddress,
        newState: 'asking_address',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'asking_payment': {
      const payment = parser.parsePayment(message);

      if (payment) {
        // Validate payment method is accepted by this client
        const acceptedMethods = config.paymentMethods || ['pix', 'card', 'cash'];

        if (!acceptedMethods.includes(payment)) {
          const methodNames: { [key: string]: string } = {
            pix: 'Pix',
            card: 'Cartão',
            cash: 'Dinheiro'
          };
          const acceptedNames = acceptedMethods.map(m => methodNames[m]).join(', ');

          return {
            response: formatMessage(msg.paymentNotAccepted, {
              method: methodNames[payment],
              accepted: acceptedNames
            }),
            newState: 'asking_payment',
            collectedData,
            shouldTransfer: false,
            shouldCreateOrder: false
          };
        }

        const updatedData = { ...collectedData, paymentMethod: payment };

        // Generate order summary
        const items = updatedData.items || [];
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let summary = '*📝 Resumo do Pedido:*\n\n';
        summary += '*Itens:*\n';
        for (const item of items) {
          summary += `• ${item.name} - R$ ${item.price.toFixed(2)}\n`;
        }
        summary += `\n*Total:* R$ ${total.toFixed(2)}\n`;
        summary += `*Endereço:* ${updatedData.address}\n`;
        summary += `*Pagamento:* ${payment === 'pix' ? 'Pix' : payment === 'card' ? 'Cartão' : 'Dinheiro'}\n\n`;
        summary += msg.askConfirmation;

        return {
          response: summary,
          newState: 'confirming_order',
          collectedData: updatedData,
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      // Generate dynamic payment options message based on accepted methods
      const acceptedMethods = config.paymentMethods || ['pix', 'card', 'cash'];
      const methodNames: { [key: string]: string } = {
        pix: 'Pix',
        card: 'Cartão',
        cash: 'Dinheiro'
      };
      const acceptedNames = acceptedMethods.map(m => methodNames[m]).join(', ');

      return {
        response: formatMessage(msg.choosePayment, { methods: acceptedNames }),
        newState: 'asking_payment',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'confirming_order': {
      if (parser.parseYes(message)) {
        return {
          response: `${msg.confirmation}\n\n${msg.farewell}`,
          newState: 'order_confirmed',
          collectedData,
          shouldTransfer: false,
          shouldCreateOrder: true
        };
      }

      if (parser.parseNo(message)) {
        return {
          response: msg.orderCancelled,
          newState: 'greeting',
          collectedData: {},
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: msg.pleaseConfirm,
        newState: 'confirming_order',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'order_confirmed': {
      return {
        response: msg.orderAlreadyConfirmed,
        newState: 'order_confirmed',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'transferred_to_human': {
      return {
        response: msg.alreadyWithAgent,
        newState: 'transferred_to_human',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    default: {
      return {
        response: msg.systemError,
        newState: 'transferred_to_human',
        collectedData,
        shouldTransfer: true,
        transferReason: 'Unknown state error',
        shouldCreateOrder: false
      };
    }
  }
};
