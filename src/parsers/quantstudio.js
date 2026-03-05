import * as XLSX from 'xlsx'
import { inferGroups } from './types'

/**
 * QuantStudio parser — handles .xlsx exports from QuantStudio 3/5/6/7.
 * Looks for a "Results" sheet with columns: Well, Well Position, Sample Name, Target Name, CT
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

    // Check for QuantStudio-specific column headers
    const sheet = workbook.Sheets[resultsSheet]
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' })
    if (rows.length === 0) return false

    const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
    const needed = ['well position', 'sample name', 'target name']
    const hasCtCol = headers.some((h) => h === 'ct' || h === 'cт' || h === 'cq')
    return needed.every((n) => headers.some((h) => h.includes(n.replace(' ', ' ')))) && hasCtCol
  },

  parse(fileData, fileName) {
    const { workbook } = fileData
    const resultsSheet = workbook.SheetNames.find(
      (n) => n.toLowerCase() === 'results'
    )
    const sheet = workbook.Sheets[resultsSheet]

    // QuantStudio files often have metadata rows before the actual data header.
    // We need to find the row that contains the actual column headers.
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' })

    // Normalize headers: find the key mapping
    const headerMap = {}
    const firstRow = rawRows[0]
    for (const key of Object.keys(firstRow)) {
      const lower = key.toLowerCase().trim()
      if (lower === 'well' && !headerMap.well) headerMap.well = key
      if (lower === 'well position') headerMap.wellPosition = key
      if (lower === 'sample name') headerMap.sample = key
      if (lower === 'target name') headerMap.target = key
      if (lower === 'ct' || lower === 'cт' || lower === 'cq') headerMap.ct = key
      if (lower === 'task') headerMap.task = key
      if (lower === 'quantity') headerMap.quantity = key
    }

    const wells = []
    const targetsSet = new Set()
    const samplesSet = new Set()

    for (const row of rawRows) {
      const sample = String(row[headerMap.sample] || '').trim()
      const target = String(row[headerMap.target] || '').trim()
      if (!sample || !target) continue

      const ctRaw = row[headerMap.ct]
      const ct = ctRaw === 'Undetermined' || ctRaw === '' || ctRaw == null
        ? null
        : parseFloat(ctRaw)

      wells.push({
        well: String(row[headerMap.wellPosition] || row[headerMap.well] || '').trim(),
        sample,
        target,
        ct: isNaN(ct) ? null : ct,
        quantity: headerMap.quantity ? parseFloat(row[headerMap.quantity]) || null : null,
        taskType: String(row[headerMap.task] || 'UNKNOWN').toUpperCase(),
      })

      targetsSet.add(target)
      samplesSet.add(sample)
    }

    const samples = [...samplesSet]
    const targets = [...targetsSet]

    return {
      wells,
      metadata: {
        instrument: 'QuantStudio',
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
