/**
 * Photo Service
 * Handles photo uploads, AI analysis, thumbnail generation, and storage
 */

const sharp = require('sharp');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { query } = require('../config/database');

// Photo storage configuration
const UPLOAD_DIR = process.env.PHOTO_UPLOAD_DIR || path.join(__dirname, '../../uploads/photos');
const THUMBNAIL_DIR = process.env.PHOTO_THUMBNAIL_DIR || path.join(__dirname, '../../uploads/thumbnails');
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const THUMBNAIL_WIDTH = 400;
const THUMBNAIL_HEIGHT = 300;

// Ensure upload directories exist
async function ensureDirectories() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.mkdir(THUMBNAIL_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating upload directories:', error);
  }
}

ensureDirectories();

/**
 * Generate SHA1 hash for file deduplication
 */
function generateSHA1(buffer) {
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

/**
 * Generate unique filename
 */
function generateUniqueFilename(originalName) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${baseName}_${timestamp}_${random}${ext}`;
}

/**
 * Analyze photo with Claude AI
 * Returns: species identification, scene description, keywords, license detection
 */
async function analyzeWithClaude(buffer, mimeType) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

  if (!ANTHROPIC_API_KEY) {
    console.warn('Claude API key not configured. Skipping AI analysis.');
    return null;
  }

  try {
    const base64 = buffer.toString('base64');

    const prompt = `Analyze this shellfish restoration photo and return ONLY valid JSON with these exact keys:

{
  "species": ["species1", "species2"],
  "description": "brief description (max 40 words)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "habitat_type": "intertidal|subtidal|estuary|marsh|reef|other",
  "restoration_technique": "reef_construction|spat_collection|substrate_placement|transplanting|monitoring|survey|other|none",
  "confidence": 0.0-1.0,
  "detected_copyright": "any visible copyright, watermark, or attribution text",
  "suggested_license": "CC-BY|CC-BY-SA|CC-BY-NC|CC0|All Rights Reserved|Unknown"
}

Focus on shellfish species (oysters, clams, mussels, scallops), restoration activities, and habitat types. Be specific but concise.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const content = data.content.find(c => c.type === 'text');

    if (!content || !content.text) {
      throw new Error('No text content in Claude response');
    }

    // Parse JSON from Claude's response
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return {
        ...analysis,
        raw_response: content.text,
        analyzed_at: new Date().toISOString()
      };
    }

    throw new Error('Could not parse JSON from Claude response');

  } catch (error) {
    console.error('Claude AI analysis error:', error);
    return {
      error: error.message,
      analyzed_at: new Date().toISOString()
    };
  }
}

/**
 * Generate thumbnail from image
 */
async function generateThumbnail(buffer, filename) {
  try {
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(THUMBNAIL_DIR, thumbnailFilename);

    await sharp(buffer)
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(thumbnailPath);

    return {
      filename: thumbnailFilename,
      path: thumbnailPath,
      url: `/uploads/thumbnails/${thumbnailFilename}`
    };
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return null;
  }
}

/**
 * Get image dimensions
 */
async function getImageDimensions(buffer) {
  try {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height
    };
  } catch (error) {
    console.error('Error getting image dimensions:', error);
    return { width: null, height: null };
  }
}

/**
 * Check if photo with same hash already exists
 */
