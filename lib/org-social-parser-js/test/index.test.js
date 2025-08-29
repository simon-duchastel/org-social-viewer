import { describe, test, expect } from 'vitest'
import { parseOrgSocial, parseOrgSocialTimestamp, processOrgContent, fetchOrgSocial, fetchFollowedUsers, extractMentions, extractLinks, normalizeUrl, formatTimestampForDisplay, formatJoinDate } from '../src/index.js'

describe('parseOrgSocialTimestamp', () => {
  test('valid RFC 3339 timestamp', () => {
    const timestamp = '2025-12-30T20:30:15+00:00'
    const result = parseOrgSocialTimestamp(timestamp)
    expect(result).toBeInstanceOf(Date)
    expect(isNaN(result.getTime())).toBe(false)
  })

  test('invalid timestamp', () => {
    const timestamp = 'not-a-date'
    const result = parseOrgSocialTimestamp(timestamp)
    expect(result).toBe(null)
  })

  test('empty timestamp', () => {
    const result = parseOrgSocialTimestamp('')
    expect(result).toBe(null)
  })

  test('null timestamp', () => {
    const result = parseOrgSocialTimestamp(null)
    expect(result).toBe(null)
  })

  test('malformed hour format', () => {
    const timestamp = '2025-01-01T014:29:00+00:00'
    const result = parseOrgSocialTimestamp(timestamp)
    expect(result).toBe(null)
  })

  test('various invalid formats', () => {
    const invalidTimestamps = [
      '2025-13-01T10:00:00+00:00', // Invalid month
      '2025-01-32T10:00:00+00:00', // Invalid day
      '2025-01-01T25:00:00+00:00', // Invalid hour
      '2025-01-01T10:60:00+00:00', // Invalid minute
      'invalid-format',
      undefined,
      null
    ]
    
    invalidTimestamps.forEach(timestamp => {
      const result = parseOrgSocialTimestamp(timestamp)
      expect(result).toBe(null)
    })
  })

  test('whitespace handling', () => {
    const timestamp = '  2025-01-01T10:00:00+00:00  '
    const result = parseOrgSocialTimestamp(timestamp)
    expect(result).toBeInstanceOf(Date)
  })
})

