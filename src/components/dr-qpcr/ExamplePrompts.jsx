import { useTranslation } from 'react-i18next'

const PROMPTS = [
  'drqpcr.prompt.ntcAmplifying',
  'drqpcr.prompt.replicatesInconsistent',
  'drqpcr.prompt.referenceStable',
  'drqpcr.prompt.meltCurvePeaks',
  'drqpcr.prompt.standardCurve',
  'drqpcr.prompt.highFoldChanges',
]

const PROMPT_DEFAULTS = [
  'My NTC wells are amplifying',
  'Why are my replicates inconsistent?',
  'Is my reference gene stable enough?',
  'My melt curve shows multiple peaks',
  'How do I interpret my standard curve?',
  'My fold changes seem unreasonably high',
]

export default function ExamplePrompts({ onSend }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap gap-2 px-4 py-3">
      {PROMPTS.map((key, i) => (
        <button
          key={key}
          onClick={() => onSend(t(key, PROMPT_DEFAULTS[i]))}
          className="text-xs px-3 py-1.5 rounded-full border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark hover:border-accent hover:text-accent transition-colors"
        >
          {t(key, PROMPT_DEFAULTS[i])}
        </button>
      ))}
    </div>
  )
}
