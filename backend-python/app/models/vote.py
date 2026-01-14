"""
Board vote models for tracking governance decisions.
"""
import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, Date, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class BoardVote(Base, TimestampMixin):
    """Board vote model - tracks governance votes and decisions."""

    __tablename__ = "board_votes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vote_id = Column(String(50), unique=True, nullable=False)  # VOTE_timestamp format
    motion_title = Column(String(500), nullable=False)
    motion_description = Column(Text)
    vote_date = Column(Date, nullable=False, index=True)
    vote_method = Column(String(50), default="email")  # email, meeting, survey, unanimous
    result = Column(String(50), index=True)  # Carried, Failed, No Decision
    yes_count = Column(Integer, default=0)
    no_count = Column(Integer, default=0)
    abstain_count = Column(Integer, default=0)
    total_votes = Column(Integer, default=0)
    quorum_met = Column(Boolean, default=False)
    notes = Column(Text)
    email_content = Column(Text)  # Original email thread
    processed_by = Column(String(255))  # Who/what processed this vote
    processed_method = Column(String(50))  # AI-CLAUDE, AI-FALLBACK, Manual

    # Relationships
    vote_details = relationship("BoardVoteDetail", back_populates="vote", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<BoardVote(id={self.id}, vote_id='{self.vote_id}', result='{self.result}')>"


class BoardVoteDetail(Base, TimestampMixin):
    """Individual board member votes for a board vote."""

    __tablename__ = "board_vote_details"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vote_id = Column(UUID(as_uuid=True), ForeignKey("board_votes.id", ondelete="CASCADE"), nullable=False, index=True)
    board_member_name = Column(String(255), nullable=False)
    vote = Column(String(20))  # Yes, No, Abstain, or NULL
    timestamp = Column(DateTime)

    # Relationships
    vote = relationship("BoardVote", back_populates="vote_details")

    def __repr__(self):
        return f"<BoardVoteDetail(id={self.id}, member='{self.board_member_name}', vote='{self.vote}')>"
