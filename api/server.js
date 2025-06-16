const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes (Production Ready)
const allowedOrigins = [
  "http://localhost:3000", 
  "http://localhost:3001",
  "https://paymanland.vercel.app", // Your main Vercel domain
  /\.vercel\.app$/, // All Vercel preview deployments
  /\.railway\.app$/, // Railway deployments
  /\.render\.com$/, // Render deployments
  /\.herokuapp\.com$/ // Heroku deployments
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      return allowed.test(origin);
    })) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());

// Socket.IO setup with CORS (Production Ready)
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowed => {
        if (typeof allowed === 'string') return allowed === origin;
        return allowed.test(origin);
      })) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// In-memory storage for active players
const activePlayers = new Map();
const defaultNames = [
  "Alex", "John", "Sarah", "Emma", "Mike", "Lisa", "David", "Anna",
  "Chris", "Maria", "Tom", "Kate", "Jack", "Sophie", "Ryan", "Lucy",
  "Mark", "Elena", "Nick", "Zara", "Leo", "Maya", "Sam", "Aria",
  "Max", "Jade", "Ben", "Nova", "Luke", "Iris", "Jake", "Luna"
];

const usedNames = new Set();

// Generate a default name for anonymous players
function generateDefaultName() {
  let attempts = 0;
  let name;
  
  do {
    const randomName = defaultNames[Math.floor(Math.random() * defaultNames.length)];
    const randomNumber = Math.floor(Math.random() * 999) + 1;
    name = `${randomName}${randomNumber}`;
    attempts++;
  } while (usedNames.has(name) && attempts < 50);
  
  usedNames.add(name);
  return name;
}

