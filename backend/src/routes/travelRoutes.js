const express = require('express');
const router = express.Router();
const travelController = require('../controllers/travelController');

// Travel arrangements
router.post('/arrangements', travelController.saveTravelArrangements);
router.get('/arrangements/:registration_id', travelController.getTravelArrangements);

// Travel buddy finder
router.get('/buddies/:registration_id', travelController.findTravelBuddies);

// Roommate finder
router.get('/roommates/:registration_id', travelController.findRoommates);

// Admin routes
router.get('/conference/:conference_id/all', travelController.getConferenceTravelArrangements);

module.exports = router;
