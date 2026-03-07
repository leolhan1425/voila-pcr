import { useState } from 'react'
import useStore from './store/useStore'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProgressStepper from './components/layout/ProgressStepper'
import UploadStep from './components/upload/UploadStep'
import ConfigPanel from './components/configure/ConfigPanel'
import ResultsPanel from './components/results/ResultsPanel'
import DrQPCRPanel from './components/dr-qpcr/DrQPCRPanel'
import LoginModal from './components/auth/LoginModal'
import PricingModal from './components/billing/PricingModal'
import UpgradePrompt from './components/billing/UpgradePrompt'
import HowItWorks from './components/pages/HowItWorks'
import PricingPage from './components/pages/PricingPage'
import FormatsPage from './components/pages/FormatsPage'
import ChangelogPage from './components/pages/ChangelogPage'

function getPage() {
  const path = window.location.pathname
  if (path === '/how-it-works') return 'howItWorks'
  if (path === '/pricing') return 'pricing'
  if (path === '/formats') return 'formats'
  if (path === '/changelog') return 'changelog'
  return 'app'
}

export default function App() {
  const { step, darkMode, showLogin, setShowLogin, showPricing, setShowPricing, showUpgradePrompt, setShowUpgradePrompt } = useStore()
  const [page, setPage] = useState(getPage)

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setPage(getPage())
  }

  // Handle browser back/forward
  if (typeof window !== 'undefined') {
    window.onpopstate = () => setPage(getPage())
  }

  const renderPage = () => {
    switch (page) {
      case 'howItWorks': return <HowItWorks />
      case 'pricing': return <PricingPage />
      case 'formats': return <FormatsPage />
      case 'changelog': return <ChangelogPage />
      default:
        return (
          <>
            {step !== 'upload' && <ProgressStepper />}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
              {step === 'upload' && <UploadStep />}
              {step === 'configure' && <ConfigPanel />}
              {step === 'results' && <ResultsPanel />}
            </main>
          </>
        )
    }
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-warm-bg text-text-primary dark:bg-warm-bg-dark dark:text-text-primary-dark transition-colors">
        <Header navigate={navigate} />
        {renderPage()}
        <Footer navigate={navigate} />

        {/* Global overlays */}
        <DrQPCRPanel />
        {showLogin && <LoginModal isOpen={true} onClose={() => setShowLogin(false)} />}
        {showPricing && <PricingModal onClose={() => setShowPricing(false)} />}
        {showUpgradePrompt && (
          <UpgradePrompt
            feature={showUpgradePrompt}
            onClose={() => setShowUpgradePrompt(null)}
            onUpgrade={() => {
              setShowUpgradePrompt(null)
              setShowPricing(true)
            }}
          />
        )}
      </div>
    </div>
  )
}
