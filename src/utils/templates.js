/**
 * Template storage for saved analysis configurations.
 * Uses localStorage now; will be migrated to Supabase later.
 */

const STORAGE_KEY = 'voilapcr_templates'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeToStorage(templates) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates))
}

/**
 * Get all saved templates, sorted by creation date (newest first).
 * @returns {Array<{id: string, name: string, config: object, graphSettings: object, createdAt: string}>}
 */
export function getTemplates() {
  const templates = readFromStorage()
  return templates.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

/**
 * Save a new template with the given name and configuration.
 * @param {string} name - Display name for the template
 * @param {object} config - Analysis config object (method, referenceGene, controlGroup, etc.)
 * @param {object} [graphSettings] - Optional graph customization settings
 * @returns {{id: string, name: string, config: object, graphSettings: object, createdAt: string}}
 */
export function saveTemplate(name, config, graphSettings = {}) {
  const templates = readFromStorage()

  const template = {
    id: generateId(),
    name: name.trim(),
    config: {
      method: config.method || 'ddct',
      referenceGene: config.referenceGene || null,
      referenceGenes: config.referenceGenes || [],
      controlGroup: config.controlGroup || null,
      autoAverage: config.autoAverage !== undefined ? config.autoAverage : true,
      outlierThreshold: config.outlierThreshold !== undefined ? config.outlierThreshold : 0.5,
      efficiencies: config.efficiencies || {},
    },
    graphSettings: {
      fontFamily: graphSettings.fontFamily || null,
      fontSize: graphSettings.fontSize || null,
      width: graphSettings.width || null,
      height: graphSettings.height || null,
      yScale: graphSettings.yScale || null,
      xAxisLabel: graphSettings.xAxisLabel || null,
      yAxisLabel: graphSettings.yAxisLabel || null,
      showSignificance: graphSettings.showSignificance !== undefined ? graphSettings.showSignificance : null,
      groupColors: graphSettings.groupColors || null,
    },
    createdAt: new Date().toISOString(),
  }

  templates.push(template)
  writeToStorage(templates)

  return template
}

/**
 * Delete a template by ID.
 * @param {string} id
 */
export function deleteTemplate(id) {
  const templates = readFromStorage()
  const filtered = templates.filter((t) => t.id !== id)
  writeToStorage(filtered)
}

/**
 * Get a template's config by ID, ready to apply to the store.
 * Returns null if the template is not found.
 * @param {string} id
 * @returns {{ config: object, graphSettings: object } | null}
 */
export function applyTemplate(id) {
  const templates = readFromStorage()
  const template = templates.find((t) => t.id === id)
  if (!template) return null

  return {
    config: { ...template.config },
    graphSettings: { ...template.graphSettings },
  }
}

/**
 * Get the count of saved templates.
 * @returns {number}
 */
export function getTemplateCount() {
  return readFromStorage().length
}
