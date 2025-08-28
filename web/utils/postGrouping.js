/**
 * Group replies under their root parent posts and sort appropriately
 * - Parent posts are sorted by timestamp (newest first)
 * - Replies are grouped under their root parent posts (not immediate parents)
 * - Within each parent, replies are sorted chronologically (oldest first)
 */
export function groupRepliesWithParents(posts) {
  // Sort posts by timestamp (newest first) - this becomes our base chronological order
  const sortedPosts = [...posts].sort((a, b) => new Date(b.id) - new Date(a.id))
  
  const groupedPosts = []
  const processedPosts = new Set()
  
  // First pass: Add all non-reply posts in chronological order
  sortedPosts.forEach(post => {
    if (!post.isReply || !post.replyTo) {
      groupedPosts.push(post)
      processedPosts.add(post.id)
      
      // Immediately after each root post, add all its direct replies
      const directReplies = sortedPosts
        .filter(p => p.isReply && p.replyTo === post.id && !processedPosts.has(p.id))
        .sort((a, b) => new Date(a.id) - new Date(b.id)) // Replies in chronological order (oldest first)
      
      directReplies.forEach(reply => {
        groupedPosts.push(reply)
        processedPosts.add(reply.id)
      })
    }
  })
  
  // Second pass: Handle any orphaned replies (replies to posts not in this feed)
  sortedPosts.forEach(post => {
    if (!processedPosts.has(post.id)) {
      groupedPosts.push(post)
      processedPosts.add(post.id)
    }
  })
  
  return groupedPosts
}