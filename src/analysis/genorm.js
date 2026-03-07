import { averageReplicates } from './replicates'
import { mean as calcMean, stdDev as calcStdDev } from './statistics'

/**
 * geNorm analysis for multi-reference-gene stability assessment.
 *
 * Calculates M-values (average pairwise variation) for each candidate reference
 * gene. Lower M = more stable expression across samples.
 *
 * @param {import('../parsers/types').ParsedData} data
 * @param {{
 *   referenceGenes: string[],
 *   controlGroup?: string,
 *   autoAverage?: boolean,
 *   outlierThreshold?: number
 * }} config
 * @returns {{
 *   rankings: { gene: string, mValue: number }[],
 *   recommended: string[],
 *   normalizationFactors: Record<string, number>
 * }}
 */
export function analyzeGeNorm(data, config) {
  const {
    referenceGenes,
    autoAverage = true,
    outlierThreshold = 0.5,
  } = config

  if (!referenceGenes || referenceGenes.length < 2) {
    return { rankings: [], recommended: [], normalizationFactors: {} }
  }

  // Step 1: Average technical replicates if requested
  let dataPoints
  if (autoAverage) {
    const { averaged } = averageReplicates(data.wells, { outlierThreshold })
    dataPoints = averaged
  } else {
    dataPoints = data.wells.map((w) => ({
      sample: w.sample,
      target: w.target,
      ct: w.ct,
      replicateCount: 1,
      outliers: [],
    }))
  }

  // Step 2: Build Ct matrix — { target: { sample: ct } }
  const ctMatrix = new Map()
  for (const d of dataPoints) {
    if (d.ct == null) continue
    if (!referenceGenes.includes(d.target)) continue
    if (!ctMatrix.has(d.target)) ctMatrix.set(d.target, new Map())
    ctMatrix.get(d.target).set(d.sample, d.ct)
  }

  // Step 3: Find samples common to all candidate reference genes
  const sampleSets = referenceGenes
    .filter((g) => ctMatrix.has(g))
    .map((g) => new Set(ctMatrix.get(g).keys()))
  if (sampleSets.length < 2) {
    return { rankings: [], recommended: [], normalizationFactors: {} }
  }
  const commonSamples = [...sampleSets[0]].filter((s) =>
    sampleSets.every((set) => set.has(s))
  )
  if (commonSamples.length < 2) {
    return { rankings: [], recommended: [], normalizationFactors: {} }
  }

  // Step 4: Calculate M-values
  const mValues = calculateMValues(data, referenceGenes, ctMatrix, commonSamples)

  // Step 5: Rank by M-value (ascending — lower is more stable)
  const rankings = Object.entries(mValues)
    .map(([gene, mValue]) => ({ gene, mValue }))
    .sort((a, b) => a.mValue - b.mValue)

  // Recommend the two most stable genes (or all with M < 0.5 for homogeneous tissues)
  const recommended = rankings.length >= 2
    ? [rankings[0].gene, rankings[1].gene]
    : rankings.map((r) => r.gene)

  // Step 6: Calculate normalization factors using recommended genes
  const normalizationFactors = {}
  for (const sample of commonSamples) {
    const values = recommended
      .map((gene) => ctMatrix.get(gene)?.get(sample))
      .filter((ct) => ct != null)
    if (values.length > 0) {
      // Normalization factor = geometric mean of relative quantities (2^-Ct)
      const relQuantities = values.map((ct) => Math.pow(2, -ct))
      normalizationFactors[sample] = geometricMean(relQuantities)
    }
  }

  return { rankings, recommended, normalizationFactors }
}

/**
 * Calculate M-value for each candidate reference gene.
 *
 * M-value = average pairwise variation of a gene with all other candidate genes
 * across all samples. Computed as the mean of stdDev(log2-ratio) across all pairs.
 *
 * @param {import('../parsers/types').ParsedData} data
 * @param {string[]} candidates - Array of candidate reference gene names
 * @returns {Record<string, number>}
 */
export function calculateMValues(data, candidates, ctMatrix, commonSamples) {
  // If called externally without pre-computed matrix, build it
  if (!ctMatrix || !commonSamples) {
    const wells = data.wells || []
    ctMatrix = new Map()
    for (const w of wells) {
      if (w.ct == null) continue
      if (!candidates.includes(w.target)) continue
      if (!ctMatrix.has(w.target)) ctMatrix.set(w.target, new Map())
      ctMatrix.get(w.target).set(w.sample, w.ct)
    }

    const sampleSets = candidates
      .filter((g) => ctMatrix.has(g))
      .map((g) => new Set(ctMatrix.get(g).keys()))
    if (sampleSets.length < 2) return {}
    commonSamples = [...sampleSets[0]].filter((s) =>
      sampleSets.every((set) => set.has(s))
    )
    if (commonSamples.length < 2) return {}
  }

  const activeCandidates = candidates.filter((g) => ctMatrix.has(g))
  const mValues = {}

  for (const gene of activeCandidates) {
    const pairwiseVariations = []

    for (const other of activeCandidates) {
      if (other === gene) continue

      // Calculate log2-ratio for each sample: Ct_gene - Ct_other
      const ratios = []
      for (const sample of commonSamples) {
        const ctGene = ctMatrix.get(gene)?.get(sample)
        const ctOther = ctMatrix.get(other)?.get(sample)
        if (ctGene != null && ctOther != null) {
          ratios.push(ctGene - ctOther)
        }
      }

      if (ratios.length >= 2) {
        pairwiseVariations.push(calcStdDev(ratios))
      }
    }

    mValues[gene] = pairwiseVariations.length > 0
      ? calcMean(pairwiseVariations)
      : Infinity
  }

  return mValues
}

/** Geometric mean of an array of positive numbers. */
function geometricMean(arr) {
  if (arr.length === 0) return 0
  const logSum = arr.reduce((s, v) => s + Math.log(v), 0)
  return Math.exp(logSum / arr.length)
}
