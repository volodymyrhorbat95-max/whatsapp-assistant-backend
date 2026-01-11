// Clothing Store Flow - Deterministic state machine for product reservations
// All messages in Brazilian Portuguese (PT-BR)

import * as parser from './messageParser';
import * as validators from './validators';
import { CollectedData, ClientConfiguration, CatalogCategory, CatalogItem } from '../types';

export type ClothingState =
  | 'greeting'
  | 'asking_gender'              // Ask if men's or women's
  | 'asking_size'                // Ask what size
  | 'showing_options'            // Display matching products
  | 'asking_delivery_type'       // Pickup or delivery
  | 'asking_address'             // If delivery
  | 'asking_payment'
  | 'confirming_reservation'
  | 'reservation_confirmed'
  | 'transferred_to_human';

export interface FlowResponse {
  response: string;
  newState: ClothingState;
  collectedData: CollectedData;
  shouldTransfer: boolean;
  transferReason?: string;
  shouldCreateReservation: boolean;
}

export const processClothingFlow = (
  currentState: ClothingState | null,
  message: string,
  collectedData: CollectedData,
  config: ClientConfiguration
): FlowResponse => {
  const state = currentState || 'greeting';

  // Get custom messages from config or use defaults
  const greetingMessage = config.messages?.greeting || 'Olá! Bem-vindo!';
  const confirmationMessage = config.messages?.confirmation || 'Reserva confirmada!';
  const farewellMessage = config.messages?.farewell || 'Vamos preparar seu pedido. Em breve entraremos em contato. Obrigado! 🎉';

  // Complaint detection at any stage
  if (parser.parseComplaint(message)) {
    return {
      response: 'Vou te conectar com um atendente agora.',
      newState: 'transferred_to_human',
      collectedData,
      shouldTransfer: true,
      transferReason: 'Customer complaint detected',
      shouldCreateReservation: false
    };
  }

  // Exchange/return request at any stage
  if (parser.parseExchangeReturn(message)) {
    return {
      response: 'Vou te conectar com um atendente para te ajudar com isso.',
      newState: 'transferred_to_human',
      collectedData,
      shouldTransfer: true,
      transferReason: 'Exchange or return request',
      shouldCreateReservation: false
    };
  }

  switch (state) {
    case 'greeting': {
      // Step 1: Customer asks about a product ("Do you have a black t-shirt?")
      const normalized = message.toLowerCase().trim();

      // Extract product type from message
      const productType = extractProductType(normalized);
      const color = extractColor(normalized);

      if (productType) {
        // Store product type and color if mentioned
        const updatedData: CollectedData = {
          ...collectedData,
          product: {
            name: '',
            size: '',
            color: color || collectedData.product?.color || '',
            price: 0,
            type: productType,
            gender: collectedData.product?.gender
          }
        };

        // Step 2: Bot asks: Men's or Women's?
        return {
          response: 'É masculino ou feminino?',
          newState: 'asking_gender',
          collectedData: updatedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      // Couldn't understand product
      return {
        response: 'Olá! Que produto você está procurando? (Ex: camiseta, calça, vestido)',
        newState: 'greeting',
        collectedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'asking_gender': {
      const normalized = message.toLowerCase().trim();
      let gender: string | undefined;

      if (normalized.includes('masculin') || normalized.includes('homem')) {
        gender = 'masculino';
      } else if (normalized.includes('feminin') || normalized.includes('mulher')) {
        gender = 'feminino';
      }

      if (!gender) {
        return {
          response: 'Não entendi. É masculino ou feminino?',
          newState: 'asking_gender',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      const updatedData = {
        ...collectedData,
        product: {
          ...collectedData.product!,
          gender
        }
      };

      // Step 2 continued: What size?
      return {
        response: 'Qual tamanho? (PP, P, M, G, GG, XG)',
        newState: 'asking_size',
        collectedData: updatedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'asking_size': {
      const normalized = message.toLowerCase().trim();
      const sizeMatch = normalized.match(/\b(pp|p|m|g|gg|xg)\b/);

      if (!sizeMatch) {
        return {
          response: 'Não entendi o tamanho. Pode escolher: PP, P, M, G, GG ou XG?',
          newState: 'asking_size',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      const size = sizeMatch[1].toUpperCase();
      const updatedData = {
        ...collectedData,
        product: {
          ...collectedData.product!,
          size
        }
      };

      // Step 3: Bot shows available options with prices
      const options = findMatchingProducts(
        config.catalog || [],
        updatedData.product!
      );

      if (options.length === 0) {
        return {
          response: 'Desculpe, não temos esse produto disponível no momento. Quer procurar outro?',
          newState: 'greeting',
          collectedData: {},
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      let responseText = 'Temos essas opções:\n\n';
      options.forEach((opt, idx) => {
        let itemDesc = `${idx + 1}. ${opt.name}`;
        if (opt.color) itemDesc += ` - ${opt.color}`;
        if (opt.size) itemDesc += ` (${opt.size})`;
        itemDesc += ` - R$ ${opt.price.toFixed(2)}`;
        responseText += itemDesc + '\n';
      });
      responseText += '\nQual você gostaria? (Digite o número ou nome)';

      return {
        response: responseText,
        newState: 'showing_options',
        collectedData: { ...updatedData, availableOptions: options },
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'showing_options': {
      // Step 4: Customer picks one
      const options = (collectedData.availableOptions || []) as CatalogItem[];

      const numberMatch = message.match(/\b(\d+)\b/);
      let selectedProduct: CatalogItem | null = null;

      if (numberMatch) {
        const index = parseInt(numberMatch[1], 10) - 1;
        if (index >= 0 && index < options.length) {
          selectedProduct = options[index];
        }
      }

      // Try to match by name
      if (!selectedProduct) {
        const normalized = message.toLowerCase().trim();
        for (const opt of options) {
          if (normalized.includes(opt.name.toLowerCase())) {
            selectedProduct = opt;
            break;
          }
        }
      }

      if (!selectedProduct) {
        return {
          response: 'Não entendi qual você quer. Pode escolher pelo número ou nome?',
          newState: 'showing_options',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      const updatedData = {
        ...collectedData,
        product: {
          name: selectedProduct.name,
          size: selectedProduct.size || collectedData.product?.size || '',
          color: selectedProduct.color || collectedData.product?.color || '',
          price: selectedProduct.price,
          gender: selectedProduct.gender || collectedData.product?.gender
        }
      };

      // Step 5: Bot asks: Pickup at store or delivery?
      return {
        response: `Ótimo! ${selectedProduct.name} por R$ ${selectedProduct.price.toFixed(2)}.\n\nVocê quer retirar na loja ou entregar no seu endereço?`,
        newState: 'asking_delivery_type',
        collectedData: updatedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'asking_delivery_type': {
      const normalized = message.toLowerCase().trim();

      if (normalized.includes('entregar') || normalized.includes('entrega')) {
        // Step 6: If delivery → Bot asks for address
        return {
          response: 'Qual o endereço para entrega?',
          newState: 'asking_address',
          collectedData: { ...collectedData, deliveryType: 'delivery' },
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      if (normalized.includes('retirar') || normalized.includes('buscar') || normalized.includes('loja')) {
        // Skip address, go to payment
        return {
          response: 'Certo! Você vai retirar na loja.\n\nForma de pagamento: Pix, Cartão ou Dinheiro?',
          newState: 'asking_payment',
          collectedData: { ...collectedData, deliveryType: 'pickup' },
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      return {
        response: 'Não entendi. Você quer retirar na loja ou entregar no seu endereço?',
        newState: 'asking_delivery_type',
        collectedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'asking_address': {
      if (!validators.validateAddress(message)) {
        return {
          response: 'O endereço parece incompleto. Pode me dar o endereço completo com número?',
          newState: 'asking_address',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      // Step 7: Bot asks for payment method
      return {
        response: `Endereço confirmado: ${message}\n\nForma de pagamento: Pix, Cartão ou Dinheiro?`,
        newState: 'asking_payment',
        collectedData: { ...collectedData, address: message },
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'asking_payment': {
      const paymentMethod = parser.parsePayment(message);

      if (!paymentMethod) {
        return {
          response: 'Não entendi. Forma de pagamento: Pix, Cartão ou Dinheiro?',
          newState: 'asking_payment',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      const product = collectedData.product!;
      const deliveryType = collectedData.deliveryType || 'pickup';
      const address = collectedData.address || '';

      // Step 8: Bot summarizes everything and asks "Can I reserve and confirm?"
      let summaryText = '📋 Resumo da Reserva:\n\n';
      summaryText += `🛍️ Produto: ${product.name}\n`;
      if (product.size) summaryText += `📏 Tamanho: ${product.size}\n`;
      if (product.color) summaryText += `🎨 Cor: ${product.color}\n`;
      summaryText += `💰 Valor: R$ ${product.price.toFixed(2)}\n\n`;

      if (deliveryType === 'delivery') {
        summaryText += `📦 Entrega: ${address}\n`;
      } else {
        summaryText += `📦 Retirar na loja\n`;
      }

      summaryText += `💳 Pagamento: ${paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}\n\n`;
      summaryText += 'Posso reservar e confirmar?';

      return {
        response: summaryText,
        newState: 'confirming_reservation',
        collectedData: { ...collectedData, paymentMethod },
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'confirming_reservation': {
      // Step 9: Customer says yes → Reservation is recorded
      if (parser.parseYes(message)) {
        return {
          response: `${confirmationMessage} ${farewellMessage}`,
          newState: 'reservation_confirmed',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: true
        };
      }

      if (parser.parseNo(message)) {
        return {
          response: 'Sem problemas. Se quiser fazer outro pedido, é só chamar!',
          newState: 'greeting',
          collectedData: {},
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      return {
        response: 'Não entendi. Posso confirmar a reserva? (Sim ou Não)',
        newState: 'confirming_reservation',
        collectedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'reservation_confirmed': {
      // Step 10: Bot updates when ready and when shipped/delivered
      // (This is handled by orderService.updateOrderStatus)
      return {
        response: 'Sua reserva já foi confirmada. Se precisar de algo mais, é só chamar!',
        newState: 'reservation_confirmed',
        collectedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'transferred_to_human': {
      return {
        response: 'Você já está sendo atendido por um humano. Aguarde um momento.',
        newState: 'transferred_to_human',
        collectedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    default: {
      return {
        response: 'Desculpe, algo deu errado. Vou te conectar com um atendente.',
        newState: 'transferred_to_human',
        collectedData,
        shouldTransfer: true,
        transferReason: 'Unexpected state',
        shouldCreateReservation: false
      };
    }
  }
};

// Helper: Extract product type from message
function extractProductType(message: string): string | undefined {
  const products = ['camiseta', 'camisa', 'calca', 'calça', 'shorts', 'vestido', 'saia', 'jaqueta', 'casaco', 'blusa'];
  for (const product of products) {
    if (message.includes(product)) {
      return product;
    }
  }
  return undefined;
}

// Helper: Extract color from message
function extractColor(message: string): string | undefined {
  const colors = ['preta', 'pret', 'branca', 'branc', 'azul', 'vermelha', 'vermelho', 'amarela', 'amarelo', 'verde', 'rosa', 'cinza'];
  for (const color of colors) {
    if (message.includes(color)) {
      return color;
    }
  }
  return undefined;
}

// Helper: Find matching products in catalog
function findMatchingProducts(
  catalog: CatalogCategory[],
  searchCriteria: {
    type?: string;
    gender?: string;
    size?: string;
    color?: string;
  }
): CatalogItem[] {
  const results: CatalogItem[] = [];

  for (const category of catalog) {
    for (const item of category.items) {
      const itemNameLower = item.name.toLowerCase();
      const searchType = (searchCriteria.type || '').toLowerCase();

      // Match by product type
      if (searchType && (itemNameLower.includes(searchType) || searchType.includes(itemNameLower))) {
        // Match by gender if specified
        if (searchCriteria.gender && item.gender) {
          if (item.gender !== searchCriteria.gender) {
            continue;
          }
        }

        // Match by size if specified
        if (searchCriteria.size && item.size) {
          if (item.size !== searchCriteria.size) {
            continue;
          }
        }

        // Match by color if specified
        if (searchCriteria.color && item.color) {
          const itemColor = item.color.toLowerCase();
          const searchColor = searchCriteria.color.toLowerCase();
          if (!itemColor.includes(searchColor) && !searchColor.includes(itemColor)) {
            continue;
          }
        }

        results.push(item);
      }
    }
  }

  return results;
}
