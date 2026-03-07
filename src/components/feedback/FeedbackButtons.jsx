import { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY_FORMATS = 'voilapcr_format_requests'
const STORAGE_KEY_FEEDBACK = 'voilapcr_feedback'

const CATEGORIES = ['New feature', 'Bug report', 'UX improvement', 'Other']

function SlidePanel({ open, onClose, children }) {
  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[400px] z-40 flex flex-col bg-warm-bg dark:bg-warm-bg-dark border-l border-border dark:border-border-dark shadow-2xl animate-slide-in">
        {children}
      </div>
    </>
  )
}

function PanelHeader({ title, subtitle, icon, onClose }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <h2 className="font-display text-base font-bold text-text-primary dark:text-text-primary-dark">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 rounded-lg hover:bg-warm-bg dark:hover:bg-warm-bg-dark transition-colors text-text-secondary dark:text-text-secondary-dark"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

function FormatRequestPanel({ open, onClose }) {
  const { t } = useTranslation()
  const [instrument, setInstrument] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const resetForm = useCallback(() => {
    setInstrument('')
    setEmail('')
    setNotes('')
    setFile(null)
    setSubmitted(false)
    setDragOver(false)
  }, [])

  const handleClose = () => {
    onClose()
    setTimeout(resetForm, 300)
  }

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) setFile(dropped)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const entry = {
      instrument,
      email,
      notes,
      fileName: file?.name || null,
      fileSize: file?.size || null,
      timestamp: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_FORMATS) || '[]')
    existing.push(entry)
    localStorage.setItem(STORAGE_KEY_FORMATS, JSON.stringify(existing))

    setSubmitted(true)
  }

  return (
    <SlidePanel open={open} onClose={handleClose}>
      <PanelHeader
        title={t('feedback.formatTitle', 'Format not supported?')}
        subtitle={t('feedback.formatSubtitle', 'Tell us about your instrument')}
        icon={
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        }
        onClose={handleClose}
      />

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              {t('feedback.formatSuccess', "Thanks! We'll email you when {{instrument}} is supported.", { instrument: instrument || 'your format' })}
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              {t('feedback.close', 'Close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* File drop zone */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
                {t('feedback.uploadFile', 'Upload problematic file')}
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                  dragOver
                    ? 'border-accent bg-accent/5'
                    : 'border-border dark:border-border-dark hover:border-accent/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <span className="text-sm text-text-primary dark:text-text-primary-dark font-medium truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setFile(null)
                      }}
                      className="ml-1 text-text-secondary dark:text-text-secondary-dark hover:text-accent"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div>
                    <svg className="w-8 h-8 mx-auto mb-2 text-text-secondary dark:text-text-secondary-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                      {t('feedback.dropHint', 'Drop your file here or click to browse')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instrument name */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
                {t('feedback.instrumentLabel', 'Instrument / machine name')}
              </label>
              <input
                type="text"
                value={instrument}
                onChange={(e) => setInstrument(e.target.value)}
                placeholder={t('feedback.instrumentPlaceholder', 'e.g. Roche LightCycler 96')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
                {t('feedback.emailLabel', 'Email')}
                <span className="text-accent ml-1">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('feedback.emailPlaceholder', 'you@lab.edu')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
                {t('feedback.notesLabel', 'Notes')}
                <span className="text-text-secondary dark:text-text-secondary-dark text-xs ml-1.5">
                  {t('feedback.optional', '(optional)')}
                </span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder={t('feedback.notesPlaceholder', 'Any details about the file format or error you encountered...')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              {t('feedback.submitFormat', 'Submit request')}
            </button>
          </form>
        )}
      </div>
    </SlidePanel>
  )
}

function IdeaFeedbackPanel({ open, onClose }) {
  const { t } = useTranslation()
  const [category, setCategory] = useState(CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const resetForm = useCallback(() => {
    setCategory(CATEGORIES[0])
    setMessage('')
    setEmail('')
    setSubmitted(false)
  }, [])

  const handleClose = () => {
    onClose()
    setTimeout(resetForm, 300)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const entry = {
      category,
      message,
      email: email || null,
      timestamp: new Date().toISOString(),
    }

    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_FEEDBACK) || '[]')
    existing.push(entry)
    localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(existing))

    setSubmitted(true)
  }

  const categoryLabels = {
    'New feature': t('feedback.catFeature', 'New feature'),
    'Bug report': t('feedback.catBug', 'Bug report'),
    'UX improvement': t('feedback.catUX', 'UX improvement'),
    'Other': t('feedback.catOther', 'Other'),
  }

  return (
    <SlidePanel open={open} onClose={handleClose}>
      <PanelHeader
        title={t('feedback.ideaTitle', 'Have an idea?')}
        subtitle={t('feedback.ideaSubtitle', 'We love hearing from researchers')}
        icon={
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        }
        onClose={handleClose}
      />

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {submitted ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
              {t('feedback.ideaSuccess', 'Thanks -- we read every suggestion.')}
            </p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 text-sm bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              {t('feedback.close', 'Close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
                {t('feedback.categoryLabel', 'Category')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:border-accent transition-colors appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b6b6b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
                {t('feedback.messageLabel', 'Your feedback')}
                <span className="text-accent ml-1">*</span>
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder={t('feedback.messagePlaceholder', 'Describe your idea, issue, or suggestion...')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:border-accent transition-colors resize-none"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1.5">
                {t('feedback.emailLabel', 'Email')}
                <span className="text-text-secondary dark:text-text-secondary-dark text-xs ml-1.5">
                  {t('feedback.optional', '(optional)')}
                </span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('feedback.emailPlaceholder', 'you@lab.edu')}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/50 dark:placeholder:text-text-secondary-dark/50 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-sm font-medium bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
            >
              {t('feedback.submitIdea', 'Send feedback')}
            </button>
          </form>
        )}
      </div>
    </SlidePanel>
  )
}

export default function FeedbackButtons() {
  const { t } = useTranslation()
  const [formatOpen, setFormatOpen] = useState(false)
  const [ideaOpen, setIdeaOpen] = useState(false)

  return (
    <>
      {/* Floating buttons — positioned below the Dr. qPCR button (which is bottom-6 right-6 z-50) */}
      <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-2 items-end">
        {/* Format not supported */}
        <button
          onClick={() => setFormatOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-md hover:shadow-lg text-xs font-medium text-text-primary dark:text-text-primary-dark hover:border-accent transition-all"
        >
          <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          {t('feedback.formatBtn', 'Format not supported?')}
        </button>

        {/* Have an idea */}
        <button
          onClick={() => setIdeaOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-md hover:shadow-lg text-xs font-medium text-text-primary dark:text-text-primary-dark hover:border-accent transition-all"
        >
          <svg className="w-3.5 h-3.5 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          {t('feedback.ideaBtn', 'Have an idea?')}
        </button>
      </div>

      {/* Slide-out panels */}
      <FormatRequestPanel open={formatOpen} onClose={() => setFormatOpen(false)} />
      <IdeaFeedbackPanel open={ideaOpen} onClose={() => setIdeaOpen(false)} />
    </>
  )
}
