import * as XLSX from 'xlsx'
import Papa from 'papaparse'

/**
 * Read an uploaded file and return either a SheetJS workbook or parsed CSV rows.
 * @param {File} file
 * @returns {Promise<{ type: 'xlsx' | 'csv', workbook?: object, rows?: object[], raw?: string }>}
 */
export async function readFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()

  if (ext === 'csv' || ext === 'txt') {
    const text = await file.text()
    const result = Papa.parse(text, { header: true, skipEmptyLines: true })

    // Many instrument exports have metadata rows before the real header.
    // PapaParse picks the first line as headers, which is wrong in those cases.
    // Detect this: if PapaParse found very few fields, find the real header row.
    if (result.meta.fields && result.meta.fields.length <= 2 && result.data.length > 3) {
      const noHeader = Papa.parse(text, { header: false, skipEmptyLines: true })
      let maxCols = 0
      let headerIdx = 0
      for (let i = 0; i < Math.min(noHeader.data.length, 30); i++) {
        if (noHeader.data[i].length > maxCols) {
          maxCols = noHeader.data[i].length
          headerIdx = i
        }
      }
      if (maxCols > 2) {
        const lines = text.split(/\r?\n/)
        const dataText = lines.slice(headerIdx).join('\n')
        const reParsed = Papa.parse(dataText, { header: true, skipEmptyLines: true })
        return { type: 'csv', rows: reParsed.data, raw: text, meta: reParsed.meta }
      }
    }

    return { type: 'csv', rows: result.data, raw: text, meta: result.meta }
  }

  // xlsx / xls
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  return { type: 'xlsx', workbook }
}
