const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const geminiService = require('../services/geminiService');

// Generate roadmap for user
exports.generateRoadmap = async (req, res) => {
  try {
    // Get user data for AI processing
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Send data to Gemini AI service for roadmap generation
    const data = await geminiService.generateRoadmap(user);
    
    // Check if roadmap already exists for user
    let roadmap = await Roadmap.findOne({ userId: req.user.id });
    
    if (roadmap) {
      // Update existing roadmap with AI-generated data
      roadmap.checklist = data.roadmap.checklist;
      roadmap.readinessPercentage = data.roadmap.readinessPercentage;
      roadmap.focusAreas = data.roadmap.focusAreas;
      roadmap.weakAreas = data.roadmap.weakAreas;
      roadmap.weeklyPlan = data.roadmap.weeklyPlan;
      roadmap.updatedAt = Date.now();
    } else {
      // Create new roadmap with AI-generated data
      roadmap = new Roadmap({
        userId: req.user.id,
        checklist: data.roadmap.checklist,
        readinessPercentage: data.roadmap.readinessPercentage,
        focusAreas: data.roadmap.focusAreas,
        weakAreas: data.roadmap.weakAreas,
        weeklyPlan: data.roadmap.weeklyPlan
      });
    }
    
    await roadmap.save();
    
    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Generate roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during roadmap generation'
    });
  }
};

// Get user roadmap
exports.getUserRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user.id });
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found for this user'
      });
    }
    
    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Get user roadmap error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching roadmap'
    });
  }
};

// Update checklist item status
exports.updateChecklistItem = async (req, res) => {
  try {
    const { completed } = req.body;
    const itemId = req.params.itemId;
    
    const roadmap = await Roadmap.findOne({ userId: req.user.id });
    
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found for this user'
      });
    }
    
    // Find and update the checklist item
    const itemIndex = roadmap.checklist.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Checklist item not found'
      });
    }
    
    roadmap.checklist[itemIndex].completed = completed;
    
    // Update progress
    const completedItems = roadmap.checklist.filter(item => item.completed).length;
    roadmap.progress = (completedItems / roadmap.checklist.length) * 100;
    
    await roadmap.save();
    
    res.json({
      success: true,
      roadmap
    });
  } catch (error) {
    console.error('Update checklist item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during checklist update'
    });
  }
};
