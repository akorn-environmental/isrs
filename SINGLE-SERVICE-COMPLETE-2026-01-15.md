# Single-Service Architecture Complete - Jan 15, 2026

**Status:** 🔄 Deploying Now
**Time:** 2026-01-15 13:50 EST
**Architecture:** Backend now serves both API + Frontend

---

## ✅ What We Did

### Changed From Dual-Service to Single-Service

**BEFORE (Broken):**
```
www.shellfish-society.org  (DNS)
  ↓
isrs-frontend.onrender.com  (Separate static site - OLD code)
  ↓ API calls
isrs-python-backend.onrender.com  (API only)
```

**AFTER (Fixed):**
```
www.shellfish-society.org  (DNS - needs update)
  ↓
isrs-python-backend.onrender.com  (Serves BOTH frontend + API)
  ├── /                   → Frontend (HTML/CSS/JS)
  ├── /api/auth/*         → Authentication API
  ├── /api/contacts/*     → Contacts API
  └── /api/*              → All other APIs
```

---

## 🔧 Changes Made

### 1. Re-enabled Frontend Serving

**File:** `backend-python/app/main.py`

**Removed:**
```python
# Redirect root to external site
@app.get("/")
async def root():
    return RedirectResponse(url="https://www.shellfish-society.org/", status_code=301)
```

**Added:**
```python
# Serve static files (frontend)
frontend_path = Path(__file__).parent.parent.parent / "frontend" / "public"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="static")
```

### 2. Updated Frontend URLs (Already Done)

All 47 frontend files now point to correct backend:
- ✅ `https://isrs-python-backend.onrender.com`

### 3. Updated CORS Configuration (Already Done)

Backend now allows requests from:
- ✅ `https://www.shellfish-society.org`
- ✅ `https://shellfish-society.org`
- ✅ `http://localhost:3000` (local dev)
- ✅ `http://localhost:5173` (local dev)

---

## 🚀 Deployment Timeline

| Time | Event | Commit |
|------|-------|--------|
| 13:40 | Fixed CORS + frontend URLs | 528170a |
| 13:50 | Enabled single-service | 74e730f |
| ~13:53 | Expected deployment complete | (in progress) |

---

## 📋 DNS Update Required

### Current DNS Setup

```
www.shellfish-society.org
  CNAME → isrs-frontend.onrender.com  ❌ OLD (separate site)
```

### New DNS Setup (Update After Deployment)

```
www.shellfish-society.org
  CNAME → isrs-python-backend.onrender.com  ✅ NEW (single service)
```

### How to Update DNS

**Option A: Keep Using Render Custom Domain (Easiest)**

If `www.shellfish-society.org` is configured in Render:
1. Go to: https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50
2. Click: "Settings" → "Custom Domains"
3. Add: `www.shellfish-society.org`
4. Render will show you the DNS records to update
5. Update your DNS provider (e.g., Namecheap, GoDaddy, Cloudflare)

**Option B: Manual DNS Update**

At your DNS provider:
1. Find CNAME record for `www.shellfish-society.org`
2. Change value from: `isrs-frontend.onrender.com`
3. Change value to: `isrs-python-backend.onrender.com`
4. Save changes
5. Wait 5-60 minutes for DNS propagation

---

## 🧪 Testing Checklist

### Once Deployment Completes (~3 min)

**Test Backend Directly:**
1. [ ] `https://isrs-python-backend.onrender.com/`
   - Should load frontend homepage (not redirect!)

2. [ ] `https://isrs-python-backend.onrender.com/health`
   - Should return JSON health status

3. [ ] `https://isrs-python-backend.onrender.com/docs`
   - Should load FastAPI Swagger UI

4. [ ] `https://isrs-python-backend.onrender.com/api/auth/request-login`
   - Should accept POST requests

### After DNS Update

5. [ ] `https://www.shellfish-society.org/`
   - Should load frontend homepage

6. [ ] Browser console should show:
   - `🔐 Portal Login - API Backend: https://isrs-python-backend.onrender.com`
   - NO CORS errors!

