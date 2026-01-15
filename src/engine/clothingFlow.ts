// Clothing Store Flow - Deterministic state machine for product reservations
// All messages in Brazilian Portuguese (PT-BR)
// CRITICAL: All bot responses must come from configuration (Predictable, Deterministic Responses requirement)

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

// Helper: Replace placeholders in message templates
const formatMessage = (template: string, values: { [key: string]: string }): string => {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
};

export const processClothingFlow = (
  currentState: ClothingState | null,
  message: string,
  collectedData: CollectedData,
  config: ClientConfiguration
): FlowResponse => {
  const state = currentState || 'greeting';

  // Get ALL messages from config with defaults
  // CRITICAL: Every response MUST be configurable (Predictable, Deterministic Responses requirement)
  const msg = {
    // Core messages
    greeting: config.messages?.greeting || 'Olá! Bem-vindo!',
    confirmation: config.messages?.confirmation || 'Reserva confirmada!',
    farewell: config.messages?.farewell || 'Vamos preparar seu pedido. Em breve entraremos em contato. Obrigado! 🎉',

    // Transfer messages
    transferToHuman: config.messages?.transferToHuman || 'Vou te conectar com um atendente agora.',
    exchangeReturnTransfer: config.messages?.exchangeReturnTransfer || 'Vou te conectar com um atendente para te ajudar com isso.',
    alreadyWithAgent: config.messages?.alreadyWithAgent || 'Você já está sendo atendido por um humano. Aguarde um momento.',
    systemError: config.messages?.systemError || 'Desculpe, algo deu errado. Vou te conectar com um atendente.',

    // Clothing flow specific messages
    askProductType: config.messages?.askProductType || 'Olá! Que produto você está procurando? (Ex: camiseta, calça, vestido)',
    askGender: config.messages?.askGender || 'É masculino ou feminino?',
    invalidGender: config.messages?.invalidGender || 'Não entendi. É masculino ou feminino?',
    askSize: config.messages?.askSize || 'Qual tamanho? (PP, P, M, G, GG, XG ou número)',
    invalidSize: config.messages?.invalidSize || 'Não entendi o tamanho. Pode escolher: PP, P, M, G, GG, XG ou número?',
    productNotAvailable: config.messages?.productNotAvailable || 'Desculpe, não temos esse produto disponível no momento. Quer procurar outro?',
    chooseOption: config.messages?.chooseOption || 'Qual você gostaria? (Digite o número ou nome)',
    invalidOption: config.messages?.invalidOption || 'Não entendi qual você quer. Pode escolher pelo número ou nome?',
    askDeliveryType: config.messages?.askDeliveryType || 'Você quer retirar na loja ou entregar no seu endereço?',
    invalidDeliveryType: config.messages?.invalidDeliveryType || 'Não entendi. Você quer retirar na loja ou entregar no seu endereço?',
    pickupConfirmed: config.messages?.pickupConfirmed || 'Certo! Você vai retirar na loja.\n\nForma de pagamento: Pix, Cartão ou Dinheiro?',
    reservationCancelled: config.messages?.reservationCancelled || 'Sem problemas. Se quiser fazer outro pedido, é só chamar!',
    reservationAlreadyConfirmed: config.messages?.reservationAlreadyConfirmed || 'Sua reserva já foi confirmada. Se precisar de algo mais, é só chamar!',

    // Shared messages (same as delivery)
    askAddress: config.messages?.askAddress || 'Qual o endereço para entrega?',
    addressConfirmed: config.messages?.addressConfirmed || 'Endereço confirmado: {address}\n\nForma de pagamento: Pix, Cartão ou Dinheiro?',
    invalidAddress: config.messages?.invalidAddress || 'O endereço parece incompleto. Pode me dar o endereço completo com número?',
    paymentNotAccepted: config.messages?.paymentNotAccepted || 'Desculpe, não aceitamos {method}. Aceitamos: {accepted}.',
    choosePayment: config.messages?.choosePayment || 'Não entendi. Forma de pagamento: {methods}?',
    askConfirmation: config.messages?.askConfirmation || 'Posso reservar e confirmar?',
    pleaseConfirm: config.messages?.pleaseConfirm || 'Não entendi. Posso confirmar a reserva? (Sim ou Não)'
  };

  // Complaint detection at any stage
  if (parser.parseComplaint(message)) {
    return {
      response: msg.transferToHuman,
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
      response: msg.exchangeReturnTransfer,
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
          response: msg.askGender,
          newState: 'asking_gender',
          collectedData: updatedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      // Couldn't understand product
      return {
        response: msg.askProductType,
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
          response: msg.invalidGender,
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
        response: msg.askSize,
        newState: 'asking_size',
        collectedData: updatedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'asking_size': {
      const normalized = message.toLowerCase().trim();

      // Match letter sizes (PP, P, M, G, GG, XG) OR numeric sizes (1-60 for adults/kids)
      const letterSizeMatch = normalized.match(/\b(pp|p|m|g|gg|xg)\b/);
      const numericSizeMatch = normalized.match(/\b([1-9]|[1-5][0-9]|60)\b/);

      if (!letterSizeMatch && !numericSizeMatch) {
        return {
          response: msg.invalidSize,
          newState: 'asking_size',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      // Use letter size if matched, otherwise use numeric size
      const size = letterSizeMatch ? letterSizeMatch[1].toUpperCase() : numericSizeMatch![1];
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
          response: msg.productNotAvailable,
          newState: 'greeting',
          collectedData: {},
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      // CRITICAL: Use configurable header (Predictable, Deterministic Responses requirement)
      const optionsHeader = config.messages?.optionsHeader || 'Temos essas opções:';
      let responseText = `${optionsHeader}\n\n`;
      options.forEach((opt, idx) => {
        let itemDesc = `${idx + 1}. ${opt.name}`;
        if (opt.color) itemDesc += ` - ${opt.color}`;
        if (opt.size) itemDesc += ` (${opt.size})`;
        itemDesc += ` - R$ ${opt.price.toFixed(2)}`;
        responseText += itemDesc + '\n';
      });
      responseText += '\n' + msg.chooseOption;

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
          response: msg.invalidOption,
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
      // CRITICAL: Use configurable message (Predictable, Deterministic Responses requirement)
      const productSelectedTemplate = config.messages?.productSelected || 'Ótimo! {product} por R$ {price}.';
      const productSelectedMsg = productSelectedTemplate
        .replace('{product}', selectedProduct.name)
        .replace('{price}', selectedProduct.price.toFixed(2));
      return {
        response: `${productSelectedMsg}\n\n${msg.askDeliveryType}`,
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
          response: msg.askAddress,
          newState: 'asking_address',
          collectedData: { ...collectedData, deliveryType: 'delivery' },
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      if (normalized.includes('retirar') || normalized.includes('buscar') || normalized.includes('loja')) {
        // Skip address, go to payment
        return {
          response: msg.pickupConfirmed,
          newState: 'asking_payment',
          collectedData: { ...collectedData, deliveryType: 'pickup' },
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      return {
        response: msg.invalidDeliveryType,
        newState: 'asking_delivery_type',
        collectedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'asking_address': {
      if (!validators.validateAddress(message)) {
        return {
          response: msg.invalidAddress,
          newState: 'asking_address',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      // Step 7: Bot asks for payment method
      return {
        response: formatMessage(msg.addressConfirmed, { address: message }),
        newState: 'asking_payment',
        collectedData: { ...collectedData, address: message },
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'asking_payment': {
      const paymentMethod = parser.parsePayment(message);

      // Generate dynamic payment options message based on accepted methods
      const acceptedMethods = config.paymentMethods || ['pix', 'card', 'cash'];
      const methodNames: { [key: string]: string } = {
        pix: 'Pix',
        card: 'Cartão',
        cash: 'Dinheiro'
      };
      const acceptedNames = acceptedMethods.map(m => methodNames[m]).join(', ');

      if (!paymentMethod) {
        return {
          response: formatMessage(msg.choosePayment, { methods: acceptedNames }),
          newState: 'asking_payment',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      // Validate payment method is accepted by this client
      if (!acceptedMethods.includes(paymentMethod)) {
        return {
          response: formatMessage(msg.paymentNotAccepted, {
            method: methodNames[paymentMethod],
            accepted: acceptedNames
          }),
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
      // CRITICAL: All labels must come from configuration (Predictable, Deterministic Responses requirement)
      const summaryHeader = config.messages?.reservationSummaryHeader || '📋 Resumo da Reserva:';
      const summaryProduct = config.messages?.reservationSummaryProduct || '🛍️ Produto:';
      const summarySize = config.messages?.reservationSummarySize || '📏 Tamanho:';
      const summaryColor = config.messages?.reservationSummaryColor || '🎨 Cor:';
      const summaryPrice = config.messages?.reservationSummaryPrice || '💰 Valor:';
      const summaryDelivery = config.messages?.reservationSummaryDelivery || '📦 Entrega:';
      const summaryPickup = config.messages?.reservationSummaryPickup || '📦 Retirar na loja';
      const summaryPayment = config.messages?.orderSummaryPayment || '💳 Pagamento:';

      let summaryText = `${summaryHeader}\n\n`;
      summaryText += `${summaryProduct} ${product.name}\n`;
      if (product.size) summaryText += `${summarySize} ${product.size}\n`;
      if (product.color) summaryText += `${summaryColor} ${product.color}\n`;
      summaryText += `${summaryPrice} R$ ${product.price.toFixed(2)}\n\n`;

      if (deliveryType === 'delivery') {
        summaryText += `${summaryDelivery} ${address}\n`;
      } else {
        summaryText += `${summaryPickup}\n`;
      }

      summaryText += `${summaryPayment} ${paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}\n\n`;
      summaryText += msg.askConfirmation;

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
          response: `${msg.confirmation} ${msg.farewell}`,
          newState: 'reservation_confirmed',
          collectedData,
          shouldTransfer: false,
          shouldCreateReservation: true
        };
      }

      if (parser.parseNo(message)) {
        return {
          response: msg.reservationCancelled,
          newState: 'greeting',
          collectedData: {},
          shouldTransfer: false,
          shouldCreateReservation: false
        };
      }

      return {
        response: msg.pleaseConfirm,
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
        response: msg.reservationAlreadyConfirmed,
        newState: 'reservation_confirmed',
        collectedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    case 'transferred_to_human': {
      return {
        response: msg.alreadyWithAgent,
        newState: 'transferred_to_human',
        collectedData,
        shouldTransfer: false,
        shouldCreateReservation: false
      };
    }

    default: {
      return {
        response: msg.systemError,
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
        // Match by gender if specified (case-insensitive)
        if (searchCriteria.gender && item.gender) {
          if (item.gender.toLowerCase() !== searchCriteria.gender.toLowerCase()) {
            continue;
          }
        }

        // Match by size if specified (case-insensitive)
        if (searchCriteria.size && item.size) {
          if (item.size.toUpperCase() !== searchCriteria.size.toUpperCase()) {
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
