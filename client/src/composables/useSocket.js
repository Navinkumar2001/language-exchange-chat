import { io } from 'socket.io-client'

const socket = io(import.meta.env.PROD ? 'https://your-server-url.com' : 'http://localhost:3001')

export function useSocket() {
  return { socket }
}