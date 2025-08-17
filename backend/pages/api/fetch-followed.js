import { fetchFollowedUsers } from '../../lib/orgSocialParser.js'

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
    const { mainUser } = req.body

    if (!mainUser || !mainUser.follows) {
      return res.status(400).json({ error: 'Main user with follows array is required' })
    }

    const followedUsers = await fetchFollowedUsers(mainUser)
    res.status(200).json(followedUsers)
  } catch (error) {
    console.error('Fetch followed users error:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch followed users' })
  }
}