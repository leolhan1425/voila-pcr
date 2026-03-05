import * as XLSX from 'xlsx'
import { inferGroups } from './types'

/**
 * Roche LightCycler parser — handles exports from LightCycler 96/480.
 *
 * Common export formats:
 * - .xlsx with columns: "Name", "Cp" (or "Cq"), "Target", "Pos" (well position)
 * - .txt (tab-separated) with similar structure
 * - Fingerprints: "LightCycler" in header/metadata, "Cp" column (LightCycler's term for Ct)
 */
const lightcycler = {
  name: 'Roche LightCycler',

  detect(fileData) {
    if (fileData.type === 'xlsx') {
      const { workbook } = fileData
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(firstSheet, { defval: '', header: 1 })

      // Check for LightCycler fingerprint in first rows
      for (let i = 0; i < Math.min(raw.length, 10); i++) {
        const row = raw[i]
        if (row && row.some((cell) => /lightcycler|roche/i.test(String(cell)))) return true
      }

      // Check for Cp column (LightCycler's name for Ct/Cq)
      const headerRow = findHeaderRow(raw)
      if (headerRow) {
        const headers = headerRow.map((h) => String(h).toLowerCase().trim())
        if (headers.some((h) => h === 'cp' || h === 'crossing point') &&
            headers.some((h) => h === 'name' || h === 'sample name' || h === 'sample')) {
          return true
        }
      }
      return false
    }

    if (fileData.type === 'csv') {
      const { rows, raw } = fileData
      if (raw && /lightcycler|roche/i.test(raw.substring(0, 500))) return true

      if (rows.length > 0) {
        const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
        const hasCp = headers.some((h) => h === 'cp' || h === 'crossing point')
        const hasName = headers.some((h) => h === 'name' || h === 'sample name' || h === 'sample')
        if (hasCp && hasName) return true
      }
      return false
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

function findHeaderRow(rawRows) {
  for (let i = 0; i < Math.min(rawRows.length, 30); i++) {
    const row = rawRows[i]
    if (!row) continue
    const strs = row.map((c) => String(c).toLowerCase().trim())
    if (strs.some((s) => s === 'cp' || s === 'crossing point' || s === 'cq') &&
        strs.some((s) => s === 'name' || s === 'sample name' || s === 'sample' || s === 'pos')) {
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
  if (!found) return emptResult(fileName)

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
    well: findCol(lower, 'pos', 'well', 'position', 'well position'),
    sample: findCol(lower, 'name', 'sample name', 'sample'),
    target: findCol(lower, 'target', 'target name', 'gene', 'detector'),
    cp: findCol(lower, 'cp', 'crossing point', 'cq', 'ct'),
  }

  const wells = []
  const targetsSet = new Set()
  const samplesSet = new Set()

  for (const row of dataRows) {
    if (!row || row.length === 0) continue

    const sample = String(row[idx.sample] || '').trim()
    const target = idx.target >= 0 ? String(row[idx.target] || '').trim() : 'Target'
    if (!sample) continue

    const cpRaw = row[idx.cp]
    const cp = cpRaw === '' || cpRaw == null || cpRaw === 'NaN' || cpRaw === 'N/A'
      ? null
      : parseFloat(cpRaw)

    wells.push({
      well: idx.well >= 0 ? String(row[idx.well] || '').trim() : '',
      sample,
      target,
      ct: isNaN(cp) ? null : cp,
      taskType: 'UNKNOWN',
    })

    targetsSet.add(target)
    samplesSet.add(sample)
  }

  const samples = [...samplesSet]
  const targets = [...targetsSet]

  return {
    wells,
    metadata: {
      instrument: 'Roche LightCycler',
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

function emptResult(fileName) {
  return {
    wells: [],
    metadata: { instrument: 'Roche LightCycler', plateSize: 96, exportDate: '', fileName: fileName || '' },
    targets: [],
    samples: [],
    groups: [],
  }
}

export default lightcycler
