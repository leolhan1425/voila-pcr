import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const SEVERITY_STYLES = {
  critical: {
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50 dark:bg-red-900/15',
    iconColor: 'text-red-600 dark:text-red-400',
    label: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  warning: {
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-900/15',
    iconColor: 'text-amber-600 dark:text-amber-400',
    label: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  caution: {
    border: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-900/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
    label: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
}

export default function DiagnosticCard({ issue }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(false)

  const style = SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.caution

  return (
    <div className={`rounded-lg border-l-4 ${style.border} ${style.bg} overflow-hidden`}>
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left hover:opacity-90 transition-opacity"
      >
        <span className={`mt-0.5 shrink-0 ${style.iconColor}`}>{style.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
              {issue.title}
            </h4>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${style.label}`}>
              {t(`qc.severity.${issue.severity}`, issue.severity)}
            </span>
          </div>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
            {issue.summary}
          </p>
        </div>
        <svg
          className={`w-4 h-4 mt-1 shrink-0 text-text-secondary dark:text-text-secondary-dark transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 pl-12 space-y-3">
          {/* Affected wells */}
          {issue.affectedWells && issue.affectedWells.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                {t('qc.affectedWells', 'Affected wells')}
              </p>
              <div className="flex flex-wrap gap-1">
                {issue.affectedWells.map((well) => (
                  <span
                    key={well}
                    className="text-[11px] px-1.5 py-0.5 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark font-mono"
                  >
                    {well}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Details */}
          {issue.details && issue.details.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                {t('qc.details', 'Details')}
              </p>
              <ul className="text-xs font-mono text-text-primary dark:text-text-primary-dark space-y-0.5">
                {issue.details.map((detail, i) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Explanation */}
          {issue.explanation && (
            <div>
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                {t('qc.whyMatters', 'Why this matters')}
              </p>
              <p className="text-xs text-text-primary dark:text-text-primary-dark">
                {issue.explanation}
              </p>
            </div>
          )}

          {/* Suggestions */}
          {issue.suggestions && issue.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                {t('qc.suggestions', 'Suggestions')}
              </p>
              <ul className="text-xs text-text-primary dark:text-text-primary-dark space-y-1 list-disc list-inside">
                {issue.suggestions.map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
