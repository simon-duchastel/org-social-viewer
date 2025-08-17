<template>
  <article 
    class="post"
    :class="{ 
      'post-reply': post.isReply, 
      'post-poll': post.isPoll 
    }"
    @click="handlePostClick"
  >
    <div v-if="post.isReply" class="reply-indicator">
      <div class="reply-line"></div>
      <span class="reply-icon">↳</span>
      <span class="reply-text">Replying to post</span>
    </div>

    <div class="post-main">
      <div class="post-avatar" @click.stop="handleProfileClick">
        <img
          :src="getAvatarUrl(post.user)"
          :alt="`${post.user.nick}'s avatar`"
          class="avatar-img"
        />
      </div>

      <div class="post-content">
        <div class="post-header">
          <div class="post-user-info">
            <span class="post-display-name" @click.stop="handleProfileClick">
              {{ post.user.title || post.user.nick }}
            </span>
            <span class="post-username" @click.stop="handleProfileClick">
              @{{ post.user.nick }}
            </span>
            <span class="post-separator">·</span>
            <span 
              class="post-timestamp" 
              :title="formatFullDate(post.timestamp)"
            >
              {{ formatTimestamp(post.timestamp) }}
            </span>
          </div>

          <div 
            v-if="post.properties.LANG || post.properties.CLIENT" 
            class="post-metadata"
          >
            <span v-if="post.properties.LANG" class="post-lang">
              {{ post.properties.LANG }}
            </span>
            <span v-if="post.properties.CLIENT" class="post-client">
              via {{ post.properties.CLIENT }}
            </span>
          </div>
        </div>

        <div 
          v-if="post.properties.CONTENT_WARNING" 
          class="content-warning"
        >
          <span class="warning-icon">⚠️</span>
          <span>Content Warning: {{ post.properties.CONTENT_WARNING }}</span>
        </div>

        <div class="post-body">
          <div 
            v-if="post.displayContent?.includes('<')"
            class="post-content-html"
            v-html="post.displayContent"
          ></div>
          <div v-else class="post-content-text">
            {{ post.content }}
          </div>
        </div>

        <div 
          v-if="post.isPoll && post.checkboxes?.length" 
          class="poll-options"
        >
          <div 
            v-for="(option, index) in post.checkboxes" 
            :key="index"
            class="poll-option"
            :class="{ checked: option.checked }"
          >
            <span class="poll-checkbox">
              {{ option.checked ? '☑️' : '☐' }}
            </span>
            <span class="poll-text">{{ option.text }}</span>
          </div>
          <div v-if="post.properties.POLL_END" class="poll-end">
            Ends: {{ formatTimestamp(post.properties.POLL_END) }}
          </div>
        </div>

        <div 
          v-if="post.mentions?.length" 
          class="post-mentions"
        >
          <span 
            v-for="(mention, index) in post.mentions" 
            :key="index"
            class="mention"
            @click.stop="handleMentionClick(mention)"
          >
            @{{ mention.name }}
          </span>
        </div>

        <div v-if="post.properties.TAGS" class="post-tags">
          <span 
            v-for="tag in post.properties.TAGS.split(' ')" 
            :key="tag"
            class="tag"
          >
            #{{ tag }}
          </span>
        </div>

        <div v-if="post.properties.MOOD" class="post-mood">
          <span class="mood-icon">{{ post.properties.MOOD }}</span>
        </div>

        <div class="post-actions">
          <button class="action-btn reply-btn" @click.stop>
            <span class="action-icon">💬</span>
          </button>
          <button class="action-btn repost-btn" @click.stop>
            <span class="action-icon">🔄</span>
          </button>
          <button class="action-btn like-btn" @click.stop>
            <span class="action-icon">❤️</span>
          </button>
          <button 
            class="action-btn share-btn" 
            @click.stop="handleShare"
          >
            <span class="action-icon">📤</span>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { OrgSocialPost, OrgSocialUser, Mention } from '@org-social/parser'
import { parseOrgSocialTimestamp } from '@org-social/parser'

interface PostWithUser extends OrgSocialPost {
  user: OrgSocialUser
  sourceUrl: string
}

interface Props {
  post: PostWithUser
  allUsers: OrgSocialUser[]
}

