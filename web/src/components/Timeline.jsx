import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Post from './Post'
import LoadingSpinner from './LoadingSpinner'
import './Timeline.css'

const POSTS_PER_PAGE = 20

function Timeline({ posts, users, onProfileClick }) {
  const [displayedPosts, setDisplayedPosts] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef()
  const timelineRef = useRef()

  // Reset when posts change
  useEffect(() => {
    setCurrentPage(1)
    setDisplayedPosts(posts.slice(0, POSTS_PER_PAGE))
    setHasMore(posts.length > POSTS_PER_PAGE)
  }, [posts])

  // Infinite scroll observer
  const lastPostElementRef = useCallback(node => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts()
      }
    }, { threshold: 0.1 })
    
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore])

  const loadMorePosts = useCallback(() => {
    if (loading || !hasMore) return
    
    setLoading(true)
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      const nextPage = currentPage + 1
      const startIndex = (nextPage - 1) * POSTS_PER_PAGE
      const endIndex = startIndex + POSTS_PER_PAGE
      const newPosts = posts.slice(startIndex, endIndex)
      
      if (newPosts.length > 0) {
        setDisplayedPosts(prev => [...prev, ...newPosts])
        setCurrentPage(nextPage)
        setHasMore(endIndex < posts.length)
      } else {
        setHasMore(false)
      }
      
      setLoading(false)
    }, 500)
  }, [posts, currentPage, loading, hasMore])

  if (posts.length === 0) {
    return (
      <div className="timeline-empty">
        <motion.div 
          className="empty-state"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="empty-icon">📝</div>
          <h3>No posts found</h3>
          <p>This org-social feed doesn't have any posts yet, or they couldn't be loaded.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="timeline" ref={timelineRef}>
      <motion.div 
        className="timeline-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {displayedPosts.map((post, index) => {
          const isLast = index === displayedPosts.length - 1
          
          return (
            <motion.div
              key={`${post.user.nick}-${post.id || post.timestamp}-${index}`}
              ref={isLast ? lastPostElementRef : null}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index < 10 ? index * 0.05 : 0 // Stagger first 10 posts
              }}
              className="timeline-post"
            >
              <Post 
                post={post}
                onProfileClick={onProfileClick}
                allUsers={users}
              />
            </motion.div>
          )
        })}
        
        {loading && (
          <div className="timeline-loading">
            <LoadingSpinner size="small" message="Loading more posts..." />
          </div>
        )}
        
        {!hasMore && displayedPosts.length > 0 && (
          <motion.div 
            className="timeline-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <div className="end-message">
              <span>🎉</span>
              <p>You've reached the end of the timeline!</p>
              <small>Showing {displayedPosts.length} of {posts.length} posts</small>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default Timeline