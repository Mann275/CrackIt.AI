const express = require('express');
const router = express.Router();
const aiRoadmapController = require('../controllers/aiRoadmapController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/roadmap/ai/generate
 * @desc    Generate AI-powered learning roadmap
 * @access  Private
 */
router.post('/generate', protect, aiRoadmapController.generateRoadmap);

/**
 * @route   GET /api/roadmap/ai
 * @desc    Get user's current AI roadmap
 * @access  Private
 */
router.get('/', protect, aiRoadmapController.getRoadmap);

/**
 * @route   PATCH /api/roadmap/ai/progress
 * @desc    Update node progress in AI roadmap
 * @access  Private
 */
router.patch('/progress', protect, aiRoadmapController.updateProgress);

module.exports = router;