interface Emits {
  (e: 'profile-click', user: OrgSocialUser): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function formatTimestamp(timestamp: string): string {
  try {
    let date: Date
    if (props.post.parsedDate) {
      date = new Date(props.post.parsedDate)
    } else {
      date = parseOrgSocialTimestamp(timestamp) || new Date(timestamp)
    }
    
    if (!date || isNaN(date.getTime())) {
      return 'invalid date'
    }
    
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
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

function formatFullDate(timestamp: string): string {
  try {
    const date = props.post.parsedDate 
      ? new Date(props.post.parsedDate)
      : parseOrgSocialTimestamp(timestamp) || new Date(timestamp)
    
    return date.toLocaleString()
  } catch (error) {
    return timestamp
  }
}

function getAvatarUrl(user: OrgSocialUser): string {
  return user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nick}`
}

function handleProfileClick() {
  emit('profile-click', props.post.user)
}

function handlePostClick() {
  console.log('Post clicked:', props.post)
}

function handleMentionClick(mention: Mention) {
  const mentionedUser = props.allUsers.find(user => 
    user.sourceUrl === mention.url || user.nick === mention.name
  )
  if (mentionedUser) {
    emit('profile-click', mentionedUser)
  }
}

function handleShare() {
  const url = `${props.post.sourceUrl}#${props.post.id}`
  navigator.clipboard.writeText(url)
}
</script>

<style scoped>
.post {
  border-bottom: 1px solid #e1e8ed;
  padding: 15px;
  cursor: pointer;
  transition: background-color 0.1s;
}

.post:hover {
  background-color: #f8f9fa;
}

.post-reply {
  border-left: 3px solid #1da1f2;
  padding-left: 12px;
}

.post-poll {
  background-color: #f0f8ff;
}

.reply-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #657786;
  font-size: 0.9rem;
}

.reply-line {
  width: 2px;
  height: 15px;
  background-color: #ccd6dd;
  margin-right: 10px;
}

.reply-icon {
  margin-right: 5px;
}

.post-main {
  display: flex;
  gap: 12px;
}

.post-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.avatar-img:hover {
  transform: scale(1.05);
}

.post-content {
  flex: 1;
  min-width: 0;
}

.post-header {
  margin-bottom: 8px;
}

.post-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.post-display-name {
  font-weight: bold;
  color: #14171a;
  cursor: pointer;
}

.post-display-name:hover {
  text-decoration: underline;
}

.post-username {
  color: #657786;
  cursor: pointer;
}

.post-username:hover {
  color: #1da1f2;
}

.post-separator {
  color: #657786;
}

.post-timestamp {
  color: #657786;
  cursor: help;
}

.post-metadata {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.post-lang,
.post-client {
  color: #657786;
  font-size: 0.85rem;
}

.content-warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #856404;
}

.post-body {
  margin-bottom: 12px;
  line-height: 1.5;
  word-wrap: break-word;
}

.post-content-html :deep(a) {
  color: #1da1f2;
  text-decoration: none;
}

.post-content-html :deep(a:hover) {
  text-decoration: underline;
}

.post-content-html :deep(.mention) {
  color: #1da1f2;
  cursor: pointer;
}

.post-content-html :deep(.mention:hover) {
  background-color: #1da1f2;
  color: white;
  padding: 2px 4px;
  border-radius: 3px;
}

.poll-options {
  background: #f7f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
}

.poll-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
}

.poll-option.checked {
  font-weight: 600;
}

.poll-checkbox {
  font-size: 1.2rem;
}

.poll-end {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e1e8ed;
  color: #657786;
  font-size: 0.9rem;
}

.post-mentions {
  margin-bottom: 8px;
}

.mention {
  display: inline-block;
  color: #1da1f2;
  margin-right: 8px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s;
}

.mention:hover {
  background-color: #1da1f2;
  color: white;
}

.post-tags {
  margin-bottom: 8px;
}

.tag {
  display: inline-block;
  color: #1da1f2;
  margin-right: 8px;
  font-size: 0.9rem;
}

.post-mood {
  margin-bottom: 8px;
}

.mood-icon {
  font-size: 1.2rem;
}

.post-actions {
  display: flex;
  gap: 20px;
  margin-top: 8px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.action-btn:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.action-icon {
  font-size: 1.1rem;
}

.reply-btn:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.repost-btn:hover {
  background-color: rgba(23, 191, 99, 0.1);
}

.like-btn:hover {
  background-color: rgba(224, 36, 94, 0.1);
}

.share-btn:hover {
  background-color: rgba(29, 161, 242, 0.1);
}
</style>