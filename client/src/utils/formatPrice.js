/**
 * Format price in Indian Rupees
 * @param {number} amount
 * @param {boolean} showSymbol
 * @returns {string}
 */
export const formatPrice = (amount, showSymbol = true) => {
  if (amount == null || isNaN(amount)) return showSymbol ? '₹0' : '0';
  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted;
};

/**
 * Calculate discount percentage
 * @param {number} original
 * @param {number} current
 * @returns {number}
 */
export const calcDiscount = (original, current) => {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
};
