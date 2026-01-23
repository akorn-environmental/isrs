"""
Authentication router for magic link login.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging
import json
import phonenumbers
from phonenumbers import NumberParseException

from app.database import get_db
from app.models.conference import AttendeeProfile
from app.services.auth_service import auth_service
from app.services.email_service import email_service
from app.rate_limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response Models for Profile Preview
class PreviewProfileRequest(BaseModel):
    """Request body for profile preview."""
    email: EmailStr


class ConferenceHistoryItem(BaseModel):
    """Conference history entry for preview."""
    year: int
    name: str
    location: Optional[str] = None
    registration_type: Optional[str] = None


class ProfilePreview(BaseModel):
    """Profile preview data (non-sensitive)."""
    firstName: str
    lastInitial: str
    fullName: str
    organization: Optional[str] = None
    position: Optional[str] = None
    location: Optional[str] = None
    hasProfilePhoto: bool = False
    conferenceHistory: list = []
    roles: list = []
    memberSince: Optional[str] = None


class PreviewProfileResponse(BaseModel):
    """Response for profile preview."""
    success: bool
    found: bool
    message: Optional[str] = None
    preview: Optional[ProfilePreview] = None


def get_client_ip(request: Request) -> Optional[str]:
    """
    Get the real client IP address, handling proxy headers.

    Checks headers in order of preference:
    1. X-Forwarded-For (may contain multiple IPs, take first)
    2. X-Real-IP
    3. request.client.host (fallback)

    Args:
        request: FastAPI Request object

    Returns:
        Client IP address or None
    """
    # Check X-Forwarded-For header (may contain comma-separated list)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take the first IP in the chain (original client)
        return forwarded_for.split(",")[0].strip()

    # Check X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    # Fallback to direct connection IP
    return request.client.host if request.client else None


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
        client_ip = get_client_ip(request)
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


@router.post("/preview-profile", response_model=PreviewProfileResponse)
@limiter.limit("10/hour")
async def preview_profile(preview_data: PreviewProfileRequest, request: Request, db: Session = Depends(get_db)):
    """
    Preview profile by email (pre-authentication).
    Returns non-sensitive profile data to show returning users what we have on file.
    This helps users recognize their account before requesting a magic link.

    Rate limited to 10 requests per hour per IP to prevent email enumeration.
    """
    try:
        email = preview_data.email.lower().strip()

        # Look up user in attendee_profiles
        attendee = db.query(AttendeeProfile).filter(AttendeeProfile.user_email == email).first()

        if not attendee:
            # No account found - return helpful response for new user flow
            logger.info(f"Profile preview: no account found for {email}")
            return PreviewProfileResponse(
                success=True,
                found=False,
                message="No existing account found with this email"
            )

        # Check account status (handle None values)
        if attendee.account_status and attendee.account_status in ('suspended', 'deleted'):
            logger.warning(f"Profile preview attempted for suspended/deleted account: {email}")
            return PreviewProfileResponse(
                success=True,
                found=False,
                message="No active account found with this email"
            )

        # Get conference history via registrations (with error handling)
        from app.models.conference import Conference, ConferenceRegistration

        conference_history = []
        try:
            registrations = db.query(ConferenceRegistration, Conference).join(
                Conference, ConferenceRegistration.conference_id == Conference.id
            ).filter(
                ConferenceRegistration.attendee_id == attendee.id
            ).order_by(Conference.year.desc()).all()

            for reg, conf in registrations:
                history_item = {
                    "year": conf.year,
                    "name": conf.name,
                    "location": conf.location,
                    "registration_type": reg.registration_type
                }
                conference_history.append(history_item)
        except Exception as e:
            logger.warning(f"Could not load conference history: {str(e)}")
            # Continue without conference history

        # Build location string
        location_parts = [attendee.city, attendee.country]
        location = ', '.join([p for p in location_parts if p])

        # Build preview data (non-sensitive information only)
        last_initial = f"{attendee.last_name[0]}." if attendee.last_name else ""
        full_name = f"{attendee.first_name} {last_initial}"

        preview = ProfilePreview(
            firstName=attendee.first_name,
            lastInitial=last_initial,
            fullName=full_name,
            organization=attendee.organization_name,
            position=attendee.position,
            location=location if location else None,
            hasProfilePhoto=False,  # We don't have profile photos in current schema
            conferenceHistory=conference_history,
            roles=[],  # Roles not implemented in Python backend yet
            memberSince=attendee.created_at.isoformat() if attendee.created_at else None
        )

        logger.info(f"Profile preview returned for {email}")
        return PreviewProfileResponse(
            success=True,
            found=True,
            preview=preview
        )

    except Exception as e:
        logger.error(f"Error during profile preview: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to look up profile"
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
        client_ip = get_client_ip(request)
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
        client_ip = get_client_ip(request)
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
        ip_address = get_client_ip(request)
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


class UpdateProfileRequest(BaseModel):
    """Request body for profile update."""
    model_config = {"strict": False}

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_email: Optional[str] = None
    organization_name: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    bio: Optional[str] = None
    research_areas: Optional[str] = None
    expertise_keywords: Optional[str] = None
    website: Optional[str] = None
    linkedin_url: Optional[str] = None
    orcid: Optional[str] = None
    directory_opt_in: Optional[bool] = None
    directory_visible_fields: Optional[dict] = None
    notifications_enabled: Optional[bool] = None
    notification_preferences: Optional[dict] = None


def array_to_string(arr):
    """Convert array to comma-separated string for frontend compatibility."""
    if arr is None:
        return ""
    if isinstance(arr, list):
        return ", ".join(str(item) for item in arr if item)
    return str(arr)


@router.get("/me")
async def get_current_user_info(current_user: AttendeeProfile = Depends(get_current_user)):
    """
    Get the current user's profile information.
    Requires authentication.
    """
    return {
        "id": str(current_user.id),
        "email": current_user.user_email,
        "contact_email": current_user.contact_email,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "organization_name": current_user.organization_name,
        "position": current_user.position,
        "department": current_user.department,
        "phone": current_user.phone,
        "address": current_user.address,
        "city": current_user.city,
        "state": current_user.state,
        "zip_code": current_user.zip_code,
        "country": current_user.country,
        "bio": current_user.bio,
        "research_areas": array_to_string(current_user.research_areas),
        "expertise_keywords": array_to_string(current_user.expertise_keywords),
        "website": current_user.website,
        "linkedin_url": current_user.linkedin_url,
        "orcid": current_user.orcid,
        "directory_opt_in": current_user.directory_opt_in,
        "directory_visible_fields": current_user.directory_visible_fields or {},
        "email_verified": current_user.email_verified,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
        "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
        "login_count": current_user.login_count,
        "profile_completion_score": current_user.profile_completion_score,
        "notifications_enabled": current_user.notifications_enabled,
        "notification_preferences": current_user.notification_preferences or {},
    }


@router.get("/directory")
@limiter.limit("30/hour")
async def get_member_directory(
    request: Request,
    search: Optional[str] = None,
    country: Optional[str] = None,
    expertise: Optional[str] = None,
    conference: Optional[str] = None,
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get the member directory with optional filters.

    Rate limited to 30 requests per hour to prevent email harvesting.
    Only returns members who have opted into the directory.
    Requires authentication.
    """
    # Query all members who have opted into the directory
    query = db.query(AttendeeProfile).filter(
        AttendeeProfile.directory_opt_in == True
    )

    # Apply search filter (searches name, organization, bio, research areas)
    if search:
        # Limit search term length to prevent ReDoS and performance issues
        if len(search) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search term too long (max 100 characters)"
            )
        search_term = f"%{search.lower()}%"
        query = query.filter(
            (AttendeeProfile.first_name.ilike(search_term)) |
            (AttendeeProfile.last_name.ilike(search_term)) |
            (AttendeeProfile.organization_name.ilike(search_term)) |
            (AttendeeProfile.bio.ilike(search_term))
        )

    # Apply country filter
    if country:
        query = query.filter(AttendeeProfile.country == country)

    # Get all matching members
    members = query.order_by(AttendeeProfile.last_name, AttendeeProfile.first_name).all()

    # Format response based on each member's visibility preferences
    directory_data = []
    for member in members:
        visible_fields = member.directory_visible_fields or {}

        # Build full_name for frontend compatibility
        full_name = f"{member.first_name} {member.last_name}".strip()

        member_data = {
            "id": str(member.id),
            "first_name": member.first_name,
            "last_name": member.last_name,
            "full_name": full_name,  # Frontend expects this field
        }

        # Add optional fields based on visibility settings
        # Use both old and new field names for frontend compatibility
        if visible_fields.get("organization", True):
            member_data["organization_name"] = member.organization_name
            member_data["organization"] = member.organization_name  # Frontend expects this
        if visible_fields.get("position", True):
            member_data["position"] = member.position
        if visible_fields.get("country", True):
            member_data["country"] = member.country
        if visible_fields.get("city", True):
            member_data["city"] = member.city
        if visible_fields.get("bio", True):
            member_data["bio"] = member.bio
        if visible_fields.get("research_areas", True):
            member_data["research_areas"] = array_to_string(member.research_areas)
        if visible_fields.get("contact_email", False):
            member_data["contact_email"] = member.contact_email

        directory_data.append(member_data)

    return {
        "success": True,
        "data": directory_data,
        "total": len(directory_data)
    }


