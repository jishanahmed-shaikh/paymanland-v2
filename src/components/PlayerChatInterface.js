import React, { useState, useEffect, useRef, useCallback } from 'react';
import multiplayerService from '../services/MultiplayerService';

function PlayerChatInterface({ targetPlayer, currentPlayer, onSendMessage, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherPlayerTyping, setOtherPlayerTyping] = useState(false);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const setupMessageListeners = useCallback(() => {
    // Listen for direct messages (SIMPLIFIED)
    multiplayerService.on('direct-message', (messageData) => {
      console.log('🎯 Chat received message:', messageData);
      
      if (messageData.fromPlayerId === targetPlayer.id) {
        const newMessage = {
          id: Date.now(),
          type: 'received',
          content: messageData.message,
          timestamp: messageData.timestamp || new Date().toISOString(),
          sender: { name: messageData.fromPlayerName }
        };
        console.log('✅ Adding message to chat:', newMessage);
        setMessages(prev => [...prev, newMessage]);
      }
    });

    // Listen for typing indicators
    multiplayerService.on('player-typing', (typingData) => {
      if (typingData.playerId === targetPlayer.id) {
        setOtherPlayerTyping(true);
      }
    });

    multiplayerService.on('player-stopped-typing', (typingData) => {
      if (typingData.playerId === targetPlayer.id) {
        setOtherPlayerTyping(false);
      }
    });
  }, [targetPlayer.id]);

  useEffect(() => {
    // Focus on input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Setup message listeners
    setupMessageListeners();

    // Send initial greeting
    const greeting = {
      id: Date.now(),
      type: 'system',
      content: `You are now chatting with ${targetPlayer.name}`,
      timestamp: new Date().toISOString()
    };
    setMessages([greeting]);

    return () => {
      // Cleanup listeners
      multiplayerService.off('direct-message');
      multiplayerService.off('player-typing');
      multiplayerService.off('player-stopped-typing');
    };
  }, [targetPlayer, setupMessageListeners]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      multiplayerService.sendTypingIndicator(targetPlayer.id, true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      multiplayerService.sendTypingIndicator(targetPlayer.id, false);
    }, 1000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // Stop typing indicator
    setIsTyping(false);
    multiplayerService.sendTypingIndicator(targetPlayer.id, false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Add message to local chat
    const newMessage = {
      id: Date.now(),
      type: 'sent',
      content: messageText,
      timestamp: new Date().toISOString(),
      sender: currentPlayer
    };
    setMessages(prev => [...prev, newMessage]);

    // Send message through multiplayer service
    onSendMessage(messageText);

    // Refocus input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    // Stop event propagation to prevent game controls
    e.stopPropagation();
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '2px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            backgroundColor: targetPlayer.isPaymanAuthenticated ? '#4caf50' : '#ff9800',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            👤
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ 
              margin: 0, 
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {targetPlayer.name}
              {targetPlayer.isPaymanAuthenticated && (
                <span style={{ color: '#4caf50', fontSize: '16px' }}>✓</span>
              )}
            </h3>
            <div style={{ 
              fontSize: '12px', 
              color: '#666',
              marginTop: '2px'
            }}>
              {otherPlayerTyping ? 'Typing...' : 'Online'}
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              padding: '5px'
            }}
          >×</button>
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          backgroundColor: '#fafafa'
        }}>
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.type === 'system' ? (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '14px',
                  fontStyle: 'italic',
                  padding: '10px',
                  backgroundColor: '#e8f4f8',
                  borderRadius: '8px'
                }}>
                  {msg.content}
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: msg.type === 'sent' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: '8px'
                }}>
                  {msg.type === 'received' && (
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: targetPlayer.isPaymanAuthenticated ? '#4caf50' : '#ff9800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      👤
                    </div>
                  )}
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 16px',
                    borderRadius: msg.type === 'sent' ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
                    backgroundColor: msg.type === 'sent' ? '#2196f3' : '#ffffff',
                    color: msg.type === 'sent' ? 'white' : '#333',
                    wordBreak: 'break-word',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    border: msg.type === 'received' ? '1px solid #e0e0e0' : 'none'
                  }}>
                    <div>{msg.content}</div>
                    <div style={{
                      fontSize: '11px',
                      marginTop: '4px',
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  {msg.type === 'sent' && (
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: '#2196f3',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0
                    }}>
                      👤
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Typing Indicator */}
          {otherPlayerTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '8px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: targetPlayer.isPaymanAuthenticated ? '#4caf50' : '#ff9800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                👤
              </div>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#f0f0f0',
                borderRadius: '18px',
                fontSize: '14px',
                color: '#666',
                fontStyle: 'italic'
              }}>
                Typing...
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form 
          onSubmit={handleSubmit} 
          style={{
            padding: '20px',
            borderTop: '2px solid #f0f0f0',
            display: 'flex',
            gap: '12px',
            backgroundColor: 'white'
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${targetPlayer.name}...`}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '2px solid #e0e0e0',
              borderRadius: '24px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: '#f9f9f9'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2196f3';
              e.target.style.backgroundColor = 'white';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.backgroundColor = '#f9f9f9';
            }}
          />
          <button 
            type="submit" 
            disabled={!inputMessage.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: !inputMessage.trim() ? '#cccccc' : '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '24px',
              cursor: !inputMessage.trim() ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
              minWidth: '80px'
            }}
            onMouseOver={(e) => {
              if (inputMessage.trim()) {
                e.target.style.backgroundColor = '#1976d2';
              }
            }}
            onMouseOut={(e) => {
              if (inputMessage.trim()) {
                e.target.style.backgroundColor = '#2196f3';
              }
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default PlayerChatInterface; 