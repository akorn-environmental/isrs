"""
Pydantic schemas for Abstract Review System

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
# AbstractReviewer Schemas
# ========================================

class AbstractReviewerBase(BaseModel):
    """Base fields for AbstractReviewer."""
    abstract_id: UUID
    reviewer_id: UUID
    status: Optional[str] = "pending"


class AbstractReviewerCreate(AbstractReviewerBase):
    """Schema for creating a reviewer assignment."""
    assigned_by: Optional[UUID] = None  # Set to current user in endpoint


class AbstractReviewerUpdate(BaseModel):
    """Schema for updating a reviewer assignment."""
    status: Optional[str] = None
    notified_at: Optional[datetime] = None


class AbstractReviewerResponse(AbstractReviewerBase):
    """Schema for reviewer assignment responses."""
    id: UUID
    assigned_by: Optional[UUID] = None
    notified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (was orm_mode in v1)


# ========================================
# AbstractReview Schemas
# ========================================

class AbstractReviewBase(BaseModel):
    """
    Base fields for AbstractReview.

    All scores are 1-5 scale (1=poor, 5=excellent).
    """
    relevance_score: int = Field(..., ge=1, le=5, description="How relevant is this work to the conference theme?")
    originality_score: int = Field(..., ge=1, le=5, description="Does this work present novel findings or perspectives?")
    methodology_score: int = Field(..., ge=1, le=5, description="Are the methods sound and appropriate?")
    clarity_score: int = Field(..., ge=1, le=5, description="Is the abstract well-written and clear?")
    impact_score: int = Field(..., ge=1, le=5, description="What is the potential impact of this work?")
    strengths: Optional[str] = Field(None, description="What are the main strengths of this work?")
    weaknesses: Optional[str] = Field(None, description="What are the main weaknesses or concerns?")
    comments: Optional[str] = Field(None, description="Additional comments for the organizing committee")
    recommendation: Optional[str] = Field(None, description="Accept, reject, or revise recommendation")

    @field_validator('recommendation')
    @classmethod
    def validate_recommendation(cls, v):
        """Ensure recommendation is one of the allowed values."""
        if v is not None:
            allowed = ['accept', 'reject', 'revise_and_resubmit']
            if v not in allowed:
                raise ValueError(f'Recommendation must be one of: {", ".join(allowed)}')
        return v


class AbstractReviewCreate(AbstractReviewBase):
    """Schema for creating a review."""
    abstract_id: UUID
    reviewer_id: UUID  # Set from current user in endpoint


class AbstractReviewUpdate(BaseModel):
    """Schema for updating a review (before decision is made)."""
    relevance_score: Optional[int] = Field(None, ge=1, le=5)
    originality_score: Optional[int] = Field(None, ge=1, le=5)
    methodology_score: Optional[int] = Field(None, ge=1, le=5)
    clarity_score: Optional[int] = Field(None, ge=1, le=5)
    impact_score: Optional[int] = Field(None, ge=1, le=5)
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    comments: Optional[str] = None
    recommendation: Optional[str] = None

    @field_validator('recommendation')
    @classmethod
    def validate_recommendation(cls, v):
        """Ensure recommendation is one of the allowed values."""
        if v is not None:
            allowed = ['accept', 'reject', 'revise_and_resubmit']
            if v not in allowed:
                raise ValueError(f'Recommendation must be one of: {", ".join(allowed)}')
        return v


class AbstractReviewResponse(AbstractReviewBase):
    """Schema for review responses."""
    id: UUID
    abstract_id: UUID
    reviewer_id: UUID
    weighted_score: Optional[Decimal] = Field(None, description="Calculated weighted score (1.0-5.0)")
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========================================
# AbstractDecision Schemas
# ========================================

class AbstractDecisionBase(BaseModel):
    """Base fields for AbstractDecision."""
    decision: str = Field(..., description="Final decision: accepted, rejected, or revise_and_resubmit")
    notes: Optional[str] = Field(None, description="Internal notes (not shown to submitter)")

    @field_validator('decision')
    @classmethod
    def validate_decision(cls, v):
        """Ensure decision is one of the allowed values."""
        allowed = ['accepted', 'rejected', 'revise_and_resubmit']
        if v not in allowed:
            raise ValueError(f'Decision must be one of: {", ".join(allowed)}')
        return v


class AbstractDecisionCreate(AbstractDecisionBase):
    """Schema for creating a decision."""
    abstract_id: UUID
    decided_by: UUID  # Set from current user in endpoint


class AbstractDecisionUpdate(BaseModel):
    """Schema for updating a decision."""
    decision: Optional[str] = None
    notes: Optional[str] = None

    @field_validator('decision')
    @classmethod
    def validate_decision(cls, v):
        """Ensure decision is one of the allowed values."""
        if v is not None:
            allowed = ['accepted', 'rejected', 'revise_and_resubmit']
            if v not in allowed:
                raise ValueError(f'Decision must be one of: {", ".join(allowed)}')
        return v


class AbstractDecisionResponse(AbstractDecisionBase):
    """Schema for decision responses."""
    id: UUID
    abstract_id: UUID
    decided_by: UUID
    decided_at: datetime
    average_score: Optional[Decimal] = Field(None, description="Average weighted score from all reviews")
    review_count: Optional[int] = Field(None, description="Number of reviews considered")
    notified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========================================
# ReviewCriteria Schemas
# ========================================

class ReviewCriteriaBase(BaseModel):
    """Base fields for ReviewCriteria."""
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    weight: Decimal = Field(default=Decimal("1.0"), ge=0, le=2, description="Weight for scoring calculation")
    display_order: int = Field(default=0, ge=0, description="Order to display in review forms")


class ReviewCriteriaCreate(ReviewCriteriaBase):
    """Schema for creating review criteria."""
    conference_id: UUID


class ReviewCriteriaUpdate(BaseModel):
    """Schema for updating review criteria."""
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    weight: Optional[Decimal] = Field(None, ge=0, le=2)
    display_order: Optional[int] = Field(None, ge=0)


class ReviewCriteriaResponse(ReviewCriteriaBase):
    """Schema for review criteria responses."""
    id: UUID
    conference_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========================================
# Composite/Helper Schemas
# ========================================

class AbstractWithReviewStats(BaseModel):
    """
    Abstract with aggregated review statistics.
    Used for admin dashboard.
    """
    id: UUID
    title: str
    submitter_id: Optional[UUID]
    status: str
    submission_date: Optional[datetime]

    # Review statistics
    reviewer_count: int = 0
    review_count: int = 0
    average_score: Optional[Decimal] = None
    has_decision: bool = False
    decision: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewerAssignmentSummary(BaseModel):
    """
    Summary of reviewer's assignments.
    Used for reviewer dashboard.
    """
    reviewer_id: UUID
    total_assigned: int
    pending_reviews: int
    completed_reviews: int
    assignments: list[AbstractReviewerResponse] = []

    class Config:
        from_attributes = True
