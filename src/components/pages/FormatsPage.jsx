import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import RequestFormat from '../upload/RequestFormat'

const FORMATS = [
  { name: 'QuantStudio', maker: 'Thermo Fisher / Applied Biosystems', models: 'QuantStudio 3, 5, 6, 7', formats: '.xls, .xlsx' },
  { name: 'ABI StepOne', maker: 'Applied Biosystems', models: 'StepOne, StepOnePlus', formats: '.xls, .xlsx, .csv' },
  { name: 'ABI 7500', maker: 'Applied Biosystems', models: '7500, 7500 Fast', formats: '.xls, .xlsx' },
  { name: 'Bio-Rad CFX', maker: 'Bio-Rad', models: 'CFX96, CFX384, CFX Opus', formats: '.csv, .xlsx' },
  { name: 'Roche LightCycler', maker: 'Roche', models: 'LightCycler 96, 480', formats: '.xlsx, .csv, .txt' },
  { name: 'QIAGEN Rotor-Gene Q', maker: 'QIAGEN / Corbett', models: 'Rotor-Gene Q, 6000', formats: '.xlsx, .csv' },
  { name: 'Agilent Stratagene Mx', maker: 'Agilent / Stratagene', models: 'Mx3000P, Mx3005P', formats: '.xls, .xlsx, .csv, .txt' },
  { name: 'Eppendorf realplex', maker: 'Eppendorf', models: 'Mastercycler ep realplex, realplex4', formats: '.txt, .xls, .xlsx' },
  { name: 'Mic qPCR', maker: 'Bio Molecular Systems', models: 'Mic (48-well rotary)', formats: '.csv' },
  { name: 'Fluidigm BioMark', maker: 'Standard BioTools (Fluidigm)', models: 'BioMark HD, EP1', formats: '.csv, .xlsx' },
  { name: 'Generic CSV', maker: 'Any instrument', models: 'Any machine with CSV export', formats: '.csv' },
]

export default function FormatsPage() {
  const { t } = useTranslation()
  const [showRequest, setShowRequest] = useState(false)

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-center">
        {t('pages.formats.title')}
      </h1>
      <p className="mt-4 text-center text-lg text-text-secondary dark:text-text-secondary-dark">
        {t('pages.formats.subtitle')}
      </p>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {FORMATS.map((fmt) => (
          <div key={fmt.name} className="p-5 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
            <h3 className="font-display text-lg font-bold">{fmt.name}</h3>
            <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-1">{fmt.maker}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-mono text-text-secondary dark:text-text-secondary-dark">
              <span>{fmt.models}</span>
              <span className="text-accent">{fmt.formats}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center">
        <button
          onClick={() => setShowRequest(true)}
          className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
        >
          {t('pages.formats.requestCta')}
        </button>
      </div>

      {showRequest && <RequestFormat onClose={() => setShowRequest(false)} />}
    </main>
  )
}
