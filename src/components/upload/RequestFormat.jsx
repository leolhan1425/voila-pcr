import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function RequestFormat({ onClose }) {
  const { t } = useTranslation()
  const [machine, setMachine] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // For MVP, use mailto: link
    const subject = encodeURIComponent(`VoilaPCR format request: ${machine}`)
    const body = encodeURIComponent(`Machine/instrument: ${machine}\n\nPlease add support for this format.`)
    window.open(`mailto:support@voilapcr.com?subject=${subject}&body=${body}`)
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-lg font-medium">
              {t('requestModal.thanks', { machine })}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-display font-bold mb-4">
              {t('requestModal.title')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('requestModal.email')}</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('requestModal.machine')}</label>
                <input
                  type="text"
                  required
                  value={machine}
                  onChange={(e) => setMachine(e.target.value)}
                  className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('requestModal.notes')}</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
              >
                {t('requestModal.submit')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
