import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import DataTable from './DataTable'
import BarChart from './BarChart'
import ExportCSV from './ExportCSV'
import ExportGraph from './ExportGraph'
import QCSummaryBadge from '../qc/QCSummaryBadge'
import QCFullReport from '../qc/QCFullReport'
import QCRunner from '../qc/QCRunner'

const TABS = ['chart', 'dataTable', 'qc']

export default function ResultsPanel() {
  const { t } = useTranslation()
  const { results, reset, tier } = useStore()
  const [tab, setTab] = useState('chart')

  if (!results) return null

  const tabLabels = {
    chart: t('results.chart'),
    dataTable: t('results.dataTable'),
    qc: t('results.qcReport'),
  }

  return (
    <div>
      <QCRunner />

      <h2 className="font-display text-2xl sm:text-3xl font-bold">
        {t('results.title')}
      </h2>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 border-b border-border dark:border-border-dark">
        {TABS.map((key) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-accent text-accent'
                : 'border-transparent text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
            }`}
          >
            {tabLabels[key]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === 'chart' && <BarChart />}
        {tab === 'dataTable' && <DataTable />}
        {tab === 'qc' && (
          tier === 'free' ? <QCSummaryBadge /> : <QCFullReport />
        )}
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
