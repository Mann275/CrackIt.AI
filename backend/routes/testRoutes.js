const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const testController = require('../controllers/testController');

// Public routes
router.get('/', testController.getAllTests);
router.get('/:id', testController.getTestById);

// Protected routes (require authentication)
router.post('/', protect, testController.createTest);
router.put('/:id', protect, testController.updateTest);
router.delete('/:id', protect, testController.deleteTest);

// Test results routes
router.post('/results', protect, testController.submitTestResult);
router.get('/results/:id', protect, testController.getTestResult);
router.get('/results/:id/analysis', protect, testController.getTestResultAnalysis);

module.exports = router;
