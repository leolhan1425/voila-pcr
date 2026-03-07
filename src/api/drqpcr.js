/**
 * Dr. qPCR client — sends messages to the AI troubleshooting endpoint.
 *
 * TODO: Replace mock response with actual API call to /api/dr-qpcr
 * when the Vercel serverless function and Anthropic API key are configured.
 */

/**
 * Send a message to Dr. qPCR and get a response.
 * @param {Array<{role: string, content: string}>} messages - Chat history
 * @param {File|null} image - Optional image attachment (gel photo, melt curve, etc.)
 * @returns {Promise<{role: string, content: string}>} Assistant response
 */
export async function sendDrQPCRMessage(messages, image = null) {
  // TODO: Replace with actual API call when backend is set up
  // const formData = new FormData()
  // formData.append('messages', JSON.stringify(messages))
  // if (image) formData.append('image', image)
  // const res = await fetch('/api/dr-qpcr', { method: 'POST', body: formData })
  // const data = await res.json()
  // return { role: 'assistant', content: data.content[0].text }

  const lastMessage = messages[messages.length - 1]

  // Simulate a brief network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return {
    role: 'assistant',
    content: `I'm Dr. qPCR, and I'll be able to help you once the API is connected. You asked: "${lastMessage.content.substring(0, 100)}..."

In the meantime, here are some general qPCR troubleshooting tips:
- Check that your NTC wells show no amplification (Ct > 35 or undetermined)
- Ensure replicate Ct values are within 0.5 of each other
- Verify your reference gene is stable across all conditions
- Look at melt curves for primer dimer or non-specific amplification`,
  }
}
