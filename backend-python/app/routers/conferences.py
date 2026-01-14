"""
Conferences CRUD router for ICSR events and registrations.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from typing import Optional, List
from datetime import datetime, timedelta, date
import logging
from uuid import UUID

from app.database import get_db
from app.models.conference import Conference, ConferenceRegistration, ConferenceSponsor, ConferenceAbstract
from app.models.conference import AttendeeProfile
from app.routers.auth import get_current_user
from app.schemas.conference import (
    ConferenceCreate,
    ConferenceUpdate,
    ConferenceResponse,
    ConferenceListResponse,
    ConferenceStatistics,
    ConferenceRegistrationCreate,
    ConferenceRegistrationUpdate,
    ConferenceRegistrationResponse,
    ConferenceSponsorCreate,
    ConferenceSponsorUpdate,
    ConferenceSponsorResponse,
    ConferenceAbstractCreate,
    ConferenceAbstractUpdate,
    ConferenceAbstractResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# CONFERENCES ENDPOINTS
# ============================================

@router.get("/", response_model=ConferenceListResponse)
async def get_conferences(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in conference name or location"),
    year: Optional[int] = Query(None, description="Filter by year"),
    upcoming: bool = Query(False, description="Show only upcoming conferences"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all conferences with pagination and filtering.
    Requires authentication.
    """
    # Build query
    query = db.query(Conference)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Conference.name.ilike(search_term),
                Conference.location.ilike(search_term),
            )
        )

    # Apply filters
    if year:
        query = query.filter(Conference.year == year)

    if upcoming:
        today = date.today()
        query = query.filter(Conference.start_date >= today)

    # Get total count
    total = query.count()

    # Apply pagination (most recent first)
    offset = (page - 1) * page_size
    conferences = query.order_by(desc(Conference.year), desc(Conference.start_date)).offset(offset).limit(page_size).all()

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return ConferenceListResponse(
        conferences=conferences,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/statistics", response_model=ConferenceStatistics)
async def get_conference_statistics(
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get conference statistics.
    Requires authentication.
    """
    today = date.today()

    # Total conferences
    total_conferences = db.query(func.count(Conference.id)).scalar() or 0

    # Total attendees across all conferences
    total_attendees = db.query(func.sum(Conference.total_attendees)).scalar() or 0

    # Total unique countries
    total_countries = db.query(func.sum(Conference.countries_represented)).scalar() or 0

    # Average attendance
    average_attendance = db.query(func.avg(Conference.total_attendees)).filter(Conference.total_attendees > 0).scalar() or 0.0

    # Upcoming conferences
    upcoming_conferences = db.query(func.count(Conference.id)).filter(Conference.start_date >= today).scalar() or 0

    # Recent conferences (last 2 years)
    two_years_ago = today.year - 2
    recent_conferences = db.query(func.count(Conference.id)).filter(Conference.year >= two_years_ago).scalar() or 0

    return ConferenceStatistics(
        total_conferences=total_conferences,
        total_attendees=int(total_attendees),
        total_countries=int(total_countries),
        average_attendance=round(float(average_attendance), 2),
        upcoming_conferences=upcoming_conferences,
        recent_conferences=recent_conferences,
    )


@router.get("/{conference_id}", response_model=ConferenceResponse)
async def get_conference(
    conference_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get a specific conference by ID.
    Requires authentication.
    """
    conference = db.query(Conference).filter(Conference.id == conference_id).first()

    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conference with ID {conference_id} not found",
        )

    return conference


@router.post("/", response_model=ConferenceResponse, status_code=status.HTTP_201_CREATED)
async def create_conference(
    conference_data: ConferenceCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new conference.
    Requires authentication.
    """
    # Create conference
    conference = Conference(**conference_data.model_dump())
    db.add(conference)
    db.commit()
    db.refresh(conference)

    logger.info(f"Conference created: {conference.name} {conference.year}")

    return conference


@router.patch("/{conference_id}", response_model=ConferenceResponse)
async def update_conference(
    conference_id: UUID,
    conference_data: ConferenceUpdate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update a conference by ID.
    Requires authentication.
    """
    conference = db.query(Conference).filter(Conference.id == conference_id).first()

    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conference with ID {conference_id} not found",
        )

    # Update only provided fields
    update_data = conference_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(conference, field, value)

    db.commit()
    db.refresh(conference)

    logger.info(f"Conference updated: {conference.name} {conference.year}")

    return conference


@router.delete("/{conference_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conference(
    conference_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Delete a conference by ID (cascade deletes registrations, sponsors, abstracts).
    Requires authentication.
    """
    conference = db.query(Conference).filter(Conference.id == conference_id).first()

    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conference with ID {conference_id} not found",
        )

    db.delete(conference)
    db.commit()

    logger.info(f"Conference deleted: {conference.name} {conference.year}")


# ============================================
# REGISTRATIONS ENDPOINTS
# ============================================

@router.get("/{conference_id}/registrations", response_model=List[ConferenceRegistrationResponse])
async def get_conference_registrations(
    conference_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all registrations for a specific conference.
    Requires authentication.
    """
    registrations = db.query(ConferenceRegistration).filter(ConferenceRegistration.conference_id == conference_id).all()
    return registrations


@router.post("/{conference_id}/registrations", response_model=ConferenceRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def create_conference_registration(
    conference_id: UUID,
    registration_data: ConferenceRegistrationCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new conference registration.
    Requires authentication.
    """
    # Verify conference exists
    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conference with ID {conference_id} not found",
        )

    # Check for duplicate registration
    existing_reg = db.query(ConferenceRegistration).filter(
        ConferenceRegistration.conference_id == conference_id,
        ConferenceRegistration.contact_id == registration_data.contact_id
    ).first()

    if existing_reg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact is already registered for this conference",
        )

    # Create registration
    registration = ConferenceRegistration(**registration_data.model_dump())
    db.add(registration)
    db.commit()
    db.refresh(registration)

    logger.info(f"Registration created for conference {conference_id}")

    return registration


# ============================================
# SPONSORS ENDPOINTS
# ============================================

@router.get("/{conference_id}/sponsors", response_model=List[ConferenceSponsorResponse])
async def get_conference_sponsors(
    conference_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all sponsors for a specific conference.
    Requires authentication.
    """
    sponsors = db.query(ConferenceSponsor).filter(ConferenceSponsor.conference_id == conference_id).all()
    return sponsors


@router.post("/{conference_id}/sponsors", response_model=ConferenceSponsorResponse, status_code=status.HTTP_201_CREATED)
async def create_conference_sponsor(
    conference_id: UUID,
    sponsor_data: ConferenceSponsorCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new conference sponsor.
    Requires authentication.
    """
    # Verify conference exists
    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conference with ID {conference_id} not found",
        )

    # Create sponsor
    sponsor = ConferenceSponsor(**sponsor_data.model_dump())
    db.add(sponsor)
    db.commit()
    db.refresh(sponsor)

    logger.info(f"Sponsor created for conference {conference_id}")

    return sponsor


# ============================================
# ABSTRACTS ENDPOINTS
# ============================================

@router.get("/{conference_id}/abstracts", response_model=List[ConferenceAbstractResponse])
async def get_conference_abstracts(
    conference_id: UUID,
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all abstracts for a specific conference.
    Requires authentication.
    """
    query = db.query(ConferenceAbstract).filter(ConferenceAbstract.conference_id == conference_id)

    if status_filter:
        query = query.filter(ConferenceAbstract.status == status_filter)

    abstracts = query.all()
    return abstracts


@router.post("/{conference_id}/abstracts", response_model=ConferenceAbstractResponse, status_code=status.HTTP_201_CREATED)
async def create_conference_abstract(
    conference_id: UUID,
    abstract_data: ConferenceAbstractCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new conference abstract.
    Requires authentication.
    """
    # Verify conference exists
    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conference with ID {conference_id} not found",
        )

    # Create abstract
    abstract = ConferenceAbstract(**abstract_data.model_dump())
    db.add(abstract)
    db.commit()
    db.refresh(abstract)

    logger.info(f"Abstract created for conference {conference_id}: {abstract.title}")

    return abstract
