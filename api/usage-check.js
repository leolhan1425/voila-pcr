/**
 * Vercel serverless function for checking usage limits.
 * Returns current month's analysis count and whether the user can analyze.
 *
 * TODO: Replace with Supabase query when database is configured.
 *
 * Environment variables required:
 *   SUPABASE_URL — Supabase project URL
 *   SUPABASE_SERVICE_KEY — Supabase service role key
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // TODO: Verify auth token
  // const token = req.headers.authorization?.replace('Bearer ', '')
  // const user = await verifyToken(token)
  // if (!user) return res.status(401).json({ error: 'Unauthorized' })

  // TODO: Query Supabase usage table
  // const month = new Date().toISOString().slice(0, 7)
  // const { data } = await supabase
  //   .from('usage')
  //   .select('analysis_count')
  //   .eq('user_id', user.id)
  //   .eq('month', month)
  //   .single()

  // Stub response
  res.status(200).json({
    analysisCount: 0,
    limit: 3,
    canAnalyze: true,
    tier: 'free',
  })
}
