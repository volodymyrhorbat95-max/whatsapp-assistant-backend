// Delivery Flow - Deterministic state machine for delivery orders
// All messages in Brazilian Portuguese (PT-BR)

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
const formatMenu = (config: ClientConfiguration): string => {
  if (!config.catalog || config.catalog.length === 0) {
    return 'Desculpe, o cardápio não está disponível no momento.';
  }

  let menu = '📋 *Nosso Cardápio:*\n\n';

  for (const category of config.catalog) {
    menu += `*${category.category}:*\n`;
    for (const item of category.items) {
      menu += `• ${item.name} - R$ ${item.price.toFixed(2)}\n`;
    }
    menu += '\n';
  }

  menu += 'Qual categoria você gostaria?';

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
const getItemsFromCategory = (categoryName: string, config: ClientConfiguration): string => {
  if (!config.catalog) return '';

  for (const category of config.catalog) {
    const normalizedCat = category.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedInput = categoryName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (normalizedCat.includes(normalizedInput) || normalizedInput.includes(normalizedCat)) {
      let response = `*${category.category}:*\n\n`;
      for (const item of category.items) {
        response += `• ${item.name} - R$ ${item.price.toFixed(2)}\n`;
      }
      response += '\nQual você gostaria?';
      return response;
    }
  }

  return '';
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

  // Check for complaints at any stage
  if (parser.parseComplaint(message)) {
    return {
      response: 'Vou te conectar com um atendente agora. Um momento, por favor.',
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
      response: 'Vou te conectar com um atendente para te ajudar com isso.',
      newState: 'transferred_to_human',
      collectedData,
      shouldTransfer: true,
      transferReason: 'Exchange or return request',
      shouldCreateOrder: false
    };
  }

  // Get custom messages from config or use defaults
  const greetingMessage = config.messages?.greeting || 'Olá! Bem-vindo! 😊';
  const confirmationMessage = config.messages?.confirmation || 'Pedido confirmado! 🎉';
  const farewellMessage = config.messages?.farewell || 'Em breve estará a caminho. Obrigado!';

  // State machine logic
  switch (currentState) {
    case 'greeting': {
      if (parser.parseGreeting(message)) {
        const menuText = formatMenu(config);
        return {
          response: `${greetingMessage}\n\n${menuText}`,
          newState: 'showing_menu',
          collectedData: { ...collectedData, items: [] },
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: 'Olá! Para fazer um pedido, diga "oi" ou "quero fazer um pedido".',
        newState: 'greeting',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'showing_menu': {
      // Try to parse category
      const category = parser.parseCategory(message);
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

      return {
        response: 'Por favor, escolha uma categoria: Hambúrgueres, Pizzas ou Bebidas.',
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
          response: `${item.name} adicionado! R$ ${item.price.toFixed(2)}\n\nQuer mais alguma coisa?`,
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
            response: 'Você ainda não adicionou nenhum item. Qual você gostaria?',
            newState: 'collecting_items',
            collectedData,
            shouldTransfer: false,
            shouldCreateOrder: false
          };
        }

        return {
          response: 'Ótimo! Qual o endereço para entrega?',
          newState: 'asking_address',
          collectedData,
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: 'Desculpe, não encontrei esse item no cardápio. Pode tentar novamente?',
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
          response: `Endereço confirmado: ${message}\n\nForma de pagamento: Pix, Cartão ou Dinheiro?`,
          newState: 'asking_payment',
          collectedData: updatedData,
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: 'Por favor, forneça um endereço completo com número.',
        newState: 'asking_address',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'asking_payment': {
      const payment = parser.parsePayment(message);

      if (payment) {
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
        summary += 'Posso confirmar seu pedido?';

        return {
          response: summary,
          newState: 'confirming_order',
          collectedData: updatedData,
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: 'Por favor, escolha: Pix, Cartão ou Dinheiro.',
        newState: 'asking_payment',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'confirming_order': {
      if (parser.parseYes(message)) {
        return {
          response: `${confirmationMessage}\n\n${farewellMessage}`,
          newState: 'order_confirmed',
          collectedData,
          shouldTransfer: false,
          shouldCreateOrder: true
        };
      }

      if (parser.parseNo(message)) {
        return {
          response: 'Pedido cancelado. Se quiser fazer um novo pedido, é só me chamar!',
          newState: 'greeting',
          collectedData: {},
          shouldTransfer: false,
          shouldCreateOrder: false
        };
      }

      return {
        response: 'Por favor, confirme: Sim ou Não?',
        newState: 'confirming_order',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'order_confirmed': {
      return {
        response: 'Seu pedido já foi confirmado! Se precisar de algo mais, é só chamar.',
        newState: 'order_confirmed',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    case 'transferred_to_human': {
      return {
        response: 'Você já está em contato com um atendente. Aguarde um momento.',
        newState: 'transferred_to_human',
        collectedData,
        shouldTransfer: false,
        shouldCreateOrder: false
      };
    }

    default: {
      return {
        response: 'Desculpe, ocorreu um erro. Vou te conectar com um atendente.',
        newState: 'transferred_to_human',
        collectedData,
        shouldTransfer: true,
        transferReason: 'Unknown state error',
        shouldCreateOrder: false
      };
    }
  }
};
