/**
 * Photo Routes
 * API endpoints for photo upload, management, and gallery
 */

const express = require('express');
const router = express.Router();
const photoController = require('../controllers/photoController');

// Upload routes
router.post('/upload',
  photoController.upload.single('photo'),
  photoController.uploadPhoto
);

router.post('/upload-multiple',
  photoController.upload.array('photos', 10),
  photoController.uploadMultiplePhotos
);

// Admin photo management (all photos)
router.get('/', photoController.getAllPhotos);

// User photo management
router.get('/my-photos', photoController.getMyPhotos);

// Public gallery routes
router.get('/public', photoController.getGalleryPhotos);
router.get('/gallery', photoController.getGalleryPhotos);

// Photo CRUD
router.put('/:id', photoController.updatePhoto);
router.patch('/:id', photoController.updatePhoto);
router.delete('/:id', photoController.deletePhoto);

module.exports = router;
