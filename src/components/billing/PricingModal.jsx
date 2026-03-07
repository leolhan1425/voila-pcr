import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useTier from '../../hooks/useTier'

/**
 * Pricing modal showing the three tiers: Free, Pro, Lab.
 * Toggle between monthly and annual pricing.
 */
export default function PricingModal({ isOpen, onClose }) {
  const { t } = useTranslation()
  const { tier: currentTier } = useTier()
  const [billing, setBilling] = useState('annual') // 'monthly' | 'annual'

  if (!isOpen) return null

  // Use the nested translation structure from locales/en/translation.json
  const freeFeatures = t('pricing.free.features', { returnObjects: true }) || []
  const proFeatures = t('pricing.pro.features', { returnObjects: true }) || []
  const labFeatures = t('pricing.lab.features', { returnObjects: true }) || []

  const plans = [
    {
      id: 'free',
      name: t('pricing.free.name'),
      price: t('pricing.free.price'),
      period: t('pricing.free.period'),
      features: Array.isArray(freeFeatures) ? freeFeatures : [],
      cta: currentTier === 'free' ? t('pricing.currentPlan') : t('pricing.free.cta'),
      disabled: currentTier === 'free',
      highlight: false,
    },
    {
      id: 'pro',
      name: t('pricing.pro.name'),
      price: billing === 'monthly' ? t('pricing.pro.priceMonthly') : t('pricing.pro.priceAnnual'),
      period: billing === 'monthly' ? t('pricing.pro.periodMonthly') : t('pricing.pro.periodAnnual'),
      savings: billing === 'annual' ? t('pricing.save', { percent: 31 }) : null,
      features: Array.isArray(proFeatures) ? proFeatures : [],
      cta: currentTier === 'pro' ? t('pricing.currentPlan') : t('pricing.pro.cta'),
      disabled: currentTier === 'pro' || currentTier === 'lab',
      highlight: true,
    },
    {
      id: 'lab',
      name: t('pricing.lab.name'),
      price: t('pricing.lab.price'),
      period: t('pricing.lab.period'),
      features: Array.isArray(labFeatures) ? labFeatures : [],
      cta: currentTier === 'lab' ? t('pricing.currentPlan') : t('pricing.lab.cta'),
      disabled: currentTier === 'lab',
      highlight: false,
    },
  ]

  const handleCta = (planId) => {
    // TODO: Replace with Stripe Checkout session creation
    if (planId === 'free') return
    if (planId === 'lab') {
      window.open('mailto:support@voilapcr.com?subject=Lab%20Plan%20Inquiry', '_blank')
      return
    }
    alert('Stripe integration coming soon. You will be redirected to checkout.')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center px-6 pt-8 pb-4">
          <h2 className="font-display text-2xl font-bold mb-2">{t('pricing.title')}</h2>
          <p className="text-text-secondary dark:text-text-secondary-dark text-sm mb-6">
            {t('pricing.subtitle')}
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 bg-warm-bg dark:bg-warm-bg-dark rounded-lg p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                billing === 'monthly'
                  ? 'bg-surface dark:bg-surface-dark shadow-sm'
                  : 'text-text-secondary dark:text-text-secondary-dark'
              }`}
            >
              {t('pricing.monthly')}
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                billing === 'annual'
                  ? 'bg-surface dark:bg-surface-dark shadow-sm'
                  : 'text-text-secondary dark:text-text-secondary-dark'
              }`}
            >
              {t('pricing.annual')}
            </button>
          </div>
        </div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-4 px-6 pb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-6 flex flex-col ${
                plan.highlight
                  ? 'border-accent shadow-md ring-1 ring-accent/20'
                  : 'border-border dark:border-border-dark'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                  {t('pricing.popular')}
                </div>
              )}

              <h3 className="font-display text-lg font-bold">{plan.name}</h3>

              <div className="mt-3 mb-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-text-secondary dark:text-text-secondary-dark ml-1">
                  {plan.period}
                </span>
              </div>

              {plan.savings && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium mb-3">
                  {plan.savings}
                </p>
              )}

              <ul className="flex-1 space-y-2.5 my-5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 mt-0.5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCta(plan.id)}
                disabled={plan.disabled}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.disabled
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-default'
                    : plan.highlight
                      ? 'bg-accent hover:bg-accent-hover text-white'
                      : 'border border-border dark:border-border-dark hover:bg-warm-bg dark:hover:bg-warm-bg-dark'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

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
