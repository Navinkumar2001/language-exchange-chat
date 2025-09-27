import { ref, onUnmounted } from 'vue'

export function useWebRTC(socket) {
  const localStream = ref(null)
  const remoteStream = ref(null)
  const peerConnection = ref(null)
  const isCallActive = ref(false)
  const isIncomingCall = ref(false)
  const callerId = ref(null)
  const callerName = ref('')

  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  }

  const initializePeerConnection = () => {
    peerConnection.value = new RTCPeerConnection(configuration)
    
    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', {
          candidate: event.candidate,
          targetUserId: callerId.value
        })
      }
    }
    
    peerConnection.value.ontrack = (event) => {
      remoteStream.value = event.streams[0]
    }
  }

  const startCall = async (targetUserId, targetUserName) => {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
      initializePeerConnection()
      
      localStream.value.getTracks().forEach(track => {
        peerConnection.value.addTrack(track, localStream.value)
      })
      
      const offer = await peerConnection.value.createOffer()
      await peerConnection.value.setLocalDescription(offer)
      
      socket.emit('call_offer', {
        offer,
        targetUserId,
        targetUserName
      })
      
      callerId.value = targetUserId
      callerName.value = targetUserName
      isCallActive.value = true
    } catch (error) {
      console.error('Error starting call:', error)
    }
  }

  const answerCall = async () => {
    try {
      localStream.value = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      localStream.value.getTracks().forEach(track => {
        peerConnection.value.addTrack(track, localStream.value)
      })
      
      const answer = await peerConnection.value.createAnswer()
      await peerConnection.value.setLocalDescription(answer)
      
      socket.emit('call_answer', {
        answer,
        targetUserId: callerId.value
      })
      
      isIncomingCall.value = false
      isCallActive.value = true
    } catch (error) {
      console.error('Error answering call:', error)
    }
  }

  const endCall = () => {
    if (localStream.value) {
      localStream.value.getTracks().forEach(track => track.stop())
      localStream.value = null
    }
    
    if (peerConnection.value) {
      peerConnection.value.close()
      peerConnection.value = null
    }
    
    socket.emit('call_end', { targetUserId: callerId.value })
    
    isCallActive.value = false
    isIncomingCall.value = false
    callerId.value = null
    callerName.value = ''
    remoteStream.value = null
  }

  const rejectCall = () => {
    socket.emit('call_reject', { targetUserId: callerId.value })
    isIncomingCall.value = false
    callerId.value = null
    callerName.value = ''
  }

  // Socket event listeners
  socket.on('call_offer', async ({ offer, callerId: incomingCallerId, callerName: incomingCallerName }) => {
    callerId.value = incomingCallerId
    callerName.value = incomingCallerName
    isIncomingCall.value = true
    
    initializePeerConnection()
    await peerConnection.value.setRemoteDescription(offer)
  })

  socket.on('call_answer', async ({ answer }) => {
    await peerConnection.value.setRemoteDescription(answer)
  })

  socket.on('ice_candidate', async ({ candidate }) => {
    await peerConnection.value.addIceCandidate(candidate)
  })

  socket.on('call_end', () => {
    endCall()
  })

  socket.on('call_reject', () => {
    isCallActive.value = false
    callerId.value = null
    callerName.value = ''
  })

  onUnmounted(() => {
    endCall()
  })

  return {
    localStream,
    remoteStream,
    isCallActive,
    isIncomingCall,
    callerId,
    callerName,
    startCall,
    answerCall,
    endCall,
    rejectCall
  }
}