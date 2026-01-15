# ISRS Single-Service Migration Guide

**Date:** 2026-01-15
**Goal:** Merge frontend static site into Python backend service
**Result:** One service instead of two - cleaner, cheaper, more secure!

---

## Benefits of Single Service Architecture

### ✅ Pros:
1. **Simpler:** One service to manage instead of two
2. **Cheaper:** Save ~$7/month (or one free tier slot)
3. **No CORS:** Frontend and API on same origin = more secure
4. **Cleaner URLs:** Everything at `https://isrs-python-backend.onrender.com`
5. **Easier Deployment:** One deploy for both frontend + backend
6. **Better Performance:** No cross-origin requests

### ⚠️ Considerations:
- All traffic goes through Python service (fine for small-medium sites)
- Static files served by FastAPI (very efficient with StaticFiles)

---

## What Was Changed

### 1. Python Backend Updated ✅
**File:** `/backend-python/app/main.py`

**Changes:**
- Added `from fastapi.staticfiles import StaticFiles`
- Added `from pathlib import Path`
- Removed root `/` JSON endpoint
- Added static file serving at end (AFTER API routes):
  ```python
  frontend_path = Path(__file__).parent.parent.parent / "frontend" / "public"
  if frontend_path.exists():
      app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="static")
  ```

**How it works:**
- API routes at `/api/*` (unchanged)
- Health check at `/health` (unchanged)
- Frontend files served at `/` (new!)
- FastAPI serves `index.html` for root requests
- All other files (JS, CSS, images) served automatically

---

## Render Configuration Steps

### Step 1: Update isrs-backend (Python Backend)

**Go to:** Render Dashboard → **isrs-backend** (or isrs-python-backend) → Settings

**Update these settings:**

1. **Root Directory:**
   - **Change from:** `backend-python`
   - **Change to:** `` (EMPTY - leave blank!)
   - **Why:** So Render can see both `backend-python/` and `frontend/` folders

2. **Build Command:**
   - **Change from:** `pip install -r requirements.txt`
   - **Change to:** `cd backend-python && pip install -r requirements.txt`
   - **Why:** We're now at repo root, need to cd into backend-python

3. **Start Command:**
   - **Change from:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Change to:** `cd backend-python && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Why:** Same reason - start from backend-python directory

4. **CORS Origins (Optional Cleanup):**
   - **Current:** `http://localhost:3000,http://localhost:5173,https://isrs-database-frontend.onrender.com`
   - **Change to:** `http://localhost:3000,http://localhost:5173`
   - **Why:** No longer need isrs-database-frontend.onrender.com (we're deleting it!)

5. **Save Changes** → Auto-deploys

### Step 2: Wait for Deployment (3-5 minutes)

Watch the deployment logs to ensure:
- ✅ Dependencies install correctly
- ✅ Server starts without errors
- ✅ Log shows: "Serving frontend from: ..."

### Step 3: Test the Single Service

**Test URLs:**

1. **Frontend:** https://isrs-python-backend.onrender.com
   - Should show your ISRS homepage (HTML)

2. **API Health:** https://isrs-python-backend.onrender.com/health
   - Should return JSON: `{"status": "healthy", ...}`

3. **API Docs:** https://isrs-python-backend.onrender.com/docs
   - Should show FastAPI Swagger docs

4. **API Endpoints:** https://isrs-python-backend.onrender.com/api/auth/...
   - Should work as before

### Step 4: Delete Old Frontend Static Site

**Once verified working:**

1. Go to Render Dashboard → **isrs-frontend**
2. Settings → Scroll to bottom
3. Click **"Delete Static Site"**
4. Confirm deletion

**Result:** ✅ One service, simpler architecture!

---

## Update Custom Domain (If You Have One)

If `www.shellfish-society.org` currently points to isrs-frontend:

1. Go to **isrs-backend** → Settings → Custom Domains
2. Add `www.shellfish-society.org`
3. Update DNS records as Render instructs
4. Remove domain from old isrs-frontend (before deleting it)

---

## Rollback Plan (If Issues)

If something goes wrong:

1. **Revert Render Settings:**
   - Root Directory: `backend-python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

2. **Redeploy**

3. **Frontend still works** at isrs-frontend.onrender.com (don't delete it yet!)

---

## File Structure (For Reference)

```
isrs/  (repo root)
├── backend/  (old Node.js backend - not used)
├── backend-python/  (Python FastAPI backend - THIS ONE!)
│   ├── app/
│   │   └── main.py  (serves API + static files)
│   ├── requirements.txt
│   └── render.yaml
└── frontend/
    └── public/  (HTML, CSS, JS files)
        ├── index.html
        ├── js/
        ├── css/
        └── ...
```

**How it deploys:**
1. Render checks out entire repo
2. Runs `cd backend-python && pip install ...`
3. Runs `cd backend-python && uvicorn app.main:app ...`
4. FastAPI serves files from `../frontend/public` (relative path)

---

## Summary

**Before:**
- ❌ isrs-frontend (Static Site) - separate service
- ❌ isrs-backend (Python Web Service) - separate service
- ❌ Two services = $14/month (or 2 free slots)
- ❌ CORS configuration needed
- ❌ Two deployments to manage

**After:**
- ✅ isrs-backend (Python Web Service) - serves BOTH API + frontend
- ✅ One service = $7/month (or 1 free slot)
- ✅ No CORS issues (same origin)
- ✅ One deployment to manage
- ✅ Cleaner architecture

**This is the way!** ✅

---

## Next Steps

1. ✅ Code updated (Python backend now serves static files)
2. ⏳ Update Render configuration (root directory, build/start commands)
3. ⏳ Deploy and test
4. ⏳ Delete old isrs-frontend static site
5. ✅ Enjoy simpler architecture!
