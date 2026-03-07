import { useState, useCallback } from 'react'
import { getMonthlyUsage, incrementUsage, canAnalyze, FREE_TIER_LIMIT } from '../api/usage'
import useTier from './useTier'

/**
 * Hook that tracks analysis count for free-tier gating.
 *
 * TODO: Sync with server-side usage table when Supabase is configured.
 * Currently uses localStorage with monthly keys (voilapcr_usage_YYYY-MM).
 */
export default function useUsage() {
  const { tier } = useTier()
  const [analysisCount, setAnalysisCount] = useState(() => getMonthlyUsage())

  const handleIncrementAnalysis = useCallback(() => {
    const newCount = incrementUsage()
    setAnalysisCount(newCount)
    return newCount
  }, [])

  const userCanAnalyze = tier !== 'free' || analysisCount < FREE_TIER_LIMIT

  return {
    analysisCount,
    incrementAnalysis: handleIncrementAnalysis,
    canAnalyze: userCanAnalyze,
    remainingAnalyses: tier !== 'free' ? Infinity : Math.max(0, FREE_TIER_LIMIT - analysisCount),
  }
}
