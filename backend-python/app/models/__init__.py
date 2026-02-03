"""
SQLAlchemy models for ISRS database.
Imports all models for easy access.
"""
from app.models.base import Base, TimestampMixin
from app.models.contact import Contact, Organization
from app.models.vote import BoardVote, BoardVoteDetail
from app.models.conference import (
    Conference,
    ConferenceRegistration,
    ConferenceSponsor,
    ConferenceAbstract,
    AttendeeProfile,
)
from app.models.funding import FundingProspect
from app.models.auth import UserSession
from app.models.system import AuditLog, DataQualityMetric, UserFeedback
from app.models.asset import Asset
from app.models.asset_zone import AssetZone, AssetZoneAsset
from app.models.photo import Photo
from app.models.parsed_email import ParsedEmail

__all__ = [
    "Base",
    "TimestampMixin",
    "Contact",
    "Organization",
    "BoardVote",
    "BoardVoteDetail",
    "Conference",
    "ConferenceRegistration",
    "ConferenceSponsor",
    "ConferenceAbstract",
    "AttendeeProfile",
    "FundingProspect",
    "UserSession",
    "AuditLog",
    "DataQualityMetric",
    "UserFeedback",
    "Asset",
    "AssetZone",
    "AssetZoneAsset",
    "Photo",
    "ParsedEmail",
]
