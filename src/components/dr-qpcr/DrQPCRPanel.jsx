import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import ChatMessage from './ChatMessage'
import ExamplePrompts from './ExamplePrompts'
import ImageUpload from './ImageUpload'

export default function DrQPCRPanel() {
  const { t } = useTranslation()
  const { tier, diagnosticReport } = useStore()

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [pendingImage, setPendingImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [contextInjected, setContextInjected] = useState(false)

  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  // Inject diagnostic context on first open if there are issues
  useEffect(() => {
    if (open && !contextInjected && diagnosticReport && diagnosticReport.issueCount > 0) {
      const issueList = diagnosticReport.issues
        .map((i) => `- [${i.severity}] ${i.title}: ${i.summary}`)
        .join('\n')

      const contextMsg = {
        role: 'assistant',
        content: t(
          'drqpcr.contextIntro',
          `I noticed **{{count}} issue(s)** in your qPCR data. Here's what I found:\n\n${issueList}\n\nFeel free to ask me about any of these, or ask me anything else about your experiment.`,
          { count: diagnosticReport.issueCount }
        ),
      }

      setMessages([contextMsg])
      setContextInjected(true)
    }
  }, [open, contextInjected, diagnosticReport, t])

  const handleOpen = () => {
    if (tier === 'free') {
      setShowUpgradePrompt(true)
      setTimeout(() => setShowUpgradePrompt(false), 3000)
      return
    }
    setOpen(true)
  }

  const sendMessage = useCallback(
    async (text, image = null) => {
      if (!text.trim() && !image) return

      const userMsg = { role: 'user', content: text.trim(), image }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setPendingImage(null)
      setLoading(true)

      // Mock API call — will be wired to /api/dr-qpcr later
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1200))

        const assistantMsg = {
          role: 'assistant',
          content: t(
            'drqpcr.mockResponse',
            'Thank you for your question. Dr. qPCR will be available soon with AI-powered qPCR troubleshooting. Your question has been noted and will be answered when the service is connected.'
          ),
        }

        setMessages((prev) => [...prev, assistantMsg])
      } catch {
        // no-op for mock
      } finally {
        setLoading(false)
      }
    },
    [t]
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input, pendingImage)
  }

  const handleExamplePrompt = (prompt) => {
    sendMessage(prompt)
  }

  return (
    <>
      {/* Floating trigger button */}
      <div className="fixed bottom-6 right-6 z-50">
        {showUpgradePrompt && (
          <div className="absolute bottom-full right-0 mb-2 w-56 p-3 rounded-lg bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-lg text-xs text-text-primary dark:text-text-primary-dark">
            <p className="font-medium mb-1">{t('drqpcr.proFeature', 'Pro feature')}</p>
            <p className="text-text-secondary dark:text-text-secondary-dark">
              {t('drqpcr.upgradePrompt', 'Upgrade to Pro or Lab to access Dr. qPCR, your AI troubleshooting assistant.')}
            </p>
          </div>
        )}
        {!open && (
          <button
            onClick={handleOpen}
            className="w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            title={t('drqpcr.openChat', 'Open Dr. qPCR')}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 20.25V6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 16.5H7.5l-3.75 3.75z" />
            </svg>
          </button>
        )}
      </div>

      {/* Slide-out panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] z-50 flex flex-col bg-warm-bg dark:bg-warm-bg-dark border-l border-border dark:border-border-dark shadow-2xl animate-slide-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-text-primary dark:text-text-primary-dark">
                    {t('drqpcr.title', 'Dr. qPCR')}
                  </h2>
                  <p className="text-[11px] text-text-secondary dark:text-text-secondary-dark">
                    {t('drqpcr.subtitle', 'AI troubleshooting assistant')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-warm-bg dark:hover:bg-warm-bg-dark transition-colors text-text-secondary dark:text-text-secondary-dark"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Chat messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1">
                    {t('drqpcr.welcome', 'Ask Dr. qPCR anything')}
                  </p>
                  <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                    {t('drqpcr.welcomeSub', 'Get help troubleshooting your qPCR experiments, interpreting results, or optimizing protocols.')}
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  image={msg.image}
                />
              ))}

              {loading && (
                <div className="flex justify-start mb-3">
                  <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-lg rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-text-secondary dark:bg-text-secondary-dark animate-bounce [animation-delay:0ms]" />
                      <span className="w-2 h-2 rounded-full bg-text-secondary dark:bg-text-secondary-dark animate-bounce [animation-delay:150ms]" />
                      <span className="w-2 h-2 rounded-full bg-text-secondary dark:bg-text-secondary-dark animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Example prompts — shown when no messages yet */}
            {messages.length === 0 && (
              <ExamplePrompts onSend={handleExamplePrompt} />
            )}

            {/* Input area */}
            <form
              onSubmit={handleSubmit}
              className="flex items-end gap-2 px-4 py-3 border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
            >
              <ImageUpload onUpload={setPendingImage} />

              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('drqpcr.placeholder', 'Ask about your qPCR data...')}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border dark:border-border-dark bg-warm-bg dark:bg-warm-bg-dark text-text-primary dark:text-text-primary-dark placeholder:text-text-secondary/60 dark:placeholder:text-text-secondary-dark/60 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={loading || (!input.trim() && !pendingImage)}
                className="p-2 rounded-lg bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </>
      )}
    </>
  )
}
