import { useTranslation } from 'react-i18next'

const SECTIONS = [
  {
    key: 'clientSide',
    defaultTitle: 'Your Data Never Leaves Your Browser',
    defaultBody:
      'All qPCR data analysis in VoilaPCR happens entirely in your browser. Your raw data files — Ct values, sample names, plate layouts — are parsed and computed on your device using client-side JavaScript. No qPCR data is ever uploaded to our servers. When you close the tab, your data is gone. We never have access to it.',
  },
  {
    key: 'noTracking',
    defaultTitle: 'No Tracking',
    defaultBody:
      'VoilaPCR does not use Google Analytics, Facebook Pixel, or any third-party tracking scripts. If we collect any aggregate usage statistics in the future, we will use privacy-respecting, cookie-free analytics (such as Plausible) that do not track individual users across sites or build advertising profiles.',
  },
  {
    key: 'whatWeStore',
    defaultTitle: 'What We Store',
    defaultBody:
      'If you create an account, we store the minimum information needed to run the service: your email address, subscription tier, usage counts (number of analyses run), format requests you submit, and feedback you provide. We never store your raw qPCR data, uploaded files, Ct values, sample names, or analysis results. All of that stays in your browser and is discarded when your session ends.',
  },
  {
    key: 'drQpcr',
    defaultTitle: 'Dr. qPCR',
    defaultBody:
      'Dr. qPCR sends only your typed questions and uploaded images to our AI provider (Anthropic) via their commercial API. Your uploaded qPCR spreadsheet data is never transmitted to any server. Anthropic\'s commercial API terms prohibit the use of API data for model training. API logs are automatically deleted within 7 days.',
  },
  {
    key: 'contact',
    defaultTitle: 'Contact',
    defaultBody:
      'If you have questions about this privacy policy or how your data is handled, reach out to us.',
  },
]

export default function PrivacyPage() {
  const { t } = useTranslation()

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-center">
        {t('pages.privacy.title', 'Privacy Policy')}
      </h1>
      <p className="mt-4 text-center text-lg text-text-secondary dark:text-text-secondary-dark">
        {t('pages.privacy.subtitle', 'Your science is your business. We keep it that way.')}
      </p>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((section) => (
          <div key={section.key} className="border-l-2 border-accent pl-6">
            <h2 className="font-display text-xl font-bold">
              {t(`pages.privacy.${section.key}.title`, section.defaultTitle)}
            </h2>
            <p className="mt-2 text-text-secondary dark:text-text-secondary-dark leading-relaxed">
              {t(`pages.privacy.${section.key}.body`, section.defaultBody)}
            </p>
            {section.key === 'contact' && (
              <a
                href="mailto:hello@voilapcr.com"
                className="inline-block mt-2 text-accent hover:text-accent-hover font-mono text-sm transition-colors"
              >
                hello@voilapcr.com
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-border dark:border-border-dark text-center">
        <p className="text-xs text-text-secondary dark:text-text-secondary-dark font-mono">
          {t('pages.privacy.lastUpdated', 'Last updated: March 2026')}
        </p>
      </div>
    </main>
  )
}
