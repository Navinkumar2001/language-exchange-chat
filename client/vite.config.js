// vite.config.js

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
  plugins: [vue(), vuetify()],
  server: {
    port: 5173,
    // Add a dot '.' before the domain to allow all subdomains
    allowedHosts: [
        '.ngrok-free.app', // This allows ALL subdomains of ngrok-free.app
        '.ngrok.io'        // This allows ALL subdomains of ngrok.io
    ],
  }
})