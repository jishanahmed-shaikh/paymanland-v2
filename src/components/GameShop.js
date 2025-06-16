import styled from 'styled-components';
import React, { useState } from 'react';


const GameShopContainer = styled.div`
  font-family: 'Roboto', sans-serif;
  background-color: #f9f9f9;
  color: #333333;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 1300px;
  max-width: 95vw;
  height: 85vh;
  display: flex;
  flex-direction: column;
`;

const ShopTitle = styled.h1`
  text-align: center;
  color: #2c3e50;
  font-size: 32px;
  margin-bottom: 25px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const ShopContent = styled.div`
  display: flex;
  flex: 1;
  gap: 30px;
  background-color: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const Sidebar = styled.div`
  width: 220px;
  background-color: #f1f3f5;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 20px;
  margin-bottom: 15px;
  font-weight: 500;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
`;

const CategoryList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const CategoryItem = styled.li`
  cursor: pointer;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-weight: ${props => props.active ? '600' : '400'};
  background-color: ${props => props.active ? '#e0e0e0' : 'transparent'};

  &:hover {
    background-color: #e0e0e0;
  }
`;

const ProductGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 25px;
  padding: 25px;
  overflow-y: auto;
`;

const ProductCard = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
  }
`;

const ProductImage = styled.div`
  width: 180px;
  height: 180px;
  background-color: #f5f5f5;
  margin-bottom: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  color: #999999;
  border-radius: 8px;
`;

const ProductName = styled.h3`
  font-size: 18px;
  text-align: center;
  margin-bottom: 10px;
  font-weight: 500;
  color: #2c3e50;
`;

const ProductPrice = styled.p`
  font-size: 16px;
  color: #3498db;
  font-weight: 600;
`;

// Removed unused styled components to fix build warnings

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #3498db;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const ProductViewContainer = styled.div`
  position: relative;
  flex: 1;
  background-color: #ffffff;
  padding: 30px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const TryOnButton = styled.button`
  background-color: #3498db;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 15px;

  &:hover {
    background-color: #2980b9;
  }
`;

const TryOnModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const TryOnContent = styled.div`
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 800px;
  height: 80%;
  display: flex;
  flex-direction: column;
`;

const TryOnTitle = styled.h2`
  text-align: center;
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 20px;
`;

const TryOnImageContainer = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex: 1;
`;

const TryOnImage = styled.img`
  max-width: 45%;
  max-height: 80%;
  object-fit: contain;
