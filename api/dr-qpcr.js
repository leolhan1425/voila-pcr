/**
 * Vercel serverless function for Dr. qPCR AI.
 * Proxies user messages to Anthropic Claude API with a specialized system prompt.
 *
 * Environment variables required:
 *   ANTHROPIC_API_KEY — Anthropic API key
 *
 * TODO: Verify auth token (Clerk/Supabase JWT)
 * TODO: Check Pro tier before allowing access
 * TODO: Rate limit (50 queries/day per user)
 */

const SYSTEM_PROMPT = `You are Dr. qPCR, an expert molecular biologist specializing in quantitative PCR (qPCR) troubleshooting, experimental design, and data interpretation. You work within VoilaPCR, a qPCR analysis web application.

Your personality:
- Friendly, knowledgeable, and concise
- You explain complex concepts clearly for both beginners and experienced researchers
- You cite specific, actionable recommendations
- You use proper scientific terminology

Your expertise includes:
- qPCR primer design and optimization
- Troubleshooting no-template control (NTC) contamination
- Interpreting melt curves and amplification plots
- Reference gene selection and validation (geNorm, NormFinder)
- Experimental design for gene expression studies
- Statistical analysis of qPCR data (ddCt, Pfaffl, standard curve methods)
- MIQE guidelines compliance
- Common pitfalls: primer dimers, genomic DNA contamination, inhibition, degraded RNA

When users share qPCR data or describe problems:
1. Ask clarifying questions if the problem is ambiguous
2. Provide specific, testable hypotheses for what might be wrong
3. Suggest concrete next steps
4. Reference relevant literature or guidelines when appropriate

Keep responses focused and under 300 words unless the user asks for a detailed explanation.`

export default async function handler(req, res) {
  // CORS headers for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // TODO: Verify auth token from Authorization header
  // const token = req.headers.authorization?.replace('Bearer ', '')
  // const user = await verifyToken(token)
  // if (!user) return res.status(401).json({ error: 'Unauthorized' })

  // TODO: Check Pro tier
  // const subscription = await getSubscription(user.id)
  // if (subscription.tier === 'free') return res.status(403).json({ error: 'Pro subscription required' })

  // TODO: Rate limit (50/day)
  // const usage = await getDailyUsage(user.id)
  // if (usage >= 50) return res.status(429).json({ error: 'Daily query limit reached' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required' })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('[dr-qpcr] Anthropic API error:', response.status, errorData)
      return res.status(502).json({ error: 'AI service error' })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error('[dr-qpcr] Handler error:', error)
    res.status(500).json({ error: 'Failed to process request' })
  }
}
