// Operating Hours Checker
// Validates if business is open based on client configuration

import { ClientConfiguration } from '../types';

/**
 * Checks if current time is within the business's operating hours
 *
 * @param config - Client configuration containing operatingHours
 * @returns true if within operating hours, false if closed
 *
 * If operatingHours not configured, assumes always open (24/7)
 */
export const isWithinOperatingHours = (config: ClientConfiguration): boolean => {
  if (!config.operatingHours) {
    return true; // If not configured, assume always open
  }

  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];

  const hoursForToday = config.operatingHours[currentDay];
  if (!hoursForToday) {
    return false; // Day not configured = closed
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Parse open and close times
  const [openHour, openMin] = hoursForToday.open.split(':').map(Number);
  const [closeHour, closeMin] = hoursForToday.close.split(':').map(Number);

  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  return currentTime >= openTime && currentTime < closeTime;
};

/**
 * Gets appropriate "closed" message for customer
 * CRITICAL: All messages must come from configuration (Predictable, Deterministic Responses requirement)
 *
 * @param config - Client configuration
 * @returns Portuguese message explaining business is closed
 *
 * Priority:
 * 1. closedMessage - simple closed message
 * 2. closedMessageWithHours - message with {open} and {close} placeholders
 * 3. Default fallback
 */
export const getClosedMessage = (config: ClientConfiguration): string => {
  // Check for custom closed message (simple version)
  const customMessage = config.messages?.closedMessage;
  if (customMessage) {
    return customMessage;
  }

  // Check for closed message with hours template
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const hoursForToday = config.operatingHours?.[currentDay];

  if (hoursForToday && hoursForToday.open !== 'closed') {
    // Use configurable template with placeholders, or default
    const templateWithHours = config.messages?.closedMessageWithHours
      || 'Olá! No momento estamos fechados. Nosso horário de funcionamento hoje é das {open} às {close}. Deixe sua mensagem que retornaremos em breve!';
    return templateWithHours
      .replace('{open}', hoursForToday.open)
      .replace('{close}', hoursForToday.close);
  }

  // Fallback for days when business is fully closed (no hours configured)
  return config.messages?.closedMessage
    || 'Olá! No momento estamos fechados. Deixe sua mensagem que retornaremos em breve!';
};
