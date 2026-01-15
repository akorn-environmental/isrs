"""
Asset Management API Router.
Handles file uploads, retrieval, and management for images, documents, and other assets.
"""
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
import boto3
from botocore.exceptions import ClientError
import os
from datetime import datetime
import mimetypes
from pathlib import Path

from app.database import get_db
from app.models import AttendeeProfile, Asset
from app.routers.auth import get_current_user
from app.config import settings

router = APIRouter()

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

BUCKET_NAME = os.getenv('AWS_BUCKET_NAME', 'isrs-assets')
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

CATEGORIES = ['image', 'video', 'document', 'logo', 'headshot', 'other']


@router.post("/upload")
async def upload_asset(
    file: UploadFile = File(...),
    category: str = Form("image"),
    tags: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Upload an asset (image, video, document) to S3 and save metadata to database.
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")

        # Check file size
        contents = await file.read()
        file_size = len(contents)

        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # Validate MIME type
        mime_type = file.content_type or mimetypes.guess_type(file.filename)[0]
        if mime_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type {mime_type} not allowed. Allowed types: {', '.join(ALLOWED_MIME_TYPES)}"
            )

        # Validate category
        if category not in CATEGORIES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid category. Allowed: {', '.join(CATEGORIES)}"
            )

        # Generate unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_ext = Path(file.filename).suffix
        s3_key = f"isrs/{category}/{timestamp}_{file.filename}"

        # Upload to S3
        try:
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=s3_key,
                Body=contents,
                ContentType=mime_type,
                Metadata={
                    'uploaded_by': str(current_user.id),
                    'original_filename': file.filename,
                    'category': category,
                }
            )
        except ClientError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to upload to S3: {str(e)}"
            )

        # Generate S3 URL
        s3_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION', 'us-east-1')}.amazonaws.com/{s3_key}"

        # Save metadata to database
        asset = Asset(
            filename=file.filename,
            s3_key=s3_key,
            s3_url=s3_url,
            file_type=mime_type,
            file_size=file_size,
            category=category,
            tags=tags,
            description=description,
            uploaded_by=current_user.id,
        )

        db.add(asset)
        db.commit()
        db.refresh(asset)

        return JSONResponse(
            status_code=201,
            content={
                "success": True,
                "asset": {
                    "id": asset.id,
                    "filename": asset.filename,
                    "s3_url": asset.s3_url,
                    "file_type": asset.file_type,
                    "file_size": asset.file_size,
                    "category": asset.category,
                    "tags": asset.tags,
                    "description": asset.description,
                    "uploaded_at": asset.uploaded_at.isoformat(),
                }
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/")
async def list_assets(
    category: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    List all assets with optional filtering.
    """
    query = db.query(Asset)

    if category:
        query = query.filter(Asset.category == category)

    if search:
        query = query.filter(
            (Asset.filename.ilike(f"%{search}%")) |
            (Asset.tags.ilike(f"%{search}%")) |
            (Asset.description.ilike(f"%{search}%"))
        )

    total = query.count()
    assets = query.order_by(desc(Asset.uploaded_at)).offset(offset).limit(limit).all()

    return {
        "success": True,
        "total": total,
        "assets": [
            {
                "id": asset.id,
                "filename": asset.filename,
                "s3_url": asset.s3_url,
                "file_type": asset.file_type,
                "file_size": asset.file_size,
                "category": asset.category,
                "tags": asset.tags,
                "description": asset.description,
                "uploaded_by": asset.uploaded_by,
                "uploaded_at": asset.uploaded_at.isoformat(),
            }
            for asset in assets
        ]
    }


@router.get("/{asset_id}")
async def get_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Get a specific asset by ID.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    return {
        "success": True,
        "asset": {
            "id": asset.id,
            "filename": asset.filename,
            "s3_url": asset.s3_url,
            "s3_key": asset.s3_key,
            "file_type": asset.file_type,
            "file_size": asset.file_size,
            "category": asset.category,
            "tags": asset.tags,
            "description": asset.description,
            "uploaded_by": asset.uploaded_by,
            "uploaded_at": asset.uploaded_at.isoformat(),
        }
    }


@router.put("/{asset_id}")
async def update_asset(
    asset_id: int,
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Update asset metadata.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Update fields if provided
    if category:
        if category not in CATEGORIES:
            raise HTTPException(status_code=400, detail=f"Invalid category. Allowed: {', '.join(CATEGORIES)}")
        asset.category = category

    if tags is not None:
        asset.tags = tags

    if description is not None:
        asset.description = description

    db.commit()
    db.refresh(asset)

    return {
        "success": True,
        "asset": {
            "id": asset.id,
            "filename": asset.filename,
            "category": asset.category,
            "tags": asset.tags,
            "description": asset.description,
        }
    }


@router.delete("/{asset_id}")
async def delete_asset(
    asset_id: int,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """
    Delete an asset from S3 and database.
    """
    asset = db.query(Asset).filter(Asset.id == asset_id).first()

    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Delete from S3
    try:
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=asset.s3_key)
    except ClientError as e:
        # Log error but continue with database deletion
        print(f"Warning: Failed to delete from S3: {e}")

    # Delete from database
    db.delete(asset)
    db.commit()

    return {
        "success": True,
        "message": f"Asset {asset.filename} deleted successfully"
    }
