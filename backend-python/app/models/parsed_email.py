"""
Parsed Email Model
Stores emails received through admin@shellfish-society.org with AI-extracted data
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, Float
from sqlalchemy.sql import func
from app.models import Base


class ParsedEmail(Base):
    """Model for storing parsed emails from SES inbound"""
    __tablename__ = "parsed_emails"

    id = Column(Integer, primary_key=True, index=True)

    # Email metadata
    message_id = Column(String(500), unique=True, index=True)
    s3_key = Column(String(500), index=True)
    from_email = Column(String(255), index=True)
    to_emails = Column(JSON)  # Array of recipient emails
    cc_emails = Column(JSON)  # Array of CC emails
    subject = Column(String(500))
    date = Column(DateTime(timezone=True))

    # Email content
    body_text = Column(Text)
    body_html = Column(Text)
    attachments = Column(JSON)  # Array of attachment metadata

    # AI-extracted data
    extracted_contacts = Column(JSON)  # Array of {name, email, org, confidence}
    action_items = Column(JSON)  # Array of {task, owner, deadline, priority}
    topics = Column(JSON)  # Array of keywords/topics
    overall_confidence = Column(Float)  # 0-100 confidence score

    # Processing status
    status = Column(String(50), default="pending")  # pending, processed, failed, spam
    requires_review = Column(Boolean, default=False)
    reviewed_by = Column(String(255), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)

    # Metadata
    metadata = Column(JSON)  # Additional metadata
    error_message = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<ParsedEmail(id={self.id}, subject='{self.subject}', from='{self.from_email}')>"
