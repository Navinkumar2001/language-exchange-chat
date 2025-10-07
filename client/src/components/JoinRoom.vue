<template>
  <div class="join-container">
    <div class="join-form">
      <h1><span class="emoji">🌍</span><br /><span class="text">Language Exchange Chat</span></h1>
      <div v-if="!chatAction" class="action-selection">
        <button @click="chatAction = 'create'" class="action-btn">Create Chat</button>
        <button @click="chatAction = 'join'" class="action-btn">Join Chat</button>
      </div>
      
      <form v-else @submit.prevent="joinRoom">
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
        
        <div v-if="chatAction === 'create'">
          <select v-model="roomType" required>
            <option value="">Select Room Type</option>
            <option value="general">General</option>
            <option value="private">Private</option>
          </select>
          <div v-if="roomType === 'private'" class="private-room-fields">
            <div class="room-id-field">
              <div class="input-with-icon">
                <input 
                  v-model="uniqueRoomId" 
                  placeholder="Unique Room ID" 
                  readonly
                />
                <span v-if="uniqueRoomId" @click="copyRoomId" class="copy-icon" title="Copy Room ID">📋</span>
              </div>
              <button type="button" @click="generateRoomId" class="generate-btn">Generate</button>
            </div>
            <div class="password-field">
              <input 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'"
                placeholder="Room Password" 
                required
              />
              <span @click="showPassword = !showPassword" class="eye-icon">
                {{ showPassword ? '👁️' : '🙈' }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="chatAction === 'join'" class="join-room-fields">
          <input 
            v-model="joinRoomId" 
            placeholder="Enter Room ID" 
            required
          />
          <div class="password-field">
            <input 
              v-model="joinPassword" 
              :type="showJoinPassword ? 'text' : 'password'"
              placeholder="Room Password (if private)" 
            />
            <span @click="showJoinPassword = !showJoinPassword" class="eye-icon">
              {{ showJoinPassword ? '👁️' : '🙈' }}
            </span>
          </div>
        </div>
        
        <button type="submit">{{ chatAction === 'create' ? 'Create Chat' : 'Join Chat' }}</button>
        <button type="button" @click="goBack" class="back-btn">Back</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['join'])

const username = ref('')
const language = ref('')
const chatAction = ref('')
const roomType = ref('')
const uniqueRoomId = ref('')
const password = ref('')
const joinRoomId = ref('')
const joinPassword = ref('')
const showPassword = ref(false)
const showJoinPassword = ref(false)

const generateRoomId = () => {
  uniqueRoomId.value = Math.floor(100000 + Math.random() * 900000).toString()
}

const goBack = () => {
  chatAction.value = ''
}

const copyRoomId = async () => {
  try {
    await navigator.clipboard.writeText(uniqueRoomId.value)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const joinRoom = () => {
  if (!username.value || !language.value) return
  
  let roomData = {
    username: username.value,
    language: language.value
  }
  
  if (chatAction.value === 'create') {
    if (!roomType.value) return
    if (roomType.value === 'private' && (!uniqueRoomId.value || !password.value)) return
    
    roomData.roomId = roomType.value === 'private' ? uniqueRoomId.value : 'general'
    if (roomType.value === 'private') {
      roomData.password = password.value
    }
  } else {
    if (!joinRoomId.value) return
    roomData.roomId = joinRoomId.value
    if (joinPassword.value) {
      roomData.password = joinPassword.value
    }
  }
  
  emit('join', roomData)
}
</script>

<style scoped>
.join-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  animation: gradientShift 8s ease infinite;
}

@keyframes gradientShift {
  0%, 100% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  50% { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
}

.join-form {
  width: 100%;
  max-width: 500px;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.join-form h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
  font-size: 1.8rem;
  font-weight: 700;
  font-family: 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', system-ui, sans-serif;
  white-space: nowrap;
}

.join-form h1 .emoji {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.join-form h1 .text {
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.action-selection {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-btn {
  padding: 1.2rem 2rem;
  background: linear-gradient(135deg, #28a745, #20c997);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(40, 167, 69, 0.4);
}

form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

form input,
form select {
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

form input:focus,
form select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
}

form button[type="submit"] {
  padding: 1rem;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

form button[type="submit"]:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.4);
}

.back-btn {
  padding: 0.8rem 1.5rem;
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(108, 117, 125, 0.3);
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(108, 117, 125, 0.4);
}

.private-room-fields,
.join-room-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.room-id-field {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.input-with-icon {
  position: relative;
  flex: 1;
}

.input-with-icon input {
  width: 100%;
  padding-right: 3rem;
  margin: 0;
  background: white;
}

.copy-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 1.3rem;
  opacity: 0.6;
  transition: all 0.3s ease;
  padding: 0.2rem;
  border-radius: 4px;
}

.copy-icon:hover {
  opacity: 1;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-50%) scale(1.1);
}

.generate-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 123, 255, 0.3);
}

.generate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.4);
}

.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field input {
  width: 100%;
  padding-right: 3rem;
}

.eye-icon {
  position: absolute;
  right: 1rem;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.7;
  transition: all 0.3s ease;
  user-select: none;
}

.eye-icon:hover {
  opacity: 1;
  transform: scale(1.1);
}
</style>