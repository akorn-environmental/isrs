const { pool } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Helper for development-only logging
const devLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

// Mask email for safe logging
const maskEmail = (email) => {
  if (!email) return '[no email]';
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/board-documents');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, PowerPoint, and text files are allowed.'));
    }
  }
}).single('document');

/**
 * Get all board documents (with filtering)
 */
async function getAllDocuments(req, res) {
  try {
    const {
      category,
      status,
      fiscal_year,
      latest_only = 'true',
      limit = 100,
      offset = 0
    } = req.query;

    let query = `
      SELECT
        d.*,
        u1.email as uploaded_by_email,
        u1.first_name as uploaded_by_first_name,
        u1.last_name as uploaded_by_last_name,
        u2.email as approved_by_email,
        u2.first_name as approved_by_first_name,
        u2.last_name as approved_by_last_name
      FROM board_documents d
      LEFT JOIN admin_users u1 ON d.uploaded_by = u1.id
      LEFT JOIN admin_users u2 ON d.approved_by = u2.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND d.category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    if (status) {
      query += ` AND d.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (fiscal_year) {
      query += ` AND d.fiscal_year = $${paramCount}`;
      params.push(fiscal_year);
      paramCount++;
    }

    if (latest_only === 'true') {
      query += ` AND d.is_latest_version = TRUE`;
    }

    query += ` ORDER BY d.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM board_documents WHERE 1=1 ${
      category ? ` AND category = '${category}'` : ''
    }${status ? ` AND status = '${status}'` : ''}${
      fiscal_year ? ` AND fiscal_year = '${fiscal_year}'` : ''
    }${latest_only === 'true' ? ` AND is_latest_version = TRUE` : ''}`;

    const countResult = await pool.query(countQuery);

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching board documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents'
    });
  }
}

/**
 * Get a single document by ID
 */
async function getDocumentById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        d.*,
        u1.email as uploaded_by_email,
        u1.first_name as uploaded_by_first_name,
        u1.last_name as uploaded_by_last_name,
        u2.email as approved_by_email,
        u2.first_name as approved_by_first_name,
        u2.last_name as approved_by_last_name
      FROM board_documents d
      LEFT JOIN admin_users u1 ON d.uploaded_by = u1.id
      LEFT JOIN admin_users u2 ON d.approved_by = u2.id
      WHERE d.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Log access
    await logDocumentAccess(id, req.user?.id, req.user?.email, 'view', req);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document'
    });
  }
}

/**
 * Upload a new document
 */
async function uploadDocument(req, res) {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    try {
      const {
        title,
        description,
        category,
        document_type,
        status = 'draft',
        meeting_date,
        document_date,
        fiscal_year,
        tags,
        notes,
        visibility = 'board',
        is_confidential = false
      } = req.body;

      // Validation
      if (!title || !category) {
        // Delete uploaded file if validation fails
        await fs.unlink(req.file.path);
        return res.status(400).json({
          success: false,
          error: 'Title and category are required'
        });
      }

      // Auto-approve if user is admin
      const approvalStatus = req.user?.role === 'admin' ? 'approved' : 'pending';
      const approvedBy = req.user?.role === 'admin' ? req.user.id : null;
      const approvedAt = req.user?.role === 'admin' ? new Date() : null;

      // Insert document record
      const result = await pool.query(`
        INSERT INTO board_documents (
          title,
          description,
          category,
          document_type,
          file_name,
          file_path,
          file_size,
          file_type,
          status,
          approval_status,
          approved_by,
          approved_at,
          meeting_date,
          document_date,
          fiscal_year,
          tags,
          notes,
          visibility,
          is_confidential,
          uploaded_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        RETURNING *
      `, [
        title,
        description || null,
        category,
        document_type || null,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
        status,
        approvalStatus,
        approvedBy,
        approvedAt,
        meeting_date || null,
        document_date || null,
        fiscal_year || null,
        tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : null,
        notes || null,
        visibility,
        is_confidential === 'true' || is_confidential === true,
        req.user.id
      ]);

      // Log upload
      await logDocumentAccess(result.rows[0].id, req.user.id, req.user.email, 'upload', req);

      devLog(`✅ Document uploaded: ${title} by ${maskEmail(req.user.email)}`);

      res.json({
        success: true,
        data: result.rows[0],
        message: approvalStatus === 'approved'
          ? 'Document uploaded and published'
          : 'Document uploaded, pending approval'
      });

    } catch (error) {
      console.error('Error uploading document:', error);
      // Try to delete uploaded file on error
      try {
        if (req.file) await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      res.status(500).json({
        success: false,
        error: 'Failed to upload document'
      });
    }
  });
}

