// Fallback Detector - Determines when to transfer conversation to human agent
// Triggers on complaints, returns, special requests, or repeated invalid input

import * as parser from './messageParser';

export interface FallbackResult {
  shouldTransfer: boolean;
  reason?: string;
}

// Keywords that trigger immediate human transfer
const COMPLAINT_KEYWORDS = [
  'reclamar',
  'reclamacao',
  'problema',
  'insatisfeito',
  'ruim',
  'pessimo',
  'horrivel',
  'nao gostei',
  'decepcao'
];

const EXCHANGE_RETURN_KEYWORDS = [
  'trocar',
  'troca',
  'devolver',
  'devolucao',
  'reembolso',
  'cancelar pedido',
  'nao quero mais'
];

const SPECIAL_REQUEST_KEYWORDS = [
  'gerente',
  'supervisor',
  'atendente',
  'humano',
  'pessoa',
  'falar com alguem',
  'desconto',
  'promocao',
  'condicao especial'
];

/**
 * Normalize text for comparison (remove accents, lowercase, trim)
 */
const normalize = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s]/g, ''); // Remove punctuation
};

/**
 * Check if message contains any keywords from a list
 */
const containsKeyword = (message: string, keywords: string[]): boolean => {
  const normalized = normalize(message);
  return keywords.some(keyword => normalized.includes(normalize(keyword)));
};

/**
 * Detect if customer wants to complain
 */
export const isComplaint = (message: string): boolean => {
  return containsKeyword(message, COMPLAINT_KEYWORDS) || parser.parseComplaint(message);
};

/**
 * Detect if customer wants exchange or return
 */
export const isExchangeOrReturn = (message: string): boolean => {
  return containsKeyword(message, EXCHANGE_RETURN_KEYWORDS);
};

/**
 * Detect if customer requests special conditions or human agent
 */
export const isSpecialRequest = (message: string): boolean => {
  return containsKeyword(message, SPECIAL_REQUEST_KEYWORDS);
};

/**
 * Main fallback detection function
 * @param message - Customer message
 * @param invalidAttempts - Number of consecutive invalid inputs in current state
 * @returns Whether to transfer and reason
 */
export const shouldFallbackToHuman = (
  message: string,
  invalidAttempts: number = 0
): FallbackResult => {
  // Check for complaint
  if (isComplaint(message)) {
    return {
      shouldTransfer: true,
      reason: 'Customer complaint detected'
    };
  }

  // Check for exchange/return request
  if (isExchangeOrReturn(message)) {
    return {
      shouldTransfer: true,
      reason: 'Exchange or return request'
    };
  }

  // Check for special request or human agent request
  if (isSpecialRequest(message)) {
    return {
      shouldTransfer: true,
      reason: 'Special request or human agent requested'
    };
  }

  // Check for repeated invalid input (2 consecutive attempts)
  if (invalidAttempts >= 2) {
    return {
      shouldTransfer: true,
      reason: 'Customer unable to provide valid input after 2 attempts'
    };
  }

  // No fallback needed
  return {
    shouldTransfer: false
  };
};

/**
 * Generate transfer message in PT-BR
 */
export const getTransferMessage = (): string => {
  return 'Vou te conectar com um atendente agora. Um momento, por favor.';
};
