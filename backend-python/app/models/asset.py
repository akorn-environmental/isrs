"""
Asset model for file management (images, documents, videos).
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Asset(Base, TimestampMixin):
    """
    Asset model for managing uploaded files (images, documents, videos).
    Files are stored in S3, metadata stored in database.
    """

    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False, comment="Original filename")
    s3_key = Column(String(512), nullable=False, unique=True, index=True, comment="S3 object key")
    s3_url = Column(String(1024), nullable=False, comment="Full S3 URL for the asset")
    file_type = Column(String(100), comment="MIME type (image/jpeg, application/pdf, etc.)")
    file_size = Column(Integer, comment="File size in bytes")
    category = Column(
        String(50),
        default="other",
        index=True,
        comment="Asset category: image, video, document, logo, headshot, other",
    )
    tags = Column(String(500), comment="Comma-separated tags for searching")
    description = Column(Text, comment="Asset description or notes")
    uploaded_by = Column(Integer, ForeignKey("attendee_profiles.id"), nullable=False, index=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationship
    uploader = relationship("AttendeeProfile", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<Asset(id={self.id}, filename='{self.filename}', category='{self.category}')>"