async function checkDuplicate(sha1Hash) {
  const result = await query(
    'SELECT id, filename, file_path FROM photos WHERE sha1_hash = $1 LIMIT 1',
    [sha1Hash]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Upload and process photo
 */
async function uploadPhoto(fileBuffer, fileInfo, metadata, attendeeId) {
  // Validate file size
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
  }

  // Generate SHA1 hash for deduplication
  const sha1Hash = generateSHA1(fileBuffer);

  // Check for duplicate
  const duplicate = await checkDuplicate(sha1Hash);
  if (duplicate) {
    console.log(`Duplicate photo detected: ${duplicate.filename}`);
    // Return existing photo info instead of creating new record
    const existingPhoto = await query(
      'SELECT * FROM photos WHERE id = $1',
      [duplicate.id]
    );
    return { ...existingPhoto.rows[0], isDuplicate: true };
  }

  // Generate unique filename
  const filename = generateUniqueFilename(fileInfo.originalname);
  const filePath = path.join(UPLOAD_DIR, filename);

  // Save full resolution image
  await fs.writeFile(filePath, fileBuffer);

  // Get image dimensions
  const { width, height } = await getImageDimensions(fileBuffer);

  // Generate thumbnail
  const thumbnail = await generateThumbnail(fileBuffer, filename);

  // Analyze with Claude AI (non-blocking if it fails)
  let aiAnalysis = null;
  try {
    aiAnalysis = await analyzeWithClaude(fileBuffer, fileInfo.mimetype);
  } catch (error) {
    console.error('AI analysis failed, continuing without it:', error);
  }

  // Extract species from AI analysis
  const speciesIdentified = aiAnalysis && aiAnalysis.species && Array.isArray(aiAnalysis.species)
    ? aiAnalysis.species
    : null;

  // Determine habitat type and restoration technique from AI
  const habitatType = aiAnalysis?.habitat_type || null;
  const restorationTechnique = aiAnalysis?.restoration_technique || null;

  // Save to database
  const result = await query(
    `INSERT INTO photos (
      attendee_id, filename, original_filename, file_path, thumbnail_path,
      mime_type, file_size_bytes, width, height, sha1_hash,
      caption, description, taken_at, location_name, gps_latitude, gps_longitude,
      country, state_province, project_name, conference_id,
      photographer_name, photographer_email, copyright_holder,
      license_type, license_url, attribution_required,
      ai_analysis, ai_processed, ai_processed_at,
      species_identified, habitat_type, restoration_technique,
      is_public, tags
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26,
      $27, $28, $29,
      $30, $31, $32,
      $33, $34
    ) RETURNING *`,
    [
      attendeeId,
      filename,
      fileInfo.originalname,
      filePath,
      thumbnail?.path || null,
      fileInfo.mimetype,
      fileBuffer.length,
      width,
      height,
      sha1Hash,
      metadata.caption || null,
      metadata.description || null,
      metadata.takenAt || null,
      metadata.locationName || null,
      metadata.gpsLatitude || null,
      metadata.gpsLongitude || null,
      metadata.country || null,
      metadata.stateProvince || null,
      metadata.projectName || null,
      metadata.conferenceId || null,
      metadata.photographerName || null,
      metadata.photographerEmail || null,
      metadata.copyrightHolder || null,
      metadata.licenseType || 'All Rights Reserved',
      metadata.licenseUrl || null,
      metadata.attributionRequired !== false,
      aiAnalysis ? JSON.stringify(aiAnalysis) : null,
      aiAnalysis !== null,
      aiAnalysis ? new Date() : null,
      speciesIdentified,
      habitatType,
      restorationTechnique,
      metadata.isPublic || false,
      metadata.tags || null
    ]
  );

  const photo = result.rows[0];

  // Add public URLs
  return {
    ...photo,
    file_url: `/uploads/photos/${filename}`,
    thumbnail_url: thumbnail?.url || null,
    isDuplicate: false
  };
}

/**
 * Get all photos (admin view)
 */
async function getAllPhotos(options = {}) {
  const { limit = 100, offset = 0 } = options;

  const query_text = `
    SELECT
      p.*,
      CONCAT('/uploads/photos/', p.filename) as url,
      CONCAT('/uploads/thumbnails/thumb_', p.filename) as thumbnail_url,
      ap.first_name, ap.last_name
    FROM photos p
    LEFT JOIN attendee_profiles ap ON p.attendee_id = ap.id
    WHERE p.status = 'active'
    ORDER BY p.uploaded_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await query(query_text, [limit, offset]);
  return result.rows;
}

/**
 * Get photos for a user
 */
async function getUserPhotos(attendeeId, options = {}) {
  const { limit = 50, offset = 0, isPublic = null } = options;

  let query_text = `
    SELECT
      p.*,
      CONCAT('/uploads/photos/', p.filename) as file_url,
      CONCAT('/uploads/thumbnails/thumb_', p.filename) as thumbnail_url,
      (SELECT COUNT(*) FROM photo_likes WHERE photo_id = p.id) as likes_count
    FROM photos p
    WHERE p.attendee_id = $1
  `;

  const params = [attendeeId];

  if (isPublic !== null) {
    query_text += ` AND p.is_public = $${params.length + 1}`;
    params.push(isPublic);
  }

  query_text += ` ORDER BY p.uploaded_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await query(query_text, params);
  return result.rows;
}

/**
 * Get public photos for gallery
 */
async function getPublicPhotos(options = {}) {
  const { limit = 50, offset = 0, featured = false, species = null, tags = null } = options;

  let query_text = `
    SELECT
      p.*,
      CONCAT('/uploads/photos/', p.filename) as url,
      CONCAT('/uploads/thumbnails/thumb_', p.filename) as thumbnail_url,
      ap.first_name, ap.last_name
    FROM photos p
    LEFT JOIN attendee_profiles ap ON p.attendee_id = ap.id
    WHERE p.is_public = true AND p.status = 'active'
  `;

  const params = [];

  if (featured) {
    query_text += ` AND p.is_featured = true`;
  }

  if (species) {
    query_text += ` AND $${params.length + 1} = ANY(p.species_identified)`;
    params.push(species);
  }

  if (tags && Array.isArray(tags) && tags.length > 0) {
    query_text += ` AND p.tags && $${params.length + 1}`;
    params.push(tags);
  }

  query_text += ` ORDER BY p.uploaded_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await query(query_text, params);
  return result.rows;
}

/**
 * Update photo metadata
 */
async function updatePhotoMetadata(photoId, attendeeId, updates) {
  const allowedFields = [
    'caption', 'description', 'location_name', 'project_name',
    'license_type', 'license_url', 'photographer_name',
    'copyright_holder', 'is_public', 'tags'
  ];

  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      updateFields.push(`${field} = $${paramIndex}`);
      values.push(updates[field]);
      paramIndex++;
    }
  }

  if (updateFields.length === 0) {
    throw new Error('No valid fields to update');
  }

  updateFields.push(`updated_at = NOW()`);

  values.push(photoId, attendeeId);

  const result = await query(
    `UPDATE photos SET ${updateFields.join(', ')}
     WHERE id = $${paramIndex} AND attendee_id = $${paramIndex + 1}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error('Photo not found or unauthorized');
  }

  return result.rows[0];
}

/**
 * Delete photo
 */
async function deletePhoto(photoId, attendeeId) {
  // Get photo info first
  const photoResult = await query(
    'SELECT * FROM photos WHERE id = $1 AND attendee_id = $2',
    [photoId, attendeeId]
  );

  if (photoResult.rows.length === 0) {
    throw new Error('Photo not found or unauthorized');
  }

  const photo = photoResult.rows[0];

  // Delete files
  try {
    await fs.unlink(photo.file_path);
    if (photo.thumbnail_path) {
      await fs.unlink(photo.thumbnail_path);
    }
  } catch (error) {
    console.error('Error deleting photo files:', error);
  }

  // Delete from database
  await query('DELETE FROM photos WHERE id = $1', [photoId]);

  return { success: true, message: 'Photo deleted successfully' };
}

module.exports = {
  uploadPhoto,
  getAllPhotos,
  getUserPhotos,
  getPublicPhotos,
  updatePhotoMetadata,
  deletePhoto,
  analyzeWithClaude
};
