import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useAuth from '../../hooks/useAuth'

/**
 * Referral code display component.
 * Shows user's unique referral code, copy button, share link, and stats.
 *
 * TODO: Replace mock code generation and stats with Supabase data.
 */
export default function ReferralCode() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  // Generate a mock referral code from user email
  const referralCode = useMemo(() => {
    if (!user?.email) return null
    const hash = user.email
      .split('')
      .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
    return `VOILA-${Math.abs(hash).toString(36).toUpperCase().slice(0, 6)}`
  }, [user?.email])

  if (!user || !referralCode) return null

  const shareUrl = `https://qpcr.hanlabnw.com?ref=${referralCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const input = document.createElement('input')
      input.value = shareUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // TODO: Fetch real referral stats from backend
  const stats = { sent: 0, conversions: 0 }

  return (
    <div className="border border-border dark:border-border-dark rounded-xl p-5">
      <h3 className="font-display text-base font-bold mb-3">{t('referral.title')}</h3>

      <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-4">
        {t('referral.description')}
      </p>

      {/* Code display */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 px-3 py-2 bg-warm-bg dark:bg-warm-bg-dark border border-border dark:border-border-dark rounded-lg font-mono text-sm tracking-wide">
          {referralCode}
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-2 text-sm font-medium border border-border dark:border-border-dark rounded-lg hover:bg-warm-bg dark:hover:bg-warm-bg-dark transition-colors"
        >
          {copied ? (
            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {t('referral.copied')}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {t('referral.copy')}
            </span>
          )}
        </button>
      </div>

      {/* Share link */}
      <p className="text-xs text-text-secondary dark:text-text-secondary-dark mb-4 break-all">
        {t('referral.shareLink')}: {shareUrl}
      </p>

      {/* Stats */}
      <div className="flex gap-4 pt-3 border-t border-border dark:border-border-dark">
        <div>
          <p className="text-lg font-bold">{stats.sent}</p>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
            {t('referral.sent')}
          </p>
        </div>
        <div>
          <p className="text-lg font-bold">{stats.conversions}</p>
          <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
            {t('referral.conversions')}
          </p>
        </div>
      </div>
    </div>
  )
}
