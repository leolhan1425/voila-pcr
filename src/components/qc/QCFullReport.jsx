import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import DiagnosticCard from './DiagnosticCard'

const SEVERITY_ORDER = { critical: 0, warning: 1, caution: 2 }

export default function QCFullReport() {
  const { t } = useTranslation()
  const { diagnosticReport } = useStore()
  const [passesExpanded, setPassesExpanded] = useState(false)

  if (!diagnosticReport) return null

  const { issues, passes, score } = diagnosticReport

  // Sort issues: critical first, then warning, then caution
  const sortedIssues = [...issues].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3)
  )

  return (
    <div className="space-y-4">
      {/* Issues */}
      {sortedIssues.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
            {t('qc.issuesHeading', 'Issues ({{count}})', { count: sortedIssues.length })}
          </h3>
          {sortedIssues.map((issue, i) => (
            <DiagnosticCard key={issue.id || i} issue={issue} />
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-mono text-green-800 dark:text-green-300">
              {t('qc.noIssues', 'No issues detected. All diagnostics passed.')}
            </p>
          </div>
        </div>
      )}

      {/* Passed checks — collapsible */}
      {passes.length > 0 && (
        <div className="border border-border dark:border-border-dark rounded-lg overflow-hidden">
          <button
            onClick={() => setPassesExpanded(!passesExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-surface dark:bg-surface-dark hover:opacity-90 transition-opacity text-left"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                {t('qc.passedChecks', 'Passed checks ({{count}})', { count: passes.length })}
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-text-secondary dark:text-text-secondary-dark transition-transform ${passesExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {passesExpanded && (
            <div className="px-4 pb-3 space-y-2 border-t border-border dark:border-border-dark">
              {passes.map((pass, i) => (
                <div key={i} className="flex items-start gap-2 pt-2">
                  <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-text-primary dark:text-text-primary-dark">
                      {pass.title}
                    </p>
                    {pass.detail && (
                      <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark font-mono">
                        {pass.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
