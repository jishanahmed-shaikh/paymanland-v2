import React, { useState, useEffect, useRef } from 'react';
import { PaymanClient } from "@paymanai/payman-ts";
import './WalletConnect.css';

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const connectButtonRef = useRef(null);
  const isFetchingBalance = useRef(false);
  
  useEffect(() => {
    console.log("WalletConnect component mounted");
    
    // Add event listener for balance refresh
    const handleRefreshBalance = () => {
      if (client) {
        console.log("Refreshing wallet balance after payment...");
        fetchBalance(client);
      }
    };
    
    window.addEventListener('refreshWalletBalance', handleRefreshBalance);
    
    // Check for existing token
    const checkExistingToken = async () => {
      const storedTokenData = localStorage.getItem('paymanToken');
      if (storedTokenData) {
        try {
          const clientId = process.env.REACT_APP_PAYMAN_CLIENT_ID;
          if (!clientId) {
            console.error("REACT_APP_PAYMAN_CLIENT_ID environment variable is not set");
            localStorage.removeItem('paymanToken');
            return;
          }
          
          let tokenData;
          try {
            tokenData = JSON.parse(storedTokenData);
          } catch (parseError) {
            // Handle old format (just access token string)
            tokenData = { accessToken: storedTokenData };
          }
          
          console.log("Loading stored token data:", tokenData);
          
          // Check if token is expired
          const now = Date.now();
          const tokenAge = now - (tokenData.timestamp || 0);
          const expiresInMs = (tokenData.expiresIn || 3600) * 1000;
          
          if (tokenData.timestamp && tokenAge >= expiresInMs) {
            console.log("Stored token is expired, clearing it");
            localStorage.removeItem('paymanToken');
            return;
          }
          
          const newClient = PaymanClient.withToken(clientId, {
            accessToken: tokenData.accessToken,
            expiresIn: tokenData.expiresIn
          });
          
          // Verify token is valid by making a simple request
          try {
            await newClient.ask("list all wallets");
            setClient(newClient);
            setIsConnected(true);
            
            // Expose client globally
            window.paymanClient = newClient;
            console.log("Payman client exposed globally");
            
            fetchBalance(newClient);
          } catch (error) {
            console.log("Stored token is invalid, clearing it:", error.message);
            localStorage.removeItem('paymanToken');
          }
        } catch (error) {
          console.error('Failed to initialize Payman with stored token:', error);
          localStorage.removeItem('paymanToken');
        }
      }
    };
    
    checkExistingToken();
    
    // Set up message listener for the Connect Button message
    window.addEventListener("message", handlePaymanMessage);
    
    // Load the Payman Connect script
    const loadPaymanScript = () => {
      console.log("Attempting to load Payman Connect script");
      
      // Remove any existing script to avoid duplicates
      const existingScript = document.querySelector('script[src="https://app.paymanai.com/js/pm.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      
      const script = document.createElement('script');
      script.src = "https://app.paymanai.com/js/pm.js";
      
      const clientId = process.env.REACT_APP_PAYMAN_CLIENT_ID;
      if (!clientId) {
        console.error("REACT_APP_PAYMAN_CLIENT_ID environment variable is not set");
        return;
      }
      
      script.setAttribute('data-client-id', clientId);
      script.setAttribute('data-scopes', "read_balance,read_list_wallets,read_list_payees,read_list_transactions,write_create_payee,write_send_payment,write_create_wallet");
      
      // Use environment variable for redirect URI if available, otherwise construct it
      const redirectUri = process.env.REACT_APP_PAYMAN_REDIRECT_URI || 
        `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/callback`;
      console.log("Setting redirect URI to:", redirectUri);
      script.setAttribute('data-redirect-uri', redirectUri);
      
      script.setAttribute('data-target', "#payman-connect-container");
      script.setAttribute('data-dark-mode', "true");
      script.setAttribute('data-styles', JSON.stringify({
        borderRadius: "8px", 
        fontSize: "14px",
        padding: "10px 20px", 
        backgroundColor: "#4CAF50",
        color: "white"
      }));
      
      script.onload = () => {
        console.log("Payman Connect script loaded successfully");
        setScriptLoaded(true);
      };
      
      script.onerror = (error) => {
        console.error("Failed to load Payman Connect script:", error);
        setScriptLoaded(false);
      };
      
      document.body.appendChild(script);
      console.log("Script appended to body");
      
      // Debug: Check if env variables are available
      console.log("Client ID used:", clientId);
      console.log("All environment variables:", {
        REACT_APP_PAYMAN_CLIENT_ID: process.env.REACT_APP_PAYMAN_CLIENT_ID,
        REACT_APP_PAYMAN_REDIRECT_URI: process.env.REACT_APP_PAYMAN_REDIRECT_URI,
        REACT_APP_PAYMAN_CLIENT_SECRET: process.env.REACT_APP_PAYMAN_CLIENT_SECRET ? "Present" : "Missing"
      });
    };
    
    // Small delay to ensure DOM is fully rendered
    setTimeout(loadPaymanScript, 300);
    
    return () => {
      window.removeEventListener("message", handlePaymanMessage);
      window.removeEventListener('refreshWalletBalance', handleRefreshBalance);
    };
  }, []);
  
  const handlePaymanMessage = async (event) => {
    console.log("Received message:", event.data);
    if (event.data.type === "payman-oauth-redirect") {
      setLoading(true);
      try {
        // Extract code from the redirect URI
        const url = new URL(event.data.redirectUri);
        const code = url.searchParams.get("code");
        console.log("Received OAuth code:", code ? "Code received" : "No code found");
        
        if (code) {
          await exchangeCodeForToken(code);
        }
      } catch (error) {
        console.error("Error handling OAuth redirect:", error);
        setLoading(false);
        alert("Failed to connect wallet. Please try again.");
      }
    }
  };
  
  const exchangeCodeForToken = async (code) => {
    try {
      console.log("Exchanging code for token...");
      
      // For security, token exchange should be done on the backend
      // But for testing purposes, we'll check if we can use the client credentials flow
      const clientId = process.env.REACT_APP_PAYMAN_CLIENT_ID;
      
      if (!clientId) {
        throw new Error("Client ID not configured");
      }

      // Note: In production, this should be done via your backend API
      // For now, we'll try the client credentials approach for testing
      try {
        // First, let's try to get a client credentials token for testing
        const clientCredentialsClient = PaymanClient.withClientCredentials({
          clientId: clientId,
          clientSecret: process.env.REACT_APP_PAYMAN_CLIENT_SECRET || ""
        });

        // Test if we can make a request
        await clientCredentialsClient.ask("list all wallets");
        
        // If successful, get the token
        const tokenResponse = await clientCredentialsClient.getAccessToken();
        console.log("Full client credentials token response:", tokenResponse);
        
        // Store the complete token information
        const tokenData = {
          accessToken: tokenResponse.accessToken,
          expiresIn: tokenResponse.expiresIn,
          tokenType: tokenResponse.tokenType,
          scope: tokenResponse.scope,
          timestamp: Date.now()
        };
        
        localStorage.setItem('paymanToken', JSON.stringify(tokenData));
        console.log("Token received and stored via client credentials:", tokenData);
        
        // Create a new client with the access token
        const newClient = PaymanClient.withToken(clientId, {
          accessToken: tokenResponse.accessToken,
          expiresIn: tokenResponse.expiresIn
        });
        
        setClient(newClient);
        setIsConnected(true);
        
        // Expose client globally
        window.paymanClient = newClient;
        console.log("Payman client exposed globally (client credentials)");
        
        // Add delay before fetching balance
        setTimeout(() => {
          fetchBalance(newClient);
        }, 1000);
        
        setLoading(false);
        
      } catch (clientCredError) {
        console.log("Client credentials approach failed, trying auth code...");
        
        // If client credentials doesn't work, try the auth code approach
        // Note: This is not recommended for production as it exposes the client secret
      const tempClient = PaymanClient.withAuthCode(
        {
            clientId: clientId,
            clientSecret: process.env.REACT_APP_PAYMAN_CLIENT_SECRET || ""
        },
        code
      );
      
      const tokenResponse = await tempClient.getAccessToken();
        console.log("Full token response:", tokenResponse);
        
        // Store the complete token information
        const tokenData = {
          accessToken: tokenResponse.accessToken,
          expiresIn: tokenResponse.expiresIn,
          tokenType: tokenResponse.tokenType,
          scope: tokenResponse.scope,
          refreshToken: tokenResponse.refreshToken,
          timestamp: Date.now()
        };
        
        localStorage.setItem('paymanToken', JSON.stringify(tokenData));
        console.log("Token received and stored via auth code:", tokenData);
        
        const newClient = PaymanClient.withToken(clientId, {
        accessToken: tokenResponse.accessToken,
          expiresIn: tokenResponse.expiresIn
      });
      
      setClient(newClient);
      setIsConnected(true);
      
      // Expose client globally
      window.paymanClient = newClient;
      console.log("Payman client exposed globally (auth code)");
        
        // Try to fetch balance immediately using the temp client instead of new client
        try {
          await fetchBalance(tempClient);
        } catch (balanceError) {
          console.log("Balance fetch failed with temp client, trying with new client...");
          // Add delay before fetching balance to ensure token is properly set
          setTimeout(() => {
      fetchBalance(newClient);
          }, 1000);
        }
        
      setLoading(false);
      }
      
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      console.error('Error details:', error.response?.data || error.message);
      setLoading(false);
      alert(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
    }
  };

  const fetchBalance = async (paymanClient) => {
    // Prevent multiple simultaneous balance fetches
    if (isFetchingBalance.current) {
      console.log("Balance fetch already in progress, skipping...");
      return;
    }
    
    isFetchingBalance.current = true;
    
    try {
      console.log("Fetching balance...");
      
      // Simple single query approach
      const balanceResponse = await paymanClient.ask("what is my total TSD balance?");
      console.log("TSD balance response:", balanceResponse);
      
      let balanceValue = null;
      
      // Extract balance from artifacts content
      if (balanceResponse && balanceResponse.artifacts && balanceResponse.artifacts.length > 0) {
        const artifact = balanceResponse.artifacts[0];
        if (artifact && artifact.content) {
          const content = artifact.content;
          console.log("Artifact content:", content);
          
          // Flexible extraction: handle multiple formats
          // Pattern 1: Total TSD Balance
          let totalMatch = content.match(/Total.*?Balance[*:\s|]*\*?\*?\s*\$?([\d,]+\.?\d*)/i);
          if (totalMatch) {
            balanceValue = parseFloat(totalMatch[1].replace(/,/g, ''));
            console.log("Extracted total balance:", balanceValue);
          } else {
            // Pattern 2: Spendable Balance (including table format)
            const spendableMatch = content.match(/Spendable.*?Balance[*:\s|]*\*?\*?\s*\$?([\d,]+\.?\d*)/i);
            if (spendableMatch) {
              balanceValue = parseFloat(spendableMatch[1].replace(/,/g, ''));
              console.log("Extracted spendable balance:", balanceValue);
            } else {
              // Pattern 3: Any $amount in table format
              const tableMatch = content.match(/\|\s*\$?([\d,]+\.?\d*)\s*\|/);
              if (tableMatch) {
                balanceValue = parseFloat(tableMatch[1].replace(/,/g, ''));
                console.log("Extracted table balance:", balanceValue);
              }
            }
          }
        }
      }
      
      // Set the balance
      if (balanceValue && balanceValue > 0) {
        setBalance(balanceValue);
        console.log("Balance set to:", balanceValue);
      } else {
        setBalance("Unable to fetch balance");
        console.log("Could not extract valid balance");
      }
      
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      
      if (error.message && error.message.includes('expired')) {
        console.log("Token expired, clearing stored token");
        localStorage.removeItem('paymanToken');
        setClient(null);
        setIsConnected(false);
        setBalance(null);
        alert('Session expired. Please reconnect your wallet.');
      } else {
        alert(`Error fetching balance: ${error.message || 'Unknown error'}`);
        setBalance("Error fetching balance");
      }
    } finally {
      isFetchingBalance.current = false;
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('paymanToken');
    setClient(null);
    setIsConnected(false);
    setBalance(null);
    
    // Clear global client
    window.paymanClient = null;
    console.log("Payman client cleared from global scope");
    
    alert('Wallet Disconnected');
  };

  const handleDirectConnect = async () => {
    console.log("Direct connect button clicked");
    setLoading(true);
    
    try {
      const clientId = process.env.REACT_APP_PAYMAN_CLIENT_ID;
      const clientSecret = process.env.REACT_APP_PAYMAN_CLIENT_SECRET;
      
      if (!clientId) {
        throw new Error("REACT_APP_PAYMAN_CLIENT_ID environment variable is not set");
      }
      
      if (!clientSecret) {
        throw new Error("REACT_APP_PAYMAN_CLIENT_SECRET environment variable is not set");
      }
      
      console.log("Using Client ID:", clientId);
      console.log("Client Secret available:", clientSecret ? "Yes" : "No");
      
      // Use Client Credentials Flow directly
      const directClient = PaymanClient.withClientCredentials({
        clientId: clientId,
        clientSecret: clientSecret
      });
      
      // Test the connection
      const testResponse = await directClient.ask("list all wallets");
      console.log("Test response:", testResponse);
      
      // Get the access token
      const tokenResponse = await directClient.getAccessToken();
      console.log("Full direct token response:", tokenResponse);
      
      // Store the complete token information
      const tokenData = {
        accessToken: tokenResponse.accessToken,
        expiresIn: tokenResponse.expiresIn,
        tokenType: tokenResponse.tokenType,
        scope: tokenResponse.scope,
        timestamp: Date.now()
      };
      
      localStorage.setItem('paymanToken', JSON.stringify(tokenData));
      console.log("Token received and stored via direct connection:", tokenData);
      
      setClient(directClient);
      setIsConnected(true);
      
      // Expose client globally
      window.paymanClient = directClient;
      console.log("Payman client exposed globally (direct)");
      
      // Add delay before fetching balance
      setTimeout(() => {
        fetchBalance(directClient);
      }, 1000);
      
      setLoading(false);
      
    } catch (error) {
      console.error('Direct connect failed:', error);
      console.error('Error details:', error.response?.data || error.message);
      setLoading(false);
      alert(`Direct connect failed: ${error.message || 'Unknown error'}`);
    }
  };
  
  const handleManualConnect = () => {
    console.log("Manual connect button clicked");
    setLoading(true);
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    // Use environment variable for redirect URI if available, otherwise construct it
    const redirectUri = process.env.REACT_APP_PAYMAN_REDIRECT_URI || 
      `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/callback`;

    // Use proper OAuth scopes with correct format (comma-separated)
    const scopes = [
      'read_balance',
      'read_list_wallets', 
      'read_list_payees',
      'read_list_transactions',
      'write_create_payee',
      'write_send_payment',
      'write_create_wallet'
    ].join(',');

    const clientId = process.env.REACT_APP_PAYMAN_CLIENT_ID;
    
    if (!clientId) {
      console.error("REACT_APP_PAYMAN_CLIENT_ID environment variable is not set");
      setLoading(false);
      alert("Configuration error: Client ID not found. Please check your environment variables.");
      return;
    }

    const authUrl = `https://app.paymanai.com/oauth/authorize?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scopes)}`;

    console.log("Auth URL:", authUrl);
    console.log("Client ID:", clientId);
    console.log("Redirect URI:", redirectUri);
    
    window.open(
      authUrl,
      'Payman Login',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  // Effect to update global client when client state changes
  useEffect(() => {
    if (client && isConnected) {
      window.paymanClient = client;
      console.log("Payman client updated globally");
    } else {
      window.paymanClient = null;
      console.log("Payman client removed from global scope");
    }
  }, [client, isConnected]);

  return (
    <>
      <div className="wallet-container">
        {!isConnected ? (
          <div className="connect-wrapper">
            <div id="payman-connect-container" className="payman-connect-btn">
              {/* Payman Connect Button will be rendered here */}
              {loading && <span className="loading-indicator">Connecting...</span>}
            </div>
            
            {/* Always show fallback button for now until we debug the script loading issue */}
            <button 
              className="connect-button fallback" 
              onClick={handleManualConnect}
            >
              Connect Payman Wallet (OAuth)
            </button>
            
            <button 
              className="connect-button fallback" 
              onClick={handleDirectConnect}
              style={{ marginTop: '10px', backgroundColor: '#4a90e2' }}
            >
              Connect Direct (Test Mode)
            </button>
          </div>
        ) : (
          <div className="wallet-info">
            <div className="balance-container">
              <span className="balance-label">Balance:</span>
              <span className="balance-amount">{balance ? `${balance} TSD` : 'Loading...'}</span>
            </div>
            <button className="disconnect-button" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WalletConnect; 