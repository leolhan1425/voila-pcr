/**
 * @typedef {Object} DiagnosticIssue
 * @property {string} id - e.g., "ntc-contamination"
 * @property {"critical"|"warning"|"caution"} severity
 * @property {string} title
 * @property {string} summary
 * @property {string[]} details - specific affected wells/values
 * @property {string} explanation - why this matters
 * @property {string[]} suggestions - actionable fixes
 * @property {string[]} affectedWells
 */

/**
 * @typedef {Object} DiagnosticPass
 * @property {string} title
 * @property {string} detail
 */

/**
 * @typedef {Object} DiagnosticReport
 * @property {"green"|"yellow"|"red"} score
 * @property {number} issueCount
 * @property {DiagnosticIssue[]} issues
 * @property {DiagnosticPass[]} passes
 */

export default {}
