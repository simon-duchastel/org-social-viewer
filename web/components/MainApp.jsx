'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchOrgSocial, fetchFollowedUsers } from '../utils/apiClient'
import Header from './Header'
import Timeline from './Timeline'
import Profile from './Profile'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

function MainApp({ url, onBack }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mainUser, setMainUser] = useState(null)
  const [followedUsers, setFollowedUsers] = useState([])
  const [allPosts, setAllPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get current view and selected user from URL params
  const currentView = searchParams.get('view') || 'timeline'
  const selectedUserNick = searchParams.get('user')
  
  // Find the selected user object based on the URL parameter
  const selectedUser = selectedUserNick 
    ? [mainUser, ...followedUsers].find(user => user?.nick === selectedUserNick)
    : null

  useEffect(() => {
    loadOrgSocial()
  }, [url])

  // Set initial URL state when entering the app
  useEffect(() => {
    if (!searchParams.get('view')) {
      const params = new URLSearchParams(searchParams)
      params.set('view', 'timeline')
      router.push(`?${params.toString()}`)
    }
  }, [])

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      // Check the current URL state
      const currentUrl = new URL(window.location)
      const urlParam = currentUrl.searchParams.get('url')
      const viewParam = currentUrl.searchParams.get('view')
      
      // If there's no URL param, we should go back to URL input
      if (!urlParam) {
        onBack()
        return
      }
      
      // If we're on the timeline view and user pressed back, go to URL input
      if (viewParam === 'timeline' && event.state?.fromTimeline) {
        onBack()
        return
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [onBack])


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
    const params = new URLSearchParams(searchParams)
    params.set('view', 'profile')
    params.set('user', user.nick)
    router.push(`?${params.toString()}`)
  }

  const handleBack = () => {
    if (currentView === 'profile') {
      // From profile, go back to timeline
      const params = new URLSearchParams(searchParams)
      params.set('view', 'timeline')
      params.delete('user')
      router.push(`?${params.toString()}`)
    } else {
      // From timeline, go back to URL input
      onBack()
    }
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
        onBack={handleBack}
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