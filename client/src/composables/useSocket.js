import { io } from 'socket.io-client'

const socket = io(window.location.hostname === 'localhost' ? 'http://localhost:8080' : 'http://localhost:8080')

export function useSocket() {
  return { socket }
}