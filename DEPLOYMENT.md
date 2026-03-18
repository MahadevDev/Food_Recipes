# Food Recipes Web App Deployment

## Backend Status
✅ **Backend Server**: Running on port 5004
✅ **MongoDB**: Connected

## Frontend Status
✅ **Production Build**: Created successfully
✅ **Build Location**: `frontend/build/`

## Deployment Options

### Option 1: Local Deployment (Recommended for Testing)
```bash
# Terminal 1: Backend (already running)
cd backend
node server.js

# Terminal 2: Frontend (serve build)
cd frontend
npx serve -s build -p 3000
```

### Option 2: Deploy to Netlify (Frontend)
1. Push to GitHub repository
2. Connect to Netlify
3. Deploy `frontend/build` folder

### Option 3: Deploy to Vercel (Frontend)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod` in frontend folder

### Option 4: Deploy to Render (Backend + Frontend)
1. Create Render.com account
2. Connect GitHub repository
3. Configure:
   - Backend Service: Node.js
   - Frontend Service: Static Site

## Current Configuration
- **Backend URL**: http://localhost:5004
- **Frontend URL**: http://localhost:3000 (development)
- **API Base URL**: http://localhost:5004 (development)
- **Production API**: https://recipes-order.onrender.com (configured)

## Ready for Deployment! 🚀
