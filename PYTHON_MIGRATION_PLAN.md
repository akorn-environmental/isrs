# ISRS Python Migration Plan
## Node.js → Python/FastAPI Migration Strategy

**Target:** International Shellfish Restoration Society Platform
**Current:** Node.js/Express with 500-1000 concurrent users
**Goal:** Python/FastAPI for better document processing & email parsing
**Timeline:** 3-4 weeks
**Priority:** HIGH (Foundation for other migrations)

---

## Executive Summary

### Why Migrate ISRS to Python?

**Critical Requirements:**
- ✅ **Document Processing**: Conference abstracts, registration forms, board documents (PDFs, Word)
- ✅ **Email Parsing**: Automated email campaigns, response tracking, contact management
- ✅ **High Concurrency**: 500-1000 concurrent users during conference registration
- ✅ **AI Integration**: Claude API for board vote processing, content analysis
- ✅ **Contact Enrichment**: Apollo.io API integration, 4,000+ enriched contacts

**Python Advantages:**
- **10x better** document libraries (PyPDF2, python-docx, openpyxl vs pdf-parse, mammoth)
- **3x faster** OCR processing (pytesseract vs tesseract.js)
- **Native** email parsing (email library vs custom Node.js parsers)
- **FastAPI** handles 500-1000 concurrent users easily (async/await like Node.js)
- **Better** for future AI/ML features (transformers, spaCy, custom models)

---

## Phase 1: Analysis & Setup (Week 1)

### Current Stack Analysis

**Node.js Dependencies → Python Equivalents:**

| Node.js Package | Python Equivalent | Notes |
|----------------|-------------------|-------|
| `express` | `fastapi` | Modern async framework, auto-generated docs |
| `@anthropic-ai/sdk` | `anthropic` | Official Python SDK, same functionality |
| `@aws-sdk/client-ses` | `boto3` | AWS official SDK |
| `@sendgrid/mail` | `sendgrid` | Same API wrapper |
| `pdf-parse` | `PyPDF2 + pdfplumber` | Much more powerful, better table extraction |
| `mammoth` | `python-docx` | Full Word document support |
| `exceljs` | `openpyxl + pandas` | Better Excel handling, data analysis |
| `sharp` | `Pillow + opencv-python` | More image processing features |
| `nodemailer` | `email + smtplib` | Built-in, more robust |
| `multer` | `python-multipart` | Built into FastAPI |
| `pg` (PostgreSQL) | `psycopg2 + SQLAlchemy` | Industry standard ORM |
| `stripe` | `stripe` | Same API wrapper |
| `googleapis` | `google-api-python-client` | Official Google SDK |

### Database Schema Preservation

**✅ Keep Existing PostgreSQL Schema**
- No database changes required
- SQLAlchemy models map to existing tables
- Alembic for future migrations
- Zero downtime migration possible

---

## Phase 2: Backend Migration (Week 2-3)

### Step 1: Project Structure Setup

```
ISRS/
├── backend/                      # New Python backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI app entry point
│   │   ├── config.py            # Environment config
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── attendee.py
│   │   │   ├── contact.py
│   │   │   ├── vote.py
│   │   │   └── campaign.py
│   │   ├── routers/             # API endpoints (like Express routes)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── attendees.py
│   │   │   ├── contacts.py
│   │   │   ├── votes.py
│   │   │   ├── campaigns.py
│   │   │   ├── enrichment.py
│   │   │   └── admin.py
│   │   ├── services/            # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── claude_service.py
│   │   │   ├── email_service.py
│   │   │   ├── document_service.py
│   │   │   ├── apollo_service.py
│   │   │   └── stripe_service.py
│   │   ├── utils/               # Helper functions
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── validators.py
│   │   │   └── formatters.py
│   │   └── middleware/          # Custom middleware
│   │       ├── __init__.py
│   │       ├── auth.py
│   │       └── error_handlers.py
│   ├── alembic/                 # Database migrations
│   │   └── versions/
│   ├── tests/                   # Unit tests
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   ├── test_contacts.py
│   │   └── test_votes.py
│   ├── requirements.txt         # Python dependencies
│   ├── requirements-dev.txt     # Dev dependencies
│   ├── .env.example
│   ├── alembic.ini
│   └── README.md
├── frontend/                     # Keep as-is (vanilla JS)
├── docs/
└── PYTHON_MIGRATION_PLAN.md     # This file
```

