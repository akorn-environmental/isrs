"""
Database configuration and session management.
Sets up both sync and async SQLAlchemy engines.
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator, AsyncGenerator

from app.config import settings
from app.models.base import Base

# Synchronous engine for migrations and simple operations
sync_engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)

# Async engine for FastAPI endpoints
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG,
)

# Session factories
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=sync_engine,
    class_=Session,
)

AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Base class for models is imported from app.models.base


# Dependency for FastAPI endpoints (sync)
def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.
    Automatically commits on success, rolls back on error.
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


# Dependency for FastAPI endpoints (async)
async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Async dependency that provides a database session.
    Automatically commits on success, rolls back on error.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# Database initialization
def init_db():
    """Create all database tables."""
    Base.metadata.create_all(bind=sync_engine)


def drop_db():
    """Drop all database tables (use with caution)."""
    Base.metadata.drop_all(bind=sync_engine)
