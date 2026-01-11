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
 *
 * @param config - Client configuration
 * @returns Portuguese message explaining business is closed
 *
 * If custom closedMessage configured, uses that
 * Otherwise generates default message with today's hours if available
 */
export const getClosedMessage = (config: ClientConfiguration): string => {
  // Check for custom closed message
  const customMessage = config.messages?.closedMessage;
  if (customMessage) {
    return customMessage;
  }

  // Generate default message with hours if available
  const now = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = dayNames[now.getDay()];
  const hoursForToday = config.operatingHours?.[currentDay];

  if (hoursForToday) {
    return `Olá! No momento estamos fechados. Nosso horário de funcionamento hoje é das ${hoursForToday.open} às ${hoursForToday.close}. Deixe sua mensagem que retornaremos em breve!`;
  }

  return 'Olá! No momento estamos fechados. Deixe sua mensagem que retornaremos em breve!';
};
