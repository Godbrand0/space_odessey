# Farcaster MiniApp Integration Guide

## Overview

Alien Invaders GameFi is now available as a **Farcaster MiniApp**! This allows users to play the game directly within Farcaster clients (like Warpcast) without leaving the app or managing separate wallet connections.

## What is a Farcaster MiniApp?

Farcaster MiniApps are web applications that run inside Farcaster clients, providing a seamless user experience with:

- **No wallet connection hassle**: Users' wallets are automatically connected
- **Integrated experience**: Play without leaving Farcaster
- **Enhanced UX**: Haptic feedback and native-feeling interactions
- **Simplified onboarding**: No need to install browser extensions

## Features

### Dual-Mode Support

The app works in **two modes**:

1. **Standard Web Mode**: Traditional dapp with RainbowKit wallet connection
2. **MiniApp Mode**: Runs inside Farcaster with automatic wallet connection

The app automatically detects which environment it's running in and adapts accordingly.

### MiniApp-Specific Features

- ✅ **Auto-connect wallet**: Seamless connection to user's Farcaster wallet
- ✅ **Haptic feedback**: Touch feedback for game actions
- ✅ **Quick Auth**: Fast authentication for authenticated features
- ✅ **Optimized UI**: Cleaner interface without redundant wallet buttons
- ✅ **Mobile-first**: Perfect for mobile gameplay in Farcaster

## Setup Instructions

### 1. Install Dependencies

The required packages are already installed:

```bash
npm install @farcaster/miniapp-sdk @farcaster/miniapp-wagmi-connector
```

### 2. Configure Environment Variables

Update your `.env` file with your app's public URL and asset URLs:

```env
# Farcaster MiniApp Configuration
NEXT_PUBLIC_APP_NAME="Alien Invaders GameFi"
NEXT_PUBLIC_APP_DESCRIPTION="Play Space Invaders and earn CELO rewards"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_APP_ICON_URL="https://your-domain.com/icon.png"
NEXT_PUBLIC_APP_SPLASH_URL="https://your-domain.com/splash.png"
NEXT_PUBLIC_APP_SPLASH_BG_COLOR="#000000"
```

### 3. Update Manifest

Edit `public/manifest.json` with your actual URLs:

```json
{
  "name": "Alien Invaders GameFi",
  "description": "Play Space Invaders and earn CELO rewards on-chain",
  "iconUrl": "https://your-actual-domain.com/icon.png",
  "splashImageUrl": "https://your-actual-domain.com/splash.png",
  "splashBackgroundColor": "#000000",
  "url": "https://your-actual-domain.com",
  "requiredChains": [44787]
}
```

**Important**: Replace `https://your-domain.com` with your actual deployed URL.

### 4. Create App Icons

You need two image assets:

#### App Icon (512x512px)
- Square format
- PNG or JPG
- Represents your app in Farcaster
- Save as `public/icon.png`

#### Splash Screen (1920x1080px)
- Horizontal format
- Shown while app loads
- Save as `public/splash.png`

**Design Tips**:
- Use retro arcade aesthetics matching the game
- Include neon colors (cyan, pink, green)
- Feature Space Invaders aliens
- Keep it visually striking

### 5. Deploy Your App

Deploy to a public URL (Vercel, Netlify, etc.):

```bash
# Build the app
npm run build

# Deploy (example with Vercel)
vercel --prod
```

After deployment, update the manifest URLs to match your production domain.

## Testing

### Test in Standard Browser

```bash
npm run dev
```

Visit `http://localhost:3000` - you should see the normal wallet connection UI.

### Test MiniApp Mode

To test MiniApp mode locally, you can simulate the environment:

1. Open browser DevTools
2. Run in console:
```javascript
// Simulate MiniApp environment
window.parent = {}; // Different from window
```

3. Reload the page - you should see MiniApp-specific UI

### Test in Farcaster

1. Deploy your app to a public URL
2. Create a Frame that links to your MiniApp
3. Test in Warpcast or another Farcaster client

## Publishing to Farcaster

### Step 1: Verify Manifest

Ensure your manifest is accessible:
```
https://your-domain.com/manifest.json
```

### Step 2: Create a Frame

Create a Farcaster Frame that launches your MiniApp. Example Frame metadata:

```html
<meta property="fc:frame" content="vNext" />
<meta property="fc:frame:image" content="https://your-domain.com/splash.png" />
<meta property="fc:frame:button:1" content="Play Game" />
<meta property="fc:frame:button:1:action" content="launch_frame" />
<meta property="fc:frame:button:1:target" content="https://your-domain.com/manifest.json" />
```

