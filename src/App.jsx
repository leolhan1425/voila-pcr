import { useState } from 'react'
import useStore from './store/useStore'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProgressStepper from './components/layout/ProgressStepper'
import LandingPage from './components/pages/LandingPage'
import ConfigPanel from './components/configure/ConfigPanel'
import ResultsPanel from './components/results/ResultsPanel'
import DrQPCRPanel from './components/dr-qpcr/DrQPCRPanel'
import FeedbackButtons from './components/feedback/FeedbackButtons'
import LoginModal from './components/auth/LoginModal'
import PricingModal from './components/billing/PricingModal'
import UpgradePrompt from './components/billing/UpgradePrompt'
import HowItWorks from './components/pages/HowItWorks'
import PricingPage from './components/pages/PricingPage'
import FormatsPage from './components/pages/FormatsPage'
import ChangelogPage from './components/pages/ChangelogPage'
import PrivacyPage from './components/pages/PrivacyPage'
import AboutPage from './components/pages/AboutPage'
import BlogPage from './components/pages/BlogPage'
import AdminPage from './components/pages/AdminPage'

function getPage() {
  const path = window.location.pathname
  if (path === '/how-it-works') return 'howItWorks'
  if (path === '/pricing') return 'pricing'
  if (path === '/formats') return 'formats'
  if (path === '/changelog') return 'changelog'
  if (path === '/privacy') return 'privacy'
  if (path === '/about') return 'about'
  if (path.startsWith('/blog')) return 'blog'
  if (path === '/admin') return 'admin'
  return 'app'
}

function getBlogSlug() {
  const path = window.location.pathname
  if (path === '/blog') return null
  const match = path.match(/^\/blog\/(.+)$/)
  return match ? match[1] : null
}

export default function App() {
  const { step, darkMode, showLogin, setShowLogin, showPricing, setShowPricing, showUpgradePrompt, setShowUpgradePrompt } = useStore()
  const [page, setPage] = useState(getPage)

  const navigate = (path) => {
    window.history.pushState({}, '', path)
    setPage(getPage())
    window.scrollTo(0, 0)
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
      case 'privacy': return <PrivacyPage />
      case 'about': return <AboutPage />
      case 'blog': return <BlogPage slug={getBlogSlug()} navigate={navigate} />
      case 'admin': return <AdminPage />
      default:
        if (step === 'upload') {
          return <LandingPage navigate={navigate} />
        }
        return (
          <>
            <ProgressStepper />
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
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
        <FeedbackButtons />
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
