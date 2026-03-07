/**
 * Billing API helpers — stubs for Stripe integration.
 *
 * TODO: Replace with real Stripe calls once configured.
 */

/**
 * Create a Stripe Checkout session for upgrading.
 * @param {string} priceId - Stripe Price ID
 * @returns {Promise<object>} Checkout session with URL
 */
export async function createCheckoutSession(priceId) {
  // TODO: Stripe — POST to /api/create-checkout-session
  console.warn('[billing] createCheckoutSession stub called with priceId:', priceId)
  return { url: null }
}

/**
 * Get the current subscription for a user.
 * @param {string} userId
 * @returns {Promise<object>} Subscription info
 */
export async function getSubscription(userId) {
  // TODO: Stripe — fetch subscription status from backend
  console.warn('[billing] getSubscription stub called for userId:', userId)
  return { tier: 'free', status: 'active' }
}

/**
 * Open the Stripe Customer Portal for managing subscription.
 * @returns {Promise<void>}
 */
export async function openCustomerPortal() {
  // TODO: Stripe — POST to /api/customer-portal, redirect to portal URL
  console.warn('[billing] openCustomerPortal stub called')
  alert('Stripe Customer Portal integration coming soon.')
}