// Clean up used names when players disconnect
function releasePlayerName(name) {
  if (name && !name.includes('@') && !name.includes('✓')) {
    usedNames.delete(name);
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Handle player joining the game
  socket.on('player-join', (playerData) => {
    const playerId = socket.id;
    
    // Create player object
    const player = {
      id: playerId,
      x: playerData.x || 1920, // Default spawn position
      y: playerData.y || 1280,
      avatar: playerData.avatar || 'avatar-front',
      name: playerData.name || generateDefaultName(),
      isPaymanAuthenticated: playerData.isPaymanAuthenticated || false,
      paymanToken: playerData.paymanToken || null,
      lastUpdate: Date.now()
    };

    // Store player
    activePlayers.set(playerId, player);

    // Send current player their assigned data
    socket.emit('player-assigned', player);

    // Send list of all other players to the new player
    const otherPlayers = Array.from(activePlayers.values()).filter(p => p.id !== playerId);
    socket.emit('other-players', otherPlayers);

    // Broadcast new player to all other clients
    socket.broadcast.emit('player-joined', player);

    console.log(`Player ${player.name} (${playerId}) joined at (${player.x}, ${player.y})`);
    console.log(`Total active players: ${activePlayers.size}`);
  });

  // Handle player position updates (improved)
  socket.on('player-move', (positionData) => {
    const playerId = socket.id;
    const player = activePlayers.get(playerId);
    
    if (player) {
      // Validate position data
      if (typeof positionData.x !== 'number' || typeof positionData.y !== 'number') {
        console.warn(`Invalid position data from ${playerId}:`, positionData);
        return;
      }

      // Store previous position for debugging
      const prevX = player.x;
      const prevY = player.y;

      // Update player position and avatar
      player.x = positionData.x;
      player.y = positionData.y;
      player.avatar = positionData.avatar || player.avatar;
      player.lastUpdate = Date.now();

      // Log significant movements for debugging
      const distance = Math.sqrt(Math.pow(player.x - prevX, 2) + Math.pow(player.y - prevY, 2));
      if (distance > 50) {
        console.log(`📍 ${player.name} moved ${distance.toFixed(1)}px to (${player.x}, ${player.y})`);
      }

      // Broadcast position update to all other clients with additional data
      const updateData = {
        id: playerId,
        name: player.name,
        x: player.x,
        y: player.y,
        avatar: player.avatar,
        isPaymanAuthenticated: player.isPaymanAuthenticated,
        timestamp: Date.now()
      };

      socket.broadcast.emit('player-moved', updateData);
      
      // Also emit to sender for confirmation (optional)
      socket.emit('position-confirmed', {
        x: player.x,
        y: player.y,
        timestamp: updateData.timestamp
      });
    }
  });

  // Handle direct messages between players (SIMPLIFIED)
  socket.on('direct-message', (messageData) => {
    const senderId = socket.id;
    const sender = activePlayers.get(senderId);
    
    console.log('💬 Direct message received:', messageData);
    console.log('📋 Sender info:', { senderId, senderName: sender?.name });
    
    if (sender && messageData.toPlayerId) {
      // Find target player's socket
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.id === messageData.toPlayerId);
      
      console.log('🎯 Target socket found:', !!targetSocket);
      
      if (targetSocket) {
        console.log(`✅ Sending message from ${sender.name} to ${messageData.toPlayerId}`);
        
        // Send message to target player
        targetSocket.emit('direct-message', {
          fromPlayerId: senderId,
          fromPlayerName: sender.name,
          message: messageData.message,
          timestamp: messageData.timestamp
        });
        
        console.log(`💬 Message sent: "${messageData.message}"`);
      } else {
        console.log(`❌ Target player ${messageData.toPlayerId} not found`);
      }
    } else {
      console.log('❌ Missing sender or target player ID');
    }
  });

  // Handle typing indicators
  socket.on('typing-indicator', (typingData) => {
    const senderId = socket.id;
    const sender = activePlayers.get(senderId);
    
    if (sender && typingData.targetPlayerId) {
      // Find target player's socket
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.id === typingData.targetPlayerId);
      
      if (targetSocket) {
        if (typingData.isTyping) {
          targetSocket.emit('player-typing', { playerId: senderId, playerName: sender.name });
        } else {
          targetSocket.emit('player-stopped-typing', { playerId: senderId, playerName: sender.name });
        }
      }
    }
  });

  // Handle payment notifications
  socket.on('payment-notification', (paymentData) => {
    const senderId = socket.id;
    const sender = activePlayers.get(senderId);
    
    if (sender && paymentData.toPlayerId) {
      // Find target player's socket
      const targetSocket = Array.from(io.sockets.sockets.values())
        .find(s => s.id === paymentData.toPlayerId);
      
      if (targetSocket) {
        // Send payment notification to target player
        targetSocket.emit('payment-received', {
          fromPlayer: {
            id: senderId,
            name: sender.name,
            isPaymanAuthenticated: sender.isPaymanAuthenticated
          },
          amount: paymentData.amount,
          currency: paymentData.currency,
          message: paymentData.message,
          timestamp: paymentData.timestamp
        });
        
        console.log(`💰 Payment notification: ${sender.name} sent ${paymentData.amount} ${paymentData.currency} to ${paymentData.toPlayerId}`);
      }
    }
  });

  // Handle Payman authentication updates
  socket.on('payman-auth-update', async (authData) => {
    const playerId = socket.id;
    const player = activePlayers.get(playerId);
    
    if (player) {
      player.isPaymanAuthenticated = authData.isAuthenticated;
      player.paymanToken = authData.token;
      
      // If authenticated, try to get real name from Payman
      if (authData.isAuthenticated && authData.paymanClient) {
        try {
          // Note: In a real implementation, this should be done server-side
          // For now, we'll accept the name from the client
          if (authData.realName) {
            player.name = authData.realName;
          }
        } catch (error) {
          console.error('Error fetching user info from Payman:', error);
        }
      }

      // Broadcast updated player info to all clients
      io.emit('player-updated', {
        id: playerId,
        name: player.name,
        isPaymanAuthenticated: player.isPaymanAuthenticated
      });

      console.log(`Player ${playerId} authentication updated: ${player.name} (${player.isPaymanAuthenticated ? 'Authenticated' : 'Anonymous'})`);
    }
  });

  // Handle player name visibility requests (when players are nearby)
  socket.on('request-nearby-players', (position) => {
    const playerId = socket.id;
    const nearbyPlayers = [];
    const PROXIMITY_THRESHOLD = 200; // pixels

    activePlayers.forEach((player, id) => {
      if (id !== playerId) {
        const distance = Math.sqrt(
          Math.pow(player.x - position.x, 2) + 
          Math.pow(player.y - position.y, 2)
        );
        
        if (distance <= PROXIMITY_THRESHOLD) {
          nearbyPlayers.push({
            id: player.id,
            name: player.name,
            isPaymanAuthenticated: player.isPaymanAuthenticated,
            x: player.x,
            y: player.y
          });
        }
      }
    });

    socket.emit('nearby-players', nearbyPlayers);
  });

  // Handle chat messages between players
  socket.on('player-chat', (chatData) => {
    const playerId = socket.id;
    const player = activePlayers.get(playerId);
    
    if (player) {
      const message = {
        playerId: playerId,
        playerName: player.name,
        message: chatData.message,
        timestamp: Date.now(),
        isPaymanAuthenticated: player.isPaymanAuthenticated
      };

      // Broadcast chat message to all players
      io.emit('chat-message', message);
    }
  });

  // Handle player disconnection
  socket.on('disconnect', () => {
    const playerId = socket.id;
    const player = activePlayers.get(playerId);
    
    if (player) {
      console.log(`Player ${player.name} (${playerId}) disconnected`);
      
      // Release the player's name for reuse
      releasePlayerName(player.name);
      
      activePlayers.delete(playerId);
      
      // Broadcast player left to all other clients
      socket.broadcast.emit('player-left', playerId);
      
      console.log(`Total active players: ${activePlayers.size}`);
    }
  });

  // Handle ping for connection monitoring
  socket.on('ping', () => {
    socket.emit('pong');
  });
});

// Clean up inactive players (optional - removes players who haven't updated in 5 minutes)
setInterval(() => {
  const now = Date.now();
  const TIMEOUT = 5 * 60 * 1000; // 5 minutes

  activePlayers.forEach((player, id) => {
    if (now - player.lastUpdate > TIMEOUT) {
      console.log(`Removing inactive player: ${player.name} (${id})`);
      activePlayers.delete(id);
      io.emit('player-left', id);
    }
  });
}, 60 * 1000); // Check every minute

// API endpoint to get current active players (for debugging)
app.get('/api/players', (req, res) => {
  const players = Array.from(activePlayers.values()).map(player => ({
    id: player.id,
    name: player.name,
    x: player.x,
    y: player.y,
    isPaymanAuthenticated: player.isPaymanAuthenticated,
    lastUpdate: new Date(player.lastUpdate).toISOString()
  }));
  
  res.json({
    totalPlayers: players.length,
    players: players
  });
});

// Payman webhook endpoint (for future use)
app.post('/api/payman/webhook', (req, res) => {
  console.log('Payman webhook received:', req.body);
  
  // Handle Payman events here (e.g., payment confirmations, user updates)
  // This could be used to update player status in real-time
  
  res.status(200).json({ received: true });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activePlayers: activePlayers.size,
    uptime: process.uptime() 
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Multiplayer server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});

module.exports = { app, server, io }; 