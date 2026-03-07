import ntcCheck from './checks/ntcCheck'
import replicateScatter from './checks/replicateScatter'
import referenceStability from './checks/referenceStability'
import lateCt from './checks/lateCt'
import undeterminedWells from './checks/undeterminedWells'
import extremeFoldChange from './checks/extremeFoldChange'
import efficiencyCheck from './checks/efficiencyCheck'
import identicalCt from './checks/identicalCt'

/**
 * Run all QC diagnostics and produce a unified report.
 *
 * @param {import('../parsers/types').ParsedData} parsedData
 * @param {{ referenceGene: string, controlGroup: string, method: string }} analysisConfig
 * @param {{ rows: object[], summary: object, statistics: object }|null} analysisResults
 * @returns {import('./types').DiagnosticReport}
 */
export function runDiagnostics(parsedData, analysisConfig, analysisResults) {
  const checks = [
    ntcCheck,
    replicateScatter,
    referenceStability,
    lateCt,
    undeterminedWells,
    extremeFoldChange,
    efficiencyCheck,
    identicalCt,
  ]

  const issues = []
  const passes = []

  for (const check of checks) {
    const result = check(parsedData, analysisConfig, analysisResults)
    issues.push(...result.issues)
    passes.push(...result.passes)
  }

  const hasCritical = issues.some((i) => i.severity === 'critical')
  const hasWarning = issues.some((i) => i.severity === 'warning')
  const score = hasCritical ? 'red' : hasWarning ? 'yellow' : 'green'

  return { score, issueCount: issues.length, issues, passes }
}
