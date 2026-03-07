import { useState, useMemo } from 'react'
import useStore from '../../store/useStore'
import { getPlateDimensions, buildWellMap, buildQCWellMap, assignColors } from './plateUtils'
import PlateGrid from './PlateGrid'
import WellDetail from './WellDetail'
import ColorLegend from './ColorLegend'

const VIEW_MODES = [
  { key: 'sample', label: 'Samples' },
  { key: 'target', label: 'Targets' },
  { key: 'ct', label: 'Ct Heatmap' },
  { key: 'qc', label: 'QC Status' },
]

/**
 * Main plate map component. Shows an interactive plate grid with multiple view modes.
 *
 * @param {Object} props
 * @param {boolean} [props.showQcView] - Whether QC view is available (requires diagnosticReport)
 */
export default function PlateMap({ showQcView = false }) {
  const { parsedData, sampleRoles, diagnosticReport } = useStore()
  const [viewMode, setViewMode] = useState('sample')
  const [selectedWell, setSelectedWell] = useState(null)

  if (!parsedData) return null

  const plateSize = parsedData.metadata?.plateSize || 96
  const { rows, cols } = getPlateDimensions(plateSize)
  const totalWells = rows * cols

  const wellMap = useMemo(() => buildWellMap(parsedData.wells), [parsedData.wells])
  const wellCount = Object.keys(wellMap).length

  const qcWellMap = useMemo(
    () => (diagnosticReport ? buildQCWellMap(diagnosticReport) : {}),
    [diagnosticReport]
  )

  const sampleColors = useMemo(
    () => assignColors(parsedData.samples),
    [parsedData.samples]
  )

  const targetColors = useMemo(
    () => assignColors(parsedData.targets),
    [parsedData.targets]
  )

  const colorMap = viewMode === 'target' ? targetColors : sampleColors

  const availableModes = showQcView
    ? VIEW_MODES
    : VIEW_MODES.filter((m) => m.key !== 'qc')

  function handleWellClick(wellId) {
    setSelectedWell(selectedWell === wellId ? null : wellId)
  }

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-lg font-bold">Plate Map</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
            {parsedData.metadata?.instrument && (
              <span>{parsedData.metadata.instrument}</span>
            )}
            <span>{totalWells}-well</span>
            <span>{wellCount} / {totalWells} wells with data</span>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex gap-1">
          {availableModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                viewMode === mode.key
                  ? 'border-accent bg-accent text-white'
                  : 'border-border dark:border-border-dark hover:border-accent/50 bg-surface dark:bg-surface-dark'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto pb-2">
        <PlateGrid
          rows={rows}
          cols={cols}
          wellMap={wellMap}
          colorMap={colorMap}
          qcWellMap={qcWellMap}
          viewMode={viewMode}
          sampleRoles={sampleRoles}
          selectedWell={selectedWell}
          onWellClick={handleWellClick}
        />
      </div>

      {/* Legend */}
      <ColorLegend
        viewMode={viewMode}
        colorMap={colorMap}
        sampleRoles={sampleRoles}
      />

      {/* Well detail panel */}
      {selectedWell && wellMap[selectedWell] && (
        <WellDetail
          wellId={selectedWell}
          entries={wellMap[selectedWell]}
          sampleRoles={sampleRoles}
          qcWellMap={qcWellMap}
          onClose={() => setSelectedWell(null)}
        />
      )}
    </div>
  )
}
