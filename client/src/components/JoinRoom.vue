<template>
  <div class="join-container">
    <div class="join-form">
      <h1>🌍 Language Exchange Chat</h1>
      <form @submit.prevent="joinRoom">
        <input 
          v-model="username" 
          placeholder="Enter your name" 
          required 
        />
        <select v-model="language" required>
          <option value="">Select Language</option>
          <option value="en">🇺🇸 English</option>
          <option value="es">🇪🇸 Spanish</option>
          <option value="fr">🇫🇷 French</option>
          <option value="de">🇩🇪 German</option>
          <option value="zh">🇨🇳 Chinese</option>
          <option value="ja">🇯🇵 Japanese</option>
        </select>
        <input 
          v-model="roomId" 
          placeholder="Room ID (optional)" 
        />
        <button type="submit">Join Chat</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['join'])

const username = ref('')
const language = ref('')
const roomId = ref('general')

const joinRoom = () => {
  if (!username.value || !language.value) return
  
  emit('join', {
    roomId: roomId.value || 'general',
    username: username.value,
    language: language.value
  })
}
</script>