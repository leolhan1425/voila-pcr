import { useState } from 'react'
import useStore from '../../store/useStore'

export default function WellExclusion() {
  const { parsedData, setParsedData, sampleRoles } = useStore()
  const [expanded, setExpanded] = useState(false)

  if (!parsedData) return null

  // Only show experimental wells
  const expWells = parsedData.wells.filter((w) => sampleRoles[w.sample] === 'experimental')

  // Group by sample+target for display
  const groups = new Map()
  for (const w of expWells) {
    const key = `${w.sample}||${w.target}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(w)
  }

  const excludedCount = parsedData.wells.filter((w) => w._excluded).length

  const toggleWell = (well, target, sample) => {
    const updated = {
      ...parsedData,
      wells: parsedData.wells.map((w) => {
        if (w.well === well && w.target === target && w.sample === sample) {
          return { ...w, _excluded: !w._excluded }
        }
        return w
      }),
    }
    setParsedData(updated)
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm font-medium flex items-center gap-2 hover:text-accent transition-colors"
      >
        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        Exclude individual wells
        {excludedCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-mono">
            {excludedCount} excluded
          </span>
        )}
      </button>

      {expanded && (
        <div className="mt-3 border border-border dark:border-border-dark rounded-lg overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-xs font-mono">
              <thead className="sticky top-0 bg-surface dark:bg-surface-dark">
                <tr className="text-left text-text-secondary dark:text-text-secondary-dark border-b border-border dark:border-border-dark">
                  <th className="px-3 py-1.5">Include</th>
                  <th className="px-3 py-1.5">Well</th>
                  <th className="px-3 py-1.5">Sample</th>
                  <th className="px-3 py-1.5">Target</th>
                  <th className="px-3 py-1.5">Ct</th>
                </tr>
              </thead>
              <tbody>
                {[...groups.entries()].map(([key, wells]) =>
                  wells.map((w) => (
                    <tr
                      key={`${w.well}-${w.target}-${w.sample}`}
                      className={`border-b border-border/30 dark:border-border-dark/30 ${w._excluded ? 'opacity-40' : ''}`}
                    >
                      <td className="px-3 py-1">
                        <input
                          type="checkbox"
                          checked={!w._excluded}
                          onChange={() => toggleWell(w.well, w.target, w.sample)}
                          className="accent-accent"
                        />
                      </td>
                      <td className="px-3 py-1">{w.well}</td>
                      <td className="px-3 py-1">{w.sample}</td>
                      <td className="px-3 py-1">{w.target}</td>
                      <td className="px-3 py-1">
                        {w.ct != null ? (
                          <span className={w.ct > 35 ? 'text-amber-600 dark:text-amber-400' : ''}>
                            {w.ct.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-red-500">Undet.</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
