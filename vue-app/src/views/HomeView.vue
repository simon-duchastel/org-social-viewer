<template>
  <div class="home">
    <Transition name="page" mode="out-in">
      <!-- URL Input View -->
      <URLInput 
        v-if="!store.mainUser && !store.loading" 
        key="input"
      />
      
      <!-- Loading View -->
      <div v-else-if="store.loading" key="loading" class="loading-view">
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <h3>Loading org-social feed...</h3>
          <p>Parsing content and fetching followed users</p>
        </div>
      </div>
      
      <!-- Error View -->
      <div v-else-if="store.error" key="error" class="error-view">
        <div class="error-container">
          <div class="error-icon">❌</div>
          <h3>Failed to load org-social feed</h3>
          <p class="error-message">{{ store.error }}</p>
          <div class="error-actions">
            <button @click="handleRetry" class="retry-btn">
              Try Again
            </button>
            <button @click="handleBack" class="back-btn">
              Go Back
            </button>
          </div>
        </div>
      </div>
      
      <!-- Main Application View -->
      <div v-else-if="store.mainUser" key="app" class="main-app">
        <Header 
          :user="store.mainUser"
          :title="currentView === 'profile' ? selectedUser?.nick : 'Timeline'"
          @back="handleBack"
          @refresh="handleRefresh"
        />
        
        <Transition name="view" mode="out-in">
          <!-- Timeline View -->
          <Timeline
            v-if="currentView === 'timeline'"
            key="timeline"
            :posts="store.allPosts"
            :users="store.allUsers"
            @profile-click="handleProfileClick"
          />
          
          <!-- Profile View -->
          <Profile
            v-else-if="currentView === 'profile'"
            key="profile"
            :user="selectedUser"
            :posts="userPosts"
            :all-users="store.allUsers"
            @profile-click="handleProfileClick"
          />
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useOrgSocialStore } from '@/stores/orgSocial'
import URLInput from '@/components/URLInput.vue'
import Timeline from '@/components/Timeline.vue'
import Profile from '@/components/Profile.vue'
import Header from '@/components/Header.vue'
import type { OrgSocialUser } from '@org-social/parser'

const store = useOrgSocialStore()

const currentView = ref<'timeline' | 'profile'>('timeline')
const selectedUser = ref<OrgSocialUser | null>(null)

const userPosts = computed(() => {
  if (!selectedUser.value) return []
  return store.allPosts.filter(post => post.user.nick === selectedUser.value?.nick)
})

function handleProfileClick(user: OrgSocialUser) {
  selectedUser.value = user
  currentView.value = 'profile'
}

function handleBack() {
  if (currentView.value === 'profile') {
    currentView.value = 'timeline'
    selectedUser.value = null
  } else {
    store.reset()
  }
}

function handleRefresh() {
  if (store.currentUrl) {
    store.loadOrgSocial(store.currentUrl)
  }
}

function handleRetry() {
  if (store.currentUrl) {
    store.loadOrgSocial(store.currentUrl)
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #f5f8fa;
}

.loading-view,
.error-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.loading-container,
.error-container {
  background: white;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container h3,
.error-container h3 {
  margin: 0 0 10px 0;
  color: #1a202c;
  font-size: 1.5rem;
}

.loading-container p,
.error-container p {
  margin: 0 0 20px 0;
  color: #718096;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 0.9rem;
}

.error-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.retry-btn,
.back-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-btn {
  background: #667eea;
  color: white;
}

.retry-btn:hover {
  background: #5a67d8;
}

.back-btn {
  background: #e2e8f0;
  color: #4a5568;
}

.back-btn:hover {
  background: #cbd5e0;
}

.main-app {
  min-height: 100vh;
  padding: 20px;
}

/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* View transitions */
.view-enter-active,
.view-leave-active {
  transition: all 0.3s ease;
}

.view-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.view-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>
