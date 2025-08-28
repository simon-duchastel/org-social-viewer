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
  console.log('🔍 Starting groupRepliesWithParents with', posts.length, 'posts')
  
  const postMap = new Map()
  const rootPosts = []
  const replies = []
  
  // Create a map of all posts for quick lookup
  posts.forEach(post => {
    postMap.set(post.id, post)
  })
  
  console.log('📊 Created postMap with', postMap.size, 'entries')
  
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
  
  console.log('🔄 Processing posts to separate root posts and replies...')
  posts.forEach(post => {
    if (post.isReply && post.replyTo) {
      const rootParent = findRootParent(post)
      replyToRootMap.set(post.id, rootParent.id)
      replies.push(post)
      
      // Debug the specific Andros reply
      if (post.content && post.content.includes('Nice work! I have added your repositories here')) {
        console.log('🎯 Found Andros reply during separation:', {
          id: post.id,
          replyTo: post.replyTo,
          rootParentId: rootParent.id,
          rootParentExists: postMap.has(rootParent.id)
        })
      }
    } else {
      rootPosts.push(post)
    }
  })
  
  console.log('📈 Separated into:', rootPosts.length, 'root posts and', replies.length, 'replies')
  
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
  
  console.log('🗂️ Grouped replies into', replyGroups.size, 'groups')
  
  // Sort replies within each group chronologically (oldest first)
  replyGroups.forEach(replyGroup => {
    replyGroup.sort((a, b) => new Date(a.id) - new Date(b.id))
  })
  
  // Build the final grouped list
  const groupedPosts = []
  const processedPosts = new Set()  // Track which posts we've already added
  
  rootPosts.forEach(rootPost => {
    groupedPosts.push(rootPost)
    processedPosts.add(rootPost.id)
    
    // Add replies for this root post
    const rootReplies = replyGroups.get(rootPost.id)
    if (rootReplies) {
      rootReplies.forEach(reply => {
        groupedPosts.push(reply)
        processedPosts.add(reply.id)
      })
    }
  })
  
  console.log('📝 After adding root posts and their replies, have', groupedPosts.length, 'posts')
  
  // Add any remaining posts that weren't processed yet
  // This handles cases where a reply's root parent was itself classified as a reply
  let remainingCount = 0
  posts.forEach(post => {
    if (!processedPosts.has(post.id)) {
      groupedPosts.push(post)
      remainingCount++
      
      // Debug the specific Andros reply if it's in remaining posts
      if (post.content && post.content.includes('Nice work! I have added your repositories here')) {
        console.log('🎯 Andros reply found in REMAINING posts:', {
          id: post.id,
          replyTo: post.replyTo,
          isReply: post.isReply
        })
      }
    }
  })
  
  console.log('👨‍👩‍👧‍👦 Added', orphanedCount, 'orphaned replies')
  console.log('✅ Final result:', groupedPosts.length, 'posts')
  
  // Final check for Andros reply
  const androsInFinal = groupedPosts.find(p => p.content && p.content.includes('Nice work! I have added your repositories here'))
  console.log('🎯 Andros reply in final result:', !!androsInFinal)
  
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
      console.log('All posts before grouping:', posts.length)
      
      // Look specifically for the Andros reply
      const androsReply = posts.find(p => p.content && p.content.includes('Nice work! I have added your repositories here'))
      console.log('Found Andros reply before grouping:', !!androsReply)
      if (androsReply) {
        console.log('Andros reply details:', { 
          id: androsReply.id, 
          isReply: androsReply.isReply, 
          replyTo: androsReply.replyTo, 
          content: androsReply.content?.slice(0, 100),
          user: androsReply.user?.nick
        })
      }
      
      const groupedPosts = groupRepliesWithParents(posts)
      
      console.log('Grouped posts after processing:', groupedPosts.length)
      
      // Check if Andros reply is still there after grouping
      const androsReplyAfter = groupedPosts.find(p => p.content && p.content.includes('Nice work! I have added your repositories here'))
      console.log('Found Andros reply after grouping:', !!androsReplyAfter)
      
      // Show which posts were lost
      const postIds = new Set(posts.map(p => p.id))
      const groupedIds = new Set(groupedPosts.map(p => p.id))
      const lostPosts = posts.filter(p => !groupedIds.has(p.id))
      console.log('Lost posts:', lostPosts.length)
      if (lostPosts.length > 0) {
        console.log('Lost post details:', lostPosts.map(p => ({ 
          id: p.id, 
          isReply: p.isReply, 
          replyTo: p.replyTo, 
          content: p.content?.slice(0, 50),
          user: p.user?.nick
        })))
      }
      
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