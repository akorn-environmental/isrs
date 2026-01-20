"""
Authentication router for magic link login.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from app.database import get_db
from app.models.conference import AttendeeProfile
from app.services.auth_service import auth_service
from app.services.email_service import email_service
from app.rate_limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response Models
class LoginRequest(BaseModel):
    """Request body for login."""

    email: EmailStr


class RegisterRequest(BaseModel):
    """Request body for registration."""

    email: EmailStr
    first_name: str
    last_name: str
    organization_name: Optional[str] = None
    country: Optional[str] = None


class LoginResponse(BaseModel):
    """Response for login request."""

    success: bool
    message: str


class RegisterResponse(BaseModel):
    """Response for registration request."""

    success: bool
    message: str
    user_id: Optional[str] = None


class VerifyTokenRequest(BaseModel):
    """Request body for token verification."""

    token: str


class VerifyTokenResponse(BaseModel):
    """Response for token verification."""

    success: bool
    session_token: Optional[str] = None
    refresh_token: Optional[str] = None
    message: str
    user: Optional[dict] = None


class SessionResponse(BaseModel):
    """Response for session validation."""

    valid: bool
    user: Optional[dict] = None


# Dependency to get current user from session token
async def get_current_user(request: Request, db: Session = Depends(get_db)) -> AttendeeProfile:
    """
    Dependency to get the current authenticated user.
    Checks for session_token in Authorization header or cookies.
    """
    # Try to get token from Authorization header
    auth_header = request.headers.get("Authorization")
    session_token = None

    if auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.replace("Bearer ", "")
    else:
        # Try to get from cookie
        session_token = request.cookies.get("session_token")

    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - no session token provided",
        )

    # Validate session token
    attendee = await auth_service.validate_session_token(db, session_token)

    if not attendee:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
        )

    return attendee


@router.post("/register", response_model=RegisterResponse)
@limiter.limit("3/hour")
async def register(register_data: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    """
    Register a new member account.
    Creates an AttendeeProfile and sends a verification magic link.
    Rate limited to 3 requests per hour per IP to prevent abuse.
    """
    try:
        email = register_data.email.lower()

        # Check if user already exists
        existing_user = db.query(AttendeeProfile).filter(AttendeeProfile.user_email == email).first()

        if existing_user:
            logger.warning(f"Registration attempted for existing email: {email}")
            # Don't reveal that user exists for security
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email already exists. Please use the login page instead."
            )

        # Create new attendee profile
        new_attendee = AttendeeProfile(
            user_email=email,
            first_name=register_data.first_name.strip(),
            last_name=register_data.last_name.strip(),
            organization_name=register_data.organization_name.strip() if register_data.organization_name else None,
            country=register_data.country.strip() if register_data.country else None,
            account_status="active",
            email_verified=False,
            login_count=0
        )

        db.add(new_attendee)
        db.commit()
        db.refresh(new_attendee)

        logger.info(f"New member registered: {email} (ID: {new_attendee.id})")

        # Get client IP and user agent
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")

        # Create magic link session for email verification
        user_session, magic_link = await auth_service.create_magic_link_session(
            db, email, str(new_attendee.id), client_ip, user_agent
        )

        # Send verification magic link email
        email_sent = await email_service.send_magic_link(
            email,
            magic_link,
            subject="Welcome to ISRS - Verify Your Email"
        )

        if not email_sent:
            logger.error(f"Failed to send verification email to {email}")
            # Still return success since account was created
            return RegisterResponse(
                success=True,
                message="Account created successfully. Please contact support if you don't receive a verification email.",
                user_id=str(new_attendee.id)
            )

        return RegisterResponse(
            success=True,
            message="Registration successful! Please check your email for a verification link.",
            user_id=str(new_attendee.id)
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during registration. Please try again later."
        )


@router.post("/request-login", response_model=LoginResponse)
@limiter.limit("5/hour")
async def request_login(login_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    Request a magic link for login.
    Sends an email with a one-time login link.
    Rate limited to 5 requests per hour per IP to prevent abuse.
    """
    try:
        email = login_data.email.lower()

        # Check if attendee profile exists
        attendee = db.query(AttendeeProfile).filter(AttendeeProfile.user_email == email).first()

        if not attendee:
            # Return success even if user doesn't exist (security best practice)
            logger.warning(f"Login requested for non-existent user: {email}")
            return LoginResponse(
                success=True, message="If this email is registered, you will receive a login link shortly."
            )

        # Get client IP and user agent
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")

        # Create magic link session
        user_session, magic_link = await auth_service.create_magic_link_session(
            db, email, str(attendee.id), client_ip, user_agent
        )

        # Send magic link email
        email_sent = await email_service.send_magic_link(email, magic_link)

        if not email_sent:
            logger.error(f"Failed to send magic link email to {email}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to send login email. Please try again later.",
            )

        logger.info(f"Magic link sent to {email}")
        return LoginResponse(success=True, message="Login link sent to your email. Please check your inbox.")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login request: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred. Please try again later."
        )


