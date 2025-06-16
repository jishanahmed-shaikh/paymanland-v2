import React, { useState, useEffect } from 'react';

function PaymentInterface({ targetPlayer, currentPlayer, onPaymentComplete, onClose }) {
  const [amount, setAmount] = useState('');
  const [payeeId, setPayeeId] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const paymanClient = window.paymanClient;
      if (!paymanClient) {
        console.log('No Payman client available');
        return;
      }

      console.log('🏦 Fetching TSD balance...');
      const response = await paymanClient.ask("what is my total TSD balance?");
      console.log('Balance response:', response);
      
      if (response) {
        // Extract text content from response object
        let balanceText = '';
        if (typeof response === 'string') {
          balanceText = response;
        } else if (response.artifacts && response.artifacts.length > 0) {
          balanceText = response.artifacts[0].content || 'Balance information available';
        } else if (response.statusMessage) {
          balanceText = response.statusMessage;
        } else {
          balanceText = 'Balance fetched successfully';
        }
        setBalance(String(balanceText)); // Ensure it's always a string
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError(`Could not fetch balance: ${String(error.message || error)}`);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!payeeId.trim()) {
      setError('Please enter a payee ID');
      return;
    }

    const paymanClient = window.paymanClient;
    if (!paymanClient) {
      setError('PayMan client not available. Please connect your wallet first.');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      console.log('💸 Processing TSD payment...', { amount, payeeId, message });
      
      // Construct payment request
      const paymentMessage = message.trim() 
        ? `Send ${amount} TSD to payee ID ${payeeId} with message "${message}"` 
        : `Send ${amount} TSD to payee ID ${payeeId}`;
      
      console.log('Payment request:', paymentMessage);
      
      // Send payment using Payman SDK
      const response = await paymanClient.ask(paymentMessage);
      console.log('Payment response:', response);

      if (response) {
        // Extract response text for display
        let responseText = '';
        if (typeof response === 'string') {
          responseText = response;
        } else if (response.artifacts && response.artifacts.length > 0) {
          responseText = response.artifacts[0].content || 'Payment processed';
        } else if (response.statusMessage) {
          responseText = response.statusMessage;
        } else {
          responseText = 'Payment completed';
        }

        // Show simple success message (avoid complex response text)
        setSuccess(`Payment of ${amount} TSD sent successfully!`);
        
        // Notify parent component
        onPaymentComplete({
          amount: parseFloat(amount),
          currency: 'TSD',
          payeeId: payeeId,
          message: message,
          targetPlayer: targetPlayer,
          timestamp: new Date().toISOString(),
          responseText: String(responseText) // Ensure it's a string
        });

        // Clear form
        setAmount('');
        setPayeeId('');
        setMessage('');
        
        // Refresh balance
        setTimeout(fetchBalance, 1000);
        
      } else {
        setError('Payment failed - no response from server');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(`Payment failed: ${String(error.message || error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '15px'
        }}>
          <h2 style={{ margin: 0, color: '#333' }}>💰 Send TSD Payment</h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              padding: '0'
            }}
          >×</button>
        </div>

        {/* Target Player Info */}
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '25px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              👤
            </div>
            <div>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: '18px',
                color: '#333'
              }}>
                Sending to: {targetPlayer.name}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                Player ID: {targetPlayer.id}
              </div>
            </div>
          </div>
        </div>

        {/* Balance Display */}
        {balance && (
          <div style={{
            backgroundColor: '#e8f5e8',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            border: '1px solid #c8e6c9'
          }}>
            <div style={{ fontSize: '14px', color: '#2e7d32', fontWeight: 'bold' }}>
              💳 Your Balance: {balance}
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handlePayment}>
          {/* Amount Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#333'
            }}>
              💰 Amount (TSD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount (e.g., 10.50)"
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: isProcessing ? '#f5f5f5' : 'white'
              }}
            />
          </div>

          {/* Payee ID Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#333'
            }}>
              🎯 Payee ID *
            </label>
            <input
              type="text"
              value={payeeId}
              onChange={(e) => setPayeeId(e.target.value)}
              placeholder="Enter payee ID (e.g., test-payee-123)"
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: isProcessing ? '#f5f5f5' : 'white'
              }}
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              💡 Tip: Use a test payee ID from your Payman dashboard
            </div>
          </div>

          {/* Message Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{
              display: 'block',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#333'
            }}>
              💬 Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message for this payment..."
              disabled={isProcessing}
              rows="3"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: isProcessing ? '#f5f5f5' : 'white',
                resize: 'vertical',
                minHeight: '80px'
              }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={isProcessing || !amount || !payeeId}
              style={{
                flex: 1,
                padding: '15px',
                backgroundColor: isProcessing || !amount || !payeeId ? '#ccc' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: isProcessing || !amount || !payeeId ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isProcessing ? '⏳ Processing...' : '💸 Send Payment'}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                padding: '15px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: isProcessing ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📝 How to use:</div>
          <div>1. Enter the amount in TSD (Test dollars)</div>
          <div>2. Enter the payee ID from your Payman dashboard</div>
          <div>3. Add an optional message</div>
          <div>4. Click "Send Payment" to process</div>
        </div>
      </div>
    </div>
  );
}

export default PaymentInterface; 