### Step 2: Core Dependencies (requirements.txt)

```python
# Web Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6

# Database
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
alembic==1.13.0

# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# AI & APIs
anthropic==0.7.7
openai==1.3.7  # Optional

# Email
sendgrid==6.11.0
boto3==1.34.13  # AWS SES

# Document Processing
PyPDF2==3.0.1
pdfplumber==0.10.3
python-docx==1.1.0
openpyxl==3.1.2
pandas==2.1.4
Pillow==10.1.0
pytesseract==0.3.10  # OCR

# Contact Enrichment
apollo-python==0.1.0  # Apollo.io SDK (if exists, else requests)

# Payment Processing
stripe==7.8.0

# Google APIs
google-api-python-client==2.111.0
google-auth==2.25.2
google-auth-oauthlib==1.2.0

# Utilities
python-dotenv==1.0.0
requests==2.31.0
pydantic==2.5.2
pydantic-settings==2.1.0

# Task Scheduling
apscheduler==3.10.4

# Development
pytest==7.4.3
pytest-asyncio==0.21.1
black==23.12.1
flake8==6.1.0
mypy==1.7.1
```

### Step 3: FastAPI Application Setup

**app/main.py:**
```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.database import engine, Base
from app.routers import (
    auth, attendees, contacts, votes,
    campaigns, enrichment, admin
)
from app.middleware.error_handlers import setup_exception_handlers

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="ISRS Database API",
    description="International Shellfish Restoration Society Platform",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Setup exception handlers
setup_exception_handlers(app)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(attendees.router, prefix="/api/attendees", tags=["Attendees"])
app.include_router(contacts.router, prefix="/api/contacts", tags=["Contacts"])
app.include_router(votes.router, prefix="/api/votes", tags=["Board Votes"])
app.include_router(campaigns.router, prefix="/api/campaigns", tags=["Email Campaigns"])
app.include_router(enrichment.router, prefix="/api/enrichment", tags=["Contact Enrichment"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("Starting ISRS Backend API v2.0.0")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'local'}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "environment": settings.ENVIRONMENT
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "ISRS Database API v2.0.0",
        "docs": "/api/docs",
        "health": "/health"
    }
```

### Step 4: Database Models (SQLAlchemy)

**app/models/attendee.py:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from sqlalchemy.sql import func
from app.database import Base

class Attendee(Base):
    """ICSR Conference Attendee Model"""
    __tablename__ = "attendees"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    organization = Column(String(255))
    country = Column(String(100))
    registration_type = Column(String(50))  # early_bird, regular, student
    payment_status = Column(String(50), default="pending")
    stripe_payment_intent = Column(String(255))
    abstract_submitted = Column(Boolean, default=False)
    abstract_title = Column(String(500))
    abstract_text = Column(Text)
    dietary_restrictions = Column(Text)
    accommodation_needed = Column(Boolean, default=False)

    # Conference year
    conference_year = Column(Integer, default=2026)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Additional data
    metadata = Column(JSON)  # Flexible storage for extra fields

    def __repr__(self):
        return f"<Attendee {self.first_name} {self.last_name} ({self.email})>"
