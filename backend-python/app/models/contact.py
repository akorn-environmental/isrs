"""
Contact and Organization models.
Handles individuals and organizations in the ISRS database.
"""
import uuid
from sqlalchemy import Column, String, Text, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Organization(Base, TimestampMixin):
    """Organization model - universities, NGOs, government agencies, private companies."""

    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, unique=True, index=True)
    type = Column(String(100))  # University, NGO, Government, Private, etc.
    website = Column(String(500))
    country = Column(String(100))
    notes = Column(Text)

    # Relationships
    contacts = relationship("Contact", back_populates="organization")
    conference_sponsors = relationship("ConferenceSponsor", back_populates="organization")
    funding_prospects = relationship("FundingProspect", back_populates="organization")
    attendee_profiles = relationship("AttendeeProfile", back_populates="organization")

    def __repr__(self):
        return f"<Organization(id={self.id}, name='{self.name}', type='{self.type}')>"


class Contact(Base, TimestampMixin):
    """Contact model - individuals in the ISRS network."""

    __tablename__ = "contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)  # Primary email
    alternate_emails = Column(ARRAY(String(255)))  # Additional email addresses
    first_name = Column(String(100))
    last_name = Column(String(100))
    full_name = Column(String(255))
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), index=True)
    primary_contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="SET NULL"), index=True)  # Owner/primary contact for this contact
    role = Column(String(255), index=True)  # Board Chair, Board Member, Steering Committee, etc.
    title = Column(String(255))  # Job title
    phone = Column(String(50))
    country = Column(String(100))
    state_province = Column(String(100))
    city = Column(String(100))
    expertise = Column(ARRAY(Text))  # Array of expertise areas
    interests = Column(ARRAY(Text))  # Array of interests
    tags = Column(ARRAY(Text))  # Array of organizational tags (e.g., "Planning Committee", "ICSR2026")
    notes = Column(Text)

    # Relationships
    organization = relationship("Organization", back_populates="contacts")
    primary_contact = relationship("Contact", remote_side=[id], foreign_keys=[primary_contact_id])  # Self-referential relationship
    conference_registrations = relationship("ConferenceRegistration", back_populates="contact")
    conference_abstracts = relationship("ConferenceAbstract", back_populates="submitter")
    funding_prospects = relationship("FundingProspect", back_populates="contact")
    sponsored_conferences = relationship("ConferenceSponsor", back_populates="contact_person")
    attendee_profile = relationship("AttendeeProfile", back_populates="contact", uselist=False)

    def __repr__(self):
        return f"<Contact(id={self.id}, email='{self.email}', name='{self.full_name}')>"
