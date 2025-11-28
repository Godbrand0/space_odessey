# 🚀 Vercel Deployment Guide

## Issue: Root Directory Configuration

Vercel is looking for `package.json` in the root directory, but your Next.js app is in the `frontend` subdirectory.

## Solution: Set Root Directory

You have **two options**:

### Option 1: Using Vercel Dashboard (Recommended)

1. Go to your Vercel project settings
2. Navigate to **Settings** → **General**
3. Find **Root Directory** setting
4. Set it to: `frontend`
5. Click **Save**
6. Redeploy

### Option 2: Using Vercel CLI

Deploy with the root directory flag:

```bash
# From the project root
vercel --prod --cwd frontend
```

Or set it permanently:

```bash
# From the project root
vercel --prod --root-directory frontend
```

### Option 3: Deploy from Frontend Directory

Simply navigate to the frontend directory and deploy from there:

```bash
cd frontend
vercel --prod
```

This is the **simplest approach** for your setup.

## Recommended: Deploy from Frontend Directory

```bash
# Navigate to frontend
cd frontend

# Deploy to Vercel
vercel --prod

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (first time) or Yes (subsequent)
# - What's your project's name? alien-invaders-gamefi
# - In which directory is your code located? ./ (current directory)
```

## After Deployment

Once deployed, you'll get a URL like: `https://alien-invaders-gamefi.vercel.app`

### Update Your Configuration

1. **Update manifest.json:**
   ```json
   {
     "url": "https://alien-invaders-gamefi.vercel.app"
   }
   ```

2. **Optional - Update image URLs to use your domain:**
   ```json
   {
     "iconUrl": "https://alien-invaders-gamefi.vercel.app/icon.png",
     "splashImageUrl": "https://alien-invaders-gamefi.vercel.app/splash.jpg"
   }
   ```

3. **Redeploy with updated manifest:**
   ```bash
   vercel --prod
   ```

## Verify Deployment

After deployment, check these URLs:

- ✅ App: `https://your-domain.vercel.app`
- ✅ Manifest: `https://your-domain.vercel.app/manifest.json`
- ✅ Icon: `https://your-domain.vercel.app/icon.png`
- ✅ Splash: `https://your-domain.vercel.app/splash.jpg`

## Environment Variables

Don't forget to set your environment variables in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Add your variables:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_NETWORK`
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
   - etc.

## Quick Deploy Command

```bash
cd frontend && vercel --prod
```

That's it! 🚀
