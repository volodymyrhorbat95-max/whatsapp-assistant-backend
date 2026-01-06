// Validators - Validate customer input format

// Validate if address looks reasonable
export const validateAddress = (address: string): boolean => {
  // Must have at least 10 characters
  if (address.length < 10) {
    return false;
  }

  // Should contain at least one number (house/apartment number)
  const hasNumber = /\d/.test(address);

  return hasNumber;
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
