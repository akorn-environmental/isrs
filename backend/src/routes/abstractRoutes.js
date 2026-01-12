const express = require('express');
const router = express.Router();
const abstractController = require('../controllers/abstractController');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Abstract routes
router.get('/', abstractController.getAbstracts);
router.get('/stats', abstractController.getReviewStats);
router.get('/:id', abstractController.getAbstractById);
router.post('/:id/review', abstractController.submitReview);

module.exports = router;
