import { autoClassifySamples } from '../../analysis/qc'
import { mean } from '../../analysis/statistics'

/**
 * Check PCR efficiency from standard curve data.
 *
 * Only runs if wells with taskType "STANDARD" are present.
 * Warning if efficiency < 90% or > 110%.
 * Warning if R² < 0.98.
 *
 * @param {import('../../parsers/types').ParsedData} parsedData
 * @returns {{ issues: import('../types').DiagnosticIssue[], passes: import('../types').DiagnosticPass[] }}
 */
export default function efficiencyCheck(parsedData) {
  const issues = []
  const passes = []

  const roles = autoClassifySamples(parsedData.samples)

  // Find standard wells by taskType or by auto-classification
  const stdWells = parsedData.wells.filter(
    (w) =>
      w.taskType === 'STANDARD' ||
      w.taskType === 'Standard' ||
      roles[w.sample] === 'standard'
  )

  if (stdWells.length === 0) return { issues, passes }

  // Group standards by target
  const byTarget = new Map()
  for (const w of stdWells) {
    if (!byTarget.has(w.target)) byTarget.set(w.target, [])
    byTarget.get(w.target).push(w)
  }

  for (const [target, wells] of byTarget) {
    // Group by sample name to get dilution points
    const bySample = new Map()
    for (const w of wells) {
      if (!bySample.has(w.sample)) bySample.set(w.sample, [])
      bySample.get(w.sample).push(w)
    }

    // Sort by sample name (assumes numeric suffix = dilution order)
    const sortedNames = [...bySample.keys()].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })

    // Build points: mean Ct per standard, assigned log concentration
    const dilutionFactor = 10
    const points = []
    for (let i = 0; i < sortedNames.length; i++) {
      const name = sortedNames[i]
      const sampleWells = bySample.get(name)
      const validCts = sampleWells.filter((w) => w.ct != null).map((w) => w.ct)
      if (validCts.length > 0) {
        points.push({
          logConc: -i * Math.log10(dilutionFactor),
          meanCt: mean(validCts),
        })
      }
    }

    if (points.length < 2) continue

    const { slope, r2 } = linearRegression(
      points.map((p) => p.logConc),
      points.map((p) => p.meanCt)
    )

    const efficiency = (Math.pow(10, -1 / slope) - 1) * 100
    const affectedWells = wells.map((w) => w.well)
    const curveIssues = []

    if (efficiency < 90 || efficiency > 110) {
      curveIssues.push({
        id: 'efficiency-out-of-range',
        severity: 'warning',
        title: `${target} PCR efficiency out of range (${efficiency.toFixed(1)}%)`,
        summary: `Efficiency should be 90–110%. Current: ${efficiency.toFixed(1)}%.`,
        details: [
          `Slope: ${slope.toFixed(3)}`,
          `Efficiency: ${efficiency.toFixed(1)}%`,
          `R²: ${r2.toFixed(4)}`,
          `Standard points: ${points.length}`,
        ],
        explanation:
          'PCR efficiency outside 90–110% means amplification is not doubling each cycle. This biases DDCt fold-change calculations.',
        suggestions: [
          'Optimize primer concentration and annealing temperature',
          'Check for inhibitors in the template preparation',
          'Redesign primers if efficiency is consistently poor',
        ],
        affectedWells,
      })
    }

    if (r2 < 0.98) {
      curveIssues.push({
        id: 'standard-curve-poor-fit',
        severity: 'warning',
        title: `${target} standard curve has poor linearity (R² = ${r2.toFixed(4)})`,
        summary: `R² should be >= 0.98. Current: ${r2.toFixed(4)}.`,
        details: [
          `R²: ${r2.toFixed(4)}`,
          `Slope: ${slope.toFixed(3)}`,
          `Standard points: ${points.length}`,
        ],
        explanation:
          'A low R² indicates inconsistent dilution preparation or pipetting errors in the standard curve, making the efficiency calculation unreliable.',
        suggestions: [
          'Re-prepare serial dilutions with careful technique',
          'Ensure standards span at least 4–5 log orders',
          'Check for outlier standard points and exclude if justified',
        ],
        affectedWells,
      })
    }

    if (curveIssues.length > 0) {
      issues.push(...curveIssues)
    } else {
      passes.push({
        title: `${target} standard curve passes QC`,
        detail: `Efficiency = ${efficiency.toFixed(1)}%, R² = ${r2.toFixed(4)}.`,
      })
    }
  }

  return { issues, passes }
}

function linearRegression(x, y) {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0)
  const sumX2 = x.reduce((a, xi) => a + xi * xi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const ssRes = y.reduce(
    (sum, yi, i) => sum + (yi - (slope * x[i] + intercept)) ** 2,
    0
  )
  const ssTot = y.reduce((sum, yi) => sum + (yi - sumY / n) ** 2, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { slope, intercept, r2 }
}
