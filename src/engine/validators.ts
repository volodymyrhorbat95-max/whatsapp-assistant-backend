// Validators - Validate customer input format

// Validate if address looks reasonable
// Handles Brazilian address format (Rua, Avenida, etc.)
export const validateAddress = (address: string): boolean => {
  // Must have at least 10 characters
  if (address.length < 10) {
    return false;
  }

  // Trim and check for minimum words
  const trimmed = address.trim();
  const words = trimmed.split(/\s+/);

  // Should have at least 3 words (street type, street name, additional info)
  // Example: "Rua Principal 123" or "Avenida Central s/n"
  if (words.length < 3) {
    return false;
  }

  // Should contain either:
  // 1. At least one number (house/apartment number)
  // 2. OR "s/n" or "sem número" (Brazilian convention for no number)
  const hasNumber = /\d/.test(address);
  const hasNoNumber = /s\/n|sem\s+n[uú]mero/i.test(address);

  return hasNumber || hasNoNumber;
};

// Validate payment method
export const validatePaymentMethod = (payment: string): boolean => {
  const validMethods = ['pix', 'card', 'cash'];
  return validMethods.includes(payment.toLowerCase());
};

// Validate if message is not empty
export const validateNotEmpty = (message: string): boolean => {
  return Boolean(message && message.trim().length > 0);
};
