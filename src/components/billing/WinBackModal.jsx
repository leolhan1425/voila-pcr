import { useState } from 'react'

/**
 * Shown when a lapsed Plus user returns (tier was plus, now free).
 * Offers 50% off to re-subscribe: $49.50/year instead of $99.
 */
export default function WinBackModal({ onClose }) {
  const [loading, setLoading] = useState(false)

  const handleResubscribe = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winback: true }),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-8 max-w-sm w-full mx-4 shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-3xl mb-3">&#128075;</div>

        <h3 className="font-display text-xl font-bold">
          Welcome back
        </h3>

        <p className="mt-3 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
          We noticed your Plus subscription ended. Pick up where you left off — renew now and get <span className="font-bold text-accent">50% off</span> your next year.
        </p>

        <div className="mt-4 flex items-baseline justify-center gap-2">
          <span className="text-2xl font-bold font-mono text-accent">$49.50</span>
          <span className="text-sm text-text-secondary dark:text-text-secondary-dark line-through">$99</span>
          <span className="text-sm text-text-secondary dark:text-text-secondary-dark">/year</span>
        </div>

        <button
          onClick={handleResubscribe}
          disabled={loading}
          className="mt-6 w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Renew at 50% off'}
        </button>

        <button
          onClick={onClose}
          className="mt-3 text-xs text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors underline"
        >
          No thanks, continue with Free
        </button>
      </div>
    </div>
  )
}
