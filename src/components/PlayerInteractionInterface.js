import React, { useState, useEffect, useRef } from 'react';
import multiplayerService from '../services/MultiplayerService';
import PaymentInterface from './PaymentInterface';
import PlayerChatInterface from './PlayerChatInterface';

function PlayerInteractionInterface({ 
  currentPlayer, 
  nearbyPlayers, 
  onClose, 
  playerPosition,
  paymanClient 
}) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [interactionDistance] = useState(150); // pixels
  const [interactablePlayers, setInteractablePlayers] = useState([]);

  // Filter players within interaction distance
  useEffect(() => {
    if (!playerPosition || !nearbyPlayers) return;

    const interactable = nearbyPlayers.filter(player => {
      const distance = Math.sqrt(
        Math.pow(player.x - playerPosition.x, 2) + 
        Math.pow(player.y - playerPosition.y, 2)
      );
      return distance <= interactionDistance;
    });

    setInteractablePlayers(interactable);
  }, [nearbyPlayers, playerPosition, interactionDistance]);

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
  };

  const handleSendPayment = () => {
    if (!selectedPlayer) return;
    setShowPayment(true);
    setShowChat(false);
  };

  const handleStartChat = () => {
    if (!selectedPlayer) return;
    setShowChat(true);
    setShowPayment(false);
  };

  const handlePaymentComplete = (paymentData) => {
    // Handle successful payment
    console.log('Payment completed:', paymentData);
    
    // Send payment notification to other player
    multiplayerService.sendPaymentNotification({
      fromPlayer: currentPlayer,
      toPlayer: selectedPlayer,
      amount: paymentData.amount,
      currency: paymentData.currency,
      message: paymentData.message
    });

    setShowPayment(false);
    setSelectedPlayer(null);
  };

  const handleChatMessage = (message) => {
    console.log('💬 Sending simple message:', message, 'to player:', selectedPlayer.id);
    
    // Send chat message to specific player (SIMPLIFIED)
    multiplayerService.sendDirectMessage({
      toPlayer: { id: selectedPlayer.id },
      message: message
    });
  };

  if (interactablePlayers.length === 0) {
    return (
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 1000
      }}>
        No nearby players to interact with
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      minWidth: '300px',
      maxWidth: '400px',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>Nearby Players</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#666'
          }}
        >×</button>
      </div>

      {/* Player List */}
      <div style={{ marginBottom: '20px' }}>
        {interactablePlayers.map(player => (
          <div
            key={player.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              margin: '8px 0',
              backgroundColor: selectedPlayer?.id === player.id ? '#e3f2fd' : '#f8f9fa',
              borderRadius: '8px',
              cursor: 'pointer',
              border: selectedPlayer?.id === player.id ? '2px solid #2196f3' : '1px solid #e0e0e0',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handlePlayerSelect(player)}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: player.isPaymanAuthenticated ? '#4caf50' : '#ff9800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px',
              fontSize: '20px'
            }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ 
                fontWeight: 'bold', 
                color: '#333',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                {player.name}
                {player.isPaymanAuthenticated && (
                  <span style={{ color: '#4caf50', fontSize: '16px' }}>✓</span>
                )}
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: '#666' 
              }}>
                {Math.round(Math.sqrt(
                  Math.pow(player.x - playerPosition.x, 2) + 
                  Math.pow(player.y - playerPosition.y, 2)
                ))}px away
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {selectedPlayer && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '15px'
        }}>
          <button
            onClick={handleStartChat}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1976d2'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#2196f3'}
          >
            💬 Chat
          </button>
          <button
            onClick={handleSendPayment}
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}
          >
            💰 Send TSD
          </button>
        </div>
      )}

      {/* Debug Section - Test Message */}
      {selectedPlayer && process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '15px',
          padding: '15px',
          backgroundColor: '#fff3e0',
          borderRadius: '8px',
          border: '1px solid #ffe0b2'
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 'bold', 
            marginBottom: '10px',
            color: '#ef6c00'
          }}>
            🔧 Debug Tools
          </div>
          <button
            onClick={() => {
              console.log('🧪 Sending test message...');
              handleChatMessage('Hello! This is a test message.');
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            🧪 Send Test Message
          </button>
        </div>
      )}

      {!selectedPlayer && (
        <div style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '14px',
          fontStyle: 'italic',
          padding: '20px'
        }}>
          Select a player to start interacting
        </div>
      )}

      {/* Payment Interface Modal */}
      {showPayment && selectedPlayer && (
        <PaymentInterface
          targetPlayer={selectedPlayer}
          currentPlayer={currentPlayer}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* Player Chat Interface Modal */}
      {showChat && selectedPlayer && (
        <PlayerChatInterface
          targetPlayer={selectedPlayer}
          currentPlayer={currentPlayer}
          onSendMessage={handleChatMessage}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}

export default PlayerInteractionInterface; 