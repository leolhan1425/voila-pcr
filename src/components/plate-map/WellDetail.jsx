/**
 * Expanded detail panel shown when a well is clicked.
 * Shows all data for that well, replicates, and QC issues.
 */
export default function WellDetail({ wellId, entries, sampleRoles, qcWellMap, onClose }) {
  if (!entries || entries.length === 0) return null

  const qcInfo = qcWellMap?.[wellId]
  const sample = entries[0]?.sample
  const role = sampleRoles?.[sample]

  const roleLabel = role === 'ntc' ? 'NTC' : role === 'standard' ? 'Standard' : 'Experimental'
  const roleColor = role === 'ntc' ? 'text-amber-600' : role === 'standard' ? 'text-purple-600' : 'text-blue-600'

  return (
    <div className="mt-3 p-4 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-mono font-bold text-sm">Well {wellId}</h4>
        <button
          onClick={onClose}
          className="text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark text-xs"
        >
          Close
        </button>
      </div>

      <div className="text-xs mb-2">
        <span className="text-text-secondary dark:text-text-secondary-dark">Sample:</span>{' '}
        <span className="font-medium">{sample}</span>
        <span className={`ml-2 ${roleColor} font-medium`}>({roleLabel})</span>
      </div>

      <table className="w-full text-xs">
        <thead>
          <tr className="text-text-secondary dark:text-text-secondary-dark">
            <th className="text-left py-1 pr-3">Target</th>
            <th className="text-right py-1 pr-3">Ct</th>
            <th className="text-left py-1">Task</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((w, i) => (
            <tr key={i} className="border-t border-border/30 dark:border-border-dark/30">
              <td className="py-1 pr-3 font-mono">{w.target}</td>
              <td className="py-1 pr-3 text-right font-mono">
                {w.ct != null ? w.ct.toFixed(2) : <span className="text-red-500">Undet.</span>}
              </td>
              <td className="py-1">{w.taskType || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {qcInfo && qcInfo.issues.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border dark:border-border-dark">
          <div className="text-xs font-medium mb-1.5">QC Issues:</div>
          {qcInfo.issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 text-xs mt-1">
              <span className={`shrink-0 mt-0.5 w-2 h-2 rounded-full ${
                issue.severity === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <span>{issue.title}: {issue.summary}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
