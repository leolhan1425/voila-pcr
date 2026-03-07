import * as XLSX from 'xlsx'
import { inferGroups } from './types'

/**
 * Eppendorf Mastercycler ep realplex parser — handles tab-delimited text
 * and Excel exports from realplex software.
 *
 * Export via: right-click in Sample/Analysis window > Save Results As
 * Format: tab-delimited .txt or .xls/.xlsx
 * Columns: Position/No., Color, Name, Type, Ct
 *
 * Fingerprints: "realplex", "Eppendorf", "Mastercycler"
 * Uses "Ct" (not Cp or Cq). Default threshold is 33% normalized fluorescence.
 * 96-well plate format (A1–H12).
 */
const eppendorfRealplex = {
  name: 'Eppendorf realplex',

  detect(fileData) {
    if (fileData.type === 'xlsx') {
      return detectXlsx(fileData)
    }
    if (fileData.type === 'csv') {
      return detectCsv(fileData)
    }
    return false
  },

  parse(fileData, fileName) {
    if (fileData.type === 'xlsx') {
      return parseXlsx(fileData, fileName)
    }
    return parseCsv(fileData, fileName)
  },
}

function detectXlsx(fileData) {
  const { workbook } = fileData
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const raw = XLSX.utils.sheet_to_json(firstSheet, { defval: '', header: 1 })

  for (let i = 0; i < Math.min(raw.length, 20); i++) {
    const row = raw[i]
    if (!row) continue
    const rowStr = row.map((c) => String(c).toLowerCase()).join(' ')
    if (rowStr.includes('realplex')) return true
    if (rowStr.includes('eppendorf') && rowStr.includes('mastercycler')) return true
  }

  // Check for realplex-style column pattern
  const headerRow = findHeaderRow(raw)
  if (headerRow) {
    const headers = headerRow.headers.map((h) => String(h).toLowerCase().trim())
    const hasPosition = headers.some((h) => h === 'position' || h === 'pos' || h === 'no.' || h === 'well')
    const hasName = headers.some((h) => h === 'name' || h === 'sample')
    const hasCt = headers.some((h) => h === 'ct')
    const hasColor = headers.some((h) => h === 'color' || h === 'colour')
    // Color + Ct + Position is distinctive for realplex
    if (hasPosition && hasName && hasCt && hasColor) return true
  }

  return false
}

function detectCsv(fileData) {
  const { rows, raw } = fileData

  if (raw) {
    const header = raw.substring(0, 1000).toLowerCase()
    if (header.includes('realplex')) return true
    if (header.includes('eppendorf') && header.includes('mastercycler')) return true
  }

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
    const hasPosition = headers.some((h) => h === 'position' || h === 'pos' || h === 'no.' || h === 'well')
    const hasName = headers.some((h) => h === 'name' || h === 'sample')
    const hasCt = headers.some((h) => h === 'ct')
    const hasColor = headers.some((h) => h === 'color' || h === 'colour')
    if (hasPosition && hasName && hasCt && hasColor) return true
  }

  return false
}

function findHeaderRow(rawRows) {
  for (let i = 0; i < Math.min(rawRows.length, 30); i++) {
    const row = rawRows[i]
    if (!row) continue
    const strs = row.map((c) => String(c).toLowerCase().trim())
    const hasName = strs.some((s) => s === 'name' || s === 'sample')
    const hasCt = strs.some((s) => s === 'ct')
    if (hasName && hasCt) {
      return { headers: row, index: i }
    }
  }
  return null
}

function parseXlsx(fileData, fileName) {
  const { workbook } = fileData
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 })

  const found = findHeaderRow(rawRows)
  if (!found) return emptyResult(fileName)

  const headers = found.headers.map((h) => String(h).trim())
  const dataRows = rawRows.slice(found.index + 1)

  return buildParsedData(headers, dataRows, fileName)
}

function parseCsv(fileData, fileName) {
  const { rows, meta } = fileData
  const headers = meta?.fields || Object.keys(rows[0] || {})
  const dataRows = rows.map((row) => headers.map((h) => row[h]))
  return buildParsedData(headers, dataRows, fileName)
}

function buildParsedData(headers, dataRows, fileName) {
  const lower = headers.map((h) => h.toLowerCase().trim())

  const idx = {
    position: findCol(lower, 'position', 'pos', 'no.', 'no', 'well'),
    name: findCol(lower, 'name', 'sample', 'sample name'),
    target: findCol(lower, 'target', 'target name', 'gene', 'detector'),
    color: findCol(lower, 'color', 'colour'),
    type: findCol(lower, 'type'),
    ct: findCol(lower, 'ct'),
  }

  const wells = []
  const targetsSet = new Set()
  const samplesSet = new Set()

  for (const row of dataRows) {
    if (!row || row.length === 0) continue

    const name = String(row[idx.name] || '').trim()
    if (!name) continue

    const ctRaw = row[idx.ct]
    const ct =
      ctRaw === '' || ctRaw == null || ctRaw === 'NaN' || ctRaw === 'N/A'
        ? null
        : parseFloat(ctRaw)

    const position = idx.position >= 0 ? String(row[idx.position] || '').trim() : ''

    // Target: use dedicated target column, or color/dye channel, or "Target"
    let target = idx.target >= 0 ? String(row[idx.target] || '').trim() : ''
    if (!target) {
      target = idx.color >= 0 ? String(row[idx.color] || '').trim() : 'Target'
    }
    if (!target) target = 'Target'

    const typeRaw = idx.type >= 0 ? String(row[idx.type] || '').trim().toLowerCase() : ''
    let taskType = 'UNKNOWN'
    if (typeRaw.includes('standard')) taskType = 'STANDARD'
    else if (typeRaw.includes('ntc') || typeRaw.includes('negative')) taskType = 'NTC'

    wells.push({
      well: position,
      sample: name,
      target,
      ct: isNaN(ct) ? null : ct,
      taskType,
    })

    targetsSet.add(target)
    samplesSet.add(name)
  }

  const samples = [...samplesSet]
  const targets = [...targetsSet]

  return {
    wells,
    metadata: {
      instrument: 'Eppendorf realplex',
      plateSize: 96,
      exportDate: '',
      fileName: fileName || '',
    },
    targets,
    samples,
    groups: inferGroups(samples),
  }
}

function findCol(lowerHeaders, ...names) {
  for (const name of names) {
    const i = lowerHeaders.indexOf(name)
    if (i >= 0) return i
  }
  return -1
}

function emptyResult(fileName) {
  return {
    wells: [],
    metadata: { instrument: 'Eppendorf realplex', plateSize: 96, exportDate: '', fileName: fileName || '' },
    targets: [],
    samples: [],
    groups: [],
  }
}

export default eppendorfRealplex
