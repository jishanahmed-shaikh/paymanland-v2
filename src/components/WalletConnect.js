import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PaymanClient } from "@paymanai/payman-ts";
import './WalletConnect.css';

const WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const isFetchingBalance = useRef(false);
  const scriptLoadedRef = useRef(false);
  const containerRef = useRef(null);
  
  // Define exchangeCodeForToken first
  const exchangeCodeForToken = useCallback(async (code) => {
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
        
      } catch (clientCredentialsError) {
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
  }, []);

  const handlePaymanMessage = useCallback(async (event) => {
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
  }, [exchangeCodeForToken]);

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
    
    return () => {
      window.removeEventListener("message", handlePaymanMessage);
      window.removeEventListener('refreshWalletBalance', handleRefreshBalance);
    };
  }, [handlePaymanMessage]);

  // Separate useEffect for script loading to prevent multiple loads
  useEffect(() => {
    // Only load script if not connected and not already loaded and no button exists
    if (!isConnected && !scriptLoadedRef.current && !containerRef.current?.querySelector('.payman-button')) {
      const loadPaymanScript = () => {
        console.log("Attempting to load Payman Connect script");
        
        // Check if script is already loaded globally and button exists
        if (window.PaymanConnect && containerRef.current?.querySelector('.payman-button')) {
          console.log("Payman script already loaded and button exists in container");
          setScriptLoaded(true);
          scriptLoadedRef.current = true;
          return;
        }
        
        // Prevent multiple script loads
        if (scriptLoadedRef.current) {
          console.log("Script loading already in progress");
          return;
        }
        
        scriptLoadedRef.current = true;
        
        // COMPREHENSIVE CLEANUP FUNCTION
        const cleanupPaymanButtons = () => {
          console.log("🧹 Performing comprehensive Payman button cleanup...");
          
          // Remove any existing scripts
          const existingScripts = document.querySelectorAll('script[src="https://app.paymanai.com/js/pm.js"]');
          existingScripts.forEach(script => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
              console.log("Removed existing Payman script");
            }
          });
          
          // Remove ONLY orphaned buttons that are NOT in our designated container
          const buttonSelectors = [
            'body > .payman-button',
            'body > button[class*="payman"]',
            'body > button[id*="payman"]',
            'body > div[class*="payman-button"]'
          ];
          
          buttonSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
              // Only remove if it's directly attached to body (orphaned)
              if (element.parentNode === document.body) {
                console.log(`Removing orphaned element: ${selector}`, element);
                element.remove();
              }
            });
          });
          
          // Clear the specific container ONLY if we're about to load a new script
          if (containerRef.current && !window.PaymanConnect) {
            containerRef.current.innerHTML = '';
            console.log("Cleared container content for new script load");
          }
          
          // Clear any global Payman state that might cause duplicates
          if (window.PaymanConnect && !containerRef.current?.querySelector('.payman-button')) {
            try {
              // Only clear if there's no legitimate button in our container
              delete window.PaymanConnect;
              console.log("Cleared global PaymanConnect");
            } catch (e) {
              console.log("Could not clear global PaymanConnect:", e.message);
            }
          }
        };
        
        // Perform initial cleanup
        cleanupPaymanButtons();
        
        const script = document.createElement('script');
        script.src = "https://app.paymanai.com/js/pm.js";
        
        const clientId = process.env.REACT_APP_PAYMAN_CLIENT_ID;
        if (!clientId) {
          console.error("REACT_APP_PAYMAN_CLIENT_ID environment variable is not set");
          scriptLoadedRef.current = false;
          return;
        }
        
        // Create unique instance ID to prevent conflicts
        const instanceId = `payman-wallet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        script.setAttribute('data-client-id', clientId);
        script.setAttribute('data-scopes', "read_balance,read_list_wallets,read_list_payees,read_list_transactions,write_create_payee,write_send_payment,write_create_wallet");
        
        // Use environment variable for redirect URI if available, otherwise construct it
        const redirectUri = process.env.REACT_APP_PAYMAN_REDIRECT_URI || 
          `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/callback`;
        console.log("Setting redirect URI to:", redirectUri);
        script.setAttribute('data-redirect-uri', redirectUri);
        
        script.setAttribute('data-target', "#payman-connect-container");
        script.setAttribute('data-dark-mode', "true");
        script.setAttribute('data-instance-id', instanceId);
        script.setAttribute('data-styles', JSON.stringify({
          borderRadius: "12px", 
          fontSize: "14px",
          padding: "12px 24px", 
          backgroundColor: "#2d7794",
          color: "white",
          border: "none",
          fontWeight: "600",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          cursor: "pointer",
          width: "100%",
          textAlign: "center",
          letterSpacing: "0.5px"
        }));
        
        script.onload = () => {
          console.log("✅ Payman Connect script loaded successfully");
          setScriptLoaded(true);
          
          // Check if button was created in our container
          setTimeout(() => {
            const buttonInContainer = containerRef.current?.querySelector('.payman-button');
            if (buttonInContainer) {
              console.log("✅ Button successfully created in container:", buttonInContainer);
            } else {
              console.log("⚠️ No button found in container after script load");
            }
          }, 500);
          
          // Additional cleanup after script loads - only remove truly orphaned buttons
          setTimeout(() => {
            const orphanedButtons = document.querySelectorAll('body > .payman-button, body > button[class*="payman"]');
            if (orphanedButtons.length > 0) {
              console.log(`🧹 Post-load cleanup: removing ${orphanedButtons.length} orphaned buttons`);
              orphanedButtons.forEach(button => {
                if (button.parentNode === document.body) {
                  button.remove();
                }
              });
            }
            console.log("🧹 Post-load cleanup completed");
          }, 2000);
          
          // Set up periodic cleanup to prevent accumulation - only for orphaned buttons
          const cleanupInterval = setInterval(() => {
            const orphanedButtons = document.querySelectorAll('body > .payman-button, body > button[class*="payman"]');
            if (orphanedButtons.length > 0) {
              console.log(`🧹 Periodic cleanup: removing ${orphanedButtons.length} orphaned buttons`);
              orphanedButtons.forEach(button => {
                if (button.parentNode === document.body) {
                  button.remove();
                }
              });
            }
          }, 10000); // Check every 10 seconds (less frequent)
          
          // Store cleanup interval for later cleanup
          window.paymanCleanupInterval = cleanupInterval;
        };
        
        script.onerror = (error) => {
          console.error("❌ Failed to load Payman Connect script:", error);
          setScriptLoaded(false);
          scriptLoadedRef.current = false;
        };
        
        document.head.appendChild(script); // Append to head instead of body
        console.log("📜 Script appended to head with instance ID:", instanceId);
      };
      
      // Small delay to ensure DOM is fully rendered
      setTimeout(loadPaymanScript, 500);
    }
  }, [isConnected]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log("🧹 WalletConnect component unmounting - performing cleanup");
      
      // Clear cleanup interval
      if (window.paymanCleanupInterval) {
        clearInterval(window.paymanCleanupInterval);
        delete window.paymanCleanupInterval;
      }
      
      // Clean up orphaned buttons when component unmounts
      const orphanedButtons = document.querySelectorAll('body > .payman-button, body > button[class*="payman"]');
      orphanedButtons.forEach(button => {
        if (button.parentNode === document.body) {
          console.log("Removing orphaned button on unmount:", button);
          button.remove();
        }
      });
    };
  }, []);

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
    console.log("🔌 Disconnecting wallet and cleaning up...");
    
    localStorage.removeItem('paymanToken');
    setClient(null);
    setIsConnected(false);
    setBalance(null);
    
    // Clear global client
    window.paymanClient = null;
    console.log("Payman client cleared from global scope");
    
    // Clear cleanup interval
    if (window.paymanCleanupInterval) {
      clearInterval(window.paymanCleanupInterval);
      delete window.paymanCleanupInterval;
    }
    
    // Reset script loaded state so it can be loaded again
    scriptLoadedRef.current = false;
    setScriptLoaded(false);
    
    // Perform comprehensive cleanup on disconnect
    setTimeout(() => {
      const orphanedButtons = document.querySelectorAll('body > .payman-button, body > button[class*="payman"]');
      orphanedButtons.forEach(button => {
        if (button.parentNode === document.body) {
          console.log("Removing orphaned button on disconnect:", button);
          button.remove();
        }
      });
    }, 100);
    
    alert('Wallet Disconnected');
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
            <div className="connect-title">Connect Your Wallet</div>
            <div 
              id="payman-connect-container" 
              ref={containerRef}
              className="payman-connect-btn"
            >
              {/* Payman Connect Button will be rendered here */}
              {loading && <span className="loading-indicator">Connecting...</span>}
            </div>
          </div>
        ) : (
          <div className="wallet-info">
            <div className="wallet-header">
              <div className="wallet-status">Connected</div>
              <button className="disconnect-button" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
            <div className="balance-container">
              <span className="balance-label">Balance</span>
              <span className="balance-amount">{balance ? `${balance} TSD` : 'Loading...'}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WalletConnect; 