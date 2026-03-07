import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const CITATIONS = {
  apa: 'VoilaPCR (2026). VoilaPCR: Web-based qPCR data analysis platform. https://voilapcr.com',
  journal: 'Data were analyzed using VoilaPCR (https://voilapcr.com).',
}

export default function AboutPage() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(null)

  const copyToClipboard = (key) => {
    const text = key === 'apa'
      ? t('pages.about.citation.apa', CITATIONS.apa)
      : t('pages.about.citation.journal', CITATIONS.journal)
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="font-display text-4xl sm:text-5xl font-bold text-center">
        {t('pages.about.title', 'About VoilaPCR')}
      </h1>

      <div className="mt-12 space-y-8">
        <div className="border-l-2 border-accent pl-6">
          <h2 className="font-display text-xl font-bold">
            {t('pages.about.storyTitle', 'The Story')}
          </h2>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            {t(
              'pages.about.storyBody',
              'VoilaPCR was built by a scientist who got tired of spending more time wrestling with spreadsheets than doing actual science. After years of copying Ct values into Excel templates, manually calculating delta-delta-Ct, and reformatting bar charts for the tenth time before submission, the answer became obvious: this should be a single drag-and-drop.'
            )}
          </p>
        </div>

        <div className="border-l-2 border-accent pl-6">
          <h2 className="font-display text-xl font-bold">
            {t('pages.about.missionTitle', 'Mission')}
          </h2>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            {t(
              'pages.about.missionBody',
              'Make qPCR data analysis accessible, fast, and reliable for every scientist. Whether you are a graduate student running your first RT-qPCR or a core facility processing hundreds of plates a week, VoilaPCR gives you publication-ready results in seconds — with full QC, multiple analysis methods, and no software to install.'
            )}
          </p>
        </div>

        <div className="border-l-2 border-accent pl-6">
          <h2 className="font-display text-xl font-bold">
            {t('pages.about.brandTitle', 'VoilaScience')}
          </h2>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            {t(
              'pages.about.brandBody',
              'VoilaPCR is the first product under the VoilaScience brand — a suite of scientific data analysis tools that just work. We believe researchers should spend their time on hypotheses, not formatting. More tools are on the way.'
            )}
          </p>
        </div>

        <div className="p-6 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
          <h2 className="font-display text-xl font-bold">
            {t('pages.about.citationTitle', 'Cite VoilaPCR')}
          </h2>
          <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
            {t('pages.about.citationSubtitle', 'If VoilaPCR helped with your research, consider citing it.')}
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="text-xs font-mono text-accent font-semibold mb-1.5">
                {t('pages.about.citation.apaLabel', 'APA')}
              </p>
              <div className="flex items-start gap-3">
                <p className="flex-1 text-sm text-text-secondary dark:text-text-secondary-dark font-mono bg-warm-bg dark:bg-warm-bg-dark rounded-lg px-4 py-3 leading-relaxed">
                  {t('pages.about.citation.apa', CITATIONS.apa)}
                </p>
                <button
                  onClick={() => copyToClipboard('apa')}
                  className="flex-shrink-0 px-3 py-2 text-xs font-medium rounded-lg border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
                >
                  {copied === 'apa'
                    ? t('pages.about.citation.copied', 'Copied')
                    : t('pages.about.citation.copy', 'Copy')}
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs font-mono text-accent font-semibold mb-1.5">
                {t('pages.about.citation.journalLabel', 'In-text (journal)')}
              </p>
              <div className="flex items-start gap-3">
                <p className="flex-1 text-sm text-text-secondary dark:text-text-secondary-dark font-mono bg-warm-bg dark:bg-warm-bg-dark rounded-lg px-4 py-3 leading-relaxed">
                  {t('pages.about.citation.journal', CITATIONS.journal)}
                </p>
                <button
                  onClick={() => copyToClipboard('journal')}
                  className="flex-shrink-0 px-3 py-2 text-xs font-medium rounded-lg border border-accent text-accent hover:bg-accent hover:text-white transition-colors"
                >
                  {copied === 'journal'
                    ? t('pages.about.citation.copied', 'Copied')
                    : t('pages.about.citation.copy', 'Copy')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-l-2 border-accent pl-6">
          <h2 className="font-display text-xl font-bold">
            {t('pages.about.contactTitle', 'Contact')}
          </h2>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark leading-relaxed">
            {t('pages.about.contactBody', 'Questions, feedback, or partnership inquiries:')}
          </p>
          <a
            href="mailto:hello@voilapcr.com"
            className="inline-block mt-2 text-accent hover:text-accent-hover font-mono text-sm transition-colors"
          >
            hello@voilapcr.com
          </a>
        </div>
      </div>
    </main>
  )
}
