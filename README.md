# 🌍 Realtime Language Exchange Chat

A web-based real-time language exchange chat platform where users can communicate in their native languages and see instant translations.

## Features

- **Real-time messaging** with Socket.IO
- **Automatic translation** using LibreTranslate API
- **Voice & Video calls** with WebRTC
- **Speech-to-text** input via Web Speech API
- **Text-to-speech** playback for translations
- **Live typing indicators** and user presence
- **Responsive design** with smooth GSAP animations
- **Multi-language support** with flag indicators

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   cd client && npm install
   ```

2. **Start development servers:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - Client: http://localhost:5173
   - Server: http://localhost:3001

## Project Structure

```
language-exchange-chat/
├── server/
│   └── index.js          # Socket.IO server with translation
├── client/
│   ├── src/
│   │   ├── components/   # Vue components
│   │   ├── composables/  # Vue composables
│   │   └── style.scss    # Global styles
│   └── package.json
└── package.json
```

## Tech Stack

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** Vue 3, GSAP, SCSS
- **Translation:** LibreTranslate API (free)
- **Speech:** Web Speech API

## Usage

1. Enter your name and select your language
2. Join a room (default: "general")
3. Start chatting - messages auto-translate for other users
4. Use mic button for speech-to-text
5. Click 🔊 to hear translations
6. Click 📞 for voice calls or 📹 for video calls with other users

## Supported Languages

🇺🇸 English | 🇪🇸 Spanish | 🇫🇷 French | 🇩🇪 German | 🇨🇳 Chinese | 🇯🇵 Japanese