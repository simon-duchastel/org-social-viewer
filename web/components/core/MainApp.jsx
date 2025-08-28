'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchOrgSocial, fetchFollowedUsers } from '../../utils/apiClient'
import Header from '../ui/Header'
import Timeline from './Timeline'
import Profile from './Profile'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorMessage from '../ui/ErrorMessage'

/**
 * Group replies under their root parent posts and sort appropriately
 * - Parent posts are sorted by timestamp (newest first)
 * - Replies are grouped under their root parent posts (not immediate parents)
 * - Within each parent, replies are sorted chronologically (oldest first)
 */
function groupRepliesWithParents(posts) {
  const postMap = new Map()
  const rootPosts = []
  const replies = []
  
  // Create a map of all posts for quick lookup
  posts.forEach(post => {
    postMap.set(post.id, post)
  })
  
  // Function to find the root parent of a post
  const findRootParent = (post) => {
    if (!post.isReply || !post.replyTo) {
      return post // This is already a root post
    }
    
    const parent = postMap.get(post.replyTo)
    if (!parent) {
      return post // Parent not found, treat this as root
    }
    
    return findRootParent(parent) // Recursively find root
  }
  
  // Separate root posts and replies, and map each reply to its root parent
  const replyToRootMap = new Map()
  
  posts.forEach(post => {
    if (post.isReply && post.replyTo) {
      const rootParent = findRootParent(post)
      replyToRootMap.set(post.id, rootParent.id)
      replies.push(post)
    } else {
      rootPosts.push(post)
    }
  })
  
  // Sort root posts by timestamp (newest first)
  rootPosts.sort((a, b) => new Date(b.id) - new Date(a.id))
  
  // Group replies by their root parent ID
  const replyGroups = new Map()
  replies.forEach(reply => {
    const rootParentId = replyToRootMap.get(reply.id)
    if (!replyGroups.has(rootParentId)) {
      replyGroups.set(rootParentId, [])
    }
    replyGroups.get(rootParentId).push(reply)
  })
  
  // Sort replies within each group chronologically (oldest first)
  replyGroups.forEach(replyGroup => {
    replyGroup.sort((a, b) => new Date(a.id) - new Date(b.id))
  })
  
  // Build the final grouped list
  const groupedPosts = []
  
  rootPosts.forEach(rootPost => {
    groupedPosts.push(rootPost)
    
    // Add replies for this root post
    const rootReplies = replyGroups.get(rootPost.id)
    if (rootReplies) {
      groupedPosts.push(...rootReplies)
    }
  })
  
  // Handle orphaned replies (replies without a root parent in the current dataset)
  replies.forEach(reply => {
    const rootParentId = replyToRootMap.get(reply.id)
    if (!postMap.has(rootParentId)) {
      groupedPosts.push(reply)
    }
  })
  
  return groupedPosts
}

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
    if (!searchParams.get('view') && mainUser) {
      const params = new URLSearchParams(searchParams)
      params.set('view', 'timeline')
      params.set('user', mainUser.nick)
      router.push(`?${params.toString()}`)
    }
  }, [mainUser])

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
      
      // Don't interfere with normal back navigation - let the URL params handle the state
      // The components will re-render based on the new URL parameters automatically
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
      
      // Add main user's posts (filter out invalid dates)
      user.posts.forEach(post => {
        if (post.parsedDate) {
          posts.push({
            ...post,
            user: user,
            sourceUrl: url
          })
        }
      })
      
      // Add followed users' posts (filter out invalid dates)
      followed.forEach(followedUser => {
        followedUser.posts.forEach(post => {
          if (post.parsedDate) {
            posts.push({
              ...post,
              user: followedUser,
              sourceUrl: followedUser.sourceUrl
            })
          }
        })
      })
      
      // Group replies under their parent posts
      const groupedPosts = groupRepliesWithParents(posts)
      
      setAllPosts(groupedPosts)
      
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
    
    // Always use push to create proper browser history entries
    router.push(`?${params.toString()}`)
  }

  const handleBack = () => {
    // Let the browser handle back navigation naturally
    window.history.back()
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
              posts={selectedUser ? allPosts.filter(post => post.user.nick === selectedUser.nick) : allPosts}
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