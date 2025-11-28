# 🚀 Quick Vercel Deploy Fix

## The Issue

Vercel is having trouble detecting Next.js because of the monorepo structure (frontend subdirectory).

## ✅ Simple Solution: Deploy from Frontend Directory

The easiest and most reliable way is to deploy directly from the `frontend` directory:

```bash
# Navigate to frontend directory
cd frontend

# Deploy to Vercel
vercel --prod
```

## Step-by-Step Deployment

### 1. Navigate to Frontend
```bash
cd /home/godbrand/Documents/GitHub/space_odessey/frontend
```

### 2. Login to Vercel (if not already)
```bash
vercel login
```

### 3. Deploy
```bash
vercel --prod
```

### 4. Answer the Prompts

When Vercel asks:

**"Set up and deploy?"** → `Y`

**"Which scope?"** → Select your account

**"Link to existing project?"** → `N` (first time) or `Y` (if you already created one)

**"What's your project's name?"** → `alien-invaders-gamefi` (or your preferred name)

**"In which directory is your code located?"** → `./` (just press Enter, since you're already in frontend)

**"Want to override the settings?"** → `N` (Vercel will auto-detect Next.js)

## Alternative: Vercel Dashboard

If the CLI still has issues, use the Vercel dashboard:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. In **Root Directory**, set: `frontend`
4. Click **Deploy**

## After Successful Deployment

You'll get a URL like: `https://alien-invaders-gamefi.vercel.app`

### Update manifest.json

```bash
# Edit frontend/public/manifest.json
# Change this line:
"url": "https://your-domain.com"

# To your actual Vercel URL:
"url": "https://alien-invaders-gamefi.vercel.app"
```

### Redeploy
```bash
# From frontend directory
vercel --prod
```

## Verify Everything Works

Check these URLs after deployment:

- ✅ `https://your-app.vercel.app` - Your game
- ✅ `https://your-app.vercel.app/manifest.json` - Manifest file
- ✅ `https://your-app.vercel.app/icon.png` - App icon
- ✅ `https://your-app.vercel.app/splash.jpg` - Splash screen

## Environment Variables

Set these in Vercel dashboard under **Settings** → **Environment Variables**:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0xc41fB0C3b04D71d93352fBb0A5E7BedCD2844970
NEXT_PUBLIC_NETWORK=celo-sepolia
NEXT_PUBLIC_RPC_URL=https://sepolia-forno.celo-testnet.org
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

## Quick Command

```bash
cd frontend && vercel --prod
```

That's it! 🎮
