import { QC_COLORS, ctToColor } from './plateUtils'

/**
 * Legend for the current plate map view mode.
 */
export default function ColorLegend({ viewMode, colorMap, sampleRoles }) {
  if (viewMode === 'qc') {
    return (
      <div className="flex flex-wrap gap-3 mt-3 text-xs">
        <LegendItem color={QC_COLORS.green} label="Passed" />
        <LegendItem color={QC_COLORS.yellow} label="Warning" />
        <LegendItem color={QC_COLORS.red} label="Critical" />
        <LegendItem color={QC_COLORS.gray} label="No data" />
      </div>
    )
  }

  if (viewMode === 'ct') {
    return (
      <div className="flex items-center gap-2 mt-3 text-xs">
        <span className="text-text-secondary dark:text-text-secondary-dark">Low Ct</span>
        <div className="flex h-3 rounded overflow-hidden" style={{ width: 120 }}>
          {[10, 15, 20, 25, 30, 35, 40].map((ct) => (
            <div key={ct} className="flex-1" style={{ backgroundColor: ctToColor(ct) }} />
          ))}
        </div>
        <span className="text-text-secondary dark:text-text-secondary-dark">High Ct</span>
        <span className="ml-2 text-text-secondary dark:text-text-secondary-dark">
          <span className="inline-block w-3 h-3 border border-border dark:border-border-dark bg-white align-middle mr-1" />
          Undet.
        </span>
      </div>
    )
  }

  // Sample or target view
  if (!colorMap) return null
  const entries = Object.entries(colorMap)
  if (entries.length === 0) return null

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-xs">
      {entries.map(([name, color]) => {
        const isNtc = viewMode === 'sample' && sampleRoles?.[name] === 'ntc'
        return (
          <LegendItem
            key={name}
            color={isNtc ? '#6b7280' : color}
            label={name}
            hatched={isNtc}
          />
        )
      })}
    </div>
  )
}

function LegendItem({ color, label, hatched }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-block w-3 h-3 rounded-sm shrink-0"
        style={{
          backgroundColor: color,
          border: hatched ? '1.5px solid #374151' : 'none',
        }}
      />
      <span className="truncate max-w-[120px]">{label}</span>
    </div>
  )
}
