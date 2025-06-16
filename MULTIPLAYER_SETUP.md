# Payman Land Multiplayer Setup Guide

## Overview

This guide will help you set up the multiplayer functionality for Payman Land, allowing multiple players to see and interact with each other in real-time using WebSocket technology integrated with Payman authentication.

## Features

✨ **Real-time Multiplayer**: See other players moving around the world in real-time
🎭 **Dynamic Names**: Default names for anonymous users, real names for Payman-authenticated users  
🔐 **Payman Integration**: Seamless authentication using existing Payman wallet connection
👥 **Proximity-based Names**: Player names only show when you're nearby
💬 **Chat System**: Send messages to other players (optional)
🌐 **Cross-browser Testing**: Perfect for development - open multiple browser tabs to test

## Quick Setup

### 1. Install Dependencies

```bash
# Frontend dependencies (already added to package.json)
npm install socket.io-client

# Backend dependencies
cd api
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in your project root:

```env
# Existing Payman configuration
REACT_APP_PAYMAN_CLIENT_ID=your-client-id
REACT_APP_PAYMAN_CLIENT_SECRET=your-client-secret
REACT_APP_PAYMAN_REDIRECT_URI=http://localhost:3000/callback

# New multiplayer server configuration
REACT_APP_MULTIPLAYER_SERVER_URL=http://localhost:3001
```

### 3. Start the Backend Server

```bash
# In the api directory
cd api
npm install
npm start

# Or for development with auto-reload
npm run dev
```

The multiplayer server will start on `http://localhost:3001`

### 4. Start the Frontend

```bash
# In the project root
npm start
```

The frontend will start on `http://localhost:3000`

## Testing Multiplayer

1. **Open Multiple Browser Windows**: Open `http://localhost:3000` in 2-3 different browser windows/tabs
2. **Create Avatars**: Go through the avatar creation process in each window
3. **Enter Playground**: Navigate to the playground in each window
4. **See Other Players**: You should see other players moving around with default names like "Explorer1234"
5. **Test Payman Authentication**: Connect your Payman wallet in one window to see how authenticated names appear

## How It Works

### Authentication Integration

The multiplayer system automatically detects:
- **Anonymous Users**: Get random names like "Explorer1234", "Wanderer5678"
- **Payman Users**: Display real names when authenticated via Payman wallet

### Name Visibility

- **Default**: Player names are hidden for performance
- **Proximity**: Names appear when players are within 200 pixels of each other
- **Authentication Status**: Gold checkmark (✓) appears for Payman-authenticated users

### Real-time Updates

- **Position**: Player movements are broadcasted to all connected clients
- **Authentication**: When someone connects their Payman wallet, their name updates for everyone
- **Join/Leave**: Players see notifications when others join or leave

## Server API Endpoints

### WebSocket Events

**Client → Server:**
- `player-join`: Join the game world
- `player-move`: Update player position
- `payman-auth-update`: Update authentication status
- `request-nearby-players`: Get list of nearby players
- `player-chat`: Send chat message

**Server → Client:**
- `player-assigned`: Your player data
- `other-players`: List of other players
- `player-joined`: New player joined
- `player-left`: Player disconnected
- `player-moved`: Player position update
- `player-updated`: Player info update
- `nearby-players`: List of nearby players
- `chat-message`: Chat message received

### HTTP Endpoints

- `GET /api/players`: List all active players (debugging)
- `GET /api/health`: Server health check
- `POST /api/payman/webhook`: Payman webhook endpoint (future use)

## Deployment Options

### Local Development
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`

### Production Deployment

#### Backend (Node.js Server)
Deploy to platforms like:
- **Heroku**: Easy deployment with WebSocket support
- **Railway**: Modern deployment platform
- **DigitalOcean**: VPS with custom setup
- **Vercel**: Using Vercel functions (requires modifications)

#### Environment Variables for Production
```env
PORT=3001
NODE_ENV=production
```

Update `REACT_APP_MULTIPLAYER_SERVER_URL` to point to your deployed backend.

## Troubleshooting

### Connection Issues

**Problem**: "Multiplayer: Disconnected" showing  
**Solution**: 
1. Ensure backend server is running on port 3001
2. Check console for connection errors
3. Verify `REACT_APP_MULTIPLAYER_SERVER_URL` is correct

### No Other Players Visible

**Problem**: Can't see other players  
**Solution**:
1. Open multiple browser windows
2. Complete avatar creation in each
3. Navigate to playground in each window
4. Check browser console for WebSocket errors

### Names Not Updating

**Problem**: Payman names not showing  
**Solution**:
1. Ensure Payman wallet is properly connected
2. Check that `paymanClient` is available globally
3. Look for authentication update events in console

### Performance Issues

**Problem**: Game feels slow with multiplayer  
**Solution**:
1. Position updates are throttled to 100ms
2. Reduce update frequency in `multiplayerHelpers.js`
3. Limit number of connected players for testing

## Development Tips

### Testing Authentication Flow
1. Use one browser window with Payman connected
2. Use another in incognito/private mode (anonymous)
3. See the difference in name display and styling

### Debugging WebSocket Events
Check browser console for detailed logs:
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'socket.io-client:*');
```

### Custom Player Names
For testing, you can manually set player names:
```javascript
// In browser console
multiplayerService.updatePaymanAuth({
  isAuthenticated: true,
  realName: "Test User",
  token: "fake-token"
});
```

## Future Enhancements

🔮 **Planned Features:**
- Voice chat integration
- Player emotes and gestures
- Private messaging
- Group chat rooms
- Player avatars with more customization
- Mini-games between players
- Achievement system
- Player profiles and stats

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure both frontend and backend servers are running
4. Test with simple browser refresh

The multiplayer system is designed to be robust and handle connection issues gracefully. Players will automatically reconnect if the connection is lost.

---

**Happy multiplaying in Payman Land! 🎮✨** 