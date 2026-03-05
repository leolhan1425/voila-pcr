import { create } from 'zustand'

const useStore = create((set) => ({
  // App step: 'upload' | 'configure' | 'results'
  step: 'upload',
  setStep: (step) => set({ step }),

  // Dark mode
  darkMode: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  // Parsed data from file upload
  parsedData: null,
  setParsedData: (parsedData) => set({ parsedData }),

  // Analysis config
  config: {
    method: 'ddct',
    referenceGene: null,
    controlGroup: null,
    autoAverage: true,
    outlierThreshold: 0.5,
  },
  setConfig: (updates) => set((s) => ({
    config: { ...s.config, ...updates },
  })),

  // Analysis results
  results: null,
  setResults: (results) => set({ results }),

  // Reset to start over
  reset: () => set({
    step: 'upload',
    parsedData: null,
    config: {
      method: 'ddct',
      referenceGene: null,
      controlGroup: null,
      autoAverage: true,
      outlierThreshold: 0.5,
    },
    results: null,
  }),
}))

export default useStore
