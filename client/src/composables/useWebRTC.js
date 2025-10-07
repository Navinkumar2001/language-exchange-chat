import { ref, onUnmounted } from 'vue'

export function useWebRTC(socket) {
  const localStream = ref(null)
  const remoteStream = ref(null)
  const peerConnection = ref(null)
  const isCallActive = ref(false)
  const isIncomingCall = ref(false)
  const isOutgoingCall = ref(false)
  const callerId = ref(null)
  const otherUserName = ref('')
  const isVideoCall = ref(false)

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

  const startCall = async (targetUserId, targetUserName, isVideo = false) => {
    try {
      const constraints = isVideo ? { audio: true, video: { width: 320, height: 240 } } : { audio: true }
      
      console.log('Starting call with constraints:', constraints)
      localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
      initializePeerConnection()
      
      localStream.value.getTracks().forEach(track => {
        peerConnection.value.addTrack(track, localStream.value)
      })
      
      const offer = await peerConnection.value.createOffer()
      await peerConnection.value.setLocalDescription(offer)
      
      socket.emit('call_offer', {
        offer,
        targetUserId,
        targetUserName,
        isVideo
      })
      
      callerId.value = targetUserId
      otherUserName.value = targetUserName
      isVideoCall.value = isVideo
      isOutgoingCall.value = true
    } catch (error) {
      console.error('Error starting call:', error)
      alert('Could not access camera/microphone: ' + error.message)
    }
  }

  const answerCall = async (isVideo = false) => {
    try {
      // Use the same video setting as the incoming call
      const videoEnabled = isVideo || isVideoCall.value
      const constraints = videoEnabled ? { audio: true, video: { width: 320, height: 240 } } : { audio: true }
      
      console.log('Getting user media with constraints:', constraints)
      localStream.value = await navigator.mediaDevices.getUserMedia(constraints)
      
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
      alert('Could not access camera/microphone: ' + error.message)
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
    isOutgoingCall.value = false
    callerId.value = null
    otherUserName.value = ''
    remoteStream.value = null
  }

  const rejectCall = () => {
    socket.emit('call_reject', { targetUserId: callerId.value })
    isIncomingCall.value = false
    isOutgoingCall.value = false
    callerId.value = null
    otherUserName.value = ''
  }

  // Socket event listeners
  socket.on('call_offer', async ({ offer, callerId: incomingCallerId, callerName: incomingCallerName, isVideo }) => {
    callerId.value = incomingCallerId
    otherUserName.value = incomingCallerName
    isVideoCall.value = isVideo || false
    isIncomingCall.value = true
    
    initializePeerConnection()
    await peerConnection.value.setRemoteDescription(offer)
  })



  socket.on('ice_candidate', async ({ candidate }) => {
    await peerConnection.value.addIceCandidate(candidate)
  })

  socket.on('call_end', () => {
    endCall()
  })

  socket.on('call_reject', () => {
    isCallActive.value = false
    isOutgoingCall.value = false
    callerId.value = null
    otherUserName.value = ''
  })

  socket.on('call_answer', async ({ answer }) => {
    await peerConnection.value.setRemoteDescription(answer)
    isOutgoingCall.value = false
    isCallActive.value = true
  })

  onUnmounted(() => {
    endCall()
  })

  return {
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
  }
}