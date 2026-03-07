import Stripe from 'stripe'
import express from 'express'
import cors from 'cors'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PLUS_PRICE_ID = process.env.STRIPE_PRICE_ANNUAL // $99/year — only plan
const BASE_URL = process.env.BASE_URL || 'https://qpcr.hanlabnw.com'
const PORT = process.env.PORT || 8055

const app = express()

// Webhook endpoint needs raw body — must be before express.json()
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let event
  try {
    event = endpointSecret
      ? stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
      : JSON.parse(req.body)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      console.log('Checkout completed:', session.customer_email, session.subscription)
      // TODO: Mark user as Plus in database
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      console.log('Subscription deleted:', sub.id)
      // TODO: Mark user as Free in database
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object
      console.log('Payment failed:', invoice.customer_email)
      // TODO: Send email, grace period
      break
    }
  }

  res.json({ received: true })
})

// JSON body for all other routes
app.use(express.json())
app.use(cors({ origin: [BASE_URL, 'http://localhost:5173', 'https://voilapcr.com', 'https://www.voilapcr.com'] }))

// Create Checkout Session — annual Plus only
app.post('/api/create-checkout-session', async (req, res) => {
  const { email } = req.body

  if (!PLUS_PRICE_ID) {
    return res.status(500).json({ error: 'Stripe price not configured' })
  }

  try {
    const sessionParams = {
      mode: 'subscription',
      line_items: [{ price: PLUS_PRICE_ID, quantity: 1 }],
      success_url: `${BASE_URL}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/?checkout=cancel`,
    }

    if (email) {
      sessionParams.customer_email = email
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    res.json({ url: session.url })
  } catch (err) {
    console.error('Checkout session error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Verify a checkout session (called after redirect back)
app.get('/api/checkout-status', async (req, res) => {
  const { session_id } = req.query
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    res.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email || session.customer_details?.email,
      subscriptionId: session.subscription,
    })
  } catch (err) {
    console.error('Checkout status error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Customer Portal — manage subscription
app.post('/api/customer-portal', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ error: 'Missing email' })
  }

  try {
    const customers = await stripe.customers.list({ email, limit: 1 })
    if (customers.data.length === 0) {
      return res.status(404).json({ error: 'No subscription found' })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: BASE_URL,
    })

    res.json({ url: portalSession.url })
  } catch (err) {
    console.error('Portal error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`VoilaPCR API listening on port ${PORT}`)
})
