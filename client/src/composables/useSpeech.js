import { ref } from 'vue'

export function useSpeech() {
  const isRecording = ref(false)
  const transcript = ref('')
  let recognition = null

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    
    recognition.onresult = (event) => {
      transcript.value = event.results[0][0].transcript
    }
    
    recognition.onend = () => {
      isRecording.value = false
    }
  }

  const startRecording = () => {
    if (recognition) {
      isRecording.value = true
      transcript.value = ''
      recognition.start()
    }
  }

  const stopRecording = () => {
    if (recognition && isRecording.value) {
      recognition.stop()
    }
  }

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording
  }
}