<template>
  <v-app>
    <v-main class="chat-container" @mousemove="createSpark">
    <v-app-bar color="gradient-primary" elevation="4" class="chat-header">
      <template v-slot:prepend>
        <v-icon color="white" size="28">mdi-forum</v-icon>
      </template>
      
      <v-app-bar-title class="text-white font-weight-bold">
        🌍 {{ roomData.roomId || 'general' }}
      </v-app-bar-title>
      
      <template v-slot:append>
        <div class="d-flex align-center ga-3">
          <v-avatar size="40" class="user-avatar">
            <span class="text-h6 font-weight-bold">{{ getCurrentUser()?.name?.[0]?.toUpperCase() || 'U' }}</span>
            <!-- <v-badge :content="getFlag(getCurrentUser()?.language || 'en')" location="bottom right" /> -->
          </v-avatar>
          
          <span class="text-white font-weight-medium d-none d-sm-inline">{{ getCurrentUser()?.name || 'User' }}</span>
          
          <v-btn @click="leaveRoom" color="red" variant="elevated" size="small">
            <v-icon start>mdi-logout</v-icon>
            Leave
          </v-btn>
        </div>
      </template>
    </v-app-bar>
    
    <v-card class="participants-bar" elevation="2" rounded="0">
      <v-card-text class="py-2">
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-chip 
            v-for="user in participants" 
            :key="user.id" 
            :color="user.id === userId ? 'primary' : 'secondary'"
            :variant="user.id === userId ? 'flat' : 'outlined'"
            :clickable="user.id !== userId"
            @click="user.id !== userId && togglePrivateChat(user)"
            size="small"
            class="participant-chip"
          >
            <template v-slot:prepend>
              <span class="text-body-2">{{ getFlag(user.language) }}</span>
            </template>
            {{ user.name }}
            <template v-slot:append v-if="user.id !== userId">
              <v-icon size="16" color="blue">mdi-chat</v-icon>
              <v-btn @click.stop="initiateCall(user, false)" icon size="x-small" variant="text">
                <v-icon size="16" color="green">mdi-phone</v-icon>
              </v-btn>
              <v-btn @click.stop="initiateCall(user, true)" icon size="x-small" variant="text">
                <v-icon size="16" color="blue">mdi-video</v-icon>
              </v-btn>
            </template>
          </v-chip>
        </div>
      </v-card-text>
    </v-card>

    <v-alert 
      v-if="privateChat.active" 
      type="info" 
      variant="tonal"
      color="pink"
      class="private-chat-banner ma-2"
      rounded="lg"
      closable
      @click:close="closePrivateChat"
    >
      <template v-slot:prepend>
        <v-icon>mdi-lock</v-icon>
      </template>
      🔒 Private chat with {{ privateChat.user.name }} {{ getFlag(privateChat.user.language) }}
    </v-alert>

    <div class="messages-container" ref="messagesContainer">
      <div 
        v-for="message in filteredMessages" 
        :key="message.id"
        :class="['message', { 
          'own': message.senderId === userId,
          'private': message.isPrivate,
          'translating': translatingMessages.has(message.id)
        }]"
        ref="messageElements"
      >
        <div class="message-wrapper">
          <div class="profile-icon">
            <span class="name-initial">{{ getSenderName(message)[0].toUpperCase() }}</span>
          </div>
          <div class="message-content">
            <v-menu v-if="message.senderId === userId" location="bottom end">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon size="small" variant="text" class="message-menu">
                  <v-icon size="small">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list density="compact">
                <v-list-item @click="startEdit(message)">
                  <template v-slot:prepend>
                    <v-icon size="small">mdi-pencil</v-icon>
                  </template>
                  <v-list-item-title>Edit</v-list-item-title>
                </v-list-item>
                <v-list-item @click="deleteMessage(message)">
                  <template v-slot:prepend>
                    <v-icon size="small" color="red">mdi-delete</v-icon>
                  </template>
                  <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
            <div class="message-header" v-if="message.isPrivate">
              <span class="private-label">🔒 Private</span>
            </div>
            <div class="original" v-if="!editingMessage || editingMessage.id !== message.id">{{ message.original.text }}</div>
            <v-text-field 
              v-if="editingMessage && editingMessage.id === message.id"
              v-model="editText"
              @keyup.enter="saveEdit(message)"
              @keyup.escape="cancelEdit"
              variant="outlined"
              density="compact"
              hide-details
              autofocus
            ></v-text-field>
            <div v-if="message.senderId !== userId" class="translation-controls">
              <v-btn @click="translateMessage(message)" size="small" variant="outlined">
                <v-icon start size="small">mdi-translate</v-icon>
                Translate
              </v-btn>
            </div>
            <div v-if="customTranslations[message.id]" class="custom-translation" :data-message-id="message.id">
              {{ customTranslations[message.id] }}
              <v-btn @click="speakText(customTranslations[message.id], participants.find(p => p.id === userId)?.language)" icon size="x-small" variant="text">
                <v-icon size="small">mdi-volume-high</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
        <div class="timestamp">{{ formatTime(message.timestamp) }}</div>
      </div>
      
      <div v-if="typingUsers.length" class="typing-indicator">
        {{ typingUsers.join(', ') }} {{ typingUsers.length === 1 ? 'is' : 'are' }} typing
        <span class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </div>
    </div>

    <v-card class="input-container" elevation="8" rounded="xl">
      <v-card-text class="pa-2">
        <div class="d-flex align-center ga-3">
          <v-btn 
            @mousedown="startRecording" 
            @mouseup="stopRecording"
            :color="isRecording ? 'deep-orange' : 'blue-grey'"
            icon
            variant="flat"
            size="large"
            class="mic-button"
          >
            <v-icon size="24">{{ isRecording ? 'mdi-microphone' : 'mdi-microphone-outline' }}</v-icon>
          </v-btn>
          
          <v-menu v-model="showEmojiPicker" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props"
                icon
                variant="flat"
                size="large"
                color="amber"
                class="emoji-button"
              >
                <v-icon size="24">mdi-emoticon-happy</v-icon>
              </v-btn>
            </template>
            <v-card class="emoji-picker" width="300">
              <v-card-text class="pa-2">
                <div class="emoji-grid">
                  <span 
                    v-for="emoji in emojis" 
                    :key="emoji"
                    @click="addEmoji(emoji)"
                    class="emoji-item"
                  >
                    {{ emoji }}
                  </span>
                </div>
              </v-card-text>
            </v-card>
          </v-menu>
          
          <v-text-field 
            v-model="messageText"
            @keyup.enter="sendMessage"
            @input="handleTyping"
            :placeholder="privateChat.active ? `🔒 Private message to ${privateChat.user.name}...` : '💬 Type your message...'"
            variant="solo"
            density="comfortable"
            hide-details
            rounded="xl"
            class="message-input"
            :color="privateChat.active ? 'pink' : 'blue'"
          >
            <template v-slot:prepend-inner>
              <v-icon v-if="privateChat.active" color="pink">mdi-lock</v-icon>
              <v-icon v-else color="blue">mdi-chat</v-icon>
            </template>
          </v-text-field>
          
          <v-btn 
            @click="sendMessage" 
            :color="privateChat.active ? 'pink' : 'blue'" 
            variant="flat"
            size="large"
            icon
            class="send-button"
            :disabled="!messageText.trim()"
          >
            <v-icon size="24">mdi-send</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
    
    <!-- Call Controls Component -->
    <CallControls 
      :is-incoming-call="isIncomingCall"
      :is-outgoing-call="isOutgoingCall"
      :is-call-active="isCallActive"
      :other-user-name="otherUserName"
      :current-user-name="currentUserName"
      :local-stream="localStream"
      :remote-stream="remoteStream"
      :is-video-call="isVideoCall"
      @answer-call="(isVideo) => answerCall(isVideo)"
      @reject-call="rejectCall"
      @end-call="endCall"
    />
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick, watch, computed } from 'vue'
import { useSocket } from '../composables/useSocket'
import { useSpeech } from '../composables/useSpeech'
import { useAnimations } from '../composables/useAnimations'
import { useWebRTC } from '../composables/useWebRTC'
import CallControls from './CallControls.vue'
import { gsap } from 'gsap'

