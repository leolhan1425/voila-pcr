/**
 * Usage tracking — localStorage-based for MVP.
 * Free tier: 5 analyses/month, 3 lifetime Plus trial sessions.
 * Plus tier: unlimited.
 *
 * TODO: Sync with server-side usage table when Supabase is configured.
 */
import { isDemoMode } from '../utils/demoMode'

const FREE_MONTHLY_LIMIT = 5

// --- Monthly analysis count ---

function getMonthKey() {
  return `voilapcr_usage_${new Date().toISOString().slice(0, 7)}`
}

export function getMonthlyUsage() {
  if (isDemoMode()) return 0
  return parseInt(localStorage.getItem(getMonthKey()) || '0', 10)
}

export function incrementUsage() {
  if (isDemoMode()) return 0
  const key = getMonthKey()
  const count = getMonthlyUsage() + 1
  localStorage.setItem(key, String(count))
  return count
}

/**
 * Check whether the user can run another analysis this month.
 * @param {'free' | 'plus'} tier
 */
export function canAnalyze(tier) {
  if (isDemoMode()) return true
  if (tier === 'plus') return true
  return getMonthlyUsage() < FREE_MONTHLY_LIMIT
}

// --- Trial sessions (lifetime, not monthly) ---

const TRIAL_KEY = 'voilapcr_trial_used'
const TRIAL_MAX_KEY = 'voilapcr_trial_max'

export function getTrialSessionsUsed() {
  if (isDemoMode()) return 0
  return parseInt(localStorage.getItem(TRIAL_KEY) || '0', 10)
}

export function getTrialSessionsMax() {
  // Default 3, or 4 if signed up via referral
  return parseInt(localStorage.getItem(TRIAL_MAX_KEY) || '3', 10)
}

export function incrementTrialSession() {
  if (isDemoMode()) return 0
  const used = getTrialSessionsUsed() + 1
  localStorage.setItem(TRIAL_KEY, String(used))
  return used
}

export function grantExtraTrialSession() {
  const max = getTrialSessionsMax() + 1
  localStorage.setItem(TRIAL_MAX_KEY, String(max))
  return max
}

// --- Dr. qPCR usage ---

export function getDrQPCRUsage() {
  if (isDemoMode()) return 0
  const key = `voilapcr_drqpcr_${new Date().toISOString().slice(0, 7)}`
  return parseInt(localStorage.getItem(key) || '0', 10)
}

export function incrementDrQPCRUsage() {
  if (isDemoMode()) return 0
  const key = `voilapcr_drqpcr_${new Date().toISOString().slice(0, 7)}`
  const count = getDrQPCRUsage() + 1
  localStorage.setItem(key, String(count))
  return count
}

export { FREE_MONTHLY_LIMIT }
