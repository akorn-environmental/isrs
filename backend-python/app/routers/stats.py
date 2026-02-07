"""
Statistics and dashboard metrics endpoints
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text, func
from app.database import get_db
from app.dependencies.permissions import get_current_admin
from app.models import Contact, ParsedEmail
from datetime import datetime
import calendar

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("/")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
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


@router.get("/contacts")
async def get_contact_statistics(
    db: Session = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    """
    Get contact statistics for dashboard cards
    """
    try:
        # Get current month/year
        now = datetime.utcnow()
        current_month = now.month
        current_year = now.year

        # Calculate previous month
        if current_month == 1:
            prev_month = 12
            prev_year = current_year - 1
        else:
            prev_month = current_month - 1
            prev_year = current_year

        # Total contacts
        total_contacts = db.query(func.count(Contact.id)).scalar() or 0

        # Total contacts last month (for comparison)
        last_day_prev_month = calendar.monthrange(prev_year, prev_month)[1]
        end_of_prev_month = datetime(prev_year, prev_month, last_day_prev_month, 23, 59, 59)
        total_contacts_prev_month = db.query(func.count(Contact.id)).filter(
            Contact.created_at <= end_of_prev_month
        ).scalar() or 0

        # Calculate percentage change
        if total_contacts_prev_month > 0:
            total_contacts_change = round(
                ((total_contacts - total_contacts_prev_month) / total_contacts_prev_month) * 100, 1
            )
        else:
            total_contacts_change = 100.0 if total_contacts > 0 else 0.0

        # New contacts this month
        first_day_current_month = datetime(current_year, current_month, 1)
        new_this_month = db.query(func.count(Contact.id)).filter(
            Contact.created_at >= first_day_current_month
        ).scalar() or 0

        # New contacts last month (for comparison)
        first_day_prev_month = datetime(prev_year, prev_month, 1)
        new_last_month = db.query(func.count(Contact.id)).filter(
            Contact.created_at >= first_day_prev_month,
            Contact.created_at <= end_of_prev_month
        ).scalar() or 0

        # Calculate percentage change
        if new_last_month > 0:
            new_contacts_change = round(((new_this_month - new_last_month) / new_last_month) * 100, 1)
        else:
            new_contacts_change = 100.0 if new_this_month > 0 else 0.0

        # Unique tags/groups
        contacts_with_tags = db.query(Contact.tags).filter(Contact.tags.isnot(None)).all()
        unique_tags = set()
        for (tags,) in contacts_with_tags:
            if tags:
                unique_tags.update(tags)
        unique_tags_count = len(unique_tags)

        # Emails parsed (total)
        emails_parsed = db.query(func.count(ParsedEmail.id)).scalar() or 0

        # Emails parsed last month (for comparison)
        emails_parsed_prev_month = db.query(func.count(ParsedEmail.id)).filter(
            ParsedEmail.date <= end_of_prev_month
        ).scalar() or 0

        # Calculate percentage change
        if emails_parsed_prev_month > 0:
            emails_parsed_change = round(
                ((emails_parsed - emails_parsed_prev_month) / emails_parsed_prev_month) * 100, 1
            )
        else:
            emails_parsed_change = 100.0 if emails_parsed > 0 else 0.0

        return {
            "success": True,
            "stats": {
                "total_contacts": total_contacts,
                "total_contacts_change": total_contacts_change,
                "new_this_month": new_this_month,
                "new_contacts_change": new_contacts_change,
                "unique_tags": unique_tags_count,
                "emails_parsed": emails_parsed,
                "emails_parsed_change": emails_parsed_change,
            }
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "stats": {
                "total_contacts": 0,
                "total_contacts_change": 0.0,
                "new_this_month": 0,
                "new_contacts_change": 0.0,
                "unique_tags": 0,
                "emails_parsed": 0,
                "emails_parsed_change": 0.0,
            }
        }
