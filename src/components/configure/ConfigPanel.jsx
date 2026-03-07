import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import { autoClassifySamples, runQC } from '../../analysis/qc'
import { analyzeDdct } from '../../analysis/ddct'
import { analyzePfaffl } from '../../analysis/pfaffl'
import { analyzeStandardCurve } from '../../analysis/standardCurve'
import { analyzeGeNorm } from '../../analysis/genorm'
import SampleClassifier from './SampleClassifier'
import PlateMap from '../plate-map/PlateMap'
import QCReport from './QCReport'
import WellExclusion from './WellExclusion'
import MethodSelector from './MethodSelector'
import AdvancedOptions from './AdvancedOptions'
import SavedTemplates from './SavedTemplates'
import { incrementUsage, incrementTrialSession, canAnalyze as checkCanAnalyze } from '../../api/usage'
import useTier from '../../hooks/useTier'

export default function ConfigPanel() {
  const { t } = useTranslation()
  const {
    parsedData, config, setConfig,
    sampleRoles, setSampleRoles,
    qcReport, setQcReport,
    setResults, setStep,
    setShowPricing,
  } = useStore()
  const { tier, isPlus, inTrialSession, trialRemaining } = useTier()

  useEffect(() => {
    if (parsedData && Object.keys(sampleRoles).length === 0) {
      setSampleRoles(autoClassifySamples(parsedData.samples))
    }
  }, [parsedData, sampleRoles, setSampleRoles])

  useEffect(() => {
    if (parsedData && Object.keys(sampleRoles).length > 0) {
      const report = runQC(parsedData, sampleRoles, {
        outlierThreshold: config.outlierThreshold,
        dilutionFactor: config.dilutionFactor,
      })
      setQcReport(report)
    }
  }, [parsedData, sampleRoles, config.outlierThreshold, config.dilutionFactor, setQcReport])

  if (!parsedData) return null

  const expSamples = parsedData.samples.filter((s) => sampleRoles[s] === 'experimental')
  const expGroups = [...new Set(expSamples.map((s) => s.replace(/[\s_-]\d+$/, '')))]
  const hasStandards = Object.values(sampleRoles).some((r) => r === 'standard')

  const handleAnalyze = () => {

    const filteredData = {
      ...parsedData,
      wells: parsedData.wells.filter((w) => sampleRoles[w.sample] === 'experimental' && !w._excluded),
      samples: expSamples,
      groups: expGroups,
    }

    let results
    switch (config.method) {
      case 'pfaffl':
        results = analyzePfaffl(filteredData, config)
        break
      case 'standardCurve':
        results = analyzeStandardCurve(filteredData, config)
        break
      case 'genorm':
        results = analyzeGeNorm(filteredData, config)
        break
      default:
        results = analyzeDdct(filteredData, config)
    }

    // Check usage limits
    if (!checkCanAnalyze(tier)) {
      setShowPricing(true)
      return
    }

    results.qcReport = qcReport
    setResults(results)
    setStep('results')

    incrementUsage()
    // Track trial sessions for free users
    if (!isPlus && inTrialSession) {
      incrementTrialSession()
    }
  }

  const canAnalyze = config.method === 'genorm'
    ? config.referenceGenes?.length >= 2 && config.controlGroup
    : config.referenceGene && config.controlGroup

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold">
        {t('configure.title')}
      </h2>

      <SampleClassifier />
      <PlateMap />

      {hasStandards && (
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">{t('configure.dilutionFactor')}</label>
          <select
            value={config.dilutionFactor}
            onChange={(e) => setConfig({ dilutionFactor: parseInt(e.target.value) })}
            className="px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark font-mono text-sm"
          >
            <option value={2}>1:2 serial dilution</option>
            <option value={5}>1:5 serial dilution</option>
            <option value={10}>1:10 serial dilution</option>
          </select>
        </div>
      )}

      {qcReport && <QCReport />}
      <WellExclusion />

      <hr className="my-8 border-border dark:border-border-dark" />

      <MethodSelector />

      {/* Reference Gene */}
      {config.method !== 'genorm' ? (
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">{t('configure.referenceGene')}</label>
          <div className="flex flex-wrap gap-2">
            {parsedData.targets.map((target) => (
              <button
                key={target}
                onClick={() => setConfig({ referenceGene: target })}
                className={`px-4 py-2 rounded-lg border text-sm font-mono transition-colors ${
                  config.referenceGene === target
                    ? 'border-accent bg-accent text-white'
                    : 'border-border dark:border-border-dark hover:border-accent/50 bg-surface dark:bg-surface-dark'
                }`}
              >
                {target}
                {qcReport?.targets[target]?.status === 'fail' && (
                  <span className="ml-1.5 text-xs opacity-70">(failed QC)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <label className="block text-sm font-medium mb-2">{t('configure.referenceGenes')}</label>
          <div className="flex flex-wrap gap-2">
            {parsedData.targets.map((target) => (
              <button
                key={target}
                onClick={() => {
                  const current = config.referenceGenes || []
                  const updated = current.includes(target)
                    ? current.filter((t) => t !== target)
                    : [...current, target]
                  setConfig({ referenceGenes: updated })
                }}
                className={`px-4 py-2 rounded-lg border text-sm font-mono transition-colors ${
                  (config.referenceGenes || []).includes(target)
                    ? 'border-accent bg-accent text-white'
                    : 'border-border dark:border-border-dark hover:border-accent/50 bg-surface dark:bg-surface-dark'
                }`}
              >
                {target}
              </button>
            ))}
          </div>
          {(config.referenceGenes || []).length < 2 && (
            <p className="mt-2 text-xs text-text-secondary dark:text-text-secondary-dark">Select at least 2 candidate reference genes.</p>
          )}
        </div>
      )}

      {/* Control Group */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-2">{t('configure.controlGroup')}</label>
        <div className="flex flex-wrap gap-2">
          {expGroups.map((group) => (
            <button
              key={group}
              onClick={() => setConfig({ controlGroup: group })}
              className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                config.controlGroup === group
                  ? 'border-accent bg-accent text-white'
                  : 'border-border dark:border-border-dark hover:border-accent/50 bg-surface dark:bg-surface-dark'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      <AdvancedOptions targets={parsedData.targets} />

      <SavedTemplates />

      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={() => setStep('upload')}
          className="px-6 py-3 text-sm text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
        >
          {t('configure.back')}
        </button>
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            canAnalyze
              ? 'bg-accent hover:bg-accent-hover text-white'
              : 'bg-border dark:bg-border-dark text-text-secondary dark:text-text-secondary-dark cursor-not-allowed'
          }`}
        >
          {t('configure.analyze')}
        </button>
      </div>
    </div>
  )
}
