"""
Photo model for gallery and photo management.
Photos are stored in S3, with AI analysis for species identification and metadata.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin


class Photo(Base, TimestampMixin):
    """
    Photo model for managing uploaded photos with AI analysis.
    Files are stored in S3, metadata and AI analysis stored in database.
    """

    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)

    # File information
    filename = Column(String(255), nullable=False, comment="Generated unique filename")
    original_filename = Column(String(255), nullable=False, comment="Original filename from upload")
    s3_key = Column(String(512), nullable=False, unique=True, index=True, comment="S3 object key")
    s3_url = Column(String(1024), nullable=False, comment="Full S3 URL for the photo")
    thumbnail_s3_key = Column(String(512), nullable=True, comment="S3 key for thumbnail")
    thumbnail_url = Column(String(1024), nullable=True, comment="Full S3 URL for thumbnail")

    # File metadata
    mime_type = Column(String(100), nullable=False, comment="MIME type (image/jpeg, etc.)")
    file_size = Column(Integer, nullable=False, comment="File size in bytes")
    width = Column(Integer, nullable=True, comment="Image width in pixels")
    height = Column(Integer, nullable=True, comment="Image height in pixels")
    sha1_hash = Column(String(40), nullable=True, index=True, comment="SHA1 hash for deduplication")

    # User-provided metadata
    caption = Column(Text, nullable=True, comment="Photo caption")
    description = Column(Text, nullable=True, comment="Detailed description")
    taken_at = Column(DateTime, nullable=True, comment="When photo was taken")
    location_name = Column(String(255), nullable=True, comment="Location description")
    gps_latitude = Column(Float, nullable=True, comment="GPS latitude")
    gps_longitude = Column(Float, nullable=True, comment="GPS longitude")
    country = Column(String(100), nullable=True, comment="Country name")
    state_province = Column(String(100), nullable=True, comment="State or province")
    project_name = Column(String(255), nullable=True, comment="Associated project name")

    # Attribution and licensing
    photographer_name = Column(String(255), nullable=True, comment="Photographer's name")
    photographer_email = Column(String(255), nullable=True, comment="Photographer's email")
    copyright_holder = Column(String(255), nullable=True, comment="Copyright holder")
    license_type = Column(String(50), default="All Rights Reserved", comment="License type (CC-BY, CC0, etc.)")
    license_url = Column(String(512), nullable=True, comment="URL to license terms")
    attribution_required = Column(Boolean, default=True, comment="Whether attribution is required")

    # AI Analysis
    ai_analysis = Column(JSONB, nullable=True, comment="Full AI analysis JSON")
    ai_processed = Column(Boolean, default=False, comment="Whether AI analysis was run")
    ai_processed_at = Column(DateTime, nullable=True, comment="When AI analysis was completed")
    species_identified = Column(ARRAY(String), nullable=True, comment="Species identified by AI")
    habitat_type = Column(String(50), nullable=True, comment="Habitat type from AI")
    restoration_technique = Column(String(50), nullable=True, comment="Restoration technique from AI")

    # Accessibility and display
    alt_text = Column(Text, nullable=True, comment="Alt text for accessibility")
    focal_point_x = Column(Float, nullable=True, comment="Focal point X (0-100)")
    focal_point_y = Column(Float, nullable=True, comment="Focal point Y (0-100)")

    # Visibility and status
    is_public = Column(Boolean, default=False, index=True, comment="Whether photo is visible in public gallery")
    is_featured = Column(Boolean, default=False, index=True, comment="Whether photo is featured")
    status = Column(String(20), default="active", index=True, comment="Status: active, archived, deleted")
    tags = Column(ARRAY(String), nullable=True, comment="User-defined tags")

    # Relationships
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("attendee_profiles.id"), nullable=False, index=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    conference_id = Column(UUID(as_uuid=True), ForeignKey("conferences.id"), nullable=True, index=True)

    # Relationship objects
    uploader = relationship("AttendeeProfile", foreign_keys=[uploaded_by])
    conference = relationship("Conference", foreign_keys=[conference_id])

    def __repr__(self):
        return f"<Photo(id={self.id}, filename='{self.filename}', is_public={self.is_public})>"

    def to_dict(self):
        """Convert photo to dictionary for API responses."""
        return {
            "id": self.id,
            "filename": self.filename,
            "original_filename": self.original_filename,
            "url": self.s3_url,
            "thumbnail_url": self.thumbnail_url,
            "mime_type": self.mime_type,
            "file_size": self.file_size,
            "width": self.width,
            "height": self.height,
            "caption": self.caption,
            "description": self.description,
            "taken_at": self.taken_at.isoformat() if self.taken_at else None,
            "location_name": self.location_name,
            "gps_latitude": self.gps_latitude,
            "gps_longitude": self.gps_longitude,
            "country": self.country,
            "state_province": self.state_province,
            "project_name": self.project_name,
            "photographer_name": self.photographer_name,
            "copyright_holder": self.copyright_holder,
            "license_type": self.license_type,
            "ai_analysis": self.ai_analysis,
            "ai_processed": self.ai_processed,
            "species_identified": self.species_identified,
            "habitat_type": self.habitat_type,
            "restoration_technique": self.restoration_technique,
            "alt_text": self.alt_text,
            "focal_point_x": self.focal_point_x,
            "focal_point_y": self.focal_point_y,
            "is_public": self.is_public,
            "is_featured": self.is_featured,
            "status": self.status,
            "tags": self.tags,
            "uploaded_by": str(self.uploaded_by) if self.uploaded_by else None,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
