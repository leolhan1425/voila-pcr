import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { inferGroups } from './types'

/**
 * ABI StepOne / StepOnePlus parser — handles exports from StepOne Software v2.x.
 *
 * Very similar to QuantStudio format but predates it. Exports .xlsx with a "Results"
 * sheet or .csv. Metadata rows contain "StepOne" or "StepOnePlus".
 * CSV exports start the header row with "Well".
 * Columns: Well, Sample Name, Target Name, Task, Reporter, Quencher, CT
 */
const stepone = {
  name: 'ABI StepOne',

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
    // StepOne fingerprints — must NOT contain "quantstudio" (those go to QuantStudio parser)
    if (
      (rowStr.includes('stepone') || rowStr.includes('step one')) &&
      !rowStr.includes('quantstudio')
    ) {
      return true
    }
  }
  return false
}

function detectCsv(fileData) {
  const { rows, raw } = fileData
  if (!raw) return false

  // Check first 500 chars for StepOne fingerprint
  const header = raw.substring(0, 1000).toLowerCase()
  if (header.includes('stepone') || header.includes('step one')) return true

  // CSV from StepOne: first data column header is "Well"
  // with Sample Name, Target Name, CT columns
  if (rows.length > 0) {
    const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
    const hasWell = headers.some((h) => h === 'well')
    const hasSample = headers.some((h) => h === 'sample name')
    const hasTarget = headers.some((h) => h === 'target name')
    const hasCt = headers.some((h) => h === 'ct' || h === 'cт')
    const hasReporter = headers.some((h) => h === 'reporter')
    // Reporter column is a strong StepOne signal
    if (hasWell && hasSample && hasTarget && hasCt && hasReporter) return true
  }
  return false
}

function parseXlsx(fileData, fileName) {
  const { workbook } = fileData
  const resultsSheet = workbook.SheetNames.find(
    (n) => n.toLowerCase() === 'results'
  )
  const sheet = workbook.Sheets[resultsSheet]
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 })

  let headerIdx = -1
  for (let i = 0; i < Math.min(rawRows.length, 80); i++) {
    const row = rawRows[i]
    if (!row) continue
    const strs = row.map((c) => String(c).toLowerCase().trim())
    const hasSample = strs.some((s) => s === 'sample name')
    const hasTarget = strs.some((s) => s === 'target name')
    const hasCt = strs.some((s) => s === 'ct' || s === 'cт')
    if (hasSample && hasTarget && hasCt) {
      headerIdx = i
      break
    }
  }

  if (headerIdx < 0) return emptyResult(fileName)

  const headers = rawRows[headerIdx].map((h) => String(h).trim())
  const dataRows = rawRows.slice(headerIdx + 1)

  // Extract instrument name from metadata
  let instrument = 'ABI StepOne'
  for (let i = 0; i < headerIdx; i++) {
    const row = rawRows[i]
    if (!row) continue
    const label = String(row[0]).toLowerCase()
    if (label.includes('instrument') || label.includes('block type')) {
      const val = String(row[1]).trim().replace(/[™®]/g, '')
      if (val) instrument = val
      break
    }
  }

  return buildParsedData(headers, dataRows, fileName, instrument)
}

function parseCsv(fileData, fileName) {
  const { rows, meta } = fileData
  const headers = meta?.fields || Object.keys(rows[0] || {})
  const dataRows = rows.map((row) => headers.map((h) => row[h]))
  return buildParsedData(headers, dataRows, fileName, 'ABI StepOne')
}

function buildParsedData(headers, dataRows, fileName, instrument) {
  const lower = headers.map((h) => h.toLowerCase().trim())

  const idx = {
    well: findCol(lower, 'well', 'well position'),
    sample: findCol(lower, 'sample name'),
    target: findCol(lower, 'target name'),
    ct: findCol(lower, 'ct', 'cт', 'cq'),
    task: findCol(lower, 'task'),
    quantity: findCol(lower, 'quantity'),
  }

  const wells = []
  const targetsSet = new Set()
  const samplesSet = new Set()

  for (const row of dataRows) {
    if (!row || row.length === 0) continue

    const sample = String(row[idx.sample] || '').trim()
    const target = String(row[idx.target] || '').trim()
    if (!sample || !target) continue

    const ctRaw = row[idx.ct]
    const ct =
      ctRaw === 'Undetermined' || ctRaw === '' || ctRaw == null
        ? null
        : parseFloat(ctRaw)

    wells.push({
      well: idx.well >= 0 ? String(row[idx.well] || '').trim() : '',
      sample,
      target,
      ct: isNaN(ct) ? null : ct,
      quantity:
        idx.quantity >= 0 ? parseFloat(row[idx.quantity]) || null : null,
      taskType: idx.task >= 0 ? String(row[idx.task] || 'UNKNOWN').toUpperCase() : 'UNKNOWN',
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
    metadata: { instrument: 'ABI StepOne', plateSize: 96, exportDate: '', fileName: fileName || '' },
    targets: [],
    samples: [],
    groups: [],
  }
}

export default stepone
