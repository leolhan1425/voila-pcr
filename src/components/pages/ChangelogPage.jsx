const ENTRIES = [
  {
    date: '2026-03-06',
    version: '2.0',
    title: 'Major update: Pro features, Dr. qPCR, and more',
    changes: [
      'Added Dr. qPCR AI troubleshooting (Pro)',
      'Added Pfaffl, geNorm, and Standard Curve analysis methods (Pro)',
      'Added publication-quality graph customization with journal presets (Pro)',
      'Added full QC diagnostic report with expandable issue cards (Pro)',
      'Added ABI 7500 and Fluidigm BioMark parsers',
      'Added user accounts and Pro/Lab subscription tiers',
      'Added referral program',
      'Added How It Works, Pricing, and Formats pages',
    ],
  },
  {
    date: '2026-03-05',
    version: '1.0',
    title: 'Initial release',
    changes: [
      'QuantStudio, Bio-Rad CFX, and LightCycler parser support',
      'Generic CSV fallback with auto-column detection',
      'ΔΔCt (Livak) analysis with technical replicate averaging',
      'Publication-ready bar charts with Plotly.js',
      'Automated QC with NTC, standard curve, and replicate checks',
      'SVG and PNG (300 DPI) graph export',
      'CSV export with full results, summary stats, and QC report',
      'Dark mode',
      'Internationalization (i18next) ready',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-center">Changelog</h1>
      <p className="mt-4 text-center text-text-secondary dark:text-text-secondary-dark">
        What's new in VoilaPCR.
      </p>

      <div className="mt-12 space-y-12">
        {ENTRIES.map((entry) => (
          <div key={entry.version} className="border-l-2 border-accent pl-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-accent font-semibold">v{entry.version}</span>
              <span className="text-xs text-text-secondary dark:text-text-secondary-dark font-mono">{entry.date}</span>
            </div>
            <h2 className="font-display text-xl font-bold mt-1">{entry.title}</h2>
            <ul className="mt-3 space-y-1.5">
              {entry.changes.map((change, i) => (
                <li key={i} className="text-sm text-text-secondary dark:text-text-secondary-dark flex items-start gap-2">
                  <span className="text-accent mt-1">+</span>
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  )
}
