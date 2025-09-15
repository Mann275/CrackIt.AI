const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Checklist = require('../models/Checklist');

// Generate checklist using Gemini API
router.post('/generate', protect, async (req, res) => {
  try {
    const { category } = req.body;
    const result = await checklistController.generateChecklist(req.user.id, category);
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.status(201).json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error generating checklist', error: error.message });
  }
});

// Get checklist by category
router.get('/category/:category', protect, async (req, res) => {
  try {
    const result = await checklistController.getChecklistByCategory(req.user.id, req.params.category);
    
    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }
    
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checklist', error: error.message });
  }
});

// Reset checklist progress
router.post('/:id/reset', protect, async (req, res) => {
  try {
    const result = await checklistController.resetChecklist(req.user.id, req.params.id);
    
    if (!result.success) {
      return res.status(404).json({ message: result.error });
    }
    
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ message: 'Error resetting checklist', error: error.message });
  }
});

// Get user's checklists
router.get('/', protect, async (req, res) => {
  try {
    const checklists = await Checklist.find({ userId: req.user.id });
    res.json(checklists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checklists', error: error.message });
  }
});

// Get a specific checklist
router.get('/:id', protect, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching checklist', error: error.message });
  }
});

// Create a new checklist
router.post('/', protect, async (req, res) => {
  try {
    const { domain, items } = req.body;
    
    const checklist = new Checklist({
      userId: req.user.id,
      domain,
      items: items || []
    });
    
    await checklist.save();
    await checklist.updateProgress();
    
    res.status(201).json(checklist);
  } catch (error) {
    res.status(400).json({ message: 'Error creating checklist', error: error.message });
  }
});

// Add item to checklist
router.post('/:id/items', protect, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    checklist.items.push(req.body);
    await checklist.save();
    await checklist.updateProgress();
    
    res.json(checklist);
  } catch (error) {
    res.status(400).json({ message: 'Error adding item', error: error.message });
  }
});

// Update checklist item status
router.patch('/:id/items/:itemId/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    const updatedItem = await checklist.updateItemStatus(req.params.itemId, status);
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: 'Error updating item status', error: error.message });
  }
});

// Update checklist item
router.patch('/:id/items/:itemId', protect, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    const item = checklist.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    Object.assign(item, req.body);
    await checklist.save();
    await checklist.updateProgress();
    
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: 'Error updating item', error: error.message });
  }
});

// Delete checklist item
router.delete('/:id/items/:itemId', protect, async (req, res) => {
  try {
    const checklist = await Checklist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    checklist.items.pull(req.params.itemId);
    await checklist.save();
    await checklist.updateProgress();
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting item', error: error.message });
  }
});

// Delete entire checklist
router.delete('/:id', protect, async (req, res) => {
  try {
    const checklist = await Checklist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!checklist) {
      return res.status(404).json({ message: 'Checklist not found' });
    }
    
    res.json({ message: 'Checklist deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting checklist', error: error.message });
  }
});

module.exports = router;