import useStore from './store/useStore'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProgressStepper from './components/layout/ProgressStepper'
import UploadStep from './components/upload/UploadStep'
import ConfigPanel from './components/configure/ConfigPanel'
import ResultsPanel from './components/results/ResultsPanel'

export default function App() {
  const { step, darkMode } = useStore()

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-warm-bg text-text-primary dark:bg-warm-bg-dark dark:text-text-primary-dark transition-colors">
        <Header />
        {step !== 'upload' && <ProgressStepper />}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
          {step === 'upload' && <UploadStep />}
          {step === 'configure' && <ConfigPanel />}
          {step === 'results' && <ResultsPanel />}
        </main>
        <Footer />
      </div>
    </div>
  )
}
