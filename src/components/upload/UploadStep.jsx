import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import DropZone from './DropZone'
import FormatDetector from './FormatDetector'
import RequestFormat from './RequestFormat'

export default function UploadStep() {
  const { t } = useTranslation()
  const { parsedData, setStep } = useStore()
  const [showRequest, setShowRequest] = useState(false)

  return (
    <div className="text-center">
      <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight whitespace-pre-line">
        {t('upload.title')}
      </h1>
      <p className="mt-6 text-lg text-text-secondary dark:text-text-secondary-dark max-w-2xl mx-auto leading-relaxed">
        {t('upload.subtitle')}
      </p>

      <div className="mt-12">
        <DropZone />
      </div>

      {parsedData && (
        <div className="mt-8">
          <FormatDetector />
          <button
            onClick={() => setStep('configure')}
            className="mt-6 px-8 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
          >
            {t('upload.continue')}
          </button>
        </div>
      )}

      <div className="mt-12">
        <button
          onClick={() => setShowRequest(true)}
          className="text-sm text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors underline underline-offset-4"
        >
          {t('upload.requestFormat')}
        </button>
      </div>

      {showRequest && <RequestFormat onClose={() => setShowRequest(false)} />}
    </div>
  )
}
