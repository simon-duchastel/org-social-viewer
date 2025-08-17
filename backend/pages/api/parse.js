import { parseOrgSocial } from '../../lib/orgSocialParser.js'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { content, sourceUrl = '' } = req.body

    if (!content) {
      return res.status(400).json({ error: 'Content is required' })
    }

    const result = parseOrgSocial(content, sourceUrl)
    res.status(200).json(result)
  } catch (error) {
    console.error('Parse error:', error)
    res.status(500).json({ error: error.message || 'Failed to parse org-social content' })
  }
}