/**
 * Vercel serverless function for referral code generation and validation.
 *
 * GET  /api/referral?code=VOILA-XXXXX  — validate a referral code
 * POST /api/referral                    — generate a referral code for the authenticated user
 *
 * TODO: Replace stubs with Supabase queries when database is configured.
 *
 * Environment variables required:
 *   SUPABASE_URL — Supabase project URL
 *   SUPABASE_SERVICE_KEY — Supabase service role key
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method === 'GET') {
    // Validate a referral code
    const { code } = req.query

    if (!code) {
      return res.status(400).json({ error: 'Referral code is required' })
    }

    // TODO: Query Supabase users table for referral_code match
    // const { data } = await supabase
    //   .from('users')
    //   .select('id, referral_code')
    //   .eq('referral_code', code)
    //   .single()

    // Stub: always return valid for demo
    return res.status(200).json({
      valid: true,
      code,
    })
  }

  if (req.method === 'POST') {
    // Generate or retrieve referral code for authenticated user

    // TODO: Verify auth token
    // const token = req.headers.authorization?.replace('Bearer ', '')
    // const user = await verifyToken(token)
    // if (!user) return res.status(401).json({ error: 'Unauthorized' })

    // TODO: Generate and store referral code in Supabase
    // const code = `VOILA-${nanoid(6).toUpperCase()}`
    // await supabase.from('users').update({ referral_code: code }).eq('id', user.id)

    // Stub response
    return res.status(200).json({
      code: 'VOILA-DEMO01',
      shareUrl: 'https://qpcr.hanlabnw.com?ref=VOILA-DEMO01',
      stats: { sent: 0, conversions: 0 },
    })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
