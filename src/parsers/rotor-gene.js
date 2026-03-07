import * as XLSX from 'xlsx'
import { inferGroups } from './types'

/**
 * QIAGEN Rotor-Gene Q parser — handles exports from Rotor-Gene Q software.
 *
 * Rotor-Gene is a rotary qPCR instrument (tube-based, not plate-based).
 * Exports via "Export to Excel" or CSV. Results table columns:
 *   No., Colour, Name, Type, Ct, Given Conc, Calc Conc, % Var
 *
 * "Colour" may contain the dye/channel name (e.g., "Green", "Yellow", "FAM").
 * "Type" = Unknown, Standard, NTC, Positive Control, etc.
 * "No." = tube position (1-based integer, not plate well like A1).
 *
 * Fingerprints: "Rotor-Gene", "QIAGEN", "Corbett" in metadata rows.
 */
const rotorGene = {
  name: 'QIAGEN Rotor-Gene Q',

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

  // Check for Rotor-Gene fingerprints in metadata rows
  for (let i = 0; i < Math.min(raw.length, 20); i++) {
    const row = raw[i]
    if (!row) continue
    const rowStr = row.map((c) => String(c).toLowerCase()).join(' ')
    if (rowStr.includes('rotor-gene') || rowStr.includes('rotorgene')) return true
    if (rowStr.includes('corbett') && rowStr.includes('research')) return true
  }

  // Check for Rotor-Gene column pattern: No., Name, Type, Ct
  const headerRow = findHeaderRow(raw)
  if (headerRow) {
    const headers = headerRow.headers.map((h) => String(h).toLowerCase().trim())
    const hasNo = headers.some((h) => h === 'no.' || h === 'no')
    const hasName = headers.some((h) => h === 'name')
    const hasType = headers.some((h) => h === 'type')
    const hasCt = headers.some((h) => h === 'ct' || h === 'ct ')
    const hasColour = headers.some((h) => h === 'colour' || h === 'color')
    if (hasNo && hasName && hasCt && (hasType || hasColour)) return true
  }

  return false
}

function detectCsv(fileData) {
  const { rows, raw } = fileData

  // Check raw text for Rotor-Gene fingerprint
  if (raw && /rotor-?gene|corbett/i.test(raw.substring(0, 1000))) return true

  if (rows.length > 0) {
    const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
    const hasNo = headers.some((h) => h === 'no.' || h === 'no')
    const hasName = headers.includes('name')
    const hasType = headers.includes('type')
    const hasCt = headers.some((h) => h === 'ct')
    const hasColour = headers.some((h) => h === 'colour' || h === 'color')
    if (hasNo && hasName && hasCt && (hasType || hasColour)) return true
  }

  return false
}

function findHeaderRow(rawRows) {
  for (let i = 0; i < Math.min(rawRows.length, 30); i++) {
    const row = rawRows[i]
    if (!row) continue
    const strs = row.map((c) => String(c).toLowerCase().trim())
    const hasNo = strs.some((s) => s === 'no.' || s === 'no')
    const hasName = strs.some((s) => s === 'name')
    const hasCt = strs.some((s) => s === 'ct')
    if (hasNo && hasName && hasCt) {
      return { headers: row, index: i }
    }
  }
  return null
}

function parseXlsx(fileData, fileName) {
  const { workbook } = fileData

  // Try to find the best sheet — some exports have multiple sheets per channel
  let sheetName = workbook.SheetNames[0]
  for (const name of workbook.SheetNames) {
    if (/quantit/i.test(name) || /result/i.test(name)) {
      sheetName = name
      break
    }
  }

  const sheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '', header: 1 })

  const found = findHeaderRow(rawRows)
  if (!found) return emptyResult(fileName)

  const headers = found.headers.map((h) => String(h).trim())
  const dataRows = rawRows.slice(found.index + 1)

  // Try to detect channel/target from sheet name or metadata
  const channelName = detectChannel(rawRows, found.index, sheetName)

  return buildParsedData(headers, dataRows, fileName, channelName)
}

function parseCsv(fileData, fileName) {
  const { rows, meta, raw } = fileData
  const headers = meta?.fields || Object.keys(rows[0] || {})
  const dataRows = rows.map((row) => headers.map((h) => row[h]))

  // Try to detect channel from raw text
  let channelName = null
  if (raw) {
    const match = raw.match(/channel[:\s]*(green|yellow|orange|red|crimson|fam|hex|rox|cy5)/i)
    if (match) channelName = match[1]
  }

  return buildParsedData(headers, dataRows, fileName, channelName)
}

function detectChannel(rawRows, headerIdx, sheetName) {
  // Check sheet name for channel info
  if (/green|fam|sybr/i.test(sheetName)) return sheetName
  if (/yellow|hex|vic/i.test(sheetName)) return sheetName
  if (/orange|rox|tamra/i.test(sheetName)) return sheetName
  if (/red|cy5/i.test(sheetName)) return sheetName

  // Check metadata rows
  for (let i = 0; i < headerIdx; i++) {
    const row = rawRows[i]
    if (!row) continue
    const rowStr = row.map((c) => String(c)).join(' ')
    const match = rowStr.match(/channel[:\s]*(green|yellow|orange|red|crimson|fam|hex|rox|cy5)/i)
    if (match) return match[1]
  }

  return null
}

function buildParsedData(headers, dataRows, fileName, channelName) {
  const lower = headers.map((h) => h.toLowerCase().trim())

  const idx = {
    no: findCol(lower, 'no.', 'no'),
    colour: findCol(lower, 'colour', 'color'),
    name: findCol(lower, 'name'),
    type: findCol(lower, 'type'),
    ct: findCol(lower, 'ct'),
    givenConc: findCol(lower, 'given conc', 'given conc.'),
    calcConc: findCol(lower, 'calc conc', 'calc conc.'),
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
      ctRaw === '' || ctRaw == null || ctRaw === 'N/A' || ctRaw === 'No Ct'
        ? null
        : parseFloat(ctRaw)

    // Rotor-Gene uses tube positions (1, 2, 3...) not plate wells (A1, B1...)
    const position = idx.no >= 0 ? String(row[idx.no] || '').trim() : ''

    // Target: use Colour column if available, otherwise channel name, otherwise "Target"
    const colour = idx.colour >= 0 ? String(row[idx.colour] || '').trim() : ''
    const target = colour || channelName || 'Target'

    // Map Rotor-Gene "Type" to taskType
    const typeRaw = idx.type >= 0 ? String(row[idx.type] || '').trim().toLowerCase() : ''
    let taskType = 'UNKNOWN'
    if (typeRaw.includes('standard')) taskType = 'STANDARD'
    else if (typeRaw.includes('ntc') || typeRaw.includes('negative')) taskType = 'NTC'
    else if (typeRaw.includes('unknown') || typeRaw === '') taskType = 'UNKNOWN'
    else if (typeRaw.includes('positive')) taskType = 'UNKNOWN'

    wells.push({
      well: position,
      sample: name,
      target,
      ct: isNaN(ct) ? null : ct,
      quantity: idx.givenConc >= 0 ? parseFloat(row[idx.givenConc]) || null : null,
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
      instrument: 'QIAGEN Rotor-Gene Q',
      plateSize: wells.length > 72 ? 100 : 72, // Rotor-Gene uses 36 or 72 tube rotors
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
    metadata: { instrument: 'QIAGEN Rotor-Gene Q', plateSize: 72, exportDate: '', fileName: fileName || '' },
    targets: [],
    samples: [],
    groups: [],
  }
}

export default rotorGene
