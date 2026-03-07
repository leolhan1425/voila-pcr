import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useTier from '../../hooks/useTier'
import useStore from '../../store/useStore'

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
  science: {
    label: 'Science',
    fontFamily: 'Helvetica',
    fontSize: 7,
    width: 3.5,
    height: 2.5,
    showGridlines: false,
  },
}

const DIMENSION_PRESETS = [
  { label: 'Single column (3.5")', width: 3.5, height: 3 },
  { label: '1.5 column (5")', width: 5, height: 4 },
  { label: 'Double column (7")', width: 7, height: 5 },
  { label: 'Poster (10")', width: 10, height: 8 },
]

const FONT_OPTIONS = ['Arial', 'Helvetica', 'Times New Roman']

const ERROR_BAR_OPTIONS = [
  { value: 'sem', label: 'SEM' },
  { value: 'sd', label: 'SD' },
  { value: '95ci', label: '95% CI' },
  { value: 'none', label: 'None' },
]

export default function GraphCustomizer({ target, onUpdate }) {
  const { t } = useTranslation()
  const { canUseGraphCustomizer } = useTier()
  const { setShowUpgradePrompt } = useStore()

  const [groupColors, setGroupColors] = useState({})
  const [fontFamily, setFontFamily] = useState('Arial')
  const [fontSize, setFontSize] = useState(10)
  const [xAxisLabel, setXAxisLabel] = useState('')
  const [yAxisLabel, setYAxisLabel] = useState('Relative Expression (Fold Change)')
  const [width, setWidth] = useState(3.5)
  const [height, setHeight] = useState(3)
  const [yScale, setYScale] = useState('linear')
  const [yMin, setYMin] = useState('')
  const [yMax, setYMax] = useState('')
  const [showSignificance, setShowSignificance] = useState(true)
  const [showDataPoints, setShowDataPoints] = useState(true)
  const [dotSize, setDotSize] = useState(5)
  const [jitter, setJitter] = useState(0.15)
  const [errorBarType, setErrorBarType] = useState('sem')
  const [barWidth, setBarWidth] = useState(0.7)
  const [showLegend, setShowLegend] = useState(true)
  const [bgTransparent, setBgTransparent] = useState(false)
  const [activePreset, setActivePreset] = useState(null)

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
      yMin: yMin === '' ? null : parseFloat(yMin),
      yMax: yMax === '' ? null : parseFloat(yMax),
      showSignificance,
      showDataPoints,
      dotSize,
      jitter,
      errorBarType,
      barWidth,
      showLegend,
      bgTransparent,
    })
  }, [target, groupColors, fontFamily, fontSize, xAxisLabel, yAxisLabel, width, height, yScale, yMin, yMax, showSignificance, showDataPoints, dotSize, jitter, errorBarType, barWidth, showLegend, bgTransparent, onUpdate])

  useEffect(() => {
    emitUpdate()
  }, [emitUpdate])

  const applyPreset = (presetKey) => {
    if (!canUseGraphCustomizer) {
      setShowUpgradePrompt('graphCustomizer')
      return
    }
    const preset = JOURNAL_PRESETS[presetKey]
    if (!preset) return
    setFontFamily(preset.fontFamily)
    setFontSize(preset.fontSize)
    setWidth(preset.width)
    setHeight(preset.height)
    setActivePreset(presetKey)
  }

  const applyDimensionPreset = (preset) => {
    if (!canUseGraphCustomizer) {
      setShowUpgradePrompt('graphCustomizer')
      return
    }
    setWidth(preset.width)
    setHeight(preset.height)
    setActivePreset(null)
  }

  const handleColorChange = (group, color) => {
    if (!canUseGraphCustomizer) {
      setShowUpgradePrompt('graphCustomizer')
      return
    }
    setGroupColors((prev) => ({ ...prev, [group]: color }))
  }

  const proGate = (setter) => (value) => {
    if (!canUseGraphCustomizer) {
      setShowUpgradePrompt('graphCustomizer')
      return
    }
    setter(value)
  }

  const ProBadge = () => (
    <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono uppercase">Pro</span>
  )

  return (
    <div className="space-y-5 p-4 border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
          {t('graphCustomizer.title', 'Graph Customization')}
        </h4>
        {!canUseGraphCustomizer && <ProBadge />}
      </div>

      {/* Journal presets */}
      <div>
        <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
          {t('graphCustomizer.journalPresets', 'Journal presets')}
          {!canUseGraphCustomizer && <span className="ml-1"><ProBadge /></span>}
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
            {!canUseGraphCustomizer && <span className="ml-1"><ProBadge /></span>}
          </label>
          <select
            value={fontFamily}
            onChange={(e) => proGate(setFontFamily)(e.target.value)}
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
            onChange={(e) => proGate(setFontSize)(parseInt(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      </div>

      {/* Axis labels — free tier can edit these */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            {t('graphCustomizer.xAxisLabel', 'X axis label')}
          </label>
          <input
            type="text"
            value={xAxisLabel}
            onChange={(e) => setXAxisLabel(e.target.value)}
            placeholder="e.g., Treatment Groups"
            className="w-full px-2 py-1.5 text-xs border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50"
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
            placeholder="e.g., Relative Expression"
            className="w-full px-2 py-1.5 text-xs border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50"
          />
        </div>
      </div>

      {/* Y-axis range — free tier can adjust */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Y-axis min
          </label>
          <input
            type="number"
            step="any"
            value={yMin}
            onChange={(e) => setYMin(e.target.value)}
            placeholder="auto"
            className="w-full px-2 py-1.5 text-xs border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark font-mono text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Y-axis max
          </label>
          <input
            type="number"
            step="any"
            value={yMax}
            onChange={(e) => setYMax(e.target.value)}
            placeholder="auto"
            className="w-full px-2 py-1.5 text-xs border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark font-mono text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            {t('graphCustomizer.yScale', 'Y-axis scale')}
          </label>
          <div className="flex rounded-lg border border-border dark:border-border-dark overflow-hidden">
            <button
              onClick={() => setYScale('linear')}
              className={`flex-1 px-2 py-1.5 text-xs transition-colors ${
                yScale === 'linear' ? 'bg-accent text-white' : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark'
              }`}
            >
              Linear
            </button>
            <button
              onClick={() => setYScale('log2')}
              className={`flex-1 px-2 py-1.5 text-xs font-mono transition-colors ${
                yScale === 'log2' ? 'bg-accent text-white' : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark'
              }`}
            >
              log2
            </button>
          </div>
        </div>
      </div>

      {/* Error bars */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Error Bars
          </label>
          <div className="flex rounded-lg border border-border dark:border-border-dark overflow-hidden">
            {ERROR_BAR_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setErrorBarType(opt.value)}
                className={`flex-1 px-2 py-1.5 text-xs transition-colors ${
                  errorBarType === opt.value
                    ? 'bg-accent text-white'
                    : 'bg-surface dark:bg-surface-dark text-text-secondary dark:text-text-secondary-dark'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
            Bar width
            {!canUseGraphCustomizer && <span className="ml-1"><ProBadge /></span>}
            <span className="ml-1 font-mono">{barWidth}</span>
          </label>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.05}
            value={barWidth}
            onChange={(e) => proGate(setBarWidth)(parseFloat(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      </div>

      {/* Data points */}
      <div className="grid grid-cols-3 gap-3">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={showDataPoints}
            onChange={(e) => proGate(setShowDataPoints)(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-text-primary dark:text-text-primary-dark">
            Dot overlay
            {!canUseGraphCustomizer && <span className="ml-1"><ProBadge /></span>}
          </span>
        </label>
        {showDataPoints && (
          <>
            <div>
              <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                Dot size <span className="font-mono">{dotSize}</span>
              </label>
              <input
                type="range"
                min={2}
                max={12}
                step={1}
                value={dotSize}
                onChange={(e) => proGate(setDotSize)(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-1">
                Jitter <span className="font-mono">{jitter}</span>
              </label>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.05}
                value={jitter}
                onChange={(e) => proGate(setJitter)(parseFloat(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          </>
        )}
      </div>

      {/* Dimensions */}
      <div>
        <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
          {t('graphCustomizer.dimensions', 'Figure dimensions')}
          {!canUseGraphCustomizer && <span className="ml-1"><ProBadge /></span>}
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
              onChange={(e) => proGate(setWidth)(parseFloat(e.target.value))}
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
              onChange={(e) => proGate(setHeight)(parseFloat(e.target.value))}
              className="w-16 px-1.5 py-1 text-xs border border-border dark:border-border-dark rounded bg-warm-bg dark:bg-warm-bg-dark font-mono text-text-primary dark:text-text-primary-dark"
            />
          </div>
          <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark font-mono">in</span>
        </div>
      </div>

      {/* Group colors */}
      <div>
        <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
          {t('graphCustomizer.barColors', 'Bar colors')}
          {!canUseGraphCustomizer && <span className="ml-1"><ProBadge /></span>}
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
              Colors will appear once data is loaded
            </p>
          )}
        </div>
      </div>

      {/* Toggles row */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={showSignificance}
            onChange={(e) => proGate(setShowSignificance)(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-text-primary dark:text-text-primary-dark">
            Significance brackets
            {!canUseGraphCustomizer && <span className="ml-1"><ProBadge /></span>}
          </span>
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={showLegend}
            onChange={(e) => proGate(setShowLegend)(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-text-primary dark:text-text-primary-dark">
            Show legend
          </span>
        </label>

        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={bgTransparent}
            onChange={(e) => proGate(setBgTransparent)(e.target.checked)}
            className="accent-accent"
          />
          <span className="text-text-primary dark:text-text-primary-dark">
            Transparent background
            {!canUseGraphCustomizer && <span className="ml-1"><ProBadge /></span>}
          </span>
        </label>
      </div>
    </div>
  )
}
