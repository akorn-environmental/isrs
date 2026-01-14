"""
Pydantic schemas for BoardVote and BoardVoteDetail models.
"""
from typing import Optional, List
from datetime import datetime, date
from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID


# BoardVoteDetail Schemas
class BoardVoteDetailBase(BaseModel):
    """Base schema for BoardVoteDetail."""
    board_member_name: str = Field(..., min_length=1, max_length=255)
    vote: Optional[str] = Field(None, max_length=20)  # Yes, No, Abstain, or NULL
    timestamp: Optional[datetime] = None


class BoardVoteDetailCreate(BoardVoteDetailBase):
    """Schema for creating a BoardVoteDetail."""
    pass


class BoardVoteDetailResponse(BoardVoteDetailBase):
    """Schema for BoardVoteDetail responses."""
    id: UUID
    vote_id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# BoardVote Schemas
class BoardVoteBase(BaseModel):
    """Base schema for BoardVote."""
    vote_id: str = Field(..., min_length=1, max_length=50, description="VOTE_timestamp format")
    motion_title: str = Field(..., min_length=1, max_length=500)
    motion_description: Optional[str] = None
    vote_date: date
    vote_method: str = Field(default="email", max_length=50)  # email, meeting, survey, unanimous
    result: Optional[str] = Field(None, max_length=50)  # Carried, Failed, No Decision
    yes_count: int = Field(default=0, ge=0)
    no_count: int = Field(default=0, ge=0)
    abstain_count: int = Field(default=0, ge=0)
    total_votes: int = Field(default=0, ge=0)
    quorum_met: bool = Field(default=False)
    notes: Optional[str] = None
    email_content: Optional[str] = None
    processed_by: Optional[str] = Field(None, max_length=255)
    processed_method: Optional[str] = Field(None, max_length=50)  # AI-CLAUDE, AI-FALLBACK, Manual


class BoardVoteCreate(BoardVoteBase):
    """Schema for creating a BoardVote with optional vote details."""
    vote_details: Optional[List[BoardVoteDetailCreate]] = None


class BoardVoteUpdate(BaseModel):
    """Schema for updating a BoardVote (all fields optional)."""
    motion_title: Optional[str] = Field(None, min_length=1, max_length=500)
    motion_description: Optional[str] = None
    vote_date: Optional[date] = None
    vote_method: Optional[str] = Field(None, max_length=50)
    result: Optional[str] = Field(None, max_length=50)
    yes_count: Optional[int] = Field(None, ge=0)
    no_count: Optional[int] = Field(None, ge=0)
    abstain_count: Optional[int] = Field(None, ge=0)
    total_votes: Optional[int] = Field(None, ge=0)
    quorum_met: Optional[bool] = None
    notes: Optional[str] = None
    email_content: Optional[str] = None
    processed_by: Optional[str] = Field(None, max_length=255)
    processed_method: Optional[str] = Field(None, max_length=50)


class BoardVoteResponse(BoardVoteBase):
    """Schema for BoardVote responses."""
    id: UUID
    created_at: datetime
    updated_at: datetime
    vote_details: List[BoardVoteDetailResponse] = []

    model_config = ConfigDict(from_attributes=True)


class BoardVoteListResponse(BaseModel):
    """Schema for paginated board vote list responses."""
    votes: List[BoardVoteResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class VoteStatistics(BaseModel):
    """Schema for vote statistics."""
    total_votes: int
    votes_carried: int
    votes_failed: int
    votes_no_decision: int
    average_yes_percentage: float
    average_participation: float
    most_active_member: Optional[str] = None
    recent_votes_count: int  # Last 30 days
