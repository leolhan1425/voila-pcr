import { averageReplicates } from './replicates'
import { mean as calcMean, sem as calcSem, stdDev as calcStdDev, tTest, significanceStars } from './statistics'

/**
 * Standard curve absolute quantification.
 *
 * Builds a linear regression of Ct vs. log(quantity) from standard wells,
 * then quantifies unknowns using the curve equation.
 *
 * @param {import('../parsers/types').ParsedData} data
 * @param {{
 *   referenceGene?: string,
 *   controlGroup?: string,
 *   autoAverage?: boolean,
 *   outlierThreshold?: number,
 *   dilutionFactor?: number
 * }} config
 * @returns {{
 *   rows: object[],
 *   summary: object,
 *   statistics: object,
 *   curveInfo: Record<string, { slope: number, intercept: number, r2: number, efficiency: number, warnings: string[] }>
 * }}
 */
export function analyzeStandardCurve(data, config) {
  const {
    referenceGene,
    controlGroup,
    autoAverage = true,
    outlierThreshold = 0.5,
    dilutionFactor = 10,
  } = config

  // Step 1: Average technical replicates
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

  // Step 2: Identify standard wells and build curves per target
  // Standards are wells with taskType STANDARD or whose quantity is set
  const standardWells = data.wells.filter(
    (w) => w.ct != null && (w.taskType === 'STANDARD' || w.quantity != null)
  )

  const curveInfo = {}
  const curveByTarget = new Map()

  // Group standards by target
  const stdByTarget = new Map()
  for (const w of standardWells) {
    if (!stdByTarget.has(w.target)) stdByTarget.set(w.target, [])
    stdByTarget.get(w.target).push(w)
  }

  for (const [target, stdWells] of stdByTarget) {
    // If standards have explicit quantities, use them
    const hasQuantities = stdWells.some((w) => w.quantity != null && w.quantity > 0)

    let points
    if (hasQuantities) {
      points = buildCurveFromQuantities(stdWells)
    } else {
      points = buildCurveFromDilutions(stdWells, dilutionFactor)
    }

    if (points.length < 2) {
      curveInfo[target] = {
        slope: null,
        intercept: null,
        r2: null,
        efficiency: null,
        warnings: ['Insufficient standard points for curve fitting.'],
      }
      continue
    }

    const { slope, intercept, r2 } = linearRegression(
      points.map((p) => p.logQuantity),
      points.map((p) => p.ct)
    )

    const efficiency = (Math.pow(10, -1 / slope) - 1) * 100

    // Flag quality issues
    const warnings = []
    if (r2 < 0.98) {
      warnings.push(`R² = ${r2.toFixed(4)} (below 0.98 threshold — poor linearity)`)
    }
    if (efficiency < 90 || efficiency > 110) {
      warnings.push(`Efficiency = ${efficiency.toFixed(1)}% (outside 90–110% acceptable range)`)
    }

    curveInfo[target] = { slope, intercept, r2, efficiency, warnings }
    curveByTarget.set(target, { slope, intercept })
  }

  // Step 3: Quantify unknowns using the standard curves
  const rows = []
  const targetsSet = new Set()
  const samplesSet = new Set()

  for (const d of dataPoints) {
    if (d.ct == null) continue

    const group = d.sample.replace(/[\s_-]\d+$/, '')
    const curve = curveByTarget.get(d.target)

    // Calculate quantity from curve: log(quantity) = (Ct - intercept) / slope
    let quantity = null
    if (curve) {
      const logQ = (d.ct - curve.intercept) / curve.slope
      quantity = Math.pow(10, logQ)
    }

    // Normalize to reference gene if provided
    let normalizedQuantity = quantity
    if (referenceGene && d.target !== referenceGene && quantity != null) {
      // Find matching reference gene quantity for this sample
      const refPoint = dataPoints.find(
        (p) => p.sample === d.sample && p.target === referenceGene && p.ct != null
      )
      const refCurve = curveByTarget.get(referenceGene)
      if (refPoint && refCurve) {
        const refLogQ = (refPoint.ct - refCurve.intercept) / refCurve.slope
        const refQuantity = Math.pow(10, refLogQ)
        normalizedQuantity = refQuantity > 0 ? quantity / refQuantity : null
      }
    }

    rows.push({
      sample: d.sample,
      target: d.target,
      ct: d.ct,
      quantity,
      normalizedQuantity,
      group,
    })

    targetsSet.add(d.target)
    samplesSet.add(d.sample)
  }

  // Step 4: Summary stats per group per target
  const summary = {}
  const groupTargetMap = new Map()

  const quantityField = referenceGene ? 'normalizedQuantity' : 'quantity'
  for (const r of rows) {
    const val = r[quantityField]
    if (val == null || r.target === referenceGene) continue
    const key = `${r.group}||${r.target}`
    if (!groupTargetMap.has(key)) {
      groupTargetMap.set(key, { group: r.group, target: r.target, values: [] })
    }
    groupTargetMap.get(key).values.push(val)
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

  // Step 5: Statistics — t-test between control and each group per target
  const statistics = {}
  if (controlGroup) {
    for (const [target, groups] of Object.entries(summary)) {
      const controlVals = groups[controlGroup]?.values
      if (!controlVals) continue
      statistics[target] = {}
      for (const [group, gData] of Object.entries(groups)) {
        if (group === controlGroup) continue
        const p = tTest(controlVals, gData.values)
        statistics[target][group] = {
          test: 'Welch\'s t-test',
          pValue: p,
          significant: p < 0.05,
          stars: significanceStars(p),
        }
      }
    }
  }

  return { rows, summary, statistics, curveInfo }
}

/**
 * Build curve points from standards that have explicit quantities.
 */
function buildCurveFromQuantities(stdWells) {
  // Group by quantity to average replicates at each concentration
  const byQuantity = new Map()
  for (const w of stdWells) {
    if (w.quantity == null || w.quantity <= 0) continue
    const key = w.quantity
    if (!byQuantity.has(key)) byQuantity.set(key, [])
    byQuantity.get(key).push(w.ct)
  }

  const points = []
  for (const [quantity, cts] of byQuantity) {
    const meanCt = calcMean(cts)
    points.push({ logQuantity: Math.log10(quantity), ct: meanCt })
  }

  return points.sort((a, b) => a.logQuantity - b.logQuantity)
}

/**
 * Build curve points from dilution series (no explicit quantities).
 * Assumes standards are named sequentially (C1, C2, C3...) with each
 * step being a 1/dilutionFactor dilution.
 */
function buildCurveFromDilutions(stdWells, dilutionFactor) {
  const bySample = new Map()
  for (const w of stdWells) {
    if (!bySample.has(w.sample)) bySample.set(w.sample, [])
    bySample.get(w.sample).push(w.ct)
  }

  const sortedNames = [...bySample.keys()].sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0
    const numB = parseInt(b.replace(/\D/g, '')) || 0
    return numA - numB
  })

  const points = []
  for (let i = 0; i < sortedNames.length; i++) {
    const cts = bySample.get(sortedNames[i])
    const validCts = cts.filter((ct) => ct != null && !isNaN(ct))
    if (validCts.length === 0) continue
    const relConc = Math.pow(dilutionFactor, -i)
    points.push({
      logQuantity: Math.log10(relConc),
      ct: calcMean(validCts),
    })
  }

  return points
}

/**
 * Simple linear regression: y = slope * x + intercept.
 */
function linearRegression(x, y) {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0)
  const sumX2 = x.reduce((a, xi) => a + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const ssRes = y.reduce((sum, yi, i) => sum + (yi - (slope * x[i] + intercept)) ** 2, 0)
  const ssTot = y.reduce((sum, yi) => sum + (yi - sumY / n) ** 2, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { slope, intercept, r2 }
}
