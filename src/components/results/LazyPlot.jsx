import { lazy, Suspense } from 'react'

const Plot = lazy(() => import('react-plotly.js'))

export default function LazyPlot(props) {
  return (
    <Suspense fallback={
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Plot {...props} />
    </Suspense>
  )
}
