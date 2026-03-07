import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useStore from '../../store/useStore'
import DropZone from '../upload/DropZone'
import FormatDetector from '../upload/FormatDetector'
import RequestFormat from '../upload/RequestFormat'

/* ------------------------------------------------------------------ */
/*  Inline SVG icon helpers                                            */
/* ------------------------------------------------------------------ */

function IconUpload({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function IconConfigure({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
    </svg>
  )
}

function IconResults({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function IconShield({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function IconClipboard({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  )
}

function IconCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

function IconChat({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  )
}

function IconImage({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
    </svg>
  )
}

function IconDocument({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function IconLock({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  )
}

function IconBeaker({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Data constants                                                     */
/* ------------------------------------------------------------------ */

const INSTRUMENTS = [
  { name: 'QuantStudio 3/5/6/7', maker: 'Thermo Fisher' },
  { name: 'StepOne / StepOnePlus', maker: 'Applied Biosystems' },
  { name: 'ABI 7500 / 7500 Fast', maker: 'Applied Biosystems' },
  { name: 'CFX96 / CFX384 / Opus', maker: 'Bio-Rad' },
  { name: 'LightCycler 96 / 480', maker: 'Roche' },
  { name: 'Rotor-Gene Q / 6000', maker: 'QIAGEN' },
  { name: 'Stratagene Mx3000P/3005P', maker: 'Agilent' },
  { name: 'Mastercycler realplex', maker: 'Eppendorf' },
  { name: 'Mic qPCR (48-well)', maker: 'Bio Molecular Systems' },
  { name: 'BioMark HD / EP1', maker: 'Fluidigm' },
  { name: 'Generic CSV', maker: 'Any instrument' },
]

const FORMAT_BADGES = ['.xlsx', '.xls', '.csv']

const CITATION_TEXT = 'VoilaPCR (2026). Browser-based qPCR analysis platform. https://voilapcr.com'

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionHeading({ children, sub, className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="font-display text-3xl sm:text-4xl font-bold">{children}</h2>
      {sub && (
        <p className="mt-4 text-lg text-text-secondary dark:text-text-secondary-dark max-w-2xl mx-auto leading-relaxed">
          {sub}
        </p>
      )}
    </div>
  )
}

function ProBadge() {
  return (
    <span className="inline-block ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono uppercase tracking-wide font-semibold">
      Pro
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function LandingPage({ navigate }) {
  const { t } = useTranslation()
  const { parsedData, setStep } = useStore()
  const [annual, setAnnual] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showRequest, setShowRequest] = useState(false)

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleCopyCitation = useCallback(() => {
    navigator.clipboard.writeText(CITATION_TEXT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  const handleConfigure = useCallback(() => {
    setStep('configure')
  }, [setStep])

  /* Pricing data */
  const tiers = [
    {
      key: 'free',
      name: t('landing.pricing.free.name', 'Free'),
      price: '$0',
      period: t('landing.pricing.free.period', 'forever'),
      features: [
        t('landing.pricing.free.f1', '3 analyses per day'),
        t('landing.pricing.free.f2', 'DDCt method'),
        t('landing.pricing.free.f3', 'QC diagnostics (8 checks)'),
        t('landing.pricing.free.f4', 'CSV & graph export'),
        t('landing.pricing.free.f5', 'All 11 instrument parsers'),
      ],
      cta: t('landing.pricing.free.cta', 'Get started'),
      highlighted: false,
    },
    {
      key: 'pro',
      name: t('landing.pricing.pro.name', 'Pro'),
      price: annual ? '$9' : '$12',
      period: annual
        ? t('landing.pricing.pro.periodAnnual', '/mo, billed annually')
        : t('landing.pricing.pro.periodMonthly', '/mo'),
      features: [
        t('landing.pricing.pro.f1', 'Unlimited analyses'),
        t('landing.pricing.pro.f2', 'Pfaffl, geNorm, Standard Curve'),
        t('landing.pricing.pro.f3', 'Dr. qPCR AI assistant'),
        t('landing.pricing.pro.f4', 'Journal-ready figure presets'),
        t('landing.pricing.pro.f5', 'Priority format requests'),
        t('landing.pricing.pro.f6', 'Everything in Free'),
      ],
      cta: t('landing.pricing.pro.cta', 'Start free trial'),
      highlighted: true,
    },
    {
      key: 'lab',
      name: t('landing.pricing.lab.name', 'Lab'),
      price: t('landing.pricing.lab.price', 'Custom'),
      period: t('landing.pricing.lab.period', 'per seat/year'),
      features: [
        t('landing.pricing.lab.f1', 'Shared lab workspace'),
        t('landing.pricing.lab.f2', 'SSO & admin dashboard'),
        t('landing.pricing.lab.f3', 'Audit log & compliance'),
        t('landing.pricing.lab.f4', 'Bulk user management'),
        t('landing.pricing.lab.f5', 'Dedicated support'),
        t('landing.pricing.lab.f6', 'Everything in Pro'),
      ],
      cta: t('landing.pricing.lab.cta', 'Contact us'),
      highlighted: false,
    },
  ]

  /* Feature cards data */
  const features = [
    {
      icon: <IconDocument className="w-7 h-7" />,
      title: t('landing.features.qc.title', 'Automated QC Report'),
      body: t(
        'landing.features.qc.body',
        'Eight diagnostic checks run instantly: NTC contamination, replicate scatter, reference-gene stability, late Ct, undetermined wells, extreme fold-change, amplification efficiency, and identical-Ct flags.'
      ),
      pro: false,
    },
    {
      icon: <IconChat className="w-7 h-7" />,
      title: t('landing.features.drqpcr.title', 'Dr. qPCR AI Assistant'),
      body: t(
        'landing.features.drqpcr.body',
        'Ask plain-language questions about your results. Dr. qPCR interprets your QC flags, suggests troubleshooting steps, and explains what your fold-change values mean.'
      ),
      pro: true,
    },
    {
      icon: <IconImage className="w-7 h-7" />,
      title: t('landing.features.figures.title', 'Publication Figures'),
      body: t(
        'landing.features.figures.body',
        'Export bar charts styled for Nature, Cell, or PNAS with one click. Customize colors, fonts, error bars, and significance markers, then download as SVG or PNG.'
      ),
      pro: true,
    },
  ]

  return (
    <div>
      {/* ============================================================ */}
      {/*  SECTION 1 — Hero                                            */}
      {/* ============================================================ */}
      <section id="hero" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              {t('landing.hero.headline', 'Raw data in.\nClean results out.')}
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-text-secondary dark:text-text-secondary-dark leading-relaxed max-w-lg">
              {t(
                'landing.hero.tagline',
                'Upload your qPCR file, get publication-ready analysis in seconds. No installs, no spreadsheets, no headaches.'
              )}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => scrollTo('try-it')}
                className="px-7 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors text-base"
              >
                {t('landing.hero.ctaPrimary', 'Try it free')} &rarr;
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="px-7 py-3 border border-border dark:border-border-dark hover:border-accent dark:hover:border-accent text-text-primary dark:text-text-primary-dark font-medium rounded-lg transition-colors text-base"
              >
                {t('landing.hero.ctaSecondary', 'See how it works')}
              </button>
            </div>

            {/* Trust badge */}
            <div className="mt-6 flex items-center gap-2 text-sm text-text-secondary dark:text-text-secondary-dark">
              <IconShield className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              <span>{t('landing.hero.trust', 'Your data never leaves your browser. 100% client-side.')}</span>
            </div>
          </div>

          {/* Right — product mockup placeholder */}
          <div className="relative hidden lg:block">
            <div className="rounded-2xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark shadow-xl overflow-hidden">
              {/* Fake title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border dark:border-border-dark bg-warm-bg dark:bg-warm-bg-dark">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="ml-3 text-xs font-mono text-text-secondary dark:text-text-secondary-dark">voilapcr.com</span>
              </div>
              {/* Fake app content */}
              <div className="p-6 space-y-4">
                {/* Fake file badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-md">
                  <IconUpload className="w-4 h-4 text-accent" />
                  <span className="text-sm font-mono text-accent">experiment_001.xlsx</span>
                </div>
                {/* Fake bar chart */}
                <div className="flex items-end gap-3 h-32 pt-4">
                  <div className="flex-1 bg-accent/20 rounded-t" style={{ height: '45%' }} />
                  <div className="flex-1 bg-accent/40 rounded-t" style={{ height: '78%' }} />
                  <div className="flex-1 bg-accent/60 rounded-t" style={{ height: '62%' }} />
                  <div className="flex-1 bg-accent rounded-t" style={{ height: '100%' }} />
                  <div className="flex-1 bg-accent/70 rounded-t" style={{ height: '55%' }} />
                  <div className="flex-1 bg-accent/30 rounded-t" style={{ height: '38%' }} />
                </div>
                {/* Fake data rows */}
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <div className="h-2 w-16 rounded bg-border dark:bg-border-dark" />
                    <div className="h-2 w-24 rounded bg-border dark:bg-border-dark" />
                    <div className="h-2 w-12 rounded bg-accent/30" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-2 w-20 rounded bg-border dark:bg-border-dark" />
                    <div className="h-2 w-16 rounded bg-border dark:bg-border-dark" />
                    <div className="h-2 w-10 rounded bg-accent/30" />
                  </div>
                  <div className="flex gap-3">
                    <div className="h-2 w-14 rounded bg-border dark:bg-border-dark" />
                    <div className="h-2 w-20 rounded bg-border dark:bg-border-dark" />
                    <div className="h-2 w-14 rounded bg-accent/30" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 2 — How It Works                                    */}
      {/* ============================================================ */}
      <section id="how-it-works" className="bg-surface dark:bg-surface-dark border-y border-border dark:border-border-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <SectionHeading sub={t('landing.howItWorks.sub', 'From raw file to clean results in three steps.')}>
            {t('landing.howItWorks.title', 'How It Works')}
          </SectionHeading>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <IconUpload className="w-8 h-8" />
              </div>
              <p className="mt-2 font-mono text-xs text-accent font-semibold">01</p>
              <h3 className="mt-2 font-display text-xl font-bold">
                {t('landing.howItWorks.s1Title', 'Upload')}
              </h3>
              <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                {t('landing.howItWorks.s1Desc', 'Drop your .xlsx, .xls, or .csv file. We auto-detect your instrument format.')}
              </p>
            </div>

            {/* Connector (desktop) */}
            <div className="hidden md:flex items-start justify-center pt-8">
              <div className="w-full border-t-2 border-dashed border-border dark:border-border-dark mt-8 relative">
                <div className="absolute -right-2 -top-1.5 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-border dark:border-l-border-dark" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <IconConfigure className="w-8 h-8" />
              </div>
              <p className="mt-2 font-mono text-xs text-accent font-semibold">02</p>
              <h3 className="mt-2 font-display text-xl font-bold">
                {t('landing.howItWorks.s2Title', 'Configure')}
              </h3>
              <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                {t('landing.howItWorks.s2Desc', 'Pick your reference gene, control group, and analysis method. Or let the defaults run.')}
              </p>
            </div>
          </div>

          {/* Step 3 below on its own row for visual balance */}
          <div className="mt-8 md:mt-10 flex justify-center">
            <div className="text-center max-w-xs">
              <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                <IconResults className="w-8 h-8" />
              </div>
              <p className="mt-2 font-mono text-xs text-accent font-semibold">03</p>
              <h3 className="mt-2 font-display text-xl font-bold">
                {t('landing.howItWorks.s3Title', 'Voila')}
              </h3>
              <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                {t('landing.howItWorks.s3Desc', 'Get fold-change tables, QC reports, and publication-ready figures. Export or share instantly.')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 3 — Drop Zone (Try It Now)                          */}
      {/* ============================================================ */}
      <section id="try-it" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <SectionHeading sub={t('landing.tryIt.sub', 'No sign-up required. Your data stays in your browser.')}>
          {t('landing.tryIt.title', 'Try it now')}
        </SectionHeading>

        <div className="mt-10">
          <DropZone />
        </div>

        {/* Format badges */}
        <div className="mt-4 flex justify-center flex-wrap gap-2">
          {FORMAT_BADGES.map((fmt) => (
            <span
              key={fmt}
              className="inline-block px-2.5 py-1 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-xs font-mono text-text-secondary dark:text-text-secondary-dark"
            >
              {fmt}
            </span>
          ))}
          <span className="inline-block px-2.5 py-1 rounded bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-xs font-mono text-text-secondary dark:text-text-secondary-dark">
            {t('landing.tryIt.moreFormats', '+ 11 instruments')}
          </span>
        </div>

        {/* Post-upload state */}
        {parsedData && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <FormatDetector />
            <button
              onClick={handleConfigure}
              className="px-8 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
            >
              {t('landing.tryIt.configure', 'Configure Analysis')} &rarr;
            </button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/*  SECTION 4 — Feature Showcase                                */}
      {/* ============================================================ */}
      <section id="features" className="bg-surface dark:bg-surface-dark border-y border-border dark:border-border-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <SectionHeading sub={t('landing.features.sub', 'Everything you need for rigorous, reproducible qPCR analysis.')}>
            {t('landing.features.title', 'Built for bench scientists')}
          </SectionHeading>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div
                key={feat.title}
                className="relative p-6 rounded-xl border border-border dark:border-border-dark bg-warm-bg dark:bg-warm-bg-dark transition-shadow hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold flex items-center">
                  {feat.title}
                  {feat.pro && <ProBadge />}
                </h3>
                <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
                  {feat.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 5 — Supported Instruments                           */}
      {/* ============================================================ */}
      <section id="instruments" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <SectionHeading sub={t('landing.instruments.sub', 'Auto-detected on upload. No manual format selection needed.')}>
          {t('landing.instruments.title', 'Supported Instruments')}
        </SectionHeading>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {INSTRUMENTS.map((inst) => (
            <div
              key={inst.name}
              className="flex items-center gap-3 p-4 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark"
            >
              <IconBeaker className="w-5 h-5 text-accent flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{inst.name}</p>
                <p className="text-xs text-text-secondary dark:text-text-secondary-dark">{inst.maker}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setShowRequest(true)}
            className="text-sm text-accent hover:text-accent-hover transition-colors underline underline-offset-4"
          >
            {t('landing.instruments.requestCta', "Don't see your machine? Request it.")}
          </button>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 6 — Pricing                                         */}
      {/* ============================================================ */}
      <section id="pricing" className="bg-surface dark:bg-surface-dark border-y border-border dark:border-border-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <SectionHeading sub={t('landing.pricing.sub', 'Start free. Upgrade when you need more power.')}>
            {t('landing.pricing.title', 'Simple, transparent pricing')}
          </SectionHeading>

          {/* Toggle */}
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-1 bg-warm-bg dark:bg-warm-bg-dark border border-border dark:border-border-dark rounded-lg p-1">
              <button
                onClick={() => setAnnual(false)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  !annual
                    ? 'bg-accent text-white'
                    : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
                }`}
              >
                {t('landing.pricing.monthly', 'Monthly')}
              </button>
              <button
                onClick={() => setAnnual(true)}
                className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                  annual
                    ? 'bg-accent text-white'
                    : 'text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark'
                }`}
              >
                {t('landing.pricing.annual', 'Annual')}{' '}
                <span className="text-xs opacity-80">{t('landing.pricing.save', 'Save 25%')}</span>
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((plan) => (
              <div
                key={plan.key}
                className={`relative p-6 rounded-xl border transition-shadow ${
                  plan.highlighted
                    ? 'border-accent shadow-lg shadow-accent/10 dark:shadow-accent/5'
                    : 'border-border dark:border-border-dark'
                } bg-warm-bg dark:bg-warm-bg-dark`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent text-white text-xs font-mono rounded-full">
                    {t('landing.pricing.popular', 'Most Popular')}
                  </div>
                )}
                <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-mono">{plan.price}</span>
                  <span className="text-sm text-text-secondary dark:text-text-secondary-dark">{plan.period}</span>
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <IconCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    if (plan.key === 'free') scrollTo('try-it')
                    else if (plan.key === 'lab') window.open('mailto:support@voilapcr.com?subject=Lab%20plan%20inquiry')
                    else navigate('/pricing')
                  }}
                  className={`mt-8 w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    plan.highlighted
                      ? 'bg-accent hover:bg-accent-hover text-white'
                      : 'border border-accent text-accent hover:bg-accent hover:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 7 — Trust / Social Proof                            */}
      {/* ============================================================ */}
      <section id="trust" className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <SectionHeading>
          {t('landing.trust.title', 'Built for trust')}
        </SectionHeading>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Privacy */}
          <div className="p-6 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center">
              <IconLock className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">
              {t('landing.trust.privacy.title', 'Your data never leaves your browser')}
            </h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
              {t(
                'landing.trust.privacy.body',
                'All parsing, QC, and analysis run entirely in JavaScript on your machine. No file is uploaded to any server. Your raw data is never transmitted, stored, or accessible to anyone but you.'
              )}
            </p>
          </div>

          {/* MIQE */}
          <div className="p-6 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
            <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <IconShield className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">
              {t('landing.trust.miqe.title', 'MIQE-aware diagnostics')}
            </h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
              {t(
                'landing.trust.miqe.body',
                'Our QC checks are aligned with the MIQE guidelines (Bustin et al., 2009). Each diagnostic references the relevant MIQE criterion so reviewers can verify compliance.'
              )}
            </p>
          </div>

          {/* Citation */}
          <div className="p-6 rounded-xl border border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <IconClipboard className="w-5 h-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold">
              {t('landing.trust.citation.title', 'Cite VoilaPCR')}
            </h3>
            <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
              {t('landing.trust.citation.body', 'Use this citation in your methods section:')}
            </p>
            <div className="mt-3 relative">
              <div className="p-3 bg-warm-bg dark:bg-warm-bg-dark rounded-lg text-xs font-mono text-text-secondary dark:text-text-secondary-dark leading-relaxed break-all">
                {CITATION_TEXT}
              </div>
              <button
                onClick={handleCopyCitation}
                className="absolute top-2 right-2 p-1.5 rounded hover:bg-surface dark:hover:bg-surface-dark transition-colors"
                aria-label="Copy citation"
              >
                {copied ? (
                  <IconCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <IconClipboard className="w-4 h-4 text-text-secondary dark:text-text-secondary-dark" />
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  SECTION 8 — Landing Footer                                  */}
      {/* ============================================================ */}
      <section id="landing-footer" className="border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div>
              <a
                href="/"
                onClick={(e) => { e.preventDefault(); navigate('/') }}
                className="flex items-baseline gap-0.5 hover:opacity-80 transition-opacity"
              >
                <span className="font-display text-xl font-bold text-accent">
                  {t('brandAccent', 'Voila')}
                </span>
                <span className="font-mono text-xl font-semibold text-accent">
                  {t('brandMono', 'PCR')}
                </span>
              </a>
              <p className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark max-w-xs">
                {t('landing.footer.tagline', 'Browser-based qPCR analysis for modern scientists. A product of VoilaScience.')}
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-12 gap-y-4 text-sm">
              <div className="space-y-2">
                <p className="font-medium text-xs uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                  {t('landing.footer.productLabel', 'Product')}
                </p>
                <a
                  href="#how-it-works"
                  onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }}
                  className="block text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors"
                >
                  {t('landing.footer.howItWorks', 'How It Works')}
                </a>
                <a
                  href="#pricing"
                  onClick={(e) => { e.preventDefault(); scrollTo('pricing') }}
                  className="block text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors"
                >
                  {t('landing.footer.pricing', 'Pricing')}
                </a>
                <a
                  href="/formats"
                  onClick={(e) => { e.preventDefault(); navigate('/formats') }}
                  className="block text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors"
                >
                  {t('landing.footer.formats', 'Supported Formats')}
                </a>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-xs uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                  {t('landing.footer.resourcesLabel', 'Resources')}
                </p>
                <a
                  href="/changelog"
                  onClick={(e) => { e.preventDefault(); navigate('/changelog') }}
                  className="block text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors"
                >
                  {t('landing.footer.changelog', 'Changelog')}
                </a>
                <a
                  href="#trust"
                  onClick={(e) => { e.preventDefault(); scrollTo('trust') }}
                  className="block text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors"
                >
                  {t('landing.footer.privacy', 'Privacy')}
                </a>
              </div>

              <div className="space-y-2">
                <p className="font-medium text-xs uppercase tracking-wider text-text-secondary dark:text-text-secondary-dark">
                  {t('landing.footer.contactLabel', 'Contact')}
                </p>
                <a
                  href="mailto:support@voilapcr.com"
                  className="block text-text-secondary dark:text-text-secondary-dark hover:text-accent transition-colors"
                >
                  support@voilapcr.com
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-6 border-t border-border dark:border-border-dark flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary dark:text-text-secondary-dark">
            <p>{t('landing.footer.copyright', '2026 VoilaScience. All rights reserved.')}</p>
            <p>{t('landing.footer.madeWith', 'Made for scientists, by scientists.')}</p>
          </div>
        </div>
      </section>

      {/* Request format modal */}
      {showRequest && <RequestFormat onClose={() => setShowRequest(false)} />}
    </div>
  )
}
