const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// Update user profile
router.put('/update-profile', protect, userController.updateProfile);

// Change password
router.put('/change-password', protect, userController.changePassword);

module.exports = router;
