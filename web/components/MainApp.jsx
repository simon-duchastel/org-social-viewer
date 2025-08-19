'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchOrgSocial, fetchFollowedUsers } from '../utils/apiClient'
import Header from './Header'
import Timeline from './Timeline'
import Profile from './Profile'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

function MainApp({ url, onBack }) {
  const [mainUser, setMainUser] = useState(null)
  const [followedUsers, setFollowedUsers] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [currentView, setCurrentView] = useState('timeline') // 'timeline' or 'profile'
  const [selectedUser, setSelectedUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadOrgSocial()
  }, [url])

  const loadOrgSocial = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Load main user
      const user = await fetchOrgSocial(url)
      setMainUser(user)
      
      // Load followed users
      const followed = await fetchFollowedUsers(user)
      setFollowedUsers(followed)
      
      // Combine all posts
      const posts = []
      
      // Add main user's posts
      user.posts.forEach(post => {
        posts.push({
          ...post,
          user: user,
          sourceUrl: url
        })
      })
      
      // Add followed users' posts
      followed.forEach(followedUser => {
        followedUser.posts.forEach(post => {
          posts.push({
            ...post,
            user: followedUser,
            sourceUrl: followedUser.sourceUrl
          })
        })
      })
      
      // Sort by timestamp (newest first)
      posts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      
      setAllPosts(posts)
      
    } catch (err) {
      console.error('Error loading org-social data:', err)
      setError(err.message || 'Failed to load org-social data')
    } finally {
      setLoading(false)
    }
  }

  const handleProfileClick = (user) => {
    setSelectedUser(user)
    setCurrentView('profile')
  }

  const handleBackToTimeline = () => {
    setCurrentView('timeline')
    setSelectedUser(null)
  }

  const handleRefresh = () => {
    loadOrgSocial()
  }

  if (loading) {
    return <LoadingSpinner message="Loading org-social feed..." />
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error}
        onRetry={handleRefresh}
        onBack={onBack}
      />
    )
  }

  return (
    <div className="main-app">
      <Header 
        user={mainUser}
        onBack={currentView === 'timeline' ? onBack : handleBackToTimeline}
        onRefresh={handleRefresh}
        title={currentView === 'profile' ? selectedUser?.nick : 'Timeline'}
        showBackButton={true}
      />
      
      <AnimatePresence mode="wait">
        {currentView === 'timeline' ? (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Timeline 
              posts={allPosts}
              users={[mainUser, ...followedUsers]}
              onProfileClick={handleProfileClick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <Profile 
              user={selectedUser}
              posts={allPosts.filter(post => post.user.nick === selectedUser?.nick)}
              onProfileClick={handleProfileClick}
              allUsers={[mainUser, ...followedUsers]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainApp