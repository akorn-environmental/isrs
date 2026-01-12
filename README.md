# ISRS - International Shellfish Restoration Society

**Unified Monorepo** for the ISRS digital platform.

🦪 **Website**: https://www.shellfish-society.org
📊 **Admin Portal**: https://isrs-frontend.onrender.com
🔗 **API**: https://isrs-database-backend.onrender.com

---

## 📁 Repository Structure

This monorepo contains both the frontend and backend for the ISRS platform:

```
isrs-monorepo/
├── backend/          # Node.js/Express API server
├── frontend/         # Static HTML/CSS/JS frontend
├── docs/             # Documentation
├── .github/          # GitHub Actions workflows
└── README.md         # This file
```

---

## 🚀 Quick Start

### Backend (API Server)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

**Backend runs on**: `http://localhost:3002`

### Frontend (Static Site)

```bash
cd frontend
npx serve public -l 8080
```

**Frontend runs on**: `http://localhost:8080`

---

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL (Render hosted)
- **AI**: Anthropic Claude API (Sonnet 4.5)
- **Email**: AWS SES, SendGrid
- **Payments**: Stripe
- **Auth**: Magic link passwordless authentication
- **File Processing**: multer, ExcelJS, pdf-parse, sharp, mammoth

### Frontend
- **Framework**: Vanilla JavaScript (no framework)
- **CSS**: Custom design system with CSS variables
- **Admin**: Role-based access control (RBAC)
- **Public**: Marketing site + conference info

---

## 📖 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Apollo PII Enhancement](./docs/APOLLO_PII_ENHANCEMENT_COMPLETE.md)** - Contact enrichment with Apollo.io API
- **[Deployment Guide](./docs/DEPLOYMENT_READY.md)** - Production deployment instructions
- **[Backend API](./backend/API.md)** - API endpoints and usage
- **[Frontend README](./frontend/README.md)** - Frontend structure and pages

---

## 🔒 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/isrs_database

# Claude AI
CLAUDE_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4.5-20250929

# Contact Enrichment
APOLLO_API_KEY=your_apollo_key

# Email
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Security
CORS_ORIGIN=https://isrs-frontend.onrender.com
```

See `backend/.env.example` for full list.

---

## 🛠️ Development

### Backend Development

```bash
cd backend
npm install
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start
npm test         # Run tests (if any)
```

**API Base URL**: `http://localhost:3002`

### Frontend Development

```bash
cd frontend
npx serve public -l 8080
```

**Dev Server**: `http://localhost:8080`

### Database Migrations

```bash
cd backend
node database/run-contact-enrichment-migration.js
# Run other migrations as needed
```

---

## 🚢 Deployment

### Render Configuration

**Backend Service**:
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Environment**: Use "Shared API Keys" env group + backend-specific vars

**Frontend Service**:
- **Publish Directory**: `frontend/public`
- **Environment**: Frontend-specific vars (API URLs)

### GitHub Actions

Automatic deployments triggered on push to `main`:
- `.github/workflows/deploy-backend.yml` - Backend CI/CD
- `.github/workflows/deploy-frontend.yml` - Frontend CI/CD

---

## 📂 Key Features

### Backend API
- ✅ **Authentication**: Magic link passwordless login with RBAC
- ✅ **Conference Management**: ICSR registration, abstracts, reviews
- ✅ **Contact Management**: 4,000+ contacts with Apollo.io enrichment
- ✅ **Email Campaigns**: Bulk email with templates and analytics
- ✅ **Funding Pipeline**: Grant tracking and prospect management
- ✅ **AI Assistance**: Claude-powered data enhancement and grant writing
- ✅ **Payment Processing**: Stripe integration for registrations
- ✅ **File Import**: CSV, Excel, PDF parsing with AI mapping
- ✅ **Photo Gallery**: Image uploads with thumbnails
- ✅ **Board Documents**: Secure document repository
- ✅ **Voting System**: Board vote tracking and results

### Frontend
- ✅ **Public Website**: Marketing pages, about, ICSR info
- ✅ **Admin Portal**: Role-based dashboard with 24+ admin pages
- ✅ **Member Portal**: Profile management, directory
- ✅ **Conference**: Registration, abstract submission
- ✅ **Photo Gallery**: ICSR 2024 photos with filtering
- ✅ **Error Reporting**: Frontend errors logged to backend/Render

---

## 👥 Team & Roles

### RBAC System
- **Admin** (Level 100): Full system access
- **Board** (Level 75): Board documents, votes, edit access
- **Advisory** (Level 50): Edit access only
- **Viewer** (Level 25): Read-only access
- **Member** (Level 10): Member portal only

### Current Admins
- Lisa Paton (President)
- Erin Flaherty (Executive Director)
- Aaron Kornbluth (Developer)

---

## 🔐 Security

- **Authentication**: HTTP-only cookies with 24-hour expiry
- **Authorization**: Bearer token support for API clients
- **CORS**: Whitelist of allowed origins
- **Rate Limiting**: 300 req/min general, 5 auth attempts per 15 min
- **Headers**: Helmet.js security headers
- **reCAPTCHA**: Enterprise bot protection
- **SQL Injection**: Parameterized queries throughout
- **Audit Logging**: Admin actions tracked

---

## 📊 Database Schema

PostgreSQL with 40+ tables including:
- `attendee_profiles` - User accounts
- `contacts` - Contact directory
- `organizations` - Organization data
- `conference_registrations` - ICSR registrations
- `user_sessions` - Magic link sessions
- `contact_enrichment` - Apollo.io enriched data
- `funding_prospects` - Grant pipeline
- `board_votes` - Voting system
- `email_campaigns` - Email marketing
- See `backend/database/migrations/` for full schema

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend E2E tests (if configured)
cd frontend
npm test
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check `.env` file exists and has `DATABASE_URL`
- Verify PostgreSQL is accessible
- Check port 3002 is not in use: `lsof -ti:3002`

### Frontend shows 401 errors
- Verify backend is running
- Check CORS configuration in backend
- Confirm session token in localStorage
- Check Render logs for authentication errors

### Database migration failed
- Check PostgreSQL connection
- Verify migration hasn't already run
- Check migration SQL syntax
- See Render logs for detailed errors

### Apollo enrichment not working
- Verify `APOLLO_API_KEY` in Render environment
- Check API credits remaining (10k/month free tier)
- Test with curl: `curl -X POST https://api.apollo.io/v1/people/match`

---

## 📞 Support

- **Issues**: https://github.com/akornenvironmental/isrs-monorepo/issues
- **Email**: admin@shellfish-society.org
- **Render Dashboard**: https://dashboard.render.com
- **Anthropic Console**: https://console.anthropic.com

---

## 📝 License

Copyright © 2026 International Shellfish Restoration Society

---

## 🎯 Roadmap

### Q1 2026
- [x] Apollo PII Enhancement integration
- [x] Error logging to Render
- [x] Dashboard stats fix
- [ ] QuickBooks Online (QBO) API integration
- [ ] FFC Apollo integration
- [ ] OPPSCOUT Apollo integration

### Q2 2026
- [ ] Mobile responsive admin portal
- [ ] Conference app for attendees
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard

---

**Built with** ❤️ **by the ISRS team**

Last updated: January 12, 2026
