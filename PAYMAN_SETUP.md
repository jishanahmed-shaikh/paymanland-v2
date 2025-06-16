# 🚀 Payman TSD Payment System Setup Guide

## Quick Start

Your Payman Land game now supports **TSD (Test Dollar) payments** between players! Here's how to set it up and use it:

## 🏗️ Setup Steps

### 1. Create Payman Account
1. Go to [app.paymanai.com](https://app.paymanai.com)
2. Request an invite code (required for early access)
3. Register your account
4. Enable **Developer Mode** in settings to access TSD test wallets

### 2. Get Test Wallet (TSD)
1. In your Payman dashboard, you'll automatically get a **TSD Wallet** with **1000 TSD**
2. Note your wallet's **Paytag** (e.g., `turtle.turn.tomb/04`)

### 3. Create Test Payees
1. Go to **Payees** tab in Payman dashboard
2. Click **Add New Payee**
3. Choose **Test Account** type
4. Create a few test payees with IDs like:
   - `test-payee-alice`
   - `test-payee-bob` 
   - `test-payee-charlie`

### 4. Connect to Game
1. Make sure you're logged into Payman via the WalletConnect component in the game
2. The game will automatically detect your TSD wallet

## 🎮 How to Use in Game

### Sending TSD Payments
1. **Move close to another player** (within 150px)
2. **Click "Interact with Players"** button at bottom of screen
3. **Select a player** from the nearby players list
4. **Click "💰 Send TSD"** button
5. **Fill out the payment form:**
   - **Amount**: Enter TSD amount (e.g., `10.50`)
   - **Payee ID**: Enter a test payee ID from your dashboard (e.g., `test-payee-alice`)
   - **Message**: Optional payment message
6. **Click "💸 Send Payment"**

### What Happens
- Payment request is sent to Payman via SDK
- Your TSD balance is updated
- Payment confirmation is shown
- Other player receives payment notification

## 🔧 Technical Details

### SDK Integration
- Uses `@paymanai/payman-ts` SDK
- Simple `.ask()` method for natural language payments
- Handles TSD transactions automatically

### Payment Flow
```javascript
// Example payment request
const response = await paymanClient.ask(
  "Send 10 TSD to payee ID test-payee-alice with message 'Thanks for the help!'"
);
```

## 📝 Example Payee IDs

Create these test payees in your Payman dashboard:
- `game-player-1`
- `game-player-2` 
- `test-merchant`
- `tip-jar`
- `guild-treasury`

## 🐛 Troubleshooting

### No Balance Showing
- Make sure you're logged into Payman
- Check that Developer Mode is enabled
- Verify TSD wallet exists in dashboard

### Payment Fails
- Check payee ID exists in your dashboard
- Ensure sufficient TSD balance
- Verify Payman connection is active

### Can't See Nearby Players
- Move closer to other players (within 150px)
- Check multiplayer connection status
- Try refreshing the page

## 🎯 Next Steps

1. **Test with friends**: Have multiple people join and send payments
2. **Create custom payees**: Add specific payees for different game scenarios
3. **Track transactions**: Check your Payman dashboard for payment history
4. **Experiment**: Try different amounts and messages

## 💡 Tips

- **Start small**: Test with small amounts like 1-5 TSD first
- **Use descriptive payee IDs**: Makes it easier to track payments
- **Add messages**: Helps identify payment purposes
- **Check balance**: Monitor your TSD balance in-game

---

**Need help?** Check the [Payman Documentation](https://docs.paymanai.com) or reach out to support@paymanai.com

🎮 **Have fun sending payments in Payman Land!** 🚀 