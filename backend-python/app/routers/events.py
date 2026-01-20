"""
Conference Event Management Router

Handles special event signups (clam bake, field trips, workshops, etc.)
with capacity management and waitlist functionality.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import datetime
import logging
from uuid import UUID
from decimal import Decimal

from app.database import get_db
from app.models.conference import Conference, AttendeeProfile
from app.models.conference_event import ConferenceEvent, EventSignup
from app.routers.auth import get_current_user
from app.dependencies.permissions import get_current_admin
from app.schemas.conference_event import (
    ConferenceEventCreate,
    ConferenceEventUpdate,
    ConferenceEventResponse,
    EventSignupCreate,
    EventSignupUpdate,
    EventSignupResponse,
    EventWithSignupInfo,
    EventSignupSummary,
    UserEventDashboard,
)
from app.services.email_service import email_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# EVENT MANAGEMENT ENDPOINTS (Admin)
# ============================================

@router.get("/conferences/{conference_id}/events", response_model=List[EventWithSignupInfo])
async def get_conference_events(
    conference_id: UUID,
    include_closed: bool = Query(False, description="Include closed/cancelled events"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all events for a conference.
    Returns events with current user's signup information.
    """
    # Verify conference exists
    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conference not found",
        )

    # Build query
    query = db.query(ConferenceEvent).filter(ConferenceEvent.conference_id == conference_id)

    # Filter out closed events unless requested
    if not include_closed:
        query = query.filter(ConferenceEvent.status.in_(["open", "full"]))

    events = query.order_by(ConferenceEvent.event_date).all()

    # Enrich with user signup info
    result = []
    for event in events:
        # Check if user is signed up
        user_signup = db.query(EventSignup).filter(
            EventSignup.event_id == event.id,
            EventSignup.user_id == current_user.id
        ).first()

        result.append(EventWithSignupInfo(
            id=event.id,
            name=event.name,
            description=event.description,
            event_type=event.event_type,
            event_date=event.event_date,
            capacity=event.capacity,
            current_signups=event.current_signups,
            allows_guests=event.allows_guests,
            fee_per_person=event.fee_per_person,
            status=event.status,
            is_full=event.is_full,
            spots_remaining=event.spots_remaining,
            waitlist_count=event.waitlist_count,
            user_signup=user_signup,
            is_signed_up=user_signup is not None
        ))

    return result


@router.post("/conferences/{conference_id}/events", response_model=ConferenceEventResponse, status_code=status.HTTP_201_CREATED)
async def create_event(
    conference_id: UUID,
    event_data: ConferenceEventCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Create a new conference event (admin only).
    """

    # Verify conference exists
    conference = db.query(Conference).filter(Conference.id == conference_id).first()
    if not conference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conference not found",
        )

    # Create event
    event = ConferenceEvent(**event_data.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)

    logger.info(f"Event created: {event.name} for conference {conference.name}")

    return ConferenceEventResponse(
        id=event.id,
        conference_id=event.conference_id,
        name=event.name,
        description=event.description,
        event_type=event.event_type,
        event_date=event.event_date,
        capacity=event.capacity,
        current_signups=event.current_signups,
        allows_guests=event.allows_guests,
        fee_per_person=event.fee_per_person,
        status=event.status,
        is_full=event.is_full,
        spots_remaining=event.spots_remaining,
        waitlist_count=event.waitlist_count,
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.get("/events/{event_id}", response_model=ConferenceEventResponse)
async def get_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get event details by ID.
    """
    event = db.query(ConferenceEvent).filter(ConferenceEvent.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    return ConferenceEventResponse(
        id=event.id,
        conference_id=event.conference_id,
        name=event.name,
        description=event.description,
        event_type=event.event_type,
        event_date=event.event_date,
        capacity=event.capacity,
        current_signups=event.current_signups,
        allows_guests=event.allows_guests,
        fee_per_person=event.fee_per_person,
        status=event.status,
        is_full=event.is_full,
        spots_remaining=event.spots_remaining,
        waitlist_count=event.waitlist_count,
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.patch("/events/{event_id}", response_model=ConferenceEventResponse)
async def update_event(
    event_id: UUID,
    event_data: ConferenceEventUpdate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Update event details (admin only).
    """

    event = db.query(ConferenceEvent).filter(ConferenceEvent.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Update only provided fields
    update_data = event_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(event, field, value)

    # If capacity increased, promote waitlisted users
    if 'capacity' in update_data and event.capacity:
        await _promote_waitlist_users(event, db)

    db.commit()
    db.refresh(event)

    logger.info(f"Event updated: {event.name}")

    return ConferenceEventResponse(
        id=event.id,
        conference_id=event.conference_id,
        name=event.name,
        description=event.description,
        event_type=event.event_type,
        event_date=event.event_date,
        capacity=event.capacity,
        current_signups=event.current_signups,
        allows_guests=event.allows_guests,
        fee_per_person=event.fee_per_person,
        status=event.status,
        is_full=event.is_full,
        spots_remaining=event.spots_remaining,
        waitlist_count=event.waitlist_count,
        created_at=event.created_at,
        updated_at=event.updated_at
    )


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_admin),
):
    """
    Delete an event (admin only).
    Cascade deletes all signups.
    """

    event = db.query(ConferenceEvent).filter(ConferenceEvent.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Check if there are existing signups
    signup_count = db.query(func.count(EventSignup.id)).filter(
        EventSignup.event_id == event_id,
        EventSignup.status.in_(["confirmed", "waitlist"])
    ).scalar()

    if signup_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete event with {signup_count} active signups. Cancel or move them first.",
        )

    db.delete(event)
    db.commit()

    logger.info(f"Event deleted: {event.name}")


# ============================================
# EVENT SIGNUP ENDPOINTS (Members)
# ============================================

@router.post("/events/{event_id}/signup", response_model=EventSignupResponse, status_code=status.HTTP_201_CREATED)
async def signup_for_event(
    event_id: UUID,
    signup_data: EventSignupCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Sign up for an event with optional guests.
    Automatically handles capacity management and waitlist.
    """
    # Get event with row-level locking to prevent race conditions
    event = db.query(ConferenceEvent).filter(
        ConferenceEvent.id == event_id
    ).with_for_update().first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Check if event is open
    if event.status == "closed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event is closed for registration",
        )

    if event.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Event has been cancelled",
        )

    # Check if already signed up
    existing = db.query(EventSignup).filter(
        EventSignup.event_id == event_id,
        EventSignup.user_id == current_user.id
    ).first()

    if existing:
        if existing.status != "cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You are already signed up for this event",
            )
        else:
            # Reactivate cancelled signup
            existing.status = "pending"
            existing.guest_count = signup_data.guest_count
            db.commit()
            # Continue with normal signup flow using existing signup
            signup = existing

    # Validate guest count
    if signup_data.guest_count > 0 and not event.allows_guests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This event does not allow guests",
        )

    if signup_data.guest_count > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 10 guests allowed",
        )

    # Calculate total attendees (user + guests)
    total_attendees = 1 + signup_data.guest_count

    # Check capacity and determine status
    if not existing or existing.status == "cancelled":
        if event.capacity is None:
            # Unlimited capacity
            signup_status = "confirmed"
            event.current_signups += total_attendees
            waitlist_position = None
        else:
            # Check available spots
            spots_remaining = event.capacity - event.current_signups

            if spots_remaining >= total_attendees:
                signup_status = "confirmed"
                event.current_signups += total_attendees
                waitlist_position = None
            else:
                signup_status = "waitlist"
                # Calculate waitlist position
                waitlist_count = db.query(func.count(EventSignup.id)).filter(
                    EventSignup.event_id == event_id,
                    EventSignup.status == "waitlist"
                ).scalar() or 0
                waitlist_position = waitlist_count + 1

        # Calculate fee
        if event.allows_guests:
            total_fee = event.fee_per_person * total_attendees
        else:
            total_fee = event.fee_per_person

        # Create or update signup
        if not existing or existing.status == "cancelled":
            signup = EventSignup(
                event_id=event_id,
                user_id=current_user.id,
                guest_count=signup_data.guest_count,
                total_fee=total_fee,
                status=signup_status,
                waitlist_position=waitlist_position
            )
            db.add(signup)
        else:
            signup.guest_count = signup_data.guest_count
            signup.total_fee = total_fee
            signup.status = signup_status
            signup.waitlist_position = waitlist_position

    # Update event status if full
    if event.capacity and event.current_signups >= event.capacity:
        event.status = "full"

    db.commit()
    db.refresh(signup)

    # Send confirmation email
    try:
        await email_service.send_event_signup_email(
            user_email=current_user.user_email,
            event_name=event.name,
            event_date=event.event_date,
            guest_count=signup_data.guest_count,
            total_fee=total_fee,
            status=signup_status
        )
    except Exception as e:
        logger.error(f"Failed to send event signup email: {e}")

    logger.info(f"Event signup: {current_user.user_email} for {event.name} (status: {signup_status})")

    return EventSignupResponse(
        id=signup.id,
        event_id=signup.event_id,
        user_id=signup.user_id,
        guest_count=signup.guest_count,
        total_fee=signup.total_fee,
        status=signup.status,
        waitlist_position=signup.waitlist_position,
        signed_up_at=signup.signed_up_at,
        created_at=signup.created_at,
        updated_at=signup.updated_at,
        total_attendees=signup.total_attendees
    )


