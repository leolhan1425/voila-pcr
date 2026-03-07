import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import useTier from '../../hooks/useTier'
import { getTrialSessionsUsed, getTrialSessionsMax } from '../../api/usage'
import DataTable from './DataTable'
import BarChart from './BarChart'
import ExportCSV from './ExportCSV'
import ExportGraph from './ExportGraph'
import ExportPrism from './ExportPrism'
import GraphCustomizer from './GraphCustomizer'
import QCFreePreview from '../qc/QCFreePreview'
import QCFullReport from '../qc/QCFullReport'
import QCRunner from '../qc/QCRunner'

const TABS = ['results', 'figures', 'qc']

export default function ResultsPanel() {
  const { t } = useTranslation()
  const store = useStore()
  const { results, reset, setGraphSettings } = store
  const { canSeeFullQC, isPlus, inTrialSession, trialRemaining } = useTier()
  const [tab, setTab] = useState('results')
  const [showShareBanner, setShowShareBanner] = useState(true)

  if (!results) return null

  const tabLabels = {
    results: t('results.dataTable', 'Results'),
    figures: t('results.chart', 'Figures'),
    qc: t('results.qcReport', 'QC Report'),
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/ref/share`
    navigator.clipboard.writeText(link)
  }

  return (
    <div>
      <QCRunner />

      {/* Trial session banner */}
      {inTrialSession && !isPlus && (
        <div className="mb-4 px-4 py-2 rounded-lg bg-accent/10 border border-accent/20 flex items-center gap-2">
          <span className="text-sm">&#10024;</span>
          <span className="text-sm text-text-primary dark:text-text-primary-dark">
            <span className="font-medium">Plus Trial</span> ({trialRemaining} of {getTrialSessionsMax()} remaining) — You're experiencing the full VoilaPCR Plus
          </span>
        </div>
      )}

      {/* Post-trial conversion prompt */}
      {!isPlus && !inTrialSession && getTrialSessionsUsed() >= getTrialSessionsMax() && (
        <div className="mb-4 p-4 rounded-lg border border-accent/30 bg-accent/5">
          <p className="text-sm text-text-primary dark:text-text-primary-dark">
            You've used your {getTrialSessionsMax()} Plus trials. Your analysis is complete — here are your results. To unlock the full QC report, Dr. qPCR, and publication-quality exports, upgrade to Plus for $99/year.
          </p>
          <button
            onClick={() => store.setShowPricing(true)}
            className="mt-3 px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Upgrade to Plus
          </button>
        </div>
      )}

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
        {tab === 'results' && (
          <div className="space-y-6">
            <DataTable />
            <div className="flex flex-wrap gap-3">
              <ExportCSV />
              <ExportPrism />
            </div>
          </div>
        )}
        {tab === 'figures' && (
          <div className="space-y-6">
            <BarChart />
            <GraphCustomizer
              target={Object.keys(results.summary || {})[0] || ''}
              onUpdate={(settings) => setGraphSettings(settings.target, {
                font: `${settings.fontFamily}, sans-serif`,
                fontSize: settings.fontSize,
                width: settings.width,
                height: settings.height,
                yScale: settings.yScale,
                showBrackets: settings.showSignificance,
                xLabel: settings.xAxisLabel,
                yLabel: settings.yAxisLabel,
                colors: Object.values(settings.groupColors || {}),
              })}
            />
            <div className="flex flex-wrap gap-3">
              <ExportGraph />
            </div>
          </div>
        )}
        {tab === 'qc' && (
          canSeeFullQC ? <QCFullReport /> : <QCFreePreview />
        )}
      </div>

      {/* Start over */}
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={reset}
          className="px-6 py-2 text-sm text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark border border-border dark:border-border-dark rounded-lg transition-colors"
        >
          {t('results.startOver')}
        </button>
      </div>

      {/* Share prompt — shown once after first results */}
      {showShareBanner && (
        <div className="mt-6 p-4 rounded-lg border border-accent/20 bg-accent/5 flex items-center justify-between gap-4">
          <p className="text-sm text-text-primary dark:text-text-primary-dark">
            {t('referral.sharePrompt', 'Love your results? Share VoilaPCR with a colleague — earn 3 months of Pro when they subscribe.')}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={copyReferralLink}
              className="px-3 py-1.5 text-xs bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              {t('referral.copy', 'Copy link')}
            </button>
            <button
              onClick={() => setShowShareBanner(false)}
              className="px-2 py-1.5 text-xs text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
            >
              {t('referral.dismiss', 'Dismiss')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
