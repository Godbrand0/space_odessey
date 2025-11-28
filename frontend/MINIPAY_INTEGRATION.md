# MiniPay Integration Guide

This document describes how Space Invaders GameFi integrates with MiniPay, Opera's built-in Celo wallet for mobile devices.

## What is MiniPay?

MiniPay is a non-custodial stablecoin wallet built into the Opera Mini browser. It allows users to send, receive, and spend cUSD (Celo Dollars) directly from their mobile browser without installing additional apps.

## Features Implemented

### 1. Automatic Wallet Detection

The dapp automatically detects when it's running inside MiniPay:

```typescript
// Check via window.ethereum.isMiniPay
if (window.ethereum?.isMiniPay) {
  console.log('MiniPay detected!')
}
```

### 2. Implicit Wallet Connection

When MiniPay is detected, the wallet connects automatically without requiring user interaction:

- ✅ No "Connect Wallet" button needed
- ✅ Seamless user experience
- ✅ Instant connection on page load

### 3. UI Adaptations

The UI adjusts for MiniPay users:

**Welcome Screen:**
- Shows "📱 MINIPAY DETECTED" message
- Displays "CONNECTING WALLET..." during auto-connect
- Hides the connect button during auto-connection

**Connected State:**
- Shows 📱 icon next to user address
- Displays "CONNECTING..." text while establishing connection

### 4. Transaction Support

MiniPay supports:
- ✅ Standard Celo transactions
- ✅ Custom fee abstraction (cUSD gas fees)
- ✅ Legacy transaction format
- ✅ Fee currency: cUSD

## Implementation Details

### Files Modified/Created

1. **`hooks/useMiniPay.ts`** (NEW)
   - Custom hook for MiniPay detection
   - Auto-connection logic
   - State management for MiniPay status

2. **`components/WalletConnect.tsx`** (UPDATED)
   - MiniPay detection on mount
   - Auto-connect via injected connector
   - Conditional button rendering
   - Shows 📱 icon for MiniPay users

3. **`components/GameUI.tsx`** (UPDATED)
   - Imports and uses `useMiniPay()` hook
   - MiniPay-specific welcome screen
   - Hides connect button during auto-connect

### Code Examples

**Using the MiniPay Hook:**

```typescript
import { useMiniPay } from '@/hooks/useMiniPay'

function MyComponent() {
  const { isMiniPay, isAutoConnecting } = useMiniPay()

  if (isMiniPay) {
    return <div>Welcome MiniPay user! 📱</div>
  }

  return <div>Regular wallet connection</div>
}
```

**Checking MiniPay Synchronously:**

```typescript
import { checkIsMiniPay } from '@/hooks/useMiniPay'

if (checkIsMiniPay()) {
  // User is on MiniPay
}
```

## Transaction Configuration

MiniPay transactions use:

```typescript
{
  // Legacy transaction format (not EIP-1559)
  gasPrice: '...',  // Not maxFeePerGas/maxPriorityFeePerGas

  // Fee currency support (optional)
  feeCurrency: '0x...',  // cUSD token address for gas fees
}
```

Wagmi and Viem handle this automatically - no special configuration needed in your transaction calls.

## Testing

### Test on MiniPay

1. **Install Opera Mini** on Android device
2. **Enable MiniPay** in the browser
3. **Navigate** to your dapp URL
4. **Observe** automatic connection

### Test Locally with ngrok

Since MiniPay is mobile-only, use ngrok to test locally:

```bash
# Start your dev server
npm run dev

# In another terminal, expose it via ngrok
ngrok http 3000

# Use the ngrok URL in Opera Mini
```

### Simulate MiniPay in Desktop Browser

For testing, you can simulate MiniPay detection:

```javascript
// In browser console
window.ethereum = {
  isMiniPay: true,
  request: async () => { /* ... */ }
}
```

## Important Notes

⚠️ **MiniPay Limitations:**
- Only supports **cUSD as fee currency**
- Only accepts **legacy transactions** (no EIP-1559)
- Mobile-only (Opera Mini browser)
- Celo mainnet and Celo Sepolia testnet supported

✅ **Best Practices:**
- Always check `window.ethereum` exists before accessing `isMiniPay`
- Hide connect button when `isMiniPay` is detected
- Show connection status during auto-connect
- Test on actual MiniPay before deploying

## User Flow

### For MiniPay Users:

1. User opens dapp in Opera Mini with MiniPay
2. Dapp detects `window.ethereum.isMiniPay`
3. Welcome screen shows "MINIPAY DETECTED"
4. Wallet auto-connects in background
5. Shows "CONNECTING WALLET..." message
6. Connection completes → Game UI loads
7. User sees 📱 icon next to their address

### For Regular Wallet Users:

1. User opens dapp in any browser
2. Welcome screen shows "CONNECT WALLET TO START"
3. User clicks "CONNECT WALLET" button
4. RainbowKit modal opens
5. User selects wallet and connects
6. Game UI loads

## Troubleshooting

**Problem:** Auto-connection not working
- **Solution:** Check browser console for errors, verify `window.ethereum.isMiniPay` is true

**Problem:** Transactions failing
- **Solution:** Ensure you're on Celo Sepolia testnet, check gas balance

**Problem:** Button still showing on MiniPay
- **Solution:** Verify the `isMiniPay` state is propagating correctly, check React DevTools

## Resources

- [MiniPay Documentation](https://docs.celo.org/developer/minipay)
- [Celo Developer Docs](https://docs.celo.org/)
- [Wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)

## Support

For issues or questions about MiniPay integration:
1. Check the [Celo Discord](https://discord.gg/celo)
2. Review [Celo Forum](https://forum.celo.org/)
3. Open an issue on this repository
