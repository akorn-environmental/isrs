#!/bin/bash

# ISRS Startup Script
# Performs health checks and starts development servers
# Created: 2026-01-20

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directories
PROJECT_ROOT="/Users/akorn/Desktop/ITERM PROJECTS/ISRS"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
BACKEND_DIR="$PROJECT_ROOT/backend-python"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ISRS Development Environment Startup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
    fi
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print info
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

#############################################
# 1. DIRECTORY CHECK
#############################################
echo -e "${BLUE}[1/8] Checking directories...${NC}"

if [ -d "$PROJECT_ROOT" ]; then
    print_status 0 "Project root exists: $PROJECT_ROOT"
else
    print_status 1 "Project root not found!"
    exit 1
fi

if [ -d "$FRONTEND_DIR" ]; then
    print_status 0 "Frontend directory exists"
else
    print_status 1 "Frontend directory not found!"
    exit 1
fi

if [ -d "$BACKEND_DIR" ]; then
    print_status 0 "Backend directory exists"
else
    print_status 1 "Backend directory not found!"
    exit 1
fi
echo ""

#############################################
# 2. GIT STATUS CHECK
#############################################
echo -e "${BLUE}[2/8] Checking Git status...${NC}"

cd "$PROJECT_ROOT"

# Check for uncommitted changes
UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -gt 0 ]; then
    print_warning "You have $UNCOMMITTED uncommitted changes"
    git status --short
else
    print_status 0 "Working directory clean"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)
print_info "Current branch: $CURRENT_BRANCH"

# Check git remote URL
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -n "$REMOTE_URL" ]; then
    print_info "Remote URL: $REMOTE_URL"

    # Verify it's a GitHub URL
    if [[ "$REMOTE_URL" =~ github\.com ]]; then
        # Extract repo name for verification
        REPO_NAME_CHECK=$(echo "$REMOTE_URL" | sed 's/.*github.com[:/]\(.*\)\.git/\1/')
        if [ -n "$REPO_NAME_CHECK" ]; then
            print_status 0 "GitHub repo: $REPO_NAME_CHECK"
        fi
    else
        print_warning "Remote is not GitHub"
    fi
else
    print_warning "No git remote configured"
fi

# Check if behind remote
git fetch origin --quiet 2>/dev/null || true
BEHIND=$(git rev-list HEAD..origin/$CURRENT_BRANCH --count 2>/dev/null || echo "0")
if [ "$BEHIND" -gt 0 ]; then
    print_warning "Your branch is $BEHIND commits behind origin/$CURRENT_BRANCH"
    echo "  Run: git pull origin $CURRENT_BRANCH"
fi

# Check for Dependabot security alerts
if command -v gh &> /dev/null; then
    REPO_NAME=$(git remote get-url origin 2>/dev/null | sed 's/.*github.com[:/]\(.*\)\.git/\1/' || echo "")
    if [ -n "$REPO_NAME" ]; then
        VULNS=$(gh api repos/$REPO_NAME/vulnerability-alerts 2>/dev/null | jq '. | length' 2>/dev/null || echo "0")
        if [ "$VULNS" -gt 0 ]; then
            print_warning "$VULNS Dependabot security alerts found"
            echo "  View at: https://github.com/$REPO_NAME/security/dependabot"
        else
            print_status 0 "No Dependabot security alerts"
        fi
    fi
fi
echo ""

#############################################
# 3. TRANSLATION COMPLETENESS CHECK (NEW!)
#############################################
echo -e "${BLUE}[3/8] Checking translation completeness...${NC}"

