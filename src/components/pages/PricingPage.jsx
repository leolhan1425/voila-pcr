import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'

const CHECK = (
  <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
)

export default function PricingPage() {
  const { t } = useTranslation()
  const { tier } = useStore()
  const [annual, setAnnual] = useState(true)

  const tiers = [
    {
      key: 'free',
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      features: t('pricing.free.features', { returnObjects: true }) || [],
      current: tier === 'free',
    },
    {
      key: 'pro',
      price: annual ? t('pricing.pro.priceAnnual') : t('pricing.pro.priceMonthly'),
      period: annual ? t('pricing.pro.periodAnnual') : t('pricing.pro.periodMonthly'),
      features: t('pricing.pro.features', { returnObjects: true }) || [],
      current: tier === 'pro',
      highlighted: true,
    },
    {
      key: 'lab',
      price: t('pricing.lab.price'),
      period: t('pricing.lab.period'),
      features: t('pricing.lab.features', { returnObjects: true }) || [],
      current: tier === 'lab',
    },
  ]

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-center">
        {t('pricing.title')}
      </h1>
      <p className="mt-4 text-center text-lg text-text-secondary dark:text-text-secondary-dark">
        {t('pricing.subtitle')}
      </p>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex items-center gap-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${!annual ? 'bg-accent text-white' : 'text-text-secondary dark:text-text-secondary-dark'}`}
          >
            {t('pricing.monthly')}
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${annual ? 'bg-accent text-white' : 'text-text-secondary dark:text-text-secondary-dark'}`}
          >
            {t('pricing.annual')} <span className="text-xs opacity-80">{t('pricing.save', { percent: 31 })}</span>
          </button>
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((plan) => (
          <div
            key={plan.key}
            className={`relative p-6 rounded-xl border transition-shadow ${
              plan.highlighted
                ? 'border-accent shadow-lg shadow-accent/10 dark:shadow-accent/5'
                : 'border-border dark:border-border-dark'
            } bg-surface dark:bg-surface-dark`}
          >
            <h3 className="font-display text-xl font-bold">
              {t(`pricing.${plan.key}.name`)}
            </h3>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono">{plan.price}</span>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">{plan.period}</span>
            </div>

            <ul className="mt-6 space-y-3">
              {(Array.isArray(plan.features) ? plan.features : []).map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  {CHECK}
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`mt-8 w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                plan.current
                  ? 'bg-border dark:bg-border-dark text-text-secondary dark:text-text-secondary-dark cursor-default'
                  : plan.highlighted
                  ? 'bg-accent hover:bg-accent-hover text-white'
                  : 'border border-accent text-accent hover:bg-accent hover:text-white'
              }`}
              disabled={plan.current}
            >
              {plan.current ? t('pricing.currentPlan') : t(`pricing.${plan.key}.cta`)}
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
