import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'

/**
 * Login / Sign-up modal.
 * Clean centered overlay with email+password and Google OAuth.
 */
export default function LoginModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { signIn, signUp, signInWithGoogle, isLoading, error, clearError } = useAuth()

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState(null)

  if (!isOpen) return null

  const toggleMode = () => {
    setMode((m) => (m === 'login' ? 'signup' : 'login'))
    setLocalError(null)
    clearError()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)

    if (!email || !password) {
      setLocalError(t('auth.fieldsRequired'))
      return
    }

    if (mode === 'signup' && password.length < 8) {
      setLocalError(t('auth.passwordMinLength'))
      return
    }

    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      onClose()
    } catch {
      // Error is set in the auth store
    }
  }

  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
      onClose()
    } catch {
      // Error is set in the auth store
    }
  }

  const displayError = localError || error

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-0.5 mb-2">
            <span className="font-display text-2xl font-bold text-accent">
              {t('brandAccent')}
            </span>
            <span className="font-mono text-2xl font-semibold text-accent">
              {t('brandMono')}
            </span>
          </div>
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
            {mode === 'login' ? t('auth.signInSubtitle') : t('auth.signUpSubtitle')}
          </p>
        </div>

        {/* Google OAuth button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-border dark:border-border-dark rounded-lg hover:bg-warm-bg dark:hover:bg-warm-bg-dark transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-sm font-medium">{t('auth.googleButton')}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border dark:bg-border-dark" />
          <span className="text-xs text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide">
            {t('auth.orDivider')}
          </span>
          <div className="flex-1 h-px bg-border dark:bg-border-dark" />
        </div>

        {/* Email / password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.emailLabel')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@lab.edu"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.passwordLabel')}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? t('auth.passwordPlaceholderNew') : ''}
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          {/* Error display */}
          {displayError && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
              {displayError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading
              ? t('auth.loading')
              : mode === 'login'
                ? t('auth.signInButton')
                : t('auth.signUpButton')}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-sm text-text-secondary dark:text-text-secondary-dark mt-5">
          {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
          <button onClick={toggleMode} className="text-accent hover:text-accent-hover font-medium">
            {mode === 'login' ? t('auth.signUpLink') : t('auth.signInLink')}
          </button>
        </p>

        {/* Close button */}
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