@router.delete("/events/{event_id}/signup", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_event_signup(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Cancel event signup.
    Promotes waitlisted users if spots become available.
    """
    # Get event with locking
    event = db.query(ConferenceEvent).filter(
        ConferenceEvent.id == event_id
    ).with_for_update().first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Find signup
    signup = db.query(EventSignup).filter(
        EventSignup.event_id == event_id,
        EventSignup.user_id == current_user.id
    ).first()

    if not signup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signup not found",
        )

    if signup.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Signup is already cancelled",
        )

    # If confirmed, free up spots
    if signup.status == "confirmed":
        event.current_signups -= signup.total_attendees

        # Update event status if no longer full
        if event.capacity and event.current_signups < event.capacity:
            event.status = "open"

        # Promote waitlisted users
        await _promote_waitlist_users(event, db)

    # Mark as cancelled
    signup.status = "cancelled"

    db.commit()

    logger.info(f"Event signup cancelled: {current_user.user_email} for {event.name}")


@router.patch("/events/{event_id}/signup", response_model=EventSignupResponse)
async def update_event_signup(
    event_id: UUID,
    signup_data: EventSignupUpdate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update event signup (change guest count).
    """
    # Get event with locking
    event = db.query(ConferenceEvent).filter(
        ConferenceEvent.id == event_id
    ).with_for_update().first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Find signup
    signup = db.query(EventSignup).filter(
        EventSignup.event_id == event_id,
        EventSignup.user_id == current_user.id
    ).first()

    if not signup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signup not found",
        )

    if signup.status == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update cancelled signup",
        )

    # Update guest count if provided
    if signup_data.guest_count is not None:
        old_total = signup.total_attendees
        new_guest_count = signup_data.guest_count

        if new_guest_count > 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 10 guests allowed",
            )

        new_total = 1 + new_guest_count

        # Update capacity tracking if confirmed
        if signup.status == "confirmed":
            capacity_change = new_total - old_total

            if event.capacity:
                # Check if increase is allowed
                if capacity_change > 0:
                    spots_available = event.capacity - event.current_signups
                    if capacity_change > spots_available:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Not enough capacity. Only {spots_available} spots available.",
                        )

            event.current_signups += capacity_change

        signup.guest_count = new_guest_count

        # Recalculate fee
        if event.allows_guests:
            signup.total_fee = event.fee_per_person * new_total
        else:
            signup.total_fee = event.fee_per_person

    db.commit()
    db.refresh(signup)

    logger.info(f"Event signup updated: {current_user.user_email} for {event.name}")

    return EventSignupResponse(
        id=signup.id,
        event_id=signup.event_id,
        user_id=signup.user_id,
        guest_count=signup.guest_count,
        total_fee=signup.total_fee,
        status=signup.status,
        waitlist_position=signup.waitlist_position,
        signed_up_at=signup.signed_up_at,
        created_at=signup.created_at,
        updated_at=signup.updated_at,
        total_attendees=signup.total_attendees
    )


