/**
 * FORMATTING UTILITIES
 * ====================
 * Currency, number, and display formatting.
 */

/** Format number as USD currency: $1,234.56 */
export function currency(n) {
  return '$' + (n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format number with commas and 2 decimal places */
export function num(n) {
  return (n || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Percentage with 1 decimal: "42.5%" */
export function pct(value, total) {
  if (!total) return '0%';
  return ((value / total) * 100).toFixed(1) + '%';
}

/** Generate a unique ID using timestamp + random suffix */
export function uid(prefix = 'id') {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}
