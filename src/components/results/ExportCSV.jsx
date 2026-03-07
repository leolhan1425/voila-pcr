import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'

export default function ExportCSV() {
  const { t } = useTranslation()
  const { results } = useStore()

  const handleExport = () => {
    if (!results) return

    const headers = ['Sample', 'Target', 'Group', 'Ct', 'Ref Ct', 'dCt', 'ddCt', 'Fold Change']
    const csvRows = [headers.join(',')]

    for (const row of (results.rows || [])) {
      csvRows.push([
        quoteCSV(row.sample),
        quoteCSV(row.target),
        quoteCSV(row.group),
        row.ct?.toFixed(2) ?? '',
        row.refCt?.toFixed(2) ?? '',
        row.dCt?.toFixed(3) ?? '',
        row.ddCt?.toFixed(3) ?? '',
        row.foldChange?.toFixed(3) ?? '',
      ].join(','))
    }

    // Summary section
    csvRows.push('')
    csvRows.push('--- Group Summary ---')
    csvRows.push('Target,Group,Mean Fold Change,SEM,SD,n')

    for (const [target, groups] of Object.entries(results.summary || {})) {
      for (const [group, stats] of Object.entries(groups)) {
        csvRows.push([
          quoteCSV(target),
          quoteCSV(group),
          stats.mean?.toFixed(3) ?? '',
          stats.sem?.toFixed(3) ?? '',
          stats.sd?.toFixed(3) ?? '',
          stats.n,
        ].join(','))
      }
    }

    // Statistics section
    if (results.statistics && Object.keys(results.statistics).length > 0) {
      csvRows.push('')
      csvRows.push('--- Statistical Tests ---')
      csvRows.push('Target,Comparison,Test,p-value,Significance')
      for (const [target, groups] of Object.entries(results.statistics)) {
        for (const [group, stat] of Object.entries(groups)) {
          csvRows.push([
            quoteCSV(target),
            `Control vs ${group}`,
            stat.test,
            stat.pValue?.toExponential(3) ?? '',
            stat.stars,
          ].join(','))
        }
      }
    }

    // QC section
    if (results.qcReport) {
      const qc = results.qcReport
      csvRows.push('')
      csvRows.push('--- Quality Control ---')
      csvRows.push(`Overall QC,${qc.overall}`)

      if (qc.standardCurve && Object.keys(qc.standardCurve).length > 0) {
        csvRows.push('')
        csvRows.push('Target,R2,Slope,Efficiency (%),Y-Intercept,Points')
        for (const [target, sc] of Object.entries(qc.standardCurve)) {
          csvRows.push([
            quoteCSV(target),
            sc.r2?.toFixed(4) ?? '',
            sc.slope?.toFixed(3) ?? '',
            sc.efficiency?.toFixed(1) ?? '',
            sc.intercept?.toFixed(2) ?? '',
            sc.dynamicRange,
          ].join(','))
        }
      }

      if (qc.flags && qc.flags.length > 0) {
        csvRows.push('')
        csvRows.push('QC Flags')
        for (const flag of qc.flags) {
          csvRows.push(`${flag.severity},${quoteCSV(flag.message)}`)
        }
      }
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'voilapcr-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="px-6 py-2 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
    >
      {t('results.downloadCsv')}
    </button>
  )
}

function quoteCSV(val) {
  const s = String(val ?? '')
  return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
}
