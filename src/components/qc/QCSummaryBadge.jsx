import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'

const SCORE_STYLES = {
  green: {
    badge: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  yellow: {
    badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  red: {
    badge: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

export default function QCSummaryBadge() {
  const { t } = useTranslation()
  const { diagnosticReport } = useStore()

  if (!diagnosticReport) return null

  const { score, issueCount } = diagnosticReport
  const style = SCORE_STYLES[score]

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono ${style.badge}`}>
      {style.icon}
      <span className="font-medium">
        {issueCount === 0
          ? t('qc.allPassed', 'All checks passed')
          : t('qc.issuesDetected', '{{count}} issue(s) detected', { count: issueCount })}
      </span>
      {issueCount > 0 && (
        <span className="ml-1 text-xs opacity-70 font-body">
          {t('qc.upgradeForDetails', 'Upgrade to Pro to see details')}
        </span>
      )}
    </div>
  )
}
