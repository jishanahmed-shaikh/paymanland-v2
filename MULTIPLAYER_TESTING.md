# 🎮 Multiplayer Testing Guide

## Overview

This guide will help you test the enhanced multiplayer functionality step by step to ensure real-time synchronization works perfectly.

## 🛠️ Pre-Testing Setup

### 1. Start Backend Server
```bash
cd api
npm start
```
**Expected Output:**
```
Multiplayer server running on port 3001
WebSocket server ready for connections
```

### 2. Start Frontend (in another terminal)
```bash
npm start
```

### 3. Environment Check
Make sure you have this in `.env.local`:
```env
REACT_APP_MULTIPLAYER_SERVER_URL=http://localhost:3001
```

## 🧪 Testing Scenarios

### Test 1: Basic Connection & Name Display

1. **Open Browser Window 1**:
   - Navigate to `http://localhost:3000`
   - Complete avatar creation
   - Enter playground
   - **Expected**: See "🌐 1 players online" in top-right
   - **Expected**: Debug panel shows connection status (development mode)

2. **Open Browser Window 2** (different browser or incognito):
   - Repeat same steps
   - **Expected**: Both windows now show "🌐 2 players online"
   - **Expected**: See another player sprite with name like "Alex42" or "John123"

3. **Verify Console Logs**:
   - Backend console should show:
     ```
     Player Alex42 (socket-id) joined at (1920, 1280)
     Total active players: 2
     ```

### Test 2: Real-Time Movement Synchronization

1. **In Window 1**: Move your character around using arrow keys
2. **In Window 2**: Watch the other player's sprite
   - **Expected**: See smooth movement updates every ~100ms
   - **Expected**: Avatar direction changes (front/back/left/right) sync correctly
   - **Expected**: Console shows "🎮 Position update sent" messages

3. **Verify Movement Quality**:
   - ✅ No jittery or laggy movement
   - ✅ Smooth interpolation between positions
   - ✅ Avatar sprites match movement direction
   - ✅ No duplicate or conflicting animations

### Test 3: Payman Authentication Integration

1. **Window 1**: Connect Payman wallet
   - Click "Connect Your Wallet"
   - Complete authentication
   - **Expected**: Name changes from "Alex42" to your real Payman name
   - **Expected**: Gold checkmark (✓) appears next to name

2. **Window 2**: Keep as anonymous
   - **Expected**: Still shows default name like "Sarah78"
   - **Expected**: Simple dot (•) next to name

3. **Proximity Testing**:
   - Move characters close to each other (within 200 pixels)
   - **Expected**: Names appear above sprites when nearby
   - **Expected**: "Nearby Players" panel shows on right side
   - **Expected**: Authenticated players show ✓, anonymous show •

### Test 4: Performance & Reliability Testing

1. **Rapid Movement Test**:
   - Hold arrow keys and move rapidly in all directions
   - **Expected**: Updates sent at consistent 10Hz rate (not 60fps)
   - **Expected**: No flooding of network requests
   - **Expected**: Other player sees smooth movement, not teleporting

2. **Connection Stability**:
   - Stop backend server briefly
   - **Expected**: Frontend shows "🔴 Multiplayer: Disconnected"
   - Restart backend server
   - **Expected**: Automatic reconnection within 5 seconds
   - **Expected**: Both players can see each other again

3. **Multiple Players** (if testing with friends):
   - Open 3-4 browser windows
   - **Expected**: All players visible to each other
   - **Expected**: Performance remains smooth
   - **Expected**: No lag or sync issues

### Test 5: Edge Cases

1. **Refresh Page Test**:
   - Refresh one browser window
   - **Expected**: Player rejoins with new name
   - **Expected**: Other windows see player disconnect then rejoin

2. **Simultaneous Movement**:
   - Move both characters at the same time
   - **Expected**: No collision or conflict
   - **Expected**: Both movements are independent and smooth

3. **Name Uniqueness**:
   - Keep opening new incognito windows
   - **Expected**: Each gets unique name (Alex42, John123, Sarah456, etc.)
   - **Expected**: No duplicate names

## 🔍 Debug Information

### Console Messages to Look For

**Frontend Console (Good Signs):**
```
🔌 Connecting to multiplayer server at: http://localhost:3001
Multiplayer connected!
🎮 Position update sent: {x: 1920, y: 1280, avatar: 'avatar-front'}
🏃 Moving player Alex42 from (1920, 1280) to (1950, 1300)
```

**Backend Console (Good Signs):**
```
Player Alex42 (C59TMCJSvWK4RkkBAAAB) joined at (1920, 1280)
📍 Alex42 moved 25.3px to (1950, 1300)
Total active players: 2
```

### Red Flags (Problems to Report)

**Frontend:**
- ❌ "Connection error" messages
- ❌ Players not appearing after 5 seconds
- ❌ Jerky or teleporting movement
- ❌ Names not updating when Payman connects

**Backend:**
- ❌ "Invalid position data" warnings
- ❌ Players not disconnecting properly
- ❌ Memory leaks (player count not decreasing)

## 🎯 Performance Benchmarks

### Network Traffic (Expected):
- **Position Updates**: ~10 per second per player
- **Data Size**: ~50 bytes per update
- **Total for 2 players**: ~1KB/second (very efficient!)

### Timing Expectations:
- **Position Update Frequency**: Every 100ms (10 Hz)
- **Nearby Player Checks**: Every 500ms (2 Hz)
- **Movement Smoothness**: 60fps interpolation on client
- **Network Latency**: < 50ms on localhost

## 🐛 Troubleshooting Common Issues

### "No other players visible"
1. Check browser console for connection errors
2. Verify both browsers completed avatar creation
3. Ensure backend server is running on port 3001
4. Check firewall settings

### "Laggy or jittery movement"
1. Verify position updates are limited to 10Hz (not 60fps)
2. Check for JavaScript errors in console
3. Ensure smooth interpolation is working
4. Monitor CPU usage

### "Names not showing"
1. Move characters closer together (< 200 pixels)
2. Check "Nearby Players" panel appears
3. Verify proximity detection is working
4. Look for name visibility toggle

### "Payman names not updating"
1. Ensure wallet is properly connected
2. Check `window.paymanClient` exists in console
3. Verify authentication event is fired
4. Look for real name extraction in console

## ✅ Success Criteria

**The multiplayer system is working perfectly when:**

✅ Multiple players can see each other instantly  
✅ Movement is smooth and real-time (no lag > 200ms)  
✅ Names display correctly (default for anonymous, real for Payman)  
✅ Proximity-based name visibility works  
✅ Connection is stable and auto-recovers  
✅ Performance is excellent (< 1KB/s network usage)  
✅ No JavaScript errors in console  
✅ Proper cleanup when players disconnect  

## 📊 Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend connects successfully
- [ ] 2+ players can see each other
- [ ] Real-time movement synchronization
- [ ] Name generation and display
- [ ] Payman authentication integration
- [ ] Proximity-based name visibility
- [ ] Stable connection with auto-reconnect
- [ ] Performance optimizations working
- [ ] No memory leaks or errors
- [ ] Clean disconnection handling

**Happy Testing! 🎮✨**

---

*Report any issues with specific console logs and steps to reproduce.* 