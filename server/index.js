const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: true, 
    methods: ["GET", "POST"] 
  }
});

app.use(cors());
app.use(express.json());

const rooms = new Map();

// Simple translation function using Google Translate
async function translateText(text, sourceLang, targetLang) {
  if (sourceLang === targetLang) return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await axios.get(url);
    const translated = response.data[0][0][0];
    console.log(`Translated "${text}" from ${sourceLang} to ${targetLang}: "${translated}"`);
    return translated || text;
  } catch (error) {
    console.error('Translation error:', error.message);
    return text;
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', async ({ roomId, username, language }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { participants: [], messages: [] });
    }
    
    const room = rooms.get(roomId);
    const user = { id: socket.id, name: username, language };
    room.participants.push(user);
    
    socket.emit('room_joined', { room, userId: socket.id, roomId });
    socket.to(roomId).emit('user_joined', user);
  });

  socket.on('new_message', async ({ roomId, text, lang, isPrivate, targetUserId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const message = {
      id: Date.now().toString(),
      senderId: socket.id,
      original: { text, lang },
      translations: {},
      timestamp: new Date().toISOString(),
      isPrivate,
      targetUserId
    };

    // Translate for each participant
    for (const participant of room.participants) {
      if (participant.id !== socket.id && participant.language !== lang) {
        try {
          const translated = await translateText(text, lang, participant.language);
          message.translations[participant.id] = translated;
          console.log(`Translated "${text}" from ${lang} to ${participant.language}: "${translated}"`);
        } catch (error) {
          console.error(`Translation failed for participant ${participant.id}:`, error);
          message.translations[participant.id] = text;
        }
      }
    }

    room.messages.push(message);
    
    if (isPrivate && targetUserId) {
      // Send to specific user only
      socket.to(targetUserId).emit('message_received', message);
      socket.emit('message_received', message);
    } else {
      // Send to all in room
      io.to(roomId).emit('message_received', message);
    }
  });

  socket.on('translate_message', async ({ messageId, targetLang }) => {
    console.log(`Translation request: messageId=${messageId}, targetLang=${targetLang}`);
    
    // Find message in any room
    let foundMessage = null;
    for (const room of rooms.values()) {
      foundMessage = room.messages.find(m => m.id === messageId);
      if (foundMessage) break;
    }
    
    if (foundMessage) {
      console.log(`Found message: "${foundMessage.original.text}" (${foundMessage.original.lang})`);
      const translated = await translateText(foundMessage.original.text, foundMessage.original.lang, targetLang);
      console.log(`Translated to: "${translated}"`);
      socket.emit('message_translated', { messageId, translation: translated, targetLang });
    } else {
      console.log('Message not found for translation');
    }
  });

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('user_typing', { userId: socket.id, isTyping });
  });

  // WebRTC Call Signaling
  socket.on('call_offer', ({ offer, targetUserId, targetUserName }) => {
    socket.to(targetUserId).emit('call_offer', {
      offer,
      callerId: socket.id,
      callerName: targetUserName
    });
  });

  socket.on('call_answer', ({ answer, targetUserId }) => {
    socket.to(targetUserId).emit('call_answer', { answer });
  });

  socket.on('ice_candidate', ({ candidate, targetUserId }) => {
    socket.to(targetUserId).emit('ice_candidate', { candidate });
  });

  socket.on('call_end', ({ targetUserId }) => {
    socket.to(targetUserId).emit('call_end');
  });

  socket.on('call_reject', ({ targetUserId }) => {
    socket.to(targetUserId).emit('call_reject');
  });

  socket.on('disconnect', () => {
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      const index = room.participants.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        room.participants.splice(index, 1);
        socket.to(roomId).emit('user_left', { userId: socket.id });
      }
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});