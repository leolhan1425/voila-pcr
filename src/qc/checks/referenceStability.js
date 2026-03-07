import { autoClassifySamples } from '../../analysis/qc'

/**
 * Check reference (housekeeping) gene stability across samples.
 *
 * Critical if Ct range > 2.0 across non-NTC samples.
 * Warning if range > 1.0.
 *
 * @param {import('../../parsers/types').ParsedData} parsedData
 * @param {{ referenceGene: string }} analysisConfig
 * @returns {{ issues: import('../types').DiagnosticIssue[], passes: import('../types').DiagnosticPass[] }}
 */
export default function referenceStability(parsedData, analysisConfig) {
  const issues = []
  const passes = []

  const { referenceGene } = analysisConfig
  if (!referenceGene) return { issues, passes }

  const roles = autoClassifySamples(parsedData.samples)

  const refWells = parsedData.wells.filter(
    (w) =>
      w.target === referenceGene &&
      roles[w.sample] !== 'ntc' &&
      w.ct != null
  )

  if (refWells.length < 2) return { issues, passes }

  const cts = refWells.map((w) => w.ct)
  const minCt = Math.min(...cts)
  const maxCt = Math.max(...cts)
  const range = maxCt - minCt

  const affectedWells = refWells.map((w) => w.well)
  const minWell = refWells.find((w) => w.ct === minCt)
  const maxWell = refWells.find((w) => w.ct === maxCt)

  if (range > 2.0) {
    issues.push({
      id: 'reference-instability',
      severity: 'critical',
      title: `Reference gene ${referenceGene} is unstable`,
      summary: `Ct range of ${range.toFixed(2)} across samples (${minCt.toFixed(1)}–${maxCt.toFixed(1)}). Maximum acceptable range is 2.0.`,
      details: [
        `Lowest Ct: ${minWell.well} (${minWell.sample}) = ${minCt.toFixed(2)}`,
        `Highest Ct: ${maxWell.well} (${maxWell.sample}) = ${maxCt.toFixed(2)}`,
        `Range: ${range.toFixed(2)} cycles`,
      ],
      explanation:
        'The DDCt method assumes the reference gene is expressed at a constant level across all samples. A range this large means fold-change calculations are unreliable.',
      suggestions: [
        'Validate with a second reference gene (e.g., ACTB, 18S)',
        'Check for unequal RNA input or degradation across samples',
        'Consider using a geometric mean of multiple reference genes',
      ],
      affectedWells,
    })
  } else if (range > 1.0) {
    issues.push({
      id: 'reference-drift',
      severity: 'warning',
      title: `Reference gene ${referenceGene} shows moderate drift`,
      summary: `Ct range of ${range.toFixed(2)} across samples (${minCt.toFixed(1)}–${maxCt.toFixed(1)}). Ideally < 1.0.`,
      details: [
        `Lowest Ct: ${minWell.well} (${minWell.sample}) = ${minCt.toFixed(2)}`,
        `Highest Ct: ${maxWell.well} (${maxWell.sample}) = ${maxCt.toFixed(2)}`,
        `Range: ${range.toFixed(2)} cycles`,
      ],
      explanation:
        'Moderate variation in the reference gene adds noise to DDCt calculations. Results are usable but less precise.',
      suggestions: [
        'Consider validating with an additional reference gene',
        'Ensure equal RNA loading across samples',
      ],
      affectedWells,
    })
  } else {
    passes.push({
      title: `Reference gene ${referenceGene} is stable`,
      detail: `Ct range = ${range.toFixed(2)} across ${refWells.length} wells (threshold: 1.0).`,
    })
  }

  return { issues, passes }
}
