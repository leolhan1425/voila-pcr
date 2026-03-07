import { autoClassifySamples } from '../../analysis/qc'
import { mean } from '../../analysis/statistics'

/**
 * Check NTC (no-template control) wells for contamination.
 *
 * Critical if NTC Ct is within 5 cycles of sample Ct for that target.
 * Warning if NTC amplifies but is >5 cycles away (likely primer dimers).
 *
 * @param {import('../../parsers/types').ParsedData} parsedData
 * @returns {{ issues: import('../types').DiagnosticIssue[], passes: import('../types').DiagnosticPass[] }}
 */
export default function ntcCheck(parsedData) {
  const issues = []
  const passes = []
  const roles = autoClassifySamples(parsedData.samples)

  const ntcWells = parsedData.wells.filter((w) => roles[w.sample] === 'ntc')
  if (ntcWells.length === 0) {
    return { issues, passes }
  }

  // Group by target
  const byTarget = new Map()
  for (const w of parsedData.wells) {
    if (!byTarget.has(w.target)) byTarget.set(w.target, [])
    byTarget.get(w.target).push(w)
  }

  let allClean = true

  for (const [target, wells] of byTarget) {
    const ntcForTarget = wells.filter((w) => roles[w.sample] === 'ntc')
    if (ntcForTarget.length === 0) continue

    const contaminatedNtc = ntcForTarget.filter((w) => w.ct != null)
    if (contaminatedNtc.length === 0) continue

    allClean = false

    const experimentalWells = wells.filter(
      (w) => roles[w.sample] === 'experimental' && w.ct != null
    )
    const sampleMeanCt =
      experimentalWells.length > 0
        ? mean(experimentalWells.map((w) => w.ct))
        : null

    const ntcMinCt = Math.min(...contaminatedNtc.map((w) => w.ct))
    const deltaCt = sampleMeanCt != null ? ntcMinCt - sampleMeanCt : null

    const affectedWells = contaminatedNtc.map((w) => w.well)
    const details = contaminatedNtc.map(
      (w) => `${w.well} (${w.sample}, ${target}): Ct ${w.ct.toFixed(1)}`
    )

    if (deltaCt != null && deltaCt < 5) {
      issues.push({
        id: 'ntc-contamination',
        severity: 'critical',
        title: `NTC contamination in ${target}`,
        summary: `NTC Ct (${ntcMinCt.toFixed(1)}) is only ${deltaCt.toFixed(1)} cycles from sample mean (${sampleMeanCt.toFixed(1)}).`,
        details,
        explanation:
          'NTC wells should show no amplification. Signal this close to sample Ct indicates reagent or template contamination that invalidates quantification.',
        suggestions: [
          'Prepare fresh reagent master mix with new aliquots',
          'Use filter tips and dedicated pipettes for template addition',
          'Clean the workspace and repeat the experiment',
        ],
        affectedWells,
      })
    } else {
      issues.push({
        id: 'ntc-primer-dimers',
        severity: 'warning',
        title: `NTC amplification in ${target} (likely primer dimers)`,
        summary: `NTC wells show late amplification (Ct ${ntcMinCt.toFixed(1)})${deltaCt != null ? `, ${deltaCt.toFixed(1)} cycles from samples` : ''}.`,
        details,
        explanation:
          'Late NTC amplification is commonly caused by primer dimers rather than contamination, but should still be noted.',
        suggestions: [
          'Check melt curve to confirm primer dimers vs. true amplification',
          'Consider optimizing primer concentration or annealing temperature',
        ],
        affectedWells,
      })
    }
  }

  if (allClean) {
    passes.push({
      title: 'NTC wells clean',
      detail: `All ${ntcWells.length} NTC well(s) show no amplification.`,
    })
  }

  return { issues, passes }
}
