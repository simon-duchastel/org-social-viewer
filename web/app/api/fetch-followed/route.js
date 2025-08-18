import { fetchFollowedUsers } from '../../../lib/orgSocialParser.js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { mainUser } = await request.json()

    if (!mainUser) {
      return NextResponse.json({ error: 'Main user is required' }, { status: 400 })
    }

    const result = await fetchFollowedUsers(mainUser)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fetch followed users error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch followed users' },
      { status: 500 }
    )
  }
}