"""
Apollo.io Enrichment Router
Endpoints for contact/org enrichment and prospecting
"""
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
import logging

from app.database import get_db
from app.models.contact import Contact
from app.models.organization import Organization
from app.dependencies.permissions import get_current_user
from app.models.conference import AttendeeProfile
from app.services.apollo_service import ApolloService, ApolloAPIError

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================================================
# Pydantic Models
# ============================================================================

class EnrichContactRequest(BaseModel):
    """Request to enrich a single contact"""
    contact_id: UUID


class EnrichOrganizationRequest(BaseModel):
    """Request to enrich an organization"""
    organization_id: UUID


class SearchPeopleRequest(BaseModel):
    """Request to search for people (prospecting)"""
    keywords: Optional[List[str]] = None
    job_titles: Optional[List[str]] = None
    organization_types: Optional[List[str]] = None
    seniorities: Optional[List[str]] = None
    page: int = 1
    per_page: int = 25


class EnrichmentResponse(BaseModel):
    """Response from enrichment"""
    success: bool
    message: str
    enriched_fields: Optional[List[str]] = None
    apollo_id: Optional[str] = None


# ============================================================================
# Contact Enrichment Endpoints
# ============================================================================

@router.post("/contacts/{contact_id}/enrich", response_model=EnrichmentResponse)
async def enrich_contact(
    contact_id: UUID,
    background_tasks: BackgroundTasks,
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enrich a single contact with Apollo.io data

    Adds: email, phone, social profiles, job title, organization info
    """
    try:
        # Get contact
        contact = db.query(Contact).filter(Contact.id == contact_id).first()
        if not contact:
            raise HTTPException(status_code=404, detail="Contact not found")

        # Initialize Apollo service
        apollo = ApolloService()

        # Enrich contact
        logger.info(f"[Enrichment] Enriching contact {contact.id}: {contact.email}")

        result = await apollo.enrich_person(
            email=contact.email,
            first_name=contact.first_name,
            last_name=contact.last_name,
            organization_name=contact.organization_name
        )

        if not result.get('success'):
            raise HTTPException(status_code=400, detail=result.get('error', 'Enrichment failed'))

        # Update contact with enriched data
        enriched_fields = []

        if result.get('phone') and not contact.phone:
            contact.phone = result['phone']
            enriched_fields.append('phone')

        if result.get('title') and not contact.title:
            contact.title = result['title']
            enriched_fields.append('title')

        if result.get('linkedin_url') and not contact.linkedin:
            contact.linkedin = result['linkedin_url']
            enriched_fields.append('linkedin')

        if result.get('twitter_url') and not contact.twitter:
            contact.twitter = result['twitter_url']
            enriched_fields.append('twitter')

        # Store Apollo ID in notes/metadata
        if result.get('apollo_id'):
            if not contact.notes:
                contact.notes = f"Apollo ID: {result['apollo_id']}"
            elif 'Apollo ID:' not in contact.notes:
                contact.notes += f"\nApollo ID: {result['apollo_id']}"

        db.commit()

        logger.info(f"[Enrichment] Successfully enriched {len(enriched_fields)} fields for contact {contact.id}")

        return EnrichmentResponse(
            success=True,
            message=f"Enriched {len(enriched_fields)} fields",
            enriched_fields=enriched_fields,
            apollo_id=result.get('apollo_id')
        )

    except ApolloAPIError as e:
        logger.error(f"[Enrichment] Apollo API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Apollo API error: {str(e)}")
    except Exception as e:
        logger.error(f"[Enrichment] Error enriching contact: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/contacts/bulk-enrich")
async def bulk_enrich_contacts(
    background_tasks: BackgroundTasks,
    limit: int = Query(100, le=1000),
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Bulk enrich contacts that are missing data

    Runs in background to avoid timeout
    """
    try:
        # Find contacts missing phone or title
        contacts = db.query(Contact).filter(
            (Contact.phone == None) | (Contact.title == None)
        ).filter(
            Contact.email != None
        ).limit(limit).all()

        if not contacts:
            return {
                "success": True,
                "message": "No contacts need enrichment",
                "total": 0
            }

        # Queue background enrichment
        background_tasks.add_task(
            _bulk_enrich_task,
            [c.id for c in contacts],
            db
        )

        return {
            "success": True,
            "message": f"Queued {len(contacts)} contacts for enrichment",
            "total": len(contacts)
        }

    except Exception as e:
        logger.error(f"[Bulk Enrichment] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def _bulk_enrich_task(contact_ids: List[UUID], db: Session):
    """Background task for bulk enrichment"""
    apollo = ApolloService()

    for contact_id in contact_ids:
        try:
            contact = db.query(Contact).filter(Contact.id == contact_id).first()
            if not contact:
                continue

            result = await apollo.enrich_person(
                email=contact.email,
                first_name=contact.first_name,
                last_name=contact.last_name
            )

            if result.get('success'):
                # Update contact
                if result.get('phone') and not contact.phone:
                    contact.phone = result['phone']
                if result.get('title') and not contact.title:
                    contact.title = result['title']
                if result.get('linkedin_url') and not contact.linkedin:
                    contact.linkedin = result['linkedin_url']

                db.commit()
                logger.info(f"[Bulk Enrichment] Enriched contact {contact.id}")

        except Exception as e:
            logger.error(f"[Bulk Enrichment] Failed for contact {contact_id}: {str(e)}")
            continue


# ============================================================================
# Organization Enrichment Endpoints
# ============================================================================

@router.post("/organizations/{org_id}/enrich", response_model=EnrichmentResponse)
async def enrich_organization(
    org_id: UUID,
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enrich an organization with Apollo.io data

    Adds: industry, size, social profiles, description
    """
    try:
        # Get organization
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")

        # Extract domain from website
        domain = None
        if org.website:
            # Simple domain extraction
            domain = org.website.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0]

        if not domain:
            raise HTTPException(status_code=400, detail="Organization must have a website/domain")

        # Initialize Apollo service
        apollo = ApolloService()

        # Enrich organization
        result = await apollo.enrich_organization(domain)

        if not result.get('success'):
            raise HTTPException(status_code=400, detail=result.get('error', 'Enrichment failed'))

        # Update organization with enriched data
        enriched_fields = []

        if result.get('industry') and not org.industry:
            org.industry = result['industry']
            enriched_fields.append('industry')

        if result.get('linkedin_url') and not org.linkedin:
            org.linkedin = result['linkedin_url']
            enriched_fields.append('linkedin')

        if result.get('twitter_url') and not org.twitter:
            org.twitter = result['twitter_url']
            enriched_fields.append('twitter')

        # Store Apollo ID and additional data in notes
        if result.get('apollo_id'):
            org.notes = org.notes or ''
            if 'Apollo ID:' not in org.notes:
                org.notes += f"\nApollo ID: {result['apollo_id']}"
            if result.get('size'):
                org.notes += f"\nEstimated Size: {result['size']} employees"

        db.commit()

        logger.info(f"[Enrichment] Successfully enriched {len(enriched_fields)} fields for org {org.id}")

        return EnrichmentResponse(
            success=True,
            message=f"Enriched {len(enriched_fields)} fields",
            enriched_fields=enriched_fields,
            apollo_id=result.get('apollo_id')
        )

    except ApolloAPIError as e:
        logger.error(f"[Enrichment] Apollo API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Apollo API error: {str(e)}")
    except Exception as e:
        logger.error(f"[Enrichment] Error enriching organization: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Prospecting Endpoints
# ============================================================================

@router.post("/prospects/search")
async def search_prospects(
    request: SearchPeopleRequest,
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search for people matching criteria (prospecting)

    Use for: conference outreach, fundraising, membership recruitment
    """
    try:
        apollo = ApolloService()

        result = await apollo.search_people(
            keywords=request.keywords,
            job_titles=request.job_titles,
            organization_types=request.organization_types,
            seniorities=request.seniorities,
            page=request.page,
            per_page=request.per_page
        )

        if not result.get('success'):
            raise HTTPException(status_code=400, detail=result.get('error', 'Search failed'))

        return {
            "success": True,
            "prospects": result.get('people', []),
            "total": result.get('total', 0),
            "page": result.get('page', 1),
            "per_page": result.get('per_page', 25)
        }

    except ApolloAPIError as e:
        logger.error(f"[Prospecting] Apollo API error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Apollo API error: {str(e)}")
    except Exception as e:
        logger.error(f"[Prospecting] Error searching prospects: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/prospects/import")
async def import_prospects(
    apollo_ids: List[str],
    source: str = "apollo_search",
    current_user: AttendeeProfile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Import prospects from Apollo search results into ISRS contacts

    Creates new Contact records for selected prospects
    """
    try:
        apollo = ApolloService()
        imported = []

        for apollo_id in apollo_ids:
            # Fetch full person data
            # Note: Would need to add get_person_by_id method to apollo_service
            # For now, create placeholder

            # Check if contact already exists by Apollo ID in notes
            existing = db.query(Contact).filter(
                Contact.notes.contains(f"Apollo ID: {apollo_id}")
            ).first()

            if existing:
                logger.info(f"[Import] Contact already exists for Apollo ID: {apollo_id}")
                continue

            # Create new contact
            # This is a placeholder - would need full person data from Apollo
            new_contact = Contact(
                email=f"placeholder_{apollo_id}@example.com",  # Replace with real data
                notes=f"Apollo ID: {apollo_id}\nSource: {source}",
                source=source
            )

            db.add(new_contact)
            imported.append(apollo_id)

        db.commit()

        return {
            "success": True,
            "message": f"Imported {len(imported)} prospects",
            "imported_count": len(imported),
            "skipped_count": len(apollo_ids) - len(imported)
        }

    except Exception as e:
        logger.error(f"[Import] Error importing prospects: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Credit & Status Endpoints
# ============================================================================

@router.get("/credits")
async def get_apollo_credits(
    current_user: AttendeeProfile = Depends(get_current_user)
):
    """
    Get remaining Apollo.io API credits

    Shows: email credits, export credits, daily request limit
    """
    try:
        apollo = ApolloService()
        result = await apollo.get_account_credits()

        if not result.get('success'):
            raise HTTPException(status_code=400, detail="Failed to fetch credits")

        return result.get('credits', {})

    except Exception as e:
        logger.error(f"[Credits] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
