"""
Base model classes and mixins for SQLAlchemy models.
"""
from datetime import datetime
from sqlalchemy import Column, DateTime
from sqlalchemy.ext.declarative import declarative_base

# Create base class for all models
Base = declarative_base()


class TimestampMixin:
    """
    Mixin that adds created_at and updated_at timestamp columns.
    The updated_at column is automatically updated by PostgreSQL trigger.
    """

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
