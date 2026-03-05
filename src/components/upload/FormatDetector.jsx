import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'

export default function FormatDetector() {
  const { t } = useTranslation()
  const { parsedData } = useStore()

  if (!parsedData) return null

  return (
    <div className="inline-flex flex-col items-center gap-2 p-4 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg">
      <p className="font-mono text-sm font-medium text-accent">
        {t('upload.detected', { instrument: parsedData.metadata.instrument })}
      </p>
      <div className="flex gap-4 text-xs text-text-secondary dark:text-text-secondary-dark font-mono">
        <span>{t('upload.wells', { count: parsedData.wells.length })}</span>
        <span>{t('upload.targets', { count: parsedData.targets.length })}</span>
        <span>{t('upload.samples', { count: parsedData.samples.length })}</span>
      </div>
    </div>
  )
}
