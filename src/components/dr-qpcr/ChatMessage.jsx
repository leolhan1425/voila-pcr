import { useTranslation } from 'react-i18next'

/**
 * Render basic markdown-ish formatting: **bold** and line breaks.
 */
function renderContent(text) {
  if (!text) return null

  return text.split('\n').map((line, lineIdx) => {
    // Replace **bold** patterns
    const parts = []
    let remaining = line
    let key = 0

    while (remaining.length > 0) {
      const boldStart = remaining.indexOf('**')
      if (boldStart === -1) {
        parts.push(<span key={key++}>{remaining}</span>)
        break
      }

      const boldEnd = remaining.indexOf('**', boldStart + 2)
      if (boldEnd === -1) {
        parts.push(<span key={key++}>{remaining}</span>)
        break
      }

      // Text before bold
      if (boldStart > 0) {
        parts.push(<span key={key++}>{remaining.slice(0, boldStart)}</span>)
      }

      // Bold text
      parts.push(
        <strong key={key++} className="font-semibold">
          {remaining.slice(boldStart + 2, boldEnd)}
        </strong>
      )

      remaining = remaining.slice(boldEnd + 2)
    }

    return (
      <span key={lineIdx}>
        {lineIdx > 0 && <br />}
        {parts}
      </span>
    )
  })
}

export default function ChatMessage({ role, content, image }) {
  const { t } = useTranslation()
  const isUser = role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
          isUser
            ? 'bg-accent text-white rounded-br-sm'
            : 'bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark rounded-bl-sm'
        }`}
      >
        {/* Attached image */}
        {image && (
          <div className="mb-2">
            <img
              src={image}
              alt={t('drqpcr.attachedImage', 'Attached image')}
              className="max-w-full max-h-48 rounded border border-white/20"
            />
          </div>
        )}

        {/* Message text */}
        <div className={`leading-relaxed ${!isUser ? 'font-body' : ''}`}>
          {renderContent(content)}
        </div>
      </div>
    </div>
  )
}
