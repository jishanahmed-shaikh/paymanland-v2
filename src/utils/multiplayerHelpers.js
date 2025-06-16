// Multiplayer helper functions for Phaser integration

// Create other player sprites in the game scene
export function createOtherPlayerSprite(scene, playerData, otherPlayersSprites) {
  if (otherPlayersSprites.has(playerData.id)) {
    // Player already exists, just update position
    const sprite = otherPlayersSprites.get(playerData.id);
    sprite.x = playerData.x;
    sprite.y = playerData.y;
    sprite.setTexture(playerData.avatar);
    return sprite;
  }

  // Create new player sprite
  const sprite = scene.add.sprite(playerData.x, playerData.y, playerData.avatar);
  sprite.setScale(0.4);
  sprite.setDepth(10); // Ensure other players appear above background elements
  
  // Add player name text above sprite
  const nameText = scene.add.text(playerData.x, playerData.y - 60, playerData.name, {
    fontSize: '16px',
    fill: playerData.isPaymanAuthenticated ? '#FFD700' : '#FFFFFF', // Gold for authenticated, white for anonymous
    backgroundColor: playerData.isPaymanAuthenticated ? '#2d7794' : '#666666',
    padding: { x: 8, y: 4 },
    borderRadius: 8,
  }).setOrigin(0.5);
  
  // Store reference to name text for updates
  sprite.nameText = nameText;
  sprite.playerData = playerData;
  
  // Store sprite reference
  otherPlayersSprites.set(playerData.id, sprite);
  
  return sprite;
}

// SIMPLE sprite position update (no complex animations)
export function updateOtherPlayerSprite(scene, playerData, otherPlayersSprites) {
  const sprite = otherPlayersSprites.get(playerData.id);
  if (!sprite) return;

  console.log(`🎭 Updating ${playerData.name} position: (${playerData.x}, ${playerData.y})`);

  // DIRECT position update - no tweening for immediate response
  sprite.x = playerData.x;
  sprite.y = playerData.y;

  // Update name text position
  if (sprite.nameText) {
    sprite.nameText.x = playerData.x;
    sprite.nameText.y = playerData.y - 60;
  }

  // Update avatar texture
  if (sprite.texture.key !== playerData.avatar) {
    sprite.setTexture(playerData.avatar);
    console.log(`🎭 Avatar changed for ${playerData.name}: ${playerData.avatar}`);
  }
  
  sprite.playerData = playerData;
}

// Remove other player sprite when they disconnect
export function removeOtherPlayerSprite(playerId, otherPlayersSprites) {
  const sprite = otherPlayersSprites.get(playerId);
  if (sprite) {
    if (sprite.nameText) {
      sprite.nameText.destroy();
    }
    sprite.destroy();
    otherPlayersSprites.delete(playerId);
  }
}

// Update all other player sprites based on current multiplayer state
export function updateAllOtherPlayers(scene, multiplayerPlayers, otherPlayersSprites) {
  multiplayerPlayers.forEach(playerData => {
    if (otherPlayersSprites.has(playerData.id)) {
      updateOtherPlayerSprite(scene, playerData, otherPlayersSprites);
    } else {
      createOtherPlayerSprite(scene, playerData, otherPlayersSprites);
    }
  });
}

// Show names of nearby players when in proximity
export function updateNearbyPlayerNames(nearbyPlayers, otherPlayersSprites, scene) {
  // Hide all names first
  otherPlayersSprites.forEach((sprite) => {
    if (sprite.nameText) {
      sprite.nameText.setVisible(false);
    }
  });

  // Show names for nearby players
  nearbyPlayers.forEach(nearbyPlayer => {
    const sprite = otherPlayersSprites.get(nearbyPlayer.id);
    if (sprite && sprite.nameText) {
      sprite.nameText.setVisible(true);
      
      // Update name and style based on authentication
      const isAuthenticated = nearbyPlayer.isPaymanAuthenticated;
      sprite.nameText.setText(nearbyPlayer.name);
      sprite.nameText.setStyle({
        fontSize: '16px',
        fill: isAuthenticated ? '#FFD700' : '#FFFFFF',
        backgroundColor: isAuthenticated ? '#2d7794' : '#666666',
        padding: { x: 8, y: 4 },
      });

      // Add authentication indicator
      if (isAuthenticated) {
        sprite.nameText.setText(`✓ ${nearbyPlayer.name}`);
      }
    }
  });
}

// Throttle position updates to avoid overwhelming the server
export function shouldSendPositionUpdate(currentPos, lastPositionSent, threshold = 10) {
  const now = Date.now();
  const timeSinceLastUpdate = now - lastPositionSent.time;
  
  // Send update if enough time has passed (at least 100ms) or position changed significantly
  if (timeSinceLastUpdate < 100) return false;
  
  const distance = Math.sqrt(
    Math.pow(currentPos.x - lastPositionSent.x, 2) + 
    Math.pow(currentPos.y - lastPositionSent.y, 2)
  );
  
  return distance >= threshold;
}

// Add multiplayer status indicator to the UI
export function createMultiplayerStatusIndicator(scene, isConnected, playerCount) {
  // Remove existing indicator if it exists
  if (scene.multiplayerStatusText) {
    scene.multiplayerStatusText.destroy();
  }

  const statusText = isConnected 
    ? `🌐 Multiplayer: ${playerCount} players online`
    : '🔴 Multiplayer: Disconnected';

  scene.multiplayerStatusText = scene.add.text(20, 20, statusText, {
    fontSize: '16px',
    fill: isConnected ? '#4CAF50' : '#F44336',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: { x: 10, y: 5 },
  }).setScrollFactor(0).setDepth(1000);
}

// Handle chat messages in the game world
export function showChatMessage(scene, message, otherPlayersSprites) {
  const sprite = otherPlayersSprites.get(message.playerId);
  if (!sprite) return;

  // Create chat bubble
  const chatBubble = scene.add.text(sprite.x, sprite.y - 100, message.message, {
    fontSize: '14px',
    fill: '#000000',
    backgroundColor: '#FFFFFF',
    padding: { x: 10, y: 8 },
    borderRadius: 15,
    wordWrap: { width: 200 },
    align: 'center'
  }).setOrigin(0.5);

  // Add authentication indicator to chat
  if (message.isPaymanAuthenticated) {
    chatBubble.setStyle({
      backgroundColor: '#E3F2FD',
      stroke: '#2d7794',
      strokeThickness: 2
    });
  }

  // Animate and remove chat bubble after 3 seconds
  scene.tweens.add({
    targets: chatBubble,
    alpha: 0,
    y: chatBubble.y - 30,
    duration: 3000,
    onComplete: () => {
      chatBubble.destroy();
    }
  });
} 