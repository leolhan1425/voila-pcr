import { create } from 'zustand'

const useStore = create((set) => ({
  // App step: 'upload' | 'configure' | 'results'
  step: 'upload',
  setStep: (step) => set({ step }),

  // Dark mode
  darkMode: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  // Auth / tier
  user: null,
  setUser: (user) => set({ user }),
  tier: localStorage.getItem('voilapcr_tier') || 'free', // 'free' | 'plus'
  setTier: (tier) => set({ tier }),

  // Parsed data from file upload
  parsedData: null,
  setParsedData: (parsedData) => set({ parsedData }),

  // Sample roles: { sampleName: 'experimental' | 'ntc' | 'standard' }
  sampleRoles: {},
  setSampleRoles: (sampleRoles) => set({ sampleRoles }),
  setSampleRole: (sample, role) => set((s) => ({
    sampleRoles: { ...s.sampleRoles, [sample]: role },
  })),

  // QC report (legacy from analysis/qc.js)
  qcReport: null,
  setQcReport: (qcReport) => set({ qcReport }),

  // New diagnostic report (from qc/runDiagnostics.js)
  diagnosticReport: null,
  setDiagnosticReport: (diagnosticReport) => set({ diagnosticReport }),

  // Analysis config
  config: {
    method: 'ddct',
    referenceGene: null,
    referenceGenes: [], // for geNorm
    controlGroup: null,
    autoAverage: true,
    outlierThreshold: 0.5,
    dilutionFactor: 10,
    efficiencies: {}, // for Pfaffl: { targetName: efficiency }
  },
  setConfig: (updates) => set((s) => ({
    config: { ...s.config, ...updates },
  })),

  // Analysis results
  results: null,
  setResults: (results) => set({ results }),

  // Graph customization per target
  graphSettings: {},
  setGraphSettings: (target, settings) => set((s) => ({
    graphSettings: { ...s.graphSettings, [target]: { ...(s.graphSettings[target] || {}), ...settings } },
  })),

  // Dr. qPCR chat
  drqpcrMessages: [],
  addDrqpcrMessage: (msg) => set((s) => ({
    drqpcrMessages: [...s.drqpcrMessages, msg],
  })),
  clearDrqpcrMessages: () => set({ drqpcrMessages: [] }),

  // Modals
  showLogin: false,
  setShowLogin: (show) => set({ showLogin: show }),
  showPricing: false,
  setShowPricing: (show) => set({ showPricing: show }),
  showUpgradePrompt: null, // null or feature name string
  setShowUpgradePrompt: (feature) => set({ showUpgradePrompt: feature }),

  // Reset to start over
  reset: () => set({
    step: 'upload',
    parsedData: null,
    sampleRoles: {},
    qcReport: null,
    diagnosticReport: null,
    config: {
      method: 'ddct',
      referenceGene: null,
      referenceGenes: [],
      controlGroup: null,
      autoAverage: true,
      outlierThreshold: 0.5,
      dilutionFactor: 10,
      efficiencies: {},
    },
    results: null,
    graphSettings: {},
    drqpcrMessages: [],
  }),
}))

export default useStore
