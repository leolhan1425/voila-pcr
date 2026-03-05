import { readFile } from '../utils/fileReader'
import { detectFormat } from './detectFormat'

/**
 * Main entry point: read a file and auto-detect + parse it.
 * @param {File} file
 * @returns {Promise<{ parsedData: import('./types').ParsedData, formatName: string } | { error: string }>}
 */
export async function parseFile(file) {
  const fileData = await readFile(file)
  const match = detectFormat(fileData)

  if (!match) {
    return { error: 'unrecognized', fileData }
  }

  const parsedData = match.parser.parse(fileData, file.name)
  return { parsedData, formatName: match.name }
}
