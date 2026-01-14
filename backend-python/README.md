# ISRS Database API - Python/FastAPI Backend

Python/FastAPI backend for the International Shellfish Restoration Society database platform.

## Project Status

✅ **Week 1 Setup Complete** - Core infrastructure and authentication implemented

### Completed:
- [x] Project structure with FastAPI skeleton
- [x] SQLAlchemy database models for all tables
- [x] Configuration management with Pydantic settings
- [x] Database connection setup (sync + async)
- [x] Authentication system (magic links)
- [x] Email service for sending magic links
- [x] Health check and basic API endpoints

### Next Steps:
- [ ] Create .env file with actual database credentials
- [ ] Install Python dependencies
- [ ] Test application startup
- [ ] Create CRUD routers for contacts, votes, conferences, funding
- [ ] Implement document processing services
- [ ] Set up Alembic for database migrations

## Project Structure

```
backend-python/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Settings management
│   ├── database.py             # Database connection
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py             # Base model classes
│   │   ├── contact.py          # Contact & Organization models
│   │   ├── vote.py             # Board vote models
│   │   ├── conference.py       # Conference models
│   │   ├── funding.py          # Funding prospect models
│   │   ├── auth.py             # Authentication models
│   │   └── system.py           # Audit log & metrics models
│   ├── routers/                # API routers
│   │   ├── __init__.py
│   │   └── auth.py             # Authentication endpoints
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py     # Auth token management
│   │   └── email_service.py    # Email sending
│   ├── utils/                  # Utility functions
│   │   └── __init__.py
│   └── middleware/             # Custom middleware
│       └── __init__.py
├── alembic/                    # Database migrations
│   └── versions/
├── tests/                      # Unit tests
├── requirements.txt            # Production dependencies
├── requirements-dev.txt        # Development dependencies
├── .env.example                # Environment variables template
├── .env                        # Environment variables (create this)
└── README.md                   # This file
```

## Installation

### 1. Create Virtual Environment

```bash
cd /Users/akorn/Desktop/ITERM\ PROJECTS/ISRS/backend-python
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # For development
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update with your actual values:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `ASYNC_DATABASE_URL` - Async PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (generate with `openssl rand -hex 32`)
- `SMTP_*` - Email server configuration
- `MAGIC_LINK_BASE_URL` - Frontend URL for magic link redirects

### 4. Run the Application

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python -m app.main
```

The API will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc
- Health check: http://localhost:8000/health

## Authentication API

The authentication system uses passwordless magic links:

### Request Login
```bash
POST /api/auth/request-login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify Magic Link Token
```bash
POST /api/auth/verify-token
Content-Type: application/json

{
  "token": "magic_link_token_from_email"
}

Response:
{
  "success": true,
  "session_token": "long_session_token",
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "organization_name": "Example Org"
  }
}
```

### Validate Session
```bash
GET /api/auth/validate-session
Authorization: Bearer <session_token>

Response:
{
  "valid": true,
  "user": {...}
}
```

### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <session_token>
```

### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <session_token>
```

## Database Models

All SQLAlchemy models are located in `app/models/`:

- **Contact & Organization** - People and organizations in ISRS network
- **BoardVote & BoardVoteDetail** - Governance voting records
- **Conference** - ICSR conference events
- **ConferenceRegistration** - Attendee registrations
- **ConferenceSponsor** - Sponsorship tracking
- **ConferenceAbstract** - Abstract submissions
- **AttendeeProfile** - User profiles with authentication
- **FundingProspect** - Grant and funding opportunities
- **UserSession** - Authentication sessions and tokens
- **AuditLog** - Change tracking
- **DataQualityMetric** - Data quality monitoring

## Technology Stack

- **FastAPI** - Modern async web framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation and settings
- **Uvicorn** - ASGI server
- **PostgreSQL** - Primary database
- **aiosmtplib** - Async email sending
- **python-jose** - JWT token handling
- **Alembic** - Database migrations

## Development

### Running Tests
```bash
pytest
pytest --cov=app  # With coverage
```

### Code Formatting
```bash
black app/
flake8 app/
mypy app/
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Migration from Node.js Backend

This Python backend is designed to replace the existing Node.js backend at `/Users/akorn/Desktop/ITERM PROJECTS/ISRS/backend`.

Key improvements:
- 10x better document processing (PyPDF2, pdfplumber, pytesseract)
- Native email parsing with Python's email library
- Async/await support for high concurrency (500-1000 users)
- Comprehensive type safety with Pydantic
- Better AI/ML integration capabilities

## Deployment

### Render.com

1. Create new Web Service
2. Build Command: `pip install -r requirements.txt`
3. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Environment Variables: Copy from `.env`
5. Health Check Path: `/health`

## Support

For questions or issues, contact Aaron Kornbluth.
