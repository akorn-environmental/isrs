const express = require('express');
const router = express.Router();
const boardDocumentsController = require('../controllers/boardDocumentsController');
const { requireAuth, requireRole } = require('../middleware/auth');

// All routes require authentication and board member role
router.use(requireAuth);

// Get all documents (board members and admins)
router.get('/',
  requireRole(['board', 'admin']),
  boardDocumentsController.getAllDocuments
);

// Get single document by ID
router.get('/:id',
  requireRole(['board', 'admin']),
  boardDocumentsController.getDocumentById
);

// Get version history for a document
router.get('/:id/versions',
  requireRole(['board', 'admin']),
  boardDocumentsController.getVersionHistory
);

// Upload new document (board members can upload, auto-approve for admins)
router.post('/',
  requireRole(['board', 'admin']),
  boardDocumentsController.uploadDocument
);

// Update document metadata
router.put('/:id',
  requireRole(['board', 'admin']),
  boardDocumentsController.updateDocument
);

// Approve/reject document (admins only)
router.patch('/:id/approval',
  requireRole(['admin']),
  boardDocumentsController.updateApprovalStatus
);

// Download document
router.get('/:id/download',
  requireRole(['board', 'admin']),
  boardDocumentsController.downloadDocument
);

// Delete document (admins only)
router.delete('/:id',
  requireRole(['admin']),
  boardDocumentsController.deleteDocument
);

module.exports = router;
