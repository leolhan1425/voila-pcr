import useStore from '../store/useStore'
import { isPlusFeature, hasAccess } from '../utils/featureGate'
import { isDemoMode } from '../utils/demoMode'
import { getTrialSessionsUsed, getTrialSessionsMax } from '../api/usage'

/**
 * Tier hook — tracks the current user's subscription tier.
 * Two tiers: 'free' and 'plus'. In demo mode, everything is unlocked.
 *
 * Trial sessions: first 3 analyses get Plus experience even on free tier.
 */
export default function useTier() {
  const tier = useStore((s) => s.tier)
  const setTier = useStore((s) => s.setTier)

  const demo = isDemoMode()
  const isPlus = demo || tier === 'plus'

  const trialUsed = getTrialSessionsUsed()
  const trialMax = getTrialSessionsMax()
  const trialRemaining = Math.max(0, trialMax - trialUsed)
  const inTrialSession = !isPlus && trialRemaining > 0

  // During trial sessions, user gets Plus features
  const effectivelyPlus = isPlus || inTrialSession

  const canUseMethod = (method) => {
    if (method === 'ddct') return true
    return effectivelyPlus
  }

  return {
    tier: isPlus ? 'plus' : 'free',
    isPlus,
    effectivelyPlus,
    setTier,
    canUseMethod,
    canUseGraphCustomizer: effectivelyPlus,
    canUseDrQPCR: effectivelyPlus,
    canSeeFullQC: effectivelyPlus,
    isPlusFeature: (feature) => isPlusFeature(feature),
    hasAccess: (feature) => hasAccess(feature, isPlus ? 'plus' : 'free') || inTrialSession,
    isDemoMode: demo,
    // Trial info
    inTrialSession,
    trialRemaining,
    trialUsed,
    trialMax,
  }
}
