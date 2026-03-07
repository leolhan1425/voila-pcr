import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import DiagnosticCard from './DiagnosticCard'

const SEVERITY_ORDER = { critical: 0, warning: 1, caution: 2 }

const SCORE_STYLES = {
  green: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  yellow: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
  red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
}

/**
 * Free-tier QC view: summary badge + first diagnostic card expanded + rest blurred.
 */
export default function QCFreePreview() {
  const { t } = useTranslation()
  const { diagnosticReport, setShowPricing } = useStore()

  if (!diagnosticReport) return null

  const { score, issueCount, issues, passes } = diagnosticReport

  const sortedIssues = [...issues].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3)
  )

  return (
    <div className="space-y-4">
      {/* Summary badge */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono ${SCORE_STYLES[score]}`}>
        {score === 'green' && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {score === 'yellow' && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {score === 'red' && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="font-medium">
          {issueCount === 0
            ? t('qc.allPassed', 'All checks passed')
            : t('qc.issuesDetected', '{{count}} issue(s) detected', { count: issueCount })}
        </span>
      </div>

      {/* First issue card — expanded */}
      {sortedIssues.length > 0 && (
        <DiagnosticCard issue={sortedIssues[0]} defaultExpanded />
      )}

      {/* Remaining cards — blurred with upgrade prompt */}
      {sortedIssues.length > 1 && (
        <div className="relative">
          <div className="filter blur-sm pointer-events-none select-none space-y-3 opacity-60">
            {sortedIssues.slice(1, 4).map((issue, i) => (
              <DiagnosticCard key={issue.id || i} issue={issue} />
            ))}
          </div>

          {/* Overlay CTA */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 shadow-lg text-center max-w-sm">
              <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                {t('qc.unlockFull', '+{{count}} more diagnostic(s)', { count: sortedIssues.length - 1 })}
              </p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
                {t('qc.unlockDescription', 'See detailed explanations, affected wells, and fix suggestions for every issue.')}
              </p>
              <button
                onClick={() => setShowPricing(true)}
                className="mt-3 px-5 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-lg transition-colors"
              >
                {t('qc.unlockCta', 'Unlock full QC report with Pro')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passed checks count (collapsed, no details) */}
      {passes.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
          <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs text-green-800 dark:text-green-300 font-mono">
            {t('qc.passedChecks', 'Passed checks ({{count}})', { count: passes.length })}
          </span>
        </div>
      )}
    </div>
  )
}