@router.put("/me")
@limiter.limit("20/hour")
async def update_current_user_profile(
    request: Request,
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the current user's profile information.
    Requires authentication.
    Only updates fields that are provided (not None).

    Rate limited to 20 requests per hour to prevent abuse.
    """
    try:
        logger.info(f"=== PROFILE UPDATE START for user {current_user.user_email} ===")

        # Parse request body manually to handle any content-type issues
        logger.info("Step 1: Reading request body")
        body = await request.body()
        body_str = body.decode('utf-8')
        logger.info(f"Body length: {len(body_str)} bytes")

        # If body is double-encoded JSON string, parse it twice
        logger.info("Step 2: Parsing JSON")
        try:
            body_data = json.loads(body_str)
            if isinstance(body_data, str):
                # Double-encoded, parse again
                body_data = json.loads(body_data)
            logger.info(f"Parsed {len(body_data)} fields")
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse request body: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid JSON in request body: {str(e)}"
            )

        # Validate with Pydantic
        logger.info("Step 3: Validating with Pydantic")
        profile_data = UpdateProfileRequest(**body_data)

        # Update only provided fields
        logger.info("Step 4: Extracting update data")
        update_data = profile_data.model_dump(exclude_unset=True)
        logger.info(f"Updating fields: {list(update_data.keys())}")

        # Validate phone number if provided
        logger.info("Step 5: Phone validation")
        if 'phone' in update_data and update_data['phone']:
            phone = update_data['phone']
            country_raw = update_data.get('country') or current_user.country or 'US'
            logger.info(f"Phone: {phone}, Country: {country_raw}")

            # Normalize country code (USA -> US, United States -> US, etc.)
            country_map = {
                'USA': 'US',
                'United States': 'US',
                'United States of America': 'US',
                'US': 'US',
                'Canada': 'CA',
                'UK': 'GB',
                'United Kingdom': 'GB'
            }
            country = country_map.get(country_raw, country_raw[:2].upper() if country_raw else 'US')

            try:
                # Parse and validate phone number
                parsed_number = phonenumbers.parse(phone, country)
                if phonenumbers.is_valid_number(parsed_number):
                    # Format phone number to E.164 international format
                    update_data['phone'] = phonenumbers.format_number(
                        parsed_number,
                        phonenumbers.PhoneNumberFormat.E164
                    )
                    logger.info(f"Phone formatted to: {update_data['phone']}")
                else:
                    # If validation fails, just keep the original phone number
                    logger.warning(f"Phone number validation failed for {phone} with country {country}, keeping original")
            except NumberParseException as e:
                # If parsing fails, just keep the original phone number
                logger.warning(f"Phone number parsing failed: {str(e)}, keeping original")

        # Convert string fields to arrays for database columns that expect arrays
        logger.info("Step 5b: Converting text fields to arrays for database")
        array_fields = ['research_areas', 'expertise_keywords']
        for field in array_fields:
            if field in update_data:
                value = update_data[field]
                if value is None or value == '':
                    # Empty string or None -> empty array (not NULL)
                    update_data[field] = []
                elif isinstance(value, str):
                    # Split comma-separated string into array, strip whitespace
                    update_data[field] = [item.strip() for item in value.split(',') if item.strip()]
                elif isinstance(value, list):
                    # Already a list, just filter empty items
                    update_data[field] = [item.strip() if isinstance(item, str) else item for item in value if item]
                logger.info(f"Converted {field} to array: {update_data[field]}")

        logger.info("Step 6: Updating user attributes")
        for field, value in update_data.items():
            if value is not None:  # Only update non-None values
                setattr(current_user, field, value)

        logger.info("Step 7: Committing to database - START")
        db.commit()
        logger.info("Step 7: Committing to database - COMPLETE")

        logger.info("Step 8: Refreshing user object")
        db.refresh(current_user)
        logger.info("Step 8: Refresh complete")

        logger.info("Step 9: Building response")
        logger.info(f"Profile updated for user {current_user.user_email}")
        logger.info("=== PROFILE UPDATE COMPLETE ===")

        return {
            "success": True,
            "message": "Profile updated successfully",
            "profile": {
                "id": str(current_user.id),
                "email": current_user.user_email,
                "contact_email": current_user.contact_email,
                "first_name": current_user.first_name,
                "last_name": current_user.last_name,
                "organization_name": current_user.organization_name,
                "position": current_user.position,
                "department": current_user.department,
                "phone": current_user.phone,
                "address": current_user.address,
                "city": current_user.city,
                "state": current_user.state,
                "zip_code": current_user.zip_code,
                "country": current_user.country,
                "bio": current_user.bio,
                "research_areas": array_to_string(current_user.research_areas),
                "expertise_keywords": array_to_string(current_user.expertise_keywords),
                "website": current_user.website,
                "linkedin_url": current_user.linkedin_url,
                "orcid": current_user.orcid,
                "directory_opt_in": current_user.directory_opt_in,
                "directory_visible_fields": current_user.directory_visible_fields or {},
                "email_verified": current_user.email_verified,
                "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
                "profile_completion_score": current_user.profile_completion_score,
                "notifications_enabled": current_user.notifications_enabled,
                "notification_preferences": current_user.notification_preferences or {},
            }
        }

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )
