<template>
  <div id="app">
    <JoinRoom v-if="!joined" @join="handleJoin" />
    <ChatRoom v-else :room-data="roomData" :user-id="userId" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import JoinRoom from './components/JoinRoom.vue'
import ChatRoom from './components/ChatRoom.vue'
import { useSocket } from './composables/useSocket'

const joined = ref(false)
const roomData = ref(null)
const userId = ref(null)

const { socket } = useSocket()

const handleJoin = (joinData) => {
  socket.emit('join_room', joinData)
}

socket.on('room_joined', (data) => {
  joined.value = true
  roomData.value = { ...data.room, roomId: data.roomId || data.room.roomId }
  userId.value = data.userId
})
</script>