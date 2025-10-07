import { createApp } from 'vue'
import App from './App.vue'
import './style.scss'
import './enhanced-styles.scss'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          'gradient-primary': '#667eea',
          'gradient-secondary': '#764ba2'
        }
      }
    }
  }
})

createApp(App).use(vuetify).mount('#app')