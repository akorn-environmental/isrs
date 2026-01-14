"""
Contact and organization enrichment API endpoints.
Uses Apollo.io API for data enrichment.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
import logging

from app.database import get_db
from app.models.conference import AttendeeProfile
from app.routers.auth import get_current_user
from app.services.apollo_service import ApolloService, ApolloAPIError

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response schemas
class EnrichPersonRequest(BaseModel):
    """Request schema for person enrichment."""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    organization_name: Optional[str] = None
    domain: Optional[str] = None


class EnrichOrganizationRequest(BaseModel):
    """Request schema for organization enrichment."""
    domain: Optional[str] = None
    organization_name: Optional[str] = None


class BulkEnrichRequest(BaseModel):
    """Request schema for bulk person enrichment."""
    contacts: List[EnrichPersonRequest] = Field(..., max_items=50, description="Max 50 contacts per request")


@router.post("/enrich-person")
async def enrich_person(
    request: EnrichPersonRequest,
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Enrich a person's contact information using Apollo.io.

    Requires at least one identifier (email recommended for best results).
    Returns enriched data including social profiles, employment history, etc.

    Requires authentication.
    """
    try:
        if not any([request.email, request.first_name, request.organization_name]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one search parameter required (email, first_name, or organization_name)"
            )

        apollo_service = ApolloService()
        enriched_data = await apollo_service.enrich_person(
            email=request.email,
            first_name=request.first_name,
            last_name=request.last_name,
            organization_name=request.organization_name,
            domain=request.domain,
        )

        logger.info(f"Person enriched: {request.email or f'{request.first_name} {request.last_name}'}")

        return enriched_data

    except ApolloAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error enriching person: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enrich person: {str(e)}"
        )


@router.post("/enrich-organization")
async def enrich_organization(
    request: EnrichOrganizationRequest,
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Enrich an organization's information using Apollo.io.

    Requires either domain or organization name.
    Returns enriched data including industry, size, location, etc.

    Requires authentication.
    """
    try:
        if not request.domain and not request.organization_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Either domain or organization_name required"
            )

        apollo_service = ApolloService()
        enriched_data = await apollo_service.enrich_organization(
            domain=request.domain,
            organization_name=request.organization_name,
        )

        logger.info(f"Organization enriched: {request.domain or request.organization_name}")

        return enriched_data

    except ApolloAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error enriching organization: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enrich organization: {str(e)}"
        )


@router.post("/bulk-enrich")
async def bulk_enrich_contacts(
    request: BulkEnrichRequest,
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Enrich multiple contacts in bulk.

    Processes up to 50 contacts per request.
    Returns array of enrichment results with success/failure status for each.

    Requires authentication.
    """
    try:
        if len(request.contacts) > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 50 contacts per request"
            )

        # Convert Pydantic models to dicts
        contacts_data = [contact.model_dump() for contact in request.contacts]

        apollo_service = ApolloService()
        results = await apollo_service.bulk_enrich_people(contacts_data)

        successful = sum(1 for r in results if r['enriched'].get('success'))
        failed = len(results) - successful

        logger.info(f"Bulk enrichment completed: {successful} successful, {failed} failed")

        return {
            'success': True,
            'total': len(results),
            'successful': successful,
            'failed': failed,
            'results': results,
        }

    except ApolloAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error in bulk enrichment: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to enrich contacts: {str(e)}"
        )


@router.post("/search-people")
async def search_people(
    person_titles: Optional[List[str]] = None,
    person_locations: Optional[List[str]] = None,
    organization_domains: Optional[List[str]] = None,
    organization_names: Optional[List[str]] = None,
    page: int = 1,
    per_page: int = 25,
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Search for people using Apollo.io search API.

    Supports filtering by job titles, locations, and organizations.
    Returns paginated search results.

    Requires authentication.
    """
    try:
        apollo_service = ApolloService()
        results = await apollo_service.search_people(
            person_titles=person_titles,
            person_locations=person_locations,
            organization_domains=organization_domains,
            organization_names=organization_names,
            page=page,
            per_page=per_page,
        )

        logger.info(f"People search completed: {results.get('total_entries', 0)} results")

        return results

    except ApolloAPIError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error searching people: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to search people: {str(e)}"
        )
