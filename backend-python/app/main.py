"""
FastAPI main application for ISRS Database.
Version: 2.0.1 - Photos API routing fix
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import logging
from pathlib import Path
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import init_db
from app.rate_limiter import limiter

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="International Shellfish Restoration Society Platform - Python/FastAPI Backend",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# Configure rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware - Restricted to specific methods and headers for security
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    expose_headers=["X-Total-Count", "X-Page", "X-Page-Size"],
    max_age=600,  # Cache preflight requests for 10 minutes
)


# Health check endpoint
@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint for monitoring."""
    return JSONResponse(
        content={
            "status": "healthy",
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }
    )


# NOTE: Root endpoint removed - static files are served at root instead
# The frontend index.html will be served at "/"

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database and services on startup."""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"CORS Origins: {settings.CORS_ORIGINS}")

    # Import all models to ensure they're registered with Base before init_db
    # This is necessary for Base.metadata.create_all() to create all tables
    from app.models import (
        Base, Contact, Organization, BoardVote, BoardVoteDetail,
        Conference, ConferenceRegistration, ConferenceSponsor, ConferenceAbstract,
        AttendeeProfile, FundingProspect, UserSession, AuditLog, DataQualityMetric,
        UserFeedback, Asset, AssetZone, AssetZoneAsset, Photo, ParsedEmail
    )

    # Initialize database (create tables if they don't exist)
    # This ensures all model tables exist, including user_feedback
    logger.info("Ensuring database tables exist...")
    try:
        init_db()
        logger.info("Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    logger.info(f"Shutting down {settings.APP_NAME}")


# Import and include routers
from app.routers import auth, contacts, votes, conferences, events, funding, documents, enrichment, assets, asset_zones, admin, feedback, photos, ai, stats, email_parsing, parsed_emails, test_emails, stripe_payment, apollo_enrichment

app.include_router(email_parsing.router, prefix="/api/email-parsing", tags=["Email Parsing"])  # Public webhook - must be before auth
app.include_router(stripe_payment.router, prefix="/api/stripe", tags=["Stripe Payments"])  # Public payment endpoints
app.include_router(test_emails.router, prefix="/api/test", tags=["Testing"])  # Public test endpoint
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(stats.router, tags=["Stats"])  # Stats router with /api/stats prefix built-in
app.include_router(feedback.router, prefix="/api/feedback", tags=["Feedback"])
app.include_router(ai.router, tags=["AI Assistant"])  # AI router with /api/ai prefix built-in
app.include_router(parsed_emails.router, prefix="/api", tags=["Parsed Emails"])  # Exposes /api/parsed-emails routes
app.include_router(apollo_enrichment.router, prefix="/api/apollo", tags=["Apollo.io"])  # Apollo enrichment and prospecting
app.include_router(contacts.router, prefix="/api/contacts", tags=["Contacts"])
app.include_router(votes.router, prefix="/api/votes", tags=["Board Votes"])
app.include_router(photos.router, prefix="/api/photos", tags=["Photos"])  # Must be before /api catch-all
app.include_router(conferences.router, prefix="/api/conferences", tags=["Conferences"])
app.include_router(conferences.router, prefix="/api/conference", tags=["Conference"])  # Alias for frontend compatibility
app.include_router(conferences.router, prefix="/api", tags=["Abstracts"])  # Exposes /api/abstracts/* routes for My Reviews page
app.include_router(events.router, prefix="/api/events", tags=["Conference Events"])
app.include_router(funding.router, prefix="/api/funding", tags=["Funding"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(enrichment.router, prefix="/api/enrichment", tags=["Enrichment"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])
app.include_router(asset_zones.router, prefix="/api/zones", tags=["Asset Zones"])


# Serve static files (frontend) - Must be AFTER API routes
frontend_path = Path(__file__).parent.parent.parent / "frontend" / "public"
logger.info(f"Checking frontend path: {frontend_path}")
logger.info(f"Frontend path exists: {frontend_path.exists()}")

if frontend_path.exists():
    # Mount static files at /static
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")
    logger.info(f"Mounted static files from: {frontend_path}")

    # Serve index.html for root and any non-API routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes."""
        # Don't intercept API routes
        if full_path.startswith("api/"):
            return JSONResponse({"error": "Not found"}, status_code=404)

        # Serve specific file if it exists
        file_path = frontend_path / full_path
        if file_path.is_file():
            # Set cache headers - no cache for HTML files to ensure updates are seen
            if file_path.suffix == '.html':
                return FileResponse(
                    file_path,
                    headers={
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        "Pragma": "no-cache",
                        "Expires": "0"
                    }
                )
            return FileResponse(file_path)

        # Otherwise serve index.html (SPA routing)
        index_path = frontend_path / "index.html"
        if index_path.exists():
            return FileResponse(
                index_path,
                headers={
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0"
                }
            )

        return JSONResponse({"error": "Frontend not found"}, status_code=404)
else:
    logger.warning(f"Frontend directory not found at: {frontend_path}")
    logger.warning("API-only mode - no frontend files will be served")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
# Trigger deployment