@router.get("/events/{event_id}/signups", response_model=List[EventSignupResponse])
async def get_event_signups(
    event_id: UUID,
    status_filter: Optional[str] = Query(None, description="Filter by status: confirmed, waitlist, cancelled"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all signups for an event (admin only).
    """
    # TODO: Add admin check

    query = db.query(EventSignup).filter(EventSignup.event_id == event_id)

    if status_filter:
        query = query.filter(EventSignup.status == status_filter)

    signups = query.order_by(EventSignup.signed_up_at).all()

    return [
        EventSignupResponse(
            id=s.id,
            event_id=s.event_id,
            user_id=s.user_id,
            guest_count=s.guest_count,
            total_fee=s.total_fee,
            status=s.status,
            waitlist_position=s.waitlist_position,
            signed_up_at=s.signed_up_at,
            created_at=s.created_at,
            updated_at=s.updated_at,
            total_attendees=s.total_attendees
        )
        for s in signups
    ]


@router.get("/events/my-signups", response_model=List[EventSignupResponse])
async def get_my_event_signups(
    include_cancelled: bool = Query(False, description="Include cancelled signups"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get current user's event signups.
    """
    query = db.query(EventSignup).filter(EventSignup.user_id == current_user.id)

    if not include_cancelled:
        query = query.filter(EventSignup.status.in_(["confirmed", "waitlist"]))

    signups = query.order_by(EventSignup.signed_up_at.desc()).all()

    return [
        EventSignupResponse(
            id=s.id,
            event_id=s.event_id,
            user_id=s.user_id,
            guest_count=s.guest_count,
            total_fee=s.total_fee,
            status=s.status,
            waitlist_position=s.waitlist_position,
            signed_up_at=s.signed_up_at,
            created_at=s.created_at,
            updated_at=s.updated_at,
            total_attendees=s.total_attendees
        )
        for s in signups
    ]


# ============================================
# ADMIN DASHBOARD ENDPOINTS
# ============================================

@router.get("/events/{event_id}/summary", response_model=EventSignupSummary)
async def get_event_signup_summary(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get signup summary for an event (admin dashboard).
    """
    # TODO: Add admin check

    event = db.query(ConferenceEvent).filter(ConferenceEvent.id == event_id).first()

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    # Count by status
    confirmed_count = db.query(func.count(EventSignup.id)).filter(
        EventSignup.event_id == event_id,
        EventSignup.status == "confirmed"
    ).scalar() or 0

    waitlist_count = db.query(func.count(EventSignup.id)).filter(
        EventSignup.event_id == event_id,
        EventSignup.status == "waitlist"
    ).scalar() or 0

    cancelled_count = db.query(func.count(EventSignup.id)).filter(
        EventSignup.event_id == event_id,
        EventSignup.status == "cancelled"
    ).scalar() or 0

    # Calculate total revenue
    total_revenue = db.query(func.sum(EventSignup.total_fee)).filter(
        EventSignup.event_id == event_id,
        EventSignup.status == "confirmed"
    ).scalar() or Decimal("0.00")

    return EventSignupSummary(
        event_id=event_id,
        event_name=event.name,
        event_date=event.event_date,
        capacity=event.capacity,
        confirmed_count=confirmed_count,
        waitlist_count=waitlist_count,
        cancelled_count=cancelled_count,
        total_revenue=total_revenue
    )


# ============================================
# HELPER FUNCTIONS
# ============================================

async def _promote_waitlist_users(event: ConferenceEvent, db: Session):
    """
    Promote users from waitlist to confirmed if spots become available.
    """
    if not event.capacity:
        return  # No capacity limit

    spots_available = event.capacity - event.current_signups

    if spots_available <= 0:
        return  # No spots available

    # Get waitlisted signups in order
    waitlisted = db.query(EventSignup).filter(
        EventSignup.event_id == event.id,
        EventSignup.status == "waitlist"
    ).order_by(EventSignup.waitlist_position).all()

    promoted_count = 0

    for signup in waitlisted:
        if spots_available <= 0:
            break

        total_attendees = signup.total_attendees

        if total_attendees <= spots_available:
            # Promote to confirmed
            signup.status = "confirmed"
            signup.waitlist_position = None
            event.current_signups += total_attendees
            spots_available -= total_attendees
            promoted_count += 1

            # Send promotion email
            try:
                user = db.query(AttendeeProfile).filter(AttendeeProfile.id == signup.user_id).first()
                if user:
                    await email_service.send_event_waitlist_promotion_email(
                        user_email=user.user_email,
                        event_name=event.name,
                        event_date=event.event_date,
                        guest_count=signup.guest_count,
                        total_fee=signup.total_fee
                    )
            except Exception as e:
                logger.error(f"Failed to send waitlist promotion email: {e}")

    if promoted_count > 0:
        logger.info(f"Promoted {promoted_count} users from waitlist for event {event.name}")

        # Renumber remaining waitlist positions
        remaining_waitlist = db.query(EventSignup).filter(
            EventSignup.event_id == event.id,
            EventSignup.status == "waitlist"
        ).order_by(EventSignup.waitlist_position).all()

        for i, signup in enumerate(remaining_waitlist, start=1):
            signup.waitlist_position = i
