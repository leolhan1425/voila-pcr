/**
 * Usage tracking — localStorage-based for MVP.
 * Tracks monthly analysis count per free-tier user.
 *
 * TODO: Sync with server-side usage table when Supabase is configured.
 */

const FREE_TIER_LIMIT = 3

/**
 * Get the localStorage key for the current month.
 * @returns {string}
 */
function getMonthKey() {
  return `voilapcr_usage_${new Date().toISOString().slice(0, 7)}`
}

/**
 * Get the number of analyses used this month.
 * @returns {number}
 */
export function getMonthlyUsage() {
  const key = getMonthKey()
  return parseInt(localStorage.getItem(key) || '0', 10)
}

/**
 * Increment the monthly analysis count.
 * @returns {number} Updated count
 */
export function incrementUsage() {
  const key = getMonthKey()
  const count = getMonthlyUsage() + 1
  localStorage.setItem(key, String(count))
  return count
}

/**
 * Check whether the user can run another analysis.
 * @param {'free' | 'pro' | 'lab'} tier
 * @returns {boolean}
 */
export function canAnalyze(tier) {
  if (tier !== 'free') return true
  return getMonthlyUsage() < FREE_TIER_LIMIT
}

export { FREE_TIER_LIMIT }
