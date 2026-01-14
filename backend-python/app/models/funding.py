"""
Funding prospect models for tracking grants, sponsorships, and donations.
"""
import uuid
from sqlalchemy import Column, String, Text, Date, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class FundingProspect(Base, TimestampMixin):
    """Funding prospect model - grants, sponsorships, donations, partnerships."""

    __tablename__ = "funding_prospects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"))
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="SET NULL"))
    prospect_type = Column(String(50))  # Grant, Sponsorship, Donation, Partnership
    amount_target = Column(DECIMAL(10, 2))
    amount_committed = Column(DECIMAL(10, 2))
    amount_received = Column(DECIMAL(10, 2))
    status = Column(String(50), index=True)  # pipeline, contacted, proposal_submitted, committed, received, rejected
    priority = Column(String(20), index=True)  # high, medium, low
    deadline = Column(Date)
    proposal_submitted_date = Column(Date)
    decision_date = Column(Date)
    notes = Column(Text)

    # Relationships
    organization = relationship("Organization", back_populates="funding_prospects")
    contact = relationship("Contact", back_populates="funding_prospects")

    def __repr__(self):
        return f"<FundingProspect(id={self.id}, type='{self.prospect_type}', status='{self.status}')>"
