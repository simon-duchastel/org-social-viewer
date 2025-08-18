import { parseOrgSocial } from '../../../lib/orgSocialParser.js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { content, sourceUrl } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const result = parseOrgSocial(content, sourceUrl || '')
    return NextResponse.json(result)
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to parse org-social content' },
      { status: 500 }
    )
  }
}