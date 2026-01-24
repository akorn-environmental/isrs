"""
Photo Management API Router.
Handles photo uploads, AI analysis, gallery management, and retrieval.
"""
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form, Body
from fastapi.responses import JSONResponse
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
import boto3
from botocore.exceptions import ClientError
import os
from datetime import datetime
import mimetypes
import hashlib
import httpx
from io import BytesIO
from PIL import Image
import json

from app.database import get_db
from app.models import AttendeeProfile, Photo
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
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
THUMBNAIL_SIZE = (400, 300)

ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
]


class UrlUploadRequest(BaseModel):
    urls: List[str]


def generate_sha1(content: bytes) -> str:
    """Generate SHA1 hash for deduplication."""
    return hashlib.sha1(content).hexdigest()


def generate_unique_filename(original_name: str) -> str:
    """Generate a unique filename with timestamp."""
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S_%f")
    # Clean the filename
    import re
    clean_name = re.sub(r'[^a-zA-Z0-9._-]', '_', original_name)
    name_parts = clean_name.rsplit('.', 1)
    if len(name_parts) == 2:
        return f"{name_parts[0]}_{timestamp}.{name_parts[1]}"
    return f"{clean_name}_{timestamp}"


def get_image_dimensions(content: bytes) -> tuple:
    """Get image width and height."""
    try:
        img = Image.open(BytesIO(content))
        return img.size  # (width, height)
    except Exception:
        return (None, None)


def create_thumbnail(content: bytes, mime_type: str) -> bytes:
    """Create a thumbnail from image content."""
    try:
        img = Image.open(BytesIO(content))
        img.thumbnail(THUMBNAIL_SIZE, Image.Resampling.LANCZOS)

        # Convert to RGB if necessary (for PNG with transparency)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        return buffer.getvalue()
    except Exception as e:
        print(f"Thumbnail creation failed: {e}")
        return None


async def analyze_with_claude(content: bytes, mime_type: str) -> dict:
    """Analyze photo with Claude AI for species identification and metadata."""
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        return None

    try:
        import base64
        base64_image = base64.b64encode(content).decode('utf-8')

        prompt = """Analyze this shellfish restoration photo and return ONLY valid JSON with these exact keys:

{
  "species": ["species1", "species2"],
  "description": "brief description (max 40 words)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "habitat_type": "intertidal|subtidal|estuary|marsh|reef|other",
  "restoration_technique": "reef_construction|spat_collection|substrate_placement|transplanting|monitoring|survey|other|none",
  "confidence": 0.0-1.0,
  "detected_copyright": "any visible copyright, watermark, or attribution text",
  "suggested_license": "CC-BY|CC-BY-SA|CC-BY-NC|CC0|All Rights Reserved|Unknown",
  "alt_text": "Detailed accessibility description for screen readers (100-150 chars). MUST describe visual content for general audiences, not just species."
}

Focus on:
1. Shellfish species (oysters, clams, mussels, scallops), restoration activities, and habitat types
2. General visual description for accessibility (people, setting, activities, environment)
Be specific but concise."""

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                'https://api.anthropic.com/v1/messages',
                headers={
                    'x-api-key': api_key,
                    'anthropic-version': '2023-06-01',
                    'content-type': 'application/json'
                },
                json={
                    'model': os.getenv('ANTHROPIC_MODEL', 'claude-sonnet-4-20250514'),
                    'max_tokens': 1024,
                    'messages': [{
                        'role': 'user',
                        'content': [
                            {'type': 'text', 'text': prompt},
                            {
                                'type': 'image',
                                'source': {
                                    'type': 'base64',
                                    'media_type': mime_type,
                                    'data': base64_image
                                }
                            }
                        ]
                    }]
                }
            )

            if response.status_code != 200:
                print(f"Claude API error: {response.status_code} {response.text}")
                return None

            data = response.json()
            content_block = next((c for c in data.get('content', []) if c.get('type') == 'text'), None)

            if not content_block:
                return None

            # Parse JSON from response
            import re
            json_match = re.search(r'\{[\s\S]*\}', content_block['text'])
            if json_match:
                analysis = json.loads(json_match.group())
                analysis['analyzed_at'] = datetime.utcnow().isoformat()
                return analysis

            return None

    except Exception as e:
        print(f"Claude analysis error: {e}")
        return None


