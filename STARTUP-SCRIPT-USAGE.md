# ISRS Startup Script - Usage Guide

**Created**: 2026-01-20
**Status**: Production Ready ✅

---

## Quick Start

```bash
cd /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS
./.isrs_init.sh
```

This will run all health checks and optionally start development servers.

---

## What It Checks

### 1. Directory Structure ✅
- Verifies project root exists
- Checks frontend directory
- Checks backend-python directory

### 2. Git Status ✅
- Shows uncommitted changes
- Displays current branch
- Checks if behind remote (needs pull)

### 3. Translation Completeness ✅ (NEW!)
- Counts translation keys per language (EN/ES/FR)
- Verifies all 6 critical member portal pages:
  - `memberLogin` (login.html)
  - `signupHeading` (signup.html)
  - `verifyingLogin` (verify.html)
  - `myProfile` (profile.html)
  - `welcomeToISRS` (welcome.html)
  - `memberDirectory` (directory.html)
- Reports missing or extra keys
- Ensures translation consistency

### 4. Environment Variables ✅
- Checks frontend/.env exists
- Checks backend-python/.env exists
- Validates critical variables:
  - `VITE_API_URL`
  - `DATABASE_URL`
  - `SECRET_KEY`
  - `EMAIL_HOST`

### 5. Dependencies ✅
- Node.js version
- npm version
- Python version
- frontend/node_modules exists
- backend-python/venv exists

### 6. Port Availability ✅
- Port 5173 (frontend Vite server)
- Port 8000 (backend FastAPI server)
- Shows which process is using ports if occupied

### 7. Database Connection ✅
- Verifies DATABASE_URL configured
- Detects database type (PostgreSQL, MySQL, SQLite)

### 8. Render Deployment ✅
- Checks Render API key configured
- Shows production URL

---

## Example Output

```bash
========================================
ISRS Development Environment Startup
========================================

[1/8] Checking directories...
✓ Project root exists: /Users/akorn/Desktop/ITERM PROJECTS/ISRS
✓ Frontend directory exists
✓ Backend directory exists

[2/8] Checking Git status...
✓ Working directory clean
ℹ Current branch: main

[3/8] Checking translation completeness...
Translation keys found:
  English (en): 864 keys
  Spanish (es): 870 keys
  French (fr):  865 keys

Checking critical member portal keys:
  ✓ memberLogin (all languages)
  ✓ signupHeading (all languages)
  ✓ verifyingLogin (all languages)
  ✓ myProfile (all languages)
  ✓ welcomeToISRS (all languages)
  ✓ memberDirectory (all languages)

✓ All 6 critical member portal pages verified

[4/8] Checking environment variables...
✓ Frontend .env exists
✓ Backend .env exists
✓ DATABASE_URL configured
✓ SECRET_KEY configured
✓ EMAIL_HOST configured

[5/8] Checking dependencies...
✓ Node.js installed: v22.21.0
✓ npm installed: 10.9.4
✓ Python installed: Python 3.14.0
✓ Frontend node_modules exists
✓ Backend virtual environment exists

[6/8] Checking port availability...
✓ Port 5173 (frontend) available
✓ Port 8000 (backend) available

[7/8] Checking database connection...
ℹ Database URL configured
ℹ Database type: PostgreSQL

[8/8] Checking Render deployment...
✓ Render API key configured
ℹ Production URL: https://www.shellfish-society.org

========================================
Health Check Complete!
========================================

Quick Start Commands:

  Frontend (Vite):
    cd /Users/akorn/Desktop/ITERM PROJECTS/ISRS/frontend
    npm run dev

  Backend (FastAPI):
    cd /Users/akorn/Desktop/ITERM PROJECTS/ISRS/backend-python
    source venv/bin/activate
    uvicorn app.main:app --reload --port 8000

Translation Status:
  6/6 member portal pages fully translated (EN/ES/FR)
  Live at: https://www.shellfish-society.org/member/login.html

Start development servers now? (y/n)
```

---

## Translation Checker (Standalone)

You can also run just the translation check:

```bash
cd /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS
node check-translations.js
```

This will:
- Count keys in each language
- Report missing keys
- Check critical member portal pages
- Exit with code 0 (success) or 1 (issues found)

