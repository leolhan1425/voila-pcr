import { useState } from 'react'
import useTier from '../../hooks/useTier'

const CHECK = (
  <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const FREE_FEATURES = [
  '5 analyses/month',
  '3 Plus trial sessions',
  'Basic graphs & QC summary',
  'All machine formats supported',
]

const PLUS_FEATURES = [
  'Unlimited analyses',
  'Full QC diagnostic report',
  'Dr. qPCR AI troubleshooting',
  'Publication-ready graph editor',
  'Journal presets (Nature, Cell, PLOS ONE)',
  '300 DPI, SVG, PDF export',
  'Advanced methods (Pfaffl, geNorm)',
  'Prism .pzfx export',
  'Saved analysis templates',
  'Priority format support',
]

export default function PricingModal({ onClose }) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center px-6 pt-8 pb-4">
          <h2 className="font-display text-2xl font-bold">Choose your plan</h2>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            Start free. Upgrade when you need the full toolkit.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 px-6 pb-8">
          {/* Free */}
          <div className="rounded-xl border border-border dark:border-border-dark p-6 flex flex-col">
            <h3 className="font-display text-lg font-bold">Free</h3>
            <div className="mt-3 mb-1">
              <span className="text-3xl font-bold">$0</span>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark ml-1">forever</span>
            </div>
            <ul className="flex-1 space-y-2.5 my-5">
              {FREE_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">{CHECK}<span>{f}</span></li>
              ))}
            </ul>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-lg text-sm font-medium border border-border dark:border-border-dark hover:bg-warm-bg dark:hover:bg-warm-bg-dark transition-colors"
            >
              {isPlus ? 'Current: Plus' : 'Get started free'}
            </button>
          </div>

          {/* Plus */}
          <div className="rounded-xl border-2 border-accent p-6 flex flex-col relative shadow-md ring-1 ring-accent/20">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-0.5 rounded-full">
              Recommended
            </div>
            <h3 className="font-display text-lg font-bold">Plus</h3>
            <div className="mt-3 mb-1">
              <span className="text-3xl font-bold">$99</span>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark ml-1">/year</span>
            </div>
            <ul className="flex-1 space-y-2.5 my-5">
              {PLUS_FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">{CHECK}<span>{f}</span></li>
              ))}
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={isPlus || loading}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isPlus
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-default'
                  : 'bg-accent hover:bg-accent-hover text-white'
              }`}
            >
              {isPlus ? 'Current plan' : loading ? 'Loading...' : 'Start with 3 free Plus sessions'}
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 text-center">
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
            Need it for your whole lab? Team pricing coming soon — <a href="mailto:hello@voilapcr.com" className="text-accent hover:underline">join the waitlist</a>.
          </p>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
