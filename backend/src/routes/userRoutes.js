const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
router.get('/permissions', userController.getPermissions);

module.exports = router;
