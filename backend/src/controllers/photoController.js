/**
 * Photo Controller
 * Handles photo upload requests with multipart/form-data
 */

const multer = require('multer');
const photoService = require('../services/photoService');

// Configure multer for memory storage (we'll process the buffer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 10 // Max 10 files per request
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, GIF, WebP) are allowed'));
    }
  }
});

/**
 * Upload single photo
 * POST /api/photos/upload
 */
async function uploadPhoto(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Get attendee ID from session
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify session and get user
    const { pool } = require('../config/database');
    const sessionResult = await pool.query(
      'SELECT attendee_id FROM user_sessions WHERE session_token = $1 AND session_expires_at > NOW()',
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const attendeeId = sessionResult.rows[0].attendee_id;

    // Parse metadata from request body
    const metadata = {};
    if (req.body.metadata) {
      try {
        Object.assign(metadata, JSON.parse(req.body.metadata));
      } catch (e) {
        // If metadata isn't JSON, try to use individual fields
        Object.assign(metadata, req.body);
      }
    } else {
      Object.assign(metadata, req.body);
    }

    // Upload and process photo
    const photo = await photoService.uploadPhoto(
      req.file.buffer,
      {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype
      },
      metadata,
      attendeeId
    );

    res.json({
      success: true,
      data: photo,
      message: photo.isDuplicate ? 'This photo was already uploaded' : 'Photo uploaded successfully'
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Photo upload failed'
    });
  }
}

/**
 * Upload multiple photos
 * POST /api/photos/upload-multiple
 */
async function uploadMultiplePhotos(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Get attendee ID from session
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { pool } = require('../config/database');
    const sessionResult = await pool.query(
      'SELECT attendee_id FROM user_sessions WHERE session_token = $1 AND session_expires_at > NOW()',
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const attendeeId = sessionResult.rows[0].attendee_id;

    // Parse shared metadata
    let sharedMetadata = {};
    if (req.body.metadata) {
      try {
        sharedMetadata = JSON.parse(req.body.metadata);
      } catch (e) {
        sharedMetadata = req.body;
      }
    }

    // Process each file
    const results = [];
    for (const file of req.files) {
      try {
        const photo = await photoService.uploadPhoto(
          file.buffer,
          {
            originalname: file.originalname,
            mimetype: file.mimetype
          },
          sharedMetadata,
          attendeeId
        );
        results.push({ success: true, photo });
      } catch (error) {
        results.push({ success: false, filename: file.originalname, error: error.message });
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Processed ${results.length} files`
    });

  } catch (error) {
    console.error('Multiple photo upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Photo upload failed'
    });
  }
}

/**
 * Get all photos (admin view)
 * GET /api/photos
 */
async function getAllPhotos(req, res) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { pool } = require('../config/database');
    const sessionResult = await pool.query(
      'SELECT attendee_id FROM user_sessions WHERE session_token = $1 AND session_expires_at > NOW()',
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const options = {
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0
    };

    const photos = await photoService.getAllPhotos(options);

    res.json({
      success: true,
      data: photos,
      count: photos.length
    });

  } catch (error) {
    console.error('Get all photos error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch photos'
    });
  }
}

/**
 * Get user's photos
 * GET /api/photos/my-photos
 */
async function getMyPhotos(req, res) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { pool } = require('../config/database');
    const sessionResult = await pool.query(
      'SELECT attendee_id FROM user_sessions WHERE session_token = $1 AND session_expires_at > NOW()',
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const attendeeId = sessionResult.rows[0].attendee_id;

    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      isPublic: req.query.isPublic === 'true' ? true : req.query.isPublic === 'false' ? false : null
    };

    const photos = await photoService.getUserPhotos(attendeeId, options);

    res.json({
      success: true,
      data: photos,
      count: photos.length
    });

  } catch (error) {
    console.error('Get user photos error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch photos'
    });
  }
}

/**
 * Get public photos (gallery)
 * GET /api/photos/gallery
 */
async function getGalleryPhotos(req, res) {
  try {
    const options = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      featured: req.query.featured === 'true',
      species: req.query.species || null,
      tags: req.query.tags ? req.query.tags.split(',') : null
    };

    const photos = await photoService.getPublicPhotos(options);

    res.json({
      success: true,
      data: photos,
      count: photos.length
    });

  } catch (error) {
    console.error('Get gallery photos error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch gallery photos'
    });
  }
}

/**
 * Update photo metadata
 * PUT /api/photos/:id
 */
async function updatePhoto(req, res) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { pool } = require('../config/database');
    const sessionResult = await pool.query(
      'SELECT attendee_id FROM user_sessions WHERE session_token = $1 AND session_expires_at > NOW()',
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const attendeeId = sessionResult.rows[0].attendee_id;
    const photoId = req.params.id;

    const updatedPhoto = await photoService.updatePhotoMetadata(photoId, attendeeId, req.body);

    res.json({
      success: true,
      data: updatedPhoto,
      message: 'Photo updated successfully'
    });

  } catch (error) {
    console.error('Update photo error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update photo'
    });
  }
}

/**
 * Delete photo
 * DELETE /api/photos/:id
 */
async function deletePhoto(req, res) {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');
    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { pool } = require('../config/database');
    const sessionResult = await pool.query(
      'SELECT attendee_id FROM user_sessions WHERE session_token = $1 AND session_expires_at > NOW()',
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const attendeeId = sessionResult.rows[0].attendee_id;
    const photoId = req.params.id;

    await photoService.deletePhoto(photoId, attendeeId);

    res.json({
      success: true,
      message: 'Photo deleted successfully'
    });

  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete photo'
    });
  }
}

module.exports = {
  upload,
  uploadPhoto,
  uploadMultiplePhotos,
  getAllPhotos,
  getMyPhotos,
  getGalleryPhotos,
  updatePhoto,
  deletePhoto
};
