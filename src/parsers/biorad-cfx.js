import * as XLSX from 'xlsx'
import Papa from 'papaparse'
import { inferGroups } from './types'

/**
 * Bio-Rad CFX parser — handles exports from CFX96, CFX384, CFX Opus.
 * Supports both .csv and .xlsx exports.
 *
 * CSV format: typically has columns like "Target", "Content", "Sample", "Cq", "Cq Mean", "Cq Std. Dev"
 * XLSX format: "Quantification Cq Results" sheet or similar.
 * Common fingerprints: "Bio-Rad" in header rows, "Cq" column instead of "Ct"
 */
const bioradCfx = {
  name: 'Bio-Rad CFX',

  detect(fileData) {
    if (fileData.type === 'xlsx') {
      const { workbook } = fileData
      // Look for Bio-Rad specific sheet names
      const cfxSheet = workbook.SheetNames.find(
        (n) => /quantification/i.test(n) || /cq results/i.test(n)
      )
      if (cfxSheet) return true

      // Check first sheet for Bio-Rad fingerprints
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const raw = XLSX.utils.sheet_to_json(firstSheet, { defval: '', header: 1 })
      for (let i = 0; i < Math.min(raw.length, 10); i++) {
        const row = raw[i]
        if (row && row.some((cell) => /bio-rad|cfx/i.test(String(cell)))) return true
      }

      // Check for CFX-style column headers (Cq, Content, Fluor)
      const headerRow = findHeaderRow(raw)
      if (headerRow) {
        const headers = headerRow.map((h) => String(h).toLowerCase().trim())
        if (headers.includes('cq') && headers.some((h) => h === 'fluor' || h === 'content' || h === 'target')) {
          return true
        }
      }
      return false
    }

    if (fileData.type === 'csv') {
      const { rows, raw } = fileData
      // Check raw text for Bio-Rad fingerprint
      if (raw && /bio-rad|cfx/i.test(raw.substring(0, 500))) return true

      // Check for CFX-specific column names
      if (rows.length > 0) {
        const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
        const hasCq = headers.some((h) => h === 'cq' || h === 'cq mean')
        const hasFluor = headers.some((h) => h === 'fluor' || h === 'fluorophore')
        const hasContent = headers.includes('content')
        if (hasCq && (hasFluor || hasContent)) return true
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
  for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
    const row = rawRows[i]
    if (!row) continue
    const strs = row.map((c) => String(c).toLowerCase().trim())
    if (strs.some((s) => s === 'cq' || s === 'cq mean') && strs.some((s) => s === 'sample' || s === 'target' || s === 'content')) {
      return row
    }
  }
  return null
}

function parseXlsx(fileData, fileName) {
  const { workbook } = fileData
  const sheetName = workbook.SheetNames.find(
    (n) => /quantification/i.test(n) || /cq results/i.test(n)
  ) || workbook.SheetNames[0]

  const sheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 })

  // Find the actual header row (CFX files often have metadata rows at top)
  let headerIdx = 0
  for (let i = 0; i < Math.min(rawRows.length, 20); i++) {
    const strs = (rawRows[i] || []).map((c) => String(c).toLowerCase().trim())
    if (strs.some((s) => s === 'cq' || s === 'cq mean')) {
      headerIdx = i
      break
    }
  }

  const headers = rawRows[headerIdx].map((h) => String(h).trim())
  const dataRows = rawRows.slice(headerIdx + 1)

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
    well: lower.findIndex((h) => h === 'well'),
    sample: lower.findIndex((h) => h === 'sample' || h === 'sample name'),
    target: lower.findIndex((h) => h === 'target' || h === 'target name'),
    cq: lower.findIndex((h) => h === 'cq' || h === 'cq mean' || h === 'ct'),
    content: lower.findIndex((h) => h === 'content'),
  }

  // If no explicit sample column, try "Content" (CFX uses this sometimes)
  if (idx.sample < 0 && idx.content >= 0) idx.sample = idx.content

  const wells = []
  const targetsSet = new Set()
  const samplesSet = new Set()

  for (const row of dataRows) {
    if (!row || row.length === 0) continue

    const sample = String(row[idx.sample] || '').trim()
    const target = String(row[idx.target] || '').trim()
    if (!sample || !target) continue

    const cqRaw = row[idx.cq]
    const cq = cqRaw === 'N/A' || cqRaw === '' || cqRaw == null || cqRaw === 'NaN'
      ? null
      : parseFloat(cqRaw)

    wells.push({
      well: idx.well >= 0 ? String(row[idx.well] || '').trim() : '',
      sample,
      target,
      ct: isNaN(cq) ? null : cq,
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
      instrument: 'Bio-Rad CFX',
      plateSize: wells.length > 96 ? 384 : 96,
      exportDate: '',
      fileName: fileName || '',
    },
    targets,
    samples,
    groups: inferGroups(samples),
  }
}

export default bioradCfx
