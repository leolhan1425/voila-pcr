import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import AccountMenu from '../auth/AccountMenu'
import { isDemoMode } from '../../utils/demoMode'

export default function Header({ navigate }) {
  const { t } = useTranslation()
  const { darkMode, toggleDarkMode, setShowPricing } = useStore()
  const demo = isDemoMode()

  const handleNav = (e, path) => {
    e.preventDefault()
    if (navigate) navigate(path)
  }

  return (
    <header className="border-b border-border dark:border-border-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <a
          href="/"
          onClick={(e) => handleNav(e, '/')}
          className="flex items-baseline gap-0.5 hover:opacity-80 transition-opacity"
        >
          <span className="font-display text-xl font-bold text-accent">
            {t('brandAccent')}
          </span>
          <span className="font-mono text-xl font-semibold text-accent">
            {t('brandMono')}
          </span>
          {demo && (
            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 font-mono uppercase tracking-wide">
              Demo
            </span>
          )}
        </a>

        <nav className="hidden sm:flex items-center gap-5 text-sm text-text-secondary dark:text-text-secondary-dark">
          <a href="/how-it-works" onClick={(e) => handleNav(e, '/how-it-works')} className="hover:text-accent transition-colors">
            How It Works
          </a>
          <a href="/pricing" onClick={(e) => handleNav(e, '/pricing')} className="hover:text-accent transition-colors">
            Pricing
          </a>
          <a href="/formats" onClick={(e) => handleNav(e, '/formats')} className="hover:text-accent transition-colors">
            Formats
          </a>
          <a href="/blog" onClick={(e) => handleNav(e, '/blog')} className="hover:text-accent transition-colors">
            Blog
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-surface dark:hover:bg-surface-dark transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
