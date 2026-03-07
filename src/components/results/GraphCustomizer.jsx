import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const JOURNAL_PRESETS = {
  nature: {
    label: 'Nature',
    fontFamily: 'Arial',
    fontSize: 7,
    width: 3.5,
    height: 2.5,
    showGridlines: false,
  },
  cell: {
    label: 'Cell',
    fontFamily: 'Helvetica',
    fontSize: 8,
    width: 3.4,
    height: 2.5,
    showGridlines: false,
  },
  plosone: {
    label: 'PLOS ONE',
    fontFamily: 'Arial',
    fontSize: 8,
    width: 5.2,
    height: 3.5,
    showGridlines: false,
  },
}

const DIMENSION_PRESETS = [
  { label: 'Single column (3.5")', width: 3.5, height: 2.5 },
  { label: '1.5 column (5")', width: 5, height: 3.5 },
  { label: 'Double column (7")', width: 7, height: 4.5 },
]

const FONT_OPTIONS = [
  'Arial',
  'Helvetica',
  'Times New Roman',
]

export default function GraphCustomizer({ target, onUpdate }) {
  const { t } = useTranslation()

  const [groupColors, setGroupColors] = useState({})
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontSize, setFontSize] = useState(10)
  const [xAxisLabel, setXAxisLabel] = useState('')
  const [yAxisLabel, setYAxisLabel] = useState('Relative Expression (Fold Change)')
  const [width, setWidth] = useState(3.5)
  const [height, setHeight] = useState(2.5)
  const [yScale, setYScale] = useState('linear')
  const [showSignificance, setShowSignificance] = useState(true)
  const [activePreset, setActivePreset] = useState(null)

  // Emit customization object whenever any setting changes
  const emitUpdate = useCallback(() => {
    onUpdate({
      target,
      groupColors,
      fontFamily,
      fontSize,
      xAxisLabel,
      yAxisLabel,
      width,
      height,
      yScale,
      showSignificance,
    })
  }, [target, groupColors, fontFamily, fontSize, xAxisLabel, yAxisLabel, width, height, yScale, showSignificance, onUpdate])

  useEffect(() => {
    emitUpdate()
  }, [emitUpdate])

  const applyPreset = (presetKey) => {
    const preset = JOURNAL_PRESETS[presetKey]
    if (!preset) return

    setFontFamily(preset.fontFamily)
    setFontSize(preset.fontSize)
    setWidth(preset.width)
    setHeight(preset.height)
    setActivePreset(presetKey)
  }

  const applyDimensionPreset = (preset) => {
    setWidth(preset.width)
    setHeight(preset.height)
    setActivePreset(null)
  }

  const handleColorChange = (group, color) => {
    setGroupColors((prev) => ({ ...prev, [group]: color }))
  }

  return (
    <div className="space-y-5 p-4 border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
          {t('graphCustomizer.title', 'Graph Customization')}
        </h4>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono uppercase">
          {t('graphCustomizer.pro', 'Pro')}
        </span>
      </div>

      {/* Journal presets */}
      <div>
        <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
          {t('graphCustomizer.journalPresets', 'Journal presets')}
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(JOURNAL_PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPreset(key)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                activePreset === key
                  ? 'border-accent bg-accent text-white'
                  : 'border-border dark:border-border-dark hover:border-accent/50 text-text-primary dark:text-text-primary-dark'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Font settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            {t('graphCustomizer.fontFamily', 'Font')}
          </label>
          <select
            value={fontFamily}
            onChange={(e) => { setFontFamily(e.target.value); setActivePreset(null) }}
            className="w-full px-2 py-1.5 text-xs border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark text-text-primary dark:text-text-primary-dark"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            {t('graphCustomizer.fontSize', 'Font size')}
            <span className="ml-1 font-mono text-text-secondary dark:text-text-secondary-dark">{fontSize}pt</span>
          </label>
          <input
            type="range"
            min={6}
            max={14}
            step={1}
            value={fontSize}
            onChange={(e) => { setFontSize(parseInt(e.target.value)); setActivePreset(null) }}
            className="w-full accent-accent"
          />
        </div>
      </div>

      {/* Axis labels */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            {t('graphCustomizer.xAxisLabel', 'X axis label')}
          </label>
          <input
            type="text"
            value={xAxisLabel}
            onChange={(e) => setXAxisLabel(e.target.value)}
            placeholder={t('graphCustomizer.xAxisPlaceholder', 'e.g., Treatment Groups')}
            className="w-full px-2 py-1.5 text-xs border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            {t('graphCustomizer.yAxisLabel', 'Y axis label')}
          </label>
          <input
            type="text"
            value={yAxisLabel}
            onChange={(e) => setYAxisLabel(e.target.value)}
            placeholder={t('graphCustomizer.yAxisPlaceholder', 'e.g., Relative Expression')}
            className="w-full px-2 py-1.5 text-xs border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50"
          />
        </div>
      </div>

      {/* Dimensions */}
      <div>
        <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
          {t('graphCustomizer.dimensions', 'Figure dimensions')}
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {DIMENSION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => applyDimensionPreset(preset)}
              className={`px-2.5 py-1 text-[11px] rounded border transition-colors ${
                width === preset.width && height === preset.height
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border dark:border-border-dark text-text-secondary dark:text-text-secondary-dark hover:border-accent/50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <label className="text-[11px] text-text-secondary dark:text-text-secondary-dark">W</label>
            <input
              type="number"
              step={0.1}
              min={1}
              max={12}
              value={width}
              onChange={(e) => setWidth(parseFloat(e.target.value))}
              className="w-16 px-1.5 py-1 text-xs border border-border dark:border-border-dark rounded bg-warm-bg dark:bg-warm-bg-dark font-mono text-text-primary dark:text-text-primary-dark"
            />
          </div>
          <span className="text-text-secondary dark:text-text-secondary-dark text-xs">x</span>
          <div className="flex items-center gap-1">
            <label className="text-[11px] text-text-secondary dark:text-text-secondary-dark">H</label>
            <input
              type="number"
              step={0.1}
              min={1}
              max={12}
              value={height}
              onChange={(e) => setHeight(parseFloat(e.target.value))}
              className="w-16 px-1.5 py-1 text-xs border border-border dark:border-border-dark rounded bg-warm-bg dark:bg-warm-bg-dark font-mono text-text-primary dark:text-text-primary-dark"
            />
          </div>
          <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark font-mono">
            {t('graphCustomizer.inches', 'in')}
          </span>
        </div>
      </div>

      {/* Group colors */}
      <div>
        <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
          {t('graphCustomizer.barColors', 'Bar colors')}
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(groupColors).map(([group, color]) => (
            <label key={group} className="flex items-center gap-1.5 text-xs">
              <input
                type="color"
                value={color}
                onChange={(e) => handleColorChange(group, e.target.value)}
                className="w-6 h-6 rounded border border-border dark:border-border-dark cursor-pointer"
              />
              <span className="font-mono text-text-primary dark:text-text-primary-dark">{group}</span>
            </label>
          ))}
          {Object.keys(groupColors).length === 0 && (
            <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark italic">
              {t('graphCustomizer.colorsNote', 'Colors will appear once data is loaded')}
            </p>
          )}
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            {t('graphCustomizer.yScale', 'Y-axis scale')}
          </label>
          <div className="flex rounded-lg border border-border dark:border-border-dark overflow-hidden">
            <button
              onClick={() => setYScale('linear')}
              className={`px-3 py-1 text-xs transition-colors ${
                yScale === 'linear'
                  ? 'bg-accent text-white'
                  : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
              }`}
            >
              {t('graphCustomizer.linear', 'Linear')}
            </button>
            <button
              onClick={() => setYScale('log2')}
              className={`px-3 py-1 text-xs font-mono transition-colors ${
                yScale === 'log2'
                  ? 'bg-accent text-white'
                  : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
              }`}
            >
              log2
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs pt-4">
          <input
            type="checkbox"
            checked={showSignificance}
            onChange={(e) => setShowSignificance(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-text-primary dark:text-text-primary-dark">
            {t('graphCustomizer.showSignificance', 'Significance brackets')}
          </span>
        </label>
      </div>
    </div>
  )
}