/**
 * Update document metadata
 */
async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      category,
      document_type,
      status,
      meeting_date,
      document_date,
      fiscal_year,
      tags,
      notes,
      visibility,
      is_confidential
    } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      params.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (category !== undefined) {
      updates.push(`category = $${paramCount}`);
      params.push(category);
      paramCount++;
    }

    if (document_type !== undefined) {
      updates.push(`document_type = $${paramCount}`);
      params.push(document_type);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (meeting_date !== undefined) {
      updates.push(`meeting_date = $${paramCount}`);
      params.push(meeting_date);
      paramCount++;
    }

    if (document_date !== undefined) {
      updates.push(`document_date = $${paramCount}`);
      params.push(document_date);
      paramCount++;
    }

    if (fiscal_year !== undefined) {
      updates.push(`fiscal_year = $${paramCount}`);
      params.push(fiscal_year);
      paramCount++;
    }

    if (tags !== undefined) {
      updates.push(`tags = $${paramCount}`);
      params.push(tags);
      paramCount++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }

    if (visibility !== undefined) {
      updates.push(`visibility = $${paramCount}`);
      params.push(visibility);
      paramCount++;
    }

    if (is_confidential !== undefined) {
      updates.push(`is_confidential = $${paramCount}`);
      params.push(is_confidential);
      paramCount++;
    }

    updates.push(`updated_by = $${paramCount}`);
    params.push(req.user.id);
    paramCount++;

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    params.push(id);
    const result = await pool.query(`
      UPDATE board_documents
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    // Log edit
    await logDocumentAccess(id, req.user.id, req.user.email, 'edit', req);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document'
    });
  }
}

/**
 * Approve or reject a document
 */
async function updateApprovalStatus(req, res) {
  try {
    const { id } = req.params;
    const { approval_status } = req.body;

    if (!['approved', 'rejected'].includes(approval_status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid approval status'
      });
    }

    const result = await pool.query(`
      UPDATE board_documents
      SET
        approval_status = $1,
        approved_by = $2,
        approved_at = CURRENT_TIMESTAMP,
        updated_by = $2
      WHERE id = $3
      RETURNING *
    `, [approval_status, req.user.id, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: `Document ${approval_status}`
    });

  } catch (error) {
    console.error('Error updating approval status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update approval status'
    });
  }
}

/**
 * Download a document
 */
async function downloadDocument(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT file_path, file_name FROM board_documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const { file_path, file_name } = result.rows[0];

    // Check if file exists
    try {
      await fs.access(file_path);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }

    // Log download
    await logDocumentAccess(id, req.user?.id, req.user?.email, 'download', req);

    // Send file
    res.download(file_path, file_name);

  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download document'
    });
  }
}

/**
 * Delete a document
 */
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    // Get file path before deleting
    const result = await pool.query(
      'SELECT file_path FROM board_documents WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Document not found'
      });
    }

    const { file_path } = result.rows[0];

    // Log deletion before deleting
    await logDocumentAccess(id, req.user.id, req.user.email, 'delete', req);

    // Delete from database
    await pool.query('DELETE FROM board_documents WHERE id = $1', [id]);

    // Delete file from disk
    try {
      await fs.unlink(file_path);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      // Continue even if file deletion fails
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document'
    });
  }
}

/**
 * Get document version history
 */
async function getVersionHistory(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT
        d.*,
        u.email as uploaded_by_email,
        u.first_name as uploaded_by_first_name,
        u.last_name as uploaded_by_last_name
      FROM board_documents d
      LEFT JOIN admin_users u ON d.uploaded_by = u.id
      WHERE d.id = $1 OR d.parent_document_id = $1
      ORDER BY d.version_number DESC, d.created_at DESC
    `, [id]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching version history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch version history'
    });
  }
}

/**
 * Helper: Log document access
 */
async function logDocumentAccess(documentId, userId, userEmail, action, req) {
  try {
    await pool.query(`
      INSERT INTO board_document_access_log (
        document_id,
        user_id,
        user_email,
        action,
        ip_address,
        user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      documentId,
      userId || null,
      userEmail || null,
      action,
      req.ip || req.connection?.remoteAddress || null,
      req.headers['user-agent'] || null
    ]);
  } catch (error) {
    console.error('Error logging document access:', error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}

module.exports = {
  getAllDocuments,
  getDocumentById,
  uploadDocument,
  updateDocument,
  updateApprovalStatus,
  downloadDocument,
  deleteDocument,
  getVersionHistory
};
