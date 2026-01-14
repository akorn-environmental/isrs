"""
Pydantic schemas for Contact and Organization models.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from uuid import UUID


# Organization Schemas
class OrganizationBase(BaseModel):
    """Base schema for Organization."""
    name: str = Field(..., min_length=1, max_length=255)
    type: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=500)
    country: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class OrganizationCreate(OrganizationBase):
    """Schema for creating an Organization."""
    pass


class OrganizationUpdate(BaseModel):
    """Schema for updating an Organization (all fields optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[str] = Field(None, max_length=100)
    website: Optional[str] = Field(None, max_length=500)
    country: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class OrganizationResponse(OrganizationBase):
    """Schema for Organization responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Contact Schemas
class ContactBase(BaseModel):
    """Base schema for Contact."""
    email: EmailStr
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    organization_id: Optional[UUID] = None
    role: Optional[str] = Field(None, max_length=255)
    title: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    country: Optional[str] = Field(None, max_length=100)
    state_province: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    expertise: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    notes: Optional[str] = None


class ContactCreate(ContactBase):
    """Schema for creating a Contact."""
    pass


class ContactUpdate(BaseModel):
    """Schema for updating a Contact (all fields optional)."""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    organization_id: Optional[UUID] = None
    role: Optional[str] = Field(None, max_length=255)
    title: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)
    country: Optional[str] = Field(None, max_length=100)
    state_province: Optional[str] = Field(None, max_length=100)
    city: Optional[str] = Field(None, max_length=100)
    expertise: Optional[List[str]] = None
    interests: Optional[List[str]] = None
    notes: Optional[str] = None


class ContactResponse(ContactBase):
    """Schema for Contact responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    organization: Optional[OrganizationResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ContactListResponse(BaseModel):
    """Schema for paginated contact list responses."""
    contacts: List[ContactResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
