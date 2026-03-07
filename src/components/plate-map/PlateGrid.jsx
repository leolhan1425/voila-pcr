import { useState, useRef } from 'react'
import { rowLetter, parseWellPosition, ctToColor, QC_COLORS } from './plateUtils'
import WellTooltip from './WellTooltip'

/**
 * The visual grid of wells — CSS grid layout.
 * @param {Object} props
 * @param {number} props.rows - Number of rows (8 or 16)
 * @param {number} props.cols - Number of columns (12 or 24)
 * @param {Object} props.wellMap - { "A1": [wellData, ...], ... }
 * @param {Object} props.colorMap - { sampleOrTargetName: color, ... }
 * @param {Object} props.qcWellMap - { "A1": { status, issues }, ... }
 * @param {string} props.viewMode - 'sample' | 'target' | 'ct' | 'qc'
 * @param {Object} props.sampleRoles - { sampleName: role }
 * @param {string|null} props.selectedWell - Currently selected well ID
 * @param {function} props.onWellClick - Callback when well is clicked
 */
export default function PlateGrid({
  rows, cols, wellMap, colorMap, qcWellMap,
  viewMode, sampleRoles, selectedWell, onWellClick,
}) {
  const [hoveredWell, setHoveredWell] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const gridRef = useRef(null)

  const is384 = cols === 24
  const wellSize = is384 ? 'w-5 h-5' : 'w-8 h-8 sm:w-9 sm:h-9'
  const fontSize = is384 ? 'text-[7px]' : 'text-[9px]'
  const gap = is384 ? 'gap-[2px]' : 'gap-[3px]'

  function getWellColor(wellId) {
    const entries = wellMap[wellId]
    if (!entries || entries.length === 0) return null

    if (viewMode === 'qc') {
      const qcInfo = qcWellMap[wellId]
      return qcInfo ? QC_COLORS[qcInfo.status] : QC_COLORS.green
    }

    if (viewMode === 'ct') {
      const avgCt = entries.reduce((sum, w) => sum + (w.ct || 0), 0) / entries.length
      const hasUndetermined = entries.some((w) => w.ct == null)
      if (hasUndetermined && entries.every((w) => w.ct == null)) return '#ffffff'
      return ctToColor(avgCt)
    }

    if (viewMode === 'target') {
      return colorMap[entries[0].target] || '#d1d5db'
    }

    // Sample view (default)
    const sample = entries[0].sample
    if (sampleRoles[sample] === 'ntc') return '#6b7280'
    return colorMap[sample] || '#d1d5db'
  }

  function getWellBorder(wellId) {
    const entries = wellMap[wellId]
    if (!entries) return ''

    // NTC wells get a distinct border in sample view
    if (viewMode === 'sample' && sampleRoles[entries[0]?.sample] === 'ntc') {
      return 'ring-1 ring-gray-800 dark:ring-gray-300'
    }

    // QC view: pulse animation for critical issues
    if (viewMode === 'qc') {
      const qcInfo = qcWellMap[wellId]
      if (qcInfo?.status === 'red') return 'ring-1 ring-red-600 animate-pulse'
    }

    // Undetermined marker
    if (entries.every((w) => w.ct == null)) {
      return 'ring-1 ring-red-400/60'
    }

    return ''
  }

  function handleMouseEnter(wellId, e) {
    setHoveredWell(wellId)
    if (gridRef.current) {
      const gridRect = gridRef.current.getBoundingClientRect()
      const cellRect = e.currentTarget.getBoundingClientRect()
      setTooltipPos({
        top: cellRect.bottom - gridRect.top + 4,
        left: cellRect.left - gridRect.left,
      })
    }
  }

  return (
    <div className="relative" ref={gridRef}>
      <div
        className={`inline-grid ${gap}`}
        style={{
          gridTemplateColumns: `auto repeat(${cols}, 1fr)`,
          gridTemplateRows: `auto repeat(${rows}, 1fr)`,
        }}
      >
        {/* Top-left empty corner */}
        <div />

        {/* Column headers */}
        {Array.from({ length: cols }, (_, c) => (
          <div key={`col-${c}`} className={`flex items-end justify-center font-mono ${fontSize} text-text-secondary dark:text-text-secondary-dark pb-0.5`}>
            {c + 1}
          </div>
        ))}

        {/* Rows */}
        {Array.from({ length: rows }, (_, r) => {
          const letter = rowLetter(r)
          return [
            // Row label
            <div key={`row-${r}`} className={`flex items-center justify-center font-mono ${fontSize} text-text-secondary dark:text-text-secondary-dark pr-1`}>
              {letter}
            </div>,

            // Wells in this row
            ...Array.from({ length: cols }, (_, c) => {
              const wellId = `${letter}${c + 1}`
              const entries = wellMap[wellId]
              const hasData = entries && entries.length > 0
              const color = hasData ? getWellColor(wellId) : null
              const border = hasData ? getWellBorder(wellId) : ''
              const isSelected = selectedWell === wellId
              const isUndetermined = hasData && entries.every((w) => w.ct == null)

              return (
                <button
                  key={wellId}
                  className={`${wellSize} rounded-full transition-all duration-200 flex items-center justify-center ${fontSize} font-mono
                    ${hasData ? 'cursor-pointer hover:scale-110 hover:shadow-md' : 'cursor-default'}
                    ${isSelected ? 'ring-2 ring-accent scale-110 shadow-md' : ''}
                    ${border}
                    ${!hasData ? 'bg-gray-100 dark:bg-gray-800/40 opacity-40' : ''}
                  `}
                  style={hasData ? {
                    backgroundColor: color,
                    boxShadow: hasData ? 'inset 0 1px 2px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  } : {}}
                  onClick={() => hasData && onWellClick(wellId)}
                  onMouseEnter={(e) => hasData && handleMouseEnter(wellId, e)}
                  onMouseLeave={() => setHoveredWell(null)}
                >
                  {isUndetermined && viewMode === 'ct' && (
                    <span className="text-red-500 font-bold" style={{ fontSize: is384 ? 6 : 10 }}>✕</span>
                  )}
                </button>
              )
            }),
          ]
        }).flat()}
      </div>

      {/* Tooltip */}
      {hoveredWell && wellMap[hoveredWell] && (
        <WellTooltip
          wellId={hoveredWell}
          entries={wellMap[hoveredWell]}
          style={{ top: tooltipPos.top, left: Math.min(tooltipPos.left, 500) }}
        />
      )}
    </div>
  )
}
