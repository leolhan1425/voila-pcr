import { inferGroups } from './types'

/**
 * Bio Molecular Systems Mic qPCR parser — handles CSV exports from micPCR software.
 *
 * The Mic is a 48-well rotary cycler. Uses MIQE-standard "Cq" designation.
 * Key differentiator: exports per-sample "Efficiency" column alongside Cq.
 * Well positions are numeric (1–48), not plate format (A1–H12).
 *
 * Columns: Well, Name, Target, Cq, Efficiency, Type
 * Replicate exports add: Cq Mean, Cq Std Dev
 * Some columns use bracket notation: "Target [Type]", "Target [Quantity]"
 *
 * Fingerprints: "micPCR", "Bio Molecular Systems", "Magnetic Induction Cycler"
 */
const micQpcr = {
  name: 'Mic qPCR',

  detect(fileData) {
    if (fileData.type !== 'csv') return false
    const { rows, raw } = fileData

    // Check raw text for Mic fingerprints
    if (raw) {
      const header = raw.substring(0, 1000).toLowerCase()
      if (header.includes('micpcr') || header.includes('mic qpcr')) return true
      if (header.includes('bio molecular systems')) return true
      if (header.includes('magnetic induction')) return true
    }

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]).map((h) => h.toLowerCase().trim())
      // Key differentiator: "Cq" + "Efficiency" together
      const hasCq = headers.some((h) => h === 'cq' || h === 'cq mean')
      const hasEfficiency = headers.some((h) => h === 'efficiency')
      const hasWell = headers.some((h) => h === 'well')
      const hasName = headers.some((h) => h === 'name' || h === 'sample')
      if (hasCq && hasEfficiency && hasWell) return true
      // Bracket notation columns are also distinctive
      const hasBracket = headers.some((h) => h.includes('[') && h.includes(']'))
      if (hasCq && hasName && hasBracket) return true
    }

    return false
  },

  parse(fileData, fileName) {
    const { rows, meta } = fileData
    const headers = meta?.fields || Object.keys(rows[0] || {})
    const lower = headers.map((h) => h.toLowerCase().trim())

    const idx = {
      well: findCol(lower, 'well'),
      name: findCol(lower, 'name', 'sample', 'sample name'),
      target: findCol(lower, 'target', 'target name'),
      cq: findCol(lower, 'cq', 'cq mean'),
      efficiency: findCol(lower, 'efficiency'),
      type: findCol(lower, 'type'),
    }

    // Handle bracket notation: "Target [Type]", "Target [Quantity]"
    if (idx.target < 0) {
      const bracketIdx = lower.findIndex((h) => h.startsWith('target'))
      if (bracketIdx >= 0) idx.target = bracketIdx
    }
    if (idx.type < 0) {
      const typeIdx = lower.findIndex((h) => h.includes('[type]'))
      if (typeIdx >= 0) idx.type = typeIdx
    }

    const wells = []
    const targetsSet = new Set()
    const samplesSet = new Set()

    for (const row of rows) {
      if (!row) continue

      const vals = headers.map((h) => row[h])
      const name = String(vals[idx.name] || '').trim()
      if (!name) continue

      const cqRaw = vals[idx.cq]
      const cq =
        cqRaw === '' || cqRaw == null || cqRaw === 'NaN' || cqRaw === 'N/A'
          ? null
          : parseFloat(cqRaw)

      const wellPos = idx.well >= 0 ? String(vals[idx.well] || '').trim() : ''
      const target = idx.target >= 0 ? String(vals[idx.target] || '').trim() : 'Target'

      const typeRaw = idx.type >= 0 ? String(vals[idx.type] || '').trim().toLowerCase() : ''
      let taskType = 'UNKNOWN'
      if (typeRaw.includes('standard')) taskType = 'STANDARD'
      else if (typeRaw.includes('ntc') || typeRaw.includes('negative') || typeRaw.includes('no template')) taskType = 'NTC'

      wells.push({
        well: wellPos,
        sample: name,
        target: target || 'Target',
        ct: isNaN(cq) ? null : cq,
        taskType,
      })

      if (target) targetsSet.add(target)
      samplesSet.add(name)
    }

    const samples = [...samplesSet]
    const targets = [...targetsSet]

    return {
      wells,
      metadata: {
        instrument: 'Mic qPCR',
        plateSize: 48, // Mic uses 48-well rotary format
        exportDate: '',
        fileName: fileName || '',
      },
      targets,
      samples,
      groups: inferGroups(samples),
    }
  },
}

function findCol(lowerHeaders, ...names) {
  for (const name of names) {
    const i = lowerHeaders.indexOf(name)
    if (i >= 0) return i
  }
  return -1
}

export default micQpcr
