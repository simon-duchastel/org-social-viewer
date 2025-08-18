const API_BASE_URL = typeof window !== 'undefined' ? '' : 'http://localhost:3001'

export async function fetchOrgSocial(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fetch-and-parse?url=${encodeURIComponent(url)}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching org-social file via API:', error)
    throw error
  }
}

export async function parseOrgSocialContent(content, sourceUrl = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, sourceUrl })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error parsing org-social content via API:', error)
    throw error
  }
}

export async function fetchFollowedUsers(mainUser) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fetch-followed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mainUser })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching followed users via API:', error)
    throw error
  }
}