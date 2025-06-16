import React, { useState, useEffect } from 'react';

function PaymentNotification({ notification, onClose, onAccept, onDecline }) {
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to respond
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-close after timeout
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTimeout = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleAccept = () => {
    setIsVisible(false);
    setTimeout(() => {
      onAccept();
    }, 300);
  };

  const handleDecline = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDecline();
    }, 300);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '20px',
      minWidth: '350px',
      maxWidth: '400px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      border: '3px solid #4caf50',
      zIndex: 3000,
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'transform 0.3s ease-in-out',
      animation: isVisible ? 'slideIn 0.3s ease-out' : 'none'
    }}>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
        borderBottom: '2px solid #f0f0f0',
        paddingBottom: '10px'
      }}>
        <div style={{
          fontSize: '24px',
          marginRight: '10px',
          animation: 'pulse 2s infinite'
        }}>
          💰
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            color: '#4caf50',
            fontSize: '18px',
            fontWeight: 'bold'
          }}>
            Payment Received!
          </h3>
          <div style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '2px'
          }}>
            {formatTime(notification.timestamp)}
          </div>
        </div>
        <div style={{
          backgroundColor: timeLeft <= 5 ? '#ff5722' : '#ff9800',
          color: 'white',
          borderRadius: '50%',
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {timeLeft}
        </div>
      </div>

      {/* Sender Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        padding: '15px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: notification.fromPlayer.isPaymanAuthenticated ? '#4caf50' : '#ff9800',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginRight: '15px'
        }}>
          👤
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {notification.fromPlayer.name}
            {notification.fromPlayer.isPaymanAuthenticated && (
              <span style={{ color: '#4caf50', fontSize: '16px' }}>✓</span>
            )}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            wants to send you
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div style={{
        backgroundColor: '#e8f5e8',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '15px',
        textAlign: 'center',
        border: '2px solid #4caf50'
      }}>
        <div style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#4caf50',
          marginBottom: '5px'
        }}>
          {notification.amount} {notification.currency}
        </div>
        {notification.message && (
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontStyle: 'italic',
            marginTop: '10px',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            "{notification.message}"
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={handleDecline}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#d32f2f'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#f44336'}
        >
          ❌ Decline
        </button>
        <button
          onClick={handleAccept}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#4caf50'}
        >
          ✅ Accept
        </button>
      </div>

      {/* Warning */}
      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#fff3e0',
        borderRadius: '8px',
        border: '1px solid #ffe0b2',
        fontSize: '12px',
        color: '#ef6c00',
        textAlign: 'center'
      }}>
        <strong>⚠️ Warning:</strong> Only accept payments from trusted users. 
        This notification will auto-close in {timeLeft} seconds.
      </div>
    </div>
  );
}

export default PaymentNotification; 