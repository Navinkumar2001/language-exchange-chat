<template>
  <div class="call-controls">
    <!-- Incoming Call Modal -->
    <v-dialog :model-value="isIncomingCall" persistent max-width="400">
      <v-card class="text-center pa-4">
        <v-card-title class="text-h5 mb-4">
          {{ isVideoCall ? '📹' : '📞' }} Incoming {{ isVideoCall ? 'Video' : 'Voice' }} Call
        </v-card-title>
        <v-card-text>
          <v-avatar size="80" class="mb-4">
            <span class="text-h4">{{ otherUserName[0]?.toUpperCase() }}</span>
          </v-avatar>
          <div class="text-h6 mb-2">{{ otherUserName }}</div>
          <div class="text-body-2 text-medium-emphasis">wants to call you</div>
        </v-card-text>
        <v-card-actions class="justify-center ga-4">
          <v-btn @click="rejectCall" color="red" variant="flat" size="large">
            <v-icon start>mdi-phone-hangup</v-icon>
            Decline
          </v-btn>
          <v-btn @click="answerCall" color="green" variant="flat" size="large">
            <v-icon start>{{ isVideoCall ? 'mdi-video' : 'mdi-phone' }}</v-icon>
            Answer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Outgoing Call Modal -->
    <v-dialog :model-value="isOutgoingCall" persistent max-width="400">
      <v-card class="text-center pa-4">
        <v-card-title class="text-h5 mb-4">
          {{ isVideoCall ? '📹' : '📞' }} Calling...
        </v-card-title>
        <v-card-text>
          <v-avatar size="80" class="mb-4">
            <span class="text-h4">{{ otherUserName[0]?.toUpperCase() }}</span>
          </v-avatar>
          <div class="text-h6 mb-2">{{ otherUserName }}</div>
          <div class="text-body-2 text-medium-emphasis">Requesting call to {{ otherUserName }}...</div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn @click="endCall" color="red" variant="flat" size="large">
            <v-icon start>mdi-phone-hangup</v-icon>
            Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Active Call Overlay -->
    <v-card 
      v-if="isCallActive" 
      class="call-overlay" 
      elevation="8" 
      :class="{ 'video-call': isVideoCall }"
      ref="callOverlay"
      @mousedown="startDrag"
      :style="{ transform: `translate(${position.x}px, ${position.y}px)` }"
    >
      <v-card-text class="pa-2" v-if="isVideoCall">
        <!-- Video Call Interface -->
        <div class="video-container">
          <video ref="remoteVideo" autoplay playsinline class="remote-video"></video>
          <video ref="localVideo" autoplay muted playsinline class="local-video"></video>
        </div>
        <div class="video-controls">
          <v-btn @click="toggleMute" :color="isMuted ? 'orange' : 'blue'" variant="flat" size="small">
            <v-icon>{{ isMuted ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
          </v-btn>
          <v-btn @click="toggleVideo" :color="isVideoPaused ? 'orange' : 'blue'" variant="flat" size="small">
            <v-icon>{{ isVideoPaused ? 'mdi-video-off' : 'mdi-video' }}</v-icon>
          </v-btn>
          <v-btn @click="endCall" color="red" variant="flat" size="small">
            <v-icon>mdi-phone-hangup</v-icon>
          </v-btn>
        </div>
      </v-card-text>
      <v-card-text v-else class="text-center pa-4">
        <!-- Voice Call Interface -->
        <v-avatar size="60" class="mb-3">
          <span class="text-h5">{{ otherUserName[0]?.toUpperCase() }}</span>
        </v-avatar>
        <div class="text-h6 mb-2">{{ otherUserName }}</div>
        <div class="text-body-2 text-green mb-4">
          <v-icon color="green" size="small">mdi-phone</v-icon>
          Call Active
        </div>
        <div class="voice-controls">
          <v-btn @click="toggleMute" :color="isMuted ? 'orange' : 'blue'" variant="flat" size="small">
            <v-icon>{{ isMuted ? 'mdi-microphone-off' : 'mdi-microphone' }}</v-icon>
          </v-btn>
          <v-btn @click="endCall" color="red" variant="flat" size="large">
            <v-icon start>mdi-phone-hangup</v-icon>
            End Call
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Audio Elements (for voice calls) -->
    <audio ref="localAudio" muted autoplay></audio>
    <audio ref="remoteAudio" autoplay></audio>
  </div>
</template>

<script setup>
import { watch, ref, nextTick, onMounted } from 'vue'

const props = defineProps([
  'isIncomingCall',
  'isOutgoingCall',
  'isCallActive', 
  'otherUserName',
  'currentUserName',
  'localStream',
  'remoteStream',
  'isVideoCall'
])

const emit = defineEmits(['answer-call', 'reject-call', 'end-call'])

const localAudio = ref(null)
const remoteAudio = ref(null)
const localVideo = ref(null)
const remoteVideo = ref(null)
const callOverlay = ref(null)

// Dragging state
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const dragOffset = ref({ x: 0, y: 0 })
const isMuted = ref(false)
const isVideoPaused = ref(false)

// Center the overlay on mount
onMounted(() => {
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth <= 768
    if (isMobile) {
      position.value = { x: 10, y: 10 }
    } else {
      position.value = {
        x: (window.innerWidth - 320) / 2,
        y: (window.innerHeight - 240) / 2
      }
    }
  }
})

// Drag functionality
const startDrag = (e) => {
  isDragging.value = true
  dragOffset.value = {
    x: e.clientX - position.value.x,
    y: e.clientY - position.value.y
  }
  
  const handleMouseMove = (e) => {
    if (isDragging.value) {
      position.value = {
        x: e.clientX - dragOffset.value.x,
        y: e.clientY - dragOffset.value.y
      }
    }
  }
  
  const handleMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const answerCall = () => emit('answer-call', props.isVideoCall)
const rejectCall = () => emit('reject-call')
const endCall = () => emit('end-call')

const toggleMute = () => {
  isMuted.value = !isMuted.value
  if (props.localStream) {
    const audioTracks = props.localStream.getAudioTracks()
    audioTracks.forEach(track => {
      track.enabled = !isMuted.value
    })
  }
}

const toggleVideo = () => {
  isVideoPaused.value = !isVideoPaused.value
  if (props.localStream) {
    const videoTracks = props.localStream.getVideoTracks()
    videoTracks.forEach(track => {
      track.enabled = !isVideoPaused.value
    })
  }
}

// Watch for stream changes and attach to audio/video elements
watch(() => props.localStream, (stream) => {
  console.log('Local stream changed:', stream, 'isVideoCall:', props.isVideoCall)
  if (stream) {
    console.log('Local stream tracks:', stream.getTracks())
  }
  nextTick(() => {
    if (stream) {
      if (props.isVideoCall && localVideo.value) {
        console.log('Setting local video stream')
        localVideo.value.srcObject = stream
        localVideo.value.load()
        localVideo.value.play().catch(e => console.log('Local video play error:', e))
      }
      if (localAudio.value) {
        localAudio.value.srcObject = stream
      }
    }
  })
})

watch(() => props.remoteStream, (stream) => {
  console.log('Remote stream changed:', stream, 'isVideoCall:', props.isVideoCall)
  if (stream) {
    console.log('Remote stream tracks:', stream.getTracks())
  }
  nextTick(() => {
    if (stream) {
      if (props.isVideoCall && remoteVideo.value) {
        console.log('Setting remote video stream')
        remoteVideo.value.srcObject = stream
        remoteVideo.value.load()
        remoteVideo.value.play().catch(e => console.log('Remote video play error:', e))
      }
      if (remoteAudio.value) {
        remoteAudio.value.srcObject = stream
      }
    }
  })
})

// Watch for video call state changes
watch(() => props.isVideoCall, (isVideo) => {
  console.log('Video call state changed:', isVideo)
  if (isVideo) {
    nextTick(() => {
      if (props.localStream && localVideo.value) {
        console.log('Local stream tracks:', props.localStream.getTracks())
        localVideo.value.srcObject = props.localStream
        localVideo.value.play().catch(e => console.log('Local video play error:', e))
      }
      if (props.remoteStream && remoteVideo.value) {
        console.log('Remote stream tracks:', props.remoteStream.getTracks())
        remoteVideo.value.srcObject = props.remoteStream
        remoteVideo.value.play().catch(e => console.log('Remote video play error:', e))
      }
    })
  }
})

// Watch for call active state to refresh video elements
watch(() => props.isCallActive, (isActive) => {
  if (isActive && props.isVideoCall) {
    setTimeout(() => {
      if (props.localStream && localVideo.value) {
        localVideo.value.srcObject = props.localStream
      }
      if (props.remoteStream && remoteVideo.value) {
        remoteVideo.value.srcObject = props.remoteStream
      }
    }, 100)
  }
})
</script>

<style scoped>
.call-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  min-width: 200px;
  cursor: move;
  user-select: none;
}

.call-overlay.video-call {
  width: 320px;
  height: 240px;
  min-width: 320px;
}

@media (max-width: 768px) {
  .call-overlay {
    position: fixed !important;
    top: 10px !important;
    left: 10px !important;
    right: 10px !important;
    transform: none !important;
    z-index: 9999;
  }
  
  .call-overlay.video-call {
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px) !important;
    min-width: auto !important;
    height: auto !important;
  }
  
  .video-container {
    height: 200px !important;
  }
}

.video-container {
  position: relative;
  width: 100%;
  height: 180px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.local-video {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 80px;
  height: 60px;
  border-radius: 4px;
  border: 2px solid white;
  object-fit: cover;
}

.video-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 0;
}

.voice-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-direction: column;
}

.voice-controls .v-btn:first-child {
  margin-bottom: 8px;
}
</style>