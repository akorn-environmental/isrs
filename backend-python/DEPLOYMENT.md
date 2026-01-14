# ISRS Python Backend - Deployment Guide

## Render Deployment

### Automatic Deployment (Recommended)

1. **Connect Repository to Render:**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `backend-python` directory (or create a new repo for it)
   - Render will auto-detect `render.yaml`

2. **Configure Environment Variables:**
   The following variables are configured in `render.yaml` but need values:

   ```bash
   DATABASE_URL=postgresql://isrs_user:rzE9q7ONZUAAdnA7ndLMXPKILyI6mnVr@dpg-d41lpl3uibrs73andv50-a.oregon-postgres.render.com/isrs_database

   ASYNC_DATABASE_URL=postgresql+asyncpg://isrs_user:rzE9q7ONZUAAdnA7ndLMXPKILyI6mnVr@dpg-d41lpl3uibrs73andv50-a.oregon-postgres.render.com/isrs_database

   SMTP_USER=cbt.pmi.research.survey@gmail.com
   SMTP_PASSWORD=mymcpuknrkbbvxps

   ANTHROPIC_API_KEY=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

   APOLLO_API_KEY=2EumgfMJpNCcTCgaJyJ2mg
   ```

3. **Deploy:**
   - Render will automatically build and deploy
   - Wait for build to complete (~3-5 minutes)
   - Health check endpoint: `/health`

### Manual Deployment

If you prefer manual deployment:

```bash
# 1. Install Render CLI
npm install -g render

# 2. Login to Render
render login

# 3. Deploy from command line
render deploy
```

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `ASYNC_DATABASE_URL` | Async PostgreSQL connection | `postgresql+asyncpg://user:pass@host/db` |
| `SECRET_KEY` | JWT secret key (auto-generated) | - |
| `ANTHROPIC_API_KEY` | Claude AI API key | `sk-ant-api03-...` |
| `APOLLO_API_KEY` | Apollo.io API key | - |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `user@gmail.com` |
| `SMTP_PASSWORD` | Email password/app password | - |
| `CORS_ORIGINS` | Allowed frontend origins | `https://frontend.com` |

### Optional Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ENVIRONMENT` | `production` | Environment name |
| `LOG_LEVEL` | `INFO` | Logging level |
| `DEBUG` | `false` | Debug mode |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | (Render sets) | Server port |

## Post-Deployment

### 1. Verify Deployment

```bash
# Check health endpoint
curl https://isrs-python-backend.onrender.com/health

# Should return:
# {"status":"healthy","app":"ISRS Database API","version":"2.0.0","environment":"production"}
```

### 2. Test API Documentation

Visit:
- Swagger UI: `https://isrs-python-backend.onrender.com/docs`
- ReDoc: `https://isrs-python-backend.onrender.com/redoc`

### 3. Test Authentication

```bash
# Request magic link
curl -X POST https://isrs-python-backend.onrender.com/api/auth/request-login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com"}'
```

### 4. Monitor Logs

View logs in Render Dashboard:
- Dashboard → Your Service → Logs tab
- Real-time log streaming
- Error tracking

## Parallel Deployment Strategy

The Python backend is designed to run parallel with the existing Node.js backend:

1. **Phase 1: Deploy Python Backend**
   - Deploy to Render as separate service
   - Test all endpoints
   - No production traffic yet

2. **Phase 2: Frontend Integration**
   - Update frontend to support both backends
   - Add feature flag for Python backend
   - Test with staging data

3. **Phase 3: Gradual Migration**
   - Route 10% of traffic to Python backend
   - Monitor performance and errors
   - Gradually increase to 50%, then 100%

4. **Phase 4: Deprecate Node.js**
   - Once Python backend is stable at 100%
   - Keep Node.js running for 1 week as backup
   - Decommission old backend

## Performance Monitoring

### Key Metrics to Monitor

1. **Response Times:**
   - Health check: < 100ms
   - CRUD operations: < 500ms
   - Document processing: < 10s
   - AI analysis: < 30s

2. **Error Rates:**
   - Target: < 0.1% error rate
   - Monitor 4xx and 5xx responses
   - Alert on elevated error rates

3. **Resource Usage:**
   - Memory: < 512MB (Starter plan)
   - CPU: < 50% average
   - Database connections: < 20

### Render Monitoring

Render provides built-in monitoring:
- Metrics dashboard
- Automatic health checks
- Disk usage tracking
- Memory and CPU graphs

## Troubleshooting

### Build Failures

**Issue:** Python version mismatch
```bash
# Solution: Verify PYTHON_VERSION in render.yaml
PYTHON_VERSION=3.12.0
```

**Issue:** Missing dependencies
```bash
# Solution: Check requirements.txt is complete
pip freeze > requirements.txt
```

### Runtime Errors

**Issue:** Database connection failed
```bash
# Check: DATABASE_URL format
# Should be: postgresql://user:pass@host:port/dbname
```

**Issue:** CORS errors
```bash
# Check: CORS_ORIGINS includes your frontend URL
CORS_ORIGINS=https://your-frontend.com
```

### Performance Issues

**Issue:** Slow document processing
```bash
# Solution: Use background jobs (future enhancement)
# For now: Increase timeout limits
```

**Issue:** Memory limits exceeded
```bash
# Solution: Upgrade to Pro plan ($25/mo)
# Or optimize memory usage in services
```

## Scaling

### Vertical Scaling (Recommended First)

Upgrade Render plan:
- **Starter:** 512MB RAM, Shared CPU - $7/mo ✅ Current
- **Pro:** 2GB RAM, Dedicated CPU - $25/mo
- **Pro Plus:** 4GB RAM, Dedicated CPU - $85/mo

### Horizontal Scaling

For high traffic:
- Enable auto-scaling in Render
- Add Redis cache layer
- Implement background job processing
- Use CDN for static content

## Backup and Recovery

### Database Backups

Render PostgreSQL includes:
- Daily automated backups
- Point-in-time recovery
- 7-day backup retention

### Disaster Recovery

1. **Code:** Version controlled in GitHub
2. **Database:** Automated daily backups
3. **Secrets:** Stored in Render environment variables
4. **Recovery Time:** < 1 hour

## Support

- **Render Support:** https://render.com/docs
- **API Documentation:** `/docs` endpoint
- **Issue Tracker:** GitHub repository
- **Session Summary:** `SESSION_SUMMARY.md`

---

**Deployment Date:** January 14, 2026
**Backend Version:** 2.0.0
**Deployment Method:** Render (render.yaml)
**Region:** Oregon (US West)
