import { averageReplicates } from './replicates'
import { mean as calcMean, sem as calcSem, stdDev as calcStdDev, tTest, significanceStars } from './statistics'

/**
 * Pfaffl efficiency-corrected relative quantification.
 *
 * Ratio = (E_target ^ ΔCt_target) / (E_ref ^ ΔCt_ref)
 * where ΔCt = mean_control_Ct - sample_Ct
 *
 * @param {import('../parsers/types').ParsedData} data
 * @param {{
 *   referenceGene: string,
 *   controlGroup: string,
 *   autoAverage?: boolean,
 *   outlierThreshold?: number,
 *   efficiencies?: Record<string, number>
 * }} config
 * @returns {{ rows: object[], summary: object, statistics: object }}
 */
export function analyzePfaffl(data, config) {
  const {
    referenceGene,
    controlGroup,
    autoAverage = true,
    outlierThreshold = 0.5,
    efficiencies = {},
  } = config

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

  // Step 2: Build Ct lookup by sample for all targets
  const ctByTargetSample = new Map()
  for (const d of dataPoints) {
    if (d.ct == null) continue
    const key = `${d.target}||${d.sample}`
    ctByTargetSample.set(key, d.ct)
  }

  // Step 3: Calculate mean control Ct per target
  const controlCtByTarget = new Map()
  for (const d of dataPoints) {
    if (d.ct == null) continue
    const group = d.sample.replace(/[\s_-]\d+$/, '')
    if (group !== controlGroup) continue
    if (!controlCtByTarget.has(d.target)) controlCtByTarget.set(d.target, [])
    controlCtByTarget.get(d.target).push(d.ct)
  }

  const controlMeanCtByTarget = new Map()
  for (const [target, vals] of controlCtByTarget) {
    controlMeanCtByTarget.set(target, calcMean(vals))
  }

  // Step 4: Calculate Pfaffl ratio for each sample-target pair
  const rows = []
  for (const d of dataPoints) {
    if (d.target === referenceGene) continue
    if (d.ct == null) continue

    const group = d.sample.replace(/[\s_-]\d+$/, '')

    // Get reference gene Ct for this sample
    const refCt = ctByTargetSample.get(`${referenceGene}||${d.sample}`)
    if (refCt == null) continue

    // Control mean Ct for target and reference
    const controlMeanTarget = controlMeanCtByTarget.get(d.target)
    const controlMeanRef = controlMeanCtByTarget.get(referenceGene)
    if (controlMeanTarget == null || controlMeanRef == null) continue

    // Efficiencies: default 2.0 (100% efficiency)
    const eTarget = efficiencies[d.target] ?? 2.0
    const eRef = efficiencies[referenceGene] ?? 2.0

    // ΔCt values (control - sample)
    const dCtTarget = controlMeanTarget - d.ct
    const dCtRef = controlMeanRef - refCt

    // Pfaffl ratio
    const ratio = Math.pow(eTarget, dCtTarget) / Math.pow(eRef, dCtRef)

    rows.push({
      sample: d.sample,
      target: d.target,
      ct: d.ct,
      refCt,
      dCtTarget,
      dCtRef,
      eTarget,
      eRef,
      foldChange: ratio,
      group,
    })
  }

  // Step 5: Summary stats per group per target
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

  // Step 6: Statistics — t-test between control and each other group per target
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
