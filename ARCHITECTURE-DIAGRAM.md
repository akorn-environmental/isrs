# ISRS Architecture Diagram

## Single-Service Architecture (Current - Jan 15, 2026)

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ DNS
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              www.shellfish-society.org                           │
│              (CNAME → isrs-python-backend.onrender.com)          │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ISRS PYTHON BACKEND                           │
│              (isrs-python-backend.onrender.com)                  │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  FastAPI Application (app/main.py)                         │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  API Routes (lines 86-96)                           │  │ │
│  │  │                                                      │  │ │
│  │  │  /api/auth/*          → Authentication              │  │ │
│  │  │  /api/contacts/*      → Contact Management          │  │ │
│  │  │  /api/votes/*         → Board Voting                │  │ │
│  │  │  /api/conferences/*   → ICSR Conference             │  │ │
│  │  │  /api/funding/*       → Grant Pipeline              │  │ │
│  │  │  /api/documents/*     → Document Processing         │  │ │
│  │  │  /api/enrichment/*    → Apollo.io Integration       │  │ │
│  │  │  /api/assets/*        → S3 Asset Management         │  │ │
│  │  │  /health              → Health Check                │  │ │
│  │  │  /docs                → FastAPI Swagger UI          │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  │                                                             │ │
│  │  ┌─────────────────────────────────────────────────────┐  │ │
│  │  │  Static File Serving (lines 98-130)                 │  │ │
│  │  │                                                      │  │ │
│  │  │  /                    → index.html                   │  │ │
│  │  │  /admin/*             → Admin Dashboard             │  │ │
│  │  │  /conference/*        → Conference Pages            │  │ │
│  │  │  /auth/*              → Login Pages                 │  │ │
│  │  │  /js/*                → JavaScript Files            │  │ │
│  │  │  /css/*               → Stylesheets                 │  │ │
│  │  │  /images/*            → Images & Gallery            │  │ │
│  │  │                                                      │  │ │
│  │  │  Source: ../frontend/public/                        │  │ │
│  │  └─────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Services Layer                                            │ │
│  │                                                             │ │
│  │  - ClaudeService      → AI document processing            │ │
│  │  - EmailService       → SendGrid/AWS SES                  │ │
│  │  - DocumentService    → PDF/Word/Excel parsing            │ │
│  │  - ApolloService      → Contact enrichment                │ │
│  │  - StripeService      → Payment processing                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ PostgreSQL
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│              RENDER POSTGRESQL DATABASE                          │
│              (isrs-db.onrender.com)                              │
│                                                                   │
│  Tables:                                                          │
│  - attendee_profiles                                              │
│  - contacts                                                       │
│  - organizations                                                  │
│  - conference_registrations                                       │
│  - user_sessions                                                  │
│  - contact_enrichment                                             │
│  - funding_prospects                                              │
│  - board_votes                                                    │
│  - email_campaigns                                                │
│  - refresh_tokens                                                 │
│  + 30+ more tables                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Legacy Architecture (Pre-Jan 15, 2026) - DEPRECATED

```
┌─────────────────────────────────────────────────────────────────┐
│                          INTERNET                                │
└─────────────────────────────────────────────────────────────────┘
                    │                          │
                    │ DNS                      │ DNS
                    │                          │
                    ▼                          ▼
┌─────────────────────────────┐   ┌──────────────────────────────┐
│ www.shellfish-society.org   │   │  API subdomain               │
│ (Frontend - Static Site)    │   │  (Backend - Node.js/Python)  │
│                             │   │                              │
│ isrs-frontend.onrender.com  │   │ isrs-backend.onrender.com    │
└─────────────────────────────┘   └──────────────────────────────┘
                    │                          ▲
                    │ CORS API Calls           │
                    └──────────────────────────┘

PROBLEMS:
- ❌ Two separate services to deploy
- ❌ CORS complexity and errors
- ❌ Higher cost ($7/month × 2 = $14/month)
- ❌ Separate deployments needed for frontend/backend
- ❌ Extra DNS lookup for API calls
- ❌ CORS preflight requests slow down API
```

## Directory Structure

```
ISRS/
├── backend-python/              ⭐ PRIMARY BACKEND (322MB)
│   ├── app/
│   │   ├── main.py              🔑 Main FastAPI app (serves API + frontend)
│   │   ├── config.py            ⚙️  Configuration
│   │   ├── database.py          💾 SQLAlchemy setup
│   │   ├── models/              📊 Database models
│   │   │   ├── attendee.py
│   │   │   ├── contact.py
│   │   │   ├── vote.py
│   │   │   └── ...
│   │   ├── routers/             🛣️  API endpoints
│   │   │   ├── auth.py
│   │   │   ├── contacts.py
│   │   │   ├── votes.py
│   │   │   └── ...
│   │   ├── services/            🔧 Business logic
│   │   │   ├── claude_service.py
│   │   │   ├── email_service.py
│   │   │   ├── document_service.py
│   │   │   └── ...
│   │   └── utils/               🛠️  Helper functions
│   ├── requirements.txt         📦 Python dependencies
│   ├── render.yaml              🚀 Deployment config
│   └── venv/                    🐍 Virtual environment
│
├── frontend/
│   └── public/                  🎨 STATIC FRONTEND (608MB)
│       ├── index.html           🏠 Homepage
│       ├── admin/               👨‍💼 Admin dashboard (40 files)
│       │   ├── dashboard.html
│       │   ├── contacts.html
│       │   ├── votes.html
│       │   └── ...
│       ├── js/                  📜 JavaScript (20 files)
│       │   ├── api.js
│       │   ├── auth.js
│       │   └── ...
│       ├── css/                 🎨 Stylesheets
│       └── images/              🖼️  Gallery images
│
└── backend/                     ⚠️  DEPRECATED NODE.JS (1.9MB)
    ├── package.json             (Legacy)
    ├── render.yaml              (Not used)
    └── src/                     (Old Express.js code)
```

## Request Flow

### Frontend Request (HTML/CSS/JS)

```
User Browser
    │
    │ GET https://www.shellfish-society.org/
    ▼
Python Backend (FastAPI)
    │
    │ Check if path starts with "api/"?
    ▼
   NO
    │
    │ Check if file exists at frontend/public/{path}?
    ▼
  YES
    │
    │ Return file (index.html, admin/dashboard.html, etc.)
    ▼
User Browser
```

### API Request (JSON Data)

```
Frontend JavaScript
    │
    │ POST https://www.shellfish-society.org/api/auth/login
    │      or GET /api/contacts
    ▼
Python Backend (FastAPI)
    │
    │ Check if path starts with "api/"?
    ▼
  YES
    │
    │ Route to appropriate router (auth.py, contacts.py, etc.)
    ▼
Router
    │
    │ Authenticate, validate, process
    ▼
Database (PostgreSQL)
    │
    │ Execute query
    ▼
Router
    │
    │ Format response as JSON
    ▼
Frontend JavaScript
    │
    │ Update UI
    ▼
User Browser
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
│                                                                   │
│  - HTML/CSS/JS loaded from Python backend                        │
│  - JavaScript makes API calls to same origin                     │
│  - No CORS needed (same-origin requests)                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS (same origin)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PYTHON BACKEND (FastAPI)                       │
│                                                                   │
│  Frontend serving: /*, /admin/*, /js/*, /css/*                   │
│  API endpoints: /api/*, /health, /docs                           │
└─────────────────────────────────────────────────────────────────┘
                   │           │           │
                   │           │           │
        ┌──────────┘           │           └──────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐    ┌───────────────────┐    ┌──────────────┐
│  PostgreSQL  │    │  External APIs    │    │   AWS S3     │
│   Database   │    │                   │    │   Storage    │
│              │    │  - Claude AI      │    │              │
│  - Contacts  │    │  - Apollo.io      │    │  - Images    │
│  - Votes     │    │  - Stripe         │    │  - Files     │
│  - Events    │    │  - SendGrid       │    │  - Documents │
│  - Users     │    │  - AWS SES        │    │              │
└──────────────┘    └───────────────────┘    └──────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                                                                   │
│  HTML5, CSS3, Vanilla JavaScript                                 │
│  - No framework (vanilla JS)                                     │
│  - Custom design system                                          │
│  - Role-based access control (RBAC)                              │
│  - 47+ pages                                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    PYTHON BACKEND (FastAPI)                      │
│                                                                   │
│  Runtime:       Python 3.12                                      │
│  Framework:     FastAPI 0.104+                                   │
│  Server:        Uvicorn                                          │
│  ORM:           SQLAlchemy 2.0+                                  │
│  Database:      PostgreSQL (asyncpg driver)                      │
│  Auth:          JWT + Magic Links                                │
│  Email:         SendGrid, AWS SES                                │
│  Payments:      Stripe                                           │
│  AI:            Anthropic Claude API                             │
│  Enrichment:    Apollo.io API                                    │
│  Documents:     PyPDF2, pdfplumber, python-docx, openpyxl       │
│  Images:        Pillow                                           │
│  Storage:       AWS S3 (boto3)                                   │
│  Security:      Rate limiting, CORS, helmet                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│                                                                   │
│  PostgreSQL 14+                                                  │
│  - 40+ tables                                                    │
│  - 4,000+ contacts                                               │
│  - Conference registrations                                      │
│  - Board votes                                                   │
│  - Email campaigns                                               │
│  - Funding prospects                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      HOSTING & DEPLOYMENT                        │
│                                                                   │
│  Platform:      Render.com                                       │
│  Region:        Oregon (us-west)                                 │
│  Plan:          Starter ($7/month)                               │
│  Build:         pip install -r requirements.txt                  │
│  Start:         uvicorn app.main:app --host 0.0.0.0 --port $PORT│
│  Health:        /health                                          │
│  Auto-deploy:   Enabled (on git push)                            │
└─────────────────────────────────────────────────────────────────┘
```

## Benefits of Single-Service Architecture

### 🎯 Simplicity
```
Before: Frontend Service + Backend Service = 2 services
After:  Single Service = 1 service

- One service to deploy
- One URL to configure
- One set of logs
- One health check
- No CORS complexity
```

### 💰 Cost Savings
```
Before:
  Frontend: $7/month
  Backend:  $7/month
  Total:    $14/month

After:
  Single:   $7/month
  Total:    $7/month

Savings:    50%
```

### ⚡ Performance
```
Before:
  www.shellfish-society.org → Frontend (DNS lookup)
  api.shellfish-society.org → Backend (DNS lookup)
  + CORS preflight requests
  + Extra latency

After:
  www.shellfish-society.org → Single service
  Same-origin requests (no CORS preflight)
  - Faster page loads
  - Better caching
```

### 👨‍💻 Developer Experience
```
Before:
  1. Push frontend code
  2. Wait for frontend deploy
  3. Push backend code
  4. Wait for backend deploy
  5. Update CORS config
  6. Test integration

After:
  1. Push code
  2. Wait for deploy
  3. Test (frontend + backend together)
```

---

**Created:** 2026-01-18
**Status:** Single-Service Architecture ✅
**Migration Date:** 2026-01-15
**Architecture:** Python FastAPI + Static Files
