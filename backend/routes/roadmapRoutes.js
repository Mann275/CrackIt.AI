const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const auth = require('../middlewares/auth');

// Generate roadmap for user
router.post('/generate', auth, roadmapController.generateRoadmap);

// Get user roadmap
router.get('/user', auth, roadmapController.getUserRoadmap);

// Update checklist item
router.put('/checklist/:itemId', auth, roadmapController.updateChecklistItem);

module.exports = router;
