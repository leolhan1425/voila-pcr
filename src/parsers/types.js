/**
 * @typedef {Object} WellData
 * @property {string} well - Well position (e.g., "A1")
 * @property {string} sample - Sample name
 * @property {string} target - Target/gene name
 * @property {number|null} ct - Ct/Cq value
 * @property {number|null} [quantity] - For standard curve
 * @property {string} [taskType] - UNKNOWN, STANDARD, NTC
 */

/**
 * @typedef {Object} ParsedData
 * @property {WellData[]} wells
 * @property {{ instrument: string, plateSize: number, exportDate: string, fileName: string }} metadata
 * @property {string[]} targets - Unique target list
 * @property {string[]} samples - Unique sample list
 * @property {string[]} groups - Inferred groups (strip _1, _2, _3 suffixes)
 */

/**
 * Infer group names from sample names by stripping trailing _N, -N, or space+N suffixes.
 * e.g., "Control_1" -> "Control", "Treated 3" -> "Treated"
 */
export function inferGroups(samples) {
  const groups = new Set()
  for (const s of samples) {
    const group = s.replace(/[\s_-]\d+$/, '')
    groups.add(group)
  }
  return [...groups]
}
