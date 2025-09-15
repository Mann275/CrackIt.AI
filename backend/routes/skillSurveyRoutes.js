const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getUserSkillSurvey,
  updateSkillSurvey,
  getSurveyStats
} = require('../controllers/skillSurveyController');

// @route   GET api/survey
// @desc    Get user's skill survey
// @access  Private
router.get('/', auth, getUserSkillSurvey);

// @route   POST api/survey
// @desc    Create or update skill survey
// @access  Private
router.post('/', auth, updateSkillSurvey);

// @route   GET api/survey/stats
// @desc    Get survey statistics
// @access  Private
router.get('/stats', auth, getSurveyStats);

module.exports = router;