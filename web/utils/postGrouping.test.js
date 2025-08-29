import { groupRepliesWithParents } from './postGrouping.js'

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

  function assertArrayEquals(actual, expected, message = '') {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      throw new Error(`Both values must be arrays. ${message}`)
    }
    if (actual.length !== expected.length) {
      throw new Error(`Array lengths differ: expected ${expected.length}, got ${actual.length}. ${message}`)
    }
    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) {
        throw new Error(`Arrays differ at index ${i}: expected ${expected[i]}, got ${actual[i]}. ${message}`)
      }
    }
  }

  function assertTruthy(value, message = '') {
    if (!value) {
      throw new Error(`Expected truthy value, got ${value}. ${message}`)
    }
  }

  // Helper function to create mock posts
  function createPost(id, isReply = false, replyTo = null) {
    return {
      id,
      content: `Post ${id}`,
      isReply,
      replyTo,
      user: { nick: 'testuser' }
    }
  }

  // Test 1: Basic functionality - no replies
  test('groupRepliesWithParents - no replies', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'),
      createPost('2025-01-02T10:00:00+00:00'),
      createPost('2025-01-03T10:00:00+00:00')
    ]

    const result = groupRepliesWithParents(posts)
    
    assertEquals(result.length, 3, 'Should return all posts')
    // Posts should be sorted newest first
    assertEquals(result[0].id, '2025-01-03T10:00:00+00:00', 'First post should be newest')
    assertEquals(result[1].id, '2025-01-02T10:00:00+00:00', 'Second post should be middle')
    assertEquals(result[2].id, '2025-01-01T10:00:00+00:00', 'Third post should be oldest')
  })

  // Test 2: Simple reply structure
  test('groupRepliesWithParents - simple replies', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Parent
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Reply
      createPost('2025-01-02T10:00:00+00:00'), // Another parent
    ]

    const result = groupRepliesWithParents(posts)
    
    assertEquals(result.length, 3, 'Should return all posts')
    
    // Should be: newer parent, older parent, reply to older parent
    const resultIds = result.map(p => p.id)
    assertArrayEquals(resultIds, [
      '2025-01-02T10:00:00+00:00', // Newest parent first
      '2025-01-01T10:00:00+00:00', // Older parent
      '2025-01-01T11:00:00+00:00'  // Reply grouped under parent
    ], 'Posts should be grouped correctly')
  })

  // Test 3: Multiple replies to same parent
  test('groupRepliesWithParents - multiple replies to same parent', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Parent
      createPost('2025-01-01T12:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Later reply
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Earlier reply
    ]

    const result = groupRepliesWithParents(posts)
    
    assertEquals(result.length, 3, 'Should return all posts')
    
    const resultIds = result.map(p => p.id)
    assertArrayEquals(resultIds, [
      '2025-01-01T10:00:00+00:00', // Parent
      '2025-01-01T11:00:00+00:00', // Earlier reply first
      '2025-01-01T12:00:00+00:00'  // Later reply second
    ], 'Replies should be sorted chronologically (oldest first)')
  })

  // Test 4: Complex thread structure
  test('groupRepliesWithParents - complex thread structure', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Parent A
      createPost('2025-01-02T10:00:00+00:00'), // Parent B (newer)
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Reply to A
      createPost('2025-01-02T11:00:00+00:00', true, '2025-01-02T10:00:00+00:00'), // Reply to B
      createPost('2025-01-01T12:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Another reply to A
    ]

    const result = groupRepliesWithParents(posts)
    
    assertEquals(result.length, 5, 'Should return all posts')
    
    const resultIds = result.map(p => p.id)
    assertArrayEquals(resultIds, [
      '2025-01-02T10:00:00+00:00', // Parent B (newest parent first)
      '2025-01-02T11:00:00+00:00', // Reply to B
      '2025-01-01T10:00:00+00:00', // Parent A (older parent)
      '2025-01-01T11:00:00+00:00', // First reply to A
      '2025-01-01T12:00:00+00:00'  // Second reply to A
    ], 'Complex thread should be grouped correctly')
  })

  // Test 5: Orphaned replies (replies to posts not in the feed)
  test('groupRepliesWithParents - orphaned replies', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Parent
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Reply to parent
      createPost('2025-01-01T12:00:00+00:00', true, 'non-existent-post'), // Orphaned reply
    ]

    const result = groupRepliesWithParents(posts)
    
    assertEquals(result.length, 3, 'Should return all posts')
    
    const resultIds = result.map(p => p.id)
    assertArrayEquals(resultIds, [
      '2025-01-01T10:00:00+00:00', // Parent
      '2025-01-01T11:00:00+00:00', // Reply to parent
      '2025-01-01T12:00:00+00:00'  // Orphaned reply at end
    ], 'Orphaned replies should be included at the end')
  })

  // Test 6: Empty input
  test('groupRepliesWithParents - empty input', () => {
    const result = groupRepliesWithParents([])
    assertEquals(result.length, 0, 'Should return empty array for empty input')
  })

  // Test 7: Single post
  test('groupRepliesWithParents - single post', () => {
    const posts = [createPost('2025-01-01T10:00:00+00:00')]
    const result = groupRepliesWithParents(posts)
    
    assertEquals(result.length, 1, 'Should return single post')
    assertEquals(result[0].id, '2025-01-01T10:00:00+00:00', 'Should return the correct post')
  })

  // Test 8: Reply without parent post (all replies are orphaned)
  test('groupRepliesWithParents - all replies orphaned', () => {
    const posts = [
      createPost('2025-01-01T11:00:00+00:00', true, 'missing-parent-1'),
      createPost('2025-01-01T12:00:00+00:00', true, 'missing-parent-2'),
    ]

    const result = groupRepliesWithParents(posts)
    
    assertEquals(result.length, 2, 'Should return all orphaned replies')
    // Should be sorted newest first (since they're treated as regular posts)
    assertEquals(result[0].id, '2025-01-01T12:00:00+00:00', 'Newer orphaned reply first')
    assertEquals(result[1].id, '2025-01-01T11:00:00+00:00', 'Older orphaned reply second')
  })

  // Test 9: Posts with falsy isReply or replyTo values
  test('groupRepliesWithParents - falsy reply values', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Normal parent
      { id: '2025-01-01T11:00:00+00:00', content: 'Post with undefined isReply', user: { nick: 'test' } }, // undefined isReply
      { id: '2025-01-01T12:00:00+00:00', content: 'Post with null replyTo', isReply: true, replyTo: null, user: { nick: 'test' } }, // null replyTo
      { id: '2025-01-01T13:00:00+00:00', content: 'Post with empty replyTo', isReply: true, replyTo: '', user: { nick: 'test' } }, // empty replyTo
    ]

    const result = groupRepliesWithParents(posts)
    
    assertEquals(result.length, 4, 'Should return all posts')
    
    // All should be treated as non-reply posts and sorted newest first
    const resultIds = result.map(p => p.id)
    assertArrayEquals(resultIds, [
      '2025-01-01T13:00:00+00:00',
      '2025-01-01T12:00:00+00:00', 
      '2025-01-01T11:00:00+00:00',
      '2025-01-01T10:00:00+00:00'
    ], 'Posts with falsy reply values should be treated as non-replies')
  })

  // Test 10: Input array mutation check
  test('groupRepliesWithParents - does not mutate input', () => {
    const originalPosts = [
      createPost('2025-01-01T10:00:00+00:00'),
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'),
    ]
    const originalLength = originalPosts.length
    const originalFirstId = originalPosts[0].id

    groupRepliesWithParents(originalPosts)
    
    assertEquals(originalPosts.length, originalLength, 'Should not change original array length')
    assertEquals(originalPosts[0].id, originalFirstId, 'Should not change original array order')
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