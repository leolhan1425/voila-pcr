/**
 * Flag samples with extreme fold-change values.
 *
 * Caution if any sample has fold change > 100x.
 * Requires analysisResults from DDCt analysis.
 *
 * @param {import('../../parsers/types').ParsedData} parsedData
 * @param {object} analysisConfig
 * @param {{ rows: object[], summary: object, statistics: object }|null} analysisResults
 * @returns {{ issues: import('../types').DiagnosticIssue[], passes: import('../types').DiagnosticPass[] }}
 */
export default function extremeFoldChange(parsedData, analysisConfig, analysisResults) {
  const issues = []
  const passes = []

  if (!analysisResults?.rows) return { issues, passes }

  const extreme = analysisResults.rows.filter(
    (r) => r.foldChange != null && Math.abs(r.foldChange) > 100
  )

  if (extreme.length > 0) {
    // Find affected wells by matching sample + target back to parsed data
    const affectedWells = []
    for (const r of extreme) {
      const matching = parsedData.wells.filter(
        (w) => w.sample === r.sample && w.target === r.target
      )
      affectedWells.push(...matching.map((w) => w.well))
    }

    issues.push({
      id: 'extreme-fold-change',
      severity: 'caution',
      title: `${extreme.length} sample(s) with fold change > 100x`,
      summary:
        'Very large fold changes may indicate biological reality but should be verified.',
      details: extreme.map(
        (r) =>
          `${r.sample} / ${r.target}: ${r.foldChange.toFixed(1)}x (DDCt = ${r.ddCt.toFixed(2)})`
      ),
      explanation:
        'Fold changes above 100x correspond to DDCt differences of ~6.6 or more. While biologically possible, they can also result from low-abundance targets near the detection limit or reference gene instability.',
      suggestions: [
        'Verify with an independent method (e.g., Western blot) if critical',
        'Check reference gene stability — instability inflates fold changes',
        'Confirm affected samples have Ct values in a reliable range',
      ],
      affectedWells: [...new Set(affectedWells)],
    })
  } else {
    passes.push({
      title: 'Fold changes within expected range',
      detail: 'No samples exceed 100x fold change.',
    })
  }

  return { issues, passes }
}
