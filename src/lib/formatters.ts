/**
 * Indian Rupee formatting and amount parsing utilities.
 */

/**
 * Formats a number in Indian number system grouping (e.g., 1,00,000) with the ₹ symbol.
 */
export function formatRupees(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const abs = Math.abs(Math.round(amount));

  const str = abs.toString();
  let result = '';
  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.slice(-3);
    const rest = str.slice(0, -3);
    const withCommas = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = `${withCommas},${lastThree}`;
  }

  return isNegative ? `-₹${result}` : `₹${result}`;
}

/**
 * Parses a rupee input string by stripping symbols, commas, and whitespace.
 * Returns a valid number or null if invalid or empty.
 */
export function parseAmount(input: string): number | null {
  if (!input) {
    return null;
  }
  const normalized = input
    .replace(/rs\.?/gi, '')
    .replace(/₹/g, '')
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .trim();

  if (!normalized) {
    return null;
  }
  const num = Number(normalized);
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  return num;
}