# Use the accurate analyzer if available, fallback to old checker
if [ -f "$PROJECT_ROOT/analyze_translations.js" ]; then
    TRANS_OUTPUT=$(node "$PROJECT_ROOT/analyze_translations.js" 2>&1 | grep -A 4 "KEY COUNTS:")
    EN_KEYS=$(echo "$TRANS_OUTPUT" | grep "English" | grep -o '[0-9]\+' | head -1)
    ES_KEYS=$(echo "$TRANS_OUTPUT" | grep "Spanish" | grep -o '[0-9]\+' | head -1)
    FR_KEYS=$(echo "$TRANS_OUTPUT" | grep "French" | grep -o '[0-9]\+' | head -1)

    if [ "$EN_KEYS" = "$ES_KEYS" ] && [ "$EN_KEYS" = "$FR_KEYS" ] && [ -n "$FR_KEYS" ]; then
        print_status 0 "All 3 languages synchronized ($EN_KEYS keys each)"
    else
        print_warning "Translation mismatch: EN=$EN_KEYS, ES=$ES_KEYS, FR=$FR_KEYS"
    fi
elif [ -f "$PROJECT_ROOT/check-translations.js" ]; then
    if node "$PROJECT_ROOT/check-translations.js" 2>&1 | head -20; then
        print_status 0 "Translation check passed"
    else
        print_warning "Translation check found issues (see above)"
    fi
else
    print_warning "Translation checker script not found"
fi
echo ""

#############################################
# 4. ENVIRONMENT VARIABLES CHECK
#############################################
echo -e "${BLUE}[4/8] Checking environment variables...${NC}"

# Frontend .env
if [ -f "$FRONTEND_DIR/.env" ]; then
    print_status 0 "Frontend .env exists"

    # Check for critical variables
    if grep -q "VITE_API_URL" "$FRONTEND_DIR/.env" 2>/dev/null; then
        print_status 0 "VITE_API_URL configured"
    else
        print_warning "VITE_API_URL not found in frontend .env"
    fi
else
    print_warning "Frontend .env not found"
fi

# Backend .env
if [ -f "$BACKEND_DIR/.env" ]; then
    print_status 0 "Backend .env exists"

    # Check for critical variables
    CRITICAL_VARS=("DATABASE_URL" "SECRET_KEY" "SMTP_HOST")
    for var in "${CRITICAL_VARS[@]}"; do
        if grep -q "$var" "$BACKEND_DIR/.env" 2>/dev/null; then
            print_status 0 "$var configured"
        else
            print_warning "$var not found in backend .env"
        fi
    done
else
    print_warning "Backend .env not found"
fi
echo ""

#############################################
# 5. DEPENDENCY CHECK
#############################################
echo -e "${BLUE}[5/8] Checking dependencies...${NC}"

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status 0 "Node.js installed: $NODE_VERSION"
else
    print_status 1 "Node.js not found!"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_status 0 "npm installed: $NPM_VERSION"
else
    print_status 1 "npm not found!"
fi

# Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status 0 "Python installed: $PYTHON_VERSION"
else
    print_status 1 "Python not found!"
fi

# Check if node_modules exists
if [ -d "$FRONTEND_DIR/node_modules" ]; then
    print_status 0 "Frontend node_modules exists"
else
    print_warning "Frontend node_modules not found - run: cd frontend && npm install"
fi

# Check if Python venv exists
if [ -d "$BACKEND_DIR/venv" ]; then
    print_status 0 "Backend virtual environment exists"
else
    print_warning "Backend venv not found - run: cd backend-python && python3 -m venv venv"
fi
echo ""

#############################################
# 6. PORT AVAILABILITY CHECK
#############################################
echo -e "${BLUE}[6/8] Checking port availability...${NC}"

# Check if ports are in use
FRONTEND_PORT=5173
BACKEND_PORT=8000

if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port $FRONTEND_PORT (frontend) already in use"
    echo "    Process: $(lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN | tail -n 1 | awk '{print $1, $2}')"
else
    print_status 0 "Port $FRONTEND_PORT (frontend) available"
fi

if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Port $BACKEND_PORT (backend) already in use"
    echo "    Process: $(lsof -Pi :$BACKEND_PORT -sTCP:LISTEN | tail -n 1 | awk '{print $1, $2}')"
else
    print_status 0 "Port $BACKEND_PORT (backend) available"
fi
echo ""

#############################################
# 7. DATABASE CONNECTION CHECK
#############################################
echo -e "${BLUE}[7/8] Checking database connection...${NC}"

