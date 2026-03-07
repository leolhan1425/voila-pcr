const ENTRIES = [
  {
    date: '2026-03-07',
    version: '3.0',
    title: 'v3: Full sales landing page, unlimited free tier, templates, and more',
    changes: [
      'New 8-section sales landing page with inline drop zone',
      'Free tier now has unlimited analyses (no monthly cap)',
      'Free QC report shows first diagnostic card expanded, rest blurred',
      'Added Prism .pzfx export for GraphPad compatibility (Pro)',
      'Added saved analysis templates — save and reuse configurations',
      'Added persistent feedback buttons (format requests + ideas)',
      'Added citation feature with one-click copy',
      'Added referral share prompt after results',
      'Added Privacy Policy, About, and Blog pages',
      'Added 3 SEO blog posts (DDCt guide, troubleshooting, reference genes)',
      'Added DEMO_MODE environment variable for demo deployments',
      'Added Science journal preset to graph customizer',
      'Added ABI StepOne, Rotor-Gene Q, Stratagene Mx, Eppendorf realplex, Mic qPCR parsers',
      'Updated results layout with tab-based navigation (Results, Figures, QC Report)',
      'Added admin dashboard for format requests and feedback',
    ],
  },
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
