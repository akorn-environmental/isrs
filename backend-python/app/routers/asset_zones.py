"""
Asset Zones API Router.
Handles zone management for page-specific asset locations.
"""
from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.responses import JSONResponse
from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from pydantic import BaseModel

from app.database import get_db
from app.models import AttendeeProfile, Asset, AssetZone, AssetZoneAsset
from app.routers.auth import get_current_user

router = APIRouter()


# Pydantic models for request/response
class ZoneConfig(BaseModel):
    transition: Optional[str] = "fade"
    speed: Optional[int] = 5000
    autoAdvance: Optional[bool] = True
    loop: Optional[bool] = True
    showControls: Optional[bool] = False
    showIndicators: Optional[bool] = False
    aspectRatio: Optional[str] = "auto"
    objectFit: Optional[str] = "cover"
    objectPosition: Optional[str] = "center"


class CreateZoneRequest(BaseModel):
    zone_id: str
    page_path: str
    zone_name: Optional[str] = None
    display_mode: Optional[str] = "single"
    configuration: Optional[dict] = {}


class UpdateZoneRequest(BaseModel):
    zone_name: Optional[str] = None
    display_mode: Optional[str] = None
    configuration: Optional[dict] = None
    is_active: Optional[bool] = None


class AddAssetToZoneRequest(BaseModel):
    asset_id: int
    sort_order: Optional[int] = 0
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    link_url: Optional[str] = None


# ============ PUBLIC ENDPOINTS (no auth required) ============

@router.get("/public/{zone_id}")
async def get_zone_public(
    zone_id: str,
    page_path: Optional[str] = "/",
    db: Session = Depends(get_db),
):
    """
    Get a zone and its assets by zone_id (public endpoint).
    Returns the zone with all active assets for display on the site.
    """
    zone = db.query(AssetZone).options(
        joinedload(AssetZone.assets).joinedload(AssetZoneAsset.asset)
    ).filter(
        AssetZone.zone_id == zone_id,
        AssetZone.page_path == page_path,
        AssetZone.is_active == True
    ).first()

    if not zone:
        # Return empty response instead of 404 for graceful degradation
        return {
            "success": True,
            "zone": None,
            "assets": []
        }

    # Get active assets sorted by order
    active_assets = [
        {
            "id": za.asset.id,
            "url": za.asset.s3_url,
            "filename": za.asset.filename,
            "file_type": za.asset.file_type,
            "alt_text": za.alt_text or za.asset.description or za.asset.filename,
            "caption": za.caption,
            "link_url": za.link_url,
            "sort_order": za.sort_order,
        }
        for za in sorted(zone.assets, key=lambda x: x.sort_order)
        if za.is_active and za.asset
    ]

    return {
        "success": True,
        "zone": {
            "id": zone.id,
            "zone_id": zone.zone_id,
            "page_path": zone.page_path,
            "zone_name": zone.zone_name,
            "display_mode": zone.display_mode,
            "configuration": zone.configuration or {},
        },
        "assets": active_assets
    }


@router.get("/public/page/{page_path:path}")
async def get_zones_for_page_public(
    page_path: str,
    db: Session = Depends(get_db),
):
    """
    Get all active zones for a specific page (public endpoint).
    """
    # Ensure page_path starts with /
    if not page_path.startswith("/"):
        page_path = "/" + page_path

    zones = db.query(AssetZone).options(
        joinedload(AssetZone.assets).joinedload(AssetZoneAsset.asset)
    ).filter(
        AssetZone.page_path == page_path,
        AssetZone.is_active == True
    ).all()

    result = []
    for zone in zones:
        active_assets = [
            {
                "id": za.asset.id,
                "url": za.asset.s3_url,
                "filename": za.asset.filename,
                "alt_text": za.alt_text or za.asset.description,
                "caption": za.caption,
                "link_url": za.link_url,
                "sort_order": za.sort_order,
            }
            for za in sorted(zone.assets, key=lambda x: x.sort_order)
            if za.is_active and za.asset
        ]

        result.append({
            "zone_id": zone.zone_id,
            "zone_name": zone.zone_name,
            "display_mode": zone.display_mode,
            "configuration": zone.configuration or {},
            "assets": active_assets
        })

    return {
        "success": True,
        "page_path": page_path,
        "zones": result
    }


