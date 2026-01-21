"""
Feedback router for user feedback management.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import logging

from app.database import get_db
from app.models.system import UserFeedback
from app.models.conference import AttendeeProfile
from app.dependencies.permissions import get_current_admin
from app.services.auth_service import auth_service

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# Helper to get current user optionally (for anonymous feedback)
# ============================================================================

async def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[AttendeeProfile]:
    """Get current user if authenticated, otherwise return None."""
    auth_header = request.headers.get("Authorization")
    session_token = None

    if auth_header and auth_header.startswith("Bearer "):
        session_token = auth_header.replace("Bearer ", "")
    else:
        session_token = request.cookies.get("session_token")

    if not session_token:
        return None

    try:
        attendee = await auth_service.validate_session_token(db, session_token)
        return attendee
    except Exception:
        return None


# ============================================================================
# Pydantic Models
# ============================================================================

class FeedbackCreate(BaseModel):
    """Request to create feedback."""
    feedback_type: str = Field(..., min_length=1, max_length=50)
    message: str = Field(..., min_length=1, max_length=5000)
    page_url: Optional[str] = Field(None, max_length=500)
    page_title: Optional[str] = Field(None, max_length=255)
    component_name: Optional[str] = Field(None, max_length=100)
    is_admin_portal: Optional[bool] = False
    user_name: Optional[str] = Field(None, max_length=255)
    user_email: Optional[str] = Field(None, max_length=255)


class FeedbackUpdate(BaseModel):
    """Request to update feedback status."""
    status: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = Field(None, max_length=2000)


class FeedbackResponse(BaseModel):
    """Feedback item response."""
    id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    feedback_type: str
    message: str
    page_url: Optional[str] = None
    page_title: Optional[str] = None
    component_name: Optional[str] = None
    is_admin_portal: bool = False
    status: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None


class FeedbackListResponse(BaseModel):
    """Response for feedback list."""
    success: bool
    data: List[FeedbackResponse]
    total: int


# ============================================================================
# Public Endpoints (for submitting feedback)
# ============================================================================

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_feedback(
    feedback: FeedbackCreate,
    current_user: Optional[AttendeeProfile] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """
    Submit user feedback.

    Works for both authenticated and anonymous users.
    """
    # Create feedback record
    new_feedback = UserFeedback(
        user_id=current_user.id if current_user else None,
        user_name=feedback.user_name or (f"{current_user.first_name} {current_user.last_name}".strip() if current_user else None),
        user_email=feedback.user_email or (current_user.email if current_user else None),
        feedback_type=feedback.feedback_type,
        message=feedback.message,
        page_url=feedback.page_url,
        page_title=feedback.page_title,
        component_name=feedback.component_name,
        is_admin_portal='true' if feedback.is_admin_portal else 'false',
        status='new'
    )

    db.add(new_feedback)
    db.commit()
    db.refresh(new_feedback)

    logger.info(f"New feedback submitted: {new_feedback.id} ({feedback.feedback_type})")

    return {
        "success": True,
        "message": "Feedback submitted successfully",
        "id": str(new_feedback.id)
    }


# ============================================================================
# Admin Endpoints (for managing feedback)
# ============================================================================

@router.get("", response_model=FeedbackListResponse)
async def list_feedback(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    feedback_type: Optional[str] = Query(None, max_length=50),
    status: Optional[str] = Query(None, max_length=50),
    is_admin_portal: Optional[str] = Query(None),
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    List all feedback with optional filters.

    Requires admin privileges.
    """
    query = db.query(UserFeedback)

    # Apply filters
    if feedback_type:
        query = query.filter(UserFeedback.feedback_type == feedback_type)
    if status:
        query = query.filter(UserFeedback.status == status)
    if is_admin_portal is not None:
        query = query.filter(UserFeedback.is_admin_portal == is_admin_portal)

    # Get total count
    total = query.count()

    # Get paginated results
    feedback_items = query.order_by(desc(UserFeedback.created_at)).offset(offset).limit(limit).all()

    data = [
        FeedbackResponse(
            id=str(f.id),
            user_id=str(f.user_id) if f.user_id else None,
            user_name=f.user_name,
            user_email=f.user_email,
            feedback_type=f.feedback_type,
            message=f.message,
            page_url=f.page_url,
            page_title=f.page_title,
            component_name=f.component_name,
            is_admin_portal=f.is_admin_portal == 'true',
            status=f.status or 'new',
            reviewed_by=str(f.reviewed_by) if f.reviewed_by else None,
            reviewed_at=f.reviewed_at,
            notes=f.notes,
            created_at=f.created_at,
            updated_at=f.updated_at
        )
        for f in feedback_items
    ]

    return FeedbackListResponse(
        success=True,
        data=data,
        total=total
    )


@router.get("/{feedback_id}")
async def get_feedback(
    feedback_id: UUID,
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get a single feedback item.

    Requires admin privileges.
    """
    feedback = db.query(UserFeedback).filter(UserFeedback.id == feedback_id).first()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback {feedback_id} not found"
        )

    return {
        "success": True,
        "data": {
            "id": str(feedback.id),
            "user_id": str(feedback.user_id) if feedback.user_id else None,
            "user_name": feedback.user_name,
            "user_email": feedback.user_email,
            "feedback_type": feedback.feedback_type,
            "message": feedback.message,
            "page_url": feedback.page_url,
            "page_title": feedback.page_title,
            "component_name": feedback.component_name,
            "is_admin_portal": feedback.is_admin_portal == 'true',
            "status": feedback.status or 'new',
            "reviewed_by": str(feedback.reviewed_by) if feedback.reviewed_by else None,
            "reviewed_at": feedback.reviewed_at.isoformat() if feedback.reviewed_at else None,
            "notes": feedback.notes,
            "created_at": feedback.created_at.isoformat() if feedback.created_at else None,
            "updated_at": feedback.updated_at.isoformat() if feedback.updated_at else None
        }
    }


@router.patch("/{feedback_id}")
async def update_feedback(
    feedback_id: UUID,
    update: FeedbackUpdate,
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Update feedback status or add notes.

    Requires admin privileges.
    """
    feedback = db.query(UserFeedback).filter(UserFeedback.id == feedback_id).first()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback {feedback_id} not found"
        )

    # Update fields
    if update.status:
        feedback.status = update.status
        if update.status in ['reviewed', 'in_progress', 'resolved']:
            feedback.reviewed_by = current_admin.id
            feedback.reviewed_at = datetime.utcnow()

    if update.notes is not None:
        feedback.notes = update.notes

    db.commit()
    db.refresh(feedback)

    logger.info(f"Feedback {feedback_id} updated by {current_admin.email}: status={update.status}")

    return {
        "success": True,
        "message": "Feedback updated successfully"
    }


@router.delete("/{feedback_id}")
async def delete_feedback(
    feedback_id: UUID,
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a feedback item.

    Requires admin privileges.
    """
    feedback = db.query(UserFeedback).filter(UserFeedback.id == feedback_id).first()

    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Feedback {feedback_id} not found"
        )

    db.delete(feedback)
    db.commit()

    logger.info(f"Feedback {feedback_id} deleted by {current_admin.email}")

    return {
        "success": True,
        "message": "Feedback deleted successfully"
    }
