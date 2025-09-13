const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Update user profile
router.put('/update-profile', auth, userController.updateProfile);

// Change password
router.put('/change-password', auth, userController.changePassword);

module.exports = router;
