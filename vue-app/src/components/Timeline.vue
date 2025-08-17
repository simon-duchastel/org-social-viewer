<template>
  <div class="timeline">
    <div class="timeline-header">
      <h2 class="timeline-title">Timeline</h2>
      <p class="timeline-subtitle">
        {{ posts.length }} posts from {{ users.length }} users
      </p>
    </div>

    <div v-if="posts.length === 0" class="empty-state">
      <div class="empty-icon">📭</div>
      <h3>No posts found</h3>
      <p>This org-social file doesn't contain any posts yet.</p>
    </div>

    <TransitionGroup
      v-else
      name="post"
      tag="div"
      class="posts-container"
    >
      <Post
        v-for="post in posts"
        :key="post.id || post.timestamp"
        :post="post"
        :all-users="users"
        @profile-click="handleProfileClick"
      />
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import Post from './Post.vue'
import type { OrgSocialUser, OrgSocialPost } from '@org-social/parser'

interface PostWithUser extends OrgSocialPost {
  user: OrgSocialUser
  sourceUrl: string
}

interface Props {
  posts: PostWithUser[]
  users: OrgSocialUser[]
}

interface Emits {
  (e: 'profile-click', user: OrgSocialUser): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function handleProfileClick(user: OrgSocialUser) {
  emit('profile-click', user)
}
</script>

<style scoped>
.timeline {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.timeline-header {
  padding: 20px;
  border-bottom: 1px solid #e1e8ed;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.timeline-title {
  margin: 0 0 5px 0;
  font-size: 1.5rem;
  font-weight: bold;
}

.timeline-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #657786;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #14171a;
}

.empty-state p {
  margin: 0;
  font-size: 0.9rem;
}

.posts-container {
  min-height: 200px;
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