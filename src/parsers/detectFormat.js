import stepone from './stepone'
import abi7500 from './abi-7500'
import quantstudio from './quantstudio'
import bioradCfx from './biorad-cfx'
import lightcycler from './lightcycler'
import rotorGene from './rotor-gene'
import stratageneMx from './stratagene-mx'
import fluidigmBiomark from './fluidigm-biomark'
import genericCsv from './generic-csv'

// Order matters: specific formats first, generic CSV last as fallback.
// StepOne before ABI 7500 (checks for "StepOne" fingerprint specifically).
// ABI 7500 before QuantStudio (checks for "Detector" column).
// Rotor-Gene and Stratagene before generic CSV.
const parsers = [stepone, abi7500, quantstudio, bioradCfx, lightcycler, rotorGene, stratageneMx, fluidigmBiomark, genericCsv]

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
