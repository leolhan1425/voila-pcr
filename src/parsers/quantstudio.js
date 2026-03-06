import * as XLSX from 'xlsx'
import { inferGroups } from './types'

/**
 * QuantStudio parser — handles .xls/.xlsx exports from QuantStudio 3/5/6/7.
 *
 * Real-world QuantStudio exports have 40+ rows of calibration/instrument metadata
 * before the actual data header row in the Results sheet. This parser scans for
 * the header row dynamically.
 */
const quantstudio = {
  name: 'QuantStudio',

  detect(fileData) {
    if (fileData.type !== 'xlsx') return false
    const { workbook } = fileData

    // Check for "Results" sheet
    const resultsSheet = workbook.SheetNames.find(
      (n) => n.toLowerCase() === 'results'
    )
    if (!resultsSheet) return false

    // Scan for QuantStudio fingerprints in metadata rows or the header row
    const sheet = workbook.Sheets[resultsSheet]
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 })

    for (let i = 0; i < Math.min(rawRows.length, 60); i++) {
      const row = rawRows[i]
      if (!row) continue

      // Check for QuantStudio instrument name in metadata
      const rowStr = row.map((c) => String(c).toLowerCase()).join(' ')
      if (rowStr.includes('quantstudio') || rowStr.includes('quantstudio')) return true

      // Check for the data header row with expected columns
      const strs = row.map((c) => String(c).toLowerCase().trim())
      const hasSample = strs.some((s) => s === 'sample name')
      const hasTarget = strs.some((s) => s === 'target name')
      const hasCt = strs.some((s) => s === 'ct' || s === 'cт' || s === 'cq')
      const hasWell = strs.some((s) => s === 'well' || s === 'well position')
      if (hasSample && hasTarget && hasCt && hasWell) return true
    }

    return false
  },

  parse(fileData, fileName) {
    const { workbook } = fileData
    const resultsSheet = workbook.SheetNames.find(
      (n) => n.toLowerCase() === 'results'
    )
    const sheet = workbook.Sheets[resultsSheet]
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 })

    // Find the actual data header row by scanning for key column names
    let headerIdx = -1
    for (let i = 0; i < Math.min(rawRows.length, 80); i++) {
      const row = rawRows[i]
      if (!row) continue
      const strs = row.map((c) => String(c).toLowerCase().trim())
      const hasSample = strs.some((s) => s === 'sample name')
      const hasTarget = strs.some((s) => s === 'target name')
      const hasCt = strs.some((s) => s === 'ct' || s === 'cт' || s === 'cq')
      if (hasSample && hasTarget && hasCt) {
        headerIdx = i
        break
      }
    }

    if (headerIdx < 0) {
      return { wells: [], metadata: { instrument: 'QuantStudio', plateSize: 96, exportDate: '', fileName: fileName || '' }, targets: [], samples: [], groups: [] }
    }

    // Build column index mapping from the header row
    const headerRow = rawRows[headerIdx]
    const colIdx = {}
    for (let c = 0; c < headerRow.length; c++) {
      const name = String(headerRow[c]).toLowerCase().trim()
      if (name === 'well' && colIdx.well == null) colIdx.well = c
      if (name === 'well position') colIdx.wellPosition = c
      if (name === 'sample name') colIdx.sample = c
      if (name === 'target name') colIdx.target = c
      if (name === 'ct' || name === 'cт' || name === 'cq') colIdx.ct = c
      if (name === 'task') colIdx.task = c
      if (name === 'quantity') colIdx.quantity = c
    }

    // Extract instrument name from metadata if available
    let instrument = 'QuantStudio'
    for (let i = 0; i < headerIdx; i++) {
      const row = rawRows[i]
      if (row && String(row[0]).toLowerCase().includes('instrument type')) {
        instrument = String(row[1]).trim().replace(/[™®]/g, '') || 'QuantStudio'
        break
      }
    }

    const wells = []
    const targetsSet = new Set()
    const samplesSet = new Set()

    for (let i = headerIdx + 1; i < rawRows.length; i++) {
      const row = rawRows[i]
      if (!row) continue

      const sample = String(row[colIdx.sample] ?? '').trim()
      const target = String(row[colIdx.target] ?? '').trim()
      if (!sample || !target) continue

      const ctRaw = row[colIdx.ct]
      const ct = ctRaw === 'Undetermined' || ctRaw === '' || ctRaw == null
        ? null
        : parseFloat(ctRaw)

      wells.push({
        well: String(row[colIdx.wellPosition] ?? row[colIdx.well] ?? '').trim(),
        sample,
        target,
        ct: isNaN(ct) ? null : ct,
        quantity: colIdx.quantity != null ? parseFloat(row[colIdx.quantity]) || null : null,
        taskType: String(row[colIdx.task] ?? 'UNKNOWN').toUpperCase(),
      })

      targetsSet.add(target)
      samplesSet.add(sample)
    }

    const samples = [...samplesSet]
    const targets = [...targetsSet]

    return {
      wells,
      metadata: {
        instrument,
        plateSize: wells.length > 96 ? 384 : 96,
        exportDate: '',
        fileName: fileName || '',
      },
      targets,
      samples,
      groups: inferGroups(samples),
    }
  },
}

export default quantstudio
