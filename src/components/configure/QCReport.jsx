import useStore from '../../store/useStore'

const STATUS_STYLES = {
  pass: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300',
  fail: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300',
}

const STATUS_ICON = {
  pass: '\u2713',
  warning: '\u26A0',
  fail: '\u2717',
}

const SEVERITY_STYLES = {
  error: 'text-red-700 dark:text-red-400',
  warning: 'text-amber-700 dark:text-amber-400',
}

export default function QCReport() {
  const { qcReport } = useStore()
  if (!qcReport) return null

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        Quality Control Report
        <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES[qcReport.overall]}`}>
          {STATUS_ICON[qcReport.overall]} {qcReport.overall === 'pass' ? 'All checks passed' : qcReport.overall === 'warning' ? 'Warnings' : 'Issues detected'}
        </span>
      </h3>

      <div className="space-y-4">
        {/* Per-target summary */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-border dark:border-border-dark text-left">
                <th className="px-3 py-1.5 font-medium">Target</th>
                <th className="px-3 py-1.5 font-medium">Amp Rate</th>
                <th className="px-3 py-1.5 font-medium">Mean Ct</th>
                <th className="px-3 py-1.5 font-medium">Ct Range</th>
                <th className="px-3 py-1.5 font-medium">NTC</th>
                <th className="px-3 py-1.5 font-medium">Std Curve</th>
                <th className="px-3 py-1.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(qcReport.targets).map(([target, t]) => {
                const ntc = qcReport.ntc[target]
                const sc = qcReport.standardCurve[target]
                return (
                  <tr key={target} className="border-b border-border/50 dark:border-border-dark/50">
                    <td className="px-3 py-2 font-medium">{target}</td>
                    <td className="px-3 py-2">
                      {t.experimentalAmplified}/{t.experimentalWells}
                      {t.experimentalWells > 0 && (
                        <span className="ml-1 opacity-60">
                          ({(t.experimentalAmplified / t.experimentalWells * 100).toFixed(0)}%)
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{t.meanCt != null ? t.meanCt.toFixed(2) : '—'}</td>
                    <td className="px-3 py-2">
                      {t.ctRange ? `${t.ctRange[0].toFixed(1)}–${t.ctRange[1].toFixed(1)}` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {ntc ? (
                        <span className={ntc.status === 'pass' ? 'text-green-600 dark:text-green-400' : ntc.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                          {ntc.clean ? 'Clean' : `Amp (${ntc.minCt?.toFixed(1)})`}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      {sc ? (
                        sc.r2 != null ? (
                          <span className={sc.status === 'pass' ? 'text-green-600 dark:text-green-400' : sc.status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'}>
                            R²={sc.r2.toFixed(3)} E={sc.efficiency?.toFixed(0)}%
                          </span>
                        ) : (
                          <span className="text-text-secondary dark:text-text-secondary-dark">Insufficient data</span>
                        )
                      ) : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] border ${STATUS_STYLES[t.status]}`}>
                        {STATUS_ICON[t.status]}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Standard curve detail */}
        {Object.keys(qcReport.standardCurve).length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide">
              Standard Curve Detail
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(qcReport.standardCurve).map(([target, sc]) => (
                <div key={target} className={`p-3 rounded-lg border text-xs ${STATUS_STYLES[sc.status]}`}>
                  <p className="font-mono font-medium mb-1">{target}</p>
                  {sc.r2 != null ? (
                    <div className="space-y-0.5 font-mono">
                      <p>R² = {sc.r2.toFixed(4)} {sc.r2 >= 0.99 ? '(excellent)' : sc.r2 >= 0.98 ? '(acceptable)' : '(poor)'}</p>
                      <p>Slope = {sc.slope.toFixed(3)}</p>
                      <p>Efficiency = {sc.efficiency.toFixed(1)}% {sc.efficiency >= 90 && sc.efficiency <= 110 ? '(acceptable)' : '(out of range)'}</p>
                      <p>Y-intercept = {sc.intercept.toFixed(2)}</p>
                      <p>Points = {sc.dynamicRange} ({sc.dynamicRange >= 5 ? 'good' : sc.dynamicRange >= 3 ? 'adequate' : 'insufficient'} dynamic range)</p>
                    </div>
                  ) : (
                    <p className="font-mono">{sc.dynamicRange} point(s) amplified — insufficient for curve fitting</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Replicate QC */}
        {Object.keys(qcReport.replicates).length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide">
              Technical Replicate Precision
            </h4>
            {Object.entries(qcReport.replicates).map(([target, reps]) => {
              const poorReps = reps.filter((r) => r.status !== 'pass')
              if (poorReps.length === 0 && reps.length > 0) {
                return (
                  <p key={target} className="text-xs text-green-600 dark:text-green-400 font-mono mb-1">
                    {target}: All replicates within threshold (max SD = {Math.max(...reps.map((r) => r.sd)).toFixed(3)})
                  </p>
                )
              }
              return (
                <div key={target} className="mb-2">
                  <p className="text-xs font-mono font-medium">{target}:</p>
                  <div className="ml-3 text-xs font-mono">
                    {reps.filter((r) => r.status !== 'pass').map((r) => (
                      <p key={r.sample} className={r.status === 'fail' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}>
                        {r.sample}: SD = {r.sd.toFixed(3)} (Cts: {r.cts.map((c) => c.toFixed(2)).join(', ')})
                        {r.status === 'fail' ? ' — high variability' : ' — borderline'}
                      </p>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Flags */}
        {qcReport.flags.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide">
              Quality Flags
            </h4>
            <div className="space-y-1">
              {qcReport.flags.map((flag, i) => (
                <p key={i} className={`text-xs font-mono ${SEVERITY_STYLES[flag.severity]}`}>
                  {flag.severity === 'error' ? '\u2717' : '\u26A0'} {flag.message}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* MIQE reference note */}
        <p className="text-[10px] text-text-secondary dark:text-text-secondary-dark italic">
          QC criteria based on MIQE guidelines (Bustin et al., Clinical Chemistry, 2009).
          Standard curve: R² ≥ 0.98, efficiency 90–110%. Replicate SD &lt; 0.5 Ct. NTC: no amplification or ≥ 5 Ct from samples.
        </p>
      </div>
    </div>
  )
}
