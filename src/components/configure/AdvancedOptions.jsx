import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'

export default function AdvancedOptions() {
  const { t } = useTranslation()
  const { parsedData, config, setConfig } = useStore()
  const [expanded, setExpanded] = useState(false)

  if (!parsedData) return null

  const targets = parsedData.targets || []
  const method = config.method || 'ddct'

  // Track per-target primer efficiencies
  const efficiencies = config.efficiencies || {}
  const handleEfficiency = (target, value) => {
    setConfig({
      efficiencies: { ...efficiencies, [target]: parseFloat(value) || 100 },
    })
  }

  // Track multiple reference genes for geNorm
  const referenceGenes = config.referenceGenes || []
  const toggleReferenceGene = (target) => {
    const updated = referenceGenes.includes(target)
      ? referenceGenes.filter((g) => g !== target)
      : [...referenceGenes, target]
    setConfig({ referenceGenes: updated })
  }

  // Check if there's anything to show
  const showEfficiency = method === 'pfaffl'
  const showMultiRef = method === 'genorm'
  const showStdCurve = method === 'standardCurve'
  const hasAdvanced = showEfficiency || showMultiRef || showStdCurve

  if (!hasAdvanced) {
    // Still show outlier threshold in a minimal form
    return (
      <div className="mt-6">
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-secondary dark:text-text-secondary-dark">
            {t('configure.outlierThreshold', 'Outlier threshold (Ct deviation)')}
          </label>
          <input
            type="number"
            step={0.1}
            min={0.1}
            max={5}
            value={config.outlierThreshold}
            onChange={(e) => setConfig({ outlierThreshold: parseFloat(e.target.value) })}
            className="w-20 px-2 py-1 border border-border dark:border-border-dark rounded bg-surface dark:bg-surface-dark font-mono text-sm text-text-primary dark:text-text-primary-dark"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm font-medium text-text-primary dark:text-text-primary-dark hover:text-accent transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {t('configure.advancedOptions', 'Advanced Options')}
      </button>

      {expanded && (
        <div className="mt-4 ml-6 space-y-6 border-l-2 border-border dark:border-border-dark pl-4">
          {/* Outlier threshold — always shown */}
          <div>
            <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
              {t('configure.outlierThreshold', 'Outlier threshold (Ct deviation)')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0.1}
                max={3}
                step={0.1}
                value={config.outlierThreshold}
                onChange={(e) => setConfig({ outlierThreshold: parseFloat(e.target.value) })}
                className="flex-1 accent-accent"
              />
              <span className="font-mono text-sm text-text-primary dark:text-text-primary-dark w-12 text-right">
                {config.outlierThreshold.toFixed(1)}
              </span>
            </div>
            <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark mt-1">
              {t('configure.outlierHint', 'Replicates deviating more than this from the group mean will be flagged.')}
            </p>
          </div>

          {/* Primer efficiency inputs — Pfaffl only */}
          {showEfficiency && (
            <div>
              <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                {t('configure.primerEfficiency', 'Primer efficiency (%) per target')}
              </label>
              <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark mb-3">
                {t('configure.efficiencyHint', 'Enter measured primer efficiency from validation experiments. Default is 100% (perfect doubling).')}
              </p>
              <div className="space-y-2">
                {targets.map((target) => (
                  <div key={target} className="flex items-center gap-3">
                    <span className="font-mono text-xs text-text-primary dark:text-text-primary-dark w-24 truncate">
                      {target}
                    </span>
                    <input
                      type="number"
                      step={0.1}
                      min={50}
                      max={150}
                      value={efficiencies[target] ?? 100}
                      onChange={(e) => handleEfficiency(target, e.target.value)}
                      className="w-20 px-2 py-1 border border-border dark:border-border-dark rounded bg-warm-bg dark:bg-warm-bg-dark font-mono text-xs text-text-primary dark:text-text-primary-dark"
                    />
                    <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark">%</span>
                    {(efficiencies[target] ?? 100) < 90 || (efficiencies[target] ?? 100) > 110 ? (
                      <span className="text-[10px] text-amber-600 dark:text-amber-400">
                        {t('configure.outsideRange', 'Outside 90-110% range')}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Multiple reference gene selection — geNorm only */}
          {showMultiRef && (
            <div>
              <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                {t('configure.multipleRefGenes', 'Reference genes for geNorm')}
              </label>
              <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark mb-3">
                {t('configure.multiRefHint', 'Select 2 or more candidate reference genes. geNorm will calculate stability (M-value) and recommend the most stable combination.')}
              </p>
              <div className="flex flex-wrap gap-2">
                {targets.map((target) => {
                  const isSelected = referenceGenes.includes(target)
                  return (
                    <button
                      key={target}
                      onClick={() => toggleReferenceGene(target)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent text-white'
                          : 'border-border dark:border-border-dark hover:border-accent/50 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark'
                      }`}
                    >
                      {target}
                      {isSelected && (
                        <svg className="inline-block w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
              {referenceGenes.length > 0 && referenceGenes.length < 2 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-2">
                  {t('configure.needMoreRefs', 'Select at least 2 reference genes for geNorm analysis.')}
                </p>
              )}
            </div>
          )}

          {/* Standard curve dilution factor — standard curve only */}
          {showStdCurve && (
            <div>
              <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
                {t('configure.dilutionFactor', 'Standard curve dilution factor')}
              </label>
              <select
                value={config.dilutionFactor}
                onChange={(e) => setConfig({ dilutionFactor: parseInt(e.target.value) })}
                className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark font-mono text-sm text-text-primary dark:text-text-primary-dark"
              >
                <option value={2}>{t('configure.dilution2', '1:2 serial dilution')}</option>
                <option value={5}>{t('configure.dilution5', '1:5 serial dilution')}</option>
                <option value={10}>{t('configure.dilution10', '1:10 serial dilution')}</option>
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
