import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'
import useTier from '../../hooks/useTier'
import useStore from '../../store/useStore'
import LoginModal from './LoginModal'

export default function AccountMenu() {
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const { tier, isPlus } = useTier()
  const { setShowPricing } = useStore()

  const [showLogin, setShowLogin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const tierColors = {
    free: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    plus: 'bg-accent/10 text-accent',
  }

  const tierLabels = { free: 'Free', plus: 'Plus' }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowLogin(true)}
          className="px-4 py-1.5 text-sm font-medium text-accent border border-accent rounded-lg hover:bg-accent hover:text-white transition-colors"
        >
          {t('auth.signIn')}
        </button>
        <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      </>
    )
  }

  const handleManageSubscription = async () => {
    setMenuOpen(false)
    if (!isPlus) {
      setShowPricing(true)
      return
    }
    // Try to open Stripe Customer Portal
    try {
      const res = await fetch('/api/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Could not open subscription management. Contact support@voilapcr.com.')
      }
    } catch {
      alert('Could not connect to server. Try again later.')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-surface dark:hover:bg-surface-dark transition-colors"
      >
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
          {(user.name || user.email || '?')[0].toUpperCase()}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tierColors[tier] || tierColors.free}`}>
          {tierLabels[tier] || 'Free'}
        </span>
        <svg className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />

          <div className="absolute right-0 top-full mt-2 w-64 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border dark:border-border-dark">
              <p className="text-sm font-medium truncate">{user.name || user.email}</p>
              <p className="text-xs text-text-secondary dark:text-text-secondary-dark truncate">{user.email}</p>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1.5 ${tierColors[tier] || tierColors.free}`}>
                {tierLabels[tier] || 'Free'} {t('auth.plan')}
              </span>
            </div>

            <div className="py-1">
              {!isPlus && (
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setShowPricing(true)
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-accent hover:bg-warm-bg dark:hover:bg-warm-bg-dark transition-colors"
                >
                  Upgrade to Plus
                </button>
              )}

              <button
                onClick={handleManageSubscription}
                className="w-full text-left px-4 py-2 text-sm hover:bg-warm-bg dark:hover:bg-warm-bg-dark transition-colors"
              >
                {isPlus ? t('auth.manageSubscription') : 'View Plans'}
              </button>

              <div className="border-t border-border dark:border-border-dark my-1" />

              <button
                onClick={() => {
                  setMenuOpen(false)
                  signOut()
                }}
                className="w-full text-left px-4 py-2 text-sm text-text-secondary dark:text-text-secondary-dark hover:bg-warm-bg dark:hover:bg-warm-bg-dark transition-colors"
              >
                {t('auth.signOutButton')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
