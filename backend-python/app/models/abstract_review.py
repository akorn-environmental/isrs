"""
Abstract Review System Models

Models for peer review workflow:
- AbstractReviewer: Tracks reviewer assignments to abstracts
- AbstractReview: Stores reviews with weighted scoring (1-5 scale)
- AbstractDecision: Final acceptance/rejection decisions
- ReviewCriteria: Configurable review criteria per conference
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, UniqueConstraint, CheckConstraint, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.types import DECIMAL
from datetime import datetime, timezone
from app.models.base import Base, TimestampMixin
import uuid


class AbstractReviewer(Base, TimestampMixin):
    """
    Tracks reviewer assignments to abstracts.

    Workflow:
    - Admin assigns reviewers to submitted abstracts
    - Status: pending → in_progress → completed
    - Prevents self-review (submitter cannot review own abstract)
    - One reviewer can be assigned to multiple abstracts
    - Each abstract can have multiple reviewers
    """
    __tablename__ = "abstract_reviewers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    abstract_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conference_abstracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    reviewer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    assigned_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String(50), default="pending", index=True)
    notified_at = Column(TIMESTAMP(timezone=True))

    # Relationships
    abstract = relationship("ConferenceAbstract", back_populates="reviewers")
    reviewer = relationship(
        "User",
        foreign_keys=[reviewer_id],
        back_populates="abstract_assignments"
    )
    assigner = relationship("User", foreign_keys=[assigned_by])

    __table_args__ = (
        UniqueConstraint('abstract_id', 'reviewer_id', name='uq_abstract_reviewer'),
    )

    def __repr__(self):
        return f"<AbstractReviewer(abstract_id={self.abstract_id}, reviewer_id={self.reviewer_id}, status={self.status})>"


class AbstractReview(Base, TimestampMixin):
    """
    Stores peer reviews with weighted scoring.

    Scoring:
    - 5 criteria rated 1-5 (1=poor, 5=excellent)
    - Weighted formula: (relevance*1.2 + originality*1.0 + methodology*1.0 + clarity*0.8 + impact*1.0) / 5.0
    - Range: 1.0 to 5.0
    - Higher weight on relevance (most important)
    - Lower weight on clarity (less critical than content)

    Constraints:
    - One review per reviewer per abstract (unique constraint)
    - Reviewer must be assigned before submitting review
    - Scores must be 1-5 (check constraints)
    """
    __tablename__ = "abstract_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    abstract_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conference_abstracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    reviewer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Scoring (1-5 scale with check constraints)
    relevance_score = Column(
        Integer,
        CheckConstraint('relevance_score BETWEEN 1 AND 5', name='ck_relevance_score')
    )
    originality_score = Column(
        Integer,
        CheckConstraint('originality_score BETWEEN 1 AND 5', name='ck_originality_score')
    )
    methodology_score = Column(
        Integer,
        CheckConstraint('methodology_score BETWEEN 1 AND 5', name='ck_methodology_score')
    )
    clarity_score = Column(
        Integer,
        CheckConstraint('clarity_score BETWEEN 1 AND 5', name='ck_clarity_score')
    )
    impact_score = Column(
        Integer,
        CheckConstraint('impact_score BETWEEN 1 AND 5', name='ck_impact_score')
    )

    weighted_score = Column(DECIMAL(5, 2))  # Calculated automatically
    strengths = Column(Text)
    weaknesses = Column(Text)
    comments = Column(Text)
    recommendation = Column(String(50))  # accept, reject, revise
    submitted_at = Column(TIMESTAMP(timezone=True))

    # Relationships
    abstract = relationship("ConferenceAbstract", back_populates="reviews")
    reviewer = relationship("User", back_populates="abstract_reviews")

    __table_args__ = (
        UniqueConstraint('abstract_id', 'reviewer_id', name='uq_abstract_review'),
    )

    def calculate_weighted_score(self):
        """
        Calculate weighted score based on criteria weights.

        Formula: (relevance*1.2 + originality*1.0 + methodology*1.0 + clarity*0.8 + impact*1.0) / 5.0

        Returns:
            Decimal: Weighted score between 1.0 and 5.0, or None if any score is missing
        """
        if all([
            self.relevance_score is not None,
            self.originality_score is not None,
            self.methodology_score is not None,
            self.clarity_score is not None,
            self.impact_score is not None
        ]):
            from decimal import Decimal
            self.weighted_score = Decimal(
                (
                    self.relevance_score * 1.2 +
                    self.originality_score * 1.0 +
                    self.methodology_score * 1.0 +
                    self.clarity_score * 0.8 +
                    self.impact_score * 1.0
                ) / 5.0
            ).quantize(Decimal('0.01'))  # Round to 2 decimal places

    def __repr__(self):
        return f"<AbstractReview(abstract_id={self.abstract_id}, reviewer_id={self.reviewer_id}, weighted_score={self.weighted_score})>"


class AbstractDecision(Base, TimestampMixin):
    """
    Final acceptance/rejection decisions for abstracts.

    Workflow:
    - Admin reviews all submitted reviews
    - Makes final decision: accepted, rejected, revise_and_resubmit
    - Calculates average score across all reviews
    - Sends notification email to submitter

    Business Rules:
    - Only one decision per abstract (one-to-one relationship)
    - Decision requires at least one review
    - Average score and review count calculated automatically
    - Submitter notified via email when decision is made
    """
    __tablename__ = "abstract_decisions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    abstract_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conference_abstracts.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    decision = Column(String(50), nullable=False, index=True)  # accepted, rejected, revise_and_resubmit
    decided_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    decided_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc))
    average_score = Column(DECIMAL(5, 2))
    review_count = Column(Integer)
    notes = Column(Text)  # Internal notes, not shown to submitter
    notified_at = Column(TIMESTAMP(timezone=True))

    # Relationships
    abstract = relationship(
        "ConferenceAbstract",
        back_populates="decision",
        uselist=False  # One-to-one relationship
    )
    decider = relationship("User")

    def __repr__(self):
        return f"<AbstractDecision(abstract_id={self.abstract_id}, decision={self.decision}, average_score={self.average_score})>"


class ReviewCriteria(Base, TimestampMixin):
    """
    Configurable review criteria per conference.

    Allows conferences to customize:
    - Criteria names and descriptions
    - Weights for each criterion (default 1.0)
    - Display order in review forms

    Default ICSR2026 Criteria:
    1. Relevance (weight 1.2) - Most important
    2. Originality (weight 1.0)
    3. Methodology (weight 1.0)
    4. Clarity (weight 0.8) - Less critical
    5. Impact (weight 1.0)
    """
    __tablename__ = "review_criteria"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conference_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conferences.id", ondelete="CASCADE"),
        nullable=False
    )
    name = Column(String(100), nullable=False)
    description = Column(Text)
    weight = Column(DECIMAL(3, 2), nullable=False, default=1.0)
    display_order = Column(Integer, nullable=False, default=0)

    # Relationships
    conference = relationship("Conference", back_populates="review_criteria")

    __table_args__ = (
        UniqueConstraint('conference_id', 'name', name='uq_conference_criteria'),
    )

    def __repr__(self):
        return f"<ReviewCriteria(name={self.name}, weight={self.weight}, display_order={self.display_order})>"


# Import TIMESTAMP after other imports to avoid circular dependency
from sqlalchemy import TIMESTAMP
