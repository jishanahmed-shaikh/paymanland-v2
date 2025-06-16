import { io } from 'socket.io-client';

class MultiplayerService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentPlayer = null;
    this.otherPlayers = new Map();
    this.eventCallbacks = new Map();
    
    // Server URL - adjust for your deployment
    this.serverUrl = process.env.REACT_APP_MULTIPLAYER_SERVER_URL || 'http://localhost:3001';
  }

  // Initialize connection to multiplayer server
  connect(playerData = {}) {
    if (this.isConnected) {
      console.log('Already connected to multiplayer server');
      return;
    }

    console.log('Connecting to multiplayer server at:', this.serverUrl);

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.setupEventListeners();

    // Join the game with player data
    this.socket.on('connect', () => {
      console.log('Connected to multiplayer server');
      this.isConnected = true;
      
      // Send join request with player information
      this.joinGame(playerData);
      
      this.emit('connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.emit('connection-error', error);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
      this.emit('disconnected', reason);
    });
  }

  setupEventListeners() {
    // Player assignment (when we join)
    this.socket.on('player-assigned', (playerData) => {
      this.currentPlayer = playerData;
      console.log('Player assigned:', playerData);
      this.emit('player-assigned', playerData);
    });

    // Other players list (initial load)
    this.socket.on('other-players', (players) => {
      players.forEach(player => {
        this.otherPlayers.set(player.id, player);
      });
      console.log('Received other players:', players.length);
      this.emit('other-players', players);
    });

    // New player joined
    this.socket.on('player-joined', (player) => {
      this.otherPlayers.set(player.id, player);
      console.log('Player joined:', player.name);
      this.emit('player-joined', player);
    });

    // Player moved
    this.socket.on('player-moved', (moveData) => {
      const player = this.otherPlayers.get(moveData.id);
      if (player) {
        player.x = moveData.x;
        player.y = moveData.y;
        player.avatar = moveData.avatar;
        this.emit('player-moved', moveData);
      }
    });

    // Player updated (name, auth status, etc.)
    this.socket.on('player-updated', (updateData) => {
      const player = this.otherPlayers.get(updateData.id);
      if (player) {
        Object.assign(player, updateData);
        this.emit('player-updated', updateData);
      }
    });

    // Player left
    this.socket.on('player-left', (playerId) => {
      const player = this.otherPlayers.get(playerId);
      if (player) {
        console.log('Player left:', player.name);
        this.otherPlayers.delete(playerId);
        this.emit('player-left', playerId);
      }
    });

    // Nearby players response
    this.socket.on('nearby-players', (nearbyPlayers) => {
      this.emit('nearby-players', nearbyPlayers);
    });

    // Chat messages
    this.socket.on('chat-message', (message) => {
      this.emit('chat-message', message);
    });

    // Connection monitoring
    this.socket.on('pong', () => {
      this.emit('pong');
    });
  }

  // Join the game
  joinGame(playerData) {
    if (!this.socket) return;

    const joinData = {
      x: playerData.x || 1920,
      y: playerData.y || 1280,
      avatar: playerData.avatar || 'avatar-front',
      name: playerData.name || null, // Will get default name from server
      isPaymanAuthenticated: playerData.isPaymanAuthenticated || false,
      paymanToken: playerData.paymanToken || null
    };

    this.socket.emit('player-join', joinData);
  }

  // Update player position
  updatePosition(x, y, avatar) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('player-move', {
      x: x,
      y: y,
      avatar: avatar
    });
  }

  // Update Payman authentication status
  updatePaymanAuth(authData) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('payman-auth-update', {
      isAuthenticated: authData.isAuthenticated,
      token: authData.token,
      realName: authData.realName,
      paymanClient: authData.paymanClient
    });
  }

  // Request nearby players (for showing names)
  requestNearbyPlayers(x, y) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('request-nearby-players', { x, y });
  }

  // Send chat message
  sendChatMessage(message) {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('player-chat', { message });
  }

  // Get all other players
  getOtherPlayers() {
    return Array.from(this.otherPlayers.values());
  }

  // Get current player info
  getCurrentPlayer() {
    return this.currentPlayer;
  }

  // Event subscription system
  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventCallbacks.has(event)) {
      const callbacks = this.eventCallbacks.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventCallbacks.has(event)) {
      this.eventCallbacks.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // Ping server for connection testing
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.currentPlayer = null;
      this.otherPlayers.clear();
      this.eventCallbacks.clear();
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      serverUrl: this.serverUrl,
      playersCount: this.otherPlayers.size + (this.currentPlayer ? 1 : 0)
    };
  }
}

// Create a singleton instance
const multiplayerService = new MultiplayerService();

export default multiplayerService; 