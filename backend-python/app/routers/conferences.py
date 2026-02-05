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
from app.models.abstract_review import AbstractReviewer, AbstractReview, AbstractDecision
from app.routers.auth import get_current_user
from app.dependencies.permissions import get_current_admin, verify_abstract_reviewer, verify_abstract_owner
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
    AttendeeProfileCreate,
    AttendeeProfileUpdate,
    AttendeeProfileResponse,
)
from app.schemas.abstract_review import (
    AbstractReviewerCreate,
    AbstractReviewerResponse,
    AbstractReviewCreate,
    AbstractReviewUpdate,
    AbstractReviewResponse,
    AbstractDecisionCreate,
    AbstractDecisionUpdate,
    AbstractDecisionResponse,
    AbstractWithReviewStats,
    ReviewerAssignmentSummary,
)
from app.services.email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# CONFERENCES ENDPOINTS
# ============================================

@router.get("/active")
async def get_active_conference(
    db: Session = Depends(get_db),
):
    """
    Get the currently active conference for registration.
    Public endpoint - no authentication required.
    Returns the next upcoming conference or the most recent one if no upcoming.
    """
    today = date.today()

    # Find the next upcoming conference (start_date >= today)
    conference = db.query(Conference).filter(
        Conference.start_date >= today
    ).order_by(Conference.start_date).first()

    # If no upcoming conference, get the most recent one
    if not conference:
        conference = db.query(Conference).order_by(
            desc(Conference.start_date)
        ).first()

    if not conference:
        return {
            "success": False,
            "message": "No conference found"
        }

    return {
        "success": True,
        "data": {
            "id": str(conference.id),
            "name": conference.name,
            "year": conference.year,
            "location": conference.location,
            "start_date": conference.start_date.isoformat() if conference.start_date else None,
            "end_date": conference.end_date.isoformat() if conference.end_date else None,
            "website": conference.website,
        }
    }


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
# ATTENDEE PROFILE ENDPOINTS
# ============================================

