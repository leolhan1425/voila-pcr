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
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div>
            <div className="flex items-baseline gap-0.5">
              <span className="font-display text-lg font-bold text-accent">Voila</span>
              <span className="font-mono text-lg font-semibold text-accent">PCR</span>
            </div>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">
              {t('footer.tagline')}
            </p>
            <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
              {t('footer.privacy')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8">
            <div>
              <h4 className="text-xs font-medium text-text-primary dark:text-text-primary-dark mb-2 uppercase tracking-wider">Product</h4>
              <nav className="flex flex-col gap-1.5 text-xs text-text-secondary dark:text-text-secondary-dark">
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

            <div>
              <h4 className="text-xs font-medium text-text-primary dark:text-text-primary-dark mb-2 uppercase tracking-wider">Resources</h4>
              <nav className="flex flex-col gap-1.5 text-xs text-text-secondary dark:text-text-secondary-dark">
                <a href="/blog" onClick={(e) => handleNav(e, '/blog')} className="hover:text-accent transition-colors">
                  {t('footer.blog')}
                </a>
                <a href="/about" onClick={(e) => handleNav(e, '/about')} className="hover:text-accent transition-colors">
                  {t('footer.about')}
                </a>
                <a href="/privacy" onClick={(e) => handleNav(e, '/privacy')} className="hover:text-accent transition-colors">
                  {t('footer.privacy_page')}
                </a>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
            {t('footer.brand', 'A VoilaScience product')}
          </p>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-mono">
            {t('footer.contact', 'hello@voilapcr.com')}
          </p>
        </div>
      </div>
    </footer>
  )
}