`;

const UploadButton = styled.label`
  background-color: #3498db;
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: inline-block;
  margin-top: 20px;

  &:hover {
    background-color: #2980b9;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PaymentModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
`;

const PaymentContent = styled.div`
  background-color: #ffffff;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  text-align: center;
`;

const PaymentTitle = styled.h2`
  color: #2c3e50;
  font-size: 24px;
  margin-bottom: 20px;
`;

const PaymentDetails = styled.div`
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin: 20px 0;
  text-align: left;
`;

const PaymentButton = styled.button`
  background-color: #2ecc71;
  color: #ffffff;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 10px;

  &:hover {
    background-color: #27ae60;
  }

  &:disabled {
    background-color: #95a5a6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(PaymentButton)`
  background-color: #e74c3c;

  &:hover {
    background-color: #c0392b;
  }
`;

const RefreshButton = styled(PaymentButton)`
  background-color: #3498db;

  &:hover {
    background-color: #2980b9;
  }
`;

const DebugButton = styled(PaymentButton)`
  background-color: #9b59b6;
  font-size: 14px;
  padding: 8px 16px;

  &:hover {
    background-color: #8e44ad;
  }
`;

const PaymentStatus = styled.div`
  padding: 15px;
  border-radius: 8px;
  margin: 15px 0;
  font-weight: 600;
  
  &.success {
    background-color: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
  
  &.pending {
    background-color: #fff3cd;
    color: #856404;
    border: 1px solid #ffeaa7;
  }
`;

const GameShop = ({ shopData, onPaymentSuccess }) => {
    const [selectedCategory, setSelectedCategory] = useState('Trending');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showTryOn, setShowTryOn] = useState(false);
    const [userImage, setUserImage] = useState(null);
    const [tryOnResult, setTryOnResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Payment states
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, pending, success, error
    const [paymentId, setPaymentId] = useState(null);
    const [paymentError, setPaymentError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
  
    const allProducts = Object.values(shopData.categories).flat();
    const trendingProducts = allProducts.sort((a, b) => b.upvotes - a.upvotes).slice(0, 5);
  
    const displayProducts = selectedCategory === 'Trending' 
      ? trendingProducts 
      : shopData.categories[selectedCategory] || [];
  
    const handleBackToHome = () => {
      setSelectedProduct(null);
    };
  
    const handleTryOn = () => {
      setShowTryOn(true);
    };
  
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => setUserImage(e.target.result);
        reader.readAsDataURL(file);
      }
    };
  
    const handleVirtualTryOn = async () => {
      if (!userImage || !selectedProduct.image) {
        alert('Please upload your photo and select a product');
        return;
      }
    
      setIsLoading(true);
    
      try {
        // Simple client-side image overlay
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
    
        // Load both images
        const humanImg = new Image();
        const garmentImg = new Image();
    
        // Create a promise to handle image loading
        const loadImages = new Promise((resolve) => {
          let loadedImages = 0;
          const onLoad = () => {
            loadedImages++;
            if (loadedImages === 2) resolve();
          };
    
          humanImg.onload = onLoad;
          garmentImg.onload = onLoad;
    
          humanImg.src = userImage;
          garmentImg.src = selectedProduct.image;
        });
    
        await loadImages;
    
        // Set canvas size to match human image
        canvas.width = humanImg.width;
        canvas.height = humanImg.height;
    
        // Draw human image
        ctx.drawImage(humanImg, 0, 0);
    
        // Draw garment image with some transparency
        ctx.globalAlpha = 0.8;
        ctx.drawImage(garmentImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    
        // Convert canvas to data URL
        const resultImageUrl = canvas.toDataURL('image/jpeg');
        setTryOnResult(resultImageUrl);
    
      } catch (error) {
        console.error('Try-on error:', error);
        alert('Error processing images. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
  
    const handleBuyNow = (product) => {
      setSelectedProduct(product);
      setShowPaymentModal(true);
      setPaymentStatus('idle');
      setPaymentError(null);
    };

    const processPayment = async () => {
      setPaymentStatus('processing');
      setPaymentError(null);

      try {
        // Get price in TSD (convert from USD to TSD, assuming 1:1 for now)
        const priceString = selectedProduct.price.replace('$', '');
        const priceInTSD = parseFloat(priceString);

        // Emit payment request to parent component (Playground)
        if (window.paymanClient) {
          console.log("Processing payment for:", selectedProduct.name, "Price:", priceInTSD, "TSD");
          
          // Create a unique payee for this purchase if it doesn't exist
          const payeeName = `Shop-${selectedProduct.name.replace(/\s+/g, '')}-${Date.now()}`;
          
          try {
            // First, try to create a test payee for this purchase
            const payeeResponse = await window.paymanClient.ask(
              `Create a payee of type Test Rails called ${payeeName}`
            );
            console.log("Payee created:", payeeResponse);
          } catch (payeeError) {
            console.log("Payee might already exist or error:", payeeError.message);
            // Continue with payment even if payee creation fails
          }

          // Send payment with more detailed logging
          console.log(`Attempting to send ${priceInTSD} TSD to ${payeeName}`);
          const paymentResponse = await window.paymanClient.ask(
            `Send ${priceInTSD} TSD to ${payeeName} for purchasing ${selectedProduct.name}`
          );
          
          console.log("Full payment response:", paymentResponse);
          
          // Enhanced response parsing
          if (paymentResponse && paymentResponse.artifacts && paymentResponse.artifacts.length > 0) {
            const artifact = paymentResponse.artifacts[0];
            console.log("Payment artifact content:", artifact.content);
            
            // Check if payment was successful based on response content
            const content = artifact.content.toLowerCase();
            
            if (content.includes('payment') && (content.includes('sent') || content.includes('completed') || content.includes('successful'))) {
              // Payment was successful
              console.log("Payment appears to have been processed successfully");
              setPaymentStatus('success');
              
              // Notify parent component about successful payment
              if (onPaymentSuccess) {
                onPaymentSuccess(selectedProduct, paymentResponse.requestId || `payment-${Date.now()}`);
              }
              
              // Refresh wallet balance
              window.dispatchEvent(new CustomEvent('refreshWalletBalance'));
              
            } else if (content.includes('pending') || content.includes('approval') || content.includes('request')) {
              // Payment is pending approval
              console.log("Payment is pending approval");
              setPaymentId(paymentResponse.requestId || `payment-${Date.now()}`);
              setPaymentStatus('pending');
              
            } else if (content.includes('insufficient') || content.includes('error') || content.includes('failed')) {
              // Payment failed
              throw new Error(artifact.content);
              
            } else {
              // Unclear status, assume pending for now
              console.log("Payment status unclear, assuming pending");
              setPaymentId(paymentResponse.requestId || `payment-${Date.now()}`);
              setPaymentStatus('pending');
            }
          } else {
            // No artifacts in response
            console.log("No artifacts in payment response, checking status");
            if (paymentResponse.status === 'COMPLETED') {
              setPaymentStatus('success');
              if (onPaymentSuccess) {
                onPaymentSuccess(selectedProduct, paymentResponse.requestId || `payment-${Date.now()}`);
              }
              window.dispatchEvent(new CustomEvent('refreshWalletBalance'));
            } else {
              setPaymentId(paymentResponse.requestId || `payment-${Date.now()}`);
              setPaymentStatus('pending');
            }
          }
          
        } else {
          throw new Error("Payman client not available. Please connect your wallet first.");
        }
      } catch (error) {
        console.error('Payment processing failed:', error);
        setPaymentError(error.message || 'Payment failed. Please try again.');
        setPaymentStatus('error');
      }
    };

    const checkPaymentStatus = async () => {
      if (!paymentId) return;
      
      setIsRefreshing(true);
      
      try {
        // Query recent transactions to check payment status
        const transactionResponse = await window.paymanClient.ask(
          `Show me my recent transactions and payments`
        );
        
        console.log("Recent transactions check:", transactionResponse);
        
        // Also check wallet balance to see if it decreased
        const balanceResponse = await window.paymanClient.ask(
          `What is my current TSD balance?`
        );
        
        console.log("Current balance check:", balanceResponse);
        
        // For now, let's also check if there are any pending requests
        const requestsResponse = await window.paymanClient.ask(
          `Show me any pending payment requests or approvals`
        );
        
        console.log("Pending requests check:", requestsResponse);
        
        // Parse responses to determine payment status
        if (transactionResponse && transactionResponse.artifacts && transactionResponse.artifacts.length > 0) {
          const content = transactionResponse.artifacts[0].content.toLowerCase();
          
          // Look for our specific payment in recent transactions
          const productName = selectedProduct.name.toLowerCase();
          const paymentAmount = selectedProduct.price.replace('$', '');
          
          if (content.includes(productName) || content.includes(paymentAmount)) {
            console.log("Found our payment in recent transactions");
            setPaymentStatus('success');
            
            // Notify parent component about successful payment
            if (onPaymentSuccess) {
              onPaymentSuccess(selectedProduct, paymentId);
            }
            
            // Refresh wallet balance
            window.dispatchEvent(new CustomEvent('refreshWalletBalance'));
            
          } else {
            // Payment still pending or not found
            console.log("Payment not found in recent transactions, still pending");
            setPaymentStatus('pending');
          }
        } else {
          // No transaction data, keep as pending
          setPaymentStatus('pending');
        }
        
      } catch (error) {
        console.error('Failed to check payment status:', error);
        setPaymentError('Failed to check payment status: ' + error.message);
      } finally {
        setIsRefreshing(false);
      }
    };

    const checkPolicyAndPaymentInfo = async () => {
      if (!window.paymanClient) return;
      
      try {
        // Check current policy settings
        const policyResponse = await window.paymanClient.ask(
          `What are my current policy settings and spending limits?`
        );
        console.log("Current policy settings:", policyResponse);
        
        // Check recent transactions to see if our payment went through
        const transactionsResponse = await window.paymanClient.ask(
          `Show me my recent payment transactions and their status`
        );
        console.log("Recent payment transactions:", transactionsResponse);
        
        // Check if there are any pending requests
        const pendingResponse = await window.paymanClient.ask(
          `Do I have any pending payment requests that need approval?`
        );
        console.log("Pending payment requests:", pendingResponse);
        
      } catch (error) {
        console.error('Failed to check policy and payment info:', error);
      }
    };

    const closePaymentModal = () => {
      setShowPaymentModal(false);
      setSelectedProduct(null);
      setPaymentStatus('idle');
      setPaymentId(null);
      setPaymentError(null);
    };

    const renderPaymentStatus = () => {
      switch (paymentStatus) {
        case 'processing':
          return (
            <PaymentStatus className="pending">
              <strong>Processing Payment...</strong>
              <br />
              Please wait while we process your payment.
            </PaymentStatus>
          );
        case 'pending':
          return (
            <PaymentStatus className="pending">
              <strong>Payment Status Check</strong>
              <br />
              The payment has been submitted. If it exceeds your policy threshold, it will appear in your Payman dashboard for approval. 
              Otherwise, it may have been auto-approved. Click "Refresh Status" to check.
              <br />
              <small>Payment ID: {paymentId}</small>
              <br />
              <small>💡 Tip: Use the Debug Info button to check your policy settings</small>
            </PaymentStatus>
          );
        case 'success':
          return (
            <PaymentStatus className="success">
              <strong>🎉 Purchase Successful!</strong>
              <br />
              Your payment has been processed successfully. You now own {selectedProduct?.name}!
            </PaymentStatus>
          );
        case 'error':
          return (
            <PaymentStatus className="error">
              <strong>Payment Failed</strong>
              <br />
              {paymentError}
            </PaymentStatus>
          );
        default:
          return null;
      }
    };

    return (
      <GameShopContainer>
        <ShopTitle>{shopData.name}</ShopTitle>
        <ShopContent>
          <Sidebar>
            <SectionTitle>Categories</SectionTitle>
            <CategoryList>
              <CategoryItem 
                onClick={() => setSelectedCategory('Trending')}
                active={selectedCategory === 'Trending'}
              >
                Trending
              </CategoryItem>
              {Object.keys(shopData.categories).map((category) => (
                <CategoryItem 
                  key={category} 
                  onClick={() => setSelectedCategory(category)}
                  active={selectedCategory === category}
                >
                  {category}
                </CategoryItem>
              ))}
            </CategoryList>
          </Sidebar>
          {selectedProduct ? (
            <ProductViewContainer>
              <BackButton onClick={handleBackToHome}>← Back to Products</BackButton>
              <ProductViewHeader>
                <ProductViewImage>
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </ProductViewImage>
                <ProductViewInfo>
                  <ProductViewTitle>{selectedProduct.name}</ProductViewTitle>
                  <ProductViewDescription>{selectedProduct.description}</ProductViewDescription>
                  <ProductViewDetails>
                    <ProductViewPrice>{selectedProduct.price}</ProductViewPrice>
                    <ProductViewUpvotes>
                      👍 {selectedProduct.upvotes} Upvotes
                    </ProductViewUpvotes>
                  </ProductViewDetails>
                  <BuyButton onClick={() => handleBuyNow(selectedProduct)}>
                    Buy with Payman
                  </BuyButton>
                  <TryOnButton onClick={handleTryOn}>Try On You</TryOnButton>
                </ProductViewInfo>
              </ProductViewHeader>
            </ProductViewContainer>
          ) : (
            <ProductGrid>
              {displayProducts.map((product) => (
                <ProductCard key={product.name} onClick={() => setSelectedProduct(product)}>
                  <ProductImage>
                    <img src={product.image} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  </ProductImage>
                  <ProductName>{product.name}</ProductName>
                  <ProductPrice>{product.price}</ProductPrice>
                </ProductCard>
              ))}
            </ProductGrid>
          )}
        </ShopContent>
        
        {/* Payment Modal */}
        {showPaymentModal && (
          <PaymentModal>
            <PaymentContent>
              <PaymentTitle>Purchase {selectedProduct?.name}</PaymentTitle>
              
              <PaymentDetails>
                <p><strong>Item:</strong> {selectedProduct?.name}</p>
                <p><strong>Price:</strong> {selectedProduct?.price}</p>
                <p><strong>Payment Method:</strong> Payman TSD</p>
              </PaymentDetails>

              {renderPaymentStatus()}

              <div style={{ marginTop: '20px' }}>
                {paymentStatus === 'idle' && (
                  <>
                    <PaymentButton onClick={processPayment}>
                      Confirm Purchase
                    </PaymentButton>
                    <CancelButton onClick={closePaymentModal}>
                      Cancel
                    </CancelButton>
                  </>
                )}
                
                {paymentStatus === 'processing' && (
                  <PaymentButton disabled>
                    Processing...
                  </PaymentButton>
                )}
                
                {paymentStatus === 'pending' && (
                  <>
                    <RefreshButton onClick={checkPaymentStatus} disabled={isRefreshing}>
                      {isRefreshing ? 'Checking...' : 'Refresh Status'}
                    </RefreshButton>
                    <CancelButton onClick={closePaymentModal}>
                      Close
                    </CancelButton>
                  </>
                )}
                
                {(paymentStatus === 'success' || paymentStatus === 'error') && (
                  <PaymentButton onClick={closePaymentModal}>
                    Close
                  </PaymentButton>
                )}
                
                {/* Debug button - always visible for troubleshooting */}
                <DebugButton onClick={checkPolicyAndPaymentInfo}>
                  🔍 Debug Info
                </DebugButton>
              </div>
            </PaymentContent>
          </PaymentModal>
        )}

        {/* Try-On Modal - existing code */}
        {showTryOn && (
          <TryOnModal>
            <TryOnContent>
              <TryOnTitle>Try On: {selectedProduct.name}</TryOnTitle>
              <TryOnImageContainer>
                <TryOnImage src={selectedProduct.image} alt={selectedProduct.name} />
                <TryOnImage src={userImage || '/assets/building1.png'} alt="User" />
              </TryOnImageContainer>
              <UploadButton>
                Upload Your Photo
                <HiddenFileInput type="file" onChange={handleFileUpload} accept="image/*" />
              </UploadButton>
              <TryOnButton onClick={handleVirtualTryOn} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Let\'s Try On'}
              </TryOnButton>
              {isLoading && <LoadingSpinner />}
              {tryOnResult && (
                <TryOnImage src={tryOnResult} alt="Try-on Result" />
              )}
              <TryOnButton onClick={() => {
                setShowTryOn(false);
                setTryOnResult(null);
                setUserImage(null);
              }}>Close</TryOnButton>
            </TryOnContent>
          </TryOnModal>
        )}
        
        {/* Display the try-on result below the input images */}
        {tryOnResult && (
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <h3>Your Try-On Result</h3>
            <img src={tryOnResult} alt="Try-On Result" style={{ maxWidth: '100%', height: 'auto' }} />
          </div>
        )}
      </GameShopContainer>
    );
  };
  
  export default GameShop;
  
