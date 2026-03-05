import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import { analyzeDdct } from '../../analysis/ddct'

export default function ConfigPanel() {
  const { t } = useTranslation()
  const { parsedData, config, setConfig, setResults, setStep } = useStore()

  if (!parsedData) return null

  const handleAnalyze = () => {
    const results = analyzeDdct(parsedData, config)
    setResults(results)
    setStep('results')
  }

  const canAnalyze = config.referenceGene && config.controlGroup

  return (
    <div>
      <h2 className="font-display text-2xl sm:text-3xl font-bold">
        {t('configure.title')}
      </h2>

      <div className="mt-8 space-y-6">
        {/* Analysis Method */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('configure.method')}</label>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg">
            <span className="font-mono text-sm">{t('configure.methodDdct')}</span>
          </div>
        </div>

        {/* Reference Gene */}
        <div>
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
              </button>
            ))}
          </div>
        </div>

        {/* Control Group */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('configure.controlGroup')}</label>
          <div className="flex flex-wrap gap-2">
            {parsedData.groups.map((group) => (
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

        {/* Replicate Handling */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.autoAverage}
              onChange={(e) => setConfig({ autoAverage: e.target.checked })}
              className="accent-accent"
            />
            {t('configure.autoAverage')}
          </label>
          {config.autoAverage && (
            <div className="flex items-center gap-3">
              <label className="text-sm text-text-secondary dark:text-text-secondary-dark">
                {t('configure.outlierThreshold')}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="5"
                value={config.outlierThreshold}
                onChange={(e) => setConfig({ outlierThreshold: parseFloat(e.target.value) })}
                className="w-20 px-2 py-1 border border-border dark:border-border-dark rounded bg-surface dark:bg-surface-dark font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>

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
