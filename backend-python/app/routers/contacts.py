"""
Contacts and Organizations CRUD router.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import Optional, List
import logging
from uuid import UUID

from app.database import get_db
from app.models.contact import Contact, Organization
from app.models.conference import AttendeeProfile
from app.routers.auth import get_current_user
from app.schemas.contact import (
    ContactCreate,
    ContactUpdate,
    ContactResponse,
    ContactListResponse,
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# CONTACTS ENDPOINTS
# ============================================

@router.get("/", response_model=ContactListResponse)
async def get_contacts(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in name, email, organization"),
    role: Optional[str] = Query(None, description="Filter by role"),
    country: Optional[str] = Query(None, description="Filter by country"),
    organization_id: Optional[UUID] = Query(None, description="Filter by organization"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all contacts with pagination, filtering, and search.
    Requires authentication.
    """
    # Build query
    query = db.query(Contact)

    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Contact.first_name.ilike(search_term),
                Contact.last_name.ilike(search_term),
                Contact.full_name.ilike(search_term),
                Contact.email.ilike(search_term),
            )
        )

    # Apply filters
    if role:
        query = query.filter(Contact.role.ilike(f"%{role}%"))

    if country:
        query = query.filter(Contact.country == country)

    if organization_id:
        query = query.filter(Contact.organization_id == organization_id)

    # Apply tags filter
    if tags:
        tag_list = [tag.strip() for tag in tags.split(",")]
        query = query.filter(Contact.tags.overlap(tag_list))

    # Get total count (before filtering invalid emails)
    total = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    contacts_raw = query.order_by(Contact.last_name, Contact.first_name).offset(offset).limit(page_size).all()

    # Filter out contacts with invalid emails to prevent Pydantic validation errors
    # This is a workaround for legacy data with bad email formats
    valid_contacts = []
    for contact in contacts_raw:
        # Check if email is valid (basic check: must contain @ sign)
        if contact.email and '@' in contact.email:
            valid_contacts.append(contact)
        else:
            logger.warning(f"Skipping contact {contact.id} with invalid email: {contact.email}")

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size

    return ContactListResponse(
        contacts=valid_contacts,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/{contact_id}", response_model=ContactResponse)
async def get_contact(
    contact_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get a specific contact by ID.
    Requires authentication.
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {contact_id} not found",
        )

    return contact


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new contact.
    Requires authentication.
    """
    # Check if email already exists
    existing_contact = db.query(Contact).filter(Contact.email == contact_data.email).first()

    if existing_contact:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Contact with email {contact_data.email} already exists",
        )

    # If organization_id provided, verify it exists
    if contact_data.organization_id:
        org = db.query(Organization).filter(Organization.id == contact_data.organization_id).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Organization with ID {contact_data.organization_id} not found",
            )

    # Create contact
    contact = Contact(**contact_data.model_dump())
    db.add(contact)
    db.commit()
    db.refresh(contact)

    logger.info(f"Contact created: {contact.email} (ID: {contact.id})")

    return contact


@router.patch("/{contact_id}", response_model=ContactResponse)
async def update_contact(
    contact_id: UUID,
    contact_data: ContactUpdate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update a contact by ID.
    Requires authentication.
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {contact_id} not found",
        )

    # Update only provided fields
    update_data = contact_data.model_dump(exclude_unset=True)

    # If email is being updated, check for duplicates
    if "email" in update_data and update_data["email"] != contact.email:
        existing_contact = db.query(Contact).filter(Contact.email == update_data["email"]).first()
        if existing_contact:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Contact with email {update_data['email']} already exists",
            )

    # If organization_id is being updated, verify it exists
    if "organization_id" in update_data and update_data["organization_id"]:
        org = db.query(Organization).filter(Organization.id == update_data["organization_id"]).first()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Organization with ID {update_data['organization_id']} not found",
            )

    # Apply updates
    for field, value in update_data.items():
        setattr(contact, field, value)

    db.commit()
    db.refresh(contact)

    logger.info(f"Contact updated: {contact.email} (ID: {contact.id})")

    return contact


@router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(
    contact_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Delete a contact by ID.
    Requires authentication.
    """
    contact = db.query(Contact).filter(Contact.id == contact_id).first()

    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Contact with ID {contact_id} not found",
        )

    db.delete(contact)
    db.commit()

    logger.info(f"Contact deleted: {contact.email} (ID: {contact_id})")


# ============================================
# ORGANIZATIONS ENDPOINTS
# ============================================

@router.get("/organizations/", response_model=List[OrganizationResponse])
async def get_organizations(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=500, description="Maximum records to return"),
    search: Optional[str] = Query(None, description="Search in organization name"),
    type: Optional[str] = Query(None, description="Filter by organization type"),
    country: Optional[str] = Query(None, description="Filter by country"),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get all organizations with filtering and search.
    Requires authentication.
    """
    # Build query
    query = db.query(Organization)

    # Apply search filter
    if search:
        query = query.filter(Organization.name.ilike(f"%{search}%"))

    # Apply filters
    if type:
        query = query.filter(Organization.type == type)

    if country:
        query = query.filter(Organization.country == country)

    # Get results
    organizations = query.order_by(Organization.name).offset(skip).limit(limit).all()

    return organizations


@router.get("/organizations/{organization_id}", response_model=OrganizationResponse)
async def get_organization(
    organization_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get a specific organization by ID.
    Requires authentication.
    """
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization with ID {organization_id} not found",
        )

    return organization


@router.post("/organizations/", response_model=OrganizationResponse, status_code=status.HTTP_201_CREATED)
async def create_organization(
    org_data: OrganizationCreate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new organization.
    Requires authentication.
    """
    # Check if organization name already exists
    existing_org = db.query(Organization).filter(Organization.name == org_data.name).first()

    if existing_org:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Organization with name '{org_data.name}' already exists",
        )

    # Create organization
    organization = Organization(**org_data.model_dump())
    db.add(organization)
    db.commit()
    db.refresh(organization)

    logger.info(f"Organization created: {organization.name} (ID: {organization.id})")

    return organization


@router.patch("/organizations/{organization_id}", response_model=OrganizationResponse)
async def update_organization(
    organization_id: UUID,
    org_data: OrganizationUpdate,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update an organization by ID.
    Requires authentication.
    """
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization with ID {organization_id} not found",
        )

    # Update only provided fields
    update_data = org_data.model_dump(exclude_unset=True)

    # If name is being updated, check for duplicates
    if "name" in update_data and update_data["name"] != organization.name:
        existing_org = db.query(Organization).filter(Organization.name == update_data["name"]).first()
        if existing_org:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Organization with name '{update_data['name']}' already exists",
            )

    # Apply updates
    for field, value in update_data.items():
        setattr(organization, field, value)

    db.commit()
    db.refresh(organization)

    logger.info(f"Organization updated: {organization.name} (ID: {organization.id})")

    return organization


@router.delete("/organizations/{organization_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_organization(
    organization_id: UUID,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Delete an organization by ID.
    Requires authentication.
    """
    organization = db.query(Organization).filter(Organization.id == organization_id).first()

    if not organization:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organization with ID {organization_id} not found",
        )

    # Check if there are contacts associated with this organization
    contact_count = db.query(func.count(Contact.id)).filter(Contact.organization_id == organization_id).scalar()

    if contact_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete organization. It has {contact_count} associated contacts. Delete or reassign contacts first.",
        )

    db.delete(organization)
    db.commit()

    logger.info(f"Organization deleted: {organization.name} (ID: {organization_id})")
