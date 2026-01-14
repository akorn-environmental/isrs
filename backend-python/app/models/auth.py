"""
Authentication models for passwordless magic link authentication.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base


class UserSession(Base):
    """
    User session model for magic link authentication.
    Stores both magic link tokens (one-time use) and session tokens (long-lived).
    """

    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    attendee_id = Column(UUID(as_uuid=True), ForeignKey("attendee_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)

    # Magic Link Token (one-time use, sent via email)
    magic_link_token = Column(String(255), unique=True, nullable=False, index=True)
    token_expires_at = Column(DateTime, nullable=False)
    token_used = Column(Boolean, default=False)
    token_used_at = Column(DateTime)

    # Session Token (long-lived, stored in browser)
    session_token = Column(String(255), unique=True, index=True)
    session_expires_at = Column(DateTime)
    last_activity = Column(DateTime)

    # Security
    ip_address = Column(String(50))
    user_agent = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    attendee = relationship("AttendeeProfile", back_populates="user_sessions")

    def __repr__(self):
        return f"<UserSession(id={self.id}, email='{self.email}', token_used={self.token_used})>"

    def is_magic_link_valid(self) -> bool:
        """Check if the magic link token is still valid."""
        return not self.token_used and self.token_expires_at > datetime.utcnow()

    def is_session_valid(self) -> bool:
        """Check if the session token is still valid."""
        return self.session_token and self.session_expires_at and self.session_expires_at > datetime.utcnow()
