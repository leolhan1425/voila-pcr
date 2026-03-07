import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const TABS = ['formatRequests', 'feedback', 'usage']

function getStoredData(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export default function AdminPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState('formatRequests')
  const [formatRequests, setFormatRequests] = useState([])
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
    setFormatRequests(getStoredData('voilapcr_format_requests'))
    setFeedback(getStoredData('voilapcr_feedback'))
  }, [])

  const updateRequestStatus = (index, status) => {
    const updated = [...formatRequests]
    updated[index] = { ...updated[index], status }
    setFormatRequests(updated)
    localStorage.setItem('voilapcr_format_requests', JSON.stringify(updated))
  }

  const tabLabels = {
    formatRequests: t('admin.formatRequests', 'Format Requests'),
    feedback: t('admin.feedbackTab', 'Feedback'),
    usage: t('admin.usage', 'Usage Stats'),
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-3xl font-bold">
        {t('admin.title', 'Admin Dashboard')}
      </h1>

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
            {key === 'formatRequests' && formatRequests.length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-mono">
                {formatRequests.length}
              </span>
            )}
            {key === 'feedback' && feedback.length > 0 && (
              <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-mono">
                {feedback.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'formatRequests' && (
          <FormatRequestsTab requests={formatRequests} onStatusChange={updateRequestStatus} />
        )}
        {tab === 'feedback' && (
          <FeedbackTab items={feedback} />
        )}
        {tab === 'usage' && (
          <UsageTab />
        )}
      </div>
    </main>
  )
}

function FormatRequestsTab({ requests, onStatusChange }) {
  const { t } = useTranslation()

  if (requests.length === 0) {
    return <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('admin.noData', 'No data yet.')}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border dark:border-border-dark text-left">
            <th className="pb-2 font-medium text-text-secondary dark:text-text-secondary-dark">Date</th>
            <th className="pb-2 font-medium text-text-secondary dark:text-text-secondary-dark">Email</th>
            <th className="pb-2 font-medium text-text-secondary dark:text-text-secondary-dark">Instrument</th>
            <th className="pb-2 font-medium text-text-secondary dark:text-text-secondary-dark">Notes</th>
            <th className="pb-2 font-medium text-text-secondary dark:text-text-secondary-dark">Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, i) => (
            <tr key={i} className="border-b border-border/50 dark:border-border-dark/50">
              <td className="py-2 font-mono text-xs text-text-secondary dark:text-text-secondary-dark">
                {req.date ? new Date(req.date).toLocaleDateString() : '-'}
              </td>
              <td className="py-2 font-mono text-xs">{req.email}</td>
              <td className="py-2 font-medium">{req.machine}</td>
              <td className="py-2 text-xs text-text-secondary dark:text-text-secondary-dark max-w-48 truncate">
                {req.notes || '-'}
              </td>
              <td className="py-2">
                <select
                  value={req.status || 'pending'}
                  onChange={(e) => onStatusChange(i, e.target.value)}
                  className={`text-xs px-2 py-1 rounded border border-border dark:border-border-dark bg-warm-bg dark:bg-warm-bg-dark ${
                    req.status === 'complete' ? 'text-green-600' : req.status === 'building' ? 'text-amber-600' : ''
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="building">Building</option>
                  <option value="complete">Done</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FeedbackTab({ items }) {
  const { t } = useTranslation()

  if (items.length === 0) {
    return <p className="text-sm text-text-secondary dark:text-text-secondary-dark">{t('admin.noData', 'No data yet.')}</p>
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="p-4 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono uppercase">
              {item.category || 'other'}
            </span>
            <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-mono">
              {item.date ? new Date(item.date).toLocaleDateString() : '-'}
            </span>
            {item.email && (
              <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-mono">
                {item.email}
              </span>
            )}
          </div>
          <p className="text-sm text-text-primary dark:text-text-primary-dark">{item.message}</p>
        </div>
      ))}
    </div>
  )
}

function UsageTab() {
  const months = []
  const now = new Date()
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `voilapcr_usage_${d.toISOString().slice(0, 7)}`
    const drKey = `voilapcr_drqpcr_${d.toISOString().slice(0, 7)}`
    months.push({
      month: d.toISOString().slice(0, 7),
      analyses: parseInt(localStorage.getItem(key) || '0', 10),
      drqpcr: parseInt(localStorage.getItem(drKey) || '0', 10),
    })
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-3">
        Monthly Usage (localStorage)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border dark:border-border-dark text-left">
              <th className="pb-2 font-medium text-text-secondary dark:text-text-secondary-dark">Month</th>
              <th className="pb-2 font-medium text-text-secondary dark:text-text-secondary-dark">Analyses</th>
              <th className="pb-2 font-medium text-text-secondary dark:text-text-secondary-dark">Dr. qPCR Queries</th>
            </tr>
          </thead>
          <tbody>
            {months.map((m) => (
              <tr key={m.month} className="border-b border-border/50 dark:border-border-dark/50">
                <td className="py-2 font-mono text-xs">{m.month}</td>
                <td className="py-2 font-mono">{m.analyses}</td>
                <td className="py-2 font-mono">{m.drqpcr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-text-secondary dark:text-text-secondary-dark">
        Full usage analytics will be available when Supabase is connected.
      </p>
    </div>
  )
}
