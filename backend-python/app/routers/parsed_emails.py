"""
Parsed Emails Router - Admin API for managing parsed emails
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from typing import List, Optional
from pydantic import BaseModel
import logging
from nameparser import HumanName

from app.database import get_db
from app.models.parsed_email import ParsedEmail
from app.models.contact import Contact, Organization
from app.routers.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models
class EmailStatusUpdate(BaseModel):
    status: str


class BulkStatusUpdate(BaseModel):
    email_ids: List[int]
    status: str


class BulkDelete(BaseModel):
    email_ids: List[int]


@router.get("/parsed-emails")
async def get_parsed_emails(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    requires_review: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get paginated list of parsed emails with filtering
    """
    try:
        # Check if table exists by attempting a simple query
        try:
            query = db.query(ParsedEmail)
        except Exception as table_error:
            logger.error(f"ParsedEmail table may not exist: {str(table_error)}", exc_info=True)
            # Return empty result if table doesn't exist
            return {
                "items": [],
                "total": 0,
                "page": page,
                "page_size": page_size,
                "total_pages": 0
            }

        # Apply filters
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    ParsedEmail.from_email.ilike(search_term),
                    ParsedEmail.subject.ilike(search_term),
                    ParsedEmail.body_text.ilike(search_term)
                )
            )

        if status:
            query = query.filter(ParsedEmail.status == status)

        if requires_review is not None:
            query = query.filter(ParsedEmail.requires_review == requires_review)

        # Get total count
        total = query.count()

        # Apply pagination and ordering
        emails = query.order_by(desc(ParsedEmail.created_at)).offset((page - 1) * page_size).limit(page_size).all()

        # Format response
        items = []
        for email in emails:
            items.append({
                "id": email.id,
                "message_id": email.message_id,
                "from_email": email.from_email,
                "subject": email.subject,
                "date": email.date.isoformat() if email.date else None,
                "overall_confidence": email.overall_confidence,
                "status": email.status,
                "requires_review": email.requires_review,
                "created_at": email.created_at.isoformat() if email.created_at else None
            })

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }

    except Exception as e:
        logger.error(f"Error fetching parsed emails: {str(e)}", exc_info=True)
        # Return empty result instead of 500 error for better UX
        return {
            "items": [],
            "total": 0,
            "page": page,
            "page_size": page_size,
            "total_pages": 0
        }


@router.get("/parsed-emails/{email_id}")
async def get_parsed_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information for a specific parsed email
    """
    try:
        email = db.query(ParsedEmail).filter(ParsedEmail.id == email_id).first()

        if not email:
            raise HTTPException(status_code=404, detail="Email not found")

        return {
            "id": email.id,
            "message_id": email.message_id,
            "s3_key": email.s3_key,
            "from_email": email.from_email,
            "to_emails": email.to_emails,
            "cc_emails": email.cc_emails,
            "subject": email.subject,
            "date": email.date.isoformat() if email.date else None,
            "body_text": email.body_text,
            "body_html": email.body_html,
            "attachments": email.attachments,
            "extracted_contacts": email.extracted_contacts,
            "action_items": email.action_items,
            "topics": email.topics,
            "overall_confidence": email.overall_confidence,
            "status": email.status,
            "requires_review": email.requires_review,
            "reviewed_by": email.reviewed_by,
            "reviewed_at": email.reviewed_at.isoformat() if email.reviewed_at else None,
            "email_metadata": email.email_metadata,
            "error_message": email.error_message,
            "created_at": email.created_at.isoformat() if email.created_at else None,
            "updated_at": email.updated_at.isoformat() if email.updated_at else None
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching email {email_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to fetch email")


@router.patch("/parsed-emails/{email_id}/status")
async def update_email_status(
    email_id: int,
    update: EmailStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Update the status of a parsed email
    """
    try:
        email = db.query(ParsedEmail).filter(ParsedEmail.id == email_id).first()

        if not email:
            raise HTTPException(status_code=404, detail="Email not found")

        email.status = update.status
        db.commit()

        return JSONResponse(
            content={"message": "Email status updated", "email_id": email_id, "status": update.status},
            status_code=200
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating email status: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update email status")


@router.patch("/parsed-emails/bulk-status")
async def bulk_update_status(
    update: BulkStatusUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Bulk update status for multiple emails
    """
    try:
        db.query(ParsedEmail).filter(ParsedEmail.id.in_(update.email_ids)).update(
            {"status": update.status},
            synchronize_session=False
        )
        db.commit()

        return JSONResponse(
            content={"message": f"Updated {len(update.email_ids)} emails", "count": len(update.email_ids)},
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error bulk updating status: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update emails")


@router.delete("/parsed-emails/{email_id}")
async def delete_email(
    email_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a parsed email
    """
    try:
        email = db.query(ParsedEmail).filter(ParsedEmail.id == email_id).first()

        if not email:
            raise HTTPException(status_code=404, detail="Email not found")

        db.delete(email)
        db.commit()

        return JSONResponse(
            content={"message": "Email deleted", "email_id": email_id},
            status_code=200
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting email: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete email")


@router.delete("/parsed-emails/bulk-delete")
async def bulk_delete_emails(
    delete: BulkDelete,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Bulk delete multiple emails
    """
    try:
        db.query(ParsedEmail).filter(ParsedEmail.id.in_(delete.email_ids)).delete(
            synchronize_session=False
        )
        db.commit()

        return JSONResponse(
            content={"message": f"Deleted {len(delete.email_ids)} emails", "count": len(delete.email_ids)},
            status_code=200
        )

    except Exception as e:
        logger.error(f"Error bulk deleting: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to delete emails")


@router.post("/parsed-emails/{email_id}/approve-contact/{contact_index}")
async def approve_contact(
    email_id: int,
    contact_index: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Approve an extracted contact and add to contacts database
    """
    try:
        email = db.query(ParsedEmail).filter(ParsedEmail.id == email_id).first()

        if not email:
            raise HTTPException(status_code=404, detail="Email not found")

        if not email.extracted_contacts or contact_index >= len(email.extracted_contacts):
            raise HTTPException(status_code=400, detail="Invalid contact index")

        contact_data = email.extracted_contacts[contact_index]

        # Check if contact already exists
        existing_contact = db.query(Contact).filter(
            Contact.email == contact_data.get('email')
        ).first()

        if existing_contact:
            return JSONResponse(
                content={"message": "Contact already exists in database", "contact_id": existing_contact.id},
                status_code=200
            )

        # Find or create organization first
        organization_id = None
        if contact_data.get('organization'):
            org_name = contact_data.get('organization')

            # Check if organization exists
            org = db.query(Organization).filter(
                Organization.name == org_name
            ).first()

            if not org:
                # Create new organization
                org = Organization(name=org_name)
                db.add(org)
                db.commit()
                db.refresh(org)

            organization_id = org.id

        # Parse name intelligently using nameparser
        full_name = contact_data.get('name', '')
        parsed_name = HumanName(full_name) if full_name else HumanName('')

        # Create new contact
        new_contact = Contact(
            first_name=parsed_name.first,
            last_name=parsed_name.last,
            full_name=full_name,
            email=contact_data.get('email'),
            organization_id=organization_id,  # FIXED: Use organization_id instead of organization_name
            title=contact_data.get('role'),
            notes=f"Added from parsed email ID {email_id} with {contact_data.get('confidence', 0)}% confidence"
        )

        db.add(new_contact)
        db.commit()
        db.refresh(new_contact)

        return JSONResponse(
            content={"message": "Contact added to database", "contact_id": new_contact.id},
            status_code=200
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving contact: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to approve contact")
