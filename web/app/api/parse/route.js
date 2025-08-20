import { parseOrgSocial } from '../../../lib/orgSocialParser.js'

export async function POST(request) {
  try {
    const { content, sourceUrl } = await request.json()

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    const result = parseOrgSocial(content, sourceUrl || '')
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Parse error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to parse org-social content' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}