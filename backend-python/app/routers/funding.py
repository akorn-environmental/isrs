"""
Funding Prospects CRUD router for grant and sponsorship pipeline tracking.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc, case
from typing import Optional, List
from datetime import datetime, timedelta, date
import logging
from uuid import UUID
from decimal import Decimal

from app.database import get_db
from app.models.funding import FundingProspect
from app.models.conference import AttendeeProfile
from app.routers.auth import get_current_user
from app.schemas.funding import (
    FundingProspectCreate,
    FundingProspectUpdate,
    FundingProspectResponse,
    FundingProspectListResponse,
    FundingStatistics,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# FUNDING PROSPECTS ENDPOINTS
# ============================================

@router.get("/", response_model=FundingProspectListResponse)
async def get_funding_prospects(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in notes"),
    status: Optional[str] = Query(None, description="Filter by status"),
    priority: Optional[str] = Query(None, description="Filter by priority (high, medium, low)"),
    prospect_type: Optional[str] = Query(None, description="Filter by prospect type"),
    organization_id: Optional[UUID] = Query(None, description="Filter by organization"),
    contact_id: Optional[UUID] = Query(None, description="Filter by contact"),
    upcoming_deadlines: bool = Query(False, description="Show only prospects with deadlines in next 30 days"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all funding prospects with pagination and filtering.
    Requires authentication.
    """
    # Build query
    query = db.query(FundingProspect)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(FundingProspect.notes.ilike(search_term))

    # Apply filters
    if status:
        query = query.filter(FundingProspect.status == status)

    if priority:
        query = query.filter(FundingProspect.priority == priority)

    if prospect_type:
        query = query.filter(FundingProspect.prospect_type == prospect_type)

    if organization_id:
        query = query.filter(FundingProspect.organization_id == organization_id)

    if contact_id:
        query = query.filter(FundingProspect.contact_id == contact_id)

    if upcoming_deadlines:
        today = date.today()
        thirty_days = today + timedelta(days=30)
        query = query.filter(
            FundingProspect.deadline.isnot(None),
            FundingProspect.deadline.between(today, thirty_days)
        )

    # Get total count
    total = query.count()

    # Apply pagination (most recent first, then by deadline)
    offset = (page - 1) * page_size
    prospects = query.order_by(
        desc(FundingProspect.created_at),
        FundingProspect.deadline.asc().nullslast()
    ).offset(offset).limit(page_size).all()

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return FundingProspectListResponse(
        prospects=prospects,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/statistics", response_model=FundingStatistics)
async def get_funding_statistics(
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get funding pipeline statistics.
    Requires authentication.
    """
    today = date.today()

    # Total prospects
    total_prospects = db.query(func.count(FundingProspect.id)).scalar() or 0

    # Prospects by status
    status_counts = db.query(
        FundingProspect.status,
        func.count(FundingProspect.id)
    ).group_by(FundingProspect.status).all()
    prospects_by_status = {status: count for status, count in status_counts if status}

    # Prospects by priority
    priority_counts = db.query(
        FundingProspect.priority,
        func.count(FundingProspect.id)
    ).group_by(FundingProspect.priority).all()
    prospects_by_priority = {priority: count for priority, count in priority_counts if priority}

    # Total amounts
    total_target = db.query(func.sum(FundingProspect.amount_target)).scalar() or Decimal('0')
    total_committed = db.query(func.sum(FundingProspect.amount_committed)).scalar() or Decimal('0')
    total_received = db.query(func.sum(FundingProspect.amount_received)).scalar() or Decimal('0')

    # Success rate (prospects with received funding / total prospects)
    prospects_with_funding = db.query(func.count(FundingProspect.id)).filter(
        FundingProspect.amount_received > 0
    ).scalar() or 0
    success_rate = (prospects_with_funding / total_prospects * 100) if total_prospects > 0 else 0.0

    # Average prospect value
    average_prospect_value = db.query(func.avg(FundingProspect.amount_target)).filter(
        FundingProspect.amount_target > 0
    ).scalar() or Decimal('0')

    # Upcoming deadlines (next 30 days)
    thirty_days = today + timedelta(days=30)
    upcoming_deadlines = db.query(func.count(FundingProspect.id)).filter(
        FundingProspect.deadline.isnot(None),
        FundingProspect.deadline.between(today, thirty_days)
    ).scalar() or 0

    return FundingStatistics(
        total_prospects=total_prospects,
        prospects_by_status=prospects_by_status,
        prospects_by_priority=prospects_by_priority,
        total_target_amount=total_target,
        total_committed_amount=total_committed,
        total_received_amount=total_received,
        success_rate=round(success_rate, 2),
        average_prospect_value=average_prospect_value,
        upcoming_deadlines=upcoming_deadlines,
    )


@router.get("/{prospect_id}", response_model=FundingProspectResponse)
async def get_funding_prospect(
    prospect_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get a specific funding prospect by ID.
    Requires authentication.
    """
    prospect = db.query(FundingProspect).filter(FundingProspect.id == prospect_id).first()

    if not prospect:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Funding prospect with ID {prospect_id} not found",
        )

    return prospect


@router.post("/", response_model=FundingProspectResponse, status_code=status.HTTP_201_CREATED)
async def create_funding_prospect(
    prospect_data: FundingProspectCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new funding prospect.
    Requires authentication.
    """
    # Create prospect
    prospect = FundingProspect(**prospect_data.model_dump())
    db.add(prospect)
    db.commit()
    db.refresh(prospect)

    logger.info(f"Funding prospect created: {prospect.prospect_type} - {prospect.status}")

    return prospect


@router.patch("/{prospect_id}", response_model=FundingProspectResponse)
async def update_funding_prospect(
    prospect_id: UUID,
    prospect_data: FundingProspectUpdate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update a funding prospect by ID.
    Requires authentication.
    """
    prospect = db.query(FundingProspect).filter(FundingProspect.id == prospect_id).first()

    if not prospect:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Funding prospect with ID {prospect_id} not found",
        )

    # Update only provided fields
    update_data = prospect_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(prospect, field, value)

    db.commit()
    db.refresh(prospect)

    logger.info(f"Funding prospect updated: {prospect_id}")

    return prospect


@router.delete("/{prospect_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_funding_prospect(
    prospect_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Delete a funding prospect by ID.
    Requires authentication.
    """
    prospect = db.query(FundingProspect).filter(FundingProspect.id == prospect_id).first()

    if not prospect:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Funding prospect with ID {prospect_id} not found",
        )

    db.delete(prospect)
    db.commit()

    logger.info(f"Funding prospect deleted: {prospect_id}")
