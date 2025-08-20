import { unified } from 'unified'
import uniorgParse from 'uniorg-parse'

/**
 * Parse RFC 3339 timestamp strings as used in org-social ID fields
 */
function parseOrgSocialTimestamp(timestamp) {
  if (!timestamp) return null
  
  try {
    const normalizedTimestamp = timestamp.trim()
    const date = new Date(normalizedTimestamp)
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp format:', timestamp)
      return null
    }
    
    return date
  } catch (error) {
    console.warn('Error parsing timestamp:', timestamp, error)
    return null
  }
}

/**
 * Format a date for display in posts (relative time)
 */
function formatTimestampForDisplay(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'invalid date'
  }
  
  const now = new Date()
  const diffMs = now - date
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) return 'now'
  if (diffMinutes < 60) return `${diffMinutes}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

/**
 * Format a date for join date display (month + year)
 */
function formatJoinDate(date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Recently'
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
}

/**
 * Extract global metadata from org AST
 */
function extractGlobalMetadata(ast) {
  const metadata = {
    title: '',
    nick: '',
    description: '',
    avatar: '',
    links: [],
    follows: [],
    contacts: []
  }

  // Find keyword nodes at the top level
  const walkNodes = (node) => {
    if (node.type === 'keyword') {
      const key = node.key.toUpperCase()
      const value = node.value || ''

      switch (key) {
        case 'TITLE':
          metadata.title = value
          break
        case 'NICK':
          metadata.nick = value
          break
        case 'DESCRIPTION':
          metadata.description = value
          break
        case 'AVATAR':
          metadata.avatar = value
          break
        case 'LINK':
          if (value) metadata.links.push(value)
          break
        case 'FOLLOW':
          // FOLLOW format: "nick url"
          const parts = value.split(/\s+/)
          if (parts.length >= 2) {
            metadata.follows.push({ nick: parts[0], url: parts[1] })
          }
          break
        case 'CONTACT':
          if (value) metadata.contacts.push(value)
          break
      }
    }

    if (node.children) {
      node.children.forEach(walkNodes)
    }
  }

  if (ast.children) {
    ast.children.forEach(walkNodes)
  }

  return metadata
}

/**
 * Extract posts from Posts section
 */
function extractPosts(ast) {
  const posts = []
  
  // Find the section that contains the "Posts" or "Polls" headline
  const walkSections = (node) => {
    if (node.type === 'section' && node.children) {
      // Check if this section starts with a "Posts" or "Polls" headline
      const firstChild = node.children[0]
      if (firstChild && firstChild.type === 'headline') {
        const headlineText = getPlainText(firstChild)
        if (headlineText === 'Posts' || headlineText === 'Polls') {
          const isPoll = headlineText === 'Polls'
          // Found the Posts/Polls section, now look for subsequent sections with level 2 headlines
          for (let i = 1; i < node.children.length; i++) {
            const child = node.children[i]
            if (child.type === 'section') {
              // Look for level 2 headlines in this section
              const post = extractPostFromSection(child, isPoll)
              if (post) posts.push(post)
            }
          }
        }
      }
    }
    
    // Continue walking the tree
    if (node.children) {
      node.children.forEach(walkSections)
    }
  }

  if (ast.children) {
    ast.children.forEach(walkSections)
  }

  return posts
}

/**
 * Extract a post from a section containing a level 2 headline
 */
function extractPostFromSection(sectionNode, isPoll = false) {
  if (!sectionNode.children || sectionNode.children.length === 0) {
    return null
  }

  // Look for the headline (should be first child)
  const headline = sectionNode.children.find(child => child.type === 'headline' && child.level === 2)
  if (!headline) {
    return null
  }

  const post = {
    content: '',
    rawContent: '',
    timestamp: '',
    properties: {},
    mentions: [],
    links: [],
    isReply: false,
    checkboxes: [],
    isPoll
  }

  // Extract properties and content from the section
  sectionNode.children.forEach(child => {
    if (child.type === 'property-drawer') {
      extractProperties(child, post.properties)
    } else if (child.type === 'paragraph') {
      const paragraphText = getPlainText(child)
      
      // Check if this paragraph contains inline properties (org-social format)
      const inlineProps = extractInlineProperties(paragraphText)
      if (inlineProps.hasProperties) {
        // Merge inline properties
        Object.assign(post.properties, inlineProps.properties)
        // Only add remaining content (after properties) to post content
        if (inlineProps.content.trim()) {
          post.content += inlineProps.content + '\n'
          post.rawContent += inlineProps.content + '\n'
        }
      } else {
        // Regular paragraph content
        post.content += paragraphText + '\n'
        post.rawContent += paragraphText + '\n'
      }
    } else if (child.type === 'plain-list') {
      // Handle checkbox lists
      if (child.children) {
        child.children.forEach(listItem => {
          if (listItem.type === 'list-item') {
            const itemText = getPlainText(listItem)
            
            // Check if this is a checkbox item using uniorg's checkbox property
            if (listItem.checkbox !== null) {
              const checked = listItem.checkbox === 'on'
              post.checkboxes.push({ checked, text: itemText.trim() })
            } else {
              // Regular list item
              post.content += '- ' + itemText + '\n'
              post.rawContent += '- ' + itemText + '\n'
            }
          }
        })
      }
    }
  })

  // Clean up content
  post.content = post.content.trim()
  post.rawContent = post.rawContent.trim()

  // Process properties
  if (post.properties.ID) {
    const parsedDate = parseOrgSocialTimestamp(post.properties.ID)
    if (parsedDate) {
      post.timestamp = parsedDate.toISOString()
      post.parsedDate = parsedDate
      post.formattedTimestamp = formatTimestampForDisplay(parsedDate)
      post.fullTimestamp = parsedDate.toLocaleString()
    } else {
      post.timestamp = post.properties.ID
      post.parsedDate = null
      post.formattedTimestamp = 'invalid date'
      post.fullTimestamp = post.properties.ID
    }
    post.id = post.properties.ID
  }

  // Check if it's a reply
  if (post.properties.REPLY_TO || post.properties.REPLY_URL) {
    post.isReply = true
    post.replyTo = post.properties.REPLY_TO
    post.replyUrl = post.properties.REPLY_URL
  }

  // Extract mentions and links
  post.mentions = extractMentions(post.content)
  post.links = extractLinks(post.content)
  post.displayContent = processOrgContent(post.content)

  return post
}


/**
 * Extract properties from property drawer
 */
function extractProperties(drawerNode, properties) {
  if (drawerNode.children) {
    drawerNode.children.forEach(child => {
      if (child.type === 'node-property') {
        properties[child.key] = child.value || ''
      }
    })
  }
}

/**
 * Extract inline properties from text (org-social format)
 * Format: :ID: value :TITLE: value :LANG: value content...
 */
function extractInlineProperties(text) {
  const result = {
    hasProperties: false,
    properties: {},
    content: text
  }

  // Simple approach: check if text starts with :PROPERTY: pattern
  if (!text.startsWith(':')) {
    return result
  }

  // Split by spaces and look for property patterns
  const parts = text.split(/\s+/)
  const properties = {}
  let propertyEndIndex = 0
  let currentProperty = null
  let currentValue = []
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    
    // Check if this part is a property key (:KEY:)
    const propMatch = part.match(/^:([A-Z_]+):$/)
    if (propMatch) {
      // Save previous property if any
      if (currentProperty) {
        properties[currentProperty] = currentValue.join(' ')
      }
      
      // Start new property
      currentProperty = propMatch[1]
      currentValue = []
      continue
    }
    
    // If we have a current property, this part is part of its value
    if (currentProperty) {
      // Check if this looks like the start of content (not a property value)
      // Property values for timestamps and titles should not contain normal sentences
      if (part.match(/^[A-Z][a-z]/) && currentValue.length > 0 && 
          !part.match(/^\d/) && !part.match(/^[A-Z]+$/)) {
        // This looks like the start of content, stop property parsing
        propertyEndIndex = parts.slice(0, i).join(' ').length
        break
      }
      
      currentValue.push(part)
    } else {
      // No current property, this must be content
      propertyEndIndex = parts.slice(0, i).join(' ').length
      break
    }
  }
  
  // Save the last property
  if (currentProperty) {
    properties[currentProperty] = currentValue.join(' ')
    if (propertyEndIndex === 0) {
      // All parts were properties
      propertyEndIndex = text.length
    }
  }
  
  if (Object.keys(properties).length > 0) {
    result.hasProperties = true
    result.properties = properties
    result.content = text.substring(propertyEndIndex).trim()
  }

  return result
}


/**
 * Get plain text from node, preserving org-mode link syntax
 */
function getPlainText(node) {
  if (node.type === 'text') {
    return node.value || ''
  }

  if (node.type === 'link') {
    // Preserve the org-mode link syntax for proper parsing later
    const description = node.children && node.children.length > 0 
      ? node.children.map(getPlainText).join('')
      : node.path
    return `[[${node.path}][${description}]]`
  }

  if (node.children) {
    return node.children.map(getPlainText).join('')
  }

  return ''
}

/**
 * Extract mentions from content
 */
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

/**
 * Extract links from content
 */
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

/**
 * Process org content for display
 */
function processOrgContent(content) {
  let processed = content

  // Convert org-mode formatting to HTML-like markup for display
  processed = processed.replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
  processed = processed.replace(/\/([^/]+)\//g, '<em>$1</em>')
  processed = processed.replace(/~([^~]+)~/g, '<code>$1</code>')

  // Links
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

/**
 * Main parsing function using uniorg
 */
export function parseOrgSocial(text, sourceUrl = '') {
  try {
    // Parse org-mode text into AST
    const processor = unified().use(uniorgParse)
    const ast = processor.parse(text)

    // Extract metadata and posts
    const metadata = extractGlobalMetadata(ast)
    const posts = extractPosts(ast)

    // Build user object
    const user = {
      ...metadata,
      posts,
      polls: posts.filter(p => p.isPoll),
      sourceUrl
    }

    // Sort posts by timestamp (newest first)
    user.posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Add formatted join date based on earliest post
    if (user.posts.length > 0) {
      const earliestPost = user.posts[user.posts.length - 1]
      if (earliestPost.parsedDate) {
        user.formattedJoinDate = formatJoinDate(earliestPost.parsedDate)
      } else {
        user.formattedJoinDate = 'Recently'
      }
    } else {
      user.formattedJoinDate = 'Recently'
    }

    return user
  } catch (error) {
    console.error('Error parsing org-social content:', error)
    throw new Error(`Failed to parse org-social content: ${error.message}`)
  }
}

/**
 * Fetch and parse org-social from URL
 */
export async function fetchOrgSocial(url) {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    return parseOrgSocial(text, url)
  } catch (error) {
    // Provide more specific error information
    if (error.message.includes('404')) {
      throw new Error(`File not found: ${url}`)
    } else if (error.message.includes('Failed to fetch')) {
      throw new Error(`Network error accessing: ${url}`)
    } else {
      throw new Error(`Error fetching org-social file from ${url}: ${error.message}`)
    }
  }
}

/**
 * Fetch followed users
 */
export async function fetchFollowedUsers(mainUser, baseUrl = '') {
  const followedUsers = []
  const promises = mainUser.follows.map(async (follow) => {
    try {
      // Convert relative URLs to absolute URLs
      let url = follow.url
      if (baseUrl && url.startsWith('/')) {
        url = baseUrl + url
      }
      
      const user = await fetchOrgSocial(url)
      user.followInfo = follow
      return user
    } catch (error) {
      // Silently handle failed fetches for followed users
      // This is expected when follow URLs point to non-existent files
      if (error.message.includes('404')) {
        console.debug(`Follow URL not found (expected for demo): ${follow.url}`)
      } else {
        console.warn(`Failed to fetch followed user ${follow.nick} (${follow.url}):`, error.message)
      }
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

export { parseOrgSocialTimestamp }