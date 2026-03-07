import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import useTier from '../../hooks/useTier'
import { generatePzfx } from '../../utils/prismExport'

export default function ExportPrism() {
  const { t } = useTranslation()
  const { results, config, setShowUpgradePrompt } = useStore()
  const { hasAccess } = useTier()
  const [exporting, setExporting] = useState(false)

  const handleExport = () => {
    if (!hasAccess('prismExport')) {
      setShowUpgradePrompt('prismExport')
      return
    }

    if (!results) return

    setExporting(true)

    try {
      const blob = generatePzfx(results, config)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'voilapcr-results.pzfx'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting || !results}
      className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium border border-accent text-accent hover:bg-accent hover:text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
      {exporting
        ? t('results.exporting', 'Exporting...')
        : t('results.exportPrism', 'Export for Prism (.pzfx)')}
      <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-accent text-white rounded">
        Pro
      </span>
    </button>
  )
}
