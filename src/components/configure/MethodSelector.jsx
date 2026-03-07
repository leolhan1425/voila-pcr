import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'

const METHODS = [
  {
    value: 'ddct',
    labelKey: 'configure.methodDdct',
    labelDefault: 'DDCt (Livak)',
    descKey: 'configure.methodDdctDesc',
    descDefault: 'Standard relative quantification. Assumes equal primer efficiency.',
    pro: false,
  },
  {
    value: 'pfaffl',
    labelKey: 'configure.methodPfaffl',
    labelDefault: 'Pfaffl (efficiency-corrected)',
    descKey: 'configure.methodPfafflDesc',
    descDefault: 'Adjusts for measured primer efficiency differences.',
    pro: true,
  },
  {
    value: 'standardCurve',
    labelKey: 'configure.methodStdCurve',
    labelDefault: 'Standard Curve',
    descKey: 'configure.methodStdCurveDesc',
    descDefault: 'Absolute quantification using a dilution series.',
    pro: true,
  },
  {
    value: 'genorm',
    labelKey: 'configure.methodGeNorm',
    labelDefault: 'geNorm (multi-reference)',
    descKey: 'configure.methodGeNormDesc',
    descDefault: 'Uses multiple reference genes with stability scoring.',
    pro: true,
  },
]

export default function MethodSelector() {
  const { t } = useTranslation()
  const { config, setConfig, tier } = useStore()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const handleSelect = (method) => {
    if (method.pro && tier === 'free') {
      setShowUpgrade(true)
      setTimeout(() => setShowUpgrade(false), 3000)
      return
    }
    setConfig({ method: method.value })
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-3 text-text-primary dark:text-text-primary-dark">
        {t('configure.method', 'Analysis Method')}
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {METHODS.map((method) => {
          const isSelected = config.method === method.value
          const isLocked = method.pro && tier === 'free'

          return (
            <button
              key={method.value}
              onClick={() => handleSelect(method)}
              className={`relative text-left px-4 py-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-accent bg-accent/5 dark:bg-accent/10'
                  : 'border-border dark:border-border-dark hover:border-accent/50 bg-surface dark:bg-surface-dark'
              } ${isLocked ? 'opacity-75' : ''}`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-mono text-sm ${isSelected ? 'text-accent font-medium' : 'text-text-primary dark:text-text-primary-dark'}`}>
                  {t(method.labelKey, method.labelDefault)}
                </span>
                {method.pro && (
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono uppercase">
                    {isLocked && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    )}
                    Pro
                  </span>
                )}
              </div>
              <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark mt-1">
                {t(method.descKey, method.descDefault)}
              </p>

              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Upgrade prompt */}
      {showUpgrade && (
        <div className="mt-3 p-3 rounded-lg border border-accent/30 bg-accent/5 dark:bg-accent/10">
          <p className="text-xs text-text-primary dark:text-text-primary-dark">
            <span className="font-medium">{t('configure.proRequired', 'Pro feature')}</span>
            {' '}
            {t('configure.upgradeToUnlock', 'Upgrade to Pro to unlock advanced analysis methods including efficiency correction, absolute quantification, and multi-reference gene normalization.')}
          </p>
        </div>
      )}
    </div>
  )
}
