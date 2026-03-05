import { useTranslation } from 'react-i18next'
import Plotly from 'plotly.js-dist-min'

export default function ExportGraph() {
  const { t } = useTranslation()

  const exportSvg = () => {
    const chartEl = document.getElementById('voila-chart')?.querySelector('.js-plotly-plot')
    if (!chartEl) return
    Plotly.downloadImage(chartEl, {
      format: 'svg',
      filename: 'voilapcr-chart',
    })
  }

  const exportPng = () => {
    const chartEl = document.getElementById('voila-chart')?.querySelector('.js-plotly-plot')
    if (!chartEl) return
    // 300 DPI at 3.5 inches wide = 1050px
    Plotly.downloadImage(chartEl, {
      format: 'png',
      width: 1050,
      height: 750,
      scale: 3, // 300 DPI effective resolution
      filename: 'voilapcr-chart',
    })
  }

  return (
    <>
      <button
        onClick={exportSvg}
        className="px-6 py-2 text-sm font-medium border border-accent text-accent hover:bg-accent hover:text-white rounded-lg transition-colors"
      >
        {t('results.exportSvg')}
      </button>
      <button
        onClick={exportPng}
        className="px-6 py-2 text-sm font-medium border border-accent text-accent hover:bg-accent hover:text-white rounded-lg transition-colors"
      >
        {t('results.exportPng')}
      </button>
    </>
  )
}
