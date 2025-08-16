/**
 * Comprehensive Org-Social file parser
 * Supports the full org-social specification including:
 * - Global metadata (TITLE, NICK, DESCRIPTION, AVATAR, LINK, FOLLOW, CONTACT)
 * - Post metadata (ID, LANG, TAGS, CONTENT_WARNING, CLIENT, REPLY_TO, REPLY_URL, MOOD)
 * - Mentions using org-social links
 * - Polls with checkboxes
 * - Rich content with org-mode formatting
 */

export function parseOrgSocial(text, sourceUrl = '') {
  const lines = text.split('\n')
  const user = {
    title: '',
    nick: '',
    description: '',
    avatar: '',
    links: [],
    follows: [],
    contacts: [],
    posts: [],
    polls: [],
    sourceUrl
  }

  let inPostsSection = false
  let inPollsSection = false
  let currentPost = null
  let currentProperties = {}
  let inPropertiesDrawer = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()

    // Skip comments (lines starting with # outside of org syntax)
    if (trimmedLine.startsWith('#') && !trimmedLine.startsWith('#+')) {
      continue
    }

    // Parse global metadata
    if (trimmedLine.startsWith('#+TITLE:')) {
      user.title = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim()
    } else if (trimmedLine.startsWith('#+NICK:')) {
      user.nick = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim()
    } else if (trimmedLine.startsWith('#+DESCRIPTION:')) {
      user.description = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim()
    } else if (trimmedLine.startsWith('#+AVATAR:')) {
      user.avatar = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim()
    } else if (trimmedLine.startsWith('#+LINK:')) {
      const link = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim()
      if (link) user.links.push(link)
    } else if (trimmedLine.startsWith('#+FOLLOW:')) {
      const parts = trimmedLine.split(/\s+/).slice(1) // Remove #+FOLLOW:
      if (parts.length >= 2) {
        const nick = parts[0]
        const url = parts[1]
        user.follows.push({ nick, url })
      }
    } else if (trimmedLine.startsWith('#+CONTACT:')) {
      const contact = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim()
      if (contact) user.contacts.push(contact)
    }

    // Check for section headers
    else if (trimmedLine === '* Posts') {
      inPostsSection = true
      inPollsSection = false
    } else if (trimmedLine === '* Polls') {
      inPollsSection = true
      inPostsSection = false
    }

    // Parse posts
    else if (inPostsSection && trimmedLine.startsWith('**')) {
      // Save previous post
      if (currentPost) {
        finalizeParsedPost(currentPost, currentProperties, user)
      }
      
      // Start new post
      currentPost = {
        content: '',
        rawContent: '',
        timestamp: '',
        properties: {},
        mentions: [],
        links: [],
        isReply: false,
        checkboxes: []
      }
      currentProperties = {}
    }

    // Parse polls
    else if (inPollsSection && trimmedLine.startsWith('**')) {
      // Handle poll posts similar to regular posts
      if (currentPost) {
        finalizeParsedPost(currentPost, currentProperties, user)
      }
      
      currentPost = {
        content: '',
        rawContent: '',
        timestamp: '',
        properties: {},
        mentions: [],
        links: [],
        isReply: false,
        checkboxes: [],
        isPoll: true
      }
      currentProperties = {}
    }

    // Parse properties drawer
    else if (currentPost && trimmedLine === ':PROPERTIES:') {
      inPropertiesDrawer = true
    } else if (currentPost && trimmedLine === ':END:') {
      inPropertiesDrawer = false
    } else if (currentPost && inPropertiesDrawer) {
      const colonIndex = trimmedLine.indexOf(':')
      const secondColonIndex = trimmedLine.indexOf(':', colonIndex + 1)
      
      if (colonIndex > 0 && secondColonIndex > colonIndex) {
        const key = trimmedLine.substring(colonIndex + 1, secondColonIndex).trim()
        const value = trimmedLine.substring(secondColonIndex + 1).trim()
        currentProperties[key] = value
      }
    }

    // Parse post content
    else if (currentPost && !inPropertiesDrawer && (inPostsSection || inPollsSection)) {
      if (trimmedLine || currentPost.content) { // Only add non-empty lines or if we already have content
        currentPost.rawContent += line + '\n'
        
        // Parse checkboxes for polls
        if (trimmedLine.match(/^-\s*\[[x\s]\]/)) {
          const checked = trimmedLine.includes('[x]')
          const text = trimmedLine.replace(/^-\s*\[[x\s]\]\s*/, '')
          currentPost.checkboxes.push({ checked, text })
        } else {
          currentPost.content += line + '\n'
        }
      }
    }
  }

  // Finalize last post
  if (currentPost) {
    finalizeParsedPost(currentPost, currentProperties, user)
  }

  // Sort posts by timestamp (newest first)
  user.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  return user
}

