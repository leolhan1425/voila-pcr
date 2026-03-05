import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'

const STEPS = ['upload', 'configure', 'results']

export default function ProgressStepper() {
  const { t } = useTranslation()
  const { step } = useStore()
  const currentIdx = STEPS.indexOf(step)

  return (
    <div className="border-b border-border dark:border-border-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center gap-2 text-sm">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && (
                <div className={`w-8 h-px ${i <= currentIdx ? 'bg-accent' : 'bg-border dark:bg-border-dark'}`} />
              )}
              <span
                className={`font-mono text-xs px-2 py-1 rounded ${
                  i === currentIdx
                    ? 'bg-accent text-white'
                    : i < currentIdx
                    ? 'text-accent'
                    : 'text-text-secondary dark:text-text-secondary-dark'
                }`}
              >
                {t(`steps.${s}`)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
