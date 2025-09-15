import api from './api';

const checklistService = {
  // Get all checklists for the user
  getUserChecklists: async () => {
    try {
      const response = await api.get('/checklist');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching checklists');
    }
  },

  // Get a specific checklist
  getChecklist: async (checklistId) => {
    try {
      const response = await api.get(`/checklist/${checklistId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error fetching checklist');
    }
  },

  // Create a new checklist
  createChecklist: async (checklistData) => {
    try {
      const response = await api.post('/checklist', checklistData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error creating checklist');
    }
  },

  // Add an item to a checklist
  addChecklistItem: async (checklistId, itemData) => {
    try {
      const response = await api.post(`/checklist/${checklistId}/items`, itemData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error adding item');
    }
  },

  // Update an item's status
  updateItemStatus: async (checklistId, itemId, status) => {
    try {
      const response = await api.patch(
        `/checklist/${checklistId}/items/${itemId}/status`,
        { status }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating item status');
    }
  },

  // Update a checklist item
  updateChecklistItem: async (checklistId, itemId, updates) => {
    try {
      const response = await api.patch(
        `/checklist/${checklistId}/items/${itemId}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error updating item');
    }
  },

  // Delete a checklist item
  deleteChecklistItem: async (checklistId, itemId) => {
    try {
      const response = await api.delete(`/checklist/${checklistId}/items/${itemId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting item');
    }
  },

  // Delete an entire checklist
  deleteChecklist: async (checklistId) => {
    try {
      const response = await api.delete(`/checklist/${checklistId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error deleting checklist');
    }
  }
};

export default checklistService;