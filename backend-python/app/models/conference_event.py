"""
Conference Event Management Models

Models for special event signups:
- ConferenceEvent: Special events (clam bake, field trips, workshops, etc.)
- EventSignup: User registrations with capacity management and waitlist
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.types import DECIMAL, TIMESTAMP
from datetime import datetime, timezone
from app.models.base import Base, TimestampMixin
import uuid


class ConferenceEvent(Base, TimestampMixin):
    """
    Special conference events (clam bake, field trips, workshops, etc.)

    Features:
    - Capacity management with current signup tracking
    - Guest allowance with fee calculation
    - Multiple event types (networking, educational, social, etc.)
    - Status tracking (open, full, closed, cancelled)

    Example Events:
    - Low Country Boil (capacity: 150, allows_guests: true, fee: $50)
    - Field Trip: Oyster Farm Tour (capacity: 30, allows_guests: false, fee: $25)
    - Golf Tournament (capacity: 72, allows_guests: true, fee: $75)
    - Welcome Reception (capacity: None, allows_guests: true, fee: $0)
    """
    __tablename__ = "conference_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conference_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conferences.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name = Column(String(200), nullable=False)
    description = Column(Text)
    event_type = Column(String(50), nullable=False, index=True)  # networking, field_trip, workshop, social, golf
    event_date = Column(TIMESTAMP(timezone=True))
    capacity = Column(Integer)  # NULL = unlimited
    current_signups = Column(Integer, default=0, nullable=False)
    allows_guests = Column(Boolean, default=False, nullable=False)
    fee_per_person = Column(DECIMAL(10, 2), default=0, nullable=False)
    status = Column(String(50), default="open", nullable=False)  # open, full, closed, cancelled

    # Relationships
    conference = relationship("Conference", back_populates="events")
    signups = relationship(
        "EventSignup",
        back_populates="event",
        cascade="all, delete-orphan",
        order_by="EventSignup.signed_up_at"
    )

    @property
    def is_full(self):
        """Check if event has reached capacity."""
        if self.capacity is None:
            return False
        return self.current_signups >= self.capacity

    @property
    def spots_remaining(self):
        """Calculate remaining spots (or None if unlimited)."""
        if self.capacity is None:
            return None
        return max(0, self.capacity - self.current_signups)

    @property
    def waitlist_count(self):
        """Count number of users on waitlist."""
        return sum(1 for signup in self.signups if signup.status == "waitlist")

    def __repr__(self):
        capacity_str = f"{self.current_signups}/{self.capacity}" if self.capacity else f"{self.current_signups}/∞"
        return f"<ConferenceEvent(name={self.name}, capacity={capacity_str}, status={self.status})>"


class EventSignup(Base, TimestampMixin):
    """
    User registrations for conference events.

    Features:
    - Guest count tracking
    - Automatic fee calculation
    - Waitlist management with position tracking
    - Unique constraint (one signup per user per event)

    Status Flow:
    - confirmed: User has a confirmed spot
    - waitlist: Event full, user added to waitlist
    - cancelled: User cancelled their signup

    Capacity Logic:
    - If event has spots: status = confirmed, increment current_signups
    - If event full: status = waitlist, assign waitlist_position
    - When user cancels: decrement current_signups, promote waitlist
    """
    __tablename__ = "event_signups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conference_events.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    guest_count = Column(Integer, default=0, nullable=False)
    total_fee = Column(DECIMAL(10, 2), default=0, nullable=False)
    status = Column(String(50), default="confirmed", nullable=False, index=True)  # confirmed, waitlist, cancelled
    waitlist_position = Column(Integer)  # Only set if status = waitlist
    signed_up_at = Column(TIMESTAMP(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    event = relationship("ConferenceEvent", back_populates="signups")
    user = relationship("User", back_populates="event_signups")

    __table_args__ = (
        UniqueConstraint('event_id', 'user_id', name='uq_event_user'),
    )

    @property
    def total_attendees(self):
        """Calculate total attendees (user + guests)."""
        return 1 + self.guest_count

    def calculate_fee(self, event):
        """
        Calculate total fee based on event pricing and guest count.

        Args:
            event (ConferenceEvent): The event being signed up for

        Returns:
            Decimal: Total fee for user + guests
        """
        from decimal import Decimal

        if event.allows_guests:
            # Fee for user + all guests
            return Decimal(event.fee_per_person) * (1 + self.guest_count)
        else:
            # Fee only for user (guests not allowed)
            return Decimal(event.fee_per_person)

    def __repr__(self):
        guest_str = f"+{self.guest_count}g" if self.guest_count > 0 else ""
        return f"<EventSignup(event_id={self.event_id}, user_id={self.user_id}, status={self.status}{guest_str})>"
