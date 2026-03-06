import { mean, stdDev } from './statistics'

/**
 * Sample roles: 'experimental' | 'ntc' | 'standard'
 *
 * Auto-detect sample roles from sample names.
 * @param {string[]} samples
 * @returns {Record<string, string>}
 */
export function autoClassifySamples(samples) {
  const roles = {}
  for (const s of samples) {
    const lower = s.toLowerCase().trim()
    if (/^ntc$|no.?template|^neg(ative)?\.?ctrl?$|^neg$|^nc$|^water$/i.test(lower)) {
      roles[s] = 'ntc'
    } else if (/^(c|s|std|standard|dil)\s*\d+$/i.test(lower) || /^1[:/]\d+$/i.test(lower)) {
      roles[s] = 'standard'
    } else {
      roles[s] = 'experimental'
    }
  }
  return roles
}

/**
 * Run comprehensive QC analysis.
 *
 * @param {import('../parsers/types').ParsedData} data
 * @param {Record<string, string>} sampleRoles - sample name → role
 * @param {{ outlierThreshold: number, dilutionFactor: number }} opts
 * @returns {QCReport}
 */
export function runQC(data, sampleRoles, opts = {}) {
  const { outlierThreshold = 0.5, dilutionFactor = 10 } = opts

  const report = {
    overall: 'pass', // 'pass' | 'warning' | 'fail'
    targets: {},     // per-target QC
    ntc: {},         // NTC assessment per target
    standardCurve: {},// standard curve metrics per target
    replicates: {},  // replicate QC per sample-target
    flags: [],       // summary flags
  }

  // Group wells by target
  const byTarget = new Map()
  for (const w of data.wells) {
    if (!byTarget.has(w.target)) byTarget.set(w.target, [])
    byTarget.get(w.target).push(w)
  }

  for (const [target, wells] of byTarget) {
    // --- Per-target summary ---
    const experimental = wells.filter((w) => sampleRoles[w.sample] === 'experimental')
    const ntcWells = wells.filter((w) => sampleRoles[w.sample] === 'ntc')
    const stdWells = wells.filter((w) => sampleRoles[w.sample] === 'standard')

    const ampWells = wells.filter((w) => w.ct != null)
    const expAmpWells = experimental.filter((w) => w.ct != null)

    report.targets[target] = {
      totalWells: wells.length,
      amplified: ampWells.length,
      amplificationRate: wells.length > 0 ? ampWells.length / wells.length : 0,
      experimentalWells: experimental.length,
      experimentalAmplified: expAmpWells.length,
      meanCt: expAmpWells.length > 0 ? mean(expAmpWells.map((w) => w.ct)) : null,
      ctRange: expAmpWells.length > 0
        ? [Math.min(...expAmpWells.map((w) => w.ct)), Math.max(...expAmpWells.map((w) => w.ct))]
        : null,
      status: 'pass',
    }

    // Flag targets with no experimental amplification
    if (expAmpWells.length === 0 && experimental.length > 0) {
      report.targets[target].status = 'fail'
      report.flags.push({
        severity: 'error',
        target,
        message: `${target}: No amplification detected in any experimental sample. Primer failure likely.`,
      })
    } else if (experimental.length > 0 && expAmpWells.length / experimental.length < 0.5) {
      report.targets[target].status = 'warning'
      report.flags.push({
        severity: 'warning',
        target,
        message: `${target}: Only ${expAmpWells.length}/${experimental.length} experimental wells amplified.`,
      })
    }

    // Flag late Ct (> 35) in experimental samples
    const lateCt = expAmpWells.filter((w) => w.ct > 35)
    if (lateCt.length > 0) {
      report.flags.push({
        severity: 'warning',
        target,
        message: `${target}: ${lateCt.length} experimental well(s) with Ct > 35 — low confidence quantification.`,
      })
    }

    // --- NTC assessment ---
    if (ntcWells.length > 0) {
      const ntcAmplified = ntcWells.filter((w) => w.ct != null)
      const ntcClean = ntcAmplified.length === 0

      const minExpCt = expAmpWells.length > 0 ? Math.min(...expAmpWells.map((w) => w.ct)) : null
      const ntcMinCt = ntcAmplified.length > 0 ? Math.min(...ntcAmplified.map((w) => w.ct)) : null
      const deltaCt = (ntcMinCt != null && minExpCt != null) ? ntcMinCt - minExpCt : null

      let ntcStatus = 'pass'
      if (!ntcClean) {
        if (deltaCt != null && deltaCt < 5) {
          ntcStatus = 'fail'
          report.flags.push({
            severity: 'error',
            target,
            message: `${target}: NTC contamination — NTC Ct (${ntcMinCt.toFixed(1)}) is within ${deltaCt.toFixed(1)} cycles of samples. Minimum 5-cycle separation required.`,
          })
        } else if (ntcAmplified.some((w) => w.ct < 38)) {
          ntcStatus = 'warning'
          report.flags.push({
            severity: 'warning',
            target,
            message: `${target}: NTC amplification detected (Ct ${ntcMinCt.toFixed(1)}), but >5 cycles from experimental samples.`,
          })
        }
      }

      report.ntc[target] = {
        totalWells: ntcWells.length,
        amplified: ntcAmplified.length,
        clean: ntcClean,
        minCt: ntcMinCt,
        deltaCt,
        status: ntcStatus,
      }
    }

    // --- Standard curve assessment ---
    if (stdWells.length > 0) {
      const stdBySample = new Map()
      for (const w of stdWells) {
        if (!stdBySample.has(w.sample)) stdBySample.set(w.sample, [])
        stdBySample.get(w.sample).push(w)
      }

      // Sort standards by name (C1, C2, C3... assumes alphabetical = dilution order)
      const sortedStdNames = [...stdBySample.keys()].sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, '')) || 0
        const numB = parseInt(b.replace(/\D/g, '')) || 0
        return numA - numB
      })

      // Calculate mean Ct per standard point
      const stdPoints = []
      for (let i = 0; i < sortedStdNames.length; i++) {
        const name = sortedStdNames[i]
        const wells = stdBySample.get(name)
        const validCts = wells.filter((w) => w.ct != null).map((w) => w.ct)
        if (validCts.length > 0) {
          // Assign relative concentration: C1 = highest conc, each subsequent = 1/dilutionFactor
          const relConc = Math.pow(dilutionFactor, -(i))
          stdPoints.push({
            name,
            meanCt: mean(validCts),
            sd: stdDev(validCts),
            n: validCts.length,
            totalWells: wells.length,
            logConc: Math.log10(relConc),
          })
        }
      }

      if (stdPoints.length >= 2) {
        // Linear regression: Ct = slope * log(conc) + intercept
        const { slope, intercept, r2 } = linearRegression(
          stdPoints.map((p) => p.logConc),
          stdPoints.map((p) => p.meanCt)
        )

        // PCR efficiency: E = 10^(-1/slope) - 1
        const efficiency = (Math.pow(10, -1 / slope) - 1) * 100

        let curveStatus = 'pass'
        const curveFlags = []

        if (r2 < 0.98) {
          curveStatus = 'fail'
          curveFlags.push(`R² = ${r2.toFixed(4)} (< 0.98 — poor linearity)`)
        } else if (r2 < 0.99) {
          curveStatus = curveStatus === 'fail' ? 'fail' : 'warning'
          curveFlags.push(`R² = ${r2.toFixed(4)} (acceptable, < 0.99)`)
        }

        if (efficiency < 90 || efficiency > 110) {
          curveStatus = 'fail'
          curveFlags.push(`Efficiency = ${efficiency.toFixed(1)}% (outside 90–110% acceptable range)`)
        } else if (efficiency < 95 || efficiency > 105) {
          curveStatus = curveStatus === 'fail' ? 'fail' : 'warning'
          curveFlags.push(`Efficiency = ${efficiency.toFixed(1)}% (outside 95–105% optimal range)`)
        }

        if (curveFlags.length > 0) {
          report.flags.push({
            severity: curveStatus === 'fail' ? 'error' : 'warning',
            target,
            message: `${target} standard curve: ${curveFlags.join('; ')}`,
          })
        }

        report.standardCurve[target] = {
          points: stdPoints,
          slope,
          intercept,
          r2,
          efficiency,
          dynamicRange: stdPoints.length,
          status: curveStatus,
        }
      } else {
        report.standardCurve[target] = {
          points: stdPoints,
          slope: null,
          intercept: null,
          r2: null,
          efficiency: null,
          dynamicRange: stdPoints.length,
          status: stdPoints.length === 0 ? 'fail' : 'warning',
        }
        if (stdPoints.length < 2) {
          report.flags.push({
            severity: 'warning',
            target,
            message: `${target}: Insufficient standard curve points with amplification (${stdPoints.length}). Need ≥ 3 for reliable efficiency calculation.`,
          })
        }
      }
    }

    // --- Technical replicate QC ---
    const bySampleTarget = new Map()
    for (const w of wells) {
      if (sampleRoles[w.sample] !== 'experimental') continue
      if (w.ct == null) continue
      const key = `${w.sample}||${w.target}`
      if (!bySampleTarget.has(key)) bySampleTarget.set(key, { sample: w.sample, target: w.target, cts: [] })
      bySampleTarget.get(key).cts.push(w.ct)
    }

    for (const [key, group] of bySampleTarget) {
      if (group.cts.length < 2) continue
      const sd = stdDev(group.cts)
      let repStatus = 'pass'
      if (sd >= 0.5) {
        repStatus = 'fail'
      } else if (sd >= 0.3) {
        repStatus = 'warning'
      }

      if (!report.replicates[target]) report.replicates[target] = []
      report.replicates[target].push({
        sample: group.sample,
        cts: group.cts,
        mean: mean(group.cts),
        sd,
        n: group.cts.length,
        status: repStatus,
      })

      if (repStatus === 'fail') {
        report.flags.push({
          severity: 'warning',
          target,
          message: `${target}/${group.sample}: High replicate variability (SD = ${sd.toFixed(3)}, n = ${group.cts.length}). Consider excluding outlier wells.`,
        })
      }
    }
  }

  // --- Overall assessment ---
  const hasErrors = report.flags.some((f) => f.severity === 'error')
  const hasWarnings = report.flags.some((f) => f.severity === 'warning')
  report.overall = hasErrors ? 'fail' : hasWarnings ? 'warning' : 'pass'

  return report
}

/**
 * Simple linear regression: y = slope * x + intercept
 */
function linearRegression(x, y) {
  const n = x.length
  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((a, xi, i) => a + xi * y[i], 0)
  const sumX2 = x.reduce((a, xi) => a + xi * xi, 0)
  const sumY2 = y.reduce((a, yi) => a + yi * yi, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // R²
  const ssRes = y.reduce((sum, yi, i) => sum + (yi - (slope * x[i] + intercept)) ** 2, 0)
  const ssTot = y.reduce((sum, yi) => sum + (yi - sumY / n) ** 2, 0)
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot

  return { slope, intercept, r2 }
}