@router.post("/profile", status_code=status.HTTP_201_CREATED)
async def create_attendee_profile(
    profile_data: AttendeeProfileCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new attendee profile for conference registration.
    Public endpoint - no authentication required for initial registration.
    Returns: {"success": bool, "data": {...}} or {"success": false, "error": "..."}
    """
    try:
        # Check if profile with this email already exists
        existing_profile = db.query(AttendeeProfile).filter(
            AttendeeProfile.user_email == profile_data.user_email
        ).first()

        if existing_profile:
            # Return existing profile instead of creating duplicate
            logger.info(f"Attendee profile already exists for email: {profile_data.user_email}")
            return {
                "success": True,
                "data": {
                    "id": str(existing_profile.id),
                    "user_email": existing_profile.user_email,
                    "first_name": existing_profile.first_name,
                    "last_name": existing_profile.last_name,
                }
            }

        # Create new profile with proper field handling
        profile_dict = profile_data.model_dump(exclude_unset=True)

        # Ensure array fields are properly formatted (None or list)
        if 'research_areas' in profile_dict and profile_dict['research_areas'] is None:
            profile_dict['research_areas'] = []
        if 'expertise' in profile_dict and profile_dict['expertise'] is None:
            profile_dict['expertise'] = []

        profile = AttendeeProfile(**profile_dict)
        db.add(profile)
        db.commit()
        db.refresh(profile)

        logger.info(f"Attendee profile created: {profile.id}")

        return {
            "success": True,
            "data": {
                "id": str(profile.id),
                "user_email": profile.user_email,
                "first_name": profile.first_name,
                "last_name": profile.last_name,
            }
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating attendee profile: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": f"Failed to create profile: {str(e)}"
        }


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


@router.patch("/abstracts/{abstract_id}", response_model=ConferenceAbstractResponse)
async def update_abstract(
    abstract_id: UUID,
    abstract_data: ConferenceAbstractUpdate,
    db: Session = Depends(get_db),
    abstract: ConferenceAbstract = Depends(verify_abstract_owner),
):
    """
    Update an abstract (submitter only, before review starts).
    """

    # Check if reviews have started
    review_count = db.query(func.count(AbstractReview.id)).filter(
        AbstractReview.abstract_id == abstract_id
    ).scalar()

    if review_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update abstract after reviews have been submitted",
        )

    # Update only provided fields
    update_data = abstract_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(abstract, field, value)

    db.commit()
    db.refresh(abstract)

    logger.info(f"Abstract updated: {abstract.title}")
    return abstract


@router.delete("/abstracts/{abstract_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_abstract(
    abstract_id: UUID,
    db: Session = Depends(get_db),
    abstract: ConferenceAbstract = Depends(verify_abstract_owner),
):
    """
    Delete an abstract (submitter only, before review starts).
    """

    # Check if reviews have started
    review_count = db.query(func.count(AbstractReview.id)).filter(
        AbstractReview.abstract_id == abstract_id
    ).scalar()

    if review_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete abstract after reviews have been submitted",
        )

    db.delete(abstract)
    db.commit()

    logger.info(f"Abstract deleted: {abstract.title}")


@router.post("/abstracts/{abstract_id}/withdraw", response_model=ConferenceAbstractResponse)
async def withdraw_abstract(
    abstract_id: UUID,
    db: Session = Depends(get_db),
    abstract: ConferenceAbstract = Depends(verify_abstract_owner),
):
    """
    Withdraw an abstract (submitter only, can be done at any stage).

    Note: The verify_abstract_owner dependency already validates that the
    current user is the submitter, so no additional authorization check needed.
    """
    # Use the abstract from the dependency - it's already verified
    if abstract.status == "withdrawn":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Abstract is already withdrawn",
        )

    abstract.status = "withdrawn"
    db.commit()
    db.refresh(abstract)

    logger.info(f"Abstract withdrawn: {abstract.title}")
    return abstract


# ============================================
# ABSTRACT REVIEW ENDPOINTS
# ============================================

@router.post("/abstracts/{abstract_id}/reviewers", response_model=AbstractReviewerResponse, status_code=status.HTTP_201_CREATED)
async def assign_reviewer(
    abstract_id: UUID,
    reviewer_data: AbstractReviewerCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Assign a reviewer to an abstract (admin only).
    Prevents self-review and duplicate assignments.
    Sends email notification to reviewer.
    """

    # Validate abstract exists
    abstract = db.query(ConferenceAbstract).filter(ConferenceAbstract.id == abstract_id).first()
    if not abstract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Abstract not found",
        )

    # Validate reviewer exists
    reviewer = db.query(AttendeeProfile).filter(AttendeeProfile.id == reviewer_data.reviewer_id).first()
    if not reviewer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reviewer not found",
        )

    # Prevent self-review
    if reviewer.contact_id == abstract.submitter_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot assign submitter as reviewer (self-review not allowed)",
        )

    # Check for duplicate assignment
    existing = db.query(AbstractReviewer).filter(
        AbstractReviewer.abstract_id == abstract_id,
        AbstractReviewer.reviewer_id == reviewer_data.reviewer_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reviewer is already assigned to this abstract",
        )

    # Create assignment
    assignment = AbstractReviewer(
        abstract_id=abstract_id,
        reviewer_id=reviewer_data.reviewer_id,
        assigned_by=current_user.id,
        status="pending"
    )
    db.add(assignment)

    # Update abstract status to under_review if first reviewer
    if abstract.status == "submitted":
        abstract.status = "under_review"

    db.commit()
    db.refresh(assignment)

    # Send email notification to reviewer
    try:
        await email_service.send_review_assignment_email(
            reviewer_email=reviewer.user_email,
            abstract_title=abstract.title,
            due_date=abstract.conference.end_date  # TODO: Add review_deadline field to Conference
        )
        assignment.notified_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        logger.error(f"Failed to send review assignment email: {e}")
        # Don't fail the request if email fails

    logger.info(f"Reviewer assigned: {reviewer.user_email} to abstract {abstract.title}")

    return assignment


