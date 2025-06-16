// MULTIPLAYER INTEGRATION PATCH FOR PLAYGROUND.JS
// Copy and paste these code snippets into the appropriate locations in Playground.js

// 1. ADD THESE IMPORTS AT THE TOP
import multiplayerService from '../services/MultiplayerService';
import { 
  createOtherPlayerSprite, 
  updateOtherPlayerSprite, 
  removeOtherPlayerSprite, 
  updateAllOtherPlayers, 
  updateNearbyPlayerNames, 
  shouldSendPositionUpdate, 
  createMultiplayerStatusIndicator 
} from '../utils/multiplayerHelpers';

// 2. ADD THESE STATE VARIABLES AFTER EXISTING useState DECLARATIONS
const [isMultiplayerConnected, setIsMultiplayerConnected] = useState(false);
const [multiplayerPlayers, setMultiplayerPlayers] = useState([]);
const [nearbyPlayers, setNearbyPlayers] = useState([]);
const lastPositionSent = useRef({ x: 0, y: 0, time: 0 });
const otherPlayersSprites = useRef(new Map());

// 3. ADD THIS useEffect AFTER THE CHAT PAUSE EFFECT
useEffect(() => {
  // Initialize multiplayer connection
  const initializeMultiplayer = () => {
    console.log('Initializing multiplayer connection...');
    
    // Get Payman authentication status
    const paymanClient = window.paymanClient;
    const storedTokenData = localStorage.getItem('paymanToken');
    let paymanData = {
      isAuthenticated: false,
      token: null,
      realName: null
    };

    if (paymanClient && storedTokenData) {
      try {
        const tokenData = JSON.parse(storedTokenData);
        paymanData = {
          isAuthenticated: true,
          token: tokenData.accessToken,
          realName: null // We'll fetch this later
        };
      } catch (error) {
        console.error('Error parsing Payman token:', error);
      }
    }

    // Connect to multiplayer server
    multiplayerService.connect({
      x: location.state?.spawnX || 1920,
      y: location.state?.spawnY || 1280,
      avatar: 'avatar-front',
      ...paymanData
    });

    // Set up event listeners
    multiplayerService.on('connected', () => {
      console.log('Multiplayer connected!');
      setIsMultiplayerConnected(true);
    });

    multiplayerService.on('connection-error', (error) => {
      console.error('Multiplayer connection error:', error);
      setIsMultiplayerConnected(false);
    });

    multiplayerService.on('disconnected', (reason) => {
      console.log('Multiplayer disconnected:', reason);
      setIsMultiplayerConnected(false);
      setMultiplayerPlayers([]);
      otherPlayersSprites.current.clear();
    });

    multiplayerService.on('other-players', (players) => {
      setMultiplayerPlayers(players);
    });

    multiplayerService.on('player-joined', (player) => {
      setMultiplayerPlayers(prev => [...prev.filter(p => p.id !== player.id), player]);
    });

    multiplayerService.on('player-left', (playerId) => {
      setMultiplayerPlayers(prev => prev.filter(p => p.id !== playerId));
      if (otherPlayersSprites.current.has(playerId)) {
        const sprite = otherPlayersSprites.current.get(playerId);
        if (sprite && sprite.destroy) {
          sprite.destroy();
        }
        otherPlayersSprites.current.delete(playerId);
      }
    });

    multiplayerService.on('player-moved', (moveData) => {
      setMultiplayerPlayers(prev => 
        prev.map(p => 
          p.id === moveData.id 
            ? { ...p, x: moveData.x, y: moveData.y, avatar: moveData.avatar }
            : p
        )
      );
    });

    multiplayerService.on('player-updated', (updateData) => {
      setMultiplayerPlayers(prev => 
        prev.map(p => 
          p.id === updateData.id 
            ? { ...p, ...updateData }
            : p
        )
      );
    });

    multiplayerService.on('nearby-players', (players) => {
      setNearbyPlayers(players);
    });
  };

  const timer = setTimeout(initializeMultiplayer, 1000);
  return () => {
    clearTimeout(timer);
    multiplayerService.disconnect();
  };
}, [location.state]);

