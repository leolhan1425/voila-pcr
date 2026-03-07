/**
 * Usage tracking — localStorage-based for MVP.
 * Free tier is unlimited analyses (v3 spec).
 * Tracks usage for analytics purposes only.
 *
 * TODO: Sync with server-side usage table when Supabase is configured.
 */
import { isDemoMode } from '../utils/demoMode'

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
  if (isDemoMode()) return 0
  const key = getMonthKey()
  return parseInt(localStorage.getItem(key) || '0', 10)
}

/**
 * Increment the monthly analysis count.
 * @returns {number} Updated count
 */
export function incrementUsage() {
  if (isDemoMode()) return 0
  const key = getMonthKey()
  const count = getMonthlyUsage() + 1
  localStorage.setItem(key, String(count))
  return count
}

/**
 * Check whether the user can run another analysis.
 * Free tier has unlimited analyses (v3).
 * @param {'free' | 'pro' | 'lab'} tier
 * @returns {boolean}
 */
export function canAnalyze() {
  return true
}

/**
 * Get the count of Dr. qPCR queries this month (free tier: 1/month).
 * @returns {number}
 */
export function getDrQPCRUsage() {
  if (isDemoMode()) return 0
  const key = `voilapcr_drqpcr_${new Date().toISOString().slice(0, 7)}`
  return parseInt(localStorage.getItem(key) || '0', 10)
}

/**
 * Increment Dr. qPCR query count.
 * @returns {number}
 */
export function incrementDrQPCRUsage() {
  if (isDemoMode()) return 0
  const key = `voilapcr_drqpcr_${new Date().toISOString().slice(0, 7)}`
  const count = getDrQPCRUsage() + 1
  localStorage.setItem(key, String(count))
  return count
}
