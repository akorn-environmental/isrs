"""
Authorization and permission checking dependencies.
"""
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from uuid import UUID
from datetime import datetime

from app.database import get_db
from app.models.conference import AttendeeProfile, ConferenceAbstract
from app.models.abstract_review import AbstractReviewer
from app.routers.auth import get_current_user

# Admin role names that grant admin access
ADMIN_ROLES = frozenset([
    'super_admin',
    'developer',
    'board_president',
    'board_vice_president',
    'board_secretary',
    'board_treasurer',
    'board_member',
    'advisory_panel',
])


async def get_current_admin(
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> AttendeeProfile:
    """
    Verify current user has admin privileges.

    Admin privileges are determined by checking the user_roles table for active
    admin role assignments. Admin roles include:
    - super_admin, developer (full system access)
    - board_president, board_vice_president, board_secretary, board_treasurer, board_member
    - advisory_panel

    Raises:
        HTTPException: 403 if user is not an admin

    Returns:
        AttendeeProfile: The authenticated admin user
    """
    # Query user_roles table to check for admin role assignments
    # Using raw SQL since Role models aren't defined yet
    admin_role_check = db.execute(
        text("""
            SELECT r.name
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = :user_id
              AND ur.is_active = true
              AND (ur.active_until IS NULL OR ur.active_until > :now)
              AND (ur.active_from IS NULL OR ur.active_from <= :now)
              AND ur.revoked_at IS NULL
              AND r.name IN :admin_roles
            LIMIT 1
        """),
        {
            "user_id": current_user.id,
            "now": datetime.utcnow(),
            "admin_roles": tuple(ADMIN_ROLES),
        }
    ).fetchone()

    if not admin_role_check:
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