async def upload_photo_to_s3(
    content: bytes,
    original_filename: str,
    mime_type: str,
    user_id: str,
    db: Session,
    metadata: dict = None
) -> Photo:
    """Upload a photo to S3 and create database record."""

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB")

    # Generate SHA1 for deduplication
    sha1_hash = generate_sha1(content)

    # Check for duplicate
    existing = db.query(Photo).filter(Photo.sha1_hash == sha1_hash).first()
    if existing:
        return existing

    # Generate unique filename
    filename = generate_unique_filename(original_filename)
    s3_key = f"isrs/photos/{filename}"

    # Get image dimensions
    width, height = get_image_dimensions(content)

    # Upload to S3
    try:
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=s3_key,
            Body=content,
            ContentType=mime_type,
            Metadata={
                'uploaded_by': str(user_id),
                'original_filename': original_filename,
            }
        )
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to S3: {str(e)}")

    s3_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION', 'us-east-1')}.amazonaws.com/{s3_key}"

    # Create and upload thumbnail
    thumbnail_url = None
    thumbnail_s3_key = None
    thumbnail_content = create_thumbnail(content, mime_type)
    if thumbnail_content:
        thumbnail_s3_key = f"isrs/photos/thumbnails/thumb_{filename.rsplit('.', 1)[0]}.jpg"
        try:
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=thumbnail_s3_key,
                Body=thumbnail_content,
                ContentType='image/jpeg'
            )
            thumbnail_url = f"https://{BUCKET_NAME}.s3.{os.getenv('AWS_REGION', 'us-east-1')}.amazonaws.com/{thumbnail_s3_key}"
        except ClientError as e:
            print(f"Thumbnail upload failed: {e}")

    # AI Analysis (async, don't block on failure)
    ai_analysis = None
    try:
        ai_analysis = await analyze_with_claude(content, mime_type)
    except Exception as e:
        print(f"AI analysis failed: {e}")

    # Create database record
    photo = Photo(
        filename=filename,
        original_filename=original_filename,
        s3_key=s3_key,
        s3_url=s3_url,
        thumbnail_s3_key=thumbnail_s3_key,
        thumbnail_url=thumbnail_url,
        mime_type=mime_type,
        file_size=len(content),
        width=width,
        height=height,
        sha1_hash=sha1_hash,
        uploaded_by=user_id,
        ai_analysis=ai_analysis,
        ai_processed=ai_analysis is not None,
        ai_processed_at=datetime.utcnow() if ai_analysis else None,
        species_identified=ai_analysis.get('species') if ai_analysis else None,
        habitat_type=ai_analysis.get('habitat_type') if ai_analysis else None,
        restoration_technique=ai_analysis.get('restoration_technique') if ai_analysis else None,
        alt_text=ai_analysis.get('alt_text') if ai_analysis else None,
        caption=metadata.get('caption') if metadata else None,
        description=metadata.get('description') if metadata else None,
        is_public=metadata.get('is_public', False) if metadata else False,
        tags=metadata.get('tags') if metadata else None,
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return photo


@router.post("/upload")
async def upload_photo(
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_public: bool = Form(False),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """Upload a single photo file."""
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")

        # Read file content
        content = await file.read()

        # Validate MIME type
        mime_type = file.content_type or mimetypes.guess_type(file.filename)[0]
        if mime_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"File type {mime_type} not allowed. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
            )

        # Parse tags
        tags_list = [t.strip() for t in tags.split(',')] if tags else None

        metadata = {
            'caption': caption,
            'description': description,
            'is_public': is_public,
            'tags': tags_list,
        }

        photo = await upload_photo_to_s3(
            content=content,
            original_filename=file.filename,
            mime_type=mime_type,
            user_id=current_user.id,
            db=db,
            metadata=metadata
        )

        return {
            "success": True,
            "data": photo.to_dict(),
            "message": "Photo uploaded successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/upload-url")
async def upload_from_urls(
    request: UrlUploadRequest,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """Upload photos from URLs."""
    urls = request.urls

    if not urls or len(urls) == 0:
        raise HTTPException(status_code=400, detail="No URLs provided")

    if len(urls) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 URLs allowed per request")

    results = []

    async with httpx.AsyncClient(timeout=30.0) as client:
        for url in urls:
            try:
                # Validate URL
                from urllib.parse import urlparse
                parsed = urlparse(url)
                if parsed.scheme not in ('http', 'https'):
                    results.append({"success": False, "url": url, "error": "Invalid URL protocol"})
                    continue

                # Download image
                response = await client.get(url, headers={'User-Agent': 'ISRS-PhotoUploader/1.0'})

                if response.status_code != 200:
                    results.append({"success": False, "url": url, "error": f"Failed to download: {response.status_code}"})
                    continue

                content = response.content

                # Check content type
                content_type = response.headers.get('content-type', '')
                mime_type = None
                for allowed in ALLOWED_MIME_TYPES:
                    if allowed.split('/')[1] in content_type:
                        mime_type = allowed
                        break

                if not mime_type:
                    results.append({"success": False, "url": url, "error": f"Invalid content type: {content_type}"})
                    continue

                # Check file size
                if len(content) > MAX_FILE_SIZE:
                    results.append({"success": False, "url": url, "error": "File too large (max 25MB)"})
                    continue

                # Extract filename from URL
                original_filename = parsed.path.split('/')[-1] or 'image'
                ext = mime_type.split('/')[1].replace('jpeg', 'jpg')
                if not original_filename.lower().endswith(f'.{ext}'):
                    original_filename = f"{original_filename}.{ext}"

                # Upload
                photo = await upload_photo_to_s3(
                    content=content,
                    original_filename=original_filename,
                    mime_type=mime_type,
                    user_id=current_user.id,
                    db=db
                )

                results.append({"success": True, "photo": photo.to_dict()})

            except Exception as e:
                print(f"Error processing URL {url}: {e}")
                results.append({"success": False, "url": url, "error": str(e)})

    success_count = sum(1 for r in results if r.get('success'))
    photos = [r.get('photo') for r in results if r.get('success')]

    return {
        "success": success_count > 0,
        "data": photos,
        "results": results,
        "message": f"Successfully uploaded {success_count} of {len(urls)} photo(s)"
    }


@router.get("")
@router.get("/")
async def get_all_photos(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """Get all photos (admin view)."""
    query = db.query(Photo).filter(Photo.status == 'active')

    total = query.count()
    photos = query.order_by(desc(Photo.uploaded_at)).offset(offset).limit(limit).all()

    return {
        "success": True,
        "data": [p.to_dict() for p in photos],
        "total": total,
        "count": len(photos)
    }


@router.get("/gallery")
async def get_gallery_photos(
    limit: int = 50,
    offset: int = 0,
    featured: bool = False,
    species: Optional[str] = None,
    tags: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Get public photos for gallery (no auth required)."""
    query = db.query(Photo).filter(
        Photo.is_public == True,
        Photo.status == 'active'
    )

    if featured:
        query = query.filter(Photo.is_featured == True)

    if species:
        query = query.filter(Photo.species_identified.contains([species]))

    if tags:
        tags_list = [t.strip() for t in tags.split(',')]
        query = query.filter(Photo.tags.overlap(tags_list))

    total = query.count()
    photos = query.order_by(desc(Photo.uploaded_at)).offset(offset).limit(limit).all()

    return {
        "success": True,
        "data": [p.to_dict() for p in photos],
        "total": total,
        "count": len(photos)
    }


@router.get("/public")
async def get_public_photos(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    """Alias for gallery endpoint."""
    return await get_gallery_photos(limit=limit, offset=offset, db=db)


@router.get("/my-photos")
async def get_my_photos(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """Get photos uploaded by current user."""
    query = db.query(Photo).filter(
        Photo.uploaded_by == current_user.id,
        Photo.status == 'active'
    )

    total = query.count()
    photos = query.order_by(desc(Photo.uploaded_at)).offset(offset).limit(limit).all()

    return {
        "success": True,
        "data": [p.to_dict() for p in photos],
        "total": total,
        "count": len(photos)
    }


@router.get("/{photo_id}")
async def get_photo(
    photo_id: int,
    db: Session = Depends(get_db),
):
    """Get a specific photo by ID."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    return {
        "success": True,
        "data": photo.to_dict()
    }


@router.put("/{photo_id}")
async def update_photo(
    photo_id: int,
    caption: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    is_public: Optional[bool] = Form(None),
    is_featured: Optional[bool] = Form(None),
    tags: Optional[str] = Form(None),
    alt_text: Optional[str] = Form(None),
    focal_point_x: Optional[float] = Form(None),
    focal_point_y: Optional[float] = Form(None),
    location_name: Optional[str] = Form(None),
    photographer_name: Optional[str] = Form(None),
    license_type: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """Update photo metadata."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Update fields if provided
    if caption is not None:
        photo.caption = caption
    if description is not None:
        photo.description = description
    if is_public is not None:
        photo.is_public = is_public
    if is_featured is not None:
        photo.is_featured = is_featured
    if tags is not None:
        photo.tags = [t.strip() for t in tags.split(',')] if tags else None
    if alt_text is not None:
        photo.alt_text = alt_text
    if focal_point_x is not None:
        if not (0 <= focal_point_x <= 100):
            raise HTTPException(status_code=400, detail="focal_point_x must be between 0 and 100")
        photo.focal_point_x = focal_point_x
    if focal_point_y is not None:
        if not (0 <= focal_point_y <= 100):
            raise HTTPException(status_code=400, detail="focal_point_y must be between 0 and 100")
        photo.focal_point_y = focal_point_y
    if location_name is not None:
        photo.location_name = location_name
    if photographer_name is not None:
        photo.photographer_name = photographer_name
    if license_type is not None:
        photo.license_type = license_type

    db.commit()
    db.refresh(photo)

    return {
        "success": True,
        "data": photo.to_dict(),
        "message": "Photo updated successfully"
    }


@router.delete("/{photo_id}")
async def delete_photo(
    photo_id: int,
    db: Session = Depends(get_db),
    current_user: AttendeeProfile = Depends(get_current_user),
):
    """Delete a photo (soft delete by changing status)."""
    photo = db.query(Photo).filter(Photo.id == photo_id).first()

    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Soft delete - change status
    photo.status = 'deleted'
    db.commit()

    # Optionally delete from S3
    try:
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=photo.s3_key)
        if photo.thumbnail_s3_key:
            s3_client.delete_object(Bucket=BUCKET_NAME, Key=photo.thumbnail_s3_key)
    except ClientError as e:
        print(f"Warning: Failed to delete from S3: {e}")

    return {
        "success": True,
        "message": "Photo deleted successfully"
    }
