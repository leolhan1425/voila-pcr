import { create } from 'zustand'
import { isProFeature } from '../utils/featureGate'
import { getMonthlyUsage, FREE_TIER_LIMIT } from '../api/usage'

/**
 * Tier store — tracks the current user's subscription tier.
 *
 * TODO: Sync with Stripe subscription status via backend API.
 * For now, defaults to 'free' and can be changed manually for testing.
 */
const useTierStore = create((set) => ({
  tier: 'free', // 'free' | 'pro' | 'lab'
  setTier: (tier) => set({ tier }),
}))

/**
 * Hook that returns tier info and feature gates.
 */
export default function useTier() {
  const tier = useTierStore((s) => s.tier)
  const setTier = useTierStore((s) => s.setTier)

  /**
   * Check if a specific analysis method is available for this tier.
   * ddCt is always available; pfaffl, genorm, standardCurve require Pro.
   */
  const canUseMethod = (method) => {
    if (method === 'ddct') return true
    if (tier === 'pro' || tier === 'lab') return true
    return false
  }

  const isPaidTier = tier === 'pro' || tier === 'lab'

  return {
    tier,
    setTier,
    canUseMethod,
    canUseGraphCustomizer: isPaidTier,
    canUseDrQPCR: isPaidTier,
    canSeeFullQC: isPaidTier,
    remainingAnalyses: isPaidTier ? Infinity : Math.max(0, FREE_TIER_LIMIT - getMonthlyUsage()),
    isProFeature,
  }
}
