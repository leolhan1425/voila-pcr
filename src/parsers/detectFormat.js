import quantstudio from './quantstudio'
import bioradCfx from './biorad-cfx'
import lightcycler from './lightcycler'
import genericCsv from './generic-csv'

// Order matters: specific formats first, generic CSV last as fallback
const parsers = [quantstudio, bioradCfx, lightcycler, genericCsv]

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