const props = defineProps(['roomData', 'userId'])
const { socket } = useSocket()
const { startRecording, stopRecording, isRecording, transcript } = useSpeech()
const { animateMessageIn, animatePrivateChatBanner, animateTranslationAppear, createRippleEffect, animateMessageSend } = useAnimations()
const webRTC = useWebRTC(socket)
const { 
  localStream, 
  remoteStream, 
  isCallActive, 
  isIncomingCall, 
  isOutgoingCall,
  callerId, 
  otherUserName, 
  isVideoCall,
  startCall, 
  answerCall, 
  endCall, 
  rejectCall 
} = webRTC

const currentUserName = computed(() => getCurrentUser()?.name || 'User')

const messages = ref([])
const participants = ref(props.roomData?.participants || [])
const messageText = ref('')
const messagesContainer = ref(null)
const messageElements = ref([])
const typingUsers = ref([])
const typingTimeout = ref(null)
const privateChat = ref({ active: false, user: null })
const customTranslations = ref({})
const translatingMessages = ref(new Set())
const showEmojiPicker = ref(false)
const editingMessage = ref(null)
const editText = ref('')

const emojis = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
  '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
  '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
  '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
  '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
  '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
  '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
  '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
  '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
  '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
  '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
  '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
  '✨', '🌟', '💫', '⭐', '🌠', '☄️', '💥', '🔥', '🌈', '☀️'
]

