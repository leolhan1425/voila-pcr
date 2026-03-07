import * as XLSX from 'xlsx'
import { inferGroups } from './types'

/**
 * ABI 7500 / 7500 Fast parser — handles .xls/.xlsx exports from the older
 * Applied Biosystems 7500 instruments.
 *
 * Similar structure to QuantStudio but uses "Detector" instead of "Target Name",
 * may have "SDS" format indicators, and metadata rows containing "7500" or
 * "Applied Biosystems".
 */
const abi7500 = {
  name: 'ABI 7500',

  detect(fileData) {
    if (fileData.type !== 'xlsx') return false
    const { workbook } = fileData

    // Check for "Results" sheet
    const resultsSheet = workbook.SheetNames.find(
      (n) => n.toLowerCase() === 'results'
    )
    if (!resultsSheet) return false

    const sheet = workbook.Sheets[resultsSheet]
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 })

    for (let i = 0; i < Math.min(rawRows.length, 60); i++) {
      const row = rawRows[i]
      if (!row) continue

      const rowStr = row.map((c) => String(c).toLowerCase()).join(' ')

      // ABI 7500 fingerprints in metadata
      if (rowStr.includes('7500') || rowStr.includes('sds')) return true
      if (rowStr.includes('applied biosystems') && !rowStr.includes('quantstudio')) return true

      // Check for the ABI-style header row with "Detector" column
      const strs = row.map((c) => String(c).toLowerCase().trim())
      const hasDetector = strs.some((s) => s === 'detector' || s === 'detector name')
      const hasSample = strs.some((s) => s === 'sample name')
      const hasCt = strs.some((s) => s === 'ct' || s === 'ct' || s === 'cт')
      const hasWell = strs.some((s) => s === 'well')
      if (hasDetector && hasSample && hasCt && hasWell) return true
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

    // Find the actual data header row
    let headerIdx = -1
    for (let i = 0; i < Math.min(rawRows.length, 80); i++) {
      const row = rawRows[i]
      if (!row) continue
      const strs = row.map((c) => String(c).toLowerCase().trim())
      const hasDetector = strs.some((s) => s === 'detector' || s === 'detector name')
      const hasSample = strs.some((s) => s === 'sample name')
      const hasCt = strs.some((s) => s === 'ct' || s === 'ct' || s === 'cт')
      if ((hasDetector || strs.some((s) => s === 'target name')) && hasSample && hasCt) {
        headerIdx = i
        break
      }
    }

    if (headerIdx < 0) {
      return emptyResult(fileName)
    }

    // Build column index mapping
    const headerRow = rawRows[headerIdx]
    const colIdx = {}
    for (let c = 0; c < headerRow.length; c++) {
      const name = String(headerRow[c]).toLowerCase().trim()
      if (name === 'well' && colIdx.well == null) colIdx.well = c
      if (name === 'sample name') colIdx.sample = c
      if (name === 'detector' || name === 'detector name' || name === 'target name') colIdx.target = c
      if ((name === 'ct' || name === 'cт') && colIdx.ct == null) colIdx.ct = c
      if (name === 'task') colIdx.task = c
      if (name === 'quantity') colIdx.quantity = c
    }

    // Extract instrument name from metadata
    let instrument = 'ABI 7500'
    for (let i = 0; i < headerIdx; i++) {
      const row = rawRows[i]
      if (!row) continue
      const label = String(row[0]).toLowerCase()
      if (label.includes('instrument') || label.includes('block type')) {
        const val = String(row[1]).trim().replace(/[™®]/g, '')
        if (val) {
          instrument = val.includes('7500') ? val : 'ABI 7500'
        }
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
        well: String(row[colIdx.well] ?? '').trim(),
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

function emptyResult(fileName) {
  return {
    wells: [],
    metadata: { instrument: 'ABI 7500', plateSize: 96, exportDate: '', fileName: fileName || '' },
    targets: [],
    samples: [],
    groups: [],
  }
}

export default abi7500
