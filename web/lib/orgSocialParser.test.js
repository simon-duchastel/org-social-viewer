import { parseOrgSocial, parseOrgSocialTimestamp } from './orgSocialParser.js'

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