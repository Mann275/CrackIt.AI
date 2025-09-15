const Checklist = require('../models/Checklist');

const checklistController = {
  // Get all checklists for a user
  getUserChecklists: async (userId) => {
    try {
      const checklists = await Checklist.find({ userId });
      return { success: true, data: checklists };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get a specific checklist
  getChecklist: async (checklistId, userId) => {
    try {
      const checklist = await Checklist.findOne({ _id: checklistId, userId });
      if (!checklist) {
        return { success: false, error: 'Checklist not found' };
      }
      return { success: true, data: checklist };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Create a new checklist
  createChecklist: async (userId, checklistData) => {
    try {
      const checklist = new Checklist({
        userId,
        ...checklistData
      });
      
      await checklist.save();
      await checklist.updateProgress();
      
      return { success: true, data: checklist };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Add an item to a checklist
  addChecklistItem: async (checklistId, userId, itemData) => {
    try {
      const checklist = await Checklist.findOne({ _id: checklistId, userId });
      if (!checklist) {
        return { success: false, error: 'Checklist not found' };
      }
      
      checklist.items.push(itemData);
      await checklist.save();
      await checklist.updateProgress();
      
      return { success: true, data: checklist };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update an item's status
  updateItemStatus: async (checklistId, userId, itemId, status) => {
    try {
      const checklist = await Checklist.findOne({ _id: checklistId, userId });
      if (!checklist) {
        return { success: false, error: 'Checklist not found' };
      }
      
      const updatedItem = await checklist.updateItemStatus(itemId, status);
      return { success: true, data: updatedItem };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Update a checklist item
  updateChecklistItem: async (checklistId, userId, itemId, updates) => {
    try {
      const checklist = await Checklist.findOne({ _id: checklistId, userId });
      if (!checklist) {
        return { success: false, error: 'Checklist not found' };
      }
      
      const item = checklist.items.id(itemId);
      if (!item) {
        return { success: false, error: 'Item not found' };
      }
      
      Object.assign(item, updates);
      await checklist.save();
      await checklist.updateProgress();
      
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete a checklist item
  deleteChecklistItem: async (checklistId, userId, itemId) => {
    try {
      const checklist = await Checklist.findOne({ _id: checklistId, userId });
      if (!checklist) {
        return { success: false, error: 'Checklist not found' };
      }
      
      checklist.items.pull(itemId);
      await checklist.save();
      await checklist.updateProgress();
      
      return { success: true, message: 'Item deleted successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Delete an entire checklist
  deleteChecklist: async (checklistId, userId) => {
    try {
      const checklist = await Checklist.findOneAndDelete({ _id: checklistId, userId });
      if (!checklist) {
        return { success: false, error: 'Checklist not found' };
      }
      
      return { success: true, message: 'Checklist deleted successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

module.exports = checklistController;