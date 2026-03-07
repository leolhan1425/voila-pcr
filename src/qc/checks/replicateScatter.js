import { autoClassifySamples } from '../../analysis/qc'
import { mean, stdDev } from '../../analysis/statistics'

/**
 * Check technical replicate consistency.
 *
 * Warning if any replicate group has SD > 0.5 Ct.
 * Identifies the specific outlier well within the group.
 *
 * @param {import('../../parsers/types').ParsedData} parsedData
 * @returns {{ issues: import('../types').DiagnosticIssue[], passes: import('../types').DiagnosticPass[] }}
 */
export default function replicateScatter(parsedData) {
  const issues = []
  const passes = []
  const roles = autoClassifySamples(parsedData.samples)

  // Group wells by sample + target
  const groups = new Map()
  for (const w of parsedData.wells) {
    if (roles[w.sample] === 'ntc') continue
    if (w.ct == null) continue
    const key = `${w.sample}||${w.target}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(w)
  }

  let hasHighScatter = false

  for (const [, wells] of groups) {
    if (wells.length < 2) continue

    const cts = wells.map((w) => w.ct)
    const sd = stdDev(cts)

    if (sd > 0.5) {
      hasHighScatter = true

      const m = mean(cts)
      // Find the well farthest from the mean as the outlier
      let outlierWell = wells[0]
      let maxDev = 0
      for (const w of wells) {
        const dev = Math.abs(w.ct - m)
        if (dev > maxDev) {
          maxDev = dev
          outlierWell = w
        }
      }

      const { sample, target } = wells[0]
      const affectedWells = wells.map((w) => w.well)

      issues.push({
        id: 'replicate-scatter',
        severity: 'warning',
        title: `High replicate variability: ${sample} / ${target}`,
        summary: `Replicate SD = ${sd.toFixed(3)} (threshold: 0.5). Well ${outlierWell.well} (Ct ${outlierWell.ct.toFixed(1)}) is the likely outlier.`,
        details: wells.map(
          (w) =>
            `${w.well}: Ct ${w.ct.toFixed(2)}${w === outlierWell ? ' (outlier)' : ''}`
        ),
        explanation:
          'Technical replicates should agree within ~0.5 Ct. Higher variability suggests pipetting error or well-specific issues, reducing confidence in the averaged value.',
        suggestions: [
          `Consider excluding well ${outlierWell.well} from analysis`,
          'Verify consistent pipetting technique across replicates',
          'Ensure thorough mixing of template before aliquoting',
        ],
        affectedWells,
      })
    }
  }

  if (!hasHighScatter) {
    passes.push({
      title: 'Replicate consistency',
      detail: 'All technical replicate groups have SD < 0.5 Ct.',
    })
  }

  return { issues, passes }
}
