import { unified } from 'unified'
import uniorgParse from 'uniorg-parse'
import type { 
  OrgSocialUser, 
  OrgSocialPost, 
  ParseOptions, 
  ParseResult,
  Mention,
  Link,
  CheckboxItem 
} from './types.js'

/**
 * Parse RFC 3339 timestamp strings as used in org-social ID fields
 */
export function parseOrgSocialTimestamp(timestamp: string): Date | null {
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
 * Extract global metadata from org AST
 */
function extractGlobalMetadata(ast: any): Omit<OrgSocialUser, 'posts' | 'polls' | 'sourceUrl'> {
  const metadata = {
    title: '',
    nick: '',
    description: '',
    avatar: '',
    links: [] as string[],
    follows: [] as Array<{ nick: string; url: string }>,
    contacts: [] as string[]
  }

  const walkNodes = (node: any) => {
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
 * Extract posts from Posts and Polls sections
 */
function extractPosts(ast: any): OrgSocialPost[] {
  const posts: OrgSocialPost[] = []
  
  const walkSections = (node: any) => {
    if (node.type === 'section' && node.children) {
      const firstChild = node.children[0]
      if (firstChild && firstChild.type === 'headline') {
        const headlineText = getPlainText(firstChild)
        if (headlineText === 'Posts' || headlineText === 'Polls') {
          const isPoll = headlineText === 'Polls'
          
          for (let i = 1; i < node.children.length; i++) {
            const child = node.children[i]
            if (child.type === 'section') {
              const post = extractPostFromSection(child, isPoll)
              if (post) posts.push(post)
            }
          }
        }
      }
    }
    
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
function extractPostFromSection(sectionNode: any, isPoll = false): OrgSocialPost | null {
  if (!sectionNode.children || sectionNode.children.length === 0) {
    return null
  }

  const headline = sectionNode.children.find((child: any) => 
    child.type === 'headline' && child.level === 2
  )
  if (!headline) {
    return null
  }

  const post: OrgSocialPost = {
    content: '',
    rawContent: '',
    timestamp: '',
    properties: {},
    mentions: [],
    links: [],
    isReply: false,
    checkboxes: [],
    isPoll,
    displayContent: ''
  }

  // Extract properties and content from the section
  sectionNode.children.forEach((child: any) => {
    if (child.type === 'property-drawer') {
      extractProperties(child, post.properties)
    } else if (child.type === 'paragraph') {
      const paragraphText = getPlainText(child)
      post.content += paragraphText + '\n'
      post.rawContent += paragraphText + '\n'
    } else if (child.type === 'plain-list') {
      if (child.children) {
        child.children.forEach((listItem: any) => {
          if (listItem.type === 'list-item') {
            const itemText = getPlainText(listItem)
            
            if (listItem.checkbox !== null) {
              const checked = listItem.checkbox === 'on'
              post.checkboxes.push({ checked, text: itemText.trim() })
            } else {
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
    } else {
      post.timestamp = post.properties.ID
      post.parsedDate = null
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
function extractProperties(drawerNode: any, properties: Record<string, string>) {
  if (drawerNode.children) {
    drawerNode.children.forEach((child: any) => {
      if (child.type === 'node-property') {
        properties[child.key] = child.value || ''
      }
    })
  }
}

/**
 * Get plain text from node, preserving org-mode link syntax
 */
function getPlainText(node: any): string {
  if (node.type === 'text') {
    return node.value || ''
  }

  if (node.type === 'link') {
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
function extractMentions(content: string): Mention[] {
  const mentions: Mention[] = []
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
function extractLinks(content: string): Link[] {
  const links: Link[] = []

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
function processOrgContent(content: string): string {
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
export function parseOrgSocial(
  text: string, 
  options: ParseOptions = {}
): ParseResult {
  const startTime = Date.now()
  const warnings: string[] = []
  
  try {
    // Parse org-mode text into AST
    const processor = unified().use(uniorgParse)
    const ast = processor.parse(text)

    // Extract metadata and posts
    const metadata = extractGlobalMetadata(ast)
    const posts = extractPosts(ast)

    // Build user object
    const user: OrgSocialUser = {
      ...metadata,
      posts,
      polls: posts.filter(p => p.isPoll),
      sourceUrl: options.sourceUrl || ''
    }

    // Sort posts by timestamp (newest first)
    user.posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const parseTime = Date.now() - startTime

    return {
      user,
      parseTime,
      warnings
    }
  } catch (error) {
    console.error('Error parsing org-social content:', error)
    throw new Error(`Failed to parse org-social content: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Fetch and parse org-social from URL
 */
export async function fetchOrgSocial(url: string, options: ParseOptions = {}): Promise<ParseResult> {
  try {
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const text = await response.text()
    return parseOrgSocial(text, { ...options, sourceUrl: url })
  } catch (error) {
    console.error('Error fetching org-social file:', error)
    throw error
  }
}

/**
 * Fetch followed users
 */
export async function fetchFollowedUsers(
  mainUser: OrgSocialUser, 
  options: ParseOptions = {}
): Promise<OrgSocialUser[]> {
  const followedUsers: OrgSocialUser[] = []
  const promises = mainUser.follows.map(async (follow) => {
    try {
      const result = await fetchOrgSocial(follow.url, options)
      result.user.followInfo = follow
      return result.user
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