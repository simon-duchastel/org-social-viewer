'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Post from '../ui/Post'
import AvatarModal from '../ui/AvatarModal'
import ViewSourceButton from '../ui/ViewSourceButton'
import styles from './Profile.module.css'

function Profile({ user, posts, onProfileClick, allUsers }) {
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)

  if (!user) {
    return (
      <div className={styles.profileError}>
        <p>User not found</p>
      </div>
    )
  }

  const getAvatarUrl = (user) => {
    return user.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTEyIDEyQzkuNzkgMTIgOCAxMC4yMSA4IDhTOS43OSA0IDEyIDRTMTYgNS43OSAxNiA4UzE0LjIxIDEyIDEyIDEyWk0xMiAxNEMxNi40MiAxNCAyMCAxNS43OSAyMCAyMFYyMkg0VjIwQzQgMTUuNzkgNy41OCAxNCAxMiAxNFoiIGZpbGw9IiM5Q0E0QUYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsIDgpIi8+Cjwvc3ZnPgo='
  }

  // Use pre-formatted join date from the user object
  const joinDate = user.formattedJoinDate || 'Recently'

  const handleFollowClick = (followUser) => {
    const foundUser = allUsers.find(u => u.nick === followUser.nick || u.sourceUrl === followUser.url)
    if (foundUser) {
      onProfileClick(foundUser)
    }
  }

  return (
    <motion.div 
      className={styles.profile}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div className={styles.profileBanner}>
          {/* Could add banner image here */}
        </div>
        
        <div className={styles.profileInfo}>
          <motion.div 
            className={styles.profileAvatarContainer}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src={getAvatarUrl(user)} 
              alt={`${user.nick}&apos;s avatar`}
              className={styles.profileAvatar}
              onClick={() => setIsAvatarModalOpen(true)}
              style={{ cursor: 'pointer' }}
            />
          </motion.div>
          
          <div className={styles.profileDetails}>
            <div className={styles.profileNames}>
              <h1 className={styles.profileDisplayName}>
                {user.title || user.nick}
              </h1>
              <div className={styles.profileUsernameRow}>
                <p className={styles.profileUsername}>@{user.nick}</p>
                <ViewSourceButton 
                  sourceUrl={user.sourceUrl}
                  className="usernameBtn"
                  title="View source file for this profile"
                />
              </div>
            </div>
            
            {user.description && (
              <motion.p 
                className={styles.profileBio}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {user.description}
              </motion.p>
            )}
            
            <div className={styles.profileMetadata}>
              <div className={styles.profileMetaItem}>
                <span className={styles.metaIcon}>📅</span>
                <span>Joined {joinDate}</span>
              </div>
              
              {user.links && user.links.length > 0 && (
                <div className={styles.profileMetaItem}>
                  <span className={styles.metaIcon}>🔗</span>
                  <div className={styles.profileLinks}>
                    {user.links.map((link, index) => (
                      <a 
                        key={index} 
                        href={link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.profileLink}
                      >
                        {link.replace(/^https?:\/\//, '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              {user.contacts && user.contacts.length > 0 && (
                <div className={styles.profileMetaItem}>
                  <span className={styles.metaIcon}>📧</span>
                  <div className={styles.profileContacts}>
                    {user.contacts.map((contact, index) => (
                      <a 
                        key={index} 
                        href={contact}
                        className={styles.profileContact}
                      >
                        {contact.replace(/^(mailto:|xmpp:)/, '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.profileStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{posts.length}</span>
                <span className={styles.statLabel}>Posts</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{user.follows?.length || 0}</span>
                <span className={styles.statLabel}>Following</span>
              </div>
              {user.polls && user.polls.length > 0 && (
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{user.polls.length}</span>
                  <span className={styles.statLabel}>Polls</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Following Section */}
      {user.follows && user.follows.length > 0 && (
        <motion.div 
          className={styles.profileFollowing}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <h3 className={styles.sectionTitle}>Following</h3>
          <div className={styles.followingList}>
            {user.follows.map((follow, index) => (
              <motion.div 
                key={index}
                className={styles.followingItem}
                whileHover={{ scale: 1.02, backgroundColor: 'var(--twitter-hover-bg)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleFollowClick(follow)}
              >
                <div className={styles.followingAvatar}>
                  <img 
                    src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iMjAiIGZpbGw9IiNFNUU3RUIiLz4KPHBhdGggZD0iTTEyIDEyQzkuNzkgMTIgOCAxMC4yMSA4IDhTOS43OSA0IDEyIDRTMTYgNS43OSAxNiA4UzE0LjIxIDEyIDEyIDEyWk0xMiAxNEMxNi40MiAxNCAyMCAxNS43OSAyMCAyMFYyMkg0VjIwQzQgMTUuNzkgNy41OCAxNCAxMiAxNFoiIGZpbGw9IiM5Q0E0QUYiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgsIDgpIi8+Cjwvc3ZnPgo='
                    alt={`${follow.nick}&apos;s avatar`}
                  />
                </div>
                <div className={styles.followingInfo}>
                  <div className={styles.followingName}>{follow.nick}</div>
                  <div className={styles.followingUrl}>{follow.url}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Posts Section */}
      <motion.div 
        className={styles.profilePosts}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <h3 className={styles.sectionTitle}>
          Posts ({posts.length})
        </h3>
        
        {posts.length === 0 ? (
          <div className={styles.noPosts}>
            <div className={styles.noPostsIcon}>📝</div>
            <p>No posts yet</p>
            <small>This user hasn&apos;t posted anything yet.</small>
          </div>
        ) : (
          <div className={styles.postsList}>
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

      <AvatarModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        avatarUrl={getAvatarUrl(user)}
        userName={user.title || user.nick}
      />
    </motion.div>
  )
}

export default Profile