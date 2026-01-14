"""
Pydantic schemas for Conference-related models.
"""
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


# Conference Schemas
class ConferenceBase(BaseModel):
    """Base schema for Conference."""
    name: str = Field(..., min_length=1, max_length=255)
    year: int = Field(..., ge=1900, le=2100)
    location: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_attendees: Optional[int] = Field(None, ge=0)
    countries_represented: Optional[int] = Field(None, ge=0)
    sessions: Optional[int] = Field(None, ge=0)
    posters: Optional[int] = Field(None, ge=0)
    sponsors: Optional[int] = Field(None, ge=0)
    exhibitors: Optional[int] = Field(None, ge=0)
    abstracts_submitted: Optional[int] = Field(None, ge=0)
    website: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class ConferenceCreate(ConferenceBase):
    """Schema for creating a Conference."""
    pass


class ConferenceUpdate(BaseModel):
    """Schema for updating a Conference (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    year: Optional[int] = Field(None, ge=1900, le=2100)
    location: Optional[str] = Field(None, max_length=255)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    total_attendees: Optional[int] = Field(None, ge=0)
    countries_represented: Optional[int] = Field(None, ge=0)
    sessions: Optional[int] = Field(None, ge=0)
    posters: Optional[int] = Field(None, ge=0)
    sponsors: Optional[int] = Field(None, ge=0)
    exhibitors: Optional[int] = Field(None, ge=0)
    abstracts_submitted: Optional[int] = Field(None, ge=0)
    website: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class ConferenceResponse(ConferenceBase):
    """Schema for Conference responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ConferenceRegistration Schemas
class ConferenceRegistrationBase(BaseModel):
    """Base schema for ConferenceRegistration."""
    conference_id: UUID
    contact_id: UUID
    attendee_id: Optional[UUID] = None
    registration_type: Optional[str] = Field(None, max_length=50)
    registration_date: Optional[date] = None
    payment_status: Optional[str] = Field(None, max_length=50)
    amount_paid: Optional[Decimal] = None
    attendance_confirmed: bool = False
    interested_in_abstract_submission: bool = False
    notes: Optional[str] = None


class ConferenceRegistrationCreate(ConferenceRegistrationBase):
    """Schema for creating a ConferenceRegistration."""
    pass


class ConferenceRegistrationUpdate(BaseModel):
    """Schema for updating a ConferenceRegistration."""
    registration_type: Optional[str] = Field(None, max_length=50)
    registration_date: Optional[date] = None
    payment_status: Optional[str] = Field(None, max_length=50)
    amount_paid: Optional[Decimal] = None
    attendance_confirmed: Optional[bool] = None
    interested_in_abstract_submission: Optional[bool] = None
    notes: Optional[str] = None


class ConferenceRegistrationResponse(ConferenceRegistrationBase):
    """Schema for ConferenceRegistration responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ConferenceSponsor Schemas
class ConferenceSponsorBase(BaseModel):
    """Base schema for ConferenceSponsor."""
    conference_id: UUID
    organization_id: UUID
    sponsor_level: Optional[str] = Field(None, max_length=100)
    amount_committed: Optional[Decimal] = None
    amount_paid: Optional[Decimal] = None
    status: Optional[str] = Field(None, max_length=50)
    contact_person_id: Optional[UUID] = None
    notes: Optional[str] = None


class ConferenceSponsorCreate(ConferenceSponsorBase):
    """Schema for creating a ConferenceSponsor."""
    pass


class ConferenceSponsorUpdate(BaseModel):
    """Schema for updating a ConferenceSponsor."""
    sponsor_level: Optional[str] = Field(None, max_length=100)
    amount_committed: Optional[Decimal] = None
    amount_paid: Optional[Decimal] = None
    status: Optional[str] = Field(None, max_length=50)
    contact_person_id: Optional[UUID] = None
    notes: Optional[str] = None


class ConferenceSponsorResponse(ConferenceSponsorBase):
    """Schema for ConferenceSponsor responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ConferenceAbstract Schemas
class ConferenceAbstractBase(BaseModel):
    """Base schema for ConferenceAbstract."""
    conference_id: UUID
    submitter_id: Optional[UUID] = None
    title: str = Field(..., min_length=1, max_length=500)
    abstract_text: Optional[str] = None
    authors: Optional[List[str]] = None
    presentation_type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=50)
    submission_date: Optional[date] = None
    notes: Optional[str] = None


class ConferenceAbstractCreate(ConferenceAbstractBase):
    """Schema for creating a ConferenceAbstract."""
    pass


class ConferenceAbstractUpdate(BaseModel):
    """Schema for updating a ConferenceAbstract."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    abstract_text: Optional[str] = None
    authors: Optional[List[str]] = None
    presentation_type: Optional[str] = Field(None, max_length=50)
    status: Optional[str] = Field(None, max_length=50)
    submission_date: Optional[date] = None
    notes: Optional[str] = None


class ConferenceAbstractResponse(ConferenceAbstractBase):
    """Schema for ConferenceAbstract responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Paginated Lists
class ConferenceListResponse(BaseModel):
    """Schema for paginated conference list."""
    conferences: List[ConferenceResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ConferenceStatistics(BaseModel):
    """Schema for conference statistics."""
    total_conferences: int
    total_attendees: int
    total_countries: int
    average_attendance: float
    upcoming_conferences: int
    recent_conferences: int
