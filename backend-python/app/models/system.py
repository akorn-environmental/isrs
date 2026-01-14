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
