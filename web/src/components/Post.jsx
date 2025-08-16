import { motion } from 'framer-motion'
import { parseOrgSocialTimestamp } from '../utils/orgSocialParser'
import './Post.css'

function Post({ post, onProfileClick, allUsers }) {
  const formatTimestamp = (timestamp) => {
    try {
      // Try to use the pre-parsed date if available
      let date
      if (post.parsedDate) {
        date = post.parsedDate
      } else {
        // Fallback to parsing the timestamp
        date = parseOrgSocialTimestamp(timestamp) || new Date(timestamp)
      }
      
      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
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
    } catch (error) {
      console.warn('Error formatting timestamp:', timestamp, error)
      return 'invalid date'
    }
  }

  const renderContent = (content) => {
    if (!content) return null
    
    // Handle pre-processed HTML content from parser
    if (content.includes('<')) {
      return (
        <div 
          className="post-content-html"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )
    }
    
    // Fallback for plain text
    return <div className="post-content-text">{content}</div>
  }

  const handleProfileClick = (e) => {
    e.stopPropagation()
    onProfileClick(post.user)
  }

  const handlePostClick = () => {
    // Could implement post detail view here
    console.log('Post clicked:', post)
  }

  const getAvatarUrl = (user) => {
    return user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nick}`
  }

  return (
    <motion.article 
      className={`post ${post.isReply ? 'post-reply' : ''} ${post.isPoll ? 'post-poll' : ''}`}
      onClick={handlePostClick}
      whileHover={{ backgroundColor: 'var(--twitter-hover-bg)' }}
      transition={{ duration: 0.1 }}
    >
      {post.isReply && (
        <div className="reply-indicator">
          <div className="reply-line"></div>
          <span className="reply-icon">↳</span>
          <span className="reply-text">Replying to post</span>
        </div>
      )}

      <div className="post-main">
        <motion.div 
          className="post-avatar"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={getAvatarUrl(post.user)}
            alt={`${post.user.nick}'s avatar`}
            onClick={handleProfileClick}
          />
        </motion.div>

        <div className="post-content">
          <div className="post-header">
            <div className="post-user-info">
              <motion.span 
                className="post-display-name"
                onClick={handleProfileClick}
                whileHover={{ textDecoration: 'underline' }}
              >
                {post.user.title || post.user.nick}
              </motion.span>
              <motion.span 
                className="post-username"
                onClick={handleProfileClick}
                whileHover={{ color: 'var(--twitter-blue)' }}
              >
                @{post.user.nick}
              </motion.span>
              <span className="post-separator">·</span>
              <span className="post-timestamp" title={
                post.parsedDate 
                  ? post.parsedDate.toLocaleString() 
                  : (parseOrgSocialTimestamp(post.timestamp) || new Date(post.timestamp)).toLocaleString()
              }>
                {formatTimestamp(post.timestamp)}
              </span>
            </div>

            {(post.properties.LANG || post.properties.CLIENT) && (
              <div className="post-metadata">
                {post.properties.LANG && (
                  <span className="post-lang">{post.properties.LANG}</span>
                )}
                {post.properties.CLIENT && (
                  <span className="post-client">via {post.properties.CLIENT}</span>
                )}
              </div>
            )}
          </div>

          {post.properties.CONTENT_WARNING && (
            <div className="content-warning">
              <span className="warning-icon">⚠️</span>
              <span>Content Warning: {post.properties.CONTENT_WARNING}</span>
            </div>
          )}

          <div className="post-body">
            {renderContent(post.displayContent || post.content)}
          </div>

          {post.isPoll && post.checkboxes && post.checkboxes.length > 0 && (
            <div className="poll-options">
              {post.checkboxes.map((option, index) => (
                <div key={index} className={`poll-option ${option.checked ? 'checked' : ''}`}>
                  <span className="poll-checkbox">{option.checked ? '☑️' : '☐'}</span>
                  <span className="poll-text">{option.text}</span>
                </div>
              ))}
              {post.properties.POLL_END && (
                <div className="poll-end">
                  Ends: {formatTimestamp(post.properties.POLL_END)}
                </div>
              )}
            </div>
          )}

          {post.mentions && post.mentions.length > 0 && (
            <div className="post-mentions">
              {post.mentions.map((mention, index) => (
                <motion.span 
                  key={index} 
                  className="mention"
                  whileHover={{ backgroundColor: 'var(--twitter-blue)', color: 'white' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    // Find user by URL or name
                    const mentionedUser = allUsers.find(user => 
                      user.sourceUrl === mention.url || user.nick === mention.name
                    )
                    if (mentionedUser) {
                      onProfileClick(mentionedUser)
                    }
                  }}
                >
                  @{mention.name}
                </motion.span>
              ))}
            </div>
          )}

          {post.properties.TAGS && (
            <div className="post-tags">
              {post.properties.TAGS.split(' ').map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
          )}

          {post.properties.MOOD && (
            <div className="post-mood">
              <span className="mood-icon">{post.properties.MOOD}</span>
            </div>
          )}

          <div className="post-actions">
            <motion.button 
              className="action-btn reply-btn"
              whileHover={{ scale: 1.1, color: 'var(--twitter-blue)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="action-icon">💬</span>
            </motion.button>

            <motion.button 
              className="action-btn repost-btn"
              whileHover={{ scale: 1.1, color: 'var(--twitter-success)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="action-icon">🔄</span>
            </motion.button>

            <motion.button 
              className="action-btn like-btn"
              whileHover={{ scale: 1.1, color: 'var(--twitter-error)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="action-icon">❤️</span>
            </motion.button>

            <motion.button 
              className="action-btn share-btn"
              whileHover={{ scale: 1.1, color: 'var(--twitter-blue)' }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation()
                const url = `${post.sourceUrl}#${post.id}`
                navigator.clipboard.writeText(url)
              }}
            >
              <span className="action-icon">📤</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

export default Post