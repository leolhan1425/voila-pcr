import { useState, useCallback } from 'react'
import { getMonthlyUsage, incrementUsage } from '../api/usage'

/**
 * Hook that tracks analysis count for analytics.
 * Free tier has unlimited analyses (v3).
 */
export default function useUsage() {
  const [analysisCount, setAnalysisCount] = useState(() => getMonthlyUsage())

  const handleIncrementAnalysis = useCallback(() => {
    const newCount = incrementUsage()
    setAnalysisCount(newCount)
    return newCount
  }, [])

  return {
    analysisCount,
    incrementAnalysis: handleIncrementAnalysis,
    canAnalyze: true,
  }
}
