/**
 * Tooltip that appears on well hover, showing well details.
 */
export default function WellTooltip({ wellId, entries, style }) {
  if (!entries || entries.length === 0) return null

  return (
    <div
      className="absolute z-50 pointer-events-none bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg shadow-lg px-3 py-2 text-xs min-w-[140px]"
      style={style}
    >
      <div className="font-mono font-bold mb-1">{wellId}</div>
      {entries.map((w, i) => (
        <div key={i} className={entries.length > 1 && i > 0 ? 'mt-1.5 pt-1.5 border-t border-border/50 dark:border-border-dark/50' : ''}>
          <div><span className="text-text-secondary dark:text-text-secondary-dark">Sample:</span> {w.sample}</div>
          <div><span className="text-text-secondary dark:text-text-secondary-dark">Target:</span> {w.target}</div>
          <div>
            <span className="text-text-secondary dark:text-text-secondary-dark">Ct:</span>{' '}
            {w.ct != null ? w.ct.toFixed(2) : <span className="text-red-500">Undetermined</span>}
          </div>
          {w.taskType && w.taskType !== 'UNKNOWN' && (
            <div><span className="text-text-secondary dark:text-text-secondary-dark">Task:</span> {w.taskType}</div>
          )}
        </div>
      ))}
    </div>
  )
}
