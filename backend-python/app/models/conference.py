"""
Conference-related models for ICSR events, registrations, sponsors, and abstracts.
"""
import uuid
from decimal import Decimal
from sqlalchemy import Column, String, Text, Integer, Boolean, Date, ForeignKey, ARRAY, UniqueConstraint, DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Conference(Base, TimestampMixin):
    """Conference model - ICSR events."""

    __tablename__ = "conferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    year = Column(Integer, nullable=False, index=True)
    location = Column(String(255))
    start_date = Column(Date)
    end_date = Column(Date)
    total_attendees = Column(Integer)
    countries_represented = Column(Integer)
    sessions = Column(Integer)
    posters = Column(Integer)
    sponsors = Column(Integer)
    exhibitors = Column(Integer)
    abstracts_submitted = Column(Integer)
    website = Column(String(500))
    notes = Column(Text)

    # Relationships
    registrations = relationship("ConferenceRegistration", back_populates="conference", cascade="all, delete-orphan")
    conference_sponsors = relationship("ConferenceSponsor", back_populates="conference", cascade="all, delete-orphan")
    abstracts = relationship("ConferenceAbstract", back_populates="conference", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conference(id={self.id}, name='{self.name}', year={self.year})>"


class AttendeeProfile(Base, TimestampMixin):
    """
    Attendee profile - reusable across conferences.
    Linked to authentication system for user login.
    """

    __tablename__ = "attendee_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_email = Column(String(255), unique=True, nullable=False, index=True)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id"), index=True)

    # Basic Info
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    organization_name = Column(String(255))  # In case org not in our system
    position = Column(String(255))
    department = Column(String(255))

    # Contact Details
    phone = Column(String(50))
    country = Column(String(100))
    city = Column(String(100))

    # Professional Profile
    bio = Column(Text)
    cv_url = Column(Text)

    # Account Status (added by migration 012)
    account_status = Column(String(50), default="active")
    email_verified = Column(Boolean, default=False, index=True)
    email_verified_at = Column(Date)
    last_login_at = Column(Date)
    login_count = Column(Integer, default=0)

    # Relationships
    contact = relationship("Contact", back_populates="attendee_profile")
    organization = relationship("Organization", back_populates="attendee_profiles")
    registrations = relationship("ConferenceRegistration", back_populates="attendee")
    user_sessions = relationship("UserSession", back_populates="attendee")

    def __repr__(self):
        return f"<AttendeeProfile(id={self.id}, email='{self.user_email}', name='{self.first_name} {self.last_name}')>"


class ConferenceRegistration(Base, TimestampMixin):
    """Conference registration linking attendees to specific conferences."""

    __tablename__ = "conference_registrations"
    __table_args__ = (UniqueConstraint("conference_id", "contact_id", name="uq_conference_contact"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conference_id = Column(UUID(as_uuid=True), ForeignKey("conferences.id", ondelete="CASCADE"), nullable=False, index=True)
    contact_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="CASCADE"), nullable=False)
    attendee_id = Column(UUID(as_uuid=True), ForeignKey("attendee_profiles.id"))
    registration_type = Column(String(50))  # early_bird, regular, student
    registration_date = Column(Date)
    payment_status = Column(String(50))  # pending, paid, refunded
    amount_paid = Column(DECIMAL(10, 2))
    attendance_confirmed = Column(Boolean, default=False)
    interested_in_abstract_submission = Column(Boolean, default=False, index=True)  # Added by migration 012
    notes = Column(Text)

    # Relationships
    conference = relationship("Conference", back_populates="registrations")
    contact = relationship("Contact", back_populates="conference_registrations")
    attendee = relationship("AttendeeProfile", back_populates="registrations")

    def __repr__(self):
        return f"<ConferenceRegistration(id={self.id}, conference_id={self.conference_id}, contact_id={self.contact_id})>"


class ConferenceSponsor(Base, TimestampMixin):
    """Conference sponsorship tracking."""

    __tablename__ = "conference_sponsors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conference_id = Column(UUID(as_uuid=True), ForeignKey("conferences.id", ondelete="CASCADE"), nullable=False, index=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    sponsor_level = Column(String(100))  # Platinum, Gold, Silver, Bronze, etc.
    amount_committed = Column(DECIMAL(10, 2))
    amount_paid = Column(DECIMAL(10, 2))
    status = Column(String(50))  # potential, committed, paid
    contact_person_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="SET NULL"))
    notes = Column(Text)

    # Relationships
    conference = relationship("Conference", back_populates="conference_sponsors")
    organization = relationship("Organization", back_populates="conference_sponsors")
    contact_person = relationship("Contact", back_populates="sponsored_conferences")

    def __repr__(self):
        return f"<ConferenceSponsor(id={self.id}, level='{self.sponsor_level}', status='{self.status}')>"


class ConferenceAbstract(Base, TimestampMixin):
    """Conference abstract submissions."""

    __tablename__ = "conference_abstracts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conference_id = Column(UUID(as_uuid=True), ForeignKey("conferences.id", ondelete="CASCADE"), nullable=False, index=True)
    submitter_id = Column(UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="SET NULL"))
    title = Column(String(500), nullable=False)
    abstract_text = Column(Text)
    authors = Column(ARRAY(Text))
    presentation_type = Column(String(50))  # oral, poster
    status = Column(String(50))  # submitted, accepted, rejected, withdrawn
    submission_date = Column(Date)
    notes = Column(Text)

    # Relationships
    conference = relationship("Conference", back_populates="abstracts")
    submitter = relationship("Contact", back_populates="conference_abstracts")

    def __repr__(self):
        return f"<ConferenceAbstract(id={self.id}, title='{self.title}', status='{self.status}')>"
