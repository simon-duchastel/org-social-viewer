<template>
  <div class="url-input-container">
    <div class="url-input-card">
      <div class="header">
        <h1 class="title">Org-Social Viewer</h1>
        <p class="subtitle">
          Load org-mode social media files from any URL
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="url-form">
        <div class="input-group">
          <input
            v-model="url"
            type="url"
            placeholder="https://example.com/social.org"
            class="url-input"
            :disabled="loading"
            required
          />
          <button 
            type="submit" 
            class="submit-btn"
            :disabled="loading || !url.trim()"
          >
            <span v-if="loading" class="loading-spinner"></span>
            <span v-else>Load</span>
          </button>
        </div>
        
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>

      <div class="examples">
        <p class="examples-title">Try these examples:</p>
        <div class="example-links">
          <button 
            v-for="example in examples" 
            :key="example.url"
            @click="loadExample(example.url)"
            class="example-btn"
            :disabled="loading"
          >
            {{ example.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useOrgSocialStore } from '@/stores/orgSocial'

const store = useOrgSocialStore()
const url = ref('')

const examples = [
  {
    label: 'Sample File',
    url: 'http://localhost:3001/api/test-file'
  }
]

const { loading, error } = store

async function handleSubmit() {
  if (!url.value.trim()) return
  
  try {
    await store.loadOrgSocial(url.value.trim())
    // Navigation will be handled by the parent component
  } catch (err) {
    console.error('Failed to load:', err)
  }
}

function loadExample(exampleUrl: string) {
  url.value = exampleUrl
  handleSubmit()
}
</script>

<style scoped>
.url-input-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.url-input-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1a202c;
  margin: 0 0 10px 0;
}

.subtitle {
  color: #718096;
  font-size: 1.1rem;
  margin: 0;
}

.url-form {
  margin-bottom: 30px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.url-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.url-input:focus {
  outline: none;
  border-color: #667eea;
}

.url-input:disabled {
  background-color: #f7fafc;
  cursor: not-allowed;
}

.submit-btn {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #5a67d8;
}

.submit-btn:disabled {
  background: #a0aec0;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  background: #fed7d7;
  color: #c53030;
  padding: 12px;
  border-radius: 6px;
  font-size: 0.9rem;
}

.examples {
  text-align: center;
}

.examples-title {
  color: #718096;
  font-size: 0.9rem;
  margin: 0 0 15px 0;
}

.example-links {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

.example-btn {
  padding: 8px 16px;
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.example-btn:hover:not(:disabled) {
  background: #edf2f7;
  border-color: #cbd5e0;
}

.example-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>