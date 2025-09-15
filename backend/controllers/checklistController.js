const { GoogleGenerativeAI } = require('@google/generative-ai');
const Checklist = require('../models/Checklist');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyAuQSPonqWljt4ck58NVqokpRlYQDTrEHg');

const checklistController = {
  // Generate checklist using Gemini API
  generateChecklist: async (userId, category) => {
    try {
      // Check if checklist already exists
      const existingChecklist = await Checklist.findOne({ userId, category });
      if (existingChecklist) {
        return { success: false, error: 'Checklist already exists for this category' };
      }

      // Prepare prompt for Gemini
      const prompt = `Generate a comprehensive interview preparation checklist for ${category}.
      Provide a JSON array of 10-15 items. Each item should have:
      - topic (string): The main topic name
      - description (string): A brief description of what to study
      - difficulty (string): Must be one of ["Easy", "Medium", "Hard"]
      
      Example format:
      {
        "topics": [
          {
            "topic": "Arrays and Strings",
            "description": "Focus on basic array operations and string manipulation",
            "difficulty": "Easy"
          }
        ]
      }

      Important guidelines:
      - Topics should be specific and actionable
      - Descriptions should be clear and concise
      - Provide a mix of difficulties
      - Topics should be relevant for technical interviews
      
      Response must be valid JSON.`;

      // Generate response from Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the JSON response
      const parsedResponse = JSON.parse(text);

      // Create checklist in database
      const checklist = await Checklist.create({
        userId,
        category,
        items: parsedResponse.topics.map(item => ({
          title: item.topic,
          description: item.description,
          category: item.difficulty,
          priority: item.difficulty,
          status: 'Pending'
        }))
      });

      await checklist.updateProgress();
      return { success: true, data: checklist };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Get checklist by category
  getChecklistByCategory: async (userId, category) => {
    try {
      const checklist = await Checklist.findOne({ userId, category });
      if (!checklist) {
        return { success: false, error: 'Checklist not found' };
      }
      return { success: true, data: checklist };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Reset checklist progress
  resetChecklist: async (userId, checklistId) => {
    try {
      const checklist = await Checklist.findOne({ _id: checklistId, userId });
      if (!checklist) {
        return { success: false, error: 'Checklist not found' };
      }

      checklist.items = checklist.items.map(item => ({
        ...item,
        status: 'Pending'
      }));

      await checklist.save();
      await checklist.updateProgress();
      
      return { success: true, data: checklist };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
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