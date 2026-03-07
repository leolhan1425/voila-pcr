/**
 * Plate map utility functions — well position parsing, color assignment, grid helpers.
 */

// Color palette for sample/target views
const PLATE_COLORS = [
  '#4f86c6', '#e76f51', '#2a9d8f', '#e9c46a', '#9b5de5',
  '#f4845f', '#00b4d8', '#06d6a0', '#ef476f', '#ffd166',
  '#118ab2', '#073b4c',
]

// QC status colors
const QC_COLORS = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  gray: '#d1d5db',
}

/**
 * Parse a well position string into row letter and column number.
 * Handles: "A1", "A01", "A-1", numeric (1-96/1-384)
 */
export function parseWellPosition(wellString, plateSize = 96) {
  if (!wellString) return null
  const str = String(wellString).trim()

  // Letter + number: A1, A01, A-1
  const match = str.match(/^([A-Pa-p])[-]?(\d+)$/i)
  if (match) {
    return { row: match[1].toUpperCase(), col: parseInt(match[2]) }
  }

  // Numeric only: convert to row/col based on plate size
  const num = parseInt(str)
  if (!isNaN(num) && num > 0) {
    const cols = plateSize <= 96 ? 12 : 24
    const row = String.fromCharCode(65 + Math.floor((num - 1) / cols))
    const col = ((num - 1) % cols) + 1
    return { row, col }
  }

  return null
}

/**
 * Determine plate dimensions from plateSize metadata.
 */
export function getPlateDimensions(plateSize) {
  if (plateSize >= 384) return { rows: 16, cols: 24 }
  return { rows: 8, cols: 12 }
}

/**
 * Build a well lookup map from parsed wells array.
 * Returns: { "A1": [wellData, ...], "A2": [...], ... }
 * (Multiple entries per well when a well has multiple targets)
 */
export function buildWellMap(wells) {
  const map = {}
  for (const w of wells) {
    const pos = parseWellPosition(w.well)
    if (!pos) continue
    const key = `${pos.row}${pos.col}`
    if (!map[key]) map[key] = []
    map[key].push(w)
  }
  return map
}

/**
 * Build QC status map from diagnostic report.
 * Returns: { "A1": { status: 'red', issues: [...] }, ... }
 */
export function buildQCWellMap(diagnosticReport) {
  if (!diagnosticReport?.issues) return {}
  const wellMap = {}

  for (const issue of diagnosticReport.issues) {
    const status = issue.severity === 'critical' ? 'red' : 'yellow'
    for (const wellId of (issue.affectedWells || [])) {
      const pos = parseWellPosition(wellId)
      if (!pos) continue
      const key = `${pos.row}${pos.col}`
      if (!wellMap[key]) wellMap[key] = { status: 'green', issues: [] }
      wellMap[key].issues.push(issue)
      if (status === 'red' || wellMap[key].status === 'red') {
        wellMap[key].status = 'red'
      } else if (status === 'yellow') {
        wellMap[key].status = 'yellow'
      }
    }
  }

  return wellMap
}

/**
 * Assign colors to a list of unique names (samples or targets).
 * Returns: { name: color, ... }
 */
export function assignColors(names) {
  const map = {}
  names.forEach((name, i) => {
    map[name] = PLATE_COLORS[i % PLATE_COLORS.length]
  })
  return map
}

/**
 * Ct value to heatmap color (white → blue gradient).
 * Lower Ct = darker (more expression).
 */
export function ctToColor(ct, minCt = 10, maxCt = 40) {
  if (ct == null) return '#ffffff'
  const t = Math.max(0, Math.min(1, (ct - minCt) / (maxCt - minCt)))
  // Interpolate from dark blue (low Ct) to light blue (high Ct)
  const r = Math.round(20 + t * 225)
  const g = Math.round(60 + t * 190)
  const b = Math.round(180 + t * 70)
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Get the row letter from index (0=A, 1=B, ..., 15=P).
 */
export function rowLetter(index) {
  return String.fromCharCode(65 + index)
}

export { PLATE_COLORS, QC_COLORS }
