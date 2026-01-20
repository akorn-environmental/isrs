"""
Pydantic schemas for Conference Event Management

Following ISRS 4-schema pattern:
- Base: Shared fields between Create and Response
- Create: Fields required for creation
- Update: Optional fields for updates
- Response: Fields returned in API responses (includes generated fields)
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


# ========================================
# ConferenceEvent Schemas
# ========================================

class ConferenceEventBase(BaseModel):
    """Base fields for ConferenceEvent."""
    name: str = Field(..., max_length=200, description="Event name (e.g., 'Low Country Boil')")
    description: Optional[str] = Field(None, description="Detailed event description")
    event_type: str = Field(..., description="Event category: networking, field_trip, workshop, social, golf, other")
    event_date: Optional[datetime] = Field(None, description="Date and time of the event")
    capacity: Optional[int] = Field(None, ge=0, description="Maximum attendees (null = unlimited)")
    allows_guests: bool = Field(default=False, description="Whether attendees can bring guests")
    fee_per_person: Decimal = Field(default=Decimal("0.00"), ge=0, description="Cost per person (USD)")
    status: str = Field(default="open", description="Event status: open, full, closed, cancelled")

    @field_validator('event_type')
    @classmethod
    def validate_event_type(cls, v):
        """Ensure event_type is one of the allowed values."""
        allowed = ['networking', 'field_trip', 'workshop', 'social', 'golf', 'reception', 'other']
        if v not in allowed:
            raise ValueError(f'Event type must be one of: {", ".join(allowed)}')
        return v

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Ensure status is one of the allowed values."""
        allowed = ['open', 'full', 'closed', 'cancelled']
        if v not in allowed:
            raise ValueError(f'Status must be one of: {", ".join(allowed)}')
        return v


class ConferenceEventCreate(ConferenceEventBase):
    """Schema for creating a conference event."""
    conference_id: UUID


class ConferenceEventUpdate(BaseModel):
    """Schema for updating a conference event."""
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[datetime] = None
    capacity: Optional[int] = Field(None, ge=0)
    allows_guests: Optional[bool] = None
    fee_per_person: Optional[Decimal] = Field(None, ge=0)
    status: Optional[str] = None

    @field_validator('event_type')
    @classmethod
    def validate_event_type(cls, v):
        """Ensure event_type is one of the allowed values."""
        if v is not None:
            allowed = ['networking', 'field_trip', 'workshop', 'social', 'golf', 'reception', 'other']
            if v not in allowed:
                raise ValueError(f'Event type must be one of: {", ".join(allowed)}')
        return v

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Ensure status is one of the allowed values."""
        if v is not None:
            allowed = ['open', 'full', 'closed', 'cancelled']
            if v not in allowed:
                raise ValueError(f'Status must be one of: {", ".join(allowed)}')
        return v


class ConferenceEventResponse(ConferenceEventBase):
    """Schema for conference event responses."""
    id: UUID
    conference_id: UUID
    current_signups: int = Field(..., description="Current number of confirmed signups")
    is_full: bool = Field(..., description="Whether event has reached capacity")
    spots_remaining: Optional[int] = Field(None, description="Remaining spots (null if unlimited)")
    waitlist_count: int = Field(default=0, description="Number of people on waitlist")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========================================
# EventSignup Schemas
# ========================================

class EventSignupBase(BaseModel):
    """Base fields for EventSignup."""
    guest_count: int = Field(default=0, ge=0, le=10, description="Number of guests (0-10)")


class EventSignupCreate(EventSignupBase):
    """Schema for creating an event signup."""
    event_id: UUID


class EventSignupUpdate(BaseModel):
    """Schema for updating an event signup."""
    guest_count: Optional[int] = Field(None, ge=0, le=10)
    status: Optional[str] = None

    @field_validator('status')
    @classmethod
    def validate_status(cls, v):
        """Ensure status is one of the allowed values."""
        if v is not None:
            allowed = ['confirmed', 'waitlist', 'cancelled']
            if v not in allowed:
                raise ValueError(f'Status must be one of: {", ".join(allowed)}')
        return v


class EventSignupResponse(EventSignupBase):
    """Schema for event signup responses."""
    id: UUID
    event_id: UUID
    user_id: UUID
    total_fee: Decimal = Field(..., description="Total fee for user + guests")
    status: str = Field(..., description="Signup status: confirmed, waitlist, cancelled")
    waitlist_position: Optional[int] = Field(None, description="Position in waitlist (if applicable)")
    signed_up_at: datetime
    created_at: datetime
    updated_at: datetime

    # Computed fields
    total_attendees: int = Field(..., description="Total number of attendees (user + guests)")

    class Config:
        from_attributes = True


# ========================================
# Composite/Helper Schemas
# ========================================

class EventWithSignupInfo(BaseModel):
    """
    Event with current user's signup information.
    Used for member event listing.
    """
    id: UUID
    name: str
    description: Optional[str]
    event_type: str
    event_date: Optional[datetime]
    capacity: Optional[int]
    current_signups: int
    allows_guests: bool
    fee_per_person: Decimal
    status: str

    # Computed fields
    is_full: bool
    spots_remaining: Optional[int]
    waitlist_count: int

    # User's signup info (null if not signed up)
    user_signup: Optional[EventSignupResponse] = None
    is_signed_up: bool = False

    class Config:
        from_attributes = True


class EventSignupSummary(BaseModel):
    """
    Summary of all events with signup counts.
    Used for admin dashboard.
    """
    event_id: UUID
    event_name: str
    event_date: Optional[datetime]
    capacity: Optional[int]
    confirmed_count: int = 0
    waitlist_count: int = 0
    cancelled_count: int = 0
    total_revenue: Decimal = Decimal("0.00")

    class Config:
        from_attributes = True


class UserEventDashboard(BaseModel):
    """
    User's event dashboard showing all their signups.
    Used for member portal.
    """
    user_id: UUID
    upcoming_events: list[EventWithSignupInfo] = []
    waitlisted_events: list[EventWithSignupInfo] = []
    past_events: list[EventWithSignupInfo] = []

    class Config:
        from_attributes = True