### Step 3: Submit to Farcaster

Follow the official Farcaster MiniApp publishing guide:
https://miniapps.farcaster.xyz/docs/guides/publishing

### Step 4: Promote Your MiniApp

- Share on Farcaster with the Frame
- Engage with the Farcaster community
- Highlight the play-to-earn mechanics

## Architecture

### File Structure

```
frontend/
├── lib/
│   ├── farcaster.ts          # Farcaster SDK utilities
│   └── wagmi.ts               # Wagmi config with MiniApp connector
├── components/
│   ├── FarcasterInit.tsx      # SDK initialization
│   ├── MiniAppConnect.tsx     # MiniApp wallet connect UI
│   ├── RainbowKitProvider.tsx # Dual-mode provider
│   └── GameUI.tsx             # Enhanced with haptic feedback
├── public/
│   └── manifest.json          # MiniApp manifest
└── app/
    └── layout.tsx             # Root layout with SDK init
```

### How It Works

1. **Environment Detection**: `isInMiniApp()` checks if running in Farcaster
2. **Conditional Rendering**: Shows MiniApp UI or standard UI based on environment
3. **SDK Initialization**: `FarcasterInit` component calls `sdk.actions.ready()`
4. **Auto-connect**: MiniApp connector automatically connects user's wallet
5. **Haptic Feedback**: Triggers on game events for better mobile UX

## Haptic Feedback Events

The game triggers haptic feedback on:

- 🎮 **Game Start**: Medium haptic when starting a new game
- 🎯 **Mobile Controls**: Light haptic when pressing movement buttons
- ✅ **Level Complete**: Success haptic when completing a level
- 💰 **Claim Rewards**: Success haptic when claiming rewards
- ❌ **Errors**: Error haptic when transactions fail

## Troubleshooting

### Issue: Infinite Loading Screen

**Cause**: `sdk.actions.ready()` not called

**Solution**: Ensure `FarcasterInit` component is included in your layout

### Issue: Wallet Not Auto-Connecting

**Cause**: MiniApp connector not first in connectors array

**Solution**: Verify `wagmi.ts` has `miniAppConnector()` as the first connector

### Issue: Manifest Not Found

**Cause**: Manifest file not in public directory or wrong URL

**Solution**: 
1. Verify `public/manifest.json` exists
2. Check it's accessible at `https://your-domain.com/manifest.json`
3. Ensure no 404 errors in browser console

### Issue: Icons Not Loading

**Cause**: Incorrect URLs in manifest

**Solution**: Use absolute URLs with your actual domain

### Issue: Haptic Feedback Not Working

**Cause**: Only works in MiniApp environment on supported devices

**Solution**: This is expected - haptics only work in actual Farcaster clients on mobile

## API Reference

### Farcaster Utilities (`lib/farcaster.ts`)

#### `isInMiniApp(): boolean`
Detects if running in Farcaster MiniApp environment.

#### `initializeFarcasterSDK(): Promise<void>`
Initializes the SDK and calls `ready()`. Called automatically in layout.

#### `getAuthToken(): Promise<string | null>`
Gets a JWT authentication token using Quick Auth.

#### `triggerHaptic(type): void`
Triggers haptic feedback. Types: `'light'`, `'medium'`, `'heavy'`, `'success'`, `'warning'`, `'error'`

#### `navigateBack(): void`
Navigates back in MiniApp or browser history.

#### `signInWithFarcaster(): Promise<any>`
Gets Sign in with Farcaster authentication credential.

## Resources

- **Farcaster MiniApp Docs**: https://miniapps.farcaster.xyz/
- **SDK Reference**: https://miniapps.farcaster.xyz/docs/sdk
- **Publishing Guide**: https://miniapps.farcaster.xyz/docs/guides/publishing
- **Wagmi Docs**: https://wagmi.sh
- **Celo Docs**: https://docs.celo.org

## Support

For issues or questions:

1. Check this documentation
2. Review Farcaster MiniApp docs
3. Test in both standard and MiniApp modes
4. Check browser console for errors

## Next Steps

1. ✅ Create app icon and splash screen
2. ✅ Deploy to production
3. ✅ Update manifest with production URLs
4. ✅ Test in Farcaster client
5. ✅ Create Frame for distribution
6. ✅ Submit to Farcaster
7. ✅ Promote on Farcaster

---

**Built with ❤️ for Farcaster and Celo communities**
