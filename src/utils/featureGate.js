/**
 * Feature gating utility for VoilaPCR tiers.
 * Determines which features require Pro or Lab tier.
 */

const PRO_FEATURES = [
  'pfaffl',
  'genorm',
  'standardCurve',
  'graphCustomizer',
  'drqpcr',
  'fullQC',
  'batchUpload',
  'pdfExport',
]

/**
 * Check whether a feature is gated behind Pro tier.
 * @param {string} feature
 * @returns {boolean}
 */
export function isProFeature(feature) {
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

export { PRO_FEATURES }
