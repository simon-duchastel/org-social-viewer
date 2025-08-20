import { fetchFollowedUsers } from '../../../lib/orgSocialParser.js'

export async function POST(request) {
  try {
    const { mainUser } = await request.json()

    if (!mainUser) {
      return new Response(
        JSON.stringify({ error: 'Main user is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the base URL from the request
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    const result = await fetchFollowedUsers(mainUser, baseUrl)
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Fetch followed users error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch followed users' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}