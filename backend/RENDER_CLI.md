# Render CLI Quick Reference

## Setup Complete ✅

You're logged in as: **Aaron Kornbluth** (aaron.kornbluth@gmail.com)

### Your ISRS Services

- **Backend**: `isrs-database-backend` (srv-d41mi2emcj7s73998hug)
- **Frontend**: `isrs-frontend` (srv-d44tdnq4d50c73epo66g)  
- **Database**: `isrs-database` (dpg-d41lpl3uibrs73andv50-a)

---

## Common Commands

### Deploy Backend
```bash
# Trigger a new deployment
render deploy -s srv-d41mi2emcj7s73998hug

# Or use service name
render deploy -s isrs-database-backend
```

### Deploy Frontend
```bash
render deploy -s srv-d44tdnq4d50c73epo66g
```

### View Logs
```bash
# Follow backend logs in real-time
render logs -s isrs-database-backend -f

# View last 100 lines
render logs -s isrs-database-backend -n 100
```

### Service Status
```bash
# Check backend status
render services get -s isrs-database-backend -o json

# List all services
render services list -o json
```

### Environment Variables
```bash
# List env vars for backend
render env-vars list -s isrs-database-backend

# Set a new env var
render env-vars set -s isrs-database-backend KEY=value

# Delete an env var
render env-vars delete -s isrs-database-backend KEY
```

### Database Commands
```bash
# Connect to database via psql
render psql -d dpg-d41lpl3uibrs73andv50-a

# Get database info
render databases get -d isrs-database -o json

# View connection string (will prompt for confirmation)
render databases connection-string -d isrs-database
```

---

## Quick Deploy Workflow

### Backend Changes
```bash
# 1. Make your changes
# 2. Commit to git
git add .
git commit -m "your message"

# 3. Push to GitHub (triggers auto-deploy on Render)
git push origin main

# OR manually trigger deploy
render deploy -s isrs-database-backend

# 4. Watch logs
render logs -s isrs-database-backend -f
```

### Run Migrations
```bash
# SSH into the backend service
render ssh srv-d41mi2emcj7s73998hug

# Then run migrations
node run-migrations.js
exit
```

---

## Useful Tips

### Check Health
```bash
curl https://isrs-database-backend.onrender.com/health
```

### View Deploy History
```bash
render deploys list -s isrs-database-backend -o json
```

### Restart Service
```bash
render services restart -s isrs-database-backend
```

### Scale Service
```bash
# View current plan
render services get -s isrs-database-backend -o json | grep buildPlan

# Note: Plan changes must be done via dashboard
```

---

## Troubleshooting

### Deploy Failed
```bash
# Check recent logs
render logs -s isrs-database-backend -n 200

# Check deploy status
render deploys list -s isrs-database-backend -o json | head -50
```

### Database Connection Issues
```bash
# Test database connection
render psql -d isrs-database -c "SELECT version();"

# Check if DATABASE_URL is set
render env-vars list -s isrs-database-backend | grep DATABASE
```

### Service Won't Start
```bash
# Check recent logs for errors
render logs -s isrs-database-backend -n 100

# Verify all required env vars are set
render env-vars list -s isrs-database-backend
```

---

## Configuration Files

### render.yaml
Located at `/Users/akorn/isrs-database-backend/render.yaml`

This file defines your infrastructure as code. Changes to this file require manual sync via:
```bash
# Apply changes from render.yaml
render blueprint sync
```

---

## Resources

- [Render CLI Docs](https://docs.render.com/cli)
- [Dashboard](https://dashboard.render.com)
- Backend URL: https://isrs-database-backend.onrender.com
- Frontend URL: https://isrs-frontend.onrender.com

---

**Last Updated**: January 2025
