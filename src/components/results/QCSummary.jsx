import useStore from '../../store/useStore'

const STATUS_STYLES = {
  pass: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
  fail: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
}

export default function QCSummary() {
  const { results } = useStore()
  const qc = results?.qcReport

  if (!qc) {
    return <p className="text-sm text-text-secondary dark:text-text-secondary-dark">No QC data available. Re-run analysis from the Configure step.</p>
  }

  return (
    <div className="space-y-6">
      {/* Overall */}
      <div className={`p-4 rounded-lg border ${STATUS_STYLES[qc.overall]}`}>
        <p className="font-mono text-sm font-medium">
          Overall: {qc.overall === 'pass' ? 'All quality checks passed' : qc.overall === 'warning' ? 'Passed with warnings — review flagged items' : 'Quality issues detected — review before publishing'}
        </p>
      </div>

      {/* Per-target table */}
      <div>
        <h3 className="text-sm font-medium mb-2">Per-Target Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border dark:border-border-dark text-left">
                <th className="px-3 py-2">Target</th>
                <th className="px-3 py-2">Exp. Wells</th>
                <th className="px-3 py-2">Amp Rate</th>
                <th className="px-3 py-2">Mean Ct</th>
                <th className="px-3 py-2">NTC Status</th>
                <th className="px-3 py-2">Std Curve R²</th>
                <th className="px-3 py-2">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(qc.targets).map(([target, t]) => {
                const ntc = qc.ntc[target]
                const sc = qc.standardCurve[target]
                return (
                  <tr key={target} className="border-b border-border/30 dark:border-border-dark/30">
                    <td className="px-3 py-2 font-medium">{target}</td>
                    <td className="px-3 py-2">{t.experimentalAmplified}/{t.experimentalWells}</td>
                    <td className="px-3 py-2">
                      {t.experimentalWells > 0
                        ? `${(t.experimentalAmplified / t.experimentalWells * 100).toFixed(0)}%`
                        : '—'
                      }
                    </td>
                    <td className="px-3 py-2">{t.meanCt?.toFixed(2) ?? '—'}</td>
                    <td className="px-3 py-2">
                      {ntc ? (ntc.clean ? 'Clean' : `Ct ${ntc.minCt?.toFixed(1)}`) : '—'}
                    </td>
                    <td className="px-3 py-2">{sc?.r2?.toFixed(4) ?? '—'}</td>
                    <td className="px-3 py-2">{sc?.efficiency != null ? `${sc.efficiency.toFixed(1)}%` : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Standard curves */}
      {Object.keys(qc.standardCurve).length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">Standard Curve Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(qc.standardCurve).map(([target, sc]) => (
              <div key={target} className={`p-3 rounded-lg border text-xs ${STATUS_STYLES[sc.status]}`}>
                <p className="font-mono font-medium mb-2">{target}</p>
                {sc.r2 != null ? (
                  <table className="font-mono w-full">
                    <tbody>
                      <tr><td className="pr-3 py-0.5">R²</td><td>{sc.r2.toFixed(4)}</td><td className="pl-2 opacity-60">{sc.r2 >= 0.99 ? 'Excellent' : sc.r2 >= 0.98 ? 'Acceptable' : 'Poor'}</td></tr>
                      <tr><td className="pr-3 py-0.5">Slope</td><td>{sc.slope.toFixed(3)}</td><td className="pl-2 opacity-60">{sc.slope >= -3.6 && sc.slope <= -3.1 ? 'Optimal' : 'Out of range'}</td></tr>
                      <tr><td className="pr-3 py-0.5">Efficiency</td><td>{sc.efficiency.toFixed(1)}%</td><td className="pl-2 opacity-60">{sc.efficiency >= 90 && sc.efficiency <= 110 ? 'Acceptable' : 'Out of range'}</td></tr>
                      <tr><td className="pr-3 py-0.5">Y-intercept</td><td>{sc.intercept.toFixed(2)}</td><td></td></tr>
                      <tr><td className="pr-3 py-0.5">Points</td><td>{sc.dynamicRange}</td><td className="pl-2 opacity-60">{sc.dynamicRange >= 5 ? 'Good' : 'Minimal'}</td></tr>
                    </tbody>
                  </table>
                ) : (
                  <p className="font-mono">Insufficient amplification for curve fitting</p>
                )}
                {sc.points && sc.points.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-current/20">
                    <table className="font-mono w-full">
                      <thead>
                        <tr className="opacity-60"><td>Point</td><td>Mean Ct</td><td>SD</td><td>n</td></tr>
                      </thead>
                      <tbody>
                        {sc.points.map((p) => (
                          <tr key={p.name}>
                            <td>{p.name}</td>
                            <td>{p.meanCt.toFixed(2)}</td>
                            <td>{p.sd.toFixed(3)}</td>
                            <td>{p.n}/{p.totalWells}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All flags */}
      {qc.flags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2">All Quality Flags ({qc.flags.length})</h3>
          <div className="space-y-1">
            {qc.flags.map((flag, i) => (
              <div key={i} className={`text-xs font-mono p-2 rounded ${
                flag.severity === 'error'
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
              }`}>
                {flag.severity === 'error' ? '\u2717' : '\u26A0'} {flag.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reference */}
      <div className="pt-4 border-t border-border dark:border-border-dark">
        <h3 className="text-xs font-medium mb-1 text-text-secondary dark:text-text-secondary-dark">Reference Standards (MIQE Guidelines)</h3>
        <div className="text-[11px] text-text-secondary dark:text-text-secondary-dark font-mono space-y-0.5">
          <p>Standard curve R² ≥ 0.98 (acceptable), ≥ 0.99 (excellent)</p>
          <p>Amplification efficiency 90–110% (slope -3.1 to -3.6)</p>
          <p>Technical replicate SD &lt; 0.5 Ct</p>
          <p>NTC: no amplification, or ≥ 5 Ct cycles from experimental samples</p>
          <p className="pt-1 italic">Bustin SA, et al. The MIQE Guidelines. Clinical Chemistry. 2009;55(4):611-622.</p>
        </div>
      </div>
    </div>
  )
}
