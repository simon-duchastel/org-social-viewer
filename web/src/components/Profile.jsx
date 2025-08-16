import { motion } from 'framer-motion'
import Post from './Post'
import './Profile.css'

function Profile({ user, posts, onProfileClick, allUsers }) {
  if (!user) {
    return (
      <div className="profile-error">
        <p>User not found</p>
      </div>
    )
  }

  const getAvatarUrl = (user) => {
    return user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTEyIDEyQzkuNzkgMTIgOCAxMC4yMSA4IDhTOS43OSA0IDEyIDRTMTYgNS43OSAxNiA4UzE0LjIxIDEyIDEyIDEyWk0xMiAxNEMxNi40MiAxNCAyMCAxNS43OSAyMCAyMFYyMkg0VjIwQzQgMTUuNzkgNy41OCAxNCAxMiAxNFoiIGZpbGw9IiM5Q0E0QUYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsIDgpIi8+Cjwvc3ZnPgo='
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    } catch {
      return 'Date unknown'
    }
  }

  // Find the earliest post to estimate join date
  const joinDate = posts.length > 0 
    ? formatDate(posts[posts.length - 1].timestamp)
    : 'Recently'

  const handleFollowClick = (followUser) => {
    const foundUser = allUsers.find(u => u.nick === followUser.nick || u.sourceUrl === followUser.url)
    if (foundUser) {
      onProfileClick(foundUser)
    }
  }

  return (
    <motion.div 
      className="profile"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-banner">
          {/* Could add banner image here */}
        </div>
        
        <div className="profile-info">
          <motion.div 
            className="profile-avatar-container"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src={getAvatarUrl(user)} 
              alt={`${user.nick}'s avatar`}
              className="profile-avatar"
            />
          </motion.div>
          
          <div className="profile-details">
            <div className="profile-names">
              <h1 className="profile-display-name">
                {user.title || user.nick}
              </h1>
              <p className="profile-username">@{user.nick}</p>
            </div>
            
            {user.description && (
              <motion.p 
                className="profile-bio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {user.description}
              </motion.p>
            )}
            
            <div className="profile-metadata">
              <div className="profile-meta-item">
                <span className="meta-icon">📅</span>
                <span>Joined {joinDate}</span>
              </div>
              
              {user.links && user.links.length > 0 && (
                <div className="profile-meta-item">
                  <span className="meta-icon">🔗</span>
                  <div className="profile-links">
                    {user.links.map((link, index) => (
                      <a 
                        key={index} 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="profile-link"
                      >
                        {link.replace(/^https?:\/\//, '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {user.contacts && user.contacts.length > 0 && (
                <div className="profile-meta-item">
                  <span className="meta-icon">📧</span>
                  <div className="profile-contacts">
                    {user.contacts.map((contact, index) => (
                      <a 
                        key={index} 
                        href={contact}
                        className="profile-contact"
                      >
                        {contact.replace(/^(mailto:|xmpp:)/, '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{posts.length}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-number">{user.follows?.length || 0}</span>
                <span className="stat-label">Following</span>
              </div>
              {user.polls && user.polls.length > 0 && (
                <div className="stat">
                  <span className="stat-number">{user.polls.length}</span>
                  <span className="stat-label">Polls</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Following Section */}
      {user.follows && user.follows.length > 0 && (
        <motion.div 
          className="profile-following"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h3 className="section-title">Following</h3>
          <div className="following-list">
            {user.follows.map((follow, index) => (
              <motion.div 
                key={index}
                className="following-item"
                whileHover={{ scale: 1.02, backgroundColor: 'var(--twitter-hover-bg)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFollowClick(follow)}
              >
                <div className="following-avatar">
                  <img 
                    src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTEyIDEyQzkuNzkgMTIgOCAxMC4yMSA4IDhTOS43OSA0IDEyIDRTMTYgNS43OSAxNiA4UzE0LjIxIDEyIDEyIDEyWk0xMiAxNEMxNi40MiAxNCAyMCAxNS43OSAyMCAyMFYyMkg0VjIwQzQgMTUuNzkgNy41OCAxNCAxMiAxNFoiIGZpbGw9IiM5Q0E0QUYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsIDgpIi8+Cjwvc3ZnPgo='
                    alt={`${follow.nick}'s avatar`}
                  />
                </div>
                <div className="following-info">
                  <div className="following-name">{follow.nick}</div>
                  <div className="following-url">{follow.url}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Posts Section */}
      <motion.div 
        className="profile-posts"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h3 className="section-title">
          Posts ({posts.length})
        </h3>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">📝</div>
            <p>No posts yet</p>
            <small>This user hasn't posted anything yet.</small>
          </div>
        ) : (
          <div className="posts-list">
            {posts.map((post, index) => (
              <motion.div
                key={`${post.id || post.timestamp}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 0.5 + (index * 0.1),
                  duration: 0.3 
                }}
              >
                <Post 
                  post={post}
                  onProfileClick={onProfileClick}
                  allUsers={allUsers}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default Profile