/**
 * Group wells by sample+target, average replicates, flag outliers.
 * @param {import('../parsers/types').WellData[]} wells
 * @param {{ outlierThreshold: number }} opts
 * @returns {{ averaged: { sample: string, target: string, ct: number|null, replicateCount: number, outliers: string[] }[] }}
 */
export function averageReplicates(wells, { outlierThreshold = 0.5 } = {}) {
  const groups = new Map()

  for (const w of wells) {
    if (w.ct == null) continue
    const key = `${w.sample}||${w.target}`
    if (!groups.has(key)) {
      groups.set(key, { sample: w.sample, target: w.target, values: [], wells: [] })
    }
    groups.get(key).values.push(w.ct)
    groups.get(key).wells.push(w.well)
  }

  const averaged = []

  for (const [, g] of groups) {
    if (g.values.length === 0) {
      averaged.push({ sample: g.sample, target: g.target, ct: null, replicateCount: 0, outliers: [] })
      continue
    }

    const mean = g.values.reduce((a, b) => a + b, 0) / g.values.length
    const outliers = []

    // Flag outliers
    for (let i = 0; i < g.values.length; i++) {
      if (Math.abs(g.values[i] - mean) > outlierThreshold) {
        outliers.push(g.wells[i])
      }
    }

    // Average non-outlier values if there are outliers, otherwise average all
    const clean = outliers.length > 0 && outliers.length < g.values.length
      ? g.values.filter((_, i) => !outliers.includes(g.wells[i]))
      : g.values

    const cleanMean = clean.reduce((a, b) => a + b, 0) / clean.length

    averaged.push({
      sample: g.sample,
      target: g.target,
      ct: cleanMean,
      replicateCount: g.values.length,
      outliers,
    })
  }

  return { averaged }
}
