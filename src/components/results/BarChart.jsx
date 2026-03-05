import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import LazyPlot from './LazyPlot'
import useStore from '../../store/useStore'

export default function BarChart() {
  const { t } = useTranslation()
  const { results, config } = useStore()
  const [errorBarType, setErrorBarType] = useState('sem')
  const [showDataPoints, setShowDataPoints] = useState(true)
  const plotRef = useRef(null)

  if (!results) return null

  const { summary, statistics } = results

  // Build traces per target
  const targets = Object.keys(summary)
  const traces = []
  const annotations = []

  for (const target of targets) {
    const groups = Object.keys(summary[target])
    const x = groups
    const y = groups.map((g) => summary[target][g].mean)
    const error = groups.map((g) =>
      errorBarType === 'sem' ? summary[target][g].sem : summary[target][g].sd
    )

    // Bar trace
    traces.push({
      type: 'bar',
      name: target,
      x,
      y,
      error_y: {
        type: 'data',
        array: error,
        visible: true,
        thickness: 1.5,
        width: 4,
        color: '#333',
      },
      marker: {
        color: '#e76f51',
        opacity: 0.85,
      },
    })

    // Individual data points overlay
    if (showDataPoints) {
      for (const group of groups) {
        const vals = summary[target][group].values
        if (!vals) continue
        const jitter = vals.map(() => (Math.random() - 0.5) * 0.15)
        traces.push({
          type: 'scatter',
          mode: 'markers',
          x: vals.map((_, i) => group),
          y: vals,
          marker: {
            color: '#2d2d2d',
            size: 6,
            opacity: 0.6,
          },
          showlegend: false,
          hoverinfo: 'y',
          // Jitter via transforms not supported in basic Plotly, positions handled by category
        })
      }
    }

    // Significance annotations
    if (statistics[target]) {
      const controlIdx = groups.indexOf(config.controlGroup)
      for (const [group, stat] of Object.entries(statistics[target])) {
        const groupIdx = groups.indexOf(group)
        if (groupIdx < 0 || controlIdx < 0) continue
        const maxY = Math.max(...y) + Math.max(...error) * 1.5

        annotations.push({
          x: group,
          y: maxY * 1.1,
          text: stat.stars,
          showarrow: false,
          font: { size: 14 },
        })
      }
    }
  }

  const layout = {
    font: { family: 'Arial, Helvetica, sans-serif', size: 10 },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    showlegend: targets.length > 1,
    legend: { orientation: 'h', y: -0.15 },
    xaxis: {
      title: '',
      showgrid: false,
      linecolor: '#333',
      linewidth: 1,
    },
    yaxis: {
      title: t('results.yAxisLabel'),
      showgrid: false,
      linecolor: '#333',
      linewidth: 1,
      rangemode: 'tozero',
    },
    annotations,
    margin: { l: 60, r: 20, t: 20, b: 60 },
    bargap: 0.3,
    bargroupgap: 0.1,
  }

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-text-secondary dark:text-text-secondary-dark">{t('results.errorBars')}:</span>
          <select
            value={errorBarType}
            onChange={(e) => setErrorBarType(e.target.value)}
            className="px-2 py-1 border border-border dark:border-border-dark rounded bg-surface dark:bg-surface-dark font-mono text-xs"
          >
            <option value="sem">{t('results.semOption')}</option>
            <option value="sd">{t('results.sdOption')}</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDataPoints}
            onChange={(e) => setShowDataPoints(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-text-secondary dark:text-text-secondary-dark">{t('results.showDataPoints')}</span>
        </label>
      </div>
      <div id="voila-chart" ref={plotRef}>
        <LazyPlot
          data={traces}
          layout={layout}
          config={{
            responsive: true,
            displayModeBar: false,
            staticPlot: false,
          }}
          style={{ width: '100%', height: '400px' }}
        />
      </div>
    </div>
  )
}
