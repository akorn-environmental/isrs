# ISRS Asset Management System

## Overview

The ISRS Python backend now includes a complete asset management system for uploading, storing, and managing files (images, videos, documents) using AWS S3 storage.

## Features

- **File Upload:** Upload files with automatic S3 storage
- **File Types:** Images (JPEG, PNG, GIF, WebP), Videos (MP4, MOV), Documents (PDF, DOC, DOCX)
- **Categories:** image, video, document, logo, headshot, other
- **Metadata:** Tags, descriptions, and categorization
- **Search & Filter:** Find assets by category, filename, tags, or description
- **File Validation:** MIME type checking and size limits (20MB max)
- **S3 Integration:** Secure cloud storage with boto3

## API Endpoints

### Upload Asset
```http
POST /api/assets/upload
Content-Type: multipart/form-data

Parameters:
- file: File (required) - The file to upload
- category: string (optional) - Asset category (default: "image")
- tags: string (optional) - Comma-separated tags
- description: string (optional) - Asset description

Response:
{
  "success": true,
  "asset": {
    "id": 1,
    "filename": "example.jpg",
    "s3_url": "https://akorn-assets.s3.us-east-1.amazonaws.com/isrs/image/20260114_123456_example.jpg",
    "file_type": "image/jpeg",
    "file_size": 245678,
    "category": "image",
    "tags": "conference,headshot",
    "description": "Attendee headshot",
    "uploaded_at": "2026-01-14T12:34:56.789Z"
  }
}
```

### List Assets
```http
GET /api/assets/
Parameters:
- category: string (optional) - Filter by category
- search: string (optional) - Search filename, tags, or description
- limit: integer (optional, default: 50) - Number of results
- offset: integer (optional, default: 0) - Pagination offset

Response:
{
  "success": true,
  "total": 42,
  "assets": [...]
}
```

### Get Asset
```http
GET /api/assets/{asset_id}

Response:
{
  "success": true,
  "asset": {...}
}
```

### Update Asset Metadata
```http
PUT /api/assets/{asset_id}
Content-Type: multipart/form-data

Parameters:
- category: string (optional)
- tags: string (optional)
- description: string (optional)

Response:
{
  "success": true,
  "asset": {...}
}
```

### Delete Asset
```http
DELETE /api/assets/{asset_id}

Response:
{
  "success": true,
  "message": "Asset filename.jpg deleted successfully"
}
```

## Setup Instructions

### 1. Add Environment Variables to Render

The backend requires AWS S3 credentials to function. Add these to your Render service:

**Option A: Via Render Dashboard**
1. Go to: https://dashboard.render.com/web/srv-d5k0t5d6ubrc739a4e50/env
2. Click "Add Environment Variable"
3. Add each variable:
   - `AWS_ACCESS_KEY_ID` = [Your AWS access key]
   - `AWS_SECRET_ACCESS_KEY` = [Your AWS secret key]
   - `AWS_REGION` = `us-east-1`
   - `AWS_BUCKET_NAME` = `akorn-assets`
4. Click "Save Changes"

**Option B: Using the Script**
1. Edit `ADD-S3-ENV-VARS.sh` and replace placeholders with actual credentials
2. Set your Render API key: `export RENDER_API_KEY='rnd_your_key'`
3. Run: `bash ADD-S3-ENV-VARS.sh`

**Option C: Load from credentials file**
```bash
# Load credentials from _SYSTEM directory
source /Users/akorn/Desktop/ITERM\ PROJECTS/_SYSTEM/.aws-s3-credentials

# Now run the script with credentials in environment
# Edit the script to use $AWS_ACCESS_KEY_ID instead of hardcoded values
bash ADD-S3-ENV-VARS.sh
```

### 2. Verify Deployment

After the environment variables are added, Render will automatically redeploy. Check:

```bash
# Health check
curl https://isrs-python-backend.onrender.com/health

# Test assets endpoint (requires authentication)
curl https://isrs-python-backend.onrender.com/api/assets/
```

### 3. Database Migration

