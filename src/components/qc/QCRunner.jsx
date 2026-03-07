import { useEffect } from 'react'
import useStore from '../../store/useStore'
import { runDiagnostics } from '../../qc/runDiagnostics'

export default function QCRunner() {
  const { parsedData, config, results, setDiagnosticReport } = useStore()

  useEffect(() => {
    if (parsedData && results) {
      const report = runDiagnostics(parsedData, config, results)
      setDiagnosticReport(report)
    }
  }, [parsedData, config, results])

  return null // Logic-only component
}
