"""
Authentication service for magic link and session management.
"""
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.config import settings
from app.models.auth import UserSession, RefreshToken
from app.models.conference import AttendeeProfile

logger = logging.getLogger(__name__)


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def generate_magic_link_token() -> str:
        """
        Generate a cryptographically secure magic link token.

        Returns:
            A URL-safe random token
        """
        return secrets.token_urlsafe(32)

    @staticmethod
    def generate_session_token() -> str:
        """
        Generate a cryptographically secure session token.

        Returns:
            A URL-safe random token
        """
        return secrets.token_urlsafe(32)

    @staticmethod
    def create_jwt_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT token.

        Args:
            data: Data to encode in the token
            expires_delta: Token expiration time

        Returns:
            Encoded JWT token
        """
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        return encoded_jwt

    @staticmethod
    def verify_jwt_token(token: str) -> Optional[dict]:
        """
        Verify and decode a JWT token.

        Args:
            token: JWT token to verify

        Returns:
            Decoded token data if valid, None otherwise
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            return payload
        except JWTError as e:
            logger.warning(f"JWT verification failed: {str(e)}")
            return None

    @staticmethod
    async def create_magic_link_session(
        db: Session, email: str, attendee_id: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> tuple[UserSession, str]:
        """
        Create a new magic link session for a user.

        Args:
            db: Database session
            email: User email
            attendee_id: Attendee profile ID
            ip_address: User's IP address
            user_agent: User's browser user agent

        Returns:
            Tuple of (UserSession, magic_link_url)
        """
        # Generate magic link token
        magic_link_token = AuthService.generate_magic_link_token()

        # Create session
        user_session = UserSession(
            attendee_id=attendee_id,
            email=email,
            magic_link_token=magic_link_token,
            token_expires_at=datetime.utcnow() + timedelta(minutes=settings.MAGIC_LINK_EXPIRY_MINUTES),
            token_used=False,
            ip_address=ip_address,
            user_agent=user_agent,
        )

        db.add(user_session)
        db.commit()
        db.refresh(user_session)

        # Build magic link URL
        magic_link_url = f"{settings.MAGIC_LINK_BASE_URL}/member/verify.html?token={magic_link_token}"

        logger.info(f"Created magic link session for {email}")
        return user_session, magic_link_url

    @staticmethod
    async def verify_magic_link_and_create_session(
        db: Session, magic_link_token: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> Optional[tuple[UserSession, str]]:
        """
        Verify a magic link token and create a long-lived session.

        Args:
            db: Database session
            magic_link_token: Magic link token from URL
            ip_address: User's IP address
            user_agent: User's browser user agent

        Returns:
            Tuple of (UserSession, session_token) if valid, None otherwise
        """
        # Find session by magic link token
        user_session = db.query(UserSession).filter(UserSession.magic_link_token == magic_link_token).first()

        if not user_session:
            logger.warning(f"Magic link token not found: {magic_link_token}")
            return None

        # Check if token is valid
        if not user_session.is_magic_link_valid():
            logger.warning(f"Magic link token expired or already used: {magic_link_token}")
            return None

        # Mark magic link as used
        user_session.token_used = True
        user_session.token_used_at = datetime.utcnow()

        # Generate session token
        session_token = AuthService.generate_session_token()
        user_session.session_token = session_token
        user_session.session_expires_at = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        user_session.last_activity = datetime.utcnow()

        # Update IP/user agent if provided
        if ip_address:
            user_session.ip_address = ip_address
        if user_agent:
            user_session.user_agent = user_agent

        # Update attendee last login
        attendee = db.query(AttendeeProfile).filter(AttendeeProfile.id == user_session.attendee_id).first()
        if attendee:
            attendee.last_login_at = datetime.utcnow()
            attendee.login_count = (attendee.login_count or 0) + 1

        db.commit()
        db.refresh(user_session)

        logger.info(f"Magic link verified and session created for {user_session.email}")
        return user_session, session_token

    @staticmethod
    async def validate_session_token(db: Session, session_token: str) -> Optional[AttendeeProfile]:
        """
        Validate a session token and return the associated attendee profile.

        Args:
            db: Database session
            session_token: Session token to validate

        Returns:
            AttendeeProfile if valid session, None otherwise
        """
        # Find session by token
        user_session = db.query(UserSession).filter(UserSession.session_token == session_token).first()

        if not user_session:
            return None

        # Check if session is valid
        if not user_session.is_session_valid():
            logger.warning(f"Session expired: {session_token}")
            return None

        # Update last activity
        user_session.last_activity = datetime.utcnow()
        db.commit()

        # Get attendee profile
        attendee = db.query(AttendeeProfile).filter(AttendeeProfile.id == user_session.attendee_id).first()

        return attendee

    @staticmethod
    async def cleanup_expired_sessions(db: Session) -> int:
        """
        Clean up expired sessions from the database.

        Args:
            db: Database session

        Returns:
            Number of sessions deleted
        """
        # Delete expired magic link tokens
        expired_magic_links = (
            db.query(UserSession)
            .filter(UserSession.token_expires_at < datetime.utcnow(), UserSession.token_used == False)
            .delete()
        )

        # Delete expired sessions
        expired_sessions = (
            db.query(UserSession).filter(UserSession.session_expires_at < datetime.utcnow()).delete()
        )

        db.commit()

        total_deleted = expired_magic_links + expired_sessions
        if total_deleted > 0:
            logger.info(f"Cleaned up {total_deleted} expired sessions")

        return total_deleted

    @staticmethod
    async def create_refresh_token(
        db: Session, user_id: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> RefreshToken:
        """
        Create a new refresh token for a user.

        Args:
            db: Database session
            user_id: User's attendee profile ID
            ip_address: User's IP address
            user_agent: User's browser user agent

        Returns:
            RefreshToken: New refresh token instance
        """
        refresh_token = RefreshToken.create_token(
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expiry_days=7  # 7 days default
        )

        db.add(refresh_token)
        db.commit()
        db.refresh(refresh_token)

        logger.info(f"Created refresh token for user {user_id}")
        return refresh_token

    @staticmethod
    async def validate_refresh_token(db: Session, token: str) -> Optional[RefreshToken]:
        """
        Validate a refresh token.

        Args:
            db: Database session
            token: Refresh token string

        Returns:
            RefreshToken if valid, None otherwise
        """
        refresh_token = db.query(RefreshToken).filter(RefreshToken.token == token).first()

        if not refresh_token:
            logger.warning(f"Refresh token not found")
            return None

        if not refresh_token.is_valid():
            logger.warning(f"Refresh token expired or revoked")
            return None

        return refresh_token

    @staticmethod
    async def rotate_refresh_token(
        db: Session, old_token: str, ip_address: Optional[str] = None, user_agent: Optional[str] = None
    ) -> Optional[dict]:
        """
        Rotate a refresh token - validate old token, revoke it, and create a new one.

        This implements the refresh token rotation pattern for security:
        - Old token is immediately revoked after use
        - New token is generated with fresh expiration
        - Prevents replay attacks

        Args:
            db: Database session
            old_token: Current refresh token
            ip_address: User's IP address
            user_agent: User's browser user agent

        Returns:
            Dict with new access_token and refresh_token, or None if invalid
        """
        # Validate old token
        old_refresh_token = await AuthService.validate_refresh_token(db, old_token)

        if not old_refresh_token:
            return None

        # Create new refresh token
        new_refresh_token = RefreshToken.create_token(
            user_id=old_refresh_token.user_id,
            ip_address=ip_address,
            user_agent=user_agent,
            expiry_days=7
        )

        # Revoke old token (with reference to new one)
        old_refresh_token.revoke(replaced_by=new_refresh_token.token)

        db.add(new_refresh_token)
        db.commit()
        db.refresh(new_refresh_token)

        # Create new short-lived access token
        access_token = AuthService.create_jwt_token(
            data={"sub": str(old_refresh_token.user_id)},
            expires_delta=timedelta(hours=1)  # 1 hour access token
        )

        logger.info(f"Rotated refresh token for user {old_refresh_token.user_id}")

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token.token,
            "user_id": str(old_refresh_token.user_id)
        }

    @staticmethod
    async def revoke_all_user_refresh_tokens(db: Session, user_id: str) -> int:
        """
        Revoke all refresh tokens for a user (e.g., on logout or password change).

        Args:
            db: Database session
            user_id: User's attendee profile ID

        Returns:
            Number of tokens revoked
        """
        tokens = db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at == None
        ).all()

        count = 0
        for token in tokens:
            token.revoke()
            count += 1

        db.commit()

        if count > 0:
            logger.info(f"Revoked {count} refresh tokens for user {user_id}")

        return count

    @staticmethod
    async def cleanup_expired_refresh_tokens(db: Session) -> int:
        """
        Clean up expired and revoked refresh tokens.

        Args:
            db: Database session

        Returns:
            Number of tokens deleted
        """
        # Delete tokens that are either expired or have been revoked for >30 days
        cutoff_date = datetime.utcnow() - timedelta(days=30)

        deleted = db.query(RefreshToken).filter(
            (RefreshToken.expires_at < datetime.utcnow()) |
            (RefreshToken.revoked_at < cutoff_date)
        ).delete()

        db.commit()

        if deleted > 0:
            logger.info(f"Cleaned up {deleted} expired/old refresh tokens")

        return deleted


# Global auth service instance
auth_service = AuthService()
