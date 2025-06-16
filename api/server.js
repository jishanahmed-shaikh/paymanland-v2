const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for all routes
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "https://paymanland.vercel.app"],
  credentials: true
}));

app.use(express.json());

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "https://paymanland.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// In-memory storage for active players
const activePlayers = new Map();
const defaultNames = [
  "Explorer", "Adventurer", "Wanderer", "Traveler", "Seeker", 
  "Navigator", "Pioneer", "Voyager", "Nomad", "Pathfinder"
];

// Generate a default name for anonymous players
function generateDefaultName() {
  const randomName = defaultNames[Math.floor(Math.random() * defaultNames.length)];
  const randomNumber = Math.floor(Math.random() * 9999);
  return `${randomName}${randomNumber}`;
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

  // Handle player position updates
  socket.on('player-move', (positionData) => {
    const playerId = socket.id;
    const player = activePlayers.get(playerId);
    
    if (player) {
      // Update player position and avatar
      player.x = positionData.x;
      player.y = positionData.y;
      player.avatar = positionData.avatar || player.avatar;
      player.lastUpdate = Date.now();

      // Broadcast position update to all other clients
      socket.broadcast.emit('player-moved', {
        id: playerId,
        x: player.x,
        y: player.y,
        avatar: player.avatar
      });
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