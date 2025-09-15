const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getUserGoals, updateUserGoals } = require('../controllers/goalController');

// @route   GET api/goals
// @desc    Get user's goals
// @access  Private
router.get('/', auth, getUserGoals);

// @route   POST api/goals
// @desc    Create or update user's goals
// @access  Private
router.post('/', auth, updateUserGoals);

module.exports = router;