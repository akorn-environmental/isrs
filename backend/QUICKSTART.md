# Quick Start Guide

Get the ISRS Database backend up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- Google Service Account JSON key file
- Claude API key
- Git installed

## Local Development

### 1. Clone and Install

```bash
cd /Users/akorn/isrs-database-backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:
- `CLAUDE_API_KEY` - Already set: `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`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - From your service account JSON
- `GOOGLE_PRIVATE_KEY` - From your service account JSON (keep the `\n` characters)

### 3. Run Locally

```bash
npm run dev
```

Visit http://localhost:3000 - you should see:
```json
{
  "ok": true,
  "message": "ISRS Database API running",
  "version": "prod-1.3"
}
```

## Deploy to Render

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/isrs-database-backend.git
   git push -u origin main
   ```

2. **Create Render Service**
   - Go to https://dashboard.render.com/
   - Click "New +" > "Web Service"
   - Connect your GitHub repo
   - Service auto-configures from `render.yaml`

3. **Add Secrets**
   In Render dashboard, add these environment variables:
   - `CLAUDE_API_KEY`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

4. **Deploy!**
   Click "Create Web Service" and wait for deployment.

## Update Frontend

In your frontend HTML file, update the CONFIG:

```javascript
const CONFIG = {
    WEB_APP_URL: 'https://YOUR_SERVICE.onrender.com'
    // ... rest of config
};
```

See `FRONTEND_UPDATE.md` for complete frontend update instructions.

## Test Everything

```bash
# Test health
curl https://YOUR_SERVICE.onrender.com/health

# Test stats
curl https://YOUR_SERVICE.onrender.com/api/admin/stats

# Test board members
curl https://YOUR_SERVICE.onrender.com/api/admin/board-members
```

## Need More Details?

- Full deployment guide: `DEPLOYMENT.md`
- Frontend changes: `FRONTEND_UPDATE.md`
- API documentation: `README.md`
- Troubleshooting: `DEPLOYMENT.md` (Part 4)

## Support

Contact: aaron.kornbluth@gmail.com