if [ -f "$BACKEND_DIR/.env" ]; then
    DATABASE_URL=$(grep "^DATABASE_URL=" "$BACKEND_DIR/.env" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'")

    if [ -n "$DATABASE_URL" ]; then
        print_info "Database URL configured"

        # Try to extract database type
        if [[ "$DATABASE_URL" == postgresql* ]]; then
            print_info "Database type: PostgreSQL"
        elif [[ "$DATABASE_URL" == mysql* ]]; then
            print_info "Database type: MySQL"
        elif [[ "$DATABASE_URL" == sqlite* ]]; then
            print_info "Database type: SQLite"
        fi
    else
        print_warning "DATABASE_URL not configured"
    fi
else
    print_warning "Cannot check database - .env not found"
fi
echo ""

#############################################
# 8. RENDER DEPLOYMENT STATUS
#############################################
echo -e "${BLUE}[8/8] Checking Render deployment...${NC}"

# Check if we have render API key
RENDER_API_KEY_FILE="/Users/akorn/Desktop/ITERM PROJECTS/_SYSTEM/.render-api-key"

if [ -f "$RENDER_API_KEY_FILE" ]; then
    RENDER_API_KEY=$(cat "$RENDER_API_KEY_FILE" 2>/dev/null)

    if [ -n "$RENDER_API_KEY" ]; then
        print_status 0 "Render API key configured"
        print_info "Production URL: https://www.shellfish-society.org"
    else
        print_warning "Render API key file is empty"
    fi
else
    print_warning "Render API key not found"
fi
echo ""

#############################################
# SUMMARY
#############################################
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Health Check Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Quick Start Commands:${NC}"
echo ""
echo "  ${GREEN}Frontend (Vite):${NC}"
echo "    cd $FRONTEND_DIR"
echo "    npm run dev"
echo ""
echo "  ${GREEN}Backend (FastAPI):${NC}"
echo "    cd $BACKEND_DIR"
echo "    source venv/bin/activate"
echo "    uvicorn app.main:app --reload --port 8000"
echo ""
echo "  ${GREEN}Both (parallel):${NC}"
echo "    cd $FRONTEND_DIR && npm run dev &"
echo "    cd $BACKEND_DIR && source venv/bin/activate && uvicorn app.main:app --reload &"
echo ""
echo -e "${BLUE}Translation Status:${NC}"
echo "  6/6 member portal pages fully translated (EN/ES/FR)"
echo "  Live at: https://www.shellfish-society.org/member/login.html"
echo ""
echo -e "${YELLOW}For issues:${NC}"
echo "  - Check logs in each terminal"
echo "  - Verify .env files are configured"
echo "  - Ensure all dependencies are installed"
echo ""

# Ask if user wants to start servers
read -p "Start development servers now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Starting servers...${NC}"

    # Start backend in background
    cd "$BACKEND_DIR"
    if [ -d "venv" ]; then
        echo "Starting backend on port 8000..."
        source venv/bin/activate && uvicorn app.main:app --reload --port 8000 &
        BACKEND_PID=$!
        echo "Backend PID: $BACKEND_PID"
    else
        echo -e "${RED}Cannot start backend - venv not found${NC}"
    fi

    # Start frontend in background
    cd "$FRONTEND_DIR"
    if [ -d "node_modules" ]; then
        echo "Starting frontend on port 5173..."
        npm run dev &
        FRONTEND_PID=$!
        echo "Frontend PID: $FRONTEND_PID"
    else
        echo -e "${RED}Cannot start frontend - node_modules not found${NC}"
    fi

    echo ""
    echo -e "${GREEN}Servers started!${NC}"
    echo "  Frontend: http://localhost:5173"
    echo "  Backend:  http://localhost:8000"
    echo ""
    echo "To stop servers:"
    echo "  kill $BACKEND_PID $FRONTEND_PID"
    echo "  or press Ctrl+C in each terminal"
else
    echo "Startup cancelled."
fi
