import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useTier from '../../hooks/useTier'

const CHECK = (
  <svg className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

const FREE_FEATURES = [
  '5 analyses/month',
  '3 Plus trial sessions',
  'Basic graphs & QC summary',
  'All machine formats supported',
  'CSV export',
  '1 saved template',
]

const PLUS_FEATURES = [
  'Unlimited analyses',
  'Full QC diagnostic report',
  'Dr. qPCR AI troubleshooting',
  'Publication-ready graph editor',
  'Journal presets (Nature, Cell, PLOS ONE, Science)',
  '300 DPI PNG, SVG, PDF export',
  'Prism .pzfx export',
  'Advanced methods (Pfaffl, geNorm, standard curve)',
  'Unlimited saved templates',
  'Priority format support',
]

export default function PricingPage() {
  const { t } = useTranslation()
  const { isPlus } = useTier()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start checkout')
      }
    } catch {
      alert('Could not connect to payment server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-center">
        Simple pricing
      </h1>
      <p className="mt-4 text-center text-lg text-text-secondary dark:text-text-secondary-dark">
        Start free. Upgrade when you need the full toolkit.
      </p>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Free */}
        <div className="p-6 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
          <h3 className="font-display text-xl font-bold">Free</h3>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono">$0</span>
            <span className="text-sm text-text-secondary dark:text-text-secondary-dark">forever</span>
          </div>

          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">{CHECK}<span>{feature}</span></li>
            ))}
          </ul>

          <button
            className="mt-8 w-full py-2.5 rounded-lg font-medium text-sm border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
          >
            Get started free
          </button>
        </div>

        {/* Plus */}
        <div className="relative p-6 rounded-xl border-2 border-accent shadow-lg shadow-accent/10 dark:shadow-accent/5 bg-surface dark:bg-surface-dark">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-0.5 rounded-full">
            Recommended
          </div>
          <h3 className="font-display text-xl font-bold">Plus</h3>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono">$99</span>
            <span className="text-sm text-text-secondary dark:text-text-secondary-dark">/year</span>
          </div>

          <ul className="mt-6 space-y-3">
            {PLUS_FEATURES.map((feature, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">{CHECK}<span>{feature}</span></li>
            ))}
          </ul>

          <button
            onClick={handleUpgrade}
            disabled={isPlus || loading}
            className={`mt-8 w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
              isPlus
                ? 'bg-border dark:bg-border-dark text-text-secondary dark:text-text-secondary-dark cursor-default'
                : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {isPlus ? 'Current plan' : loading ? 'Loading...' : 'Start with 3 free Plus sessions'}
          </button>
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          Need it for your whole lab? Team pricing coming soon — <a href="mailto:hello@voilapcr.com" className="text-accent hover:underline">join the waitlist</a>.
        </p>
      </div>
    </main>
  )
}
