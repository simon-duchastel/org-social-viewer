import { fetchOrgSocial } from '../../../lib/orgSocialParser.js'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const result = await fetchOrgSocial(url)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Fetch and parse error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch and parse org-social file' },
      { status: 500 }
    )
  }
}