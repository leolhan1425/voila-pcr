import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import { formatNumber } from '../../utils/numberFormat'

export default function DataTable() {
  const { t } = useTranslation()
  const { results } = useStore()

  if (!results) return null

  const columns = [
    { key: 'sample', label: t('results.sample') },
    { key: 'target', label: t('results.target') },
    { key: 'group', label: t('results.group') },
    { key: 'ct', label: t('results.ct'), format: (v) => formatNumber(v, 2) },
    { key: 'refCt', label: t('results.refCt'), format: (v) => formatNumber(v, 2) },
    { key: 'dCt', label: t('results.dCt'), format: (v) => formatNumber(v, 3) },
    { key: 'ddCt', label: t('results.ddCt'), format: (v) => formatNumber(v, 3) },
    { key: 'foldChange', label: t('results.foldChange'), format: (v) => formatNumber(v, 3) },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm font-mono">
        <thead>
          <tr className="border-b border-border dark:border-border-dark">
            {columns.map((col) => (
              <th key={col.key} className="text-left px-3 py-2 font-medium text-text-secondary dark:text-text-secondary-dark">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {results.rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50 dark:border-border-dark/50 hover:bg-surface dark:hover:bg-surface-dark">
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2">
                  {col.format ? col.format(row[col.key]) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
