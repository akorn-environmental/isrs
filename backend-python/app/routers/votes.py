"""
Board Votes CRUD router for governance tracking.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc
from typing import Optional
from datetime import datetime, timedelta, date
import logging
from uuid import UUID

from app.database import get_db
from app.models.vote import BoardVote, BoardVoteDetail
from app.models.conference import AttendeeProfile
from app.routers.auth import get_current_user
from app.schemas.vote import (
    BoardVoteCreate,
    BoardVoteUpdate,
    BoardVoteResponse,
    BoardVoteListResponse,
    VoteStatistics,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# BOARD VOTES ENDPOINTS
# ============================================

@router.get("/", response_model=BoardVoteListResponse)
async def get_board_votes(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in motion title or description"),
    result: Optional[str] = Query(None, description="Filter by result (Carried, Failed, No Decision)"),
    vote_method: Optional[str] = Query(None, description="Filter by vote method"),
    date_from: Optional[date] = Query(None, description="Filter votes from this date"),
    date_to: Optional[date] = Query(None, description="Filter votes until this date"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all board votes with pagination, filtering, and search.
    Requires authentication.
    """
    # Build query
    query = db.query(BoardVote)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                BoardVote.motion_title.ilike(search_term),
                BoardVote.motion_description.ilike(search_term),
            )
        )

    # Apply filters
    if result:
        query = query.filter(BoardVote.result == result)

    if vote_method:
        query = query.filter(BoardVote.vote_method == vote_method)

    if date_from:
        query = query.filter(BoardVote.vote_date >= date_from)

    if date_to:
        query = query.filter(BoardVote.vote_date <= date_to)

    # Get total count
    total = query.count()

    # Apply pagination (most recent first)
    offset = (page - 1) * page_size
    votes = query.order_by(desc(BoardVote.vote_date), desc(BoardVote.created_at)).offset(offset).limit(page_size).all()

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return BoardVoteListResponse(
        votes=votes,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/statistics", response_model=VoteStatistics)
async def get_vote_statistics(
    days: int = Query(365, ge=1, le=3650, description="Number of days to analyze"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get voting statistics for governance analytics.
    Requires authentication.
    """
    # Date range
    cutoff_date = datetime.now().date() - timedelta(days=days)
    recent_cutoff = datetime.now().date() - timedelta(days=30)

    # Total votes
    total_votes = db.query(func.count(BoardVote.id)).filter(BoardVote.vote_date >= cutoff_date).scalar()

    # Votes by result
    votes_carried = (
        db.query(func.count(BoardVote.id)).filter(BoardVote.result == "Carried", BoardVote.vote_date >= cutoff_date).scalar()
    )

    votes_failed = (
        db.query(func.count(BoardVote.id)).filter(BoardVote.result == "Failed", BoardVote.vote_date >= cutoff_date).scalar()
    )

    votes_no_decision = (
        db.query(func.count(BoardVote.id))
        .filter(BoardVote.result == "No Decision", BoardVote.vote_date >= cutoff_date)
        .scalar()
    )

    # Average yes percentage
    avg_yes = db.query(func.avg(BoardVote.yes_count)).filter(BoardVote.vote_date >= cutoff_date, BoardVote.total_votes > 0).scalar()

    avg_total = db.query(func.avg(BoardVote.total_votes)).filter(BoardVote.vote_date >= cutoff_date, BoardVote.total_votes > 0).scalar()

    average_yes_percentage = (avg_yes / avg_total * 100) if avg_yes and avg_total else 0.0

    # Average participation
    avg_participation = avg_total if avg_total else 0.0

    # Most active member
    most_active = (
        db.query(BoardVoteDetail.board_member_name, func.count(BoardVoteDetail.id).label("vote_count"))
        .join(BoardVote)
        .filter(BoardVote.vote_date >= cutoff_date)
        .group_by(BoardVoteDetail.board_member_name)
        .order_by(desc("vote_count"))
        .first()
    )

    most_active_member = most_active[0] if most_active else None

    # Recent votes count (last 30 days)
    recent_votes_count = db.query(func.count(BoardVote.id)).filter(BoardVote.vote_date >= recent_cutoff).scalar()

    return VoteStatistics(
        total_votes=total_votes or 0,
        votes_carried=votes_carried or 0,
        votes_failed=votes_failed or 0,
        votes_no_decision=votes_no_decision or 0,
        average_yes_percentage=round(average_yes_percentage, 2),
        average_participation=round(average_participation, 2),
        most_active_member=most_active_member,
        recent_votes_count=recent_votes_count or 0,
    )


@router.get("/{vote_id}", response_model=BoardVoteResponse)
async def get_board_vote(
    vote_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get a specific board vote by ID with all vote details.
    Requires authentication.
    """
    vote = db.query(BoardVote).filter(BoardVote.id == vote_id).first()

    if not vote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board vote with ID {vote_id} not found",
        )

    return vote


@router.post("/", response_model=BoardVoteResponse, status_code=status.HTTP_201_CREATED)
async def create_board_vote(
    vote_data: BoardVoteCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new board vote with optional vote details.
    Requires authentication.
    """
    # Check if vote_id already exists
    existing_vote = db.query(BoardVote).filter(BoardVote.vote_id == vote_data.vote_id).first()

    if existing_vote:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Board vote with ID '{vote_data.vote_id}' already exists",
        )

    # Extract vote details from request
    vote_details_data = vote_data.vote_details or []

    # Create board vote (without vote_details in the dict)
    vote_dict = vote_data.model_dump(exclude={"vote_details"})
    board_vote = BoardVote(**vote_dict)

    db.add(board_vote)
    db.flush()  # Flush to get the ID

    # Create vote details if provided
    for detail_data in vote_details_data:
        detail = BoardVoteDetail(**detail_data.model_dump(), vote_id=board_vote.id)
        db.add(detail)

    db.commit()
    db.refresh(board_vote)

    logger.info(f"Board vote created: {board_vote.vote_id} - {board_vote.motion_title}")

    return board_vote


@router.patch("/{vote_id}", response_model=BoardVoteResponse)
async def update_board_vote(
    vote_id: UUID,
    vote_data: BoardVoteUpdate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update a board vote by ID.
    Requires authentication.
    """
    board_vote = db.query(BoardVote).filter(BoardVote.id == vote_id).first()

    if not board_vote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board vote with ID {vote_id} not found",
        )

    # Update only provided fields
    update_data = vote_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(board_vote, field, value)

    db.commit()
    db.refresh(board_vote)

    logger.info(f"Board vote updated: {board_vote.vote_id} - {board_vote.motion_title}")

    return board_vote


@router.delete("/{vote_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board_vote(
    vote_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Delete a board vote by ID (cascade deletes all vote details).
    Requires authentication.
    """
    board_vote = db.query(BoardVote).filter(BoardVote.id == vote_id).first()

    if not board_vote:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Board vote with ID {vote_id} not found",
        )

    db.delete(board_vote)
    db.commit()

    logger.info(f"Board vote deleted: {board_vote.vote_id} - {board_vote.motion_title}")
