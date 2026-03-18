# 🚀 VERCEL DEPLOYMENT GUIDE

## Option 1: Deploy Frontend Only (Recommended)

### Step 1: Navigate to Frontend Folder
```bash
cd frontend
```

### Step 2: Deploy to Vercel
```bash
npx vercel --prod
```

### Step 3: Configure API URL
Make sure `frontend/src/utils/apiConfig.js` points to:
```javascript
return "https://food-recipes-2-u6ck.onrender.com";
```

## Option 2: Deploy Both Frontend & Backend Together

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Deploy from Root Directory
```bash
vercel --prod
```

### Step 3: Update Frontend API URL
After deployment, update API URL to your Vercel backend URL

## Option 3: Fix Current Vercel Deployment

### Issue: Frontend Not Showing
Possible causes:
1. **Wrong build directory**: Vercel looking for wrong folder
2. **Missing vercel.json**: Configuration not set up correctly
3. **API URL mismatch**: Frontend pointing to wrong backend

### Quick Fix:
```bash
# From frontend directory
cd frontend

# Check current deployment
vercel ls

# Redeploy frontend only
vercel --prod --force
```

## 📋 Verification Steps

### 1. Check Build
```bash
cd frontend
npm run build
# Should show: "The build folder is ready to be deployed"
```

### 2. Test Locally
```bash
cd frontend
npx serve -s build
# Visit http://localhost:3000
```

### 3. Deploy to Vercel
```bash
cd frontend
vercel --prod
```

## 🔧 Troubleshooting

### If frontend still not showing:
1. **Clear Vercel cache**: `vercel --prod --force`
2. **Check build logs**: `vercel logs`
3. **Verify build output**: Ensure `frontend/build` exists
4. **Check domain**: Ensure you're visiting correct Vercel URL

### Common Issues:
- **Build fails**: Check for missing dependencies
- **White screen**: Check console for JavaScript errors
- **API errors**: Verify backend URL is correct

## 🎯 Expected Result
After successful deployment:
- ✅ Frontend loads at your Vercel URL
- ✅ API calls work with backend
- ✅ All features functional (login, recipes, etc.)

**Deploy from frontend folder for best results!** 🚀
