/**
 * Asset Zones Routes
 * Manages asset zones and photo assignments
 * Adapted from: akorn asset zones system for ISRS
 *
 * KEY ADAPTATIONS:
 * - Uses UUID photo_id (not INTEGER asset_id)
 * - Uses ISRS session auth (not JWT)
 * - Uses attendee_profiles table (not users)
 * - Uses ISRS database pool and query patterns
 */

const express = require('express');
const router = express.Router();
const { pool, query: dbQuery, getClient } = require('../config/database');

/**
 * Authentication middleware - ISRS session-based auth
 */
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const sessionToken = authHeader.replace('Bearer ', '');

  try {
    const result = await dbQuery(
      `SELECT ap.id, ap.email, ap.first_name, ap.last_name
       FROM user_sessions us
       JOIN attendee_profiles ap ON us.attendee_id = ap.id
       WHERE us.session_token = $1 AND us.session_expires_at > NOW()`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Input validation middleware
 */
function validateZoneInput(req, res, next) {
  const { zone_id, page_path, zone_name, display_mode, max_assets } = req.body;

  // Validate zone_id format
  if (zone_id && !/^[a-zA-Z0-9-_]+$/.test(zone_id)) {
    return res.status(400).json({
      error: 'Invalid zone_id format',
      message: 'zone_id can only contain letters, numbers, dashes, and underscores'
    });
  }

  // Validate page_path
  if (page_path && !page_path.startsWith('/')) {
    return res.status(400).json({
      error: 'Invalid page_path format',
      message: 'page_path must start with /'
    });
  }

  // Validate display_mode
  const validDisplayModes = ['single', 'slideshow', 'grid', 'lightbox'];
  if (display_mode && !validDisplayModes.includes(display_mode)) {
    return res.status(400).json({
      error: 'Invalid display_mode',
      message: `display_mode must be one of: ${validDisplayModes.join(', ')}`
    });
  }

  // Validate max_assets
  if (max_assets !== undefined && max_assets !== null) {
    const maxAssetsNum = parseInt(max_assets);
    if (isNaN(maxAssetsNum) || maxAssetsNum < 1 || maxAssetsNum > 100) {
      return res.status(400).json({
        error: 'Invalid max_assets',
        message: 'max_assets must be a number between 1 and 100'
      });
    }
  }

  // Validate zone_name length
  if (zone_name && zone_name.length > 100) {
    return res.status(400).json({
      error: 'Invalid zone_name',
      message: 'zone_name must be 100 characters or less'
    });
  }

  next();
}

/**
 * PUBLIC: Get all zones for a specific page
 * Used by frontend to display zones
 *
 * GET /api/asset-zones/page/:pagePath
 */
router.get('/page/*', async (req, res) => {
  try {
    const pagePath = '/' + (req.params[0] || '');

    const result = await dbQuery(`
      SELECT
        z.zone_id,
        z.page_path,
        z.zone_name,
        z.display_mode,
        z.max_assets,
        z.configuration,
        z.is_active,
        (
          SELECT json_agg(
            json_build_object(
              'id', p.id,
              'filename', p.filename,
              'file_path', p.file_path,
              'thumbnail_path', p.thumbnail_path,
              'mime_type', p.mime_type,
              'alt_text', p.alt_text,
              'caption', p.caption,
              'focal_point_x', p.focal_point_x,
              'focal_point_y', p.focal_point_y,
              'display_order', aza.display_order,
              'configuration', aza.configuration
            )
            ORDER BY aza.display_order ASC, aza.created_at ASC
          )
          FROM asset_zone_assignments aza
          JOIN photos p ON aza.photo_id = p.id
          WHERE aza.zone_id = z.zone_id
            AND aza.is_active = TRUE
            AND p.is_public = TRUE
            AND p.status = 'active'
        ) as assets
      FROM asset_zones z
      WHERE z.page_path = $1
        AND z.is_active = TRUE
      ORDER BY z.zone_id
    `, [pagePath]);

    res.json({
      pagePath,
      zones: result.rows
    });
  } catch (error) {
    console.error('Error fetching page zones:', error);
    res.status(500).json({ error: 'Failed to fetch page zones' });
  }
});

/**
 * PUBLIC: Get single zone by zone_id with photos
 * Used by frontend AssetZone component
 *
 * GET /api/asset-zones/:zoneId
 */
router.get('/:zoneId', async (req, res) => {
  try {
    const { zoneId } = req.params;

    const result = await dbQuery(`
      SELECT
        z.zone_id,
        z.page_path,
        z.zone_name,
        z.display_mode,
        z.max_assets,
        z.configuration,
        z.is_active,
        (
          SELECT json_agg(
            json_build_object(
              'id', p.id,
              'filename', p.filename,
              'file_path', p.file_path,
              'thumbnail_path', p.thumbnail_path,
              'mime_type', p.mime_type,
              'alt_text', p.alt_text,
              'caption', p.caption,
              'description', p.description,
              'focal_point_x', p.focal_point_x,
              'focal_point_y', p.focal_point_y,
              'display_order', aza.display_order,
              'configuration', aza.configuration
            )
            ORDER BY aza.display_order ASC, aza.created_at ASC
          )
          FROM asset_zone_assignments aza
          JOIN photos p ON aza.photo_id = p.id
          WHERE aza.zone_id = z.zone_id
            AND aza.is_active = TRUE
            AND p.is_public = TRUE
            AND p.status = 'active'
        ) as assets
      FROM asset_zones z
      WHERE z.zone_id = $1
        AND z.is_active = TRUE
    `, [zoneId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Zone not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching zone:', error);
    res.status(500).json({ error: 'Failed to fetch zone' });
  }
});

/**
 * PROTECTED: Get all zones (admin view)
 * Requires authentication
 *
 * GET /api/asset-zones/admin/all
 */
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    const { page_path, display_mode, is_active = 'all' } = req.query;

    const conditions = [];
    const params = [];
    let paramCount = 1;

    if (page_path) {
      conditions.push(`z.page_path = $${paramCount++}`);
      params.push(page_path);
    }

    if (display_mode) {
      conditions.push(`z.display_mode = $${paramCount++}`);
      params.push(display_mode);
    }

    if (is_active !== 'all') {
      conditions.push(`z.is_active = $${paramCount++}`);
      params.push(is_active === 'true');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await dbQuery(`
      SELECT
        z.*,
        ap.first_name || ' ' || ap.last_name as created_by_name,
        (
          SELECT COUNT(*)
          FROM asset_zone_assignments aza
          WHERE aza.zone_id = z.zone_id AND aza.is_active = TRUE
        ) as asset_count
      FROM asset_zones z
      LEFT JOIN attendee_profiles ap ON z.created_by = ap.id
      ${whereClause}
      ORDER BY z.page_path, z.zone_name
    `, params);

    res.json({ zones: result.rows });
  } catch (error) {
    console.error('Error fetching all zones:', error);
    res.status(500).json({ error: 'Failed to fetch zones' });
  }
});

/**
 * PROTECTED: Create or update zone
 * Requires authentication
 *
 * POST /api/asset-zones
 */
router.post('/', requireAuth, validateZoneInput, async (req, res) => {
  const client = await getClient();

  try {
    const {
      zone_id,
      page_path,
      zone_name,
      display_mode = 'single',
      max_assets = 1,
      configuration = {}
    } = req.body;

    // Validate required fields
    if (!zone_id || !page_path || !zone_name) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['zone_id', 'page_path', 'zone_name']
      });
    }

    await client.query('BEGIN');

    // Check if zone already exists
    const existing = await client.query(
      'SELECT zone_id FROM asset_zones WHERE zone_id = $1',
      [zone_id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing zone
      result = await client.query(`
        UPDATE asset_zones
        SET
          page_path = $2,
          zone_name = $3,
          display_mode = $4,
          max_assets = $5,
          configuration = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE zone_id = $1
        RETURNING *
      `, [zone_id, page_path, zone_name, display_mode, max_assets, configuration]);
    } else {
      // Create new zone
      result = await client.query(`
        INSERT INTO asset_zones (
          zone_id, page_path, zone_name, display_mode, max_assets, configuration, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [zone_id, page_path, zone_name, display_mode, max_assets, configuration, req.user.id]);
    }

    await client.query('COMMIT');

    res.status(existing.rows.length > 0 ? 200 : 201).json({
      message: existing.rows.length > 0 ? 'Zone updated successfully' : 'Zone created successfully',
      zone: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating/updating zone:', error);

    // Handle unique constraint violations
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'Zone already exists',
        message: 'A zone with this ID or name already exists'
      });
    }

    res.status(500).json({ error: 'Failed to create/update zone' });
  } finally {
    client.release();
  }
});

/**
 * PROTECTED: Assign photos to zone
 * Requires authentication
 * CRITICAL: Uses photo_id UUID (not asset_id INTEGER)
 *
 * POST /api/asset-zones/:zoneId/photos
 */
router.post('/:zoneId/photos', requireAuth, async (req, res) => {
  const client = await getClient();

  try {
    const { zoneId } = req.params;
    const { photo_ids, replace = false } = req.body; // Changed from asset_ids to photo_ids

    if (!Array.isArray(photo_ids) || photo_ids.length === 0) {
      return res.status(400).json({
        error: 'Invalid photo_ids',
        message: 'photo_ids must be a non-empty array of UUIDs'
      });
    }

    // Validate all photo_ids are valid UUIDs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!photo_ids.every(id => typeof id === 'string' && uuidRegex.test(id))) {
      return res.status(400).json({
        error: 'Invalid photo_ids',
        message: 'All photo_ids must be valid UUIDs'
      });
    }

    await client.query('BEGIN');

    // Verify zone exists
    const zoneCheck = await client.query(
      'SELECT zone_id, max_assets, display_mode FROM asset_zones WHERE zone_id = $1',
      [zoneId]
    );

    if (zoneCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Zone not found' });
    }

    const zone = zoneCheck.rows[0];

    // Check max_assets limit
    if (zone.max_assets && photo_ids.length > zone.max_assets) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Too many photos',
        message: `This zone allows maximum ${zone.max_assets} photo(s)`
      });
    }

    // Verify all photos exist and are active
    const photosCheck = await client.query(
      'SELECT id FROM photos WHERE id = ANY($1::uuid[]) AND status = \'active\'',
      [photo_ids]
    );

    if (photosCheck.rows.length !== photo_ids.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Invalid photos',
        message: 'One or more photo IDs are invalid or inactive'
      });
    }

    // If replace mode, remove existing assignments
    if (replace) {
      await client.query(
        'DELETE FROM asset_zone_assignments WHERE zone_id = $1',
        [zoneId]
      );
    }

    // Insert new assignments
    const assignments = [];
    for (let i = 0; i < photo_ids.length; i++) {
      const result = await client.query(`
        INSERT INTO asset_zone_assignments (zone_id, photo_id, display_order, assigned_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (zone_id, photo_id) DO UPDATE
        SET display_order = $3, updated_at = CURRENT_TIMESTAMP
        RETURNING *
      `, [zoneId, photo_ids[i], i, req.user.id]);

      assignments.push(result.rows[0]);
    }

    await client.query('COMMIT');

    res.json({
      message: 'Photos assigned successfully',
      assignments
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning photos to zone:', error);
    res.status(500).json({ error: 'Failed to assign photos to zone' });
  } finally {
    client.release();
  }
});

/**
 * PROTECTED: Remove photo from zone
 * Requires authentication
 *
 * DELETE /api/asset-zones/:zoneId/photos/:photoId
 */
router.delete('/:zoneId/photos/:photoId', requireAuth, async (req, res) => {
  const client = await getClient();

  try {
    const { zoneId, photoId } = req.params;

    await client.query('BEGIN');

    const result = await client.query(
      'DELETE FROM asset_zone_assignments WHERE zone_id = $1 AND photo_id = $2 RETURNING *',
      [zoneId, photoId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Assignment not found' });
    }

    await client.query('COMMIT');

    res.json({ message: 'Photo removed from zone successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error removing photo from zone:', error);
    res.status(500).json({ error: 'Failed to remove photo from zone' });
  } finally {
    client.release();
  }
});

/**
 * PROTECTED: Update assignment display order
 * Requires authentication
 *
 * PATCH /api/asset-zones/:zoneId/photos/:photoId/order
 */
router.patch('/:zoneId/photos/:photoId/order', requireAuth, async (req, res) => {
  try {
    const { zoneId, photoId } = req.params;
    const { display_order } = req.body;

    if (typeof display_order !== 'number' || display_order < 0) {
      return res.status(400).json({
        error: 'Invalid display_order',
        message: 'display_order must be a non-negative number'
      });
    }

    const result = await dbQuery(`
      UPDATE asset_zone_assignments
      SET display_order = $3, updated_at = CURRENT_TIMESTAMP
      WHERE zone_id = $1 AND photo_id = $2
      RETURNING *
    `, [zoneId, photoId, display_order]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      message: 'Display order updated successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating display order:', error);
    res.status(500).json({ error: 'Failed to update display order' });
  }
});

/**
 * PROTECTED: Delete zone
 * Requires authentication
 * CASCADE will delete all assignments
 *
 * DELETE /api/asset-zones/:zoneId
 */
router.delete('/:zoneId', requireAuth, async (req, res) => {
  const client = await getClient();

  try {
    const { zoneId } = req.params;

    await client.query('BEGIN');

    // Get assignment count for logging
    const countResult = await client.query(
      'SELECT COUNT(*) as count FROM asset_zone_assignments WHERE zone_id = $1',
      [zoneId]
    );

    const assignmentCount = parseInt(countResult.rows[0].count);

    // Delete zone (CASCADE will delete assignments)
    const result = await client.query(
      'DELETE FROM asset_zones WHERE zone_id = $1 RETURNING *',
      [zoneId]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Zone not found' });
    }

    await client.query('COMMIT');

    res.json({
      message: 'Zone deleted successfully',
      assignments_removed: assignmentCount
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting zone:', error);
    res.status(500).json({ error: 'Failed to delete zone' });
  } finally {
    client.release();
  }
});

module.exports = router;