function finalizeParsedPost(post, properties, user) {
  // Set properties
  post.properties = { ...properties }
  
  // Set timestamp from ID
  if (properties.ID) {
    post.timestamp = properties.ID
    post.id = properties.ID
  }
  
  // Check if it's a reply
  if (properties.REPLY_TO || properties.REPLY_URL) {
    post.isReply = true
    post.replyTo = properties.REPLY_TO
    post.replyUrl = properties.REPLY_URL
  }
  
  // Parse content for mentions and links
  post.content = post.content.trim()
  post.mentions = extractMentions(post.content)
  post.links = extractLinks(post.content)
  
  // Process content for display (convert org-mode formatting)
  post.displayContent = processOrgContent(post.content)
  
  // Add to appropriate collection
  if (post.isPoll) {
    user.polls.push(post)
  } else {
    user.posts.push(post)
  }
}

function extractMentions(content) {
  const mentions = []
  const mentionRegex = /\[\[org-social:([^\]]+)\]\[([^\]]+)\]\]/g
  let match
  
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      url: match[1],
      name: match[2]
    })
  }
  
  return mentions
}

function extractLinks(content) {
  const links = []
  
  // Extract org-mode links [[url][text]]
  const linkRegex = /\[\[([^\]]+)\]\[([^\]]+)\]\]/g
  let match
  
  while ((match = linkRegex.exec(content)) !== null) {
    if (!match[1].startsWith('org-social:')) {
      links.push({
        url: match[1],
        text: match[2]
      })
    }
  }
  
  // Extract plain URLs
  const urlRegex = /(https?:\/\/[^\s\]]+)/g
  while ((match = urlRegex.exec(content)) !== null) {
    links.push({
      url: match[1],
      text: match[1]
    })
  }
  
  return links
}

function processOrgContent(content) {
  let processed = content
  
  // Convert org-mode formatting to HTML-like markup for display
  // Bold: *text* -> <strong>text</strong>
  processed = processed.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
  
  // Italic: /text/ -> <em>text</em>
  processed = processed.replace(/\/([^/]+)\//g, '<em>$1</em>')
  
  // Code: ~text~ -> <code>text</code>
  processed = processed.replace(/~([^~]+)~/g, '<code>$1</code>')
  
  // Links: [[url][text]] -> <a href="url">text</a>
  processed = processed.replace(/\[\[([^\]]+)\]\[([^\]]+)\]\]/g, (match, url, text) => {
    if (url.startsWith('org-social:')) {
      return `<span class="mention" data-url="${url.substring(11)}">@${text}</span>`
    }
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
  })
  
  // Simple URLs
  processed = processed.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
  
  return processed
}

export async function fetchOrgSocial(url) {
  try {
    let fetchUrl = url
    let corsProxy = false
    
    // Check if it's an external URL that might need CORS proxy
    if (url.startsWith('http') && !url.startsWith(window.location.origin)) {
      corsProxy = true
      fetchUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    }
    
    const response = await fetch(fetchUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    let text
    if (corsProxy) {
      const data = await response.json()
      if (data.status.http_code !== 200) {
        throw new Error(`HTTP ${data.status.http_code}: Failed to fetch org-social file`)
      }
      text = data.contents
    } else {
      text = await response.text()
    }
    
    return parseOrgSocial(text, url)
  } catch (error) {
    console.error('Error fetching org-social file:', error)
    throw error
  }
}

export async function fetchFollowedUsers(mainUser) {
  const followedUsers = []
  const promises = mainUser.follows.map(async (follow) => {
    try {
      const user = await fetchOrgSocial(follow.url)
      user.followInfo = follow
      return user
    } catch (error) {
      console.error(`Failed to fetch ${follow.url}:`, error)
      return null
    }
  })
  
  const results = await Promise.allSettled(promises)
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      followedUsers.push(result.value)
    }
  })
  
  return followedUsers
}