import * as XLSX from 'xlsx'
import { inferGroups } from './types'

/**
 * Agilent/Stratagene Mx3000P & Mx3005P parser — handles MxPro software exports.
 *
 * MxPro exports: .txt (tab-delimited text report), .xls, .csv
 * Results table columns:
 *   Well, Dye/Target, Well Type, Ct (dRn), Threshold (dRn), Tm Product 1
 *
 * "Well Type" = Unknown, Standard, NTC, Positive Control
 * "Dye/Target" combines dye and target (e.g., "FAM/GAPDH")
 * Some exports have separate "Dye" and "Target" columns.
 *
 * Fingerprints: "Stratagene", "MxPro", "Mx3000", "Mx3005", "Agilent"
 */
const stratageneMx = {
  name: 'Agilent Stratagene Mx',

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

  // Check for Stratagene/MxPro fingerprints in metadata
  for (let i = 0; i < Math.min(raw.length, 20); i++) {
    const row = raw[i]
    if (!row) continue
    const rowStr = row.map((c) => String(c).toLowerCase()).join(' ')
    if (rowStr.includes('stratagene') || rowStr.includes('mxpro') || rowStr.includes('mx pro')) return true
    if (rowStr.includes('mx3000') || rowStr.includes('mx3005')) return true
    if (rowStr.includes('agilent') && rowStr.includes('mx')) return true
  }

  // Check for MxPro-style columns: "Ct (dRn)" or "Dye/Target"
  const headerRow = findHeaderRow(raw)
  if (headerRow) {
    const headers = headerRow.headers.map((h) => String(h).toLowerCase().trim())
    const hasCtDrn = headers.some((h) => h.includes('ct') && h.includes('drn'))
    const hasDyeTarget = headers.some((h) => h.includes('dye') || h.includes('dye/target'))
    const hasWellType = headers.some((h) => h === 'well type')
    if (hasCtDrn || (hasDyeTarget && hasWellType)) return true
  }

  return false
}

function detectCsv(fileData) {
  const { rows, raw } = fileData

  // Check raw text for Stratagene/MxPro fingerprint
  if (raw) {
    const header = raw.substring(0, 1000).toLowerCase()
    if (header.includes('stratagene') || header.includes('mxpro') || header.includes('mx pro')) return true
    if (header.includes('mx3000') || header.includes('mx3005')) return true
    if (header.includes('agilent') && header.includes('mx')) return true
  }

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
    const hasCtDrn = headers.some((h) => h.includes('ct') && h.includes('drn'))
    const hasDyeTarget = headers.some((h) => h.includes('dye') || h.includes('dye/target'))
    const hasWellType = headers.some((h) => h === 'well type')
    if (hasCtDrn || (hasDyeTarget && hasWellType)) return true
  }

  return false
}

function findHeaderRow(rawRows) {
  for (let i = 0; i < Math.min(rawRows.length, 30); i++) {
    const row = rawRows[i]
    if (!row) continue
    const strs = row.map((c) => String(c).toLowerCase().trim())
    const hasWell = strs.some((s) => s === 'well')
    const hasCt = strs.some((s) => s.includes('ct'))
    if (hasWell && hasCt) {
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
    well: findCol(lower, 'well'),
    // "Dye/Target" combined column or separate columns
    dyeTarget: lower.findIndex((h) => h.includes('dye/target') || h.includes('dye / target')),
    dye: findCol(lower, 'dye'),
    target: findCol(lower, 'target', 'target name'),
    sample: findCol(lower, 'sample', 'sample name'),
    wellType: findCol(lower, 'well type'),
    // Ct can be "Ct (dRn)", "Ct(dRn)", "Ct (dR)", or just "Ct"
    ct: lower.findIndex((h) => h.startsWith('ct')),
    threshold: lower.findIndex((h) => h.includes('threshold')),
    tm: lower.findIndex((h) => h.includes('tm product') || h.includes('tm1')),
  }

  const wells = []
  const targetsSet = new Set()
  const samplesSet = new Set()

  for (const row of dataRows) {
    if (!row || row.length === 0) continue

    const wellPos = idx.well >= 0 ? String(row[idx.well] || '').trim() : ''
    if (!wellPos) continue

    // Parse target from Dye/Target column or separate Target column
    let target = ''
    let dye = ''
    if (idx.dyeTarget >= 0) {
      const combined = String(row[idx.dyeTarget] || '').trim()
      const parts = combined.split('/')
      if (parts.length >= 2) {
        dye = parts[0].trim()
        target = parts.slice(1).join('/').trim()
      } else {
        target = combined
      }
    } else {
      target = idx.target >= 0 ? String(row[idx.target] || '').trim() : ''
      dye = idx.dye >= 0 ? String(row[idx.dye] || '').trim() : ''
    }
    if (!target) target = dye || 'Target'

    // Sample name — MxPro sometimes doesn't have a sample column,
    // in which case we use well position as sample name
    let sample = idx.sample >= 0 ? String(row[idx.sample] || '').trim() : ''
    if (!sample) sample = wellPos

    const ctRaw = row[idx.ct]
    const ct =
      ctRaw === 'No Ct' || ctRaw === 'N/A' || ctRaw === '' || ctRaw == null
        ? null
        : parseFloat(ctRaw)

    // Map Well Type to taskType
    const wellTypeRaw = idx.wellType >= 0 ? String(row[idx.wellType] || '').trim().toLowerCase() : ''
    let taskType = 'UNKNOWN'
    if (wellTypeRaw.includes('standard')) taskType = 'STANDARD'
    else if (wellTypeRaw.includes('ntc') || wellTypeRaw.includes('no template')) taskType = 'NTC'
    else if (wellTypeRaw.includes('unknown') || wellTypeRaw === '') taskType = 'UNKNOWN'
    else if (wellTypeRaw.includes('positive')) taskType = 'UNKNOWN'

    wells.push({
      well: wellPos,
      sample,
      target,
      ct: isNaN(ct) ? null : ct,
      taskType,
    })

    targetsSet.add(target)
    samplesSet.add(sample)
  }

  const samples = [...samplesSet]
  const targets = [...targetsSet]

  return {
    wells,
    metadata: {
      instrument: 'Agilent Stratagene Mx',
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
    metadata: { instrument: 'Agilent Stratagene Mx', plateSize: 96, exportDate: '', fileName: fileName || '' },
    targets: [],
    samples: [],
    groups: [],
  }
}

export default stratageneMx