// 4. ADD THIS useEffect FOR PAYMAN AUTH MONITORING
useEffect(() => {
  const checkPaymanAuth = () => {
    const paymanClient = window.paymanClient;
    const storedTokenData = localStorage.getItem('paymanToken');
    
    if (paymanClient && storedTokenData && isMultiplayerConnected) {
      try {
        const tokenData = JSON.parse(storedTokenData);
        
        const getUserInfo = async () => {
          try {
            const response = await paymanClient.ask("what is my name and account information?");
            let realName = null;
            
            if (response && response.artifacts && response.artifacts.length > 0) {
              const content = response.artifacts[0].content;
              const nameMatch = content.match(/Name[:\s]*([^\n\r]+)/i);
              if (nameMatch) {
                realName = nameMatch[1].trim();
              }
            }

            multiplayerService.updatePaymanAuth({
              isAuthenticated: true,
              token: tokenData.accessToken,
              realName: realName,
              paymanClient: paymanClient
            });
          } catch (error) {
            console.error('Error getting user info from Payman:', error);
          }
        };

        getUserInfo();
      } catch (error) {
        console.error('Error handling Payman authentication:', error);
      }
    }
  };

  const handleWalletChange = () => {
    setTimeout(checkPaymanAuth, 1000);
  };

  window.addEventListener('refreshWalletBalance', handleWalletChange);
  
  return () => {
    window.removeEventListener('refreshWalletBalance', handleWalletChange);
  };
}, [isMultiplayerConnected]);

// 5. ADD THESE useEffects FOR UPDATING SPRITES
useEffect(() => {
  if (window.phaserScene && multiplayerPlayers.length > 0) {
    updateAllOtherPlayers(window.phaserScene, multiplayerPlayers, otherPlayersSprites.current);
  }
}, [multiplayerPlayers]);

useEffect(() => {
  if (window.phaserScene && nearbyPlayers.length >= 0) {
    updateNearbyPlayerNames(nearbyPlayers, otherPlayersSprites.current, window.phaserScene);
  }
}, [nearbyPlayers]);

useEffect(() => {
  if (window.phaserScene) {
    createMultiplayerStatusIndicator(
      window.phaserScene, 
      isMultiplayerConnected, 
      multiplayerPlayers.length + (isMultiplayerConnected ? 1 : 0)
    );
  }
}, [isMultiplayerConnected, multiplayerPlayers.length]);

// 6. ADD THIS LINE IN THE create() FUNCTION AFTER THE BACKGROUND
// Store scene reference for multiplayer updates
window.phaserScene = this;

// 7. ADD THESE LINES IN THE update() FUNCTION AT THE END, BEFORE THE BUILDING/NPC CHECKS
// Multiplayer position updates
if (player && isMultiplayerConnected) {
  const currentPos = { x: player.x, y: player.y };
  const currentAvatar = player.texture.key;
  
  if (shouldSendPositionUpdate(currentPos, lastPositionSent.current)) {
    multiplayerService.updatePosition(currentPos.x, currentPos.y, currentAvatar);
    lastPositionSent.current = { ...currentPos, time: Date.now() };
  }

  // Request nearby players periodically
  if (Date.now() % 30 === 0) { // Every ~500ms (frame dependent)
    multiplayerService.requestNearbyPlayers(currentPos.x, currentPos.y);
  }
}

// 8. ADD THIS JSX ELEMENT IN THE RETURN STATEMENT (after the WalletConnect component)
{isMultiplayerConnected && (
  <div style={{
    position: 'absolute',
    top: '20px',
    right: '20px',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold',
    zIndex: 1000,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
  }}>
    🌐 {multiplayerPlayers.length + 1} players online
  </div>
)}

{nearbyPlayers.length > 0 && (
  <div style={{
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    backgroundColor: 'rgba(45, 119, 148, 0.9)',
    color: 'white',
    padding: '10px 15px',
    borderRadius: '15px',
    fontSize: '12px',
    zIndex: 1000,
    maxWidth: '200px'
  }}>
    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Nearby Players:</div>
    {nearbyPlayers.map(player => (
      <div key={player.id} style={{ marginBottom: '2px' }}>
        {player.isPaymanAuthenticated ? '✓' : '•'} {player.name}
      </div>
    ))}
  </div>
)}

// 9. INSTALLATION AND RUNNING INSTRUCTIONS
/*
INSTALLATION STEPS:

1. Install dependencies:
   npm install socket.io-client

2. Start the backend server:
   cd api
   npm install
   npm start

3. Start the frontend:
   npm start

4. Open multiple browser windows to test:
   - Open http://localhost:3000 in 2-3 browser windows
   - Go through avatar creation in each
   - Navigate to playground in each window
   - You should see other players moving around!

ENVIRONMENT VARIABLES (.env.local):
REACT_APP_MULTIPLAYER_SERVER_URL=http://localhost:3001

TESTING:
- Use one browser window with Payman connected
- Use another in incognito/private mode
- See how authenticated vs anonymous names appear
- Walk close to other players to see their names appear
*/ 