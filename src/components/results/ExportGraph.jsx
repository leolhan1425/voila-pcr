import { useTranslation } from 'react-i18next'
import Plotly from 'plotly.js-dist-min'
import useStore from '../../store/useStore'

export default function ExportGraph() {
  const { t } = useTranslation()
  const { results } = useStore()

  const targets = results?.summary ? Object.keys(results.summary) : []

  const exportAll = (format) => {
    for (const target of targets) {
      const container = document.getElementById(`voila-chart-${target}`)
      const chartEl = container?.querySelector('.js-plotly-plot')
      if (!chartEl) continue

      const opts = {
        format,
        filename: `voilapcr-${target}`,
      }

      if (format === 'png') {
        // 300 DPI at 3.5 inches = 1050px
        opts.width = 1050
        opts.height = 750
        opts.scale = 3
      }

      Plotly.downloadImage(chartEl, opts)
    }
  }

  return (
    <>
      <button
        onClick={() => exportAll('svg')}
        className="px-6 py-2 text-sm font-medium border border-accent text-accent hover:bg-accent hover:text-white rounded-lg transition-colors"
      >
        {t('results.exportSvg')}{targets.length > 1 ? ` (${targets.length})` : ''}
      </button>
      <button
        onClick={() => exportAll('png')}
        className="px-6 py-2 text-sm font-medium border border-accent text-accent hover:bg-accent hover:text-white rounded-lg transition-colors"
      >
        {t('results.exportPng')}{targets.length > 1 ? ` (${targets.length})` : ''}
      </button>
    </>
  )
}