# ============ ADMIN ENDPOINTS (auth required) ============

@router.get("/")
async def list_zones(
    page_path: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    List all asset zones (admin only).
    """
    query = db.query(AssetZone).options(
        joinedload(AssetZone.assets).joinedload(AssetZoneAsset.asset)
    )

    if page_path:
        query = query.filter(AssetZone.page_path == page_path)

    zones = query.order_by(AssetZone.page_path, AssetZone.zone_id).all()

    return {
        "success": True,
        "zones": [
            {
                "id": zone.id,
                "zone_id": zone.zone_id,
                "page_path": zone.page_path,
                "zone_name": zone.zone_name,
                "display_mode": zone.display_mode,
                "configuration": zone.configuration,
                "is_active": zone.is_active,
                "asset_count": len([a for a in zone.assets if a.is_active]),
                "created_at": zone.created_at.isoformat() if zone.created_at else None,
                "updated_at": zone.updated_at.isoformat() if zone.updated_at else None,
            }
            for zone in zones
        ]
    }


@router.post("/")
async def create_zone(
    request: CreateZoneRequest,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Create a new asset zone (admin only).
    """
    # Check if zone already exists
    existing = db.query(AssetZone).filter(
        AssetZone.zone_id == request.zone_id,
        AssetZone.page_path == request.page_path
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Zone '{request.zone_id}' already exists for page '{request.page_path}'"
        )

    zone = AssetZone(
        zone_id=request.zone_id,
        page_path=request.page_path,
        zone_name=request.zone_name or request.zone_id,
        display_mode=request.display_mode,
        configuration=request.configuration,
    )

    db.add(zone)
    db.commit()
    db.refresh(zone)

    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "zone": {
                "id": zone.id,
                "zone_id": zone.zone_id,
                "page_path": zone.page_path,
                "zone_name": zone.zone_name,
                "display_mode": zone.display_mode,
                "configuration": zone.configuration,
            }
        }
    )


