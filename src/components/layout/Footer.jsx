import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="border-t border-border dark:border-border-dark mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark">
          {t('footer.tagline')}
        </p>
        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
          {t('footer.privacy')}
        </p>
      </div>
    </footer>
  )
}
