/**
 * Format a number respecting locale settings.
 * @param {number} value
 * @param {number} decimals
 * @param {string} locale - defaults to browser locale
 */
export function formatNumber(value, decimals = 2, locale) {
  if (value == null || isNaN(value)) return ''
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
