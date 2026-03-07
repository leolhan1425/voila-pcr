import quantstudio from './quantstudio'
import abi7500 from './abi-7500'
import bioradCfx from './biorad-cfx'
import lightcycler from './lightcycler'
import fluidigmBiomark from './fluidigm-biomark'
import genericCsv from './generic-csv'

// Order matters: specific formats first, generic CSV last as fallback.
// ABI 7500 before QuantStudio since it's more specific (checks for "Detector" column).
const parsers = [abi7500, quantstudio, bioradCfx, lightcycler, fluidigmBiomark, genericCsv]

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
