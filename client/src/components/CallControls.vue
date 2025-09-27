<template>
  <div class="call-controls">
    <!-- Incoming Call Modal -->
    <v-dialog :model-value="isIncomingCall" persistent max-width="400">
      <v-card class="text-center pa-4">
        <v-card-title class="text-h5 mb-4">
          📞 Incoming Call
        </v-card-title>
        <v-card-text>
          <v-avatar size="80" class="mb-4">
            <span class="text-h4">{{ callerName[0]?.toUpperCase() }}</span>
          </v-avatar>
          <div class="text-h6 mb-2">{{ callerName }}</div>
          <div class="text-body-2 text-medium-emphasis">wants to start a voice call</div>
        </v-card-text>
        <v-card-actions class="justify-center ga-4">
          <v-btn @click="rejectCall" color="red" variant="flat" size="large">
            <v-icon start>mdi-phone-hangup</v-icon>
            Decline
          </v-btn>
          <v-btn @click="answerCall" color="green" variant="flat" size="large">
            <v-icon start>mdi-phone</v-icon>
            Answer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Active Call Overlay -->
    <v-card v-if="isCallActive" class="call-overlay" elevation="8">
      <v-card-text class="text-center pa-4">
        <v-avatar size="60" class="mb-3">
          <span class="text-h5">{{ callerName[0]?.toUpperCase() }}</span>
        </v-avatar>
        <div class="text-h6 mb-2">{{ callerName }}</div>
        <div class="text-body-2 text-green mb-4">
          <v-icon color="green" size="small">mdi-phone</v-icon>
          Call Active
        </div>
        <v-btn @click="endCall" color="red" variant="flat" size="large">
          <v-icon start>mdi-phone-hangup</v-icon>
          End Call
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Audio Elements -->
    <audio ref="localAudio" muted autoplay></audio>
    <audio ref="remoteAudio" autoplay></audio>
  </div>
</template>

<script setup>
import { watch, ref, nextTick } from 'vue'

const props = defineProps([
  'isIncomingCall',
  'isCallActive', 
  'callerName',
  'localStream',
  'remoteStream'
])

const emit = defineEmits(['answer-call', 'reject-call', 'end-call'])

const localAudio = ref(null)
const remoteAudio = ref(null)

const answerCall = () => emit('answer-call')
const rejectCall = () => emit('reject-call')
const endCall = () => emit('end-call')

// Watch for stream changes and attach to audio elements
watch(() => props.localStream, (stream) => {
  nextTick(() => {
    if (localAudio.value && stream) {
      localAudio.value.srcObject = stream
    }
  })
})

watch(() => props.remoteStream, (stream) => {
  nextTick(() => {
    if (remoteAudio.value && stream) {
      remoteAudio.value.srcObject = stream
    }
  })
})
</script>

<style scoped>
.call-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 200px;
}
</style>