import { autoClassifySamples } from '../../analysis/qc'

/**
 * Analyze undetermined (ct === null) wells in non-NTC samples.
 *
 * Performs pattern analysis to suggest likely causes:
 * - Entire row missing: multichannel pipetting miss
 * - All wells for one target: primer/probe failure
 * - Scattered: degraded template or individual reaction failures
 *
 * @param {import('../../parsers/types').ParsedData} parsedData
 * @returns {{ issues: import('../types').DiagnosticIssue[], passes: import('../types').DiagnosticPass[] }}
 */
export default function undeterminedWells(parsedData) {
  const issues = []
  const passes = []
  const roles = autoClassifySamples(parsedData.samples)

  const nonNtcWells = parsedData.wells.filter((w) => roles[w.sample] !== 'ntc')
  const undetermined = nonNtcWells.filter((w) => w.ct == null)

  if (undetermined.length === 0) {
    passes.push({
      title: 'All wells amplified',
      detail: `All ${nonNtcWells.length} non-NTC wells produced Ct values.`,
    })
    return { issues, passes }
  }

  const affectedWells = undetermined.map((w) => w.well)

  // Pattern analysis
  const pattern = analyzePattern(undetermined, parsedData)

  issues.push({
    id: 'undetermined-wells',
    severity: 'caution',
    title: `${undetermined.length} undetermined well(s)`,
    summary: pattern.summary,
    details: undetermined.map(
      (w) => `${w.well} (${w.sample}, ${w.target}): no Ct`
    ),
    explanation: pattern.explanation,
    suggestions: pattern.suggestions,
    affectedWells,
  })

  return { issues, passes }
}

/**
 * Analyze the spatial and logical pattern of undetermined wells.
 */
function analyzePattern(undetermined, parsedData) {
  // Check if all undetermined wells share the same target
  const targets = new Set(undetermined.map((w) => w.target))
  if (targets.size === 1) {
    const target = [...targets][0]
    const allWellsForTarget = parsedData.wells.filter(
      (w) => w.target === target
    )
    const allUndetermined = allWellsForTarget.every((w) => w.ct == null)

    if (allUndetermined) {
      return {
        summary: `All wells for target ${target} failed to amplify.`,
        explanation:
          'Complete failure of a single target while others amplify normally indicates a primer or probe problem for this assay.',
        suggestions: [
          `Check primer/probe stocks for ${target} — possible degradation or incorrect dilution`,
          'Verify the assay works with a known positive control',
          'Check for target sequence mismatches if using a new lot',
        ],
      }
    }
  }

  // Check if undetermined wells share the same row (plate layout pattern)
  const rows = undetermined
    .map((w) => w.well.match(/^([A-H])/i)?.[1])
    .filter(Boolean)
  const rowCounts = new Map()
  for (const r of rows) {
    rowCounts.set(r, (rowCounts.get(r) || 0) + 1)
  }

  // If a single row accounts for most undetermined wells, suggest multichannel issue
  for (const [row, count] of rowCounts) {
    if (count >= 3 && count >= undetermined.length * 0.6) {
      return {
        summary: `${undetermined.length} undetermined wells concentrated in row ${row}.`,
        explanation:
          'A cluster of failures in one row suggests a pipetting miss, likely with a multichannel pipette.',
        suggestions: [
          'Check multichannel pipette tip seating and calibration',
          'Verify all channels are aspirating and dispensing evenly',
          'Re-run affected samples',
        ],
      }
    }
  }

  // Default: scattered pattern
  return {
    summary: `${undetermined.length} undetermined wells scattered across the plate.`,
    explanation:
      'Scattered failures without a clear pattern may indicate degraded template, inconsistent reaction setup, or individual well failures.',
    suggestions: [
      'Check RNA/DNA quality and quantity for affected samples',
      'Ensure thorough mixing of master mix before dispensing',
      'Inspect plate seal for affected well positions',
    ],
  }
}