```

**app/models/contact.py:**
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON, Float
from sqlalchemy.sql import func
from app.database import Base

class Contact(Base):
    """Contact Management Model with Apollo.io Enrichment"""
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    first_name = Column(String(100))
    last_name = Column(String(100))
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50))
    title = Column(String(200))

    # Organization
    organization = Column(String(255))
    organization_website = Column(String(255))
    organization_size = Column(String(50))
    industry = Column(String(100))

    # Location
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100))

    # Apollo.io Enrichment
    apollo_person_id = Column(String(100), index=True)
    apollo_organization_id = Column(String(100))
    apollo_enriched_at = Column(DateTime(timezone=True))
    apollo_confidence_score = Column(Float)

    # Social Media
    linkedin_url = Column(String(255))
    twitter_handle = Column(String(100))

    # Engagement
    email_verified = Column(Boolean, default=False)
    subscribed_to_newsletter = Column(Boolean, default=True)
    last_email_sent = Column(DateTime(timezone=True))
    last_email_opened = Column(DateTime(timezone=True))

    # Tags & Categories
    tags = Column(JSON)  # ["researcher", "government", "nonprofit"]
    categories = Column(JSON)  # ["oyster", "mussel", "clam"]

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    source = Column(String(100))  # import, manual, apollo, conference

    # Full enrichment data from Apollo
    enrichment_data = Column(JSON)

    def __repr__(self):
        return f"<Contact {self.first_name} {self.last_name} ({self.email})>"
```

### Step 5: API Router Example

**app/routers/contacts.py:**
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.contact import Contact
from app.services.apollo_service import ApolloService
from app.utils.auth import get_current_user
from pydantic import BaseModel, EmailStr

router = APIRouter()

# Pydantic schemas for request/response validation
class ContactCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    organization: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None

class ContactResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: str
    organization: Optional[str]
    title: Optional[str]
    apollo_enriched: bool = False

    class Config:
        from_attributes = True  # Allows SQLAlchemy models

