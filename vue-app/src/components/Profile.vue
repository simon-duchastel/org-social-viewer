<template>
  <div class="profile">
    <div v-if="!user" class="profile-error">
      <h3>User not found</h3>
      <p>The selected user could not be loaded.</p>
    </div>

    <div v-else class="profile-content">
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="profile-banner"></div>
        <div class="profile-info">
          <div class="avatar-container">
            <img
              :src="getAvatarUrl(user)"
              :alt="`${user.nick}'s avatar`"
              class="profile-avatar"
            />
          </div>
          
          <div class="profile-details">
            <h1 class="profile-name">{{ user.title || user.nick }}</h1>
            <p class="profile-username">@{{ user.nick }}</p>
            
            <p v-if="user.description" class="profile-bio">
              {{ user.description }}
            </p>
            
            <div class="profile-meta">
              <div v-if="user.contacts.length" class="profile-contacts">
                <span class="meta-icon">📧</span>
                <span v-for="contact in user.contacts" :key="contact" class="contact">
                  {{ contact }}
                </span>
              </div>
              
              <div v-if="user.links.length" class="profile-links">
                <span class="meta-icon">🔗</span>
                <a 
                  v-for="link in user.links" 
                  :key="link"
                  :href="link"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="profile-link"
                >
                  {{ formatLink(link) }}
                </a>
              </div>
              
              <div class="profile-stats">
                <span class="stat">
                  <strong>{{ posts.length }}</strong> posts
                </span>
                <span class="stat">
                  <strong>{{ user.follows.length }}</strong> following
                </span>
                <span v-if="joinDate" class="stat">
                  <span class="meta-icon">📅</span>
                  Joined {{ joinDate }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Following List -->
      <div v-if="user.follows.length" class="following-section">
        <h3 class="section-title">Following</h3>
        <div class="following-grid">
          <div 
            v-for="follow in user.follows" 
            :key="follow.url"
            class="follow-card"
            @click="handleFollowClick(follow)"
          >
            <div class="follow-avatar">
              <img
                :src="getFollowAvatar(follow)"
                :alt="`${follow.nick}'s avatar`"
              />
            </div>
            <span class="follow-nick">@{{ follow.nick }}</span>
          </div>
        </div>
      </div>

      <!-- Posts Section -->
      <div class="posts-section">
        <div class="posts-header">
          <h3 class="section-title">Posts</h3>
          <div class="post-filters">
            <button 
              :class="['filter-btn', { active: filter === 'all' }]"
              @click="filter = 'all'"
            >
              All ({{ posts.length }})
            </button>
            <button 
              :class="['filter-btn', { active: filter === 'posts' }]"
              @click="filter = 'posts'"
            >
              Posts ({{ regularPosts.length }})
            </button>
            <button 
              v-if="pollPosts.length"
              :class="['filter-btn', { active: filter === 'polls' }]"
              @click="filter = 'polls'"
            >
              Polls ({{ pollPosts.length }})
            </button>
          </div>
        </div>

        <div v-if="filteredPosts.length === 0" class="empty-posts">
          <p>No {{ filter === 'all' ? 'posts' : filter }} found.</p>
        </div>

        <TransitionGroup
          v-else
          name="post"
          tag="div"
          class="profile-posts"
        >
          <Post
            v-for="post in filteredPosts"
            :key="post.id || post.timestamp"
            :post="post"
            :all-users="allUsers"
            @profile-click="handleProfileClick"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Post from './Post.vue'
import type { OrgSocialUser, OrgSocialPost, FollowInfo } from '@org-social/parser'
import { parseOrgSocialTimestamp } from '@org-social/parser'

interface PostWithUser extends OrgSocialPost {
  user: OrgSocialUser
  sourceUrl: string
}

interface Props {
  user: OrgSocialUser | null
  posts: PostWithUser[]
  allUsers: OrgSocialUser[]
}

interface Emits {
  (e: 'profile-click', user: OrgSocialUser): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const filter = ref<'all' | 'posts' | 'polls'>('all')

const regularPosts = computed(() => 
  props.posts.filter(post => !post.isPoll)
)

const pollPosts = computed(() => 
  props.posts.filter(post => post.isPoll)
)

const filteredPosts = computed(() => {
  switch (filter.value) {
    case 'posts':
      return regularPosts.value
    case 'polls':
      return pollPosts.value
    default:
      return props.posts
  }
})

const joinDate = computed(() => {
  if (!props.user || !props.posts.length) return null
  
  const earliestPost = props.posts
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())[0]
  
  if (earliestPost) {
    const date = parseOrgSocialTimestamp(earliestPost.timestamp) || new Date(earliestPost.timestamp)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    })
  }
  
  return null
})

function getAvatarUrl(user: OrgSocialUser): string {
  return user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nick}`
}

function getFollowAvatar(follow: FollowInfo): string {
  const followedUser = props.allUsers.find(u => u.nick === follow.nick)
  return followedUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${follow.nick}`
}

function formatLink(link: string): string {
  try {
    const url = new URL(link)
    return url.hostname
  } catch {
    return link
  }
}

function handleProfileClick(user: OrgSocialUser) {
  emit('profile-click', user)
}

function handleFollowClick(follow: FollowInfo) {
  const followedUser = props.allUsers.find(u => u.nick === follow.nick)
  if (followedUser) {
    emit('profile-click', followedUser)
  }
}
</script>

<style scoped>
.profile {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-error {
  padding: 40px 20px;
  text-align: center;
  color: #657786;
}

.profile-header {
  position: relative;
}

.profile-banner {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-info {
  position: relative;
  padding: 0 20px 20px;
}

.avatar-container {
  position: absolute;
  top: -50px;
  left: 20px;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.profile-details {
  margin-top: 60px;
}

.profile-name {
  margin: 0 0 5px 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #14171a;
}

.profile-username {
  margin: 0 0 15px 0;
  color: #657786;
  font-size: 1.1rem;
}

.profile-bio {
  margin: 0 0 15px 0;
  line-height: 1.5;
  color: #14171a;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.profile-contacts,
.profile-links {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-icon {
  font-size: 0.9rem;
}

.contact {
  color: #657786;
  font-size: 0.9rem;
}

.profile-link {
  color: #1da1f2;
  text-decoration: none;
  font-size: 0.9rem;
}

.profile-link:hover {
  text-decoration: underline;
}

.profile-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat {
  color: #657786;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat strong {
  color: #14171a;
}

.following-section,
.posts-section {
  border-top: 1px solid #e1e8ed;
  padding: 20px;
}

.section-title {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #14171a;
}

.following-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.follow-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.follow-card:hover {
  border-color: #1da1f2;
  box-shadow: 0 2px 8px rgba(29, 161, 242, 0.1);
}

.follow-avatar {
  margin-bottom: 8px;
}

.follow-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.follow-nick {
  font-size: 0.9rem;
  color: #14171a;
  text-align: center;
}

.posts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.post-filters {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #e1e8ed;
  background: white;
  border-radius: 20px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: #1da1f2;
}

.filter-btn.active {
  background: #1da1f2;
  color: white;
  border-color: #1da1f2;
}

.empty-posts {
  text-align: center;
  padding: 40px 20px;
  color: #657786;
}

.profile-posts {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  overflow: hidden;
}

/* Post transitions */
.post-enter-active,
.post-leave-active {
  transition: all 0.3s ease;
}

.post-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.post-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.post-move {
  transition: transform 0.3s ease;
}
</style>