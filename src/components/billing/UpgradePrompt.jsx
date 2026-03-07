/**
 * Minimal upgrade prompt shown when a free-tier user (past trial sessions)
 * tries to access a Plus feature.
 */
export default function UpgradePrompt({ feature, onClose, onUpgrade }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-xl p-8 max-w-sm w-full mx-4 shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl font-bold">
          This is a Plus feature
        </h3>

        <p className="mt-3 text-sm text-text-secondary dark:text-text-secondary-dark leading-relaxed">
          Unlimited analyses, full QC reports, Dr. qPCR, publication-ready figures — $99/year
        </p>

        <button
          onClick={onUpgrade}
          className="mt-6 w-full px-4 py-2.5 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
        >
          Upgrade to Plus
        </button>

        <p className="mt-3 text-xs text-text-secondary dark:text-text-secondary-dark">
          That's less than one box of pipette tips.
        </p>

        <button
          onClick={onClose}
          className="mt-3 text-xs text-text-secondary dark:text-text-secondary-dark hover:text-text-primary dark:hover:text-text-primary-dark transition-colors underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
