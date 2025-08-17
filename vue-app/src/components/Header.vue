<template>
  <header class="app-header">
    <div class="header-content">
      <div class="header-left">
        <button 
          class="back-btn"
          @click="handleBack"
          :title="title === 'Timeline' ? 'New Feed' : 'Back to Timeline'"
        >
          <span class="back-icon">{{ title === 'Timeline' ? '🏠' : '←' }}</span>
        </button>
        
        <div class="header-title">
          <h1>{{ title }}</h1>
          <p v-if="user" class="header-subtitle">
            @{{ user.nick }}
          </p>
        </div>
      </div>

      <div class="header-right">
        <button 
          class="refresh-btn"
          @click="handleRefresh"
          title="Refresh Feed"
        >
          <span class="refresh-icon">🔄</span>
        </button>
        
        <div class="user-avatar">
          <img
            :src="getAvatarUrl(user)"
            :alt="`${user.nick}'s avatar`"
            class="avatar-img"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { OrgSocialUser } from '@org-social/parser'

interface Props {
  user: OrgSocialUser
  title: string
}

interface Emits {
  (e: 'back'): void
  (e: 'refresh'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function getAvatarUrl(user: OrgSocialUser): string {
  return user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nick}`
}

function handleBack() {
  emit('back')
}

function handleRefresh() {
  emit('refresh')
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid #e1e8ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 600px;
  margin: 0 auto;
  padding: 12px 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.back-btn:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.back-icon {
  font-size: 1.2rem;
}

.header-title {
  min-width: 0;
  flex: 1;
}

.header-title h1 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #14171a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-subtitle {
  margin: 0;
  font-size: 0.8rem;
  color: #657786;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.refresh-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
}

.refresh-btn:hover {
  background-color: rgba(29, 161, 242, 0.1);
}

.refresh-btn:active .refresh-icon {
  transform: rotate(180deg);
}

.refresh-icon {
  font-size: 1.1rem;
  transition: transform 0.3s ease;
}

.user-avatar {
  flex-shrink: 0;
}

.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #e1e8ed;
}
</style>