/**
 * Feature gating utility for VoilaPCR tiers.
 * Determines which features require Pro or Lab tier.
 */
import { isDemoMode } from './demoMode'

const PRO_FEATURES = [
  'pfaffl',
  'genorm',
  'standardCurve',
  'graphCustomizer',
  'drqpcr',
  'fullQC',
  'batchUpload',
  'pdfExport',
  'prismExport',
  'savedTemplates',
  'highResExport',
]

/**
 * Check whether a feature is gated behind Pro tier.
 * In demo mode, nothing is gated.
 * @param {string} feature
 * @returns {boolean}
 */
export function isProFeature(feature) {
  if (isDemoMode()) return false
  return PRO_FEATURES.includes(feature)
}

/**
 * Return the minimum tier required for a given feature.
 * @param {string} feature
 * @returns {'free' | 'pro'}
 */
export function requiresTier(feature) {
  return isProFeature(feature) ? 'pro' : 'free'
}

/**
 * Check if the user has access to a feature based on their tier.
 * @param {string} feature
 * @param {'free' | 'pro' | 'lab'} tier
 * @returns {boolean}
 */
export function hasAccess(feature, tier) {
  if (isDemoMode()) return true
  if (tier === 'pro' || tier === 'lab') return true
  return !PRO_FEATURES.includes(feature)
}

export { PRO_FEATURES }
