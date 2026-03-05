import { inferGroups } from './types'

/**
 * Generic CSV fallback parser.
 * Tries to auto-detect columns by name, otherwise returns column mapping needed.
 */
const genericCsv = {
  name: 'Generic CSV',

  detect(fileData) {
    // Accept any CSV with at least some rows
    if (fileData.type !== 'csv') return false
    return fileData.rows && fileData.rows.length > 0
  },

  parse(fileData, fileName) {
    const { rows, meta } = fileData
    const headers = meta?.fields || Object.keys(rows[0] || {})

    // Try to auto-map common column names
    const mapping = autoMapColumns(headers)

    const wells = []
    const targetsSet = new Set()
    const samplesSet = new Set()

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const sample = String(row[mapping.sample] || '').trim()
      const target = String(row[mapping.target] || '').trim()
      if (!sample || !target) continue

      const ctRaw = row[mapping.ct]
      const ct = ctRaw === 'Undetermined' || ctRaw === 'N/A' || ctRaw === '' || ctRaw == null
        ? null
        : parseFloat(ctRaw)

      wells.push({
        well: mapping.well ? String(row[mapping.well] || '').trim() : `R${i + 1}`,
        sample,
        target,
        ct: isNaN(ct) ? null : ct,
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
        instrument: 'CSV Import',
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

/**
 * Attempt to match CSV column headers to our expected fields.
 */
function autoMapColumns(headers) {
  const lower = headers.map((h) => h.toLowerCase().trim())

  function find(...patterns) {
    for (const p of patterns) {
      const idx = lower.findIndex((h) => h === p || h.includes(p))
      if (idx >= 0) return headers[idx]
    }
    return null
  }

  return {
    well: find('well position', 'well', 'pos'),
    sample: find('sample name', 'sample', 'name'),
    target: find('target name', 'target', 'gene', 'detector'),
    ct: find('ct', 'cq', 'cq mean', 'ct mean', 'cp'),
  }
}

export default genericCsv
