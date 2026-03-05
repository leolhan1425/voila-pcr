import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import DataTable from './DataTable'
import BarChart from './BarChart'
import ExportCSV from './ExportCSV'
import ExportGraph from './ExportGraph'

export default function ResultsPanel() {
  const { t } = useTranslation()
  const { results, reset } = useStore()
  const [tab, setTab] = useState('chart')

  if (!results) return null

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold">
        {t('results.title')}
      </h2>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border dark:border-border-dark">
        {['chart', 'dataTable'].map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
            }`}
          >
            {t(`results.${key}`)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === 'chart' && <BarChart />}
        {tab === 'dataTable' && <DataTable />}
      </div>

      {/* Export buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        <ExportCSV />
        <ExportGraph />
        <button
          onClick={reset}
          className="px-6 py-2 text-sm text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark border border-border dark:border-border-dark rounded-lg transition-colors"
        >
          {t('results.startOver')}
        </button>
      </div>
    </div>
  )
}