const languageFlags = {
  en: '🇺🇸', es: '🇪🇸', fr: '🇫🇷', 
  de: '🇩🇪', zh: '🇨🇳', ja: '🇯🇵'
}

const getFlag = (lang) => languageFlags[lang] || '🌍'

const getSenderLanguage = (message) => {
  const sender = participants.value.find(p => p.id === message.senderId)
  return sender?.language || 'en'
}

const getSenderName = (message) => {
  const sender = participants.value.find(p => p.id === message.senderId)
  return sender?.name || 'U'
}

const getCurrentUser = () => {
  return participants.value.find(p => p.id === props.userId)
}

const getTranslation = (message) => {
  return message.translations[props.userId] || null
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const sendMessage = () => {
  if (!messageText.value.trim()) return
  
  // Animate send action
  const inputEl = document.querySelector('.message-input')
  if (inputEl) animateMessageSend(inputEl)
  
  const userLang = participants.value.find(p => p.id === props.userId)?.language || 'en'
  const currentRoomId = props.roomData?.roomId || 'general'
  
  socket.emit('new_message', {
    roomId: currentRoomId,
    text: messageText.value,
    lang: userLang,
    isPrivate: privateChat.value.active,
    targetUserId: privateChat.value.user?.id
  })
  
  messageText.value = ''
}

const togglePrivateChat = (user) => {
  if (privateChat.value.active && privateChat.value.user.id === user.id) {
    closePrivateChat()
  } else {
    privateChat.value = { active: true, user }
    
    // Animate private chat activation
    nextTick(() => {
      const banner = document.querySelector('.private-chat-banner')
      if (banner) animatePrivateChatBanner(banner)
    })
  }
}

const closePrivateChat = () => {
  gsap.to('.private-chat-banner', {
    height: 0,
    opacity: 0,
    duration: 0.3,
    onComplete: () => {
      privateChat.value = { active: false, user: null }
    }
  })
}

const translateMessage = (message) => {
  const userLang = participants.value.find(p => p.id === props.userId)?.language || 'en'
  console.log(`Requesting translation for message ${message.id} to ${userLang}`)
  translatingMessages.value.add(message.id)
  
  socket.emit('translate_message', {
    messageId: message.id,
    targetLang: userLang
  })
}

const filteredMessages = computed(() => {
  if (privateChat.value.active) {
    return messages.value.filter(msg => 
      msg.isPrivate && 
      (msg.senderId === props.userId || msg.targetUserId === props.userId) &&
      (msg.senderId === privateChat.value.user.id || msg.targetUserId === privateChat.value.user.id)
    )
  }
  return messages.value.filter(msg => !msg.isPrivate)
})

const handleTyping = () => {
  const currentRoomId = props.roomData?.roomId || 'general'
  
  socket.emit('typing', { 
    roomId: currentRoomId, 
    isTyping: true 
  })
  
  clearTimeout(typingTimeout.value)
  typingTimeout.value = setTimeout(() => {
    socket.emit('typing', { 
      roomId: currentRoomId, 
      isTyping: false 
    })
  }, 1000)
}

const speakText = (text, lang = null) => {
  const utterance = new SpeechSynthesisUtterance(text)
  if (lang) {
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'ja' ? 'ja-JP' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : lang === 'de' ? 'de-DE' : lang === 'zh' ? 'zh-CN' : 'en-US'
  }
  speechSynthesis.speak(utterance)
}

const leaveRoom = () => {
  socket.disconnect()
  window.location.reload()
}

const addEmoji = (emoji) => {
  messageText.value += emoji
  showEmojiPicker.value = false
}

const initiateCall = (user, isVideo = false) => {
  startCall(user.id, user.name, isVideo)
}

const startEdit = (message) => {
  editingMessage.value = message
  editText.value = message.original.text
}

const saveEdit = (message) => {
  if (!editText.value.trim()) return
  
  socket.emit('edit_message', {
    messageId: message.id,
    newText: editText.value
  })
  
  editingMessage.value = null
  editText.value = ''
}

const cancelEdit = () => {
  editingMessage.value = null
  editText.value = ''
}

const deleteMessage = (message) => {
  socket.emit('delete_message', {
    messageId: message.id
  })
}

const createSpark = (event) => {
  if (Math.random() > 0.7) { // Reduce frequency
    const spark = document.createElement('div')
    spark.className = 'spark'
    spark.style.left = event.clientX + 'px'
    spark.style.top = event.clientY + 'px'
    document.body.appendChild(spark)
    
    // Add ripple effect on click
    createRippleEffect(event.target, event.offsetX, event.offsetY)
    
    setTimeout(() => {
      spark.remove()
    }, 800)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Socket event listeners
socket.on('message_received', (message) => {
  messages.value.push(message)
  
  nextTick(() => {
    const newMessage = messageElements.value[messageElements.value.length - 1]
    if (newMessage) {
      // Enhanced animation based on message type
      animateMessageIn(newMessage, message.isPrivate)
    }
    scrollToBottom()
  })
})

socket.on('message_translated', ({ messageId, translation }) => {
  console.log(`Received translation for ${messageId}: "${translation}"`)
  customTranslations.value[messageId] = translation
  translatingMessages.value.delete(messageId)
  
  // Animate translation appearance
  nextTick(() => {
    const translationEl = document.querySelector(`[data-message-id="${messageId}"] .custom-translation`)
    if (translationEl) animateTranslationAppear(translationEl)
  })
})

socket.on('user_joined', (user) => {
  participants.value.push(user)
})

socket.on('user_left', ({ userId }) => {
  participants.value = participants.value.filter(p => p.id !== userId)
})

socket.on('user_typing', ({ userId, isTyping }) => {
  const user = participants.value.find(p => p.id === userId)
  if (!user) return
  
  if (isTyping) {
    if (!typingUsers.value.includes(user.name)) {
      typingUsers.value.push(user.name)
    }
  } else {
    typingUsers.value = typingUsers.value.filter(name => name !== user.name)
  }
})

socket.on('message_edited', ({ messageId, newText }) => {
  const messageIndex = messages.value.findIndex(m => m.id === messageId)
  if (messageIndex !== -1) {
    messages.value[messageIndex].original.text = newText
  }
})

socket.on('message_deleted', ({ messageId }) => {
  messages.value = messages.value.filter(m => m.id !== messageId)
})

// Watch for speech transcript
watch(transcript, (newTranscript) => {
  if (newTranscript) {
    messageText.value = newTranscript
  }
})

onMounted(() => {
  if (props.roomData?.messages) {
    messages.value = props.roomData.messages
  }
  scrollToBottom()
})
</script>

<style scoped>
.message {
  position: relative;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}

.message-content {
  position: relative;
}

.message-menu {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 10;
}
</style>