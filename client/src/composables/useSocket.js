import { io } from 'socket.io-client'

const socket = io(import.meta.env.PROD ? 'wss://language-exchange-server.onrender.com' : 'http://localhost:8080')

export function useSocket() {
  return { socket }
}