describe('parseOrgSocial', () => {
  test('basic metadata parsing', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser
#+DESCRIPTION: A test user profile
#+AVATAR: https://example.com/avatar.jpg

* Posts

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:END:

This is a test post.
`
    
    const result = parseOrgSocial(orgContent)
    
    expect(result.title).toBe('Test User')
    expect(result.nick).toBe('testuser')
    expect(result.description).toBe('A test user profile')
    expect(result.avatar).toBe('https://example.com/avatar.jpg')
    expect(result.posts).toHaveLength(1)
    
    const post = result.posts[0]
    expect(post.content.trim()).toBe('This is a test post.')
    expect(post.formattedTimestamp).toBeTruthy()
    expect(post.fullTimestamp).toBeTruthy()
  })

  test('post with formatted dates', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser

* Posts

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:END:

Test post content.
`
    
    const result = parseOrgSocial(orgContent)
    const post = result.posts[0]
    
    expect(post.parsedDate).toBeInstanceOf(Date)
    expect(post.formattedTimestamp).toBeTruthy()
    expect(post.fullTimestamp).toBeTruthy()
    expect(post.id).toBe('2025-01-01T10:00:00+00:00')
  })

  test('user with formatted join date', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser

* Posts

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:END:

Test post content.
`
    
    const result = parseOrgSocial(orgContent)
    
    expect(result.formattedJoinDate).toBeTruthy()
    expect(result.formattedJoinDate).not.toBe('Recently')
  })

  test('empty content', () => {
    const result = parseOrgSocial('')
    
    expect(result.posts).toHaveLength(0)
    expect(result.title).toBe('')
    expect(result.nick).toBe('')
    expect(result.formattedJoinDate).toBe('Recently')
  })

  test('posts sorted by timestamp', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser

* Posts

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:END:

First post.

**
:PROPERTIES:
:ID: 2025-01-02T10:00:00+00:00
:END:

Second post.
`
    
    const result = parseOrgSocial(orgContent)
    
    expect(result.posts).toHaveLength(2)
    
    // Posts should be sorted newest first
    const timestamps = result.posts.map(p => p.timestamp)
    expect(new Date(timestamps[0])).toBeInstanceOf(Date)
    expect(new Date(timestamps[1])).toBeInstanceOf(Date)
    expect(new Date(timestamps[0]) > new Date(timestamps[1])).toBe(true)
  })

  test('post with reply properties', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser

* Posts

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:REPLY_TO: https://example.org/social.org#2025-08-27T04:55:02+02:00
:END:

This is a reply post.
`
    
    const result = parseOrgSocial(orgContent)
    const post = result.posts[0]

    expect(post.isReply).toBe(true)
    expect(post.replyTo).toBe('2025-08-27T04:55:02+02:00')
  })

  test('post with REPLY_URL property (spec v1.0 backward compatibility)', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser

* Posts

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:REPLY_TO: 2025-08-27T04:55:02+02:00
:REPLY_URL: https://example.org/social.org
:END:

This is a reply post with REPLY_URL (removed in spec v1.1).
`
    
    const result = parseOrgSocial(orgContent)
    const post = result.posts[0]

    expect(post.isReply).toBe(true)
    expect(post.replyTo).toBe('2025-08-27T04:55:02+02:00')
  })

  test('post with checkboxes (poll)', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser

* Posts

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:END:

What's your favorite language?

- [X] JavaScript
- [ ] Python
- [X] Rust
- [ ] Go
`
    
    const result = parseOrgSocial(orgContent)
    const post = result.posts[0]
    
    expect(post.checkboxes).toHaveLength(4)
    expect(post.checkboxes[0].checked).toBe(true)
    expect(post.checkboxes[1].checked).toBe(false)
    expect(post.checkboxes[2].checked).toBe(true)
    expect(post.checkboxes[0].text).toBe('JavaScript')
  })

  test('multiple metadata fields', () => {
    const orgContent = `#+TITLE: Complex User
#+NICK: complex
#+DESCRIPTION: A complex user profile
#+AVATAR: https://example.com/avatar.jpg
#+LINK: https://github.com/user
#+LINK: https://twitter.com/user
#+FOLLOW: alice /alice.org
#+FOLLOW: bob /bob.org
#+CONTACT: email@example.com
#+CONTACT: @user on Twitter

* Posts
`
    
    const result = parseOrgSocial(orgContent)
    
    expect(result.title).toBe('Complex User')
    expect(result.nick).toBe('complex')
    expect(result.description).toBe('A complex user profile')
    expect(result.avatar).toBe('https://example.com/avatar.jpg')
    expect(result.links).toHaveLength(2)
    expect(result.links).toContain('https://github.com/user')
    expect(result.links).toContain('https://twitter.com/user')
    expect(result.follows).toHaveLength(2)
    expect(result.follows[0].nick).toBe('alice')
    expect(result.follows[0].url).toBe('/alice.org')
    expect(result.contacts).toHaveLength(2)
    expect(result.contacts).toContain('email@example.com')
  })

  test('posts from text pattern format', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser

* Posts

**

:ID: 2025-01-01T10:00:00+00:00

First post content.

**

:ID: 2025-01-02T10:00:00+00:00

Second post content.
`
    
    const result = parseOrgSocial(orgContent)
    
    // The text pattern format extracts posts but may not parse IDs from inline format
    expect(result.posts).toHaveLength(2)
    expect(result.posts.some(p => p.content.includes('First post'))).toBe(true)
    expect(result.posts.some(p => p.content.includes('Second post'))).toBe(true)
  })

  test('polls section', () => {
    const orgContent = `#+TITLE: Test User
#+NICK: testuser

* Polls

**
:PROPERTIES:
:ID: 2025-01-01T10:00:00+00:00
:END:

What's better?

- [ ] Option A
- [X] Option B
`
    
    const result = parseOrgSocial(orgContent)
    
    expect(result.posts).toHaveLength(1)
    const poll = result.posts[0]
    expect(poll.isPoll).toBe(true)
    expect(poll.checkboxes).toHaveLength(2)
    expect(result.polls).toHaveLength(1)
  })

  test('invalid org content handling', () => {
    const invalidContent = 'This is not valid org-mode content at all.'
    
    const result = parseOrgSocial(invalidContent)
    
    // Should not throw and should return reasonable defaults
    expect(result).toBeTruthy()
    expect(result.posts).toHaveLength(0)
    expect(result.title).toBe('')
  })

  test('error handling', () => {
    // Test with null input - should handle gracefully
    const result = parseOrgSocial(null)
    expect(result).toBeTruthy()
    expect(result.posts).toHaveLength(0)
    expect(result.title).toBe('')
  })
})

