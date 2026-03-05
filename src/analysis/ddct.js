import { averageReplicates } from './replicates'
import { mean as calcMean, sem as calcSem, stdDev as calcStdDev, tTest, significanceStars } from './statistics'

/**
 * ΔΔCt (Livak) analysis.
 *
 * @param {import('../parsers/types').ParsedData} data
 * @param {{ referenceGene: string, controlGroup: string, autoAverage: boolean, outlierThreshold: number }} config
 * @returns {{ rows: object[], summary: object, statistics: object }}
 */
export function analyzeDdct(data, config) {
  const { referenceGene, controlGroup, autoAverage = true, outlierThreshold = 0.5 } = config

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

  // Step 2: Build a lookup for reference gene Ct by sample
  const refCtBySample = new Map()
  for (const d of dataPoints) {
    if (d.target === referenceGene && d.ct != null) {
      refCtBySample.set(d.sample, d.ct)
    }
  }

  // Step 3: Calculate ΔCt for each sample-target pair (excluding reference gene)
  const rows = []
  for (const d of dataPoints) {
    if (d.target === referenceGene) continue
    if (d.ct == null) continue

    const refCt = refCtBySample.get(d.sample)
    if (refCt == null) continue

    const dCt = d.ct - refCt

    // Determine group
    const group = d.sample.replace(/[\s_-]\d+$/, '')

    rows.push({
      sample: d.sample,
      target: d.target,
      ct: d.ct,
      refCt,
      dCt,
      ddCt: null, // filled in next step
      foldChange: null,
      group,
    })
  }

  // Step 4: Calculate mean ΔCt for control group, per target
  const controlDctByTarget = new Map()
  for (const r of rows) {
    if (r.group === controlGroup) {
      if (!controlDctByTarget.has(r.target)) {
        controlDctByTarget.set(r.target, [])
      }
      controlDctByTarget.get(r.target).push(r.dCt)
    }
  }

  const controlMeanDctByTarget = new Map()
  for (const [target, vals] of controlDctByTarget) {
    controlMeanDctByTarget.set(target, calcMean(vals))
  }

  // Step 5: Calculate ΔΔCt and fold change
  for (const r of rows) {
    const controlMean = controlMeanDctByTarget.get(r.target)
    if (controlMean == null) continue
    r.ddCt = r.dCt - controlMean
    r.foldChange = Math.pow(2, -r.ddCt)
  }

  // Step 6: Summary stats per group per target
  const summary = {}
  const groupTargetMap = new Map()

  for (const r of rows) {
    if (r.foldChange == null) continue
    const key = `${r.group}||${r.target}`
    if (!groupTargetMap.has(key)) {
      groupTargetMap.set(key, { group: r.group, target: r.target, values: [] })
    }
    groupTargetMap.get(key).values.push(r.foldChange)
  }

  for (const [, entry] of groupTargetMap) {
    if (!summary[entry.target]) summary[entry.target] = {}
    summary[entry.target][entry.group] = {
      mean: calcMean(entry.values),
      sem: calcSem(entry.values),
      sd: calcStdDev(entry.values),
      n: entry.values.length,
      values: entry.values,
    }
  }

  // Step 7: Statistics — t-test between control and each other group per target
  const statistics = {}
  for (const [target, groups] of Object.entries(summary)) {
    const controlVals = groups[controlGroup]?.values
    if (!controlVals) continue
    statistics[target] = {}
    for (const [group, data] of Object.entries(groups)) {
      if (group === controlGroup) continue
      const p = tTest(controlVals, data.values)
      statistics[target][group] = {
        test: 'Welch\'s t-test',
        pValue: p,
        significant: p < 0.05,
        stars: significanceStars(p),
      }
    }
  }

  return { rows, summary, statistics }
}