@router.get("/{zone_db_id}")
async def get_zone(
    zone_db_id: int,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get a specific zone by database ID (admin only).
    """
    zone = db.query(AssetZone).options(
        joinedload(AssetZone.assets).joinedload(AssetZoneAsset.asset)
    ).filter(AssetZone.id == zone_db_id).first()

    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    assets = [
        {
            "id": za.id,
            "asset_id": za.asset.id,
            "url": za.asset.s3_url,
            "filename": za.asset.filename,
            "file_type": za.asset.file_type,
            "alt_text": za.alt_text,
            "caption": za.caption,
            "link_url": za.link_url,
            "sort_order": za.sort_order,
            "is_active": za.is_active,
        }
        for za in sorted(zone.assets, key=lambda x: x.sort_order)
        if za.asset
    ]

    return {
        "success": True,
        "zone": {
            "id": zone.id,
            "zone_id": zone.zone_id,
            "page_path": zone.page_path,
            "zone_name": zone.zone_name,
            "display_mode": zone.display_mode,
            "configuration": zone.configuration,
            "is_active": zone.is_active,
            "created_at": zone.created_at.isoformat() if zone.created_at else None,
            "updated_at": zone.updated_at.isoformat() if zone.updated_at else None,
        },
        "assets": assets
    }


@router.put("/{zone_db_id}")
async def update_zone(
    zone_db_id: int,
    request: UpdateZoneRequest,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update a zone's settings (admin only).
    """
    zone = db.query(AssetZone).filter(AssetZone.id == zone_db_id).first()

    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    if request.zone_name is not None:
        zone.zone_name = request.zone_name
    if request.display_mode is not None:
        zone.display_mode = request.display_mode
    if request.configuration is not None:
        zone.configuration = request.configuration
    if request.is_active is not None:
        zone.is_active = request.is_active

    db.commit()
    db.refresh(zone)

    return {
        "success": True,
        "zone": {
            "id": zone.id,
            "zone_id": zone.zone_id,
            "zone_name": zone.zone_name,
            "display_mode": zone.display_mode,
            "configuration": zone.configuration,
            "is_active": zone.is_active,
        }
    }


@router.delete("/{zone_db_id}")
async def delete_zone(
    zone_db_id: int,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Delete a zone and all its asset associations (admin only).
    Note: This doesn't delete the actual assets, just the zone.
    """
    zone = db.query(AssetZone).filter(AssetZone.id == zone_db_id).first()

    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    zone_id = zone.zone_id
    db.delete(zone)
    db.commit()

    return {
        "success": True,
        "message": f"Zone '{zone_id}' deleted successfully"
    }


# ============ ZONE ASSET MANAGEMENT ============

@router.post("/{zone_db_id}/assets")
async def add_asset_to_zone(
    zone_db_id: int,
    request: AddAssetToZoneRequest,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Add an asset to a zone (admin only).
    """
    zone = db.query(AssetZone).filter(AssetZone.id == zone_db_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    asset = db.query(Asset).filter(Asset.id == request.asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Check if already in zone
    existing = db.query(AssetZoneAsset).filter(
        AssetZoneAsset.zone_id == zone_db_id,
        AssetZoneAsset.asset_id == request.asset_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Asset already in this zone")

    # Get max sort order
    max_order = db.query(AssetZoneAsset).filter(
        AssetZoneAsset.zone_id == zone_db_id
    ).count()

    zone_asset = AssetZoneAsset(
        zone_id=zone_db_id,
        asset_id=request.asset_id,
        sort_order=request.sort_order if request.sort_order else max_order,
        alt_text=request.alt_text,
        caption=request.caption,
        link_url=request.link_url,
    )

    db.add(zone_asset)
    db.commit()
    db.refresh(zone_asset)

    return JSONResponse(
        status_code=201,
        content={
            "success": True,
            "zone_asset": {
                "id": zone_asset.id,
                "zone_id": zone_db_id,
                "asset_id": request.asset_id,
                "url": asset.s3_url,
                "sort_order": zone_asset.sort_order,
            }
        }
    )


@router.put("/{zone_db_id}/assets/{zone_asset_id}")
async def update_zone_asset(
    zone_db_id: int,
    zone_asset_id: int,
    sort_order: Optional[int] = None,
    alt_text: Optional[str] = None,
    caption: Optional[str] = None,
    link_url: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update an asset within a zone (admin only).
    """
    zone_asset = db.query(AssetZoneAsset).filter(
        AssetZoneAsset.id == zone_asset_id,
        AssetZoneAsset.zone_id == zone_db_id
    ).first()

    if not zone_asset:
        raise HTTPException(status_code=404, detail="Zone asset not found")

    if sort_order is not None:
        zone_asset.sort_order = sort_order
    if alt_text is not None:
        zone_asset.alt_text = alt_text
    if caption is not None:
        zone_asset.caption = caption
    if link_url is not None:
        zone_asset.link_url = link_url
    if is_active is not None:
        zone_asset.is_active = is_active

    db.commit()

    return {"success": True, "message": "Zone asset updated"}


@router.delete("/{zone_db_id}/assets/{zone_asset_id}")
async def remove_asset_from_zone(
    zone_db_id: int,
    zone_asset_id: int,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Remove an asset from a zone (admin only).
    Note: This doesn't delete the actual asset, just removes it from the zone.
    """
    zone_asset = db.query(AssetZoneAsset).filter(
        AssetZoneAsset.id == zone_asset_id,
        AssetZoneAsset.zone_id == zone_db_id
    ).first()

    if not zone_asset:
        raise HTTPException(status_code=404, detail="Zone asset not found")

    db.delete(zone_asset)
    db.commit()

    return {"success": True, "message": "Asset removed from zone"}


@router.put("/{zone_db_id}/reorder")
async def reorder_zone_assets(
    zone_db_id: int,
    asset_ids: List[int] = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Reorder assets within a zone (admin only).
    Pass asset_ids in the desired order.
    """
    zone = db.query(AssetZone).filter(AssetZone.id == zone_db_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")

    for index, asset_id in enumerate(asset_ids):
        zone_asset = db.query(AssetZoneAsset).filter(
            AssetZoneAsset.zone_id == zone_db_id,
            AssetZoneAsset.asset_id == asset_id
        ).first()

        if zone_asset:
            zone_asset.sort_order = index

    db.commit()

    return {"success": True, "message": "Assets reordered"}
