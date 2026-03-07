/**
 * Vercel serverless function for instrument format requests.
 * Stores format support requests in Supabase when configured.
 *
 * TODO: Replace stub with Supabase insert when database is configured.
 *
 * Environment variables required:
 *   SUPABASE_URL — Supabase project URL
 *   SUPABASE_SERVICE_KEY — Supabase service role key
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, instrumentName, fileUrl, notes } = req.body

    if (!email || !instrumentName) {
      return res.status(400).json({ error: 'Email and instrument name are required' })
    }

    // TODO: Insert into Supabase format_requests table
    // const { data, error } = await supabase
    //   .from('format_requests')
    //   .insert({
    //     email,
    //     instrument_name: instrumentName,
    //     file_url: fileUrl || null,
    //     notes: notes || null,
    //     status: 'pending',
    //     user_id: user?.id || null,
    //   })

    console.log('[format-request] Received:', { email, instrumentName, notes })

    res.status(200).json({
      success: true,
      message: 'Format request received. We will review it and follow up.',
    })
  } catch (error) {
    console.error('[format-request] Error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
}
