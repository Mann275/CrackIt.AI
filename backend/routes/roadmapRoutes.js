const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/roadmap/generate
 * @desc    Generate personalized learning roadmap based on survey data
 * @access  Private
 */
router.post('/generate', protect, roadmapController.generateRoadmap);

/**
 * @route   GET /api/roadmap
 * @desc    Get user's current roadmap with progress and recommendations
 * @access  Private
 */
router.get('/', protect, roadmapController.getUserRoadmap);

/**
 * @route   PUT /api/roadmap/progress
 * @desc    Update topic/subtopic progress and get AI recommendations
 * @access  Private
 */
router.put('/progress', protect, roadmapController.updateNodeProgress);

module.exports = router;
