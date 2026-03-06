import useStore from '../../store/useStore'

const STATUS_BADGE = {
  pass: { cls: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800', text: 'Pass' },
  warning: { cls: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800', text: 'Warnings' },
  fail: { cls: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800', text: 'Issues' },
}

export default function QCReport() {
  const { qcReport } = useStore()
  if (!qcReport) return null

  const badge = STATUS_BADGE[qcReport.overall]

  // Group flags by category
  const errorFlags = qcReport.flags.filter((f) => f.severity === 'error')
  const warningFlags = qcReport.flags.filter((f) => f.severity === 'warning')

  return (
    <div className="mt-8 border border-border dark:border-border-dark rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark flex items-center justify-between">
        <h3 className="text-sm font-medium">Quality Control</h3>
        <span className={`text-xs px-2 py-0.5 rounded border font-mono ${badge.cls}`}>{badge.text}</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Compact per-target table */}
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="text-left text-text-secondary dark:text-text-secondary-dark border-b border-border dark:border-border-dark">
              <th className="pb-1.5 pr-3">Target</th>
              <th className="pb-1.5 pr-3">Exp. Amp</th>
              <th className="pb-1.5 pr-3">Mean Ct</th>
              <th className="pb-1.5 pr-3">NTC</th>
              <th className="pb-1.5 pr-3">Std Curve</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(qcReport.targets).map(([target, tgt]) => {
              const ntc = qcReport.ntc[target]
              const sc = qcReport.standardCurve[target]
              return (
                <tr key={target} className="border-b border-border/30 dark:border-border-dark/30">
                  <td className="py-1.5 pr-3 font-medium">{target}</td>
                  <td className="py-1.5 pr-3">
                    <StatusDot status={tgt.status} />
                    {tgt.experimentalAmplified}/{tgt.experimentalWells}
                  </td>
                  <td className="py-1.5 pr-3">{tgt.meanCt?.toFixed(1) ?? '—'}</td>
                  <td className="py-1.5 pr-3">
                    {ntc ? (
                      <><StatusDot status={ntc.status} />{ntc.clean ? 'Clean' : `Ct ${ntc.minCt?.toFixed(1)}`}</>
                    ) : <span className="text-text-secondary dark:text-text-secondary-dark">—</span>}
                  </td>
                  <td className="py-1.5 pr-3">
                    {sc?.r2 != null ? (
                      <><StatusDot status={sc.status} />R²={sc.r2.toFixed(3)} E={sc.efficiency?.toFixed(0)}%</>
                    ) : sc ? (
                      <><StatusDot status="fail" />No data</>
                    ) : <span className="text-text-secondary dark:text-text-secondary-dark">—</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Issues — grouped cleanly */}
        {errorFlags.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 rounded p-3 space-y-1">
            <p className="text-xs font-medium text-red-800 dark:text-red-300 mb-1">Issues ({errorFlags.length})</p>
            {errorFlags.map((f, i) => (
              <p key={i} className="text-xs font-mono text-red-700 dark:text-red-400">{f.message}</p>
            ))}
          </div>
        )}

        {warningFlags.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 rounded p-3 space-y-1">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300 mb-1">Warnings ({warningFlags.length})</p>
            {warningFlags.map((f, i) => (
              <p key={i} className="text-xs font-mono text-amber-700 dark:text-amber-400">{f.message}</p>
            ))}
          </div>
        )}

        {errorFlags.length === 0 && warningFlags.length === 0 && (
          <p className="text-xs font-mono text-green-700 dark:text-green-400">All quality checks passed.</p>
        )}

        {/* Reference */}
        <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark">
          Criteria: MIQE guidelines (Bustin et al., Clin Chem 2009). R² ≥ 0.98, efficiency 90–110%, replicate SD &lt; 0.5 Ct, NTC ≥ 5 Ct from samples.
        </p>
      </div>
    </div>
  )
}

function StatusDot({ status }) {
  const color = status === 'pass' ? 'bg-green-500' : status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color} mr-1.5`} />
}
