import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'

export default function ExportCSV() {
  const { t } = useTranslation()
  const { results } = useStore()

  const handleExport = () => {
    if (!results) return

    const headers = ['Sample', 'Target', 'Group', 'Ct', 'Ref Ct', 'dCt', 'ddCt', 'Fold Change']
    const csvRows = [headers.join(',')]

    for (const row of results.rows) {
      csvRows.push([
        row.sample,
        row.target,
        row.group,
        row.ct?.toFixed(2) ?? '',
        row.refCt?.toFixed(2) ?? '',
        row.dCt?.toFixed(3) ?? '',
        row.ddCt?.toFixed(3) ?? '',
        row.foldChange?.toFixed(3) ?? '',
      ].join(','))
    }

    // Add summary section
    csvRows.push('')
    csvRows.push('--- Summary ---')
    csvRows.push('Target,Group,Mean Fold Change,SEM,SD,n')

    for (const [target, groups] of Object.entries(results.summary)) {
      for (const [group, stats] of Object.entries(groups)) {
        csvRows.push([
          target,
          group,
          stats.mean?.toFixed(3) ?? '',
          stats.sem?.toFixed(3) ?? '',
          stats.sd?.toFixed(3) ?? '',
          stats.n,
        ].join(','))
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
