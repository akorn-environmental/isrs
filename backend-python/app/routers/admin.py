"""
Admin router for user management and audit logs.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import text, desc
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
import logging

from app.database import get_db
from app.models.conference import AttendeeProfile
from app.models.system import AuditLog
from app.dependencies.permissions import get_current_admin

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# Pydantic Models
# ============================================================================

class RoleInfo(BaseModel):
    """Role information."""
    id: str
    name: str
    display_name: Optional[str] = None
    description: Optional[str] = None


class UserRoleInfo(BaseModel):
    """User role assignment."""
    role_id: str
    role_name: str
    role_display_name: Optional[str] = None
    assigned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None
    is_active: bool = True
    active_from: Optional[datetime] = None
    active_until: Optional[datetime] = None


class UserInfo(BaseModel):
    """User information for admin view."""
    id: str
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    full_name: Optional[str] = None
    organization_name: Optional[str] = None
    country: Optional[str] = None
    created_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    is_active: bool = True
    roles: List[UserRoleInfo] = []


class UsersListResponse(BaseModel):
    """Response for users list."""
    success: bool
    data: List[UserInfo]
    total: int
    page: int
    page_size: int


class RolesListResponse(BaseModel):
    """Response for roles list."""
    success: bool
    data: List[RoleInfo]


class AssignRoleRequest(BaseModel):
    """Request to assign a role to a user."""
    user_id: str
    role_id: str
    active_from: Optional[datetime] = None
    active_until: Optional[datetime] = None


class RevokeRoleRequest(BaseModel):
    """Request to revoke a role from a user."""
    user_id: str
    role_id: str


class AuditLogEntry(BaseModel):
    """Audit log entry."""
    id: str
    table_name: Optional[str] = None
    record_id: Optional[str] = None
    action: Optional[str] = None
    changed_by: Optional[str] = None
    changes: Optional[dict] = None
    created_at: Optional[datetime] = None


class AuditLogsResponse(BaseModel):
    """Response for audit logs list."""
    success: bool
    data: List[AuditLogEntry]
    total: int
    page: int
    page_size: int


# ============================================================================
# User Management Endpoints
# ============================================================================

@router.get("/users", response_model=UsersListResponse)
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, max_length=100),
    role: Optional[str] = Query(None, description="Filter by role name"),
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    List all users with their roles.

    Requires admin privileges.
    """
    offset = (page - 1) * page_size

    # Build base query
    base_query = """
        SELECT DISTINCT
            ap.id,
            ap.email,
            ap.first_name,
            ap.last_name,
            ap.organization_name,
            ap.country,
            ap.created_at,
            ap.last_activity as last_login
        FROM attendee_profiles ap
    """

    count_query = "SELECT COUNT(DISTINCT ap.id) FROM attendee_profiles ap"

    # Add role filter if specified
    if role:
        base_query += """
            JOIN user_roles ur ON ap.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.name = :role AND ur.is_active = true AND ur.revoked_at IS NULL
        """
        count_query += """
            JOIN user_roles ur ON ap.id = ur.user_id
            JOIN roles r ON ur.role_id = r.id
            WHERE r.name = :role AND ur.is_active = true AND ur.revoked_at IS NULL
        """
    else:
        base_query += " WHERE 1=1"
        count_query += " WHERE 1=1"

    # Add search filter
    if search:
        search_filter = """
            AND (
                ap.email ILIKE :search
                OR ap.first_name ILIKE :search
                OR ap.last_name ILIKE :search
                OR ap.organization_name ILIKE :search
            )
        """
        base_query += search_filter
        count_query += search_filter

    # Add ordering and pagination
    base_query += " ORDER BY ap.created_at DESC LIMIT :limit OFFSET :offset"

    # Execute queries
    params = {
        "limit": page_size,
        "offset": offset,
        "search": f"%{search}%" if search else None,
        "role": role
    }

    # Get total count
    total_result = db.execute(text(count_query), params).scalar()
    total = total_result or 0

    # Get users
    users_result = db.execute(text(base_query), params).fetchall()

    users = []
    for row in users_result:
        # Get roles for this user
        roles_query = """
            SELECT
                r.id, r.name, r.display_name,
                ur.created_at as assigned_at,
                ur.is_active,
                ur.active_from,
                ur.active_until
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = :user_id
              AND ur.revoked_at IS NULL
            ORDER BY r.name
        """
        roles_result = db.execute(text(roles_query), {"user_id": row.id}).fetchall()

        user_roles = [
            UserRoleInfo(
                role_id=str(r.id),
                role_name=r.name,
                role_display_name=r.display_name,
                assigned_at=r.assigned_at,
                is_active=r.is_active,
                active_from=r.active_from,
                active_until=r.active_until
            )
            for r in roles_result
        ]

        users.append(UserInfo(
            id=str(row.id),
            email=row.email or "",
            first_name=row.first_name,
            last_name=row.last_name,
            full_name=f"{row.first_name or ''} {row.last_name or ''}".strip() or None,
            organization_name=row.organization_name,
            country=row.country,
            created_at=row.created_at,
            last_login=row.last_login,
            is_active=True,
            roles=user_roles
        ))

    return UsersListResponse(
        success=True,
        data=users,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/users/{user_id}", response_model=dict)
async def get_user(
    user_id: UUID,
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed user information.

    Requires admin privileges.
    """
    # Get user
    user = db.query(AttendeeProfile).filter(AttendeeProfile.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {user_id} not found"
        )

    # Get roles
    roles_query = """
        SELECT
            r.id, r.name, r.display_name, r.description,
            ur.created_at as assigned_at,
            ur.assigned_by,
            ur.is_active,
            ur.active_from,
            ur.active_until
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = :user_id
          AND ur.revoked_at IS NULL
        ORDER BY r.name
    """
    roles_result = db.execute(text(roles_query), {"user_id": user_id}).fetchall()

    user_roles = [
        {
            "role_id": str(r.id),
            "role_name": r.name,
            "role_display_name": r.display_name,
            "description": r.description,
            "assigned_at": r.assigned_at.isoformat() if r.assigned_at else None,
            "assigned_by": r.assigned_by,
            "is_active": r.is_active,
            "active_from": r.active_from.isoformat() if r.active_from else None,
            "active_until": r.active_until.isoformat() if r.active_until else None
        }
        for r in roles_result
    ]

    return {
        "success": True,
        "data": {
            "id": str(user.id),
            "email": user.email or "",
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": f"{user.first_name or ''} {user.last_name or ''}".strip() or None,
            "organization_name": user.organization_name,
            "position": user.position,
            "department": user.department,
            "country": user.country,
            "city": user.city,
            "phone": user.phone,
            "bio": user.bio,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "last_activity": user.last_activity.isoformat() if user.last_activity else None,
            "directory_opt_in": user.directory_opt_in,
            "roles": user_roles
        }
    }


@router.get("/roles", response_model=RolesListResponse)
async def list_roles(
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    List all available roles.

    Requires admin privileges.
    """
    roles_query = """
        SELECT id, name, display_name, description
        FROM roles
        ORDER BY name
    """
    roles_result = db.execute(text(roles_query)).fetchall()

    roles = [
        RoleInfo(
            id=str(r.id),
            name=r.name,
            display_name=r.display_name,
            description=r.description
        )
        for r in roles_result
    ]

    return RolesListResponse(success=True, data=roles)


@router.post("/users/assign-role")
async def assign_role(
    request: AssignRoleRequest,
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Assign a role to a user.

    Requires admin privileges.
    """
    # Check if user exists
    user = db.query(AttendeeProfile).filter(
        AttendeeProfile.id == request.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {request.user_id} not found"
        )

    # Check if role exists
    role_check = db.execute(
        text("SELECT id, name FROM roles WHERE id = :role_id"),
        {"role_id": request.role_id}
    ).fetchone()

    if not role_check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role {request.role_id} not found"
        )

    # Check if assignment already exists
    existing = db.execute(
        text("""
            SELECT id FROM user_roles
            WHERE user_id = :user_id AND role_id = :role_id AND revoked_at IS NULL
        """),
        {"user_id": request.user_id, "role_id": request.role_id}
    ).fetchone()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has this role"
        )

    # Create assignment
    db.execute(
        text("""
            INSERT INTO user_roles (user_id, role_id, assigned_by, is_active, active_from, active_until, created_at)
            VALUES (:user_id, :role_id, :assigned_by, true, :active_from, :active_until, NOW())
        """),
        {
            "user_id": request.user_id,
            "role_id": request.role_id,
            "assigned_by": str(current_admin.id),
            "active_from": request.active_from,
            "active_until": request.active_until
        }
    )
    db.commit()

    logger.info(f"Role {role_check.name} assigned to user {user.email} by {current_admin.email}")

    return {
        "success": True,
        "message": f"Role '{role_check.name}' assigned to user"
    }


@router.post("/users/revoke-role")
async def revoke_role(
    request: RevokeRoleRequest,
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Revoke a role from a user.

    Requires admin privileges.
    """
    # Check if assignment exists
    assignment = db.execute(
        text("""
            SELECT ur.id, r.name as role_name
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = :user_id AND ur.role_id = :role_id AND ur.revoked_at IS NULL
        """),
        {"user_id": request.user_id, "role_id": request.role_id}
    ).fetchone()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role assignment not found"
        )

    # Revoke the role
    db.execute(
        text("""
            UPDATE user_roles
            SET revoked_at = NOW(), revoked_by = :revoked_by, is_active = false
            WHERE user_id = :user_id AND role_id = :role_id AND revoked_at IS NULL
        """),
        {
            "user_id": request.user_id,
            "role_id": request.role_id,
            "revoked_by": str(current_admin.id)
        }
    )
    db.commit()

    logger.info(f"Role {assignment.role_name} revoked from user {request.user_id} by {current_admin.email}")

    return {
        "success": True,
        "message": f"Role '{assignment.role_name}' revoked from user"
    }


# ============================================================================
# Audit Log Endpoints
# ============================================================================

@router.get("/audit-logs", response_model=AuditLogsResponse)
async def list_audit_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    table_name: Optional[str] = Query(None, description="Filter by table name"),
    action: Optional[str] = Query(None, description="Filter by action (INSERT/UPDATE/DELETE)"),
    changed_by: Optional[str] = Query(None, description="Filter by user who made the change"),
    start_date: Optional[datetime] = Query(None, description="Filter from date"),
    end_date: Optional[datetime] = Query(None, description="Filter to date"),
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    List audit log entries with filtering.

    Requires admin privileges.
    """
    offset = (page - 1) * page_size

    # Build query
    query = db.query(AuditLog)

    if table_name:
        query = query.filter(AuditLog.table_name == table_name)
    if action:
        query = query.filter(AuditLog.action == action)
    if changed_by:
        query = query.filter(AuditLog.changed_by.ilike(f"%{changed_by}%"))
    if start_date:
        query = query.filter(AuditLog.created_at >= start_date)
    if end_date:
        query = query.filter(AuditLog.created_at <= end_date)

    # Get total count
    total = query.count()

    # Get paginated results
    logs = query.order_by(desc(AuditLog.created_at)).offset(offset).limit(page_size).all()

    log_entries = [
        AuditLogEntry(
            id=str(log.id),
            table_name=log.table_name,
            record_id=str(log.record_id) if log.record_id else None,
            action=log.action,
            changed_by=log.changed_by,
            changes=log.changes,
            created_at=log.created_at
        )
        for log in logs
    ]

    return AuditLogsResponse(
        success=True,
        data=log_entries,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/audit-logs/tables")
async def get_audit_tables(
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get list of tables that have audit entries.

    Requires admin privileges.
    """
    result = db.execute(
        text("SELECT DISTINCT table_name FROM audit_log WHERE table_name IS NOT NULL ORDER BY table_name")
    ).fetchall()

    return {
        "success": True,
        "data": [row.table_name for row in result]
    }


@router.get("/audit-logs/actions")
async def get_audit_actions(
    current_admin: AttendeeProfile = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get list of action types in audit log.

    Requires admin privileges.
    """
    result = db.execute(
        text("SELECT DISTINCT action FROM audit_log WHERE action IS NOT NULL ORDER BY action")
    ).fetchall()

    return {
        "success": True,
        "data": [row.action for row in result]
    }
