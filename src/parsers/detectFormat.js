import quantstudio from './quantstudio'
import genericCsv from './generic-csv'

const parsers = [quantstudio, genericCsv]

/**
 * Try each parser's detect() in order. First match wins.
 * @param {{ type: string, workbook?: object, rows?: object[], raw?: string, meta?: object }} fileData
 * @returns {{ parser: object, name: string } | null}
 */
export function detectFormat(fileData) {
  for (const parser of parsers) {
    if (parser.detect(fileData)) {
      return { parser, name: parser.name }
    }
  }
  return null
}
