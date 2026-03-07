import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import useTier from '../../hooks/useTier'
import {
  getTemplates,
  saveTemplate,
  deleteTemplate,
  applyTemplate,
  getTemplateCount,
} from '../../utils/templates'

const METHOD_LABELS = {
  ddct: 'DDCt',
  pfaffl: 'Pfaffl',
  standardCurve: 'Std Curve',
  genorm: 'geNorm',
}

function formatDate(isoString) {
  const d = new Date(isoString)
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const day = d.getDate().toString().padStart(2, '0')
  const year = d.getFullYear().toString().slice(-2)
  return `${month}/${day}/${year}`
}

export default function SavedTemplates() {
  const { t } = useTranslation()
  const { config, setConfig, graphSettings, setGraphSettings, setShowPricing } = useStore()
  const { hasAccess } = useTier()

  const [templates, setTemplates] = useState(() => getTemplates())
  const [templateName, setTemplateName] = useState('')
  const [saveStatus, setSaveStatus] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  const canSaveMore = hasAccess('savedTemplates') || getTemplateCount() < 1
  const isFreeTierLimited = !hasAccess('savedTemplates') && getTemplateCount() >= 1

  const refreshTemplates = useCallback(() => {
    setTemplates(getTemplates())
  }, [])

  const handleSave = () => {
    const name = templateName.trim()
    if (!name) return

    if (!canSaveMore) {
      setShowPricing(true)
      return
    }

    const graphSettingsFlat = {}
    const allTargetSettings = Object.values(graphSettings)
    if (allTargetSettings.length > 0) {
      const first = allTargetSettings[0]
      if (first.fontFamily) graphSettingsFlat.fontFamily = first.fontFamily
      if (first.fontSize) graphSettingsFlat.fontSize = first.fontSize
      if (first.width) graphSettingsFlat.width = first.width
      if (first.height) graphSettingsFlat.height = first.height
      if (first.yScale) graphSettingsFlat.yScale = first.yScale
      if (first.xAxisLabel) graphSettingsFlat.xAxisLabel = first.xAxisLabel
      if (first.yAxisLabel) graphSettingsFlat.yAxisLabel = first.yAxisLabel
      if (first.showSignificance !== undefined) graphSettingsFlat.showSignificance = first.showSignificance
      if (first.groupColors) graphSettingsFlat.groupColors = first.groupColors
    }

    saveTemplate(name, config, graphSettingsFlat)
    setTemplateName('')
    refreshTemplates()
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus(null), 2000)
  }

  const handleApply = (id) => {
    const result = applyTemplate(id)
    if (!result) return

    setConfig(result.config)

    if (result.graphSettings) {
      const gs = result.graphSettings
      const hasGraphSettings = Object.values(gs).some((v) => v !== null)
      if (hasGraphSettings) {
        const syntheticTarget = '__template__'
        setGraphSettings(syntheticTarget, gs)
      }
    }

    setSaveStatus('applied')
    setTimeout(() => setSaveStatus(null), 2000)
  }

  const handleDelete = (id) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id)
      setTimeout(() => setConfirmDeleteId(null), 3000)
      return
    }
    deleteTemplate(id)
    refreshTemplates()
    setConfirmDeleteId(null)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave()
    }
  }

  return (
    <div className="border border-border dark:border-border-dark rounded-lg bg-surface dark:bg-surface-dark p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-text-primary dark:text-text-primary-dark flex items-center gap-2">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
          </svg>
          {t('templates.title', 'Saved Templates')}
        </h4>
        {saveStatus === 'saved' && (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium">
            {t('templates.saved', 'Saved')}
          </span>
        )}
        {saveStatus === 'applied' && (
          <span className="text-xs text-accent font-medium">
            {t('templates.applied', 'Applied')}
          </span>
        )}
      </div>

      {templates.length > 0 && (
        <div className="space-y-2 mb-4">
          {templates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-border/50 dark:border-border-dark/50 bg-warm-bg dark:bg-warm-bg-dark"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark truncate">
                    {tmpl.name}
                  </span>
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono">
                    {METHOD_LABELS[tmpl.config.method] || tmpl.config.method}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {tmpl.config.referenceGene && (
                    <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark font-mono">
                      {t('templates.ref', 'Ref')}: {tmpl.config.referenceGene}
                    </span>
                  )}
                  {tmpl.config.referenceGenes?.length > 0 && !tmpl.config.referenceGene && (
                    <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark font-mono">
                      {t('templates.refs', 'Refs')}: {tmpl.config.referenceGenes.join(', ')}
                    </span>
                  )}
                  <span className="text-[10px] text-text-secondary/60 dark:text-text-secondary-dark/60">
                    {formatDate(tmpl.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleApply(tmpl.id)}
                  className="px-2.5 py-1 text-xs font-medium rounded bg-accent hover:bg-accent-hover text-white transition-colors"
                >
                  {t('templates.apply', 'Apply')}
                </button>
                <button
                  onClick={() => handleDelete(tmpl.id)}
                  className={`p-1 rounded transition-colors ${
                    confirmDeleteId === tmpl.id
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'text-text-secondary/50 dark:text-text-secondary-dark/50 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                  title={confirmDeleteId === tmpl.id ? t('templates.confirmDelete', 'Click again to confirm') : t('templates.delete', 'Delete')}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {templates.length === 0 && (
        <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-4">
          {t('templates.empty', 'No saved templates yet. Configure your analysis below and save it for reuse.')}
        </p>
      )}

      <div className="border-t border-border/50 dark:border-border-dark/50 pt-3">
        <label className="block text-xs font-medium text-text-secondary dark:text-text-secondary-dark mb-2">
          {t('templates.saveCurrentLabel', 'Save current configuration as template')}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('templates.namePlaceholder', 'e.g., My IL-6 DDCt setup')}
            className="flex-1 px-3 py-1.5 text-sm border border-border dark:border-border-dark rounded-lg bg-warm-bg dark:bg-warm-bg-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50"
            disabled={isFreeTierLimited}
          />
          <button
            onClick={handleSave}
            disabled={!templateName.trim() || isFreeTierLimited}
            className={`shrink-0 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              templateName.trim() && !isFreeTierLimited
                ? 'bg-accent hover:bg-accent-hover text-white'
                : 'bg-border dark:bg-border-dark text-text-secondary dark:text-text-secondary-dark cursor-not-allowed'
            }`}
          >
            {t('templates.save', 'Save')}
          </button>
        </div>

        {isFreeTierLimited && (
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono uppercase">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              Pro
            </span>
            <span className="text-[11px] text-text-secondary dark:text-text-secondary-dark">
              {t('templates.freeLimit', 'Free tier allows 1 saved template.')}
            </span>
            <button
              onClick={() => setShowPricing(true)}
              className="text-[11px] text-accent hover:text-accent-hover font-medium transition-colors"
            >
              {t('templates.upgrade', 'Upgrade')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
