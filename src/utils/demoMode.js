/**
 * Demo mode detection.
 * When DEMO_MODE=true, all features are unlocked, no auth required.
 */
export function isDemoMode() {
  return import.meta.env.VITE_DEMO_MODE === 'true'
}
