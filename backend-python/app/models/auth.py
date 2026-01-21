"""
Authentication models for passwordless magic link authentication.
"""
import uuid
import secrets
from datetime import datetime, timedelta
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

    def is_session_valid(self, inactivity_timeout_minutes: int = 60) -> bool:
        """
        Check if the session token is still valid.

        Args:
            inactivity_timeout_minutes: Maximum minutes of inactivity before session expires.
                                       Set to 0 to disable inactivity timeout.
        """
        now = datetime.utcnow()

        # Check session token exists and hasn't expired
        if not self.session_token or not self.session_expires_at:
            return False
        if self.session_expires_at <= now:
            return False

        # Check inactivity timeout if enabled
        if inactivity_timeout_minutes > 0 and self.last_activity:
            inactivity_cutoff = now - timedelta(minutes=inactivity_timeout_minutes)
            if self.last_activity < inactivity_cutoff:
                return False

        return True


class RefreshToken(Base):
    """
    Refresh token model for secure token rotation pattern.

    Refresh tokens allow users to obtain new short-lived access tokens without
    re-authenticating. Tokens are rotated on each use to prevent replay attacks.
    """

    __tablename__ = "refresh_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("attendee_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    revoked_at = Column(DateTime, nullable=True)
    replaced_by_token = Column(String(255), nullable=True)

    # Security metadata for audit trail
    ip_address = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(Text, nullable=True)

    # Relationship
    attendee = relationship("AttendeeProfile", back_populates="refresh_tokens")

    def __repr__(self):
        return f"<RefreshToken(id={self.id}, user_id={self.user_id}, valid={self.is_valid()})>"

    @classmethod
    def create_token(cls, user_id: uuid.UUID, ip_address: str = None, user_agent: str = None, expiry_days: int = 7):
        """
        Create a new refresh token for a user.

        Args:
            user_id: UUID of the user
            ip_address: IP address of the client
            user_agent: User agent string of the client
            expiry_days: Number of days until token expires (default: 7)

        Returns:
            RefreshToken: New refresh token instance
        """
        token = secrets.token_urlsafe(64)  # 512-bit secure random token
        expires_at = datetime.utcnow() + timedelta(days=expiry_days)

        return cls(
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            ip_address=ip_address,
            user_agent=user_agent
        )

    def is_valid(self) -> bool:
        """
        Check if the refresh token is still valid.

        A token is valid if:
        - It has not been revoked
        - It has not expired
        """
        return self.revoked_at is None and self.expires_at > datetime.utcnow()

    def revoke(self, replaced_by: str = None):
        """
        Revoke this refresh token.

        Args:
            replaced_by: Token that replaced this one (for rotation tracking)
        """
        self.revoked_at = datetime.utcnow()
        if replaced_by:
            self.replaced_by_token = replaced_by
