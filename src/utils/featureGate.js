/**
 * Feature gating utility for VoilaPCR tiers.
 * Two tiers only: Free and Plus.
 */
import { isDemoMode } from './demoMode'

const PLUS_FEATURES = [
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
 * Check whether a feature is gated behind Plus tier.
 * In demo mode, nothing is gated.
 */
export function isPlusFeature(feature) {
  if (isDemoMode()) return false
  return PLUS_FEATURES.includes(feature)
}

/**
 * Check if the user has access to a feature based on their tier.
 * @param {string} feature
 * @param {'free' | 'plus'} tier
 * @returns {boolean}
 */
export function hasAccess(feature, tier) {
  if (isDemoMode()) return true
  if (tier === 'plus') return true
  return !PLUS_FEATURES.includes(feature)
}

// Legacy aliases
export const isProFeature = isPlusFeature
export { PLUS_FEATURES, PLUS_FEATURES as PRO_FEATURES }
