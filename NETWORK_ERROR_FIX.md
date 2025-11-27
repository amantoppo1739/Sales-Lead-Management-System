# Fix Network Error - Frontend to Backend Connection

## 🔴 Current Issue: "Network Error" on Login

The frontend can't connect to the backend API. Here's how to fix it:

---

## ✅ Step 1: Verify Vercel Environment Variable

### Check if `NEXT_PUBLIC_API_BASE_URL` is set:

1. Go to **Vercel Dashboard** → Your Project
2. Click **Settings** → **Environment Variables**
3. Look for: `NEXT_PUBLIC_API_BASE_URL`

### If NOT set, add it:

1. Click **"Add New"**
2. **Name:** `NEXT_PUBLIC_API_BASE_URL`
3. **Value:** `https://prolific-motivation-production.up.railway.app/api/v1`
   - ⚠️ **Replace with your actual Railway backend URL**
   - Must include `/api/v1` at the end
   - Must use `https://` (not `http://`)
   - No trailing slash
4. **Environment:** Select **Production** (and Preview/Development if needed)
5. Click **Save**

### Get Your Backend URL:

1. Go to **Railway** → Your Backend Service
2. Click **Networking** tab
3. Copy the **Public Domain** (e.g., `prolific-motivation-production.up.railway.app`)
4. Add `/api/v1` to it: `https://prolific-motivation-production.up.railway.app/api/v1`

---

## ✅ Step 2: Redeploy Frontend

After adding/updating the environment variable:

1. Go to **Vercel** → Your Project → **Deployments**
2. Click the **three dots** (⋯) on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger redeploy

**Important:** Environment variable changes require a redeploy to take effect!

---

## ✅ Step 3: Wait for Railway CORS Update

The CORS fix was just pushed. Railway should auto-redeploy in 1-2 minutes.

**Check Railway deployment:**
1. Go to **Railway** → Backend Service → **Deployments**
2. Wait for latest deployment to show **"Active"** status

---

## ✅ Step 4: Test the Connection

### Option A: Test in Browser Console

1. Open your frontend: `https://sales-lead-management-system.vercel.app`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Run this command:

```javascript
fetch('https://prolific-motivation-production.up.railway.app/api/v1/reference-data', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => console.log('✅ Success:', data))
.catch(err => console.error('❌ Error:', err));
```

**Expected Result:**
- ✅ If successful: You'll see JSON data
- ❌ If CORS error: You'll see "CORS policy" error
- ❌ If network error: Check the backend URL

### Option B: Test Login

1. Go to: `https://sales-lead-management-system.vercel.app`
2. Try to log in
3. Open **Network** tab (F12 → Network)
4. Look for the `/auth/login` request
5. Check:
   - **Status:** Should be `200` (not `405` or `CORS error`)
   - **Request URL:** Should be your Railway backend URL
   - **Response:** Should contain `token` and `user` data

---

## 🐛 Common Issues & Solutions

### Issue 1: "Network Error" or "Failed to fetch"

**Cause:** `NEXT_PUBLIC_API_BASE_URL` not set or incorrect

**Fix:**
- Verify environment variable in Vercel
- Make sure it includes `/api/v1`
- Redeploy frontend after adding variable

### Issue 2: CORS Error in Console

**Cause:** Backend CORS not updated yet

**Fix:**
- Wait for Railway to redeploy (1-2 minutes)
- Check Railway deployment status
- Verify CORS pattern allows `*.vercel.app`

### Issue 3: 405 Method Not Allowed

**Cause:** This is normal if accessing API URL directly in browser

**Fix:**
- Don't test by visiting API URL directly
- Test from the frontend application
- The endpoint only accepts POST requests

### Issue 4: Wrong Backend URL

**Cause:** Using old or incorrect Railway URL

**Fix:**
1. Get current Railway backend URL:
   - Railway → Backend Service → Networking → Public Domain
2. Update Vercel environment variable
3. Redeploy frontend

---

## 📋 Quick Checklist

- [ ] `NEXT_PUBLIC_API_BASE_URL` is set in Vercel
- [ ] Value is: `https://your-backend.railway.app/api/v1`
- [ ] Frontend has been redeployed after adding variable
- [ ] Railway backend has redeployed with CORS fix
- [ ] Backend is showing "Active" status in Railway
- [ ] Tested connection in browser console
- [ ] No CORS errors in browser console

---

## 🔍 Debug Steps

### 1. Check Environment Variable

In Vercel, verify:
```
NEXT_PUBLIC_API_BASE_URL=https://prolific-motivation-production.up.railway.app/api/v1
```

### 2. Check Browser Console

Open browser console (F12) and look for:
- ❌ `CORS policy` errors → CORS issue
- ❌ `Network Error` → Backend URL issue or backend down
- ❌ `404 Not Found` → Wrong URL path
- ❌ `405 Method Not Allowed` → Normal if accessing directly

### 3. Check Network Tab

1. Open **Network** tab (F12)
2. Try to log in
3. Find the `/auth/login` request
4. Check:
   - **Request URL:** Should match your Railway backend
   - **Status Code:** Should be `200` (success) or `422` (validation error)
   - **Response:** Should contain JSON with `token`

---

## 🎯 Expected Behavior After Fix

1. ✅ Frontend loads without errors
2. ✅ Login form submits successfully
3. ✅ No "Network Error" message
4. ✅ User is redirected to dashboard after login
5. ✅ API calls work throughout the app

---

## 📞 Still Not Working?

If after all these steps it still doesn't work:

1. **Check Railway logs:**
   - Railway → Backend Service → Deployments → View Logs
   - Look for any errors

2. **Check Vercel build logs:**
   - Vercel → Project → Deployments → View Build Logs
   - Verify build completed successfully

3. **Verify backend is accessible:**
   - Try: `https://prolific-motivation-production.up.railway.app/api/v1/reference-data`
   - Should return JSON (may need auth token)

4. **Check browser console for specific error messages**

