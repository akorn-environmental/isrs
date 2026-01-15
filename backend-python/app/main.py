"""
FastAPI main application for ISRS Database.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
import logging
from pathlib import Path

from app.config import settings
from app.database import init_db

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

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

    # Initialize database (create tables if they don't exist)
    # NOTE: In production, use Alembic migrations instead
    if settings.DEBUG:
        logger.info("Debug mode - ensuring database tables exist")
        # init_db()  # Uncomment when ready to create tables


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown."""
    logger.info(f"Shutting down {settings.APP_NAME}")


# Import and include routers
from app.routers import auth, contacts, votes, conferences, funding, documents, enrichment, assets

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(contacts.router, prefix="/api/contacts", tags=["Contacts"])
app.include_router(votes.router, prefix="/api/votes", tags=["Board Votes"])
app.include_router(conferences.router, prefix="/api/conferences", tags=["Conferences"])
app.include_router(funding.router, prefix="/api/funding", tags=["Funding"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(enrichment.router, prefix="/api/enrichment", tags=["Enrichment"])
app.include_router(assets.router, prefix="/api/assets", tags=["Assets"])


# Serve static files (frontend) - Must be AFTER API routes
# This serves the frontend from the parent directory's frontend/public folder
frontend_path = Path(__file__).parent.parent.parent / "frontend" / "public"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="static")
    logger.info(f"Serving frontend from: {frontend_path}")
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
