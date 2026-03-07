import { autoClassifySamples } from '../../analysis/qc'

/**
 * Detect suspiciously identical Ct values across different conditions.
 *
 * Caution if samples from DIFFERENT groups have Ct values within 0.1
 * for the same target. This may indicate a plate layout error (e.g.,
 * same sample pipetted into multiple positions).
 *
 * @param {import('../../parsers/types').ParsedData} parsedData
 * @returns {{ issues: import('../types').DiagnosticIssue[], passes: import('../types').DiagnosticPass[] }}
 */
export default function identicalCt(parsedData) {
  const issues = []
  const passes = []
  const roles = autoClassifySamples(parsedData.samples)

  // Only consider experimental wells with Ct values
  const experimental = parsedData.wells.filter(
    (w) => roles[w.sample] === 'experimental' && w.ct != null
  )

  if (experimental.length < 2) return { issues, passes }

  // Determine group from sample name (strip trailing numeric suffix)
  function getGroup(sample) {
    return sample.replace(/[\s_-]\d+$/, '')
  }

  // Group wells by target
  const byTarget = new Map()
  for (const w of experimental) {
    if (!byTarget.has(w.target)) byTarget.set(w.target, [])
    byTarget.get(w.target).push(w)
  }

  const suspiciousPairs = []

  for (const [target, wells] of byTarget) {
    // Compare all pairs across different groups
    for (let i = 0; i < wells.length; i++) {
      for (let j = i + 1; j < wells.length; j++) {
        const a = wells[i]
        const b = wells[j]
        const groupA = getGroup(a.sample)
        const groupB = getGroup(b.sample)

        if (groupA === groupB) continue
        if (Math.abs(a.ct - b.ct) <= 0.1) {
          suspiciousPairs.push({ a, b, target })
        }
      }
    }
  }

  if (suspiciousPairs.length > 0) {
    // Deduplicate affected wells
    const affectedWells = [
      ...new Set(
        suspiciousPairs.flatMap((p) => [p.a.well, p.b.well])
      ),
    ]

    issues.push({
      id: 'identical-ct-across-groups',
      severity: 'caution',
      title: `${suspiciousPairs.length} cross-group pair(s) with near-identical Ct`,
      summary:
        'Samples from different experimental groups have Ct values within 0.1 for the same target, which may indicate a plate layout error.',
      details: suspiciousPairs.map(
        (p) =>
          `${p.a.well} (${p.a.sample}) Ct ${p.a.ct.toFixed(2)} vs ${p.b.well} (${p.b.sample}) Ct ${p.b.ct.toFixed(2)} [${p.target}]`
      ),
      explanation:
        'While it is possible for different conditions to yield similar expression levels, identical Ct values across groups can indicate the same sample was accidentally loaded in multiple positions.',
      suggestions: [
        'Double-check plate layout and sample assignments',
        'Verify that different biological replicates were used',
        'Compare against expected biological differences between groups',
      ],
      affectedWells,
    })
  } else {
    passes.push({
      title: 'No suspicious cross-group Ct duplicates',
      detail: 'Samples across different groups show distinguishable Ct values.',
    })
  }

  return { issues, passes }
}
