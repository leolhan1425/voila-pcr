import { autoClassifySamples } from '../../analysis/qc'

/**
 * Flag wells with late Ct values.
 *
 * Warning if Ct > 38. Caution if Ct > 35.
 *
 * @param {import('../../parsers/types').ParsedData} parsedData
 * @returns {{ issues: import('../types').DiagnosticIssue[], passes: import('../types').DiagnosticPass[] }}
 */
export default function lateCt(parsedData) {
  const issues = []
  const passes = []
  const roles = autoClassifySamples(parsedData.samples)

  const nonNtcWithCt = parsedData.wells.filter(
    (w) => roles[w.sample] !== 'ntc' && w.ct != null
  )

  const veryLate = nonNtcWithCt.filter((w) => w.ct > 38)
  const late = nonNtcWithCt.filter((w) => w.ct > 35 && w.ct <= 38)

  if (veryLate.length > 0) {
    issues.push({
      id: 'very-late-ct',
      severity: 'warning',
      title: `${veryLate.length} well(s) with Ct > 38`,
      summary:
        'Extremely late amplification is unreliable and may represent background noise rather than true signal.',
      details: veryLate.map(
        (w) => `${w.well} (${w.sample}, ${w.target}): Ct ${w.ct.toFixed(1)}`
      ),
      explanation:
        'At Ct > 38, stochastic amplification dominates. These values have very low precision and may not reflect actual template.',
      suggestions: [
        'Consider treating these wells as undetermined',
        'Increase template input if target is expected to be present',
        'Verify primer efficiency for affected targets',
      ],
      affectedWells: veryLate.map((w) => w.well),
    })
  }

  if (late.length > 0) {
    issues.push({
      id: 'late-ct',
      severity: 'caution',
      title: `${late.length} well(s) with Ct between 35 and 38`,
      summary: 'Late amplification detected. Results for these wells have reduced confidence.',
      details: late.map(
        (w) => `${w.well} (${w.sample}, ${w.target}): Ct ${w.ct.toFixed(1)}`
      ),
      explanation:
        'Ct values above 35 are near the detection limit and have higher variability. Quantification is less reliable.',
      suggestions: [
        'Interpret fold-change values for these samples with caution',
        'Consider increasing starting template concentration',
      ],
      affectedWells: late.map((w) => w.well),
    })
  }

  if (veryLate.length === 0 && late.length === 0) {
    passes.push({
      title: 'No late Ct values',
      detail: `All ${nonNtcWithCt.length} amplified wells have Ct < 35.`,
    })
  }

  return { issues, passes }
}
