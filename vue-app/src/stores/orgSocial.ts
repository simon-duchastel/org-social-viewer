import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  fetchOrgSocial, 
  fetchFollowedUsers, 
  type OrgSocialUser, 
  type OrgSocialPost 
} from '@org-social/parser'

export const useOrgSocialStore = defineStore('orgSocial', () => {
  // State
  const mainUser = ref<OrgSocialUser | null>(null)
  const followedUsers = ref<OrgSocialUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentUrl = ref<string>('')

  // Computed
  const allUsers = computed(() => {
    return mainUser.value ? [mainUser.value, ...followedUsers.value] : []
  })

  const allPosts = computed(() => {
    const posts: (OrgSocialPost & { user: OrgSocialUser; sourceUrl: string })[] = []
    
    // Add main user's posts
    if (mainUser.value) {
      mainUser.value.posts.forEach(post => {
        posts.push({
          ...post,
          user: mainUser.value!,
          sourceUrl: currentUrl.value
        })
      })
    }
    
    // Add followed users' posts
    followedUsers.value.forEach(followedUser => {
      followedUser.posts.forEach(post => {
        posts.push({
          ...post,
          user: followedUser,
          sourceUrl: followedUser.sourceUrl
        })
      })
    })
    
    // Sort by timestamp (newest first)
    posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return posts
  })

  const polls = computed(() => {
    return allPosts.value.filter(post => post.isPoll)
  })

  // Actions
  async function loadOrgSocial(url: string) {
    loading.value = true
    error.value = null
    currentUrl.value = url
    
    try {
      // Load main user
      const result = await fetchOrgSocial(url)
      mainUser.value = result.user
      
      // Load followed users
      const followed = await fetchFollowedUsers(result.user)
      followedUsers.value = followed
      
    } catch (err) {
      console.error('Error loading org-social data:', err)
      error.value = err instanceof Error ? err.message : 'Failed to load org-social data'
    } finally {
      loading.value = false
    }
  }

  function reset() {
    mainUser.value = null
    followedUsers.value = []
    error.value = null
    currentUrl.value = ''
  }

  return {
    // State
    mainUser,
    followedUsers,
    loading,
    error,
    currentUrl,
    
    // Computed
    allUsers,
    allPosts,
    polls,
    
    // Actions
    loadOrgSocial,
    reset
  }
})