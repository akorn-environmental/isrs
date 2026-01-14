"""
Pydantic schemas for FundingProspect model.
"""
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


class FundingProspectBase(BaseModel):
    """Base schema for FundingProspect."""
    organization_id: Optional[UUID] = None
    contact_id: Optional[UUID] = None
    prospect_type: Optional[str] = Field(None, max_length=50)  # Grant, Sponsorship, Donation, Partnership
    amount_target: Optional[Decimal] = None
    amount_committed: Optional[Decimal] = None
    amount_received: Optional[Decimal] = None
    status: Optional[str] = Field(None, max_length=50)  # pipeline, contacted, proposal_submitted, etc.
    priority: Optional[str] = Field(None, max_length=20)  # high, medium, low
    deadline: Optional[date] = None
    proposal_submitted_date: Optional[date] = None
    decision_date: Optional[date] = None
    notes: Optional[str] = None


class FundingProspectCreate(FundingProspectBase):
    """Schema for creating a FundingProspect."""
    pass


class FundingProspectUpdate(BaseModel):
    """Schema for updating a FundingProspect (all fields optional)."""
    organization_id: Optional[UUID] = None
    contact_id: Optional[UUID] = None
    prospect_type: Optional[str] = Field(None, max_length=50)
    amount_target: Optional[Decimal] = None
    amount_committed: Optional[Decimal] = None
    amount_received: Optional[Decimal] = None
    status: Optional[str] = Field(None, max_length=50)
    priority: Optional[str] = Field(None, max_length=20)
    deadline: Optional[date] = None
    proposal_submitted_date: Optional[date] = None
    decision_date: Optional[date] = None
    notes: Optional[str] = None


class FundingProspectResponse(FundingProspectBase):
    """Schema for FundingProspect responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FundingProspectListResponse(BaseModel):
    """Schema for paginated funding prospect list."""
    prospects: List[FundingProspectResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class FundingStatistics(BaseModel):
    """Schema for funding pipeline statistics."""
    total_prospects: int
    prospects_by_status: dict  # status -> count
    prospects_by_priority: dict  # priority -> count
    total_target_amount: Decimal
    total_committed_amount: Decimal
    total_received_amount: Decimal
    success_rate: float  # percentage of prospects that received funding
    average_prospect_value: Decimal
    upcoming_deadlines: int  # count of prospects with deadlines in next 30 days
