import { io } from 'socket.io-client'

const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'https://language-exchange-chat-a2uuxtw9w.vercel.app/')

export function useSocket() {
  return { socket }
}