describe('processOrgContent', () => {
  test('org link without protocol gets https prefix', () => {
    const content = '[[github.com/tanrax/awesome-org-social][awesome project]]'
    const result = processOrgContent(content)
    expect(result).toContain('href="https://github.com/tanrax/awesome-org-social"')
    expect(result).toContain('target="_blank"')
    expect(result).toContain('rel="noopener noreferrer"')
  })

  test('org link with protocol remains unchanged', () => {
    const content = '[[https://github.com/existing-project][project]]'
    const result = processOrgContent(content)
    expect(result).toContain('href="https://github.com/existing-project"')
  })

  test('standalone domain gets linked', () => {
    const content = 'Check out github.com/simon-duchastel for more info'
    const result = processOrgContent(content)
    expect(result).toContain('<a href="https://github.com/simon-duchastel"')
    expect(result).toContain('target="_blank"')
  })

  test('www domains get https prefix', () => {
    const content = '[[www.example.com][example site]]'
    const result = processOrgContent(content)
    expect(result).toContain('href="https://www.example.com"')
  })

  test('relative URLs remain unchanged', () => {
    const content = '[[/local-page][local link]]'
    const result = processOrgContent(content)
    expect(result).toContain('href="/local-page"')
  })

  test('org-social mentions not converted to regular links', () => {
    const content = '[[org-social:/alice-social.org][Alice]]'
    const result = processOrgContent(content)
    expect(result).toContain('<span class="mention"')
    expect(result).not.toContain('<a href=')
  })

  test('mixed content with different link types', () => {
    const content = 'Visit [[github.com/project][my project]] or [[https://example.com][example]] or plain github.com/other'
    const result = processOrgContent(content)
    
    // Should handle all three types correctly
    expect(result).toContain('href="https://github.com/project"')
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('href="https://github.com/other"')
  })
})

describe('extractMentions', () => {
  test('single mention', () => {
    const content = 'Hello [[org-social:/alice-social.org][Alice]]!'
    const mentions = extractMentions(content)
    expect(mentions).toHaveLength(1)
    expect(mentions[0].url).toBe('/alice-social.org')
    expect(mentions[0].name).toBe('Alice')
  })

  test('multiple mentions', () => {
    const content = 'Thanks [[org-social:/alice.org][Alice]] and [[org-social:/bob.org][Bob]]!'
    const mentions = extractMentions(content)
    expect(mentions).toHaveLength(2)
    expect(mentions[0].name).toBe('Alice')
    expect(mentions[1].name).toBe('Bob')
  })

  test('no mentions', () => {
    const content = 'Just a regular post with no mentions.'
    const mentions = extractMentions(content)
    expect(mentions).toHaveLength(0)
  })
})

describe('extractLinks', () => {
  test('org-mode link format', () => {
    const content = 'Check out [[https://github.com/project][my project]]'
    const links = extractLinks(content)
    // Note: extractLinks extracts both org-mode links and plain URLs
    const orgModeLink = links.find(link => link.text === 'my project')
    expect(orgModeLink).toBeTruthy()
    expect(orgModeLink.url).toBe('https://github.com/project')
    expect(orgModeLink.text).toBe('my project')
  })

  test('plain URL', () => {
    const content = 'Visit https://example.com for more info'
    const links = extractLinks(content)
    expect(links).toHaveLength(1)
    expect(links[0].url).toBe('https://example.com')
    expect(links[0].text).toBe('https://example.com')
  })

  test('mixed links', () => {
    const content = 'Visit [[https://github.com/project][GitHub]] or https://example.com'
    const links = extractLinks(content)
    // The function extracts all links, including duplicates from org-mode format
    expect(links.length).toBeGreaterThanOrEqual(2)
    const githubLink = links.find(link => link.text === 'GitHub')
    const exampleLink = links.find(link => link.url === 'https://example.com')
    expect(githubLink).toBeTruthy()
    expect(exampleLink).toBeTruthy()
  })

  test('excludes org-social mentions', () => {
    const content = 'Thanks [[org-social:/alice.org][Alice]] and visit [[https://example.com][example]]'
    const links = extractLinks(content)
    // Should exclude org-social links but may extract the URL if it appears as plain text too
    const exampleLink = links.find(link => link.url === 'https://example.com')
    expect(exampleLink).toBeTruthy()
    const orgSocialLink = links.find(link => link.url.startsWith('org-social:'))
    expect(orgSocialLink).toBeFalsy()
  })
})

