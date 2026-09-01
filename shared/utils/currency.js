/**
 * Currency formatting utility for RoomieMatch
 * Displays prices in Nepali Rupees (NPR)
 */

/**
 * Format a number as Nepali Rupees
 * @param {number} amount - The amount to format
 * @param {boolean} showDecimals - Whether to show decimal places (default: false)
 * @returns {string} - Formatted currency string (e.g., "Rs. 50,000")
 */
export function formatCurrency(amount, showDecimals = false) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "Rs. 0";
  }

  const numAmount = Number(amount);
  
  // Format with commas (Indian numbering system)
  const formatted = showDecimals 
    ? numAmount.toFixed(2)
    : Math.round(numAmount).toString();
  
  // Add commas in Indian style (last 3 digits, then every 2 digits)
  const parts = formatted.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];
  
  let result = '';
  const len = integerPart.length;
  
  if (len <= 3) {
    result = integerPart;
  } else {
    // Last 3 digits
    result = integerPart.slice(-3);
    let remaining = integerPart.slice(0, -3);
    
    // Add commas for every 2 digits from right to left
    while (remaining.length > 0) {
      if (remaining.length <= 2) {
        result = remaining + ',' + result;
        remaining = '';
      } else {
        result = remaining.slice(-2) + ',' + result;
        remaining = remaining.slice(0, -2);
      }
    }
  }
  
  if (decimalPart) {
    result += '.' + decimalPart;
  }
  
  return `Rs. ${result}`;
}

/**
 * Format a price range
 * @param {number} min - Minimum price
 * @param {number} max - Maximum price
 * @returns {string} - Formatted range (e.g., "Rs. 10,000 - Rs. 50,000")
 */
export function formatPriceRange(min, max) {
  if (!min && !max) return "Not specified";
  if (!min) return `Up to ${formatCurrency(max)}`;
  if (!max) return `From ${formatCurrency(min)}`;
  if (min === max) return formatCurrency(min);
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

/**
 * Parse a currency input string to number
 * @param {string} value - Input value (e.g., "50000" or "50,000")
 * @returns {number} - Parsed number
 */
export function parseCurrencyInput(value) {
  if (!value) return 0;
  // Remove any non-digit characters except decimal point
  const cleaned = String(value).replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}