@router.delete("/abstracts/{abstract_id}/reviewers/{reviewer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_reviewer(
    abstract_id: UUID,
    reviewer_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Remove a reviewer assignment (admin only, before review is submitted).
    """

    assignment = db.query(AbstractReviewer).filter(
        AbstractReviewer.abstract_id == abstract_id,
        AbstractReviewer.reviewer_id == reviewer_id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reviewer assignment not found",
        )

    # Check if review has been submitted
    review = db.query(AbstractReview).filter(
        AbstractReview.abstract_id == abstract_id,
        AbstractReview.reviewer_id == reviewer_id
    ).first()

    if review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove reviewer after they have submitted a review",
        )

    db.delete(assignment)
    db.commit()

    logger.info(f"Reviewer assignment removed: {reviewer_id} from abstract {abstract_id}")


@router.get("/abstracts/{abstract_id}/reviewers", response_model=List[AbstractReviewerResponse])
async def get_abstract_reviewers(
    abstract_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Get all reviewers assigned to an abstract (admin only).

    Requires admin privileges.
    """
    reviewers = db.query(AbstractReviewer).filter(
        AbstractReviewer.abstract_id == abstract_id
    ).all()

    return reviewers


@router.get("/abstracts/my-assignments", response_model=ReviewerAssignmentSummary)
async def get_my_review_assignments(
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get current user's review assignments.
    Returns summary with total assigned, pending, and completed reviews.
    """
    # Get all assignments for current user
    assignments = db.query(AbstractReviewer).filter(
        AbstractReviewer.reviewer_id == current_user.id
    ).all()

    total_assigned = len(assignments)

    # Count pending vs completed
    pending_reviews = 0
    completed_reviews = 0

    for assignment in assignments:
        review = db.query(AbstractReview).filter(
            AbstractReview.abstract_id == assignment.abstract_id,
            AbstractReview.reviewer_id == current_user.id
        ).first()

        if review and review.submitted_at:
            completed_reviews += 1
        else:
            pending_reviews += 1

    return ReviewerAssignmentSummary(
        reviewer_id=current_user.id,
        total_assigned=total_assigned,
        pending_reviews=pending_reviews,
        completed_reviews=completed_reviews,
        assignments=assignments
    )


@router.post("/abstracts/{abstract_id}/reviews", response_model=AbstractReviewResponse, status_code=status.HTTP_201_CREATED)
async def submit_review(
    abstract_id: UUID,
    review_data: AbstractReviewCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Submit a review for an abstract (assigned reviewers only).
    Calculates weighted score automatically.
    """
    # Verify abstract exists
    abstract = db.query(ConferenceAbstract).filter(ConferenceAbstract.id == abstract_id).first()
    if not abstract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Abstract not found",
        )

    # Verify user is assigned as reviewer
    assignment = db.query(AbstractReviewer).filter(
        AbstractReviewer.abstract_id == abstract_id,
        AbstractReviewer.reviewer_id == current_user.id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to review this abstract",
        )

    # Check for existing review
    existing_review = db.query(AbstractReview).filter(
        AbstractReview.abstract_id == abstract_id,
        AbstractReview.reviewer_id == current_user.id
    ).first()

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this abstract",
        )

    # Create review
    review = AbstractReview(
        abstract_id=abstract_id,
        reviewer_id=current_user.id,
        **review_data.model_dump(exclude={'abstract_id', 'reviewer_id'})
    )

    # Calculate weighted score
    review.calculate_weighted_score()
    review.submitted_at = datetime.utcnow()

    db.add(review)

    # Update assignment status
    assignment.status = "completed"

    # Check if all reviews are complete
    total_reviewers = db.query(func.count(AbstractReviewer.id)).filter(
        AbstractReviewer.abstract_id == abstract_id
    ).scalar()

    completed_reviews = db.query(func.count(AbstractReview.id)).filter(
        AbstractReview.abstract_id == abstract_id
    ).scalar() + 1  # +1 for the review we're adding

    if completed_reviews >= total_reviewers:
        abstract.status = "reviewed"

    db.commit()
    db.refresh(review)

    # Send confirmation email to reviewer
    try:
        await email_service.send_review_confirmation_email(
            reviewer_email=current_user.user_email,
            abstract_title=abstract.title
        )
    except Exception as e:
        logger.error(f"Failed to send review confirmation email: {e}")

    logger.info(f"Review submitted by {current_user.user_email} for abstract {abstract.title}")

    return review


