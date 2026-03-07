import * as XLSX from 'xlsx'
import { inferGroups } from './types'

/**
 * Fluidigm BioMark parser — handles 96.96 and 48.48 chip-based qPCR exports.
 *
 * BioMark exports use "Chamber ID" instead of "Well", "Assay Name" instead of
 * "Target", and may contain chip metadata like "Chip Barcode" or "Chip Run
 * Information" in header rows.
 */
const fluidigmBiomark = {
  name: 'Fluidigm BioMark',

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
    if (rowStr.includes('biomark') || rowStr.includes('fluidigm')) return true
    if (rowStr.includes('chip barcode') || rowStr.includes('chip run')) return true
    if (rowStr.includes('96.96') || rowStr.includes('48.48')) return true
  }

  // Check for BioMark-style header row
  const headerRow = findHeaderRow(raw)
  if (headerRow) {
    const headers = headerRow.headers.map((h) => String(h).toLowerCase().trim())
    const hasAssay = headers.some((h) => h === 'assay name' || h === 'assay')
    const hasChamber = headers.some((h) => h === 'chamber id')
    if (hasAssay && hasChamber) return true
  }

  return false
}

function detectCsv(fileData) {
  const { rows, raw } = fileData

  // Check raw text for BioMark fingerprint
  if (raw && /biomark|fluidigm|chip barcode|chip run/i.test(raw.substring(0, 500))) return true

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
    const hasAssay = headers.some((h) => h === 'assay name' || h === 'assay')
    const hasChamber = headers.includes('chamber id')
    const hasSample = headers.some((h) => h === 'sample name' || h === 'name')
    if (hasAssay && (hasChamber || hasSample)) return true
  }

  return false
}

/**
 * Scan raw rows for the data header row containing BioMark column names.
 */
function findHeaderRow(rawRows) {
  for (let i = 0; i < Math.min(rawRows.length, 30); i++) {
    const row = rawRows[i]
    if (!row) continue
    const strs = row.map((c) => String(c).toLowerCase().trim())
    const hasAssay = strs.some((s) => s === 'assay name' || s === 'assay')
    const hasSampleOrChamber = strs.some(
      (s) => s === 'sample name' || s === 'name' || s === 'chamber id'
    )
    const hasCt = strs.some((s) => s === 'ct' || s === 'value' || s === 'ct value' || s === 'cq')
    if (hasAssay && hasSampleOrChamber && hasCt) {
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

  // Detect chip format from metadata
  const chipFormat = detectChipFormat(rawRows, found.index)

  return buildParsedData(headers, dataRows, fileName, chipFormat)
}

function parseCsv(fileData, fileName) {
  const { rows, meta, raw } = fileData
  const headers = meta?.fields || Object.keys(rows[0] || {})
  const dataRows = rows.map((row) => headers.map((h) => row[h]))

  // Try to detect chip format from raw text
  let chipFormat = null
  if (raw) {
    if (raw.includes('96.96')) chipFormat = '96.96'
    else if (raw.includes('48.48')) chipFormat = '48.48'
  }

  return buildParsedData(headers, dataRows, fileName, chipFormat)
}

/**
 * Scan metadata rows for chip format indicators.
 */
function detectChipFormat(rawRows, headerIdx) {
  for (let i = 0; i < headerIdx; i++) {
    const row = rawRows[i]
    if (!row) continue
    const rowStr = row.map((c) => String(c)).join(' ')
    if (rowStr.includes('96.96')) return '96.96'
    if (rowStr.includes('48.48')) return '48.48'
  }
  return null
}

function buildParsedData(headers, dataRows, fileName, chipFormat) {
  const lower = headers.map((h) => h.toLowerCase().trim())

  const idx = {
    chamber: findCol(lower, 'chamber id'),
    well: findCol(lower, 'well', 'well position'),
    sample: findCol(lower, 'sample name', 'name', 'sample'),
    target: findCol(lower, 'assay name', 'assay', 'target', 'target name'),
    ct: findCol(lower, 'ct value', 'ct', 'value', 'cq'),
    call: findCol(lower, 'call', 'quality'),
  }

  // Use chamber ID as well identifier if no explicit well column
  const wellCol = idx.well >= 0 ? idx.well : idx.chamber

  const wells = []
  const targetsSet = new Set()
  const samplesSet = new Set()

  for (const row of dataRows) {
    if (!row || row.length === 0) continue

    const sample = String(row[idx.sample] || '').trim()
    const target = String(row[idx.target] || '').trim()
    if (!sample || !target) continue

    const ctRaw = row[idx.ct]
    const ct = ctRaw === '999' || ctRaw === 'Fail' || ctRaw === 'No Call' ||
               ctRaw === 'NaN' || ctRaw === '' || ctRaw == null
      ? null
      : parseFloat(ctRaw)

    wells.push({
      well: wellCol >= 0 ? String(row[wellCol] || '').trim() : '',
      sample,
      target,
      ct: isNaN(ct) ? null : ct,
      quantity: null,
      taskType: 'UNKNOWN',
    })

    targetsSet.add(target)
    samplesSet.add(sample)
  }

  const samples = [...samplesSet]
  const targets = [...targetsSet]

  // Determine plate size from chip format or well count
  let plateSize = 96
  if (chipFormat === '96.96') plateSize = 9216
  else if (chipFormat === '48.48') plateSize = 2304
  else if (wells.length > 384) plateSize = 9216
  else if (wells.length > 96) plateSize = 384

  return {
    wells,
    metadata: {
      instrument: chipFormat ? `Fluidigm BioMark ${chipFormat}` : 'Fluidigm BioMark',
      plateSize,
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
    metadata: { instrument: 'Fluidigm BioMark', plateSize: 96, exportDate: '', fileName: fileName || '' },
    targets: [],
    samples: [],
    groups: [],
  }
}

export default fluidigmBiomark
