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
    return { type: 'csv', rows: result.data, raw: text, meta: result.meta }
  }

  // xlsx / xls
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  return { type: 'xlsx', workbook }
}
