import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LazyPlot from './LazyPlot'
import useStore from '../../store/useStore'

const GRAY_PALETTE = [
  '#1a1a1a', '#666666', '#999999', '#bbbbbb', '#dddddd',
  '#444444', '#777777', '#aaaaaa', '#cccccc',
]

export default function BarChart() {
  const { t } = useTranslation()
  const { results, config, graphSettings } = useStore()
  const [errorBarType, setErrorBarType] = useState('sem')
  const [showDataPoints, setShowDataPoints] = useState(true)

  if (!results) return null

  const summary = results.summary || {}
  const statistics = results.statistics || {}
  const targets = Object.keys(summary)

  return (
    <div className="space-y-10">
      {/* Chart controls */}
      <div className="flex flex-wrap gap-4 text-sm items-center">
        <label className="flex items-center gap-2">
          <span className="text-text-secondary dark:text-text-secondary-dark">Error bars:</span>
          <select
            value={errorBarType}
            onChange={(e) => setErrorBarType(e.target.value)}
            className="px-2 py-1 border border-border dark:border-border-dark rounded bg-surface dark:bg-surface-dark font-mono text-xs"
          >
            <option value="sem">SEM</option>
            <option value="sd">SD</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDataPoints}
            onChange={(e) => setShowDataPoints(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-text-secondary dark:text-text-secondary-dark">Show individual data points</span>
        </label>
      </div>

      {/* One chart per target gene */}
      {targets.map((target) => (
        <SingleTargetChart
          key={target}
          target={target}
          groups={summary[target]}
          stats={statistics[target]}
          controlGroup={config.controlGroup}
          errorBarType={errorBarType}
          showDataPoints={showDataPoints}
          yAxisLabel={t('results.yAxisLabel')}
          customSettings={graphSettings[target] || graphSettings._global || {}}
        />
      ))}

      {/* Significance key */}
      <div className="text-xs font-mono text-text-secondary dark:text-text-secondary-dark border-t border-border dark:border-border-dark pt-3">
        <span className="font-medium">Significance: </span>
        * p &lt; 0.05 &nbsp;&nbsp; ** p &lt; 0.01 &nbsp;&nbsp; *** p &lt; 0.001 &nbsp;&nbsp; ns = not significant (p &ge; 0.05)
      </div>
    </div>
  )
}

function SingleTargetChart({ target, groups, stats, controlGroup, errorBarType, showDataPoints, yAxisLabel, customSettings }) {
  const groupNames = Object.keys(groups)
  const traces = []
  const annotations = []

  const {
    font = 'Arial, Helvetica, sans-serif',
    fontSize = 12,
    width,
    height,
    yScale = 'linear',
    showBrackets = true,
    colors: customColors,
    xLabel = '',
    yLabel,
  } = customSettings

  const y = groupNames.map((g) => groups[g].mean)
  const errorVals = groupNames.map((g) =>
    errorBarType === 'sem' ? groups[g].sem : groups[g].sd
  )
  const colors = customColors
    ? groupNames.map((_, i) => customColors[i] || GRAY_PALETTE[i % GRAY_PALETTE.length])
    : groupNames.map((_, i) => GRAY_PALETTE[i % GRAY_PALETTE.length])

  traces.push({
    type: 'bar',
    x: groupNames,
    y,
    error_y: {
      type: 'data',
      array: errorVals,
      visible: true,
      thickness: 2,
      width: 5,
      color: '#000000',
    },
    marker: {
      color: colors,
      line: { color: '#000000', width: 0 },
    },
    showlegend: false,
    hovertemplate: '%{x}<br>Mean: %{y:.3f}<br>+/-%{error_y.array:.3f}<extra></extra>',
  })

  if (showDataPoints) {
    for (const group of groupNames) {
      const vals = groups[group].values
      if (!vals || vals.length <= 1) continue
      traces.push({
        type: 'scatter',
        mode: 'markers',
        x: vals.map(() => group),
        y: vals,
        marker: {
          color: 'rgba(0,0,0,0)',
          size: 7,
          line: { color: '#000000', width: 1.5 },
        },
        showlegend: false,
        hoverinfo: 'y',
      })
    }
  }

  if (stats && showBrackets !== false) {
    const maxBarTop = Math.max(
      ...groupNames.map((g, i) => y[i] + (errorVals[i] || 0))
    )
    let annotY = maxBarTop * 1.08

    for (const [group, stat] of Object.entries(stats)) {
      if (group === controlGroup) continue
      const label = stat.stars === 'ns' ? 'ns' : stat.stars
      annotations.push({
        x: group,
        y: annotY,
        text: `<b>${label}</b>`,
        showarrow: false,
        font: { size: label === 'ns' ? 10 : 14, family: font, color: '#000' },
        yanchor: 'bottom',
      })
    }
  }

  const maxVal = Math.max(...groupNames.map((g, i) => y[i] + (errorVals[i] || 0)))
  const yMax = annotations.length > 0 ? maxVal * 1.25 : undefined

  const finalYLabel = yLabel || yAxisLabel

  const layout = {
    title: {
      text: `<b>${target}</b>`,
      font: { family: font, size: fontSize + 6, color: '#000' },
      x: 0.5,
      xanchor: 'center',
    },
    font: { family: font, size: fontSize, color: '#000' },
    paper_bgcolor: '#ffffff',
    plot_bgcolor: '#ffffff',
    showlegend: false,
    xaxis: {
      title: { text: xLabel, standoff: 15 },
      showgrid: false,
      zeroline: false,
      linecolor: '#000',
      linewidth: 2,
      tickfont: { size: fontSize, family: font, color: '#000' },
      tickangle: groupNames.some((g) => g.length > 8) ? -45 : 0,
    },
    yaxis: {
      title: {
        text: `<b>${finalYLabel}</b>`,
        font: { size: fontSize + 1, family: font, color: '#000' },
        standoff: 10,
      },
      showgrid: false,
      zeroline: false,
      linecolor: '#000',
      linewidth: 2,
      rangemode: 'tozero',
      range: yMax ? [0, yMax] : undefined,
      tickfont: { size: fontSize - 1, family: font, color: '#000' },
      ticks: 'outside',
      ticklen: 5,
      tickwidth: 2,
      tickcolor: '#000',
      type: yScale === 'log2' ? 'log' : 'linear',
    },
    annotations,
    margin: { l: 70, r: 30, t: 50, b: groupNames.some((g) => g.length > 8) ? 80 : 50 },
    bargap: 0.35,
  }

  const chartWidth = width ? `${width * 96}px` : '100%'
  const chartHeight = height ? `${height * 96}px` : '420px'

  return (
    <div id={`voila-chart-${target}`}>
      <LazyPlot
        data={traces}
        layout={layout}
        config={{ responsive: !width, displayModeBar: false }}
        style={{ width: chartWidth, height: chartHeight }}
      />
    </div>
  )
}