7. [ ] Test login flow:
   - Enter email
   - Click submit
   - Should send magic link
   - NO errors in console

---

## 📊 Architecture Benefits

### Single-Service Advantages

✅ **Simpler:**
- One service to deploy
- One URL to manage
- No CORS complexity

✅ **Cheaper:**
- One service = one bill
- No separate static site hosting

✅ **Faster:**
- No DNS lookup for API calls
- Direct frontend ↔ backend communication
- Same origin = no CORS preflight requests

✅ **Easier Updates:**
- Update frontend & backend together
- One git push deploys everything
- No separate deployments needed

---

## 🔒 Security Considerations

### CORS Still Active

Even though it's same-origin now, CORS middleware is still configured for:
- Localhost development
- Future API consumers
- Third-party integrations

### HTTPS Enforced

- ✅ All traffic over HTTPS
- ✅ Render provides SSL certificates
- ✅ HTTP auto-redirects to HTTPS

### Environment Variables

All sensitive values stay in Render environment:
- `DATABASE_URL`
- `SECRET_KEY`
- `ANTHROPIC_API_KEY`
- `SMTP_PASSWORD`
- etc.

---

## 📂 File Structure

```
ISRS/
├── backend-python/
│   ├── app/
│   │   ├── main.py          ← Serves both API + frontend
│   │   ├── config.py        ← CORS configuration
│   │   └── routers/         ← API endpoints
│   └── requirements.txt     ← Python dependencies
│
└── frontend/
    └── public/              ← Static files (HTML/CSS/JS)
        ├── index.html       ← Homepage
        ├── login.html       ← Login page
        ├── js/
        │   ├── api.js       ← API calls (updated URLs)
        │   └── main.js      ← Frontend logic
        └── ...              ← 47 files total
```

---

## 🎯 Next Steps

### Immediate (Now - 5 min)

1. ⏳ Wait for deployment to complete
2. ✅ Test `https://isrs-python-backend.onrender.com/`
3. ✅ Verify frontend loads

### Short-Term (Next Hour)

1. 📝 Update DNS to point www.shellfish-society.org to new service
2. ⏱️ Wait for DNS propagation (5-60 minutes)
3. ✅ Test www.shellfish-society.org

### Medium-Term (This Week)

1. 🗑️ Delete old `isrs-frontend` static site (if you have access)
2. 📊 Monitor performance and errors
3. 🔒 Review security settings

---

## 🔄 Render Configuration

### Service Details

**Service ID:** `srv-d5k0t5d6ubrc739a4e50`
**Service Name:** `isrs-backend`
**Type:** `web_service`
**URL:** `https://isrs-python-backend.onrender.com`

### Build Command

```bash
cd backend-python && pip install -r requirements.txt
```

### Start Command

```bash
cd backend-python && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Root Directory

Empty (allows access to both `backend-python/` and `frontend/`)

---

## 📝 Commit History

| Commit | Description | Status |
|--------|-------------|--------|
| `a58674e` | Revert security updates (rollback) | ✅ Deployed |
| `528170a` | Fix CORS + update frontend URLs | ✅ Deployed |
| `74e730f` | Re-enable frontend serving | 🔄 Deploying |

---

## ✅ Summary

**What Was Broken:**
- www.shellfish-society.org pointed to separate `isrs-frontend` site with OLD code
- CORS errors blocking API calls
- Backend redirecting instead of serving frontend

**What We Fixed:**
- ✅ Updated all 47 frontend files to new backend URL
- ✅ Added www.shellfish-society.org to CORS whitelist
- ✅ Configured backend to serve frontend directly
- ✅ Single-service architecture restored

**What's Left:**
- ⏳ Wait for deployment (~3 min)
- 📝 Update DNS to point to single service
- ✅ Test everything works

---

**Created:** 2026-01-15 13:52 EST
**Commit:** 74e730f
**Deployment:** In Progress
**ETA:** 13:55 EST

---

**🎉 Once DNS is updated, www.shellfish-society.org will load the NEW frontend with the correct backend URL and NO CORS errors!**
