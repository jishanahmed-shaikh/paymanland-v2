# 🚀 Payman Land Deployment Guide

## Frontend Deployment (Vercel)

### Step 1: Vercel Dashboard Setup
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure the following settings:

**Project Settings:**
- **Framework Preset**: Create React App
- **Root Directory**: `./` (leave empty)
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 2: Environment Variables
Add these environment variables in Vercel Dashboard:

```
REACT_APP_MULTIPLAYER_SERVER_URL = https://your-websocket-server.com
```

### Step 3: Deploy
Click "Deploy" - Vercel will automatically build and deploy your frontend.

---

## WebSocket Server Deployment Options

Since Vercel doesn't support WebSocket servers, choose one of these options:

### Option A: Railway (Recommended - Free Tier Available)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Create new project from your repo
4. Set these environment variables:
   ```
   PORT = 3001
   NODE_ENV = production
   ```
5. Add this `Procfile` to your root directory:
   ```
   web: node api/server.js
   ```

### Option B: Render (Free Tier Available)
1. Go to [render.com](https://render.com)
2. Create "New Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node api/server.js`
   - **Environment**: Node
   - **Port**: 3001

### Option C: Heroku (Paid)
1. Create new Heroku app
2. Connect GitHub repository
3. Add environment variables
4. Deploy

---

## Quick Setup Commands

### For Railway Deployment:
```bash
# Add Procfile
echo "web: node api/server.js" > Procfile

# Commit changes
git add .
git commit -m "Add Railway deployment config"
git push origin main
```

### For Render Deployment:
```bash
# Add start script to package.json (if not exists)
npm pkg set scripts.start-server="node api/server.js"

# Commit changes
git add .
git commit -m "Add Render deployment config"
git push origin main
```

---

## Final Steps

1. **Deploy WebSocket Server** using one of the options above
2. **Get your WebSocket server URL** (e.g., `https://your-app.railway.app`)
3. **Update Vercel environment variable**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Update `REACT_APP_MULTIPLAYER_SERVER_URL` with your WebSocket server URL
4. **Redeploy frontend** in Vercel (it will automatically redeploy with new env vars)

---

## Testing Deployment

1. Open your Vercel URL
2. Open another browser/incognito window with the same URL
3. Move around - you should see real-time multiplayer working!

---

## Troubleshooting

### Common Issues:
1. **CORS Errors**: Make sure your WebSocket server allows your Vercel domain
2. **Connection Failed**: Check if WebSocket server is running and accessible
3. **Environment Variables**: Ensure `REACT_APP_MULTIPLAYER_SERVER_URL` is set correctly

### Debug Steps:
1. Check browser console for errors
2. Check WebSocket server logs
3. Verify environment variables in Vercel dashboard
4. Test WebSocket server directly: `https://your-server.com/api/players` 