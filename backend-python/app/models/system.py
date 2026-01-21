"""
System models for audit logging and data quality tracking.
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DECIMAL, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base


class AuditLog(Base):
    """Audit log for tracking changes to data."""

    __tablename__ = "audit_log"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    table_name = Column(String(100))
    record_id = Column(UUID(as_uuid=True))
    action = Column(String(50))  # INSERT, UPDATE, DELETE
    changed_by = Column(String(255))
    changes = Column(JSONB)  # Store old and new values
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<AuditLog(id={self.id}, table='{self.table_name}', action='{self.action}')>"


class DataQualityMetric(Base):
    """Data quality metrics for monitoring database health."""

    __tablename__ = "data_quality_metrics"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    metric_name = Column(String(100))
    metric_value = Column(DECIMAL(10, 2))
    details = Column(JSONB)
    measured_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<DataQualityMetric(id={self.id}, name='{self.metric_name}', value={self.metric_value})>"


class UserFeedback(Base):
    """User feedback submissions from the frontend feedback widget."""

    __tablename__ = "user_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True)  # Link to attendee_profiles if logged in
    user_name = Column(String(255), nullable=True)
    user_email = Column(String(255), nullable=True)
    feedback_type = Column(String(50), nullable=False)  # bug, feature_request, improvement, general
    message = Column(String(5000), nullable=False)
    page_url = Column(String(500), nullable=True)
    page_title = Column(String(255), nullable=True)
    component_name = Column(String(100), nullable=True)
    is_admin_portal = Column(String(10), default='false')  # 'true' or 'false'
    status = Column(String(50), default='new')  # new, reviewed, in_progress, resolved
    reviewed_by = Column(UUID(as_uuid=True), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    notes = Column(String(2000), nullable=True)  # Admin notes
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<UserFeedback(id={self.id}, type='{self.feedback_type}', status='{self.status}')>"
