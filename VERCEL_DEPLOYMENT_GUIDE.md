# Vercel Frontend Deployment Guide

## 🚀 Quick Deploy Steps

### Step 1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Select the repository: `Sales-Lead-Management-System`

### Step 2: Configure Project Settings

**Root Directory:** `frontend`

Vercel will auto-detect Next.js, but verify these settings:

- **Framework Preset:** Next.js
- **Root Directory:** `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 3: Environment Variables

Add these environment variables in Vercel:

#### Required:

```
NEXT_PUBLIC_API_BASE_URL=https://prolific-motivation-production.up.railway.app/api/v1
```

**Replace with your actual Railway backend URL:**
- Format: `https://your-backend.railway.app/api/v1`
- Get from: Railway → Backend Service → Networking → Public Domain

#### Optional (for real-time features):

```
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=mt1
NEXT_PUBLIC_PUSHER_HOST=your-pusher-host
NEXT_PUBLIC_PUSHER_PORT=6001
NEXT_PUBLIC_PUSHER_TLS=false
NEXT_PUBLIC_PUSHER_TLS_PORT=443
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

---

## 📋 Vercel Build Settings Summary

### Automatic Detection (Recommended)

Vercel automatically detects Next.js, so you can leave settings as default:

- **Framework:** Next.js (auto-detected)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Manual Settings (if needed)

If you need to set manually:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | `Next.js` |
| **Build Command** | `cd frontend && npm run build` |
| **Output Directory** | `frontend/.next` |
| **Install Command** | `cd frontend && npm install` |
| **Node.js Version** | `18.x` or `20.x` |

---

## 🔧 Environment Variables Setup

### In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add each variable:

#### Production Environment:

```
NEXT_PUBLIC_API_BASE_URL=https://prolific-motivation-production.up.railway.app/api/v1
```

**Important:** 
- Replace `prolific-motivation-production.up.railway.app` with your actual Railway backend URL
- Must include `/api/v1` at the end
- No trailing slash

### Get Your Backend URL:

1. Go to Railway dashboard
2. Click on your **Backend Service**
3. Go to **Networking** tab
4. Copy the **Public Domain** (e.g., `prolific-motivation-production.up.railway.app`)
5. Add `/api/v1` to it

---

## 🔗 Update Backend CORS & Sanctum

After deploying frontend, update backend environment variables:

### In Railway Backend Service → Variables:

Update `SANCTUM_STATEFUL_DOMAINS`:

```
SANCTUM_STATEFUL_DOMAINS=your-app.vercel.app,www.your-app.vercel.app
```

Replace `your-app.vercel.app` with your actual Vercel domain.

---

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] `NEXT_PUBLIC_API_BASE_URL` set correctly
- [ ] Backend `SANCTUM_STATEFUL_DOMAINS` updated with Vercel domain
- [ ] Test login functionality
- [ ] Test API calls from frontend
- [ ] Verify CORS is working (no CORS errors in browser console)

---

## 🐛 Troubleshooting

### Build Fails

- Check Node.js version (should be 18.x or 20.x)
- Verify `package.json` has correct build script
- Check build logs for specific errors

### API Connection Issues

- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check backend is running on Railway
- Verify backend URL includes `/api/v1`
- Check browser console for CORS errors

### CORS Errors

- Update `SANCTUM_STATEFUL_DOMAINS` in Railway backend
- Ensure Vercel domain is added (without `https://`)
- Redeploy backend after updating CORS settings

---

## 📝 Example Vercel Configuration

Your `vercel.json` is already configured correctly. Vercel will:

1. Auto-detect Next.js framework
2. Run `npm install` in the `frontend` directory
3. Run `npm run build`
4. Serve from `.next` output directory
5. Handle routing automatically

---

## 🎯 Quick Reference

**Frontend URL:** `https://your-project.vercel.app`  
**Backend URL:** `https://your-backend.railway.app/api/v1`  
**Environment Variable:** `NEXT_PUBLIC_API_BASE_URL`

---

## 🔄 After Deployment

1. **Test the app:** Visit your Vercel URL
2. **Test login:** Use demo credentials (admin@example.com / password)
3. **Check console:** No CORS or API errors
4. **Update backend CORS:** Add Vercel domain to `SANCTUM_STATEFUL_DOMAINS`

Your Lead Management System is now live! 🎉

