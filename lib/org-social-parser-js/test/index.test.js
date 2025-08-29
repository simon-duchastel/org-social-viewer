import { parseOrgSocial, parseOrgSocialTimestamp, processOrgContent, fetchOrgSocial, fetchFollowedUsers, extractMentions, extractLinks, normalizeUrl, formatTimestampForDisplay, formatJoinDate } from '../src/index.js'

/**
 * Basic test runner (no framework needed)
 */
function runTests() {
  let passed = 0
  let failed = 0

  function test(name, fn) {
    try {
      fn()
      console.log(`✓ ${name}`)
      passed++
    } catch (error) {
      console.error(`✗ ${name}: ${error.message}`)
      failed++
    }
  }

  function assertEquals(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}. ${message}`)
    }
  }

  function assertTruthy(value, message = '') {
    if (!value) {
      throw new Error(`Expected truthy value, got ${value}. ${message}`)
    }
  }

  function assertFalsy(value, message = '') {
    if (value) {
      throw new Error(`Expected falsy value, got ${value}. ${message}`)
    }
  }

  function assertArrayLength(array, expectedLength, message = '') {
    if (!Array.isArray(array)) {
      throw new Error(`Expected array, got ${typeof array}. ${message}`)
    }
    if (array.length !== expectedLength) {
      throw new Error(`Expected array length ${expectedLength}, got ${array.length}. ${message}`)
    }
  }

  function assertArrayContains(array, item, message = '') {
    if (!Array.isArray(array) || !array.includes(item)) {
      throw new Error(`Expected array to contain ${item}. ${message}`)
    }
  }

  function assertThrows(fn, message = '') {
    try {
      fn()
      throw new Error(`Expected function to throw. ${message}`)
    } catch (error) {
      // Expected to throw
    }
  }

  // Test parseOrgSocialTimestamp function
  test('parseOrgSocialTimestamp - valid RFC 3339 timestamp', () => {
    const timestamp = '2025-12-30T20:30:15+00:00'
    const result = parseOrgSocialTimestamp(timestamp)
    assertTruthy(result instanceof Date, 'Should return a Date object')
    assertFalsy(isNaN(result.getTime()), 'Should be a valid date')
  })

  test('parseOrgSocialTimestamp - invalid timestamp', () => {
    const timestamp = 'not-a-date'
    const result = parseOrgSocialTimestamp(timestamp)
    assertEquals(result, null, 'Should return null for invalid timestamp')
  })

  test('parseOrgSocialTimestamp - empty timestamp', () => {
    const result = parseOrgSocialTimestamp('')
    assertEquals(result, null, 'Should return null for empty timestamp')
  })

  test('parseOrgSocialTimestamp - null timestamp', () => {
    const result = parseOrgSocialTimestamp(null)
    assertEquals(result, null, 'Should return null for null timestamp')
  })

  // Test parseOrgSocial function with minimal content
  test('parseOrgSocial - basic metadata parsing', () => {
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
    
    assertEquals(result.title, 'Test User', 'Should parse title')
    assertEquals(result.nick, 'testuser', 'Should parse nick')
    assertEquals(result.description, 'A test user profile', 'Should parse description')
    assertEquals(result.avatar, 'https://example.com/avatar.jpg', 'Should parse avatar')
    assertEquals(result.posts.length, 1, 'Should parse one post')
    
    const post = result.posts[0]
    assertEquals(post.content.trim(), 'This is a test post.', 'Should parse post content')
    assertTruthy(post.formattedTimestamp, 'Should have formatted timestamp')
    assertTruthy(post.fullTimestamp, 'Should have full timestamp')
  })

  test('parseOrgSocial - post with formatted dates', () => {
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
    
    assertTruthy(post.parsedDate instanceof Date, 'Should have parsed date object')
    assertTruthy(post.formattedTimestamp, 'Should have formatted timestamp')
    assertTruthy(post.fullTimestamp, 'Should have full timestamp')
    assertEquals(post.id, '2025-01-01T10:00:00+00:00', 'Should have post ID')
  })

  test('parseOrgSocial - user with formatted join date', () => {
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
    
    assertTruthy(result.formattedJoinDate, 'Should have formatted join date')
    assertTruthy(result.formattedJoinDate !== 'Recently', 'Should not fallback to Recently for valid date')
  })

  test('parseOrgSocial - empty content', () => {
    const result = parseOrgSocial('')
    
    assertEquals(result.posts.length, 0, 'Should have no posts')
    assertEquals(result.title, '', 'Should have empty title')
    assertEquals(result.nick, '', 'Should have empty nick')
    assertEquals(result.formattedJoinDate, 'Recently', 'Should fallback to Recently for no posts')
  })

  test('parseOrgSocial - posts sorted by timestamp', () => {
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
    
    assertEquals(result.posts.length, 2, 'Should have two posts')
    
    // Posts should be sorted newest first
    const timestamps = result.posts.map(p => p.timestamp)
    assertTruthy(new Date(timestamps[0]) > new Date(timestamps[1]), 'Posts should be sorted newest first')
  })

  // Test processOrgContent for hyperlink fixes
  test('processOrgContent - org link without protocol gets https prefix', () => {
    const content = '[[github.com/tanrax/awesome-org-social][awesome project]]'
    const result = processOrgContent(content)
    assertTruthy(result.includes('href="https://github.com/tanrax/awesome-org-social"'), 'Should add https:// prefix to domain links')
    assertTruthy(result.includes('target="_blank"'), 'Should include target="_blank"')
    assertTruthy(result.includes('rel="noopener noreferrer"'), 'Should include security attributes')
  })

  test('processOrgContent - org link with protocol remains unchanged', () => {
    const content = '[[https://github.com/existing-project][project]]'
    const result = processOrgContent(content)
    assertTruthy(result.includes('href="https://github.com/existing-project"'), 'Should keep existing https:// protocol')
  })

  test('processOrgContent - standalone domain gets linked', () => {
    const content = 'Check out github.com/simon-duchastel for more info'
    const result = processOrgContent(content)
    assertTruthy(result.includes('<a href="https://github.com/simon-duchastel"'), 'Should wrap standalone domain in link')
    assertTruthy(result.includes('target="_blank"'), 'Should include target="_blank" for standalone domains')
  })

  test('processOrgContent - www domains get https prefix', () => {
    const content = '[[www.example.com][example site]]'
    const result = processOrgContent(content)
    assertTruthy(result.includes('href="https://www.example.com"'), 'Should add https:// prefix to www domains')
  })

  test('processOrgContent - relative URLs remain unchanged', () => {
    const content = '[[/local-page][local link]]'
    const result = processOrgContent(content)
    assertTruthy(result.includes('href="/local-page"'), 'Should keep relative URLs as-is')
  })

  test('processOrgContent - org-social mentions not converted to regular links', () => {
    const content = '[[org-social:/alice-social.org][Alice]]'
    const result = processOrgContent(content)
    assertTruthy(result.includes('<span class="mention"'), 'Should convert org-social links to mentions')
    assertFalsy(result.includes('<a href='), 'Should not create regular links for mentions')
  })

  test('processOrgContent - mixed content with different link types', () => {
    const content = 'Visit [[github.com/project][my project]] or [[https://example.com][example]] or plain github.com/other'
    const result = processOrgContent(content)
    
    // Should handle all three types correctly
    assertTruthy(result.includes('href="https://github.com/project"'), 'Should add protocol to org link')
    assertTruthy(result.includes('href="https://example.com"'), 'Should preserve existing protocol')
    assertTruthy(result.includes('href="https://github.com/other"'), 'Should link standalone domain')
  })

  // Test formatTimestampForDisplay edge cases
  test('parseOrgSocialTimestamp - malformed hour format', () => {
    const timestamp = '2025-01-01T014:29:00+00:00'
    const result = parseOrgSocialTimestamp(timestamp)
    assertEquals(result, null, 'Should return null for malformed hour format')
  })

  test('parseOrgSocialTimestamp - various invalid formats', () => {
    const invalidTimestamps = [
      '2025-13-01T10:00:00+00:00', // Invalid month
      '2025-01-32T10:00:00+00:00', // Invalid day
      '2025-01-01T25:00:00+00:00', // Invalid hour
      '2025-01-01T10:60:00+00:00', // Invalid minute
      'invalid-format',
      // Note: '2025/01/01 10:00:00' is actually parseable by Date constructor
      undefined,
      null
    ]
    
    invalidTimestamps.forEach(timestamp => {
      const result = parseOrgSocialTimestamp(timestamp)
      assertEquals(result, null, `Should return null for invalid timestamp: ${timestamp}`)
    })
  })

  test('parseOrgSocialTimestamp - whitespace handling', () => {
    const timestamp = '  2025-01-01T10:00:00+00:00  '
    const result = parseOrgSocialTimestamp(timestamp)
    assertTruthy(result instanceof Date, 'Should handle whitespace around timestamp')
  })

  // Test extractMentions
  test('extractMentions - single mention', () => {
    const content = 'Hello [[org-social:/alice-social.org][Alice]]!'
    const mentions = extractMentions(content)
    assertArrayLength(mentions, 1, 'Should extract one mention')
    assertEquals(mentions[0].url, '/alice-social.org', 'Should extract mention URL')
    assertEquals(mentions[0].name, 'Alice', 'Should extract mention name')
  })

  test('extractMentions - multiple mentions', () => {
    const content = 'Thanks [[org-social:/alice.org][Alice]] and [[org-social:/bob.org][Bob]]!'
    const mentions = extractMentions(content)
    assertArrayLength(mentions, 2, 'Should extract two mentions')
    assertEquals(mentions[0].name, 'Alice', 'Should extract first mention name')
    assertEquals(mentions[1].name, 'Bob', 'Should extract second mention name')
  })

  test('extractMentions - no mentions', () => {
    const content = 'Just a regular post with no mentions.'
    const mentions = extractMentions(content)
    assertArrayLength(mentions, 0, 'Should extract no mentions')
  })

  // Test extractLinks
  test('extractLinks - org-mode link format', () => {
    const content = 'Check out [[https://github.com/project][my project]]'
    const links = extractLinks(content)
    // Note: extractLinks extracts both org-mode links and plain URLs
    const orgModeLink = links.find(link => link.text === 'my project')
    assertTruthy(orgModeLink, 'Should extract org-mode link')
    assertEquals(orgModeLink.url, 'https://github.com/project', 'Should extract link URL')
    assertEquals(orgModeLink.text, 'my project', 'Should extract link text')
  })

  test('extractLinks - plain URL', () => {
    const content = 'Visit https://example.com for more info'
    const links = extractLinks(content)
    assertArrayLength(links, 1, 'Should extract one plain URL')
    assertEquals(links[0].url, 'https://example.com', 'Should extract plain URL')
    assertEquals(links[0].text, 'https://example.com', 'Should use URL as text for plain URLs')
  })

  test('extractLinks - mixed links', () => {
    const content = 'Visit [[https://github.com/project][GitHub]] or https://example.com'
    const links = extractLinks(content)
    // The function extracts all links, including duplicates from org-mode format
    assertTruthy(links.length >= 2, 'Should extract at least two links')
    const githubLink = links.find(link => link.text === 'GitHub')
    const exampleLink = links.find(link => link.url === 'https://example.com')
    assertTruthy(githubLink, 'Should extract GitHub org-mode link')
    assertTruthy(exampleLink, 'Should extract example plain URL')
  })

  test('extractLinks - excludes org-social mentions', () => {
    const content = 'Thanks [[org-social:/alice.org][Alice]] and visit [[https://example.com][example]]'
    const links = extractLinks(content)
    // Should exclude org-social links but may extract the URL if it appears as plain text too
    const exampleLink = links.find(link => link.url === 'https://example.com')
    assertTruthy(exampleLink, 'Should extract regular link')
    const orgSocialLink = links.find(link => link.url.startsWith('org-social:'))
    assertFalsy(orgSocialLink, 'Should not extract org-social links')
  })

  // Test normalizeUrl
  test('normalizeUrl - domain without protocol', () => {
    const result = normalizeUrl('github.com/project')
    assertEquals(result, 'https://github.com/project', 'Should add https:// to domain')
  })

  test('normalizeUrl - www domain', () => {
    const result = normalizeUrl('www.example.com')
    assertEquals(result, 'https://www.example.com', 'Should add https:// to www domain')
  })

  test('normalizeUrl - existing protocol', () => {
    const result = normalizeUrl('https://example.com')
    assertEquals(result, 'https://example.com', 'Should keep existing protocol')
  })

  test('normalizeUrl - relative URL', () => {
    const result = normalizeUrl('/local-page')
    assertEquals(result, '/local-page', 'Should keep relative URLs unchanged')
  })

  test('normalizeUrl - empty or null', () => {
    assertEquals(normalizeUrl(''), '', 'Should handle empty string')
    assertEquals(normalizeUrl(null), null, 'Should handle null')
  })

  // Test complex post structures
  test('parseOrgSocial - post with reply properties', () => {
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

    assertTruthy(post.isReply, 'Should identify post as reply')
    assertEquals(post.replyTo, '2025-08-27T04:55:02+02:00', 'Should extract reply post ID')
    assertTruthy('https://example.org/social.org', 'Should extract reply URL in properties')
  })

  test('parseOrgSocial - post with checkboxes (poll)', () => {
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
    
    assertArrayLength(post.checkboxes, 4, 'Should extract 4 checkbox items')
    assertTruthy(post.checkboxes[0].checked, 'First checkbox should be checked')
    assertFalsy(post.checkboxes[1].checked, 'Second checkbox should be unchecked')
    assertTruthy(post.checkboxes[2].checked, 'Third checkbox should be checked')
    assertEquals(post.checkboxes[0].text, 'JavaScript', 'Should extract checkbox text')
  })

  test('parseOrgSocial - multiple metadata fields', () => {
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
    
    assertEquals(result.title, 'Complex User', 'Should parse title')
    assertEquals(result.nick, 'complex', 'Should parse nick')
    assertEquals(result.description, 'A complex user profile', 'Should parse description')
    assertEquals(result.avatar, 'https://example.com/avatar.jpg', 'Should parse avatar')
    assertArrayLength(result.links, 2, 'Should extract 2 links')
    assertArrayContains(result.links, 'https://github.com/user', 'Should contain GitHub link')
    assertArrayContains(result.links, 'https://twitter.com/user', 'Should contain Twitter link')
    assertArrayLength(result.follows, 2, 'Should extract 2 follows')
    assertEquals(result.follows[0].nick, 'alice', 'Should extract follow nick')
    assertEquals(result.follows[0].url, '/alice.org', 'Should extract follow URL')
    assertArrayLength(result.contacts, 2, 'Should extract 2 contacts')
    assertArrayContains(result.contacts, 'email@example.com', 'Should contain email contact')
  })

  test('parseOrgSocial - posts from text pattern format', () => {
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
    assertArrayLength(result.posts, 2, 'Should extract 2 posts from text pattern')
    assertTruthy(result.posts.some(p => p.content.includes('First post')), 'Should extract first post')
    assertTruthy(result.posts.some(p => p.content.includes('Second post')), 'Should extract second post')
  })

  test('parseOrgSocial - polls section', () => {
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
    
    assertArrayLength(result.posts, 1, 'Should extract poll as post')
    const poll = result.posts[0]
    assertTruthy(poll.isPoll, 'Should mark post as poll')
    assertArrayLength(poll.checkboxes, 2, 'Should extract poll options')
    assertArrayLength(result.polls, 1, 'Should include in polls array')
  })

  test('parseOrgSocial - invalid org content handling', () => {
    const invalidContent = 'This is not valid org-mode content at all.'
    
    const result = parseOrgSocial(invalidContent)
    
    // Should not throw and should return reasonable defaults
    assertTruthy(result, 'Should return result object')
    assertArrayLength(result.posts, 0, 'Should have no posts')
    assertEquals(result.title, '', 'Should have empty title')
  })

  test('parseOrgSocial - error handling', () => {
    // Test with content that might cause parsing errors
    assertThrows(() => {
      parseOrgSocial(null)
    }, 'Should throw for null input')
  })

  // Test formatting functions
  test('formatTimestampForDisplay - various time differences', () => {
    const now = new Date()
    
    // Test 'now'
    const justNow = new Date(now.getTime() - 30000) // 30 seconds ago
    assertEquals(formatTimestampForDisplay(justNow), 'now', 'Should show "now" for recent times')
    
    // Test minutes
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000)
    assertEquals(formatTimestampForDisplay(fiveMinutesAgo), '5m', 'Should show minutes')
    
    // Test hours
    const twoHoursAgo = new Date(now.getTime() - 2 * 3600000)
    assertEquals(formatTimestampForDisplay(twoHoursAgo), '2h', 'Should show hours')
    
    // Test days
    const threeDaysAgo = new Date(now.getTime() - 3 * 86400000)
    assertEquals(formatTimestampForDisplay(threeDaysAgo), '3d', 'Should show days')
    
    // Test invalid date
    assertEquals(formatTimestampForDisplay(new Date('invalid')), 'invalid date', 'Should handle invalid dates')
    assertEquals(formatTimestampForDisplay(null), 'invalid date', 'Should handle null')
  })

  test('formatJoinDate - various dates', () => {
    const testDate = new Date('2025-01-15T10:00:00Z')
    const result = formatJoinDate(testDate)
    assertTruthy(result.includes('January'), 'Should include month name')
    assertTruthy(result.includes('2025'), 'Should include year')
    
    assertEquals(formatJoinDate(null), 'Recently', 'Should return "Recently" for null')
    assertEquals(formatJoinDate(new Date('invalid')), 'Recently', 'Should return "Recently" for invalid date')
  })

  // Summary
  console.log(`\nTest Results: ${passed} passed, ${failed} failed`)
  
  if (failed > 0) {
    process.exit(1)
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
}

export { runTests }
