# 🚀 Deploy ISRS Python Backend NOW

## Quick Deploy (5 minutes)

### Step 1: Go to Render Dashboard
Open: https://dashboard.render.com

### Step 2: Create New Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub repository: `akornenvironmental/isrs`
4. **Root Directory:** `backend-python`
5. Render will auto-detect `render.yaml` configuration

### Step 3: Configure Environment Variables

Render needs these secret values (others are pre-configured in render.yaml):

```bash
DATABASE_URL=postgresql://isrs_user:rzE9q7ONZUAAdnA7ndLMXPKILyI6mnVr@dpg-d41lpl3uibrs73andv50-a.oregon-postgres.render.com/isrs_database

ASYNC_DATABASE_URL=postgresql+asyncpg://isrs_user:rzE9q7ONZUAAdnA7ndLMXPKILyI6mnVr@dpg-d41lpl3uibrs73andv50-a.oregon-postgres.render.com/isrs_database

SMTP_USER=cbt.pmi.research.survey@gmail.com
SMTP_PASSWORD=mymcpuknrkbbvxps

ANTHROPIC_API_KEY=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

APOLLO_API_KEY=2EumgfMJpNCcTCgaJyJ2mg
```

### Step 4: Deploy!
Click **"Create Web Service"**

Render will:
- ✅ Install Python 3.12
- ✅ Install dependencies from requirements.txt
- ✅ Start uvicorn server
- ✅ Run health checks on `/health`
- ⏱️ Build time: ~3-5 minutes

### Step 5: Verify Deployment

Once deployed, your backend will be at:
```
https://isrs-python-backend.onrender.com
```

**Test it:**
```bash
# Health check
curl https://isrs-python-backend.onrender.com/health

# API docs
open https://isrs-python-backend.onrender.com/docs
```

---

## Service Configuration

**Already configured in render.yaml:**
- ✅ Service name: `isrs-python-backend`
- ✅ Region: Oregon (US West)
- ✅ Plan: Starter ($7/mo)
- ✅ Python version: 3.12.0
- ✅ Build command: `pip install -r requirements.txt`
- ✅ Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- ✅ Health check: `/health`
- ✅ Auto-deploy: Enabled (pushes to main trigger deployment)
- ✅ CORS: Configured for frontend

---

## What Happens Next

### Immediate (5 minutes)
1. Build starts automatically
2. Python 3.12 installed
3. Dependencies installed (24 packages)
4. Server starts on dynamic port
5. Health checks pass
6. Service goes live! 🎉

### First Hour
- Monitor logs for any errors
- Test all API endpoints
- Verify database connection
- Check health metrics

### First Day
- Monitor performance (response times, memory usage)
- Test document upload and processing
- Verify email service works
- Test Apollo.io enrichment
- Test Claude AI analysis

### First Week - Parallel Running
- Keep Node.js backend running
- Route test traffic to Python backend
- Compare performance metrics
- Fix any issues discovered
- Prepare for traffic migration

---

## Quick Test Script

After deployment, run this to test all major features:

```bash
BACKEND_URL="https://isrs-python-backend.onrender.com"

# 1. Health check
echo "Testing health..."
curl -s $BACKEND_URL/health | jq

# 2. Request magic link (should return success)
echo "Testing auth..."
curl -s -X POST $BACKEND_URL/api/auth/request-login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | jq

# 3. Check API docs
echo "Opening API documentation..."
open $BACKEND_URL/docs
```

---

## Monitoring Dashboard

After deployment, monitor at:
- **Render Dashboard:** https://dashboard.render.com/web/isrs-python-backend
- **Metrics:** CPU, Memory, Bandwidth usage
- **Logs:** Real-time streaming logs
- **Events:** Deployment history

---

## Rollback Plan

If something goes wrong:

1. **Immediate:** Render keeps previous version
   - Dashboard → Deployments → Rollback to previous

2. **Frontend:** Still points to Node.js backend
   - No user impact during deployment

3. **Database:** Shared with Node.js
   - No data loss risk

---

## Cost

**Starter Plan:** $7/month
- 512 MB RAM
- Shared CPU
- 100 GB bandwidth
- Free SSL
- Auto-scaling disabled

**Upgrade later if needed:**
- Pro: $25/mo (2GB RAM, dedicated CPU)
- Pro Plus: $85/mo (4GB RAM)

---

## Support

- **Deployment guide:** `DEPLOYMENT.md`
- **Session summary:** `SESSION_SUMMARY.md`
- **API docs:** `/docs` endpoint
- **Render docs:** https://render.com/docs/web-services

---

## ✅ Ready to Deploy!

**Repository:** https://github.com/akornenvironmental/isrs
**Branch:** main (just pushed!)
**Files:** 44 files, 7,426 lines
**Status:** Production-ready ✨

Go to Render dashboard and click **"New +" → "Web Service"** now!