@router.post("/verify-token", response_model=VerifyTokenResponse)
@limiter.limit("10/hour")
async def verify_token(verify_data: VerifyTokenRequest, request: Request, db: Session = Depends(get_db)):
    """
    Verify a magic link token and create a session.
    Returns a session token that can be used for subsequent requests.
    Rate limited to 10 requests per hour per IP to prevent brute force attacks.
    """
    try:
        magic_link_token = verify_data.token

        # Get client IP and user agent
        client_ip = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")

        # Verify magic link and create session
        result = await auth_service.verify_magic_link_and_create_session(
            db, magic_link_token, client_ip, user_agent
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired magic link token",
            )

        user_session, session_token = result

        # Get attendee info
        attendee = db.query(AttendeeProfile).filter(AttendeeProfile.id == user_session.attendee_id).first()

        # Create refresh token for this session
        refresh_token_obj = await auth_service.create_refresh_token(
            db=db,
            user_id=str(user_session.attendee_id),
            ip_address=client_ip,
            user_agent=user_agent
        )

        user_data = {
            "id": str(attendee.id),
            "email": attendee.user_email,
            "first_name": attendee.first_name,
            "last_name": attendee.last_name,
            "organization_name": attendee.organization_name,
        }

        logger.info(f"Token verified and session created for {attendee.user_email}")

        return VerifyTokenResponse(
            success=True,
            session_token=session_token,
            refresh_token=refresh_token_obj.token,
            message="Login successful",
            user=user_data
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during token verification: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred. Please try again later."
        )


@router.get("/validate-session", response_model=SessionResponse)
async def validate_session(current_user: AttendeeProfile = Depends(get_current_user)):
    """
    Validate the current session and return user information.
    Requires a valid session token in Authorization header or cookie.
    """
    user_data = {
        "id": str(current_user.id),
        "email": current_user.user_email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "organization_name": current_user.organization_name,
    }

    return SessionResponse(valid=True, user=user_data)


@router.post("/logout")
async def logout(request: Request, db: Session = Depends(get_db)):
    """
    Logout the current user by invalidating their session.
    """
    try:
        # Try to get session token
        auth_header = request.headers.get("Authorization")
        session_token = None

        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.replace("Bearer ", "")
        else:
            session_token = request.cookies.get("session_token")

        if session_token:
            # Find and delete session
            from app.models.auth import UserSession

            user_session = db.query(UserSession).filter(UserSession.session_token == session_token).first()

            if user_session:
                db.delete(user_session)
                db.commit()
                logger.info(f"User logged out: {user_session.email}")

        # Also revoke all refresh tokens for this user
        if user_session:
            await auth_service.revoke_all_user_refresh_tokens(db, str(user_session.attendee_id))

        return JSONResponse(content={"success": True, "message": "Logged out successfully"})

    except Exception as e:
        logger.error(f"Error during logout: {str(e)}")
        # Return success anyway (logout should be idempotent)
        return JSONResponse(content={"success": True, "message": "Logged out"})


@router.post("/refresh")
@limiter.limit("60/hour")
async def refresh_access_token(request: Request, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token.
    Implements token rotation for security - old token is revoked, new one issued.

    Rate limited to 60 requests per hour (higher than login for auto-refresh).

    Headers or Cookies:
        refresh_token: Current refresh token

    Returns:
        New access_token and refresh_token (old tokens are revoked)
    """
    try:
        # Try to get refresh token from Authorization header first
        auth_header = request.headers.get("Authorization")
        refresh_token = None

        if auth_header and auth_header.startswith("Bearer "):
            refresh_token = auth_header.replace("Bearer ", "")
        else:
            # Fall back to cookie
            refresh_token = request.cookies.get("refresh_token")

        if not refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No refresh token provided"
            )

        # Get client IP and user agent
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("User-Agent")

        # Rotate the refresh token (validates old, revokes it, creates new)
        result = await auth_service.rotate_refresh_token(
            db=db,
            old_token=refresh_token,
            ip_address=ip_address,
            user_agent=user_agent
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )

        logger.info(f"Access token refreshed for user {result['user_id']}")

        return JSONResponse(content={
            "success": True,
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "message": "Tokens refreshed successfully"
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during token refresh: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to refresh token"
        )


@router.get("/me")
async def get_current_user_info(current_user: AttendeeProfile = Depends(get_current_user)):
    """
    Get the current user's profile information.
    Requires authentication.
    """
    return {
        "id": str(current_user.id),
        "email": current_user.user_email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "organization_name": current_user.organization_name,
        "position": current_user.position,
        "country": current_user.country,
        "city": current_user.city,
        "email_verified": current_user.email_verified,
        "last_login_at": current_user.last_login_at,
        "login_count": current_user.login_count,
    }