The Asset model requires a database table. The table will be created automatically on first deployment if `init_db()` is enabled, or you can create it manually:

```sql
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    s3_key VARCHAR(512) NOT NULL UNIQUE,
    s3_url VARCHAR(1024) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    category VARCHAR(50) DEFAULT 'other',
    tags VARCHAR(500),
    description TEXT,
    uploaded_by INTEGER REFERENCES attendee_profiles(id) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_assets_category ON assets(category);
CREATE INDEX idx_assets_uploaded_by ON assets(uploaded_by);
CREATE INDEX idx_assets_uploaded_at ON assets(uploaded_at);
CREATE INDEX idx_assets_s3_key ON assets(s3_key);
```

## File Constraints

- **Max File Size:** 20MB (configurable via `MAX_FILE_SIZE` in assets.py)
- **Allowed MIME Types:**
  - Images: `image/jpeg`, `image/jpg`, `image/png`, `image/gif`, `image/webp`
  - Videos: `video/mp4`, `video/quicktime`
  - Documents: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Categories:** image, video, document, logo, headshot, other

## S3 Storage Structure

Files are stored in S3 with the following structure:
```
akorn-assets/
  isrs/
    image/
      20260114_123456_photo.jpg
      20260114_123457_logo.png
    video/
      20260114_123458_presentation.mp4
    document/
      20260114_123459_whitepaper.pdf
    logo/
      20260114_123500_company_logo.svg
    headshot/
      20260114_123501_profile_pic.jpg
    other/
      20260114_123502_misc_file.dat
```

## Security

- All endpoints require authentication via `get_current_user()` dependency
- MIME type validation prevents malicious file uploads
- File size limits prevent storage abuse
- S3 bucket permissions should be configured for private access only
- Presigned URLs can be generated for temporary public access (feature to add)

## Frontend Integration

The frontend needs to implement:
1. **Upload Component** - File picker with drag & drop
2. **Gallery Component** - Display assets in grid/list view
3. **Manager Component** - Edit metadata, delete assets
4. **Asset Picker** - Select assets for use in other features (e.g., conference logos)

See `/Users/akorn/Desktop/ITERM PROJECTS/akorn/frontend/src/pages/AdminAssets.jsx` for a reference implementation.

## Next Steps

1. **Add S3 environment variables** to Render (see Setup Instructions above)
2. **Create frontend UI** components for asset management
3. **Test upload functionality** with various file types
4. **Implement asset picker** for selecting logos, headshots in other parts of the app
5. **Add image processing** (resize, crop, format conversion) if needed
6. **Implement presigned URLs** for temporary public access to private assets

## Troubleshooting

### "AWS_ACCESS_KEY_ID not set" error
- Add AWS environment variables to Render (see Setup Instructions)

### "Failed to upload to S3" error
- Check AWS credentials are correct
- Verify S3 bucket exists and is accessible
- Check bucket permissions allow PutObject operation

### "File type not allowed" error
- Check MIME type is in `ALLOWED_MIME_TYPES` list
- Edit `backend-python/app/routers/assets.py` to add new types if needed

### Assets not appearing in list
- Check authentication token is valid
- Verify database has assets table
- Check uploaded_by user ID matches current user

## Related Files

- **Backend Router:** `backend-python/app/routers/assets.py`
- **Database Model:** `backend-python/app/models/asset.py`
- **Setup Script:** `ADD-S3-ENV-VARS.sh`
- **AWS Credentials:** `../_SYSTEM/.aws-s3-credentials` (not in Git)
- **Reference Implementation:** `../akorn/frontend/src/pages/AdminAssets.jsx`

## Status

- ✅ Backend API complete
- ✅ Database model created
- ✅ Router registered in main.py
- ✅ Code committed and pushed to GitHub
- ⏳ Deployment in progress to Render
- ⏳ S3 environment variables need to be added
- ⏳ Frontend UI components need to be created
- ⏳ Testing required after deployment

---

**Last Updated:** 2026-01-14
**Backend Version:** 2.0.0
**Service:** isrs-python-backend (srv-d5k0t5d6ubrc739a4e50)
