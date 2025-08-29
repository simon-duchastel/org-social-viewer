import { describe, test, expect } from 'vitest'
import { groupRepliesWithParents } from './postGrouping.js'

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

describe('groupRepliesWithParents', () => {
  test('no replies', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'),
      createPost('2025-01-02T10:00:00+00:00'),
      createPost('2025-01-03T10:00:00+00:00')
    ]

    const result = groupRepliesWithParents(posts)
    
    expect(result).toHaveLength(3)
    // Posts should be sorted newest first
    expect(result[0].id).toBe('2025-01-03T10:00:00+00:00')
    expect(result[1].id).toBe('2025-01-02T10:00:00+00:00')
    expect(result[2].id).toBe('2025-01-01T10:00:00+00:00')
  })

  test('simple replies', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Parent
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Reply
      createPost('2025-01-02T10:00:00+00:00'), // Another parent
    ]

    const result = groupRepliesWithParents(posts)
    
    expect(result).toHaveLength(3)
    
    // Should be: newer parent, older parent, reply to older parent
    const resultIds = result.map(p => p.id)
    expect(resultIds).toEqual([
      '2025-01-02T10:00:00+00:00', // Newest parent first
      '2025-01-01T10:00:00+00:00', // Older parent
      '2025-01-01T11:00:00+00:00'  // Reply grouped under parent
    ])
  })

  test('multiple replies to same parent', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Parent
      createPost('2025-01-01T12:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Later reply
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Earlier reply
    ]

    const result = groupRepliesWithParents(posts)
    
    expect(result).toHaveLength(3)
    
    const resultIds = result.map(p => p.id)
    expect(resultIds).toEqual([
      '2025-01-01T10:00:00+00:00', // Parent
      '2025-01-01T11:00:00+00:00', // Earlier reply first
      '2025-01-01T12:00:00+00:00'  // Later reply second
    ])
  })

  test('complex thread structure', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Parent A
      createPost('2025-01-02T10:00:00+00:00'), // Parent B (newer)
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Reply to A
      createPost('2025-01-02T11:00:00+00:00', true, '2025-01-02T10:00:00+00:00'), // Reply to B
      createPost('2025-01-01T12:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Another reply to A
    ]

    const result = groupRepliesWithParents(posts)
    
    expect(result).toHaveLength(5)
    
    const resultIds = result.map(p => p.id)
    expect(resultIds).toEqual([
      '2025-01-02T10:00:00+00:00', // Parent B (newest parent first)
      '2025-01-02T11:00:00+00:00', // Reply to B
      '2025-01-01T10:00:00+00:00', // Parent A (older parent)
      '2025-01-01T11:00:00+00:00', // First reply to A
      '2025-01-01T12:00:00+00:00'  // Second reply to A
    ])
  })

  test('orphaned replies', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Parent
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'), // Reply to parent
      createPost('2025-01-01T12:00:00+00:00', true, 'non-existent-post'), // Orphaned reply
    ]

    const result = groupRepliesWithParents(posts)
    
    expect(result).toHaveLength(3)
    
    const resultIds = result.map(p => p.id)
    expect(resultIds).toEqual([
      '2025-01-01T10:00:00+00:00', // Parent
      '2025-01-01T11:00:00+00:00', // Reply to parent
      '2025-01-01T12:00:00+00:00'  // Orphaned reply at end
    ])
  })

  test('empty input', () => {
    const result = groupRepliesWithParents([])
    expect(result).toHaveLength(0)
  })

  test('single post', () => {
    const posts = [createPost('2025-01-01T10:00:00+00:00')]
    const result = groupRepliesWithParents(posts)
    
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2025-01-01T10:00:00+00:00')
  })

  test('all replies orphaned', () => {
    const posts = [
      createPost('2025-01-01T11:00:00+00:00', true, 'missing-parent-1'),
      createPost('2025-01-01T12:00:00+00:00', true, 'missing-parent-2'),
    ]

    const result = groupRepliesWithParents(posts)
    
    expect(result).toHaveLength(2)
    // Should be sorted newest first (since they're treated as regular posts)
    expect(result[0].id).toBe('2025-01-01T12:00:00+00:00')
    expect(result[1].id).toBe('2025-01-01T11:00:00+00:00')
  })

  test('falsy reply values', () => {
    const posts = [
      createPost('2025-01-01T10:00:00+00:00'), // Normal parent
      { id: '2025-01-01T11:00:00+00:00', content: 'Post with undefined isReply', user: { nick: 'test' } }, // undefined isReply
      { id: '2025-01-01T12:00:00+00:00', content: 'Post with null replyTo', isReply: true, replyTo: null, user: { nick: 'test' } }, // null replyTo
      { id: '2025-01-01T13:00:00+00:00', content: 'Post with empty replyTo', isReply: true, replyTo: '', user: { nick: 'test' } }, // empty replyTo
    ]

    const result = groupRepliesWithParents(posts)
    
    expect(result).toHaveLength(4)
    
    // All should be treated as non-reply posts and sorted newest first
    const resultIds = result.map(p => p.id)
    expect(resultIds).toEqual([
      '2025-01-01T13:00:00+00:00',
      '2025-01-01T12:00:00+00:00', 
      '2025-01-01T11:00:00+00:00',
      '2025-01-01T10:00:00+00:00'
    ])
  })

  test('does not mutate input', () => {
    const originalPosts = [
      createPost('2025-01-01T10:00:00+00:00'),
      createPost('2025-01-01T11:00:00+00:00', true, '2025-01-01T10:00:00+00:00'),
    ]
    const originalLength = originalPosts.length
    const originalFirstId = originalPosts[0].id

    groupRepliesWithParents(originalPosts)
    
    expect(originalPosts).toHaveLength(originalLength)
    expect(originalPosts[0].id).toBe(originalFirstId)
  })
})