@router.get("/abstracts/{abstract_id}/reviews", response_model=List[AbstractReviewResponse])
async def get_abstract_reviews(
    abstract_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Get all reviews for an abstract (admin only).

    Requires admin privileges.
    """
    reviews = db.query(AbstractReview).filter(
        AbstractReview.abstract_id == abstract_id
    ).all()

    return reviews


@router.get("/abstracts/{abstract_id}/reviews/my-review", response_model=AbstractReviewResponse)
async def get_my_review(
    abstract_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get current user's review for an abstract.
    """
    review = db.query(AbstractReview).filter(
        AbstractReview.abstract_id == abstract_id,
        AbstractReview.reviewer_id == current_user.id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    return review


@router.patch("/abstracts/{abstract_id}/reviews/{review_id}", response_model=AbstractReviewResponse)
async def update_review(
    abstract_id: UUID,
    review_id: UUID,
    review_data: AbstractReviewUpdate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update a review (before decision is made, reviewer only).
    """
    review = db.query(AbstractReview).filter(
        AbstractReview.id == review_id,
        AbstractReview.abstract_id == abstract_id
    ).first()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found",
        )

    # Only the reviewer can update their own review
    if review.reviewer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own reviews",
        )

    # Check if decision has been made
    decision = db.query(AbstractDecision).filter(
        AbstractDecision.abstract_id == abstract_id
    ).first()

    if decision:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update review after decision has been made",
        )

    # Update only provided fields
    update_data = review_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(review, field, value)

    # Recalculate weighted score
    review.calculate_weighted_score()

    db.commit()
    db.refresh(review)

    logger.info(f"Review updated by {current_user.user_email}")

    return review


# ============================================
# DECISION ENDPOINTS
# ============================================

@router.post("/abstracts/{abstract_id}/decision", response_model=AbstractDecisionResponse, status_code=status.HTTP_201_CREATED)
async def make_decision(
    abstract_id: UUID,
    decision_data: AbstractDecisionCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Make final decision on an abstract (admin only).
    Calculates average score from all reviews.
    Sends notification email to submitter.
    """

    # Verify abstract exists
    abstract = db.query(ConferenceAbstract).filter(ConferenceAbstract.id == abstract_id).first()
    if not abstract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Abstract not found",
        )

    # Check if decision already exists
    existing_decision = db.query(AbstractDecision).filter(
        AbstractDecision.abstract_id == abstract_id
    ).first()

    if existing_decision:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decision has already been made for this abstract",
        )

    # Get all reviews
    reviews = db.query(AbstractReview).filter(
        AbstractReview.abstract_id == abstract_id
    ).all()

    if not reviews:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot make decision without any reviews",
        )

    # Calculate average score
    from decimal import Decimal
    total_score = sum(review.weighted_score for review in reviews if review.weighted_score)
    average_score = Decimal(total_score / len(reviews)).quantize(Decimal('0.01'))

    # Create decision
    decision = AbstractDecision(
        abstract_id=abstract_id,
        decided_by=current_user.id,
        decision=decision_data.decision,
        notes=decision_data.notes,
        average_score=average_score,
        review_count=len(reviews)
    )

    db.add(decision)

    # Update abstract status
    abstract.status = decision_data.decision

    db.commit()
    db.refresh(decision)

    # Send notification email to submitter
    try:
        submitter = db.query(AttendeeProfile).filter(
            AttendeeProfile.contact_id == abstract.submitter_id
        ).first()

        if submitter:
            if decision_data.decision == "accepted":
                await email_service.send_acceptance_email(
                    submitter_email=submitter.user_email,
                    abstract_title=abstract.title,
                    presentation_type=abstract.presentation_type or "Presentation",
                    average_score=average_score
                )
            else:
                # Create feedback summary from reviews
                feedback_summary = "; ".join([
                    f"{review.comments}" for review in reviews if review.comments
                ][:3])  # Limit to first 3 review comments

                await email_service.send_rejection_email(
                    submitter_email=submitter.user_email,
                    abstract_title=abstract.title,
                    feedback_summary=feedback_summary
                )

        decision.notified_at = datetime.utcnow()
        db.commit()
    except Exception as e:
        logger.error(f"Failed to send decision notification email: {e}")

    logger.info(f"Decision made on abstract {abstract.title}: {decision_data.decision}")

    return decision


@router.get("/abstracts/statistics", response_model=dict)
async def get_abstract_statistics(
    conference_id: Optional[UUID] = Query(None, description="Filter by conference"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Get abstract review statistics (admin dashboard).

    Requires admin privileges.
    """
    query = db.query(ConferenceAbstract)
    if conference_id:
        query = query.filter(ConferenceAbstract.conference_id == conference_id)

    total_abstracts = query.count()

    # Count by status
    status_counts = {}
    for status in ["submitted", "under_review", "reviewed", "accepted", "rejected", "withdrawn"]:
        count = query.filter(ConferenceAbstract.status == status).count()
        status_counts[status] = count

    # Review completion rate
    abstracts_with_reviews = db.query(ConferenceAbstract.id).join(
        AbstractReview
    ).distinct().count()

    # Average review score
    avg_score = db.query(func.avg(AbstractReview.weighted_score)).scalar() or 0.0

    return {
        "total_abstracts": total_abstracts,
        "status_breakdown": status_counts,
        "abstracts_with_reviews": abstracts_with_reviews,
        "average_review_score": round(float(avg_score), 2),
        "review_completion_rate": round((abstracts_with_reviews / total_abstracts * 100) if total_abstracts > 0 else 0.0, 2)
    }
