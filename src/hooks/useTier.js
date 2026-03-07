import { create } from 'zustand'
import { isProFeature, hasAccess } from '../utils/featureGate'
import { isDemoMode } from '../utils/demoMode'

/**
 * Tier store — tracks the current user's subscription tier.
 * In demo mode, everything is unlocked.
 */
const useTierStore = create((set) => ({
  tier: 'free', // 'free' | 'pro' | 'lab'
  setTier: (tier) => set({ tier }),
}))

export default function useTier() {
  const tier = useTierStore((s) => s.tier)
  const setTier = useTierStore((s) => s.setTier)

  const demo = isDemoMode()
  const effectiveTier = demo ? 'pro' : tier

  const canUseMethod = (method) => {
    if (method === 'ddct') return true
    if (demo || tier === 'pro' || tier === 'lab') return true
    return false
  }

  const isPaidTier = demo || tier === 'pro' || tier === 'lab'

  return {
    tier: effectiveTier,
    rawTier: tier,
    setTier,
    canUseMethod,
    canUseGraphCustomizer: isPaidTier,
    canUseDrQPCR: isPaidTier,
    canSeeFullQC: isPaidTier,
    isProFeature: (feature) => isProFeature(feature),
    hasAccess: (feature) => hasAccess(feature, effectiveTier),
    isDemoMode: demo,
  }
}
