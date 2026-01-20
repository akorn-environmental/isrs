"""
Authorization and permission checking dependencies.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.database import get_db
from app.models.conference import AttendeeProfile, ConferenceAbstract
from app.models.abstract_review import AbstractReviewer
from app.routers.auth import get_current_user


async def get_current_admin(
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> AttendeeProfile:
    """
    Verify current user has admin privileges.

    Admin privileges are determined by checking notification_preferences for admin flags.
    A user is an admin if any of these notification preferences are enabled:
    - admin_new_registrations
    - admin_moderation_alerts
    - admin_system_alerts

    Raises:
        HTTPException: 403 if user is not an admin

    Returns:
        AttendeeProfile: The authenticated admin user
    """
    # Check if user has admin notification preferences enabled
    prefs = current_user.notification_preferences or {}
    is_admin = (
        prefs.get('admin_new_registrations', False) or
        prefs.get('admin_moderation_alerts', False) or
        prefs.get('admin_system_alerts', False)
    )

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required for this operation"
        )

    return current_user


async def verify_abstract_reviewer(
    abstract_id: UUID,
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> AbstractReviewer:
    """
    Verify current user is assigned as a reviewer for the given abstract.

    Args:
        abstract_id: UUID of the abstract
        current_user: Current authenticated user
        db: Database session

    Raises:
        HTTPException: 403 if user is not assigned as reviewer

    Returns:
        AbstractReviewer: The reviewer assignment record
    """
    # Find reviewer assignment
    assignment = db.query(AbstractReviewer).filter(
        AbstractReviewer.abstract_id == abstract_id,
        AbstractReviewer.reviewer_id == current_user.id
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned as a reviewer for this abstract"
        )

    return assignment


async def verify_abstract_owner(
    abstract_id: UUID,
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> ConferenceAbstract:
    """
    Verify current user is the owner/submitter of the given abstract.

    Args:
        abstract_id: UUID of the abstract
        current_user: Current authenticated user
        db: Database session

    Raises:
        HTTPException: 404 if abstract not found
        HTTPException: 403 if user is not the submitter

    Returns:
        ConferenceAbstract: The abstract record
    """
    # Find the abstract
    abstract = db.query(ConferenceAbstract).filter(
        ConferenceAbstract.id == abstract_id
    ).first()

    if not abstract:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Abstract with ID {abstract_id} not found"
        )

    # Check if current user is the submitter
    if abstract.submitter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only modify abstracts you submitted"
        )

    return abstract
