import useStore from '../../store/useStore'

const ROLE_OPTIONS = [
  { value: 'experimental', label: 'Experimental', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'ntc', label: 'NTC', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  { value: 'standard', label: 'Standard', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
]

export default function SampleClassifier() {
  const { parsedData, sampleRoles, setSampleRole } = useStore()

  if (!parsedData) return null

  const grouped = { experimental: [], ntc: [], standard: [] }
  for (const s of parsedData.samples) {
    const role = sampleRoles[s] || 'experimental'
    grouped[role].push(s)
  }

  return (
    <div className="mt-8">
      <h3 className="text-sm font-medium mb-1">Sample classification</h3>
      <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-4">
        Auto-detected sample roles. Click to change. Standards and NTCs are excluded from analysis.
      </p>

      <div className="flex flex-wrap gap-2">
        {parsedData.samples.map((sample) => {
          const role = sampleRoles[sample] || 'experimental'
          const opt = ROLE_OPTIONS.find((o) => o.value === role)

          return (
            <button
              key={sample}
              onClick={() => {
                // Cycle: experimental → standard → ntc → experimental
                const order = ['experimental', 'standard', 'ntc']
                const next = order[(order.indexOf(role) + 1) % order.length]
                setSampleRole(sample, next)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-mono border border-transparent transition-colors ${opt.color}`}
              title={`Click to change role (current: ${opt.label})`}
            >
              {sample}
              <span className="ml-1.5 text-[10px] font-body opacity-60 uppercase">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex gap-4 text-[11px] text-text-secondary dark:text-text-secondary-dark">
        {ROLE_OPTIONS.map((opt) => (
          <span key={opt.value} className="flex items-center gap-1">
            <span className={`w-2.5 h-2.5 rounded-sm ${opt.color.split(' ')[0]}`} />
            {opt.label}
            {opt.value !== 'experimental' && ' (excluded from analysis)'}
          </span>
        ))}
      </div>
    </div>
  )
}
