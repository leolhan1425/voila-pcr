import { useTranslation } from 'react-i18next'

export default function Footer({ navigate }) {
  const { t } = useTranslation()

  const handleNav = (e, path) => {
    e.preventDefault()
    if (navigate) navigate(path)
  }

  return (
    <footer className="border-t border-border dark:border-border-dark mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
              {t('footer.tagline')}
            </p>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              {t('footer.privacy')}
            </p>
          </div>
          <nav className="flex gap-4 text-xs text-text-secondary dark:text-text-secondary-dark">
            <a href="/how-it-works" onClick={(e) => handleNav(e, '/how-it-works')} className="hover:text-accent transition-colors">
              {t('footer.howItWorks')}
            </a>
            <a href="/pricing" onClick={(e) => handleNav(e, '/pricing')} className="hover:text-accent transition-colors">
              {t('footer.pricing')}
            </a>
            <a href="/formats" onClick={(e) => handleNav(e, '/formats')} className="hover:text-accent transition-colors">
              {t('footer.formats')}
            </a>
            <a href="/changelog" onClick={(e) => handleNav(e, '/changelog')} className="hover:text-accent transition-colors">
              {t('footer.changelog')}
            </a>
          </nav>
        </div>
      </div>
    </footer>
  )
}
