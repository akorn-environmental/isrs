"""
Statistics and dashboard metrics endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from app.database import get_db
from app.auth import require_admin

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    admin_user: dict = Depends(require_admin)
):
    """
    Get dashboard statistics for admin portal
    """
    try:
        # Total contacts
        contacts_result = db.execute(text("SELECT COUNT(*) FROM contacts"))
        total_contacts = contacts_result.scalar() or 0

        # Total organizations
        orgs_result = db.execute(text("SELECT COUNT(*) FROM organizations"))
        total_organizations = orgs_result.scalar() or 0

        # Total conferences
        conf_result = db.execute(text("SELECT COUNT(*) FROM conferences"))
        total_conferences = conf_result.scalar() or 0

        # Total funding prospects
        funding_result = db.execute(text("SELECT COUNT(*) FROM funding_prospects"))
        total_funding = funding_result.scalar() or 0

        # Recent contacts (last 10)
        recent_contacts_query = text("""
            SELECT
                first_name,
                last_name,
                email,
                organization_id,
                created_at
            FROM contacts
            ORDER BY created_at DESC
            LIMIT 10
        """)
        recent_contacts_result = db.execute(recent_contacts_query)
        recent_contacts = []

        for row in recent_contacts_result:
            recent_contacts.append({
                "first_name": row[0],
                "last_name": row[1],
                "email": row[2],
                "organization_id": row[3],
                "created_at": str(row[4]) if row[4] else None
            })

        # Active conferences (upcoming or recent)
        active_conf_query = text("""
            SELECT
                id,
                name,
                year,
                location,
                start_date,
                end_date
            FROM conferences
            WHERE start_date >= CURRENT_DATE - INTERVAL '6 months'
            ORDER BY start_date DESC
            LIMIT 5
        """)
        active_conf_result = db.execute(active_conf_query)
        active_conferences = []

        for row in active_conf_result:
            active_conferences.append({
                "id": row[0],
                "name": row[1],
                "year": row[2],
                "location": row[3],
                "start_date": str(row[4]) if row[4] else None,
                "end_date": str(row[5]) if row[5] else None
            })

        return {
            "success": True,
            "stats": {
                "total_contacts": total_contacts,
                "total_organizations": total_organizations,
                "total_conferences": total_conferences,
                "total_funding": total_funding,
                "recent_contacts": recent_contacts,
                "active_conferences": active_conferences
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "stats": {
                "total_contacts": 0,
                "total_organizations": 0,
                "total_conferences": 0,
                "total_funding": 0,
                "recent_contacts": [],
                "active_conferences": []
            }
        }