describe('normalizeUrl', () => {
  test('domain without protocol', () => {
    const result = normalizeUrl('github.com/project')
    expect(result).toBe('https://github.com/project')
  })

  test('www domain', () => {
    const result = normalizeUrl('www.example.com')
    expect(result).toBe('https://www.example.com')
  })

  test('existing protocol', () => {
    const result = normalizeUrl('https://example.com')
    expect(result).toBe('https://example.com')
  })

  test('relative URL', () => {
    const result = normalizeUrl('/local-page')
    expect(result).toBe('/local-page')
  })

  test('empty or null', () => {
    expect(normalizeUrl('')).toBe('')
    expect(normalizeUrl(null)).toBe(null)
  })
})

describe('formatTimestampForDisplay', () => {
  test('various time differences', () => {
    const now = new Date()
    
    // Test 'now'
    const justNow = new Date(now.getTime() - 30000) // 30 seconds ago
    expect(formatTimestampForDisplay(justNow)).toBe('now')
    
    // Test minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)
    expect(formatTimestampForDisplay(fiveMinutesAgo)).toBe('5m')
    
    // Test hours
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600000)
    expect(formatTimestampForDisplay(twoHoursAgo)).toBe('2h')
    
    // Test days
    const threeDaysAgo = new Date(now.getTime() - 3 * 86400000)
    expect(formatTimestampForDisplay(threeDaysAgo)).toBe('3d')
    
    // Test invalid date
    expect(formatTimestampForDisplay(new Date('invalid'))).toBe('invalid date')
    expect(formatTimestampForDisplay(null)).toBe('invalid date')
  })
})

describe('formatJoinDate', () => {
  test('various dates', () => {
    const testDate = new Date('2025-01-15T10:00:00Z')
    const result = formatJoinDate(testDate)
    expect(result).toContain('January')
    expect(result).toContain('2025')
    
    expect(formatJoinDate(null)).toBe('Recently')
    expect(formatJoinDate(new Date('invalid'))).toBe('Recently')
  })
})

describe('newline and paragraph handling', () => {
  test('single newlines become line breaks', () => {
    const content = 'First line\nSecond line\nThird line'
    const result = processOrgContent(content)
    expect(result).toContain('First line<br>Second line<br>Third line')
  })

  test('double newlines become paragraph breaks', () => {
    const content = 'First paragraph\n\nSecond paragraph\n\nThird paragraph'
    const result = processOrgContent(content)
    expect(result).toContain('<p>First paragraph</p><p>Second paragraph</p><p>Third paragraph</p>')
  })

  test('mixed newlines and paragraphs', () => {
    const content = 'Line 1\nLine 2\n\nNew paragraph\nAnother line'
    const result = processOrgContent(content)
    expect(result).toContain('<p>Line 1<br>Line 2</p><p>New paragraph<br>Another line</p>')
  })

  test('formatting preserved with newlines', () => {
    const content = '*Bold text*\nWith newline\n\n~code text~\nAnother line'
    const result = processOrgContent(content)
    expect(result).toContain('<strong>Bold text</strong>')
    expect(result).toContain('<code>code text</code>')
    expect(result).toContain('<br>')
    expect(result).toContain('</p><p>')
  })

  test('code blocks preserve structure', () => {
    const content = 'Text before\n\n~code block~\n\nText after'
    const result = processOrgContent(content)
    expect(result).toContain('<code>code block</code>')
    expect(result).toContain('<p>Text before</p><p><code>code block</code></p><p>Text after</p>')
  })

  test('multiple consecutive newlines collapse to single paragraph break', () => {
    const content = 'Paragraph 1\n\n\n\nParagraph 2'
    const result = processOrgContent(content)
    expect(result).toBe('<p>Paragraph 1</p><p>Paragraph 2</p>')
  })

  test('content without paragraph breaks stays unwrapped', () => {
    const content = 'Single line\nwith break'
    const result = processOrgContent(content)
    expect(result).toBe('Single line<br>with break')
    expect(result).not.toContain('<p>')
  })
})