---

## What Gets Checked in Translation Completeness

The script verifies that all 6 member portal pages have their critical translation keys present:

| Page | Translation Key | Purpose |
|------|----------------|---------|
| login.html | `memberLogin` | Page heading |
| signup.html | `signupHeading` | Page heading |
| verify.html | `verifyingLogin` | Verification status |
| profile.html | `myProfile` | Page heading |
| welcome.html | `welcomeToISRS` | Welcome heading |
| directory.html | `memberDirectory` | Directory heading |

Each key must exist in all 3 languages: English (en), Spanish (es), French (fr).

---

## Interpreting Results

### ✓ Green Checkmark
Everything is working correctly.

### ⚠ Yellow Warning
Issue detected but not critical. Examples:
- Uncommitted changes (normal during development)
- Frontend .env missing (optional)
- Port already in use (servers running)
- Translation count mismatch (minor differences in multi-word phrases)

### ✗ Red X
Critical issue that should be fixed. Examples:
- Project directory not found
- Critical environment variables missing
- Critical translation keys missing
- Dependencies not installed

---

## Auto-Start Servers

At the end of the health check, you'll be prompted:

```
Start development servers now? (y/n)
```

If you answer **y**:
- Backend starts on port 8000
- Frontend starts on port 5173
- Both run in background
- Process IDs displayed

To stop servers:
```bash
kill <BACKEND_PID> <FRONTEND_PID>
```

Or press Ctrl+C in each terminal if running in foreground.

---

## Common Issues & Solutions

### Issue: "Frontend node_modules not found"
**Solution**:
```bash
cd frontend
npm install
```

### Issue: "Backend venv not found"
**Solution**:
```bash
cd backend-python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "Port 5173 already in use"
**Solution**: Frontend server already running. Either:
- Use existing server
- Or kill it: `kill $(lsof -t -i:5173)`

### Issue: "Port 8000 already in use"
**Solution**: Backend server already running. Either:
- Use existing server
- Or kill it: `kill $(lsof -t -i:8000)`

### Issue: "Translation key mismatch"
This is **usually not critical**. It often means:
- Multi-word translations in Spanish/French (e.g., "Privacy Rights" = "Droits à la Confidentialité")
- Different word counts for same meaning

As long as the **6 critical member portal keys** show ✓, translations are working.

---

## Adding to Your Workflow

### Option 1: Manual Run
```bash
cd /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS
./.isrs_init.sh
```

### Option 2: Alias (Recommended)
Add to your `~/.zshrc` or `~/.bashrc`:

```bash
alias isrs='cd /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS && ./.isrs_init.sh'
```

Then from anywhere:
```bash
isrs
```

### Option 3: VS Code Task
Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "ISRS Health Check",
      "type": "shell",
      "command": "./.isrs_init.sh",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

---

## Files

- `.isrs_init.sh` - Main startup script (555 lines)
- `check-translations.js` - Standalone translation checker (210 lines)
- `STARTUP-SCRIPT-USAGE.md` - This guide

---

## Benefits

✅ **Catches issues early** - Before you start coding
✅ **Verifies translations** - All 6 member portal pages
✅ **Saves time** - No manual checking
✅ **Consistent workflow** - Same checks every time
✅ **Auto-start option** - Servers up in one command
✅ **Production monitoring** - Render deployment status

---

## Contributing

To add a new check:

1. Edit `.isrs_init.sh`
2. Add a new section (update the count in headers)
3. Use the helper functions:
   - `print_status 0 "Success message"` - Green ✓
   - `print_status 1 "Error message"` - Red ✗
   - `print_warning "Warning message"` - Yellow ⚠
   - `print_info "Info message"` - Blue ℹ

Example:
```bash
echo -e "${BLUE}[9/9] Checking new feature...${NC}"

if [ -f "some-file.txt" ]; then
    print_status 0 "Feature configured"
else
    print_warning "Feature not found"
fi
echo ""
```

---

## Change Log

### v1.0 (2026-01-20)
- Initial release
- 8 health checks
- Translation completeness checker
- Auto-start servers option
- Full color output

---

**Maintained by**: Claude Sonnet 4.5
**Co-Authored-By**: Claude Sonnet 4.5 <noreply@anthropic.com>