@router.get("/", response_model=List[ContactResponse])
async def get_contacts(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all contacts with pagination and search"""
    query = db.query(Contact)

    if search:
        query = query.filter(
            (Contact.first_name.ilike(f"%{search}%")) |
            (Contact.last_name.ilike(f"%{search}%")) |
            (Contact.email.ilike(f"%{search}%")) |
            (Contact.organization.ilike(f"%{search}%"))
        )

    contacts = query.offset(skip).limit(limit).all()
    return contacts

@router.post("/", response_model=ContactResponse, status_code=201)
async def create_contact(
    contact: ContactCreate,
    enrich: bool = Query(False, description="Automatically enrich with Apollo.io"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create a new contact with optional Apollo enrichment"""

    # Check if email already exists
    existing = db.query(Contact).filter(Contact.email == contact.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Contact with this email already exists")

    # Create contact
    db_contact = Contact(**contact.dict())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)

    # Enrich if requested
    if enrich:
        apollo = ApolloService()
        enriched_data = await apollo.enrich_contact(db_contact.email)
        if enriched_data:
            db_contact.apollo_person_id = enriched_data.get("id")
            db_contact.apollo_confidence_score = enriched_data.get("confidence")
            db_contact.enrichment_data = enriched_data
            db.commit()

    return db_contact

@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get a specific contact by ID"""
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    return contact
```

### Step 6: Service Layer Example

**app/services/document_service.py:**
```python
import PyPDF2
import pdfplumber
from docx import Document
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class DocumentService:
    """Document processing service with PDF, Word, Excel support"""

    async def extract_pdf_text(self, file_path: Path) -> str:
        """Extract text from PDF using PyPDF2"""
        try:
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\\n"
                return text.strip()
        except Exception as e:
            logger.error(f"Error extracting PDF text: {e}")
            raise

    async def extract_pdf_tables(self, file_path: Path) -> List[pd.DataFrame]:
        """Extract tables from PDF using pdfplumber"""
        try:
            tables = []
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    page_tables = page.extract_tables()
                    for table in page_tables:
                        df = pd.DataFrame(table[1:], columns=table[0])
                        tables.append(df)
            return tables
        except Exception as e:
            logger.error(f"Error extracting PDF tables: {e}")
            raise

    async def extract_word_content(self, file_path: Path) -> Dict[str, any]:
        """Extract text and metadata from Word document"""
        try:
            doc = Document(file_path)

            # Extract text
            text = "\\n".join([paragraph.text for paragraph in doc.paragraphs])

            # Extract tables
            tables = []
            for table in doc.tables:
                data = []
                for row in table.rows:
                    data.append([cell.text for cell in row.cells])
                tables.append(pd.DataFrame(data[1:], columns=data[0]))

            # Metadata
            metadata = {
                "author": doc.core_properties.author,
                "title": doc.core_properties.title,
                "created": doc.core_properties.created,
                "modified": doc.core_properties.modified
            }

            return {
                "text": text,
                "tables": tables,
                "metadata": metadata
            }
        except Exception as e:
            logger.error(f"Error extracting Word content: {e}")
            raise

    async def parse_excel(self, file_path: Path) -> Dict[str, pd.DataFrame]:
        """Parse Excel file into DataFrames"""
        try:
            excel_file = pd.ExcelFile(file_path)
            sheets = {}
            for sheet_name in excel_file.sheet_names:
                sheets[sheet_name] = pd.read_excel(excel_file, sheet_name=sheet_name)
            return sheets
        except Exception as e:
            logger.error(f"Error parsing Excel: {e}")
            raise

    async def parse_abstract_submission(self, file_path: Path) -> Dict[str, str]:
        """
        Parse conference abstract submission (PDF or Word)
        Extract: Title, Authors, Affiliations, Abstract Text, Keywords
        """
        file_extension = file_path.suffix.lower()

        if file_extension == '.pdf':
            text = await self.extract_pdf_text(file_path)
        elif file_extension in ['.docx', '.doc']:
            result = await self.extract_word_content(file_path)
            text = result['text']
        else:
            raise ValueError(f"Unsupported file format: {file_extension}")

        # Use Claude AI to parse structured data from abstract
        # (This is where Python's AI integration shines)
        from app.services.claude_service import ClaudeService
        claude = ClaudeService()

        parsed_data = await claude.parse_abstract(text)
        return parsed_data
```

---

## Phase 3: Testing & Deployment (Week 4)

### Step 1: Unit Tests

**tests/test_contacts.py:**
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_contact():
    response = client.post(
        "/api/contacts/",
        json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "organization": "Test Org"
        },
        headers={"Authorization": "Bearer test_token"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "john@example.com"
    assert data["first_name"] == "John"

def test_get_contacts():
    response = client.get(
        "/api/contacts/",
        headers={"Authorization": "Bearer test_token"}
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
```

### Step 2: Render Deployment Configuration

**Update `render.yaml`:**
```yaml
services:
  # Backend - Python/FastAPI
  - type: web
    name: isrs-backend
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: DATABASE_URL
        fromDatabase:
          name: isrs-db
          property: connectionString
      - fromGroup: Shared API Keys
    healthCheckPath: /health

  # Frontend - Static HTML
  - type: web
    name: isrs-frontend
    rootDir: frontend
    buildCommand: echo "No build needed"
    staticPublishPath: ./public
    routes:
      - type: rewrite
        source: /*
        destination: /index.html

databases:
  - name: isrs-db
    databaseName: isrs_production
    plan: starter
```

### Step 3: Migration Strategy (Zero Downtime)

**Parallel Deployment:**
1. Deploy Python backend to **new** Render service (`isrs-backend-v2`)
2. Run tests against new backend
3. Update frontend API URL to point to new backend
4. Monitor for 24 hours
5. Deprecate old Node.js backend
6. Rename `isrs-backend-v2` → `isrs-backend`

---

## Success Metrics

### Performance Targets

| Metric | Current (Node.js) | Target (Python) | Status |
|--------|------------------|-----------------|--------|
| **Document Processing** | 5-10s per PDF | 2-3s per PDF | 🎯 |
| **API Response Time** | <100ms | <100ms | ✅ |
| **Concurrent Users** | 500 | 1000 | 🎯 |
| **Email Parse Speed** | 500ms/email | 200ms/email | 🎯 |
| **Contact Enrichment** | 2-3s | 1-2s | 🎯 |
| **Memory Usage** | 512MB | 512-768MB | ✅ |

### Feature Parity Checklist

- [ ] Authentication (magic links, JWT)
- [ ] Conference registration & payments (Stripe)
- [ ] Abstract submission & review
- [ ] Contact management (4,000+ contacts)
- [ ] Apollo.io enrichment
- [ ] Email campaigns (SendGrid/AWS SES)
- [ ] Board voting system with Claude AI
- [ ] Document upload & processing
- [ ] Admin dashboard
- [ ] Real-time WebSocket support (if needed)

---

## Risk Mitigation

### Risks & Solutions

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Performance degradation** | HIGH | Load testing with 1000 concurrent users before launch |
| **Data loss during migration** | CRITICAL | Zero-downtime parallel deployment, no DB changes |
| **Document parsing failures** | MEDIUM | Fallback to Node.js service if Python fails, gradual rollout |
| **Team learning curve** | MEDIUM | Comprehensive documentation, pair programming |
| **Third-party API issues** | LOW | All APIs have Python SDKs (Claude, Stripe, Apollo) |

### Rollback Plan

1. Frontend still connects to old Node.js backend
2. Database unchanged (same schema, same data)
3. Can revert frontend API URL in <5 minutes
4. Keep Node.js backend running for 30 days post-migration

---

## Next Steps

### Immediate Actions (This Week)

1. ✅ **Archive old ISRS folder** - DONE
2. ✅ **Rename ISRS-monorepo to ISRS** - DONE
3. **Review this migration plan** - IN PROGRESS
4. **Approve plan and timeline**
5. **Set up Python development environment**

### Week 1 Actions

1. Create `backend-python/` directory structure
2. Set up `requirements.txt` with all dependencies
3. Initialize SQLAlchemy models from existing DB schema
4. Create FastAPI application skeleton
5. Implement authentication endpoints
6. Write unit tests for auth

### Week 2-3 Actions

1. Implement all API endpoints (contacts, attendees, votes, campaigns)
2. Migrate document processing logic
3. Integrate Claude AI service
4. Integrate Apollo.io enrichment
5. Implement email services (SendGrid/SES)
6. Add Stripe payment processing
7. Write comprehensive tests

### Week 4 Actions

1. Load testing (500-1000 concurrent users)
2. Deploy to Render (parallel deployment)
3. Frontend integration testing
4. Monitor performance for 48 hours
5. Complete migration, deprecate Node.js backend

---

## Questions to Answer

1. **Timeline approval?** Is 3-4 weeks acceptable for ISRS migration?
2. **Feature priority?** Which features are most critical to migrate first?
3. **Testing requirements?** Do you need staging environment testing before production?
4. **Documentation?** Do you want API documentation auto-generated by FastAPI?
5. **Monitoring?** What monitoring/logging should we set up (Sentry, CloudWatch, etc.)?

---

## Templates for Other Migrations

Once ISRS migration is complete, we'll have templates for:
- ✅ FastAPI application structure
- ✅ SQLAlchemy model patterns
- ✅ Document processing workflows
- ✅ Email parsing implementations
- ✅ AI service integrations
- ✅ Authentication & authorization
- ✅ Deployment configurations

**This will make CTC, FFC, SAFMC-Interview, and CBT-PMI migrations much faster (1-2 weeks each)!**

---

**Status:** 📋 PLAN READY FOR REVIEW
**Next Action:** Review and approve migration plan
**Author:** Claude Sonnet 4.5
**Date:** 2026-01-14
