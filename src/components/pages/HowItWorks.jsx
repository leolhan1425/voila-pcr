import { useTranslation } from 'react-i18next'

const STEPS = [
  {
    num: '01',
    key: 'step1',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    num: '02',
    key: 'step2',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    num: '03',
    key: 'step3',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
]

export default function HowItWorks() {
  const { t } = useTranslation()

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-center">
        {t('pages.howItWorks.title')}
      </h1>

      <div className="mt-16 space-y-16">
        {STEPS.map((step) => (
          <div key={step.num} className="flex gap-6 items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              {step.icon}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-accent font-semibold">{step.num}</span>
                <h2 className="font-display text-2xl font-bold">
                  {t(`pages.howItWorks.${step.key}Title`)}
                </h2>
              </div>
              <p className="mt-2 text-text-secondary dark:text-text-secondary-dark text-lg leading-relaxed">
                {t(`pages.howItWorks.${step.key}Desc`)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <a
          href="/"
          className="inline-block px-8 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
        >
          Try It Now — Free
        </a>
        <p className="mt-3 text-sm text-text-secondary dark:text-text-secondary-dark">
          No account required for your first analysis.
        </p>
      </div>
    </main>